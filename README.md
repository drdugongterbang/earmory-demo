# earmory-demo
https://drdugongterbang.github.io/earmory-demo
<img width="1437" height="859" alt="image" src="https://github.com/user-attachments/assets/bb3584c3-cfd4-490c-b494-6710b6d4cbb7" />

# EArmory Front-end Demo

Demo front-end interaktif EArmory untuk simulasi inventaris dan peminjaman perlengkapan militer.

Demo ini berjalan menggunakan data dummy di browser dan tidak membutuhkan database, Laravel, autentikasi backend, atau API.

## Rekomendasi Tampilan

> **Gunakan mode desktop atau laptop saat membuka demo.**
>
> Layout dashboard Admin, Staff, dan Prajurit belum dioptimalkan sepenuhnya untuk layar HP. Pada layar kecil, tabel, sidebar, form, dan beberapa komponen dashboard dapat terlihat padat atau berantakan. Ubah ke mode Desktop pada settings pada pengaturan browser

Rekomendasi minimum:

- Lebar layar: minimal 1024px
- Browser desktop terbaru: Chrome, Edge, atau Firefox
- Zoom browser: 100%
- Orientasi: landscape jika menggunakan tablet

## Cara Menjalankan

### Opsi 1: Demo Web Browser

https://drdugongterbang.github.io/earmory-demo

### Opsi 2: Python

Buka PowerShell pada folder project, lalu jalankan:

```powershell
python -m http.server 8080 --directory earmory-demo
```

Jika command `python` tidak tersedia, gunakan:

```powershell
py -m http.server 8080 --directory earmory-demo
```

Kemudian buka:

```text
http://localhost:8080
```

### Opsi 3: Ekstensi Live Server

1. Buka folder `earmory-demo` di VS Code.
2. Klik kanan file `index.html`.
3. Pilih **Open with Live Server**.
4. Buka alamat yang diberikan oleh Live Server pada browser desktop.

Jangan membuka file dengan double-click jika browser memblokir ES module atau asset lokal. Gunakan server statis seperti Python HTTP server atau Live Server.

## Alur Penggunaan

Demo selalu dimulai dari landing page.

1. Pilih salah satu role:
   - Admin
   - Staff
   - Prajurit
2. Gunakan sidebar untuk berpindah halaman.
3. Jalankan aksi demo sesuai role.
4. Gunakan tombol Logout untuk kembali ke landing page.
5. Gunakan tombol **Reset Demo** di landing page untuk mengembalikan data awal.

## Fitur Admin

- Dashboard statistik inventaris dan peminjaman
- Kategori Barang
- Gudang Barang
- Prajurit
- Peminjaman
- Approve atau reject peminjaman
- Proses peminjaman menjadi `dipinjam`
- Tandai peminjaman menjadi `selesai`
- CRUD kategori barang lokal
- CRUD barang lokal
- CRUD prajurit lokal
- Approve atau reject pendaftaran Prajurit

## Fitur Staff

- Dashboard Staff
- Kategori Barang
- Gudang Barang
- Prajurit
- Peminjaman
- Aksi operasional peminjaman
- CRUD data demo yang tersedia pada halaman terkait

Staff tidak memiliki menu pengelolaan Admin atau Staff.

## Fitur Prajurit

- Dashboard personal
- Data Diri
- Edit nama, pangkat, kesatuan, dan jabatan
- Lihat daftar peminjaman pribadi
- Lihat detail peminjaman
- Ajukan peminjaman baru
- Pilih barang dan jumlah yang tersedia
- Batalkan pengajuan berstatus `menunggu`

## Data Dummy

Role utama yang tersedia:

| Role | Nama Demo | Username |
| --- | --- | --- |
| Admin | Super Admin | `admin.demo` |
| Staff | Rizal Pratama | `staff.demo` |
| Prajurit | Andi Saputra | `prajurit.demo` |

Password tidak digunakan dalam demo ini. Pemilihan role pada landing page berfungsi sebagai login simulasi.

Data awal juga mencakup:

- 4 kategori barang
- 6 barang inventaris
- 2 Prajurit
- 5 transaksi peminjaman
- Activity log dummy

## Penyimpanan Data

Perubahan demo disimpan di `localStorage` browser dengan key utama:

- `earmory-demo-state`
- `earmory-demo-role`

Perubahan akan tetap terlihat setelah refresh pada browser yang sama.

Untuk mengembalikan kondisi awal:

1. Kembali ke landing page.
2. Klik **Reset Demo**.

Atau hapus data site/local storage untuk alamat demo dari pengaturan browser.

## Route Demo

Demo menggunakan hash route, antara lain:

```text
#landing
#admin/dashboard
#admin/kategori
#admin/barang
#admin/peminjaman
#admin/prajurit
#staff/dashboard
#staff/kategori
#staff/barang
#staff/peminjaman
#staff/prajurit
#prajurit/dashboard
#prajurit/profile
#prajurit/peminjaman
#prajurit/peminjaman/create
#prajurit/peminjaman/{id}
```

Tombol Back dan Forward browser dapat digunakan untuk berpindah antar route.

## Struktur Utama

```text
earmory-demo/
  index.html
  assets/
    styles.css
    vendor/
      landing/
      dashboard/
  js/
    app.js
    mock-data.js
    router.js
    store.js
    views/
      admin.js
      prajurit.js
  README.md
```

## Disclaimer

Demo ini hanya untuk presentasi dan simulasi alur front-end.

Demo tidak menyediakan:

- Autentikasi yang aman
- Otorisasi backend
- Database bersama
- Sinkronisasi antar pengguna atau browser
- Validasi backend
- Transaksi database
- Upload file permanen
- Perlindungan data sensitif
- Keamanan untuk penggunaan produksi
- Logging untuk audit

Data, username, status, stok, dan transaksi pada demo bukan data operasional nyata. Semua perubahan hanya tersimpan secara lokal pada browser pengguna.

Penggunaan sebenarnya menggunakan aplikasi Laravel 12 dengan database, autentikasi, validasi, otorisasi backend yang sesuai dan logging lengkap untuk keperluan audit.
Versi Demo akan berubah kedepannya menyesuaikan dengan perkembangan aplikasi yang sebenarnya
