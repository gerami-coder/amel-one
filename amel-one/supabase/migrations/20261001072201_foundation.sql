-- Phase 0: tenancy, permissions, events and atomic audit history.
create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to authenticated;
create table public.organizations (
 id uuid primary key default gen_random_uuid(), name text not null check (char_length(btrim(name)) between 2 and 100),
 created_by uuid not null references auth.users(id), created_at timestamptz not null default now()
);
create table public.roles (key text primary key, name text not null);
create table public.permissions (key text primary key);
create table public.role_permissions (
 role_key text not null references public.roles(key), permission_key text not null references public.permissions(key),
 primary key(role_key, permission_key)
);
create table public.organization_members (
 organization_id uuid not null references public.organizations(id) on delete cascade,
 user_id uuid not null references auth.users(id) on delete cascade,
 role_key text not null references public.roles(key), created_at timestamptz not null default now(),
 primary key(organization_id,user_id)
);
create index organization_members_user_idx on public.organization_members(user_id);
create index organization_members_role_idx on public.organization_members(role_key);
create index organizations_creator_idx on public.organizations(created_by);
create index role_permissions_permission_idx on public.role_permissions(permission_key);
create table public.events (
 id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id),
 name text not null check(char_length(btrim(name)) between 2 and 150),
 slug text not null unique check(slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
 description text not null default '' check(char_length(description) <= 5000),
 event_type text not null default 'conference',
 starts_at timestamptz not null, ends_at timestamptz not null,
 timezone text not null default 'Africa/Addis_Ababa',
 location text not null default '', published_at timestamptz, registration_closes_at timestamptz,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 constraint event_time_order check(ends_at > starts_at),
 constraint event_close_order check(registration_closes_at is null or registration_closes_at <= ends_at),
 unique(organization_id,id)
);
create index events_organization_idx on public.events(organization_id, starts_at);
create table public.audit_logs (
 id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id),
 actor_id uuid references auth.users(id) on delete set null, action text not null, entity_id uuid not null,
 metadata jsonb not null default '{}'::jsonb, created_at timestamptz not null default now()
);
create index audit_logs_organization_idx on public.audit_logs(organization_id,created_at desc);
create index audit_logs_actor_idx on public.audit_logs(actor_id);
insert into public.roles values ('owner','Owner'),('administrator','Administrator'),('event_manager','Event manager'),('viewer','Viewer');
insert into public.permissions values
 ('organization.read'),('event.read'),('event.create'),('event.update'),('event.delete'),
 ('registration.read'),('registration.create'),('registration.update'),('registration.approve'),
 ('registration.reject'),('registration.export'),('team.manage'),('role.manage'),('audit.read');
insert into public.role_permissions select 'owner',key from public.permissions;
insert into public.role_permissions select 'administrator',key from public.permissions where key <> 'role.manage';
insert into public.role_permissions select 'event_manager',key from public.permissions where key in
 ('organization.read','event.read','event.create','event.update','registration.read','registration.create','registration.update','registration.approve','registration.reject','registration.export');
insert into public.role_permissions select 'viewer',key from public.permissions where key in ('organization.read','event.read','registration.read');

-- Narrow non-exposed helpers avoid recursive membership RLS. Never trust JWT user_metadata.
create function private.has_permission(org_id uuid, requested text) returns boolean
language sql stable security definer set search_path = '' as $$
 select auth.uid() is not null and exists (
 select 1 from public.organization_members m join public.role_permissions rp on rp.role_key=m.role_key
 where m.organization_id=org_id and m.user_id=auth.uid() and rp.permission_key=requested
 )
$$;
revoke all on function private.has_permission(uuid,text) from public,anon;
grant execute on function private.has_permission(uuid,text) to authenticated;

alter table public.organizations enable row level security;
alter table public.roles enable row level security;
alter table public.permissions enable row level security;
alter table public.role_permissions enable row level security;
alter table public.organization_members enable row level security;
alter table public.events enable row level security;
alter table public.audit_logs enable row level security;
revoke all on public.organizations,public.roles,public.permissions,public.role_permissions,public.organization_members,public.events,public.audit_logs from anon,authenticated;
grant select on public.organizations,public.roles,public.permissions,public.role_permissions,public.organization_members,public.audit_logs to authenticated;
grant select,insert,update,delete on public.events to authenticated;
create policy organization_read on public.organizations for select to authenticated using(private.has_permission(id,'organization.read'));
create policy roles_read on public.roles for select to authenticated using(true);
create policy permissions_read on public.permissions for select to authenticated using(true);
create policy role_permissions_read on public.role_permissions for select to authenticated using(true);
create policy membership_read on public.organization_members for select to authenticated using(user_id=(select auth.uid()) or private.has_permission(organization_id,'team.manage'));
create policy events_read on public.events for select to authenticated using(private.has_permission(organization_id,'event.read'));
create policy events_insert on public.events for insert to authenticated with check(private.has_permission(organization_id,'event.create') and published_at is null);
create policy events_update on public.events for update to authenticated using(private.has_permission(organization_id,'event.update')) with check(private.has_permission(organization_id,'event.update') and published_at is null);
-- No delete policy: events cannot be removed until deletion semantics are implemented.
create policy audit_read on public.audit_logs for select to authenticated using(private.has_permission(organization_id,'audit.read'));

create function private.create_organization(org_name text) returns uuid
language plpgsql security definer set search_path='' as $$
declare org_id uuid; actor uuid := auth.uid();
begin
 if actor is null then raise exception 'Authentication required' using errcode='42501'; end if;
 if char_length(btrim(org_name)) not between 2 and 100 then raise exception 'Invalid organization name' using errcode='22023'; end if;
 -- Serialize creation per user; prevent accidental double submission and tenant spam.
 perform pg_advisory_xact_lock(hashtextextended(actor::text,0));
 select organization_id into org_id from public.organization_members where user_id=actor order by created_at limit 1;
 if org_id is not null then return org_id; end if;
 insert into public.organizations(name,created_by) values(btrim(org_name),actor) returning id into org_id;
 insert into public.organization_members(organization_id,user_id,role_key) values(org_id,actor,'owner');
 insert into public.audit_logs(organization_id,actor_id,action,entity_id) values(org_id,actor,'organization.created',org_id);
 return org_id;
end $$;
revoke all on function private.create_organization(text) from public,anon;
grant execute on function private.create_organization(text) to authenticated;
create function public.create_organization(org_name text) returns uuid
language sql security invoker set search_path='' as $$ select private.create_organization(org_name) $$;
revoke all on function public.create_organization(text) from public,anon;
grant execute on function public.create_organization(text) to authenticated;

create function private.audit_event() returns trigger
language plpgsql security definer set search_path='' as $$
begin
 if auth.uid() is null then raise exception 'Authenticated event mutation required' using errcode='42501'; end if;
 if TG_OP='UPDATE' and (new.organization_id<>old.organization_id or new.id<>old.id) then
 raise exception 'Event ownership is immutable' using errcode='42501'; end if;
 new.updated_at := now();
 insert into public.audit_logs(organization_id,actor_id,action,entity_id,metadata)
 values(new.organization_id,auth.uid(),case when TG_OP='INSERT' then 'event.created' else 'event.updated' end,new.id,
 jsonb_build_object('changed_at',now()));
 return new;
end $$;
revoke all on function private.audit_event() from public,anon,authenticated;
create trigger event_audit before insert or update on public.events for each row execute function private.audit_event();
