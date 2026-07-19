-- Kabasakal Restaurant — memnuniyet geri bildirimi tablosu
-- Supabase projenizde: Dashboard > SQL Editor > New query > bu dosyanın tamamını yapıştırıp çalıştırın.

create table if not exists public.feedback (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  rating smallint not null check (rating between 1 and 5),
  burger_name text,
  comment text,
  honeypot text
);

alter table public.feedback enable row level security;

-- Herkes (anon rolü) yeni bir geri bildirim EKLEYEBİLİR.
-- honeypot alanı doluysa (bot doldurmuş demektir) ekleme reddedilir.
create policy "anon_insert_feedback" on public.feedback
  for insert
  to anon
  with check (honeypot is null or honeypot = '');

-- RLS policy'si TEK BAŞINA yetmiyor — Postgres'te rolün tabloya temel bir GRANT'i de olmalı,
-- yoksa "permission denied for table feedback" hatası alınır (RLS sadece GRANT edilmiş
-- yetkileri daha da kısıtlar, hiç yoktan yetki üretmez).
grant insert on public.feedback to anon;

-- Kasıtlı olarak SELECT/UPDATE/DELETE için hiçbir policy yok: RLS varsayılanı "reddet"
-- olduğundan anon rolü kayıtları okuyamaz/değiştiremez/silemez. Geri bildirimleri görmek
-- için Supabase Dashboard > Table Editor > feedback (kendi giriş bilgilerinizle) kullanın.
