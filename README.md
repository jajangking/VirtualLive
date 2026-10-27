# VirtualLive — Quiz Arena

Kuis pengetahuan umum otomatis untuk tampilan live. Setiap soal menampilkan pilihan A–D dan timer 30 detik. Komentar dengan jawaban benar pertama dicatat selama timer berjalan; saat waktu habis, barulah pemenang dan jawabannya ditampilkan. Setelah 7 detik hasil, soal berikutnya mulai otomatis. Papan skor tersimpan di `localStorage` browser host dan bertahan antarsoal serta setelah reload.

## Jalankan lokal

Butuh Node.js 18+, tanpa dependency eksternal:

```bash
npm start
```

Buka `http://localhost:3000`. Server mendengarkan di `0.0.0.0`, jadi bisa diproxy oleh hosting/VPS di port 3000.

## Tampilan live dan uji simulator

- Mode dashboard: buka `/` untuk melihat soal, papan skor, dan simulator komentar.
- Mode siaran bersih: buka `/?live=1` sebagai browser source/layar portrait; panel simulator disembunyikan, sehingga yang terlihat hanya kuis dan papan skor.
- Untuk mencoba simulator, kirim `Budi: A`, `@Budi: jawab A`, atau `jawab A` pada panel chat. Tombol A–D juga mensimulasikan penonton `KAMU`.
- Tidak perlu menekan tombol untuk mengganti soal. Timer berjalan otomatis, hasil muncul setelah timer selesai, lalu soal baru dimulai sendiri.

Bank 20 pertanyaan pengetahuan umum diacak dan diulang setelah semua pertanyaan terpakai. Pemenang adalah komentar benar pertama yang diterima pada sesi soal itu; satu soal memberi maksimal satu poin.

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

Pastikan port 3000 tersedia sebelum setup. Jika ada service lama yang masih menggunakan port itu, hentikan service tersebut melalui systemd/console VPS terlebih dahulu; setup sengaja tidak membunuh proses tak dikenal. Repo saat ini publik sehingga VPS dapat menarik branch melalui HTTPS tanpa token.

## Integrasi komentar TikTok

Alur soal, timer, pengumuman hasil, pergantian soal, dan pembaruan skor berjalan otomatis. Namun komentar pada prototype masih simulator lokal—belum tersambung ke komentar TikTok sungguhan. `window.VirtualLiveQuiz.receiveComment(username, comment)` adalah hook untuk adapter event TikTok. Integrasi berikutnya perlu service backend yang menerima komentar secara berurutan dan mengirimkannya ke browser melalui WebSocket/SSE. Skor di prototype tersimpan pada browser host; untuk penyimpanan yang dibagikan lintas perangkat, pindahkan scoreboard ke backend/database. Jangan letakkan cookie atau credential TikTok di frontend.
