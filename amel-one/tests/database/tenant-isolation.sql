begin;
insert into auth.users(id,email,aud,role) values
 ('10000000-0000-4000-8000-000000000001','isolation-a@example.test','authenticated','authenticated'),
 ('10000000-0000-4000-8000-000000000002','isolation-b@example.test','authenticated','authenticated');
select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000001',true);
set local role authenticated;
select public.create_organization('Isolation A');
insert into public.events(organization_id,name,slug,starts_at,ends_at)
 select id,'A event','isolation-a','2027-03-18T06:00Z','2027-03-18T15:00Z' from public.organizations where name='Isolation A';
reset role;
select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000002',true);
set local role authenticated;
select public.create_organization('Isolation B');
insert into public.events(organization_id,name,slug,starts_at,ends_at)
 select id,'B event','isolation-b','2027-03-18T06:00Z','2027-03-18T15:00Z' from public.organizations where name='Isolation B';
reset role;
select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000001',true);
set local role authenticated;
do $$ declare n integer; begin
 select count(*) into n from public.events where slug='isolation-b';
 if n<>0 then raise exception 'FAIL cross-tenant read'; end if;
 update public.events set name='B stolen' where slug='isolation-b'; get diagnostics n=row_count;
 if n<>0 then raise exception 'FAIL cross-tenant update'; end if;
 delete from public.events where slug='isolation-b'; get diagnostics n=row_count;
 if n<>0 then raise exception 'FAIL cross-tenant delete'; end if;
 select count(*) into n from public.events where slug='isolation-a';
 if n<>1 then raise exception 'FAIL own-tenant read'; end if;
 update public.events set name='A updated' where slug='isolation-a'; get diagnostics n=row_count;
 if n<>1 then raise exception 'FAIL own-tenant update'; end if;
 select count(*) into n from public.audit_logs where action='event.updated';
 if n<>1 then raise exception 'FAIL atomic audit'; end if;
 begin
  update public.events set published_at=now() where slug='isolation-a';
  raise exception 'FAIL unvalidated publish permitted';
 exception when insufficient_privilege then null; end;
 begin
  insert into public.organization_members(organization_id,user_id,role_key)
  select id,'10000000-0000-4000-8000-000000000002','owner' from public.organizations;
  raise exception 'FAIL client membership grant permitted';
 exception when insufficient_privilege then null; end;
end $$;
reset role;
select 'PASS: cross-tenant read/update/delete denied; own access, audit and escalation checks passed' as result;
rollback;
