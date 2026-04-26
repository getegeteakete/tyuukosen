-- ============================================================
-- ストアドプロシージャ（schema.sql 適用後に追加実行）
-- ============================================================

create or replace function public.increment_view(boat_id_in uuid)
returns void as $$
begin
  update public.boats set view_count = coalesce(view_count, 0) + 1 where id = boat_id_in;
end
$$ language plpgsql security definer;

create or replace function public.increment_inquiry(boat_id_in uuid)
returns void as $$
begin
  update public.boats set inquiry_count = coalesce(inquiry_count, 0) + 1 where id = boat_id_in;
end
$$ language plpgsql security definer;

create or replace function public.increment_favorite(boat_id_in uuid)
returns void as $$
begin
  update public.boats set favorite_count = coalesce(favorite_count, 0) + 1 where id = boat_id_in;
end
$$ language plpgsql security definer;

-- 関数実行権を anon / authenticated に付与
grant execute on function public.increment_view(uuid) to anon, authenticated;
grant execute on function public.increment_inquiry(uuid) to anon, authenticated;
grant execute on function public.increment_favorite(uuid) to anon, authenticated;
