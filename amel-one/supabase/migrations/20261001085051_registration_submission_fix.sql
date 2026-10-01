create or replace function private.submit_registration(event_slug text, version uuid, registration_type uuid, request uuid, name text, email_address text, answers jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$
declare e public.events; v public.event_versions; t public.registration_types; r public.registrations;
 f jsonb; val jsonb; fingerprint text; normalized text:=lower(btrim(email_address)); aid uuid; rid uuid; result_status text; cleaned jsonb:='{}';
begin
 if request is null or version is null or registration_type is null or name is null or length(btrim(name)) not between 2 and 100
 or normalized is null or length(normalized)>254 or normalized !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
 or jsonb_typeof(answers) is distinct from 'object' or octet_length(answers::text)>40000 then return jsonb_build_object('error','Check your name, email and answers.'); end if;
 select * into e from public.events where slug=event_slug and published_at is not null for update;
 if not found then return jsonb_build_object('error','This event is unavailable.'); end if;
 fingerprint:=md5(jsonb_build_object('event',e.id,'version',version,'type',registration_type,'name',btrim(name),'email',normalized,'answers',answers)::text);
 select * into r from public.registrations where request_id=request;
 if found then
  if r.fingerprint<>fingerprint then return jsonb_build_object('error','This submission key was already used. Reload to start again.'); end if;
  return jsonb_build_object('reference',r.reference,'status',r.status);
 end if;
 if not private.take_registration_limit('event:'||e.id,interval '1 minute',60)
 or not private.take_registration_limit('email:'||e.id||':'||md5(normalized),interval '1 hour',5) then
 return jsonb_build_object('error','Too many attempts. Please try again later.'); end if;
 if e.active_version_id<>version then return jsonb_build_object('error','The form has changed. Reload this page before submitting.'); end if;
 select * into v from public.event_versions where id=submit_registration.version;
 if now()>=(v.snapshot->>'closesAt')::timestamptz or now()>=(v.snapshot->>'endsAt')::timestamptz then return jsonb_build_object('error','Registration has closed.'); end if;
 select * into t from public.registration_types where id=registration_type and event_id=e.id and active;
 if not found then return jsonb_build_object('error','Choose an available registration type.'); end if;
 if exists(select 1 from public.registrations where event_id=e.id and email=normalized) then return jsonb_build_object('error','A registration with this email already exists for this event.'); end if;
 if (select count(*) from public.registrations where type_id=t.id and status<>'rejected')>=t.capacity then return jsonb_build_object('error','This registration type is full.'); end if;
 for f in select value from jsonb_array_elements(v.snapshot#>'{config,fields}') loop
  val:=answers->(f->>'id');
  if f->>'type'='checkbox' then
   if val is not null and jsonb_typeof(val)<>'boolean' then return jsonb_build_object('error','Check checkbox answers.'); end if;
   if (f->>'required')::boolean and coalesce(val,'false'::jsonb)<>'true'::jsonb then return jsonb_build_object('error','Complete all required fields.'); end if;
   cleaned:=cleaned||jsonb_build_object(f->>'id',coalesce(val,'false'::jsonb));
  else
   if val is null then val:='""'::jsonb; end if;
   if jsonb_typeof(val)<>'string' or length(val#>>'{}')>2000 then return jsonb_build_object('error','An answer is too long or invalid.'); end if;
   if (f->>'required')::boolean and length(btrim(val#>>'{}'))=0 then return jsonb_build_object('error','Complete all required fields.'); end if;
   if length(val#>>'{}')>0 and f->>'type'='select' and not (f->'options' @> jsonb_build_array(val)) then return jsonb_build_object('error','Choose a valid option.'); end if;
   if length(val#>>'{}')>0 and f->>'type'='email' and (val#>>'{}') !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' then return jsonb_build_object('error','Enter a valid email answer.'); end if;
   cleaned:=cleaned||jsonb_build_object(f->>'id',val);
  end if;
 end loop;
 insert into public.attendees(organization_id,email,full_name) values(e.organization_id,normalized,btrim(name))
 on conflict(organization_id,email) do update set email=excluded.email returning id into aid;
 result_status:=case when t.approval then 'pending' else 'approved' end;
 insert into public.registrations(organization_id,event_id,type_id,version_id,attendee_id,request_id,fingerprint,full_name,email,status)
 values(e.organization_id,e.id,t.id,v.id,aid,request,fingerprint,btrim(name),normalized,result_status) returning * into r;
 insert into public.registration_answers values(e.organization_id,r.id,cleaned);
 insert into public.registration_status_history(organization_id,registration_id,to_status) values(e.organization_id,r.id,result_status);
 insert into public.audit_logs(organization_id,action,entity_id,metadata) values(e.organization_id,'registration.created',r.id,jsonb_build_object('event_id',e.id,'status',result_status));
 return jsonb_build_object('reference',r.reference,'status',result_status);
end $$;
