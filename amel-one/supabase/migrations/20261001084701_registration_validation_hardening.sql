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
 return true;
end $$;
create function public.create_event(payload jsonb) returns jsonb language sql security invoker set search_path='' as $$select private.save_event(null,0,payload)$$;
revoke all on function public.create_event(jsonb) from public,anon;
grant execute on function public.create_event(jsonb) to authenticated;
create index registration_limits_window_idx on private.registration_limits(window_start);

