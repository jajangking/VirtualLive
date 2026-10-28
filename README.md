# VirtualLive — Quiz Arena

Kuis pengetahuan umum otomatis untuk tampilan live. Setiap soal menampilkan pilihan A–D; timer dan jumlah soal per babak dapat diatur (default 30 detik dan 10 soal). Jawaban benar pertama mendapat 1 poin, yang terakumulasi sepanjang babak. Setelah jumlah soal tercapai, babak berhenti dan menampilkan juara; moderator memulai babak baru secara manual. Papan skor dan setelan tersimpan di `localStorage` browser host.

## Jalankan lokal

Butuh Node.js 22+, npm, dan Python 3 dengan dukungan `venv` (dependency `got@15` mensyaratkan Node.js 22+):

```bash
npm ci
python3 -m venv .venv-edge-tts
.venv-edge-tts/bin/python -m pip install -r requirements-edge-tts.txt
npm start
```

Buka `http://localhost:3000`. Server mendengarkan di `0.0.0.0`, jadi bisa diproxy oleh hosting/VPS di port 3000. Secara default konektor TikTok **dinonaktifkan**; simulator komentar lokal tetap dapat digunakan.

Untuk mengaktifkan listener LIVE publik `@disepillya`:

```bash
TIKTOK_BRIDGE_ENABLED=true TIKTOK_USERNAME=disepillya npm start
```

Jangan set `TIKTOK_BRIDGE_ENABLED=true` jika tidak ingin server membuat koneksi LIVE. Status di UI membedakan bridge nonaktif, mencoba koneksi, menunggu LIVE, error, dan tersambung. Label tersambung hanya muncul setelah konektor melaporkan koneksi berhasil.

## Tampilan live dan uji simulator

- Mode dashboard: buka `/`. Susunan satu layar: nama acara, panel ranking, pertanyaan/pilihan, timer, dan panel jawaban LIVE berbentuk kotak di kanan bawah yang bisa diciutkan. Pada layar sempit, panel ditumpuk agar tidak saling menutupi. Komentar non-jawaban dan jawaban kedua dari peserta yang sama pada ronde itu tidak ditampilkan/diproses; jawaban pertama yang dipilih mengunci peserta sampai ronde berikutnya.
- Mode siaran: buka `/?live=1` sebagai browser source portrait. Tata letak mengikuti wireframe portrait terbaru: judul beserta kontrol audio/fullscreen dan papan skor sejajar di atas; kuis melebar di tengah; jawaban LIVE serta panel moderator sejajar di bawahnya; papan donatur gift berada di kanan bawah. Zona diukur dengan unit viewport agar proporsinya mengikuti tinggi layar. Peringkat donatur mencatat gift LIVE yang diterima selama sesi; gift simulator tidak dihitung.
- Kontrol moderator: tombol jam `◷` mengatur timer tiap soal (10–180 detik) dan jumlah soal per babak (1–20, default 10). Jika belum ada jawaban pada soal berjalan, timer baru langsung menyesuaikan sisa waktu; jumlah soal berlaku mulai babak berikutnya. Poin (+1 per jawaban benar pertama) diakumulasikan sepanjang babak. Setelah N soal, babak berhenti dan juara tampil; tekan `BABAK BARU` untuk mengarsipkan podium/hadiah Juara 1, reset papan aktif, lalu lanjut. Riwayat mencatat skor dan jumlah soal.
- Generator AI: pada dashboard, tombol `SOAL AI` menyiapkan satu batch soal A–D untuk babak berikutnya. Tentukan kategori dan tingkat kesulitan; jumlah mengikuti setelan per babak. Batch tidak mengganggu babak yang sedang jalan, dan mulai dipakai setelah moderator menekan `BABAK BARU`. Membutuhkan Groq API key. Soal buatan AI dapat mengandung kekeliruan faktual; moderator sebaiknya memeriksa kategori dan jawaban sebelum ditayangkan.
- Editor tata letak: tekan tombol `⠿` pada mode siaran atau buka `/?live=1&edit=1`. Gunakan grip bertitik untuk menggeser dan sudut kanan-bawah untuk mengubah ukuran panel, termasuk preview panel info ticker; layout tersimpan di browser. Tekan `RESET` untuk kembali ke susunan awal atau `SELESAI` untuk keluar dari mode edit.
- Untuk mencoba simulator, kirim `Budi: A`, `@Budi: jawab A`, atau `jawab A` pada panel chat. Tombol A–D juga mensimulasikan penonton `KAMU`; tombol 🎁 menguji animasi gift.
- Tombol `LAYAR PENUH` memperluas kuis ke layar penuh. Tombol `AUDIO OFF` mengaktifkan BGM sintetis orisinal bernuansa kuis tegang dan efek suara; browser meminta klik pengguna sebelum audio bisa diputar. Musik ini terinspirasi suasana acara kuis, bukan salinan musik Who Wants to Be a Millionaire.
- Event gift LIVE TikTok menampilkan reaksi animasi dan pesan di chat; suara gift diputar jika audio diaktifkan. Event penonton bergabung, follow, dan gift juga dapat memicu sapaan AI host.
- AI host tampil pada mode siaran sebagai avatar animasi. Tekan `SUARA OFF` → `SUARA ON` dari panel moderator terlebih dahulu agar browser mengizinkan pemutaran otomatis (di OBS, gunakan `Interact` pada Browser Source). Pastikan audio Browser Source ikut masuk ke mixer/siaran OBS. Host membacakan sapaan Groq saat ada event LIVE; moderator dapat mengetik ucapan di kolom host lalu menekan `UCAPKAN`. Sapaan otomatis dibatasi/dideduplikasi agar tidak terlalu sering. Ucapan moderator tetap dapat dipakai tanpa konfigurasi Groq.
- AI host membuat teks bahasa Indonesia lewat Groq Chat Completions. Masukkan key melalui tombol `GROQ AI` di dashboard (bukan mode siaran); key dikirim ke server, tidak dikembalikan ke browser, dan disimpan dalam file privat server dengan izin terbatas. Key bertahan saat restart/update. Gunakan HTTPS dan masukkan key hanya pada dashboard tepercaya; dashboard belum memiliki login. Jika `GROQ_API_KEY` sudah tersedia di environment server, konfigurasi environment menjadi read-only dari UI. Jangan pernah memasukkan key ke source code atau commit. Opsional: `GROQ_MODEL` (default `llama-3.1-8b-instant`).
- TTS memakai paket Python `edge-tts` dengan voice default `en-US-BrianMultilingualNeural` (Brian Multilingual, US). Audio dibuat server-side lalu diputar setelah moderator mengaktifkan suara; voice multilingual membaca teks host berbahasa Indonesia. VPS harus bisa membuat koneksi keluar HTTPS/WebSocket (port 443) ke layanan Edge TTS. Layanan dapat berubah atau menolak koneksi. Tidak diperlukan API key TTS. Jika server melaporkan modul belum terpasang setelah update, jalankan `sudo bash /opt/virtuallive/deploy/install-edge-tts.sh && sudo systemctl restart virtuallive.service` (pasang paket OS `python3-venv` jika diminta). Opsional: `EDGE_TTS_VOICE` untuk mengganti voice; `EDGE_TTS_PYTHON` untuk memilih interpreter Python.
- Alternatif opsional untuk admin: konfigurasi `GROQ_API_KEY` lewat `sudo systemctl edit virtuallive.service` (drop-in privat), lalu `sudo systemctl daemon-reload && sudo systemctl restart virtuallive.service`. Jika environment key tersedia, pengaturan UI menjadi read-only. Endpoint AI/TTS memvalidasi input, origin, dan membatasi permintaan.
- Soal di dalam babak berganti otomatis sesudah timer dan masa hasil selesai. Pada soal terakhir yang disetel, aplikasi menampilkan hasil akhir dan menunggu moderator memulai babak berikutnya.

Bank lokal berisi 20 pertanyaan pengetahuan umum yang diacak. Generator Groq dapat membuat batch baru dengan kategori dan kesulitan pilihan. Pemenang per soal adalah komentar benar pertama yang diterima; satu soal memberi maksimal satu poin, dan poin terakumulasi selama babak.

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
