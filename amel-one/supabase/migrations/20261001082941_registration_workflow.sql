-- Phase 1: versioned event publishing and atomic free registration.
alter table public.events add column draft jsonb not null default '{"types":[],"fields":[],"branding":{"theme":"forest","font":"sans","heading":"","footer":""}}';
alter table public.events add column revision integer not null default 1;
alter table public.events add column active_version_id uuid;
revoke insert,update,delete on public.events from authenticated;

create table public.event_versions (
 id uuid primary key default gen_random_uuid(), organization_id uuid not null,
 event_id uuid not null, version integer not null, snapshot jsonb not null,
 created_at timestamptz not null default now(), unique(event_id,version),
 unique(organization_id,event_id,id),
 foreign key(organization_id,event_id) references public.events(organization_id,id)
);
alter table public.events add constraint active_version_event_fk foreign key(organization_id,id,active_version_id) references public.event_versions(organization_id,event_id,id);
create table public.registration_types (
 id uuid primary key, organization_id uuid not null, event_id uuid not null,
 name text not null, capacity integer not null check(capacity between 1 and 100000),
 approval boolean not null default false, active boolean not null default true,
 unique(organization_id,event_id,id),
 foreign key(organization_id,event_id) references public.events(organization_id,id)
);
create table public.attendees (
 id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id),
 email text not null, full_name text not null, created_at timestamptz not null default now(),
 unique(organization_id,email), unique(organization_id,id)
);
create table public.registrations (
 id uuid primary key default gen_random_uuid(), organization_id uuid not null,
 event_id uuid not null, type_id uuid not null, version_id uuid not null, attendee_id uuid not null,
 request_id uuid not null unique, fingerprint text not null, reference uuid not null unique default gen_random_uuid(),
 full_name text not null, email text not null, status text not null check(status in ('pending','approved','rejected')),
 created_at timestamptz not null default now(), unique(event_id,email), unique(organization_id,id),
 foreign key(organization_id,event_id) references public.events(organization_id,id),
 foreign key(organization_id,event_id,type_id) references public.registration_types(organization_id,event_id,id),
 foreign key(organization_id,event_id,version_id) references public.event_versions(organization_id,event_id,id),
 foreign key(organization_id,attendee_id) references public.attendees(organization_id,id)
);
create table public.registration_answers (
 organization_id uuid not null, registration_id uuid not null, answers jsonb not null,
 primary key(organization_id,registration_id),
 foreign key(organization_id,registration_id) references public.registrations(organization_id,id)
);
create table public.registration_status_history (
 id uuid primary key default gen_random_uuid(), organization_id uuid not null, registration_id uuid not null,
 from_status text, to_status text not null, actor_id uuid references auth.users(id),
 created_at timestamptz not null default now(),
 foreign key(organization_id,registration_id) references public.registrations(organization_id,id)
);
create table private.registration_limits (
 bucket text primary key, window_start timestamptz not null, attempts integer not null
);
create index event_versions_org_idx on public.event_versions(organization_id,event_id);
create index registration_types_event_idx on public.registration_types(organization_id,event_id);
create index registrations_event_idx on public.registrations(organization_id,event_id,created_at desc);
create index registrations_type_idx on public.registrations(organization_id,event_id,type_id,status);
create index registrations_version_idx on public.registrations(organization_id,event_id,version_id);
create index registrations_attendee_idx on public.registrations(organization_id,attendee_id);
create index history_registration_idx on public.registration_status_history(organization_id,registration_id);
create index history_actor_idx on public.registration_status_history(actor_id);

alter table public.event_versions enable row level security;
alter table public.registration_types enable row level security;
alter table public.attendees enable row level security;
alter table public.registrations enable row level security;
alter table public.registration_answers enable row level security;
alter table public.registration_status_history enable row level security;
revoke all on public.event_versions, public.registration_types,public.attendees,public.registrations,public.registration_answers,public.registration_status_history from anon,authenticated;
grant select on public.event_versions,public.registration_types,public.attendees,public.registrations,public.registration_answers,public.registration_status_history to authenticated;
create policy versions_read on public.event_versions for select to authenticated using(private.has_permission(organization_id,'event.read'));
create policy types_read on public.registration_types for select to authenticated using(private.has_permission(organization_id,'event.read'));
create policy attendees_read on public.attendees for select to authenticated using(private.has_permission(organization_id,'registration.read'));
create policy registrations_read on public.registrations for select to authenticated using(private.has_permission(organization_id,'registration.read'));
create policy answers_read on public.registration_answers for select to authenticated using(private.has_permission(organization_id,'registration.read'));
create policy history_read on public.registration_status_history for select to authenticated using(private.has_permission(organization_id,'registration.read'));

-- Validate again inside the transaction, including callers that bypass the app.
create function private.valid_event_draft(d jsonb) returns boolean language plpgsql immutable set search_path='' as $$
declare f jsonb; t jsonb; seen text[]:='{}'; ids text[]:='{}'; o jsonb;
begin
 if d is null or octet_length(d::text)>50000 or jsonb_typeof(d->'types')<>'array' or jsonb_typeof(d->'fields')<>'array'
 or jsonb_typeof(d->'branding')<>'object' then return false; end if;
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
 return true;
end $$;
revoke all on function private.valid_event_draft(jsonb) from public,anon,authenticated;

create function private.save_event(target uuid, expected_revision integer, payload jsonb) returns jsonb
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
  if e.revision<>expected_revision then raise exception 'Draft changed in another tab. Reload before saving.' using errcode='40001'; end if;
  if e.published_at is not null and e.slug<>b->>'slug' then raise exception 'Published event links cannot change' using errcode='22023'; end if;
  update public.events set name=b->>'name',slug=b->>'slug',description=b->>'description',event_type=b->>'eventType',
   starts_at=(b->>'startsAt')::timestamptz,ends_at=(b->>'endsAt')::timestamptz,registration_closes_at=(b->>'closesAt')::timestamptz,
   timezone=b->>'timezone',location=b->>'location',draft=d,revision=revision+1 where id=target returning * into e;
 end if;
 return jsonb_build_object('id',e.id,'revision',e.revision);
end $$;
create function public.save_event(target uuid, expected_revision integer, payload jsonb) returns jsonb language sql security invoker set search_path='' as $$select private.save_event(target,expected_revision,payload)$$;
revoke all on function private.save_event(uuid,integer,jsonb),public.save_event(uuid,integer,jsonb) from public,anon;
grant execute on function private.save_event(uuid,integer,jsonb),public.save_event(uuid,integer,jsonb) to authenticated;

create function private.publish_event(target uuid, expected_revision integer) returns uuid
language plpgsql security definer set search_path='' as $$
declare e public.events; vid uuid; vnum integer; t jsonb; used integer; snapshot jsonb;
begin
 select * into e from public.events where id=target for update;
 if not found or not private.has_permission(e.organization_id,'event.update') then raise exception 'Access denied' using errcode='42501'; end if;
 if e.revision<>expected_revision then raise exception 'Draft changed. Save and preview again.' using errcode='40001'; end if;
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
create function public.publish_event(target uuid,expected_revision integer) returns uuid language sql security invoker set search_path='' as $$select private.publish_event(target,expected_revision)$$;
revoke all on function private.publish_event(uuid,integer),public.publish_event(uuid,integer) from public,anon;
grant execute on function private.publish_event(uuid,integer),public.publish_event(uuid,integer) to authenticated;

-- Only this bounded projection is public. Never expose attendee tables.
create function private.public_event(event_slug text) returns jsonb language sql stable security definer set search_path='' as $$
 select jsonb_build_object('id',e.id,'versionId',v.id,'snapshot',v.snapshot,
 'availability',(select coalesce(jsonb_object_agg(t.id,greatest(0,t.capacity-(select count(*) from public.registrations r where r.type_id=t.id and r.status<>'rejected'))),'{}'::jsonb) from public.registration_types t where t.event_id=e.id and t.active))
 from public.events e join public.event_versions v on v.id=e.active_version_id where e.slug=event_slug and e.published_at is not null
$$;
create function public.public_event(event_slug text) returns jsonb language sql stable security invoker set search_path='' as $$select private.public_event(event_slug)$$;
grant usage on schema private to anon;
revoke all on function private.public_event(text),public.public_event(text) from public;
grant execute on function private.public_event(text),public.public_event(text) to anon,authenticated;

create function private.take_registration_limit(k text, period interval, ceiling integer) returns boolean language plpgsql set search_path='' as $$
declare n integer;
begin
 insert into private.registration_limits(bucket,window_start,attempts) values(k,now(),1)
 on conflict(bucket) do update set window_start=case when private.registration_limits.window_start<now()-period then now() else private.registration_limits.window_start end,
 attempts=case when private.registration_limits.window_start<now()-period then 1 else private.registration_limits.attempts+1 end returning attempts into n;
 return n<=ceiling;
end $$;
revoke all on function private.take_registration_limit(text,interval,integer) from public,anon,authenticated;

create function private.submit_registration(event_slug text, version uuid, registration_type uuid, request uuid, name text, email_address text, answers jsonb) returns jsonb
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
 select * into v from public.event_versions where id=version;
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
create function public.submit_registration(event_slug text,version uuid,registration_type uuid,request uuid,name text,email_address text,answers jsonb) returns jsonb
language sql security invoker set search_path='' as $$select private.submit_registration(event_slug,version,registration_type,request,name,email_address,answers)$$;
revoke all on function private.submit_registration(text,uuid,uuid,uuid,text,text,jsonb),public.submit_registration(text,uuid,uuid,uuid,text,text,jsonb) from public;
grant execute on function private.submit_registration(text,uuid,uuid,uuid,text,text,jsonb),public.submit_registration(text,uuid,uuid,uuid,text,text,jsonb) to anon,authenticated;

create function private.review_registration(target uuid, decision text) returns void language plpgsql security definer set search_path='' as $$
declare r public.registrations;
begin
 if decision is null or decision not in ('approved','rejected') then raise exception 'Invalid decision' using errcode='22023'; end if;
 select * into r from public.registrations where id=target for update;
 if not found or not private.has_permission(r.organization_id,case when decision='approved' then 'registration.approve' else 'registration.reject' end) then raise exception 'Access denied' using errcode='42501'; end if;
 if r.status=decision then return; end if;
 if r.status<>'pending' then raise exception 'Only pending registrations can be reviewed' using errcode='22023'; end if;
 update public.registrations set status=decision where id=target;
 insert into public.registration_status_history(organization_id,registration_id,from_status,to_status,actor_id) values(r.organization_id,target,r.status,decision,auth.uid());
 insert into public.audit_logs(organization_id,actor_id,action,entity_id) values(r.organization_id,auth.uid(),'registration.'||decision,target);
end $$;
create function public.review_registration(target uuid,decision text) returns void language sql security invoker set search_path='' as $$select private.review_registration(target,decision)$$;
revoke all on function private.review_registration(uuid,text),public.review_registration(uuid,text) from public,anon;
grant execute on function private.review_registration(uuid,text),public.review_registration(uuid,text) to authenticated;

