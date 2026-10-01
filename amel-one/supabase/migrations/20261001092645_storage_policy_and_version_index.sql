-- Qualify the outer object name; unqualified name resolves to events.name.
alter policy event_branding_insert on storage.objects with check(
 bucket_id='amel-event-branding' and exists(
 select 1 from public.events e where e.organization_id::text=(storage.foldername(storage.objects.name))[1] and e.id::text=(storage.foldername(storage.objects.name))[2] and private.has_permission(e.organization_id,'event.update')
 ));
alter policy event_branding_owner_read on storage.objects using(
 bucket_id='amel-event-branding' and exists(
 select 1 from public.events e where e.organization_id::text=(storage.foldername(storage.objects.name))[1] and e.id::text=(storage.foldername(storage.objects.name))[2] and private.has_permission(e.organization_id,'event.read')
 ));
create index events_active_version_idx on public.events(organization_id,id,active_version_id);
