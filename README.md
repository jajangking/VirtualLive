# VirtualLive — Quiz Arena

Prototype kuis pengetahuan umum untuk TikTok Live. Pertanyaan ditampilkan bersama pilihan A–D; penonton yang pertama menjawab benar mendapat satu poin. Papan skor tersimpan di `localStorage`, jadi nilainya bertahan saat soal berganti dan halaman dimuat ulang di browser/perangkat yang sama.

## Jalankan lokal

Butuh Node.js 18+, tanpa dependency eksternal:

```bash
npm start
```

Buka `http://localhost:3000`. Server mendengarkan di `0.0.0.0`, jadi bisa diproxy oleh hosting/VPS di port 3000. Alternatif untuk preview statis: `python3 -m http.server 4173 --bind 0.0.0.0`.

## Cara mencoba kuis

- Komentar `A`, `B`, `C`, atau `D` untuk menjawab.
- Di simulator, gunakan format `Budi: A`, `@Budi: jawab A`, atau `jawab A` untuk menguji beberapa nama penonton.
- Gunakan tombol huruf A–D di panel chat sebagai simulasi cepat.
- Tombol **Soal Berikutnya** mengganti soal tanpa menghapus papan skor.
- **Reset Skor** menghapus papan skor yang tersimpan di browser tersebut.

Pemenang dikunci berdasarkan jawaban benar pertama yang diterima untuk tiap soal; maksimal satu poin per soal. Bank soal umum akan diacak dan diulang setelah seluruh soal telah digunakan.

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

## Integrasi TikTok Live

Chat pada prototype masih simulator lokal—belum menerima komentar TikTok sungguhan. `window.VirtualLiveQuiz.receiveComment(username, comment)` adalah hook frontend untuk sebuah adapter event. Integrasi live berikutnya perlu menerima event komentar secara berurutan di backend, memvalidasi/normalisasi nama dan jawaban, lalu mengirimkannya ke halaman lewat WebSocket/SSE. Untuk live sungguhan, scoreboard sebaiknya dipindahkan dari `localStorage` ke backend/database agar nilainya sama di semua browser/perangkat. Jangan meletakkan cookie atau credential TikTok di frontend.
