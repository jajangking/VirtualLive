# VirtualLive — Quiz Arena

Kuis pengetahuan umum otomatis untuk tampilan live. Setiap soal menampilkan pilihan A–D dan timer 30 detik. Komentar dengan jawaban benar pertama dicatat selama timer berjalan; saat waktu habis, barulah pemenang dan jawabannya ditampilkan. Setelah 7 detik hasil, soal berikutnya mulai otomatis. Papan skor tersimpan di `localStorage` browser host dan bertahan antarsoal serta setelah reload.

## Jalankan lokal

Butuh Node.js 22+ dan npm (dependency tree yang terpasang memakai `got@15`, yang mensyaratkan Node.js 22+):

```bash
npm ci
npm start
```

Buka `http://localhost:3000`. Server mendengarkan di `0.0.0.0`, jadi bisa diproxy oleh hosting/VPS di port 3000. Secara default konektor TikTok **dinonaktifkan**; simulator komentar lokal tetap dapat digunakan.

Untuk mengaktifkan listener LIVE publik `@disepillya`:

```bash
TIKTOK_BRIDGE_ENABLED=true TIKTOK_USERNAME=disepillya npm start
```

Jangan set `TIKTOK_BRIDGE_ENABLED=true` jika tidak ingin server membuat koneksi LIVE. Status di UI membedakan bridge nonaktif, mencoba koneksi, menunggu LIVE, error, dan tersambung. Label tersambung hanya muncul setelah konektor melaporkan koneksi berhasil.

## Tampilan live dan uji simulator

- Mode dashboard: buka `/` untuk melihat soal, status listener, chat, dan simulator komentar. Layout desktop/mobile dipadatkan agar muat satu viewport; pada layar sempit papan peringkat/cara main disembunyikan.
- Mode siaran bersih: buka `/?live=1` sebagai browser source portrait; chat/simulator disembunyikan dan layout memberi buffer atas, kanan, dan bawah untuk UI LIVE TikTok. Safe area TikTok tidak punya satu ukuran tetap untuk semua perangkat/format, jadi preview di aplikasi tetap perlu dicek.
- Untuk mencoba simulator, kirim `Budi: A`, `@Budi: jawab A`, atau `jawab A` pada panel chat. Tombol A–D juga mensimulasikan penonton `KAMU`; tombol 🎁 menguji animasi gift.
- Tombol `LAYAR PENUH` memperluas kuis ke layar penuh. Tombol `AUDIO OFF` mengaktifkan BGM sintetis orisinal bernuansa kuis tegang dan efek suara; browser meminta klik pengguna sebelum audio bisa diputar. Musik ini terinspirasi suasana acara kuis, bukan salinan musik Who Wants to Be a Millionaire.
- Event gift LIVE TikTok menampilkan reaksi animasi dan pesan di chat; suara gift diputar jika audio diaktifkan.
- Tidak perlu menekan tombol untuk mengganti soal. Timer berjalan otomatis, hasil muncul setelah timer selesai, lalu soal baru dimulai sendiri.

Bank 20 pertanyaan pengetahuan umum diacak dan diulang setelah semua pertanyaan terpakai. Pemenang adalah komentar benar pertama yang diterima pada sesi soal itu; satu soal memberi maksimal satu poin.

## Listener komentar TikTok: status dan batasan

Server memakai [`tiktok-live-connector`](https://github.com/zerodytrash/TikTok-Live-Connector) versi 2.5.0 untuk membaca komentar dari LIVE publik. **Ini library pihak ketiga yang tidak resmi, reverse-engineered, dan bukan API/SDK resmi atau integrasi yang disetujui TikTok.** Koneksi dapat berhenti bekerja jika implementasi Webcast TikTok berubah; ketersediaan stream dan koneksi tidak dijamin. Bridge hanya mencoba menyambung ke username yang dikonfigurasi dan menunggu saat akun tidak sedang LIVE. Uji simulator lokal tidak membuktikan koneksi TikTok berfungsi.

Komentar disalurkan dari server ke browser melalui Server-Sent Events (`/api/events`) lalu ke hook kuis `window.VirtualLiveQuiz.receiveComment(username, comment)`. Endpoint `/api/status` dan indikator UI melaporkan status koneksi. Tidak ada cookie atau kredensial TikTok yang disimpan di frontend.

Paket `tiktok-live-connector@2.5.0` sendiri menyatakan Node.js 20+, tetapi aplikasi ini menetapkan Node.js 22+ karena dependency `got@15` pada lockfile mensyaratkan Node.js 22+. Paket connector berlisensi **AGPL-3.0-only**. Tinjau atribusi dan kewajiban lisensi yang berlaku sebelum mendistribusikan atau menyediakan aplikasi ini sebagai layanan. Kode aplikasi ini tidak boleh digambarkan sebagai API resmi TikTok.

Skor saat ini tersimpan hanya pada browser host; untuk scoreboard bersama lintas perangkat, pindahkan penyimpanan ke backend/database.

## Deploy otomatis ke VPS Instabox

Repo ini menyiapkan deployment pada branch `arena/e041ca7d-virtuallive`. Di VPS Debian/Ubuntu dengan **Git, Node.js 22+, npm, dan systemd**, jalankan dari SSH/console VPS:

```bash
git clone --depth 1 --branch arena/e041ca7d-virtuallive https://github.com/jajangking/VirtualLive.git /tmp/virtuallive-bootstrap
sudo bash /tmp/virtuallive-bootstrap/deploy/deploy-vps.sh
```

Script `deploy-vps.sh` adalah entry point tunggal: jika `/opt/virtuallive` belum ada, script meng-clone branch; jika checkout sudah ada, script mengambil pembaruan dan me-restart service. Jika service belum dipasang, script menjalankan installer lengkap. Script menolak menimpa direktori non-Git yang berisi file. Untuk menjalankan sync manual pada VPS yang sudah terpasang:

```bash
sudo bash /opt/virtuallive/deploy/deploy-vps.sh
```

Setup memasang dependency dari lockfile, mengaktifkan listener tidak resmi untuk `@disepillya` melalui konfigurasi systemd (`TIKTOK_BRIDGE_ENABLED=true`), menjalankan server di port 3000, lalu membuat timer yang memeriksa branch tersebut setiap 60 detik. Saat ada commit baru di branch, VPS mengambil commit itu dan me-restart service otomatis. Cek status dengan:

```bash
sudo systemctl status virtuallive.service
sudo systemctl status virtuallive-update.timer
sudo journalctl -u virtuallive.service -n 50 --no-pager
```

Pastikan port 3000 tersedia sebelum setup. Jika ada service lama yang masih menggunakan port itu, hentikan service tersebut melalui systemd/console VPS terlebih dahulu; setup sengaja tidak membunuh proses tak dikenal. Repo saat ini publik sehingga VPS dapat menarik branch melalui HTTPS tanpa token.
