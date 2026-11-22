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
   ├─ functions/                API server: samples, stock, promotasks, promodata, promoprogress, promochanges, takeouts, findings
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
- **Update data promo tanpa deploy dan tanpa token:** login admin, klik **Import data baru** dan pilih file promo terbaru. Setelah selesai, jawab **OK** pada pertanyaan *Simpan data ini ke server*. (Atau klik **Simpan ke server** kapan saja.) Semua pengguna langsung memakai data itu. Batas ukuran sekitar 5 MB; bila lebih besar gunakan Export data.json di bawah.
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

---

## Tanpa token: cara memperbarui website

Pembaruan **data** (stok, promo, sample, tugas) dilakukan dari dalam website dan **tidak memerlukan deploy maupun token**.

Token hanya terasa perlu saat mengubah **kode** (jarang), terutama bila memakai Netlify CLI atau `git push`. Hindari itu dengan cara berikut:
1. Hubungkan repo GitHub ke Netlify sekali saja (Cara A).
2. Untuk mengganti file kode, buka repo di **github.com** lewat browser, masuk ke folder file yang diganti, klik **Add file → Upload files**, tarik file barunya, lalu **Commit changes**. Cukup login GitHub, tanpa token.
3. Netlify otomatis deploy ulang dalam 1–2 menit.

Jangan memakai drag & drop folder di Netlify Drop, karena fungsi server tidak berjalan.

---

## Semua item tampil

- **Monitoring sample**: menampilkan semua item Flooring and Wall dari laporan toko (keramik, granit, vinyl, wood flooring, mosaic, dan lainnya) ditambah item yang **hanya ada di DC** (kategori "DC SAJA"). Gunakan dropdown kategori untuk menyaring.
- Item tanpa sample dengan stok toko di bawah 10 dan DC punya satu production no minimal 100 berstatus **Request stock (belum ada sample)**.
- **Cek Promo**: hasil pencarian barang menampilkan semua hasil (tombol *Tampilkan 200 lagi*), bukan hanya 60 baris pertama.

## Monitor Perubahan Promo

Di tab Promo, sub-menu **📆 Monitor Perubahan**:
1. Pilih tanggal (atau tombol ◀ ▶ / Hari ini) dan jenis perubahan: **Mulai berlaku**, **Berakhir**.
2. Semua barang yang promonya berubah pada tanggal itu ditampilkan, lengkap dengan kategori, brand, promo, dan jenis perubahannya.
3. Tandai progres per barang (Belum, Proses, Sudah, Kendala) lewat dropdown, atau centang banyak barang / pakai *Semua yang tampil* untuk menandai sekaligus.
4. Ringkasan progress total dan per kategori terlihat di atas, ada filter status/kategori/pencarian, dan Export CSV.

Progres tersimpan di server (`promoprogress.mjs`) per tanggal sehingga semua pengguna melihat hal yang sama dan siapa yang menandai tercatat.

## Promo yang tiba-tiba hilang atau berubah

Setiap kali admin **Import data baru** di tab Promo, aplikasi membandingkan promo yang masih berlaku (belum berakhir) pada data sebelumnya dengan data baru:
- **Hilang**: barang atau brand yang tadinya punya promo, tetapi sekarang tidak ada padahal promonya belum berakhir.
- **Diskon berubah**: nilai promo (diskon, harga, atau qty) berbeda.
- **Baru**: promo yang sebelumnya tidak ada.

Jawab **OK** pada pertanyaan *Simpan data ini ke server* agar hasil perbandingan tersimpan (maksimal 40 hasil import terakhir). Lihat di **📆 Monitor Perubahan** dengan Sumber **Promo hilang/berubah setelah import data**, pilih hasil import, filter jenisnya, lalu tandai progres per barang (Belum, Proses, Sudah, Kendala) seperti biasa.

Catatan: perbandingan memakai data yang sedang dimuat di browser admin sebagai pembanding, yaitu data server terakhir kecuali ada import lokal yang lebih baru. Karena itu import berikutnya sebaiknya dilakukan setelah halaman memuat data server.

---

## Versi website

Di bawah judul halaman tampil **nomor versi**, **tanggal pembaruan**, dan **waktu deploy terakhir**, serta tombol **Riwayat perubahan**.
- Nomor versi, tanggal, dan catatan perubahan di `public/version.js` diisi oleh Claude pada setiap pembaruan, jadi tidak perlu diedit manual.
- **Waktu deploy terakhir** dibuat otomatis oleh Netlify setiap deploy (lewat `scripts/stamp.mjs` yang dijalankan dari `netlify.toml`), tanpa campur tangan siapa pun.

---

## Menu Take Out (memilih dan mendelegasikan ke tim)

Daftar otomatis "Take out" di Monitoring hanya kandidat. Menu **Take Out** dipakai untuk memutuskan item mana yang benar-benar di-take out dan membagikannya ke tim.

1. **Kandidat Take Out**: sample yang stok tokonya habis atau di bawah 10 dan tidak ada production no DC 100 atau lebih. Saring per kategori atau status, centang yang akan di-take out, lalu klik **Tambahkan yang dicentang**. Bisa juga dari Monitoring lewat tombol **+ Take out** di baris item.
2. **Daftar Take Out**: item yang sudah diputuskan. Isi **PIC** dan **status** (Belum, Proses, Selesai) per item, atau centang beberapa item lalu **Tugaskan yang dicentang**. Kolom *Kondisi sekarang* memperlihatkan status terkini, jadi terlihat bila stok ternyata sudah kembali.
3. **Bagikan ke tim**:
   - **Salin teks WhatsApp** / **Kirim via WhatsApp**: daftar dikelompokkan per PIC (hanya yang belum selesai), lengkap dengan lokasi sample dan link.
   - **Salin link**: pilih PIC di filter lebih dulu agar link langsung menampilkan tugas PIC itu.
   - **Excel**: sesuai filter yang dipilih.
4. Centang **Hapus sample otomatis saat Selesai** bila item yang selesai di-take out harus langsung hilang dari data sample.

Daftar tersimpan di server (`takeouts.mjs`) sehingga semua orang melihat data yang sama. Jika `EDIT_PIN` dipasang, PIN yang sama dengan input sample dipakai untuk mengubah daftar.

---

## Temuan POP tersimpan di server

Daftar **Temuan POP** (di tab Promo) kini tersimpan di server (`findings.mjs`), tidak lagi di browser:
- Penugasan ke akun staff **muncul di perangkat mana pun** saat login dengan akun yang ditugaskan. Staff hanya menerima temuan yang ditugaskan ke akunnya; admin melihat semuanya.
- Status, catatan, dan **foto bukti** ikut tersimpan di server, jadi admin bisa melihat foto yang diunggah staff dari HP-nya. Staff tidak bisa mengubah temuan milik akun lain, dan tidak bisa menandai Sudah dipasang tanpa foto.
- Data tersinkron otomatis tiap 1 menit dan saat login.

**Membatalkan temuan sekaligus (admin):**
- **Batalkan yang tampil**: menghapus semua temuan sesuai filter yang sedang dipilih.
- **Batalkan SEMUA temuan**: menghapus seluruh temuan (dengan dua kali konfirmasi). Foto bukti dan tugas di akun staff ikut hilang.
- **Hapus yang sudah dipasang** tetap ada untuk membersihkan temuan yang selesai.

**Temuan lama di perangkat admin:** bila sebelumnya ada temuan yang tersimpan di browser, muncul tombol **Impor temuan lama** di daftar temuan admin. Klik sekali untuk memindahkan temuan dan fotonya ke server.
