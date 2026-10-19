# Monitoring Sample Pajangan — Panduan Deploy ke Netlify

Website ini dipakai bersama oleh banyak orang. Data sample dan data stok disimpan di server (Netlify Blobs), jadi setiap perubahan tersimpan permanen dan langsung terlihat oleh semua orang yang membuka link.

## Isi folder

```
sample-pajangan-netlify/
├─ netlify.toml                 pengaturan Netlify
├─ package.json                 dependensi fungsi server
├─ public/
│  ├─ index.html                website (satu halaman: Input Sample, Monitoring, Promo, Data Stok)
│  ├─ js/promo.js               logika Cek Promo, Update Harian, Temuan POP
│  ├─ js/pako.min.js            pustaka dekompresi
│  └─ data/
│     ├─ stock.json             data stok awal (15 Okt 2026)
│     └─ promo-data.txt         data promo bawaan
└─ netlify/
   ├─ functions/                API server: samples, stock, promotasks
   └─ lib/users.mjs             daftar akun promo (untuk cek login di server)
```

> **Penting:** jangan pakai fitur drag & drop folder (Netlify Drop). Cara itu tidak menjalankan fungsi server, sehingga data tidak tersimpan bersama. Gunakan **Cara A (GitHub)** atau **Cara B (CLI)**.

---

## Cara A — Lewat GitHub (disarankan)

### 1. Buat akun
- Akun GitHub: https://github.com/signup
- Akun Netlify: https://app.netlify.com/signup (bisa login dengan akun GitHub)

### 2. Upload folder ke GitHub
1. Di GitHub klik **New repository**, beri nama `sample-pajangan`, pilih **Private**, klik **Create repository**.
2. Klik **uploading an existing file**.
3. Ekstrak zip, lalu **tarik seluruh isi folder** `sample-pajangan-netlify` (bukan foldernya) ke halaman GitHub. Pastikan `netlify.toml`, `package.json`, folder `public` dan folder `netlify` ikut terupload.
4. Klik **Commit changes**.

### 3. Hubungkan ke Netlify
1. Di Netlify klik **Add new project → Import an existing project → GitHub**.
2. Pilih repo `sample-pajangan`.
3. Biarkan pengaturan build apa adanya (sudah dibaca dari `netlify.toml`), lalu klik **Deploy**.
4. Tunggu 1–2 menit sampai status **Published**.

### 4. Pasang PIN edit (sangat disarankan)
Tanpa PIN, siapa pun yang punya link bisa mengubah atau menghapus data. Dengan PIN, semua orang tetap bisa **melihat**, tetapi hanya yang tahu PIN yang bisa **mengubah**.
1. Netlify → **Project configuration → Environment variables → Add a variable**.
2. Key: `EDIT_PIN`, Value: PIN pilihan Anda (mis. `Toko2026`).
3. Buka **Deploys → Trigger deploy → Deploy project without cache**.
4. Saat pertama kali menyimpan sample, website akan meminta PIN. PIN diingat di browser masing-masing.

### 5. Ubah nama link
**Project configuration → General → Project name** → ganti, misalnya `sample-m10-yogya`. Link menjadi `https://sample-m10-yogya.netlify.app`. Bagikan link ini ke tim.

---

## Cara B — Lewat Netlify CLI (tanpa GitHub)

Perlu Node.js (https://nodejs.org, versi LTS).

```bash
npm install -g netlify-cli
cd sample-pajangan-netlify
npm install
netlify login
netlify init        # pilih "Create & configure a new project"
netlify deploy --prod
```

Perintah `netlify deploy --prod` yang sama dipakai setiap kali ingin memperbarui kode website.

---

## Pembaruan sehari-hari

| Yang ingin diperbarui | Caranya | Perlu deploy ulang? |
|---|---|---|
| Input / hapus sample | Langsung lewat website | Tidak |
| Data stok toko & DC terbaru | Tab **3. Data Stok** → upload kedua file Excel → **Proses & simpan** | Tidak |
| Tampilan atau aturan status | Edit `public/index.html`, lalu commit ke GitHub (Cara A) atau `netlify deploy --prod` (Cara B) | Ya (otomatis kalau pakai GitHub) |

Data stok awal di `public/data/stock.json` hanya dipakai sebagai cadangan jika belum pernah ada upload. Setelah Anda upload laporan baru lewat website, data itu yang dipakai semua orang.

**Rutinitas yang disarankan:** setiap hari (atau tiap kali laporan baru keluar) satu orang upload Inventory Movement dan Stock Warehouse di tab Data Stok. Semua pengguna lain langsung memakai data tersebut.

---

## Cek setelah deploy

1. Buka link website. Di bawah judul harus tertulis **● Tersinkron dengan server** (hijau).
2. Input satu sample percobaan, lalu buka link yang sama di HP atau browser lain. Sample harus muncul (maksimal 1 menit, atau langsung setelah refresh).
3. Coba tombol **Scan** di HP. Kamera berjalan karena Netlify memakai HTTPS.

## Masalah umum

- **○ Offline atau Server error 404/500**: fungsi server belum berjalan. Pastikan `netlify/functions` dan `package.json` ikut terupload, lalu deploy ulang. Cek juga **Logs → Functions** di Netlify.
- **PIN salah**: hapus PIN yang tersimpan dengan mengosongkan data situs di browser (atau pakai jendela incognito), lalu masukkan PIN yang benar.
- **Kamera tidak mau terbuka**: izinkan akses kamera di pengaturan browser untuk situs ini.
- **Dua orang input bersamaan**: tiap perubahan diproses di server satu per satu sehingga aman. Namun jika dua orang upload data stok pada waktu yang sama, yang terakhir menimpa yang lain.
- **Backup**: tab Input Sample punya tombol **Ekspor sample (CSV)**. Lakukan sesekali sebagai cadangan.
- **Batasi akses lebih ketat** (hanya orang tertentu yang boleh melihat): fitur proteksi password Netlify tersedia di paket berbayar tertentu. Alternatifnya, jangan sebarkan link ke luar tim.

---

## Tab Promo (menyatu dengan website)

Tab **🏷️ Promo** ada di menu yang sama dengan tab lain dan memakai tema yang sama. Setelah login (admin/staff) ada tiga sub-menu: **Cek Promo & POP** (khusus admin), **Update Harian**, dan **Temuan POP**.

- Di tab Monitoring, tombol **🏷️ Promo** pada tiap item langsung membuka Cek Promo untuk item itu.
- Di Cek Promo ada tombol 📷 untuk scan barcode, dan kartu item menampilkan **Sample pajangan** (lokasi sample bila ada).
- Data promo bawaan ada di `public/data/promo-data.txt`. Untuk memperbarui data bagi **semua pengguna**: login admin, import laporan promo terbaru, klik **Export data.json**, simpan sebagai `public/data.json` di repo, lalu commit. Netlify akan deploy ulang. Import tanpa export hanya tersimpan di browser yang dipakai.

---

## Update Promo Harian (penugasan per kategori & monitoring)

Di tab **Cek Promo** (setelah login) ada panel **Update Promo Harian**. Data tersimpan di server (fungsi `promotasks.mjs`), jadi admin dan petugas melihat data yang sama. Peran admin/staff diperiksa di server.

**Admin: membuat penugasan**
1. Pilih **tanggal**, lalu buka *Buat penugasan update promo untuk tanggal ini*.
2. Centang kriteria promo yang ada update: **Mulai berlaku hari itu**, **Berakhir hari itu**, atau **Semua promo aktif**. Klik **Tampilkan promo**. Daftar diambil dari data promo; semua terpilih otomatis, hilangkan centang pada promo yang tidak perlu.
3. Di **Penugasan per kategori**, tentukan petugas untuk tiap kategori (mis. Flooring and Wall ke sc1, Bathroom ke sc2). Ada tombol *Semua kategori ke…* dan *Bagi rata kategori ke semua petugas*. Kategori yang tidak perlu bisa tidak dicentang.
4. Klik **Buat tugas**. Satu tugas = satu promo pada satu kategori, lengkap dengan jumlah barangnya. Tugas yang sama (promo + kategori) di tanggal yang sama tidak dibuat dua kali.

**Admin: monitoring**
- Ringkasan hari itu: total tugas, selesai, proses, belum, kendala, belum ditugaskan, serta progress dalam jumlah barang.
- Progress per petugas, progress per kategori, dan riwayat 7 hari terakhir (klik baris untuk membuka tanggal itu).
- Daftar tugas dengan filter status, kategori, dan petugas. Ubah petugas per baris, atau **Tugaskan semua yang tampil** (misalnya setelah memfilter satu kategori), atau centang beberapa baris. Tombol **Lihat** menampilkan daftar barang dalam tugas itu dan bisa diexport ke CSV.
- **Export CSV** mengunduh rekap hari itu. Data bisa dipindah ke tanggal lain lewat endpoint `carry` di server (belum ada tombolnya di tampilan).

**Petugas (staff)**: hanya melihat tugas miliknya, dapat membuka daftar barang, lalu mengubah status (Belum, Proses, Selesai, Kendala) dan mengisi catatan.

Halaman menyegarkan data tiap 1 menit. Setelah update ini, semua pengguna perlu login ulang di tab Cek Promo satu kali.
