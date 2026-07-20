# Kabasakal Restaurant — Website

Akhisar'daki Kabasakal Restaurant için, ürün odaklı ve enerjik bir tek sayfa web sitesi. Framework yok — saf HTML/CSS/JS.

## Yerelde çalıştırma

`index.html` dosyasını tarayıcıda doğrudan açmak **çalışmaz** çünkü mönü, `data/menu.json` dosyasından `fetch` ile okunuyor ve tarayıcılar `file://` üzerinden bunu engelliyor. Bir yerel sunucu şart:

```
npx serve .
```
veya
```
python -m http.server 8000
```

sonra `http://localhost:8000` (ya da serve'un verdiği adres) açılır.

## Dosya yapısı

- `index.html` — tüm sayfa (hero, scroll-zoom, mönü, test, konum, "Tasarla" burger builder, rezervasyon, sipariş, hikaye, geri bildirim, footer)
- `css/style.css` — tüm stiller
- `js/main.js` — scroll-zoom mekaniği (canlı HUD sıcaklık/işlem okuması, outro'da sahne kararması dahil), mönü render + kategori atlama çipleri + yemek/içecek ikon sistemi, scroll ilerleme çubuğu + nav vurgusu, fact popover'lar, burger builder mantığı, quiz mantığı (sonuçtan mönüdeki tam karta "spotlight" atlama dahil), rezervasyon formu mantığı, geri bildirim formu mantığı
- `js/supabase-config.js` — Supabase proje URL + anon key (kurulana kadar TODO placeholder)
- `data/menu.json` — mönü verisi, **kod bilmeden düzenlenebilir**
- `supabase/schema.sql` — `feedback` ve `reservations` tabloları + RLS kuralları, Supabase SQL Editor'e yapıştırılacak

## Etkileşimli özellikler

- **Scroll ilerleme çubuğu**, **nav aktif bölüm vurgusu** ve **numaralı bölüm akışı** (nav ve section başlıkları `01`–`07` — sayfanın gerçek yukarıdan-aşağı sırasını yansıtıyor) — hangi bölümde olduğunu gösterir.
- **Scroll-zoom canlı HUD paneli** — sac sıcaklığı + o anki işlem/katman okuması, scroll konumuna göre canlı güncelleniyor (dekoratif/atmosferik; gerçek içerik hâlâ caption metinlerinde). Küçük ekranlarda ve `prefers-reduced-motion` açıkken gizleniyor.
- **Scroll-zoom "Bilgi +" popover'ları** — imza deneyimdeki her katmanın yanında genel bir bilgi açılır. Sadece o an ekranda olan katmanın butonu odaklanabilir/tıklanabilir (diğerleri erişilebilirlik ağacından tamamen çıkarılıyor, "görünmez ama sekmelenebilir" hatasına düşülmüyor).
- **"Kendi Kabasakal'ını Tasarla"** — eğlenceli, gerçek sipariş sistemine bağlı olmayan bir katman seçici; seçime göre isim üretir. Not: hiçbir veri kaydedilmiyor, bu net şekilde kullanıcıya söyleniyor.
- **"Sana Uygun Burger Hangisi?" testi** (`#test`) — 5 soruluk bir mini-quiz, cevaplara göre `data/menu.json`'daki 14 gerçek burgerden birini öneriyor. Eşleştirme, her ürünün `tags` alanındaki basit malzeme etiketleriyle (`gurme`, `peynir`, `tatli-aci`, `barbeku` vb.) kullanıcının seçtiği etiketleri karşılaştırıp en çok örtüşeni seçiyor. Sonuç `aria-live="polite"` ile ekran okuyucuya da duyuruluyor. Hiçbir cevap kaydedilmiyor.
- **Rezervasyon formu** (`#rezervasyon`) — tarih + saat (12:00–22:00, yer tutucu saatler) + kişi sayısı + ad/telefon, Supabase'e kaydediliyor. Bu bir onay sistemi değil, bir **istek** formu — onay hâlâ telefon/WhatsApp üzerinden Kabasakal tarafından yapılıyor. Kurulum aşağıda (geri bildirim formuyla aynı Supabase projesini kullanır).
- **Memnuniyet geri bildirim formu** (`#geri-bildirim`) — yıldız puanı + hangi burger + isteğe bağlı yorum, Supabase'e kaydediliyor. Kurulum aşağıda.
- **Mobil / QR hazırlığı** — restoranda masaya QR konulacağı için mobil birincil kabul edildi: hamburger nav (≤640px), `100dvh` viewport düzeltmesi (iOS adres çubuğu zıplaması), hero'da "Doğrudan Mönüye Git" kestirmesi, ≥44px dokunma alanlı yıldızlar. Performans: maskotlar WebP (toplam ~1.9MB → ~150KB, PNG fallback'li `<picture>`), mönü fotoğrafları gerçek `<img loading="lazy">`. **QR önerisi:** kod `.../kabasakal-site/#menu` adresine yönlendirilirse müşteri tek taramayla doğrudan mönüye iner; ana URL kullanılırsa hero'daki kestirme aynı işi görür.

## Geri bildirim + rezervasyon formları için Supabase kurulumu

1. [supabase.com](https://supabase.com) üzerinde ücretsiz bir hesap/proje oluşturun (bunu siz yapmalısınız, ben üçüncü taraf hesap açamam).
2. Proje panelinde **SQL Editor**'ü açın, bu projedeki [`supabase/schema.sql`](supabase/schema.sql) dosyasının tamamını yapıştırıp çalıştırın — hem `feedback` hem `reservations` tablolarını ve güvenlik kurallarını (RLS) tek seferde kurar. (Daha önce sadece `feedback` için çalıştırdıysanız dosyayı tekrar çalıştırmanız yeterli — `create table if not exists` sayesinde `feedback` zarar görmez, sadece `reservations` yeni eklenir.)
3. **Project Settings > API** sayfasından **Project URL** ve **anon / public key**'i kopyalayın.
4. [`js/supabase-config.js`](js/supabase-config.js) dosyasını açıp `TODO_SUPABASE_URL` ve `TODO_SUPABASE_ANON_KEY` yerine bu iki değeri yapıştırın, kaydedin.
5. Sayfayı yenileyin — her iki form da otomatik aktif olur ("Bu form henüz aktif değil" notu kaybolur).

**Güvenlik notu:** `anon`/`public` key tarayıcıda görünmesi tasarım gereği güvenli olan bir anahtardır (gizli değildir, `.env` gibi saklamaya gerek yok) — güvenlik, adım 2'de kurulan Row Level Security kurallarından geliyor (herkes ekleyebilir, kimse okuyamaz/değiştiremez). Asla **`service_role`** (secret) key'i buraya veya başka bir istemci-taraf dosyaya koymayın; o anahtar tüm güvenlik kurallarını bypass eder. Geri bildirimleri okumak için Supabase Dashboard'daki **Table Editor**'ü kullanın (kendi girişinizle).

## Abi için: Mönüyü güncellemek

`data/menu.json` dosyasını aç. Her ürün şöyle görünür:

```json
{
  "name": "Klasik Smash",
  "price": 180,
  "description": "Kısa açıklama",
  "photo": "assets/menu/klasik.jpg"
}
```

- `name`, `description`: tırnak içine yazılan metin
- `price`: sayı olarak yaz (₺ işareti otomatik ekleniyor), fiyat yoksa `null` bırak
- `photo`: fotoğrafı `assets/menu/` klasörüne koy, buraya dosya adını yaz

Kaydet, sayfayı yenile — değişiklik otomatik görünür.

## Şu an eksik / TODO (koddan değil, içerikten kaynaklı)

Bunlar brief'te işaretlenmiş açık kalemler, kod hazır ama gerçek veriyi bekliyor.

> **Not (2026-07-20):** Site canlıya alındığı için ziyaretçiye görünen sayfa metinlerindeki tüm
> "TODO / abiden alınacak" dili müşteri diline çevrildi ("çok yakında" vb.) — açık kalemlerin
> takibi artık YALNIZCA bu README'de. Aşağıdaki liste güncel durumun tek kaynağı.

- [ ] **Gerçek burger fotoğrafları** — scroll-zoom deneyimi CSS gradyan/doku ile "gerçekçileştirildi" ama hâlâ illüstratif; gerçek fotoğraflar gelince katmanlar (`.slab` sınıfları, `css/style.css`) gerçek kesit fotoğraflarıyla değiştirilecek.
- [x] **Mönü ürün görselleri** — burgerler gerçek fotoğraf (kullanıcının çektiği, `assets/menu/`); yan ürünler + içecekler kasıtlı olarak illüstrasyon ikon ("denemek için" kullanıcı isteği, 2026-07-20 — geri almak için `data/menu.json`'da ilgili ürünün `icon` alanını silmek yeterli, `photo` alanları duruyor). Tek eksik: "Triple Mustard Cheese" fotoğrafı (PLACEHOLDER).
- [x] **Karakter/maskot görseli** — `assets/mascot/mascot.png` (hero) + 4 scroll-zoom pozu (`mascot-ekmek/sebze/kofte/sos.png`) kaydedildi ve scroll-zoom aşamalarına bağlandı.
- [x] **Maskot görsellerinde Gemini filigranı** — üç görseldeki (sebze/köfte/sos) "sparkle" filigranı diffusion-inpaint (komşu piksel yayılımı) ile temizlendi, 2026-07-20; piksel + görsel düzeyde doğrulandı.
- [ ] **Supabase kurulumu** — hem memnuniyet formu (`#geri-bildirim`) hem rezervasyon formu (`#rezervasyon`) kod olarak hazır, ama gerçek bir Supabase projesi + `js/supabase-config.js`'e URL/anon key girilene kadar ikisi de devre dışı kalır (bkz. yukarıdaki kurulum bölümü).
- [ ] **Çalışma saatleri** — `index.html` içinde `#konum` bölümünde TODO olarak işaretli; `#rezervasyon`'daki 12:00–22:00/30 dk saat aralığı da aynı gerçek bilgiyi bekleyen bir yer tutucu (`js/main.js` → `reservationForm` → `buildTimeSlots`).
- [ ] **Telefon numarası** — sipariş bölümündeki "Ara" ve "WhatsApp" `<button disabled>` elemanları şu an gerçekten devre dışı (TODO), gerçek numara gelince `index.html`'de `#siparis` bölümünde bu iki `<button>` gerçek `tel:` / `https://wa.me/90...` linkine sahip `<a class="cta">` elemanına çevrilecek, `disabled`/`pending` sınıfı kaldırılacak.
- [ ] **Paket platformu linki** (Yemeksepeti/Getir vb.) — varsa link `#siparis` bölümüne eklenecek, yoksa buton kaldırılacak.
- [ ] **Hikaye metni** — `#hikaye` bölümü yer tutucu, abiyle konuşulup gerçek anlatı yazılacak.

## Deploy

Framework olmadığı için Vercel/Netlify/GitHub Pages'e saniyeler içinde deploy edilebilir — build adımı yok, klasörü olduğu gibi yükle.
