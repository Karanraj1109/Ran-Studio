# Ran Studio

Website layanan pembuatan website Ran Studio. Project ini menggunakan HTML, CSS, dan JavaScript tanpa build tool.

## Menjalankan lokal

Bisa dibuka langsung melalui `index.html`, atau gunakan server lokal:

```bash
python -m http.server 5500
```

Lalu buka `http://localhost:5500`.

## Struktur

- `index.html` — struktur halaman dan konten
- `style.css` — styling dan responsive layout
- `script.js` — interaksi, kalkulator, FAQ, cart, modal, dan checkout ke WhatsApp
- `fx.css` + `fx.js` — lapisan animasi "Blueprint → Built" (loader, hero grid, tilt, magnetic, cursor, marquee, efek keranjang, transisi mode). Hapus 2 baris `<link>`/`<script>` di `index.html` untuk menonaktifkan semuanya.
- `builder.css` + `builder.js` — bagian "Rakit websitemu": pratinjau interaktif (jenis usaha, gaya, warna, fitur) yang memilih paket otomatis dan mengisi keranjang lewat tombol `.add-to-cart-btn` yang sudah ada. Teks per jenis usaha ada di objek `COPY` di `builder.js`.
- `sitemap.xml` — sitemap
- `robots.txt` — aturan crawler

## Catatan

Palet warna dan identitas visual asli Ran Studio dipertahankan. Copywriting dirapikan agar lebih mudah dipahami calon pelanggan tanpa menghilangkan informasi teknis yang penting.


Checkout flow: pilih paket → keranjang → pilih domain → isi kebutuhan website → lanjut ke WhatsApp.
