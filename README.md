# PHOTOBOOTH ARCHIVE — SMK YASBAM (TJKT)

Website statis **PHOTOBOOTH ARCHIVE** untuk Program Keahlian **Teknik Jaringan Komputer dan Telekomunikasi (TJKT) SMK YASBAM Kota Bogor**, siap dipublikasikan langsung melalui **GitHub Pages**.

Website ini dirancang secara rapi, cepat, dan berkelas institusional untuk mempermudah siswa, dewan guru, orang tua murid, dan alumni menelusuri serta mengunduh softfile dokumentasi photobooth resmi kegiatan sekolah yang tersimpan di Google Photos.

---

## 🌟 Fitur Utama & Hasil Revisi

- **Daftar Lengkap Semua Arsip Acara**:
  - Terdapat tab khusus **"Semua Arsip Acara"** sehingga pengguna tidak perlu menebak kata kunci pencarian.
  - Menampilkan daftar kronologis seluruh kegiatan beserta tanggal kalender lengkap (`YYYY-MM-DD` dan format resmi Bahasa Indonesia).
  - Dilengkapi fitur **Filter Cepat Berdasarkan Tahun** (Semua Tahun, Tahun 2026, Tahun 2025, dst.).
- **Tampilan Mobile-First yang Rapi**:
  - Header adaptif dengan menu tab yang nyaman disentuh jempol.
  - Tabel direktori bertransformasi menjadi kartu ringkas di layar HP sehingga tidak terjadi *overflow* atau terpotong.
  - Tombol aksi full-width di mobile untuk kemudahan navigasi layar sentuh.
- **Tombol Website Sekolah yang Berkelas**:
  - Tautan ke `smkyasbam.sch.id` tampil minimalis, modern, dan menyatu harmonis dengan navbar tanpa warna norak atau bayangan berlebihan.
- **Footer Bersih & Elegan**:
  - Didesain minimalis bergaya Swiss, bersih tanpa warna gelap berat atau kotak-kotak tidak proporsional.
- **Pencarian Cepat**:
  - *Live search* otomatis saat mengetik (*debounced*) serta tombol Cari.
  - Pesan kosong informatif dengan rekomendasi kata kunci.
- **Arsip Terbaru Otomatis**:
  - Menampilkan tepat **3 acara paling baru** di halaman beranda.
- **3 Kategori Softfile Tanpa Galeri Berat**:
  1. `FRAME` — Foto berbingkai grafis resmi acara.
  2. `ORIGINAL` — File foto asli kamera tanpa editan frame.
  3. `UNCLAIMED` — Foto yang belum sempat diklaim pengunjung.
  - Jika link kategori belum diisi, tombol kategori otomatis disembunyikan.

---

## 📁 Struktur Berkas

```text
yasbam/
├── index.html        # Struktur semantik HTML5, meta tag, & tata letak tampilan
├── style.css         # Desain sistem CSS minimalis, token warna, responsivitas
├── script.js         # Konfigurasi data acara (EVENTS), logika pengurutan, & router
├── assets/           # Direktori logo dan aset grafis
│   ├── yasbam.jpg    # Logo resmi SMK YASBAM Bogor
│   └── tjkt.jpg      # Logo Program Keahlian TJKT
└── README.md         # Dokumentasi & panduan pengelolaan arsip
```

---

## 🛠️ Panduan Pengelolaan Arsip (Menambahkan Acara Baru)

Seluruh data acara terpusat pada konstanta array `EVENTS` di dalam berkas [script.js](file:///home/reihan/repo/me/yasbam/script.js).

### Langkah Menambahkan Acara:
1. Buka berkas `script.js`.
2. Tambahkan satu objek di dalam array `EVENTS`:

```javascript
{
  id: 'pelepasan-angkatan-2027',  // ID unik, huruf kecil dan tanda hubung (-)
  title: 'Pelepasan & Wisuda Angkatan 2027',
  date: '2027-05-15',             // Format YYYY-MM-DD (menentukan urutan kalender)
  description: 'Dokumentasi photobooth resmi pelepasan siswa kelas XII.',
  albums: {
    frame: 'https://photos.app.goo.gl/tautan-frame',
    original: 'https://photos.app.goo.gl/tautan-original',
    unclaimed: '' // Kosongkan jika kategori belum tersedia
  }
},
```

---

## 🌐 Publikasi ke GitHub Pages

1. Commit dan push ke repository GitHub:
   ```bash
   git add .
   git commit -m "feat: revisi direktori arsip acara dan optimasi mobile"
   git push origin main
   ```
2. Buka repository GitHub > **Settings** > **Pages**.
3. Pada **Source**, pilih branch **main** dan folder **/(root)**, lalu klik **Save**.
