insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('amel-event-branding','amel-event-branding',true,2097152,array['image/png','image/jpeg','image/webp']) on conflict(id) do nothing;
create policy event_branding_insert on storage.objects for insert to authenticated with check(
 bucket_id='amel-event-branding' and exists(
 select 1 from public.events e where e.organization_id::text=(storage.foldername(name))[1] and e.id::text=(storage.foldername(name))[2] and private.has_permission(e.organization_id,'event.update')
 )
);
create policy event_branding_owner_read on storage.objects for select to authenticated using(
 bucket_id='amel-event-branding' and exists(select 1 from public.events e where e.organization_id::text=(storage.foldername(name))[1] and e.id::text=(storage.foldername(name))[2] and private.has_permission(e.organization_id,'event.read'))
);
-- Immutable objects preserve logos referenced by previously published versions.

