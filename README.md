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

- `index.html` — tüm sayfa (hero, scroll-zoom, mönü, test, konum, "Tasarla" burger builder, sipariş, hikaye, geri bildirim, footer)
- `css/style.css` — tüm stiller
- `js/main.js` — scroll-zoom mekaniği, mönü render mantığı, mikro-etkileşimler (imleç, mıknatıslı butonlar, kart tilt, scroll ilerleme çubuğu, nav vurgusu), fact popover'lar, burger builder mantığı, quiz mantığı, geri bildirim formu mantığı
- `js/supabase-config.js` — Supabase proje URL + anon key (kurulana kadar TODO placeholder)
- `data/menu.json` — mönü verisi, **kod bilmeden düzenlenebilir**
- `supabase/schema.sql` — geri bildirim tablosu + RLS kuralları, Supabase SQL Editor'e yapıştırılacak

## Etkileşimli özellikler

- **Özel imleç + mıknatıslı butonlar + mönü kartı tilt** — sadece `pointer:fine` (mouse) cihazlarda ve `prefers-reduced-motion` kapalıyken çalışır; dokunmatik/erişilebilirlik tercihi olan kullanıcılar hiç etkilenmez.
- **Scroll ilerleme çubuğu** ve **nav aktif bölüm vurgusu** — üstte ince bir çubuk ve nav linklerinde alt çizgi, hangi bölümde olduğunu gösterir.
- **Scroll-zoom "Bilgi +" popover'ları** — imza deneyimdeki her katmanın yanında genel bir bilgi açılır. Sadece o an ekranda olan katmanın butonu odaklanabilir/tıklanabilir (diğerleri erişilebilirlik ağacından tamamen çıkarılıyor, "görünmez ama sekmelenebilir" hatasına düşülmüyor).
- **"Kendi Kabasakal'ını Tasarla"** — eğlenceli, gerçek sipariş sistemine bağlı olmayan bir katman seçici; seçime göre isim üretir. Not: hiçbir veri kaydedilmiyor, bu net şekilde kullanıcıya söyleniyor.
- **"Sana Uygun Burger Hangisi?" testi** (`#test`) — 5 soruluk bir mini-quiz, cevaplara göre `data/menu.json`'daki 14 gerçek burgerden birini öneriyor. Eşleştirme, her ürünün `tags` alanındaki basit malzeme etiketleriyle (`gurme`, `peynir`, `tatli-aci`, `barbeku` vb.) kullanıcının seçtiği etiketleri karşılaştırıp en çok örtüşeni seçiyor. Sonuç `aria-live="polite"` ile ekran okuyucuya da duyuruluyor. Hiçbir cevap kaydedilmiyor.
- **Memnuniyet geri bildirim formu** (`#geri-bildirim`) — yıldız puanı + hangi burger + isteğe bağlı yorum, Supabase'e kaydediliyor. Kurulum aşağıda.

## Geri bildirim formu için Supabase kurulumu

1. [supabase.com](https://supabase.com) üzerinde ücretsiz bir hesap/proje oluşturun (bunu siz yapmalısınız, ben üçüncü taraf hesap açamam).
2. Proje panelinde **SQL Editor**'ü açın, bu projedeki [`supabase/schema.sql`](supabase/schema.sql) dosyasının tamamını yapıştırıp çalıştırın — `feedback` tablosunu ve güvenlik kurallarını (RLS) kurar.
3. **Project Settings > API** sayfasından **Project URL** ve **anon / public key**'i kopyalayın.
4. [`js/supabase-config.js`](js/supabase-config.js) dosyasını açıp `TODO_SUPABASE_URL` ve `TODO_SUPABASE_ANON_KEY` yerine bu iki değeri yapıştırın, kaydedin.
5. Sayfayı yenileyin — form otomatik aktif olur ("Bu form henüz aktif değil" notu kaybolur).

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

Bunlar brief'te işaretlenmiş açık kalemler, kod hazır ama gerçek veriyi bekliyor:

- [ ] **Gerçek burger fotoğrafları** — scroll-zoom deneyimi CSS gradyan/doku ile "gerçekçileştirildi" ama hâlâ illüstratif; gerçek fotoğraflar gelince katmanlar (`.slab` sınıfları, `css/style.css`) gerçek kesit fotoğraflarıyla değiştirilecek.
- [ ] **Mönü ürün fotoğrafları** — isim/fiyat/açıklama Yemeksepeti'nden alınıp `data/menu.json`'a işlendi (34 ürün), ama fotoğraflar hâlâ yer tutucu. Yemeksepeti'nin küçük resimleri kalite yetersizliği yüzünden kullanılmadı.
- [x] **Karakter/maskot görseli** — `assets/mascot/mascot.png` olarak kaydedildi, hero'da görünüyor.
- [ ] **Animasyonlu maskot fikri** — kullanıcının fikri: scroll-zoom'da maskot ekranın kenarından çıkıp her katmanı eliyle işaret etsin. Bunun için 4 ek poz gerekiyor (ekmek/sebze/köfte/sos işaret pozları) — Gemini'ye `mascot.png`'yi referans vererek ürettirilecek, sonra `js/main.js`'teki scroll-zoom aşama mantığına bağlanacak.
- [ ] **Supabase kurulumu** — memnuniyet formu kod olarak hazır (`#geri-bildirim`), ama gerçek bir Supabase projesi + `js/supabase-config.js`'e URL/anon key girilene kadar form devre dışı kalır (bkz. yukarıdaki "Geri bildirim formu için Supabase kurulumu" bölümü).
- [ ] **Çalışma saatleri** — `index.html` içinde `#konum` bölümünde TODO olarak işaretli.
- [ ] **Telefon numarası** — sipariş bölümündeki "Ara" ve "WhatsApp" `<button disabled>` elemanları şu an gerçekten devre dışı (TODO), gerçek numara gelince `index.html`'de `#siparis` bölümünde bu iki `<button>` gerçek `tel:` / `https://wa.me/90...` linkine sahip `<a class="cta">` elemanına çevrilecek, `disabled`/`pending` sınıfı kaldırılacak.
- [ ] **Paket platformu linki** (Yemeksepeti/Getir vb.) — varsa link `#siparis` bölümüne eklenecek, yoksa buton kaldırılacak.
- [ ] **Hikaye metni** — `#hikaye` bölümü yer tutucu, abiyle konuşulup gerçek anlatı yazılacak.

## Deploy

Framework olmadığı için Vercel/Netlify/GitHub Pages'e saniyeler içinde deploy edilebilir — build adımı yok, klasörü olduğu gibi yükle.
