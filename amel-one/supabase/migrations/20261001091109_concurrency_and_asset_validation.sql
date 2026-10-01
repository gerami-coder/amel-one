create or replace function private.save_event(target uuid, expected_revision integer, payload jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$
declare e public.events; org uuid; new_id uuid:=coalesce(target,gen_random_uuid()); b jsonb:=payload->'basics'; d jsonb:=payload->'config';
begin
 if auth.uid() is null then raise exception 'Access denied' using errcode='42501'; end if;
 if not private.valid_event_draft(d) or coalesce(length(btrim(b->>'name')),0) not between 2 and 150
 or coalesce(b->>'slug','') !~ '^[a-z0-9]+(-[a-z0-9]+)*$' or length(b->>'slug')>100
 or length(coalesce(b->>'description',''))>5000 or length(coalesce(b->>'location',''))>200
 or not exists(select 1 from pg_timezone_names where name=b->>'timezone')
 or coalesce(b->>'eventType','') not in ('conference','exhibition','workshop','community')
 or (b->>'startsAt') is null or (b->>'endsAt') is null or (b->>'closesAt') is null
 then raise exception 'Invalid event configuration' using errcode='22023'; end if;
 if (b->>'endsAt')::timestamptz <= (b->>'startsAt')::timestamptz or (b->>'closesAt')::timestamptz > (b->>'endsAt')::timestamptz then
 raise exception 'Invalid event dates' using errcode='22023'; end if;
 if target is null then
  select organization_id into org from public.organization_members where user_id=auth.uid() order by created_at limit 1;
  if not private.has_permission(org,'event.create') then raise exception 'Access denied' using errcode='42501'; end if;
  insert into public.events(id,organization_id,name,slug,description,event_type,starts_at,ends_at,registration_closes_at,timezone,location,draft)
  values(new_id,org,b->>'name',b->>'slug',b->>'description',b->>'eventType',(b->>'startsAt')::timestamptz,(b->>'endsAt')::timestamptz,(b->>'closesAt')::timestamptz,b->>'timezone',b->>'location',d)
  returning * into e;
 else
  select * into e from public.events where id=target for update;
  if not found or not private.has_permission(e.organization_id,'event.update') then raise exception 'Access denied' using errcode='42501'; end if;
  if e.revision<>expected_revision then raise exception 'Draft changed in another tab. Reload before saving.' using errcode='PT409'; end if;
  if e.published_at is not null and e.slug<>b->>'slug' then raise exception 'Published event links cannot change' using errcode='22023'; end if;
  update public.events set name=b->>'name',slug=b->>'slug',description=b->>'description',event_type=b->>'eventType',
   starts_at=(b->>'startsAt')::timestamptz,ends_at=(b->>'endsAt')::timestamptz,registration_closes_at=(b->>'closesAt')::timestamptz,
   timezone=b->>'timezone',location=b->>'location',draft=d,revision=revision+1 where id=target returning * into e;
 end if;
 return jsonb_build_object('id',e.id,'revision',e.revision);
end $$;
create or replace function private.publish_event(target uuid, expected_revision integer) returns uuid
language plpgsql security definer set search_path='' as $$
declare e public.events; vid uuid; vnum integer; t jsonb; used integer; snapshot jsonb;
begin
 select * into e from public.events where id=target for update;
 if not found or not private.has_permission(e.organization_id,'event.update') then raise exception 'Access denied' using errcode='42501'; end if;
 if e.revision<>expected_revision then raise exception 'Draft changed. Save and preview again.' using errcode='PT409'; end if;
 if not private.valid_event_draft(e.draft) or jsonb_array_length(e.draft->'types')=0 or length(btrim(e.description))<10
 or length(btrim(e.location))<2 or e.registration_closes_at<=now() or e.starts_at<=now()
 then raise exception 'Complete event information, add a registration type and set future dates.' using errcode='22023'; end if;
 for t in select value from jsonb_array_elements(e.draft->'types') loop
  if exists(select 1 from public.registration_types where id=(t->>'id')::uuid and event_id<>target) then raise exception 'Invalid type' using errcode='22023'; end if;
  select count(*) into used from public.registrations where event_id=target and type_id=(t->>'id')::uuid and status<>'rejected';
  if (t->>'capacity')::int<used then raise exception 'Capacity is below existing registrations' using errcode='22023'; end if;
 end loop;
 update public.registration_types set active=false where event_id=target;
 for t in select value from jsonb_array_elements(e.draft->'types') loop
  insert into public.registration_types(id,organization_id,event_id,name,capacity,approval,active)
  values((t->>'id')::uuid,e.organization_id,target,t->>'name',(t->>'capacity')::int,(t->>'approval')::boolean,true)
  on conflict(id) do update set name=excluded.name,capacity=excluded.capacity,approval=excluded.approval,active=true;
 end loop;
 select coalesce(max(version),0)+1 into vnum from public.event_versions where event_id=target;
 snapshot:=jsonb_build_object('name',e.name,'slug',e.slug,'description',e.description,'eventType',e.event_type,'startsAt',e.starts_at,'endsAt',e.ends_at,'closesAt',e.registration_closes_at,'timezone',e.timezone,'location',e.location,'config',e.draft);
 insert into public.event_versions(organization_id,event_id,version,snapshot) values(e.organization_id,target,vnum,snapshot) returning id into vid;
 update public.events set published_at=coalesce(published_at,now()),active_version_id=vid,revision=revision+1 where id=target;
 insert into public.audit_logs(organization_id,actor_id,action,entity_id,metadata) values(e.organization_id,auth.uid(),'event.published',target,jsonb_build_object('version',vnum));
 return vid;
end $$;
create or replace function private.valid_event_draft(d jsonb) returns boolean language plpgsql immutable set search_path='' as $$
declare f jsonb; t jsonb; seen text[]:='{}'; ids text[]:='{}'; o jsonb;
begin
 if d is null or octet_length(d::text)>50000 or jsonb_typeof(d->'types') is distinct from 'array' or jsonb_typeof(d->'fields') is distinct from 'array'
 or jsonb_typeof(d->'branding') is distinct from 'object' then return false; end if;
 if jsonb_array_length(d->'types')>12 or jsonb_array_length(d->'fields')>30 then return false; end if;
 if coalesce(d#>>'{branding,theme}','') not in ('forest','clay','midnight')
 or coalesce(d#>>'{branding,font}','') not in ('sans','serif')
 or length(coalesce(d#>>'{branding,heading}',''))>200 or length(coalesce(d#>>'{branding,footer}',''))>500 then return false; end if;
 for t in select value from jsonb_array_elements(d->'types') loop
  if coalesce(t->>'id','') !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
  or t->>'id'=any(ids) or coalesce(length(btrim(t->>'name')),0) not between 2 and 80
  or length(coalesce(t->>'description',''))>500 or jsonb_typeof(t->'approval') is distinct from 'boolean'
  or coalesce(t->>'capacity','') !~ '^[0-9]{1,6}$' then return false; end if;
  if (t->>'capacity')::int not between 1 and 100000 then return false; end if;
  ids:=array_append(ids,t->>'id');
 end loop;
 for f in select value from jsonb_array_elements(d->'fields') loop
  if coalesce(f->>'id','') !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
  or f->>'id'=any(seen) or coalesce(length(btrim(f->>'label')),0) not between 1 and 120
  or coalesce(f->>'type','') not in ('text','email','tel','textarea','select','checkbox')
  or jsonb_typeof(f->'required') is distinct from 'boolean'
  or length(coalesce(f->>'help',''))>250 or jsonb_typeof(f->'options') is distinct from 'array'
  then return false; end if;
  if jsonb_array_length(f->'options')>20 or (f->>'type'='select' and jsonb_array_length(f->'options')<1) then return false; end if;
  for o in select value from jsonb_array_elements(f->'options') loop
   if jsonb_typeof(o)<>'string' or length(btrim(o#>>'{}')) not between 1 and 100 then return false; end if;
  end loop;
  seen:=array_append(seen,f->>'id');
 end loop;
 if coalesce(d#>>'{branding,logoPath}','')<>'' and coalesce(d#>>'{branding,logoPath}','') !~ '^[a-f0-9-]{36}/[a-f0-9-]{36}/[a-f0-9-]{36}\.(png|jpg|webp)$' then return false; end if;
 return true;
end $$;
create or replace function private.take_registration_limit(k text, period interval, ceiling integer) returns boolean language plpgsql set search_path='' as $$
declare n integer;
begin
 delete from private.registration_limits where window_start<now()-interval '2 days';
 insert into private.registration_limits(bucket,window_start,attempts) values(k,now(),1)
 on conflict(bucket) do update set window_start=case when private.registration_limits.window_start<now()-period then now() else private.registration_limits.window_start end,
 attempts=case when private.registration_limits.window_start<now()-period then 1 else private.registration_limits.attempts+1 end returning attempts into n;
 return n<=ceiling;
end $$;
