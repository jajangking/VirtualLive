# VirtualLive — Neon Circuit

Prototype browser untuk ide balapan interaktif TikTok Live: penonton mengirim `/spawn nama`, namanya muncul pada mobil sendiri, lalu mobil dikemudikan AI Q-learning. Gift bisa disimulasikan dengan `/gift nama` (atau `/boost nama`).

## Jalankan lokal

Butuh Node.js 18+, tanpa dependency eksternal:

```bash
npm start
```

Buka `http://localhost:3000`. Server mendengarkan di `0.0.0.0`, jadi bisa diproxy oleh hosting/VPS di port 3000. Alternatif untuk preview statis: `python3 -m http.server 4173 --bind 0.0.0.0`.

## Deploy otomatis ke VPS Instabox

Repo ini menyiapkan deployment pada branch `arena/e041ca7d-virtuallive`. Di VPS Debian/Ubuntu dengan **Git, Node.js 18+, systemd**, jalankan dari SSH/console VPS:

```bash
git clone --depth 1 --branch arena/e041ca7d-virtuallive https://github.com/jajangking/VirtualLive.git /tmp/virtuallive-setup
sudo bash /tmp/virtuallive-setup/deploy/instabox-setup.sh
```

Setup memasang app ke `/opt/virtuallive`, menjalankan server di port 3000 sebagai service systemd, lalu membuat timer yang memeriksa branch tersebut setiap 60 detik. Saat ada commit baru di branch, VPS mengambil commit itu dan me-restart service otomatis. Cek status dengan:

```bash
sudo systemctl status virtuallive.service
sudo systemctl status virtuallive-update.timer
sudo journalctl -u virtuallive.service -n 50 --no-pager
```

Pastikan port 3000 tersedia sebelum setup. Jika ada service lama yang masih menggunakan port itu, hentikan service tersebut melalui systemd/console VPS terlebih dahulu; setup sengaja tidak membunuh proses tak dikenal. Script menolak menimpa direktori `/opt/virtuallive` yang bukan checkout repo ini. Repo saat ini publik sehingga VPS dapat menarik branch melalui HTTPS tanpa token.

## Perintah prototype

- `/spawn nama` — buat mobil untuk nama pembalap (maksimal 12, nama unik).
- `/gift nama` atau `/boost nama` — simulasi hadiah yang memberi speed boost.
- `/help` — tampilkan daftar perintah.
- `RESET` — kosongkan grid dan mulai lagi.

Tiga mobil demo (`NOVA`, `KILAT`, `BIMO`) dibuat otomatis agar sirkuit langsung terlihat bergerak. Perintah chat yang diketik pada panel Live Chat adalah input simulasi lokal, **belum tersambung ke komentar TikTok sungguhan**.

## AI

Setiap mobil memiliki tabel Q terpisah. State menggabungkan lane dengan kategori jarak ke mobil depan; aksi AI adalah brake, cruise, boost, atau pindah lane/overtake. Q-table diperbarui dengan reward untuk kemajuan, menjaga jarak, dan menyalip, serta penalti untuk aksi lane change dan kondisi terhalang. Epsilon-greedy memberi eksplorasi pada awal balapan dan berkurang seiring pengalaman.

## Integrasi live

Tahap berikutnya adalah membuat service yang menerima event dari integrasi TikTok yang dipilih, memvalidasi command, lalu mendorong event ke browser melalui WebSocket/SSE. Jangan menaruh cookie atau credential TikTok di frontend. Prototype ini sengaja memakai simulator supaya UI dan gameplay dapat diuji dulu; detail konektor TikTok perlu diputuskan sebelum integrasi live.
