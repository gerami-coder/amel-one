-- Execute against the explicitly selected development project. Always rolls back.
begin;
do $$
declare a uuid:=gen_random_uuid(); b uuid:=gen_random_uuid();
begin
 insert into auth.users(id,email) values(a,'tenant-a-'||a||'@example.test'),(b,'tenant-b-'||b||'@example.test');
 perform set_config('test.a',a::text,true);perform set_config('test.b',b::text,true);
end $$;
set local role authenticated;
select set_config('request.jwt.claim.sub',current_setting('test.a'),true);
do $$
declare org uuid; result jsonb; e uuid; config jsonb; payload jsonb; vid uuid; typ uuid:=gen_random_uuid(); field uuid:=gen_random_uuid(); slug text:='verify-'||replace(gen_random_uuid()::text,'-','');
begin
 org:=public.create_organization('Tenant A verification');
 config:=jsonb_build_object('types',jsonb_build_array(jsonb_build_object('id',typ,'name','Guest','description','','capacity',1,'approval',true)),
 'fields',jsonb_build_array(jsonb_build_object('id',field,'type','select','label','Country','help','','required',true,'options',jsonb_build_array('Ethiopia','Kenya'))),
 'branding',jsonb_build_object('theme','forest','font','sans','heading','','footer',''));
 payload:=jsonb_build_object('basics',jsonb_build_object('name','Verified gathering','slug',slug,'description','An explicitly fake verification event.','location','Test venue','eventType','conference','timezone','UTC','startsAt',now()+interval '30 days','endsAt',now()+interval '31 days','closesAt',now()+interval '29 days'),'config',config);
 result:=public.create_event(payload);e:=(result->>'id')::uuid;
 perform set_config('test.org',org::text,true);
 insert into storage.objects(bucket_id,name) values('amel-event-branding',org||'/'||e||'/'||gen_random_uuid()||'.png');
 if public.public_event(slug) is not null then raise exception 'Unpublished draft leaked';end if;
 begin
  perform public.save_event(e,99,payload);raise exception 'Stale draft accepted';
 exception when sqlstate 'PT409' then null;end;
 vid:=public.publish_event(e,1);
 perform set_config('test.event',e::text,true);perform set_config('test.version',vid::text,true);
 perform set_config('test.type',typ::text,true);perform set_config('test.field',field::text,true);
 perform set_config('test.slug',slug,true);perform set_config('test.payload',payload::text,true);
 if (select count(*) from public.audit_logs where organization_id=org)<3 then raise exception 'Audit missing';end if;
end $$;
set local role anon;
do $$
declare result jsonb; replay jsonb; request uuid:=gen_random_uuid(); field text:=current_setting('test.field'); version uuid:=current_setting('test.version')::uuid; typ uuid:=current_setting('test.type')::uuid; slug text:=current_setting('test.slug');
begin
 if public.public_event(slug) is null then raise exception 'Published event unavailable';end if;
 begin perform count(*) from public.registrations;raise exception 'Anon read allowed';exception when insufficient_privilege then null;end;
 result:=public.submit_registration(slug,version,typ,gen_random_uuid(),'Demo Person','invalid@example.test','{}');
 if result->>'error' is null then raise exception 'Required answer bypass';end if;
 result:=public.submit_registration(slug,version,typ,gen_random_uuid(),'Demo Person','invalid-option@example.test',jsonb_build_object(field,'Unknown'));
 if result->>'error' is null then raise exception 'Option validation bypass';end if;
 result:=public.submit_registration(slug,version,typ,request,'Demo Person','accepted@example.test',jsonb_build_object(field,'Ethiopia','untrusted','discard me'));
 if result->>'status'<>'pending' or result->>'reference' is null then raise exception 'Submission failed: %',result;end if;
 replay:=public.submit_registration(slug,version,typ,request,'Demo Person','accepted@example.test',jsonb_build_object(field,'Ethiopia','untrusted','discard me'));
 if result<>replay then raise exception 'Replay not idempotent';end if;
 replay:=public.submit_registration(slug,version,typ,request,'Changed Person','accepted@example.test',jsonb_build_object(field,'Ethiopia'));
 if replay->>'error' is null then raise exception 'Mismatched replay accepted';end if;
 replay:=public.submit_registration(slug,version,typ,gen_random_uuid(),'Another Person','full@example.test',jsonb_build_object(field,'Kenya'));
 if replay->>'error'<>'This registration type is full.' then raise exception 'Capacity overflow: %',replay;end if;
 perform set_config('test.reference',result->>'reference',true);
end $$;
set local role authenticated;
select set_config('request.jwt.claim.sub',current_setting('test.b'),true);
do $$
declare own uuid;
begin
 own:=public.create_organization('Tenant B verification');
 begin
  insert into storage.objects(bucket_id,name) values('amel-event-branding',current_setting('test.org')||'/'||current_setting('test.event')||'/'||gen_random_uuid()||'.png');
  raise exception 'Cross tenant logo upload';
 exception when insufficient_privilege then null; end;
 begin
  insert into public.organization_members(organization_id,user_id,role_key) values(own,current_setting('test.a')::uuid,'owner');
  raise exception 'Client membership grant';
 exception when insufficient_privilege then null; end;
 if (select count(*) from public.events where id=current_setting('test.event')::uuid)<>0 then raise exception 'Cross tenant event read';end if;
 if (select count(*) from public.registrations)<>0 then raise exception 'Cross tenant attendee read';end if;
 if (select count(*) from public.registration_answers)<>0 then raise exception 'Cross tenant answer read';end if;
 begin perform public.save_event(current_setting('test.event')::uuid,2,current_setting('test.payload')::jsonb);raise exception 'Cross tenant update';exception when insufficient_privilege then null;end;
 begin perform public.publish_event(current_setting('test.event')::uuid,2);raise exception 'Cross tenant publish';exception when insufficient_privilege then null;end;
 begin delete from public.events where id=current_setting('test.event')::uuid;raise exception 'Cross tenant delete';exception when insufficient_privilege then null;end;
 begin update public.registrations set status='approved';raise exception 'Direct registration mutation';exception when insufficient_privilege then null;end;
 begin update public.event_versions set snapshot='{}';raise exception 'Published version mutation';exception when insufficient_privilege then null;end;
end $$;
select set_config('request.jwt.claim.sub',current_setting('test.a'),true);
do $$
declare r public.registrations; payload jsonb:=current_setting('test.payload')::jsonb; result jsonb; vid uuid;
begin
 select * into strict r from public.registrations where reference=current_setting('test.reference')::uuid;
 if (select answers ? 'untrusted' from public.registration_answers where registration_id=r.id) then raise exception 'Unknown answers retained';end if;
 perform set_config('test.registration',r.id::text,true);
 perform public.review_registration(r.id,'approved');
 perform public.review_registration(r.id,'approved');
 if (select count(*) from public.registration_status_history where registration_id=r.id)<>2 then raise exception 'Review replay created history';end if;
 begin perform public.review_registration(r.id,'rejected');raise exception 'Invalid transition allowed';exception when invalid_parameter_value then null;end;
 payload:=jsonb_set(payload,'{config,fields,0,label}','"Updated question"');
 result:=public.save_event(r.event_id,2,payload);
 vid:=public.publish_event(r.event_id,(result->>'revision')::int);
 if (select snapshot#>>'{config,fields,0,label}' from public.event_versions where id=r.version_id)<>'Country' then raise exception 'Historical form was changed';end if;
 result:=public.submit_registration(current_setting('test.slug'),r.version_id,r.type_id,gen_random_uuid(),'Stale Guest','stale@example.test',jsonb_build_object(current_setting('test.field'),'Ethiopia'));
 if result->>'error'<>'The form has changed. Reload this page before submitting.' then raise exception 'Stale form accepted: %',result;end if;
end $$;
select set_config('request.jwt.claim.sub',current_setting('test.b'),true);
do $$begin
 begin perform public.review_registration(current_setting('test.registration')::uuid,'approved');raise exception 'Cross tenant review';exception when insufficient_privilege then null;end;
end $$;
reset role;
do $$begin
 if private.valid_event_draft('{"branding":{"theme":"forest","font":"sans"}}') then raise exception 'Missing arrays accepted';end if;
end $$;
rollback;

