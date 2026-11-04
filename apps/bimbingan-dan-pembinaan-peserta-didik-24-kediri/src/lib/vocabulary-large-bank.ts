/**
 * Bank Kosakata Raksasa SKP Sekolah Rakyat Terintegrasi 1 Kab. Kediri
 * Berisi 5.250+ variasi kosa kata & frasa kegiatan realistis:
 * - RHK 1: 1.050 kosa kata kegiatan akademik & bimbingan belajar
 * - RHK 2: 1.050 kosa kata kemandirian, kebersihan & tata graha asrama
 * - RHK 3: 1.050 kosa kata pendampingan harian, makan & ibadah asrama
 * - RHK 4: 1.050 kosa kata spiritual, emosional, kesehatan & kedisiplinan
 * - RHK 5, 6, 7: 1.050 kosa kata kebutuhan khusus, kompetensi & tugas tambahan
 */

export interface CompactVocabItem {
  k: string;       // keyword
  a?: string[];    // aliases
  r: string;       // rhk
  t?: string;      // timeContext
  d: string;       // deskripsi resmi
}

function buildLargeVocabularyBank(): CompactVocabItem[] {
  const items: CompactVocabItem[] = [];

  // ==========================================
  // RHK 1: Bimbingan dan Pengajaran Peserta Didik (1,050 items)
  // ==========================================
  const rhk1Subjects = [
    { name: 'Matematika', category: 'sains', topics: ['aljabar', 'geometri', 'aritmatika', 'persamaan linear', 'statistika', 'trigonometri', 'pecahan', 'kalkulus dasar', 'peluang', 'vektor'] },
    { name: 'Fisika', category: 'sains', topics: ['hukum newton', 'gerak lurus', 'termodinamika', 'optik', 'listrik dinamis', 'fluida', 'gelombang dan bunyi', 'energi kinetik', 'tekanan', 'gravitasi'] },
    { name: 'Kimia', category: 'sains', topics: ['tabel periodik', 'ikatan kimia', 'larutan asam basa', 'stoikiometri', 'reaksi redoks', 'struktur atom', 'termokimia', 'laju reaksi', 'larutan elektrolit', 'senyawa hidrokarbon'] },
    { name: 'Biologi', category: 'sains', topics: ['sel dan jaringan', 'sistem pencernaan', 'sistem peredaran darah', 'fotosintesis', 'ekosistem', 'genetika', 'sistem ekskresi', 'klasifikasi makhluk hidup', 'mikrobiologi', 'keanekaragaman hayati'] },
    { name: 'Bahasa Indonesia', category: 'bahasa', topics: ['teks eksplanasi', 'teks narasi', 'tata kalimat baku', 'membaca puisi', 'menulis cerpen', 'membuat rangkuman', 'analisis novel', 'tata ejaan PUEBI', 'pidato persuasif', 'menulis artikel opini'] },
    { name: 'Bahasa Inggris', category: 'bahasa', topics: ['grammar tenses', 'vocabulary building', 'listening comprehension', 'reading text', 'speaking practice', 'writing essay', 'daily conversation', 'dialogue speaking', 'english storytelling', 'irregular verbs'] },
    { name: 'Bahasa Arab', category: 'bahasa', topics: ['nahwu watsorof', 'mufradat harian', 'qiraah', 'istima', 'muhadatsah asrama', 'insya', 'tashrif fiil', 'tata bahasa arab dasar', 'percakapan bahasa arab', 'terjemah kitab dasar'] },
    { name: 'Ilmu Pengetahuan Sosial (IPS)', category: 'sosial', topics: ['sejarah nusantara', 'kerajaan nusantara', 'geografi indonesia', 'peta dan pemetaan', 'kegiatan ekonomi', 'interaksi sosial', 'keberagaman budaya', 'perang kemerdekaan', 'kelembagaan sosial', 'perubahan sosial'] },
    { name: 'Ilmu Pengetahuan Alam (IPA)', category: 'sains', topics: ['sistem tata surya', 'energi alternatif', 'rantai makanan', 'siklus air', 'sifat cahaya', 'perkembangbiakan hewan', 'magnet dan listrik', 'tumbuhan berbiji', 'suhu dan kalor', 'ekologi lingkungan'] },
    { name: 'Pendidikan Pancasila (PPKn)', category: 'sosial', topics: ['nilai-nilai pancasila', 'uud 1945', 'norma dan hukum', 'hak dan kewajiban warga negara', 'kebhinekaan tunggal ika', 'demokrasi indonesia', 'wawasan nusantara', 'keadilan sosial', 'sistem pemerintahan', 'persatuan bangsa'] },
    { name: 'Sejarah Indonesia', category: 'sosial', topics: ['masa praaksara', 'perjuangan diplomasi', 'proklamasi kemerdekaan', 'pahlawan nasional', 'pergerakan nasional', 'sumpah pemuda', 'kolonialisme belanda', 'masa pendudukan jepang', 'revolusi kemerdekaan', 'orde reformasi'] },
    { name: 'Geografi', category: 'sosial', topics: ['lapisan litosfer', 'lapisan atmosfer', 'dinamika kependudukan', 'persebaran flora fauna', 'bencana alam mitigasi', 'sumber daya alam', 'iklim dan cuaca', 'penginderaan jauh', 'perwilayahan dan tata ruang', 'hidrologi perairan'] },
    { name: 'Ekonomi', category: 'sosial', topics: ['manajemen keuangan', 'konsep kelangkaan', 'pasar dan harga', 'lembaga keuangan', 'koperasi sekolah', 'pendapatan nasional', 'inflasi dan indeks harga', 'kebijakan moneter', 'perdagangan internasional', 'kewirausahaan siswa'] },
    { name: 'Sosiologi', category: 'sosial', topics: ['kelompok sosial', 'konflik dan resolusi', 'integrasi sosial', 'stratifikasi sosial', 'mobilitas sosial', 'penyimpangan sosial', 'globalisasi budaya', 'penelitian sosial dasar', 'lembaga keluarga', 'interaksi asrama'] },
    { name: 'Teknologi Informasi & Komputer (TIK)', category: 'teknologi', topics: ['penggunaan laptop belajar', 'microsoft word dokumen', 'microsoft excel tabel', 'powerpoint presentasi', 'desain canva materi', 'pemrograman dasar coding', 'keamanan internet sehat', 'pengetikan cepat 10 jari', 'browsing referensi tugas', 'manajemen file digital'] },
    { name: 'Literasi & Minat Baca', category: 'literasi', topics: ['kunjungan perpustakaan', 'membaca buku fiksi', 'membaca buku non-fiksi', 'bedah buku asrama', 'membuat resume bacaan', 'pojok baca kamar', 'kliping berita edukatif', 'literasi sains dan berita', 'menulis jurnal harian', 'membaca ensiklopedia'] },
    { name: 'Seni Budaya & Keterampilan', category: 'kreatif', topics: ['menggambar bentuk', 'melukis kaligrafi', 'prakarya bahan bekas', 'seni musik vokal', 'kerajinan tangan anyaman', 'seni teater monolog', 'desain poster edukatif', 'seni musik angklung', 'prakarya origami', 'seni grafis sederhana'] },
    { name: 'Pendidikan Jasmani & Teori Olahraga', category: 'olahraga', topics: ['teori kebugaran jasmani', 'analisis strategi futsal', 'peraturan bulutangkis', 'teknik dasar renang', 'gizi atlet dan kesehatan', 'pertolongan pertama p3k', 'peraturan bola voli', 'senam lantai dasar', 'pola hidup sehat bugar', 'atletik lari estafet'] },
    { name: 'Pendidikan Agama Islam (PAI)', category: 'keagamaan', topics: ['fiqih ibadah sholat', 'akhlak terpuji mahmudah', 'sejarah tarikh islam', 'hukum tajwid nun mati', 'fiqih thaharah bersuci', 'akidah rukun iman', 'adab kepada guru dan teman', 'fiqih zakat dan sedekah', 'mengenal asmaul husna', 'keutamaan amar maruf'] },
    { name: 'Karya Ilmiah & Olimpiade (KIR)', category: 'riset', topics: ['metodologi riset sederhana', 'penulisan proposal karya ilmiah', 'persiapan olimpiade sains osn', 'bedah soal kompetisi sains', 'eksperimen mini asrama', 'pembuatan karya daur ulang', 'presentasi hasil riset', 'analisis data penelitian', 'kajian literatur ilmiah', 'pengamatan lapangan lingkungan'] },
  ];

  const rhk1Formats = [
    { prefix: 'bimbingan belajar', time: 'malam', action: 'Mendampingi sesi bimbingan belajar malam peserta didik pada materi' },
    { prefix: 'review materi', time: 'malam', action: 'Membimbing dan mereview pemahaman konsep peserta didik terkait materi' },
    { prefix: 'pengerjaan tugas', time: 'siang', action: 'Mendampingi peserta didik dalam menyelesaikan tugas mandiri sekolah materi' },
    { prefix: 'belajar mandiri', time: 'malam', action: 'Mengawasi dan memfasilitasi kegiatan belajar mandiri santri dalam mempelajari' },
    { prefix: 'diskusi kelompok', time: 'sore', action: 'Mendampingi forum diskusi belajar kelompok peserta didik membahas topik' },
    { prefix: 'remedial bimbingan', time: 'sore', action: 'Memberikan asistensi dan penguatan bimbingan remedial bagi siswa pada materi' },
    { prefix: 'pengayaan materi', time: 'malam', action: 'Mendampingi program pengayaan materi akademik lanjutan peserta didik mengenai' },
    { prefix: 'persiapan ulangan', time: 'malam', action: 'Mendampingi persiapan belajar intensif peserta didik menghadapi ulangan harian' },
    { prefix: 'latihan soal', time: 'siang', action: 'Membimbing pengerjaan latihan soal dan pembahasan materi pembelajaran' },
    { prefix: 'praktikum & tugas', time: 'sore', action: 'Mendampingi penyelesaian laporan praktikum dan tugas sekolah bidang' },
  ];

  let c1 = 0;
  for (const sub of rhk1Subjects) {
    for (const top of sub.topics) {
      for (const fmt of rhk1Formats) {
        if (c1 >= 1050) break;
        items.push({
          k: `${fmt.prefix} ${top} ${sub.name.toLowerCase()}`,
          a: [`belajar ${top}`, `${fmt.prefix} ${top}`, `${top} ${sub.name.toLowerCase()}`, `tugas ${top}`],
          r: 'RHK 1',
          t: fmt.time,
          d: `${fmt.action} ${top} (${sub.name}) di ruang belajar asrama Sekolah Rakyat Terintegrasi 1 Kab. Kediri, memastikan setiap peserta didik memahami pokok bahasan dengan baik dan bersemangat.`,
        });
        c1++;
      }
    }
  }

  // ==========================================
  // RHK 2: Kemandirian Peserta Didik (1,050 items)
  // ==========================================
  const rhk2Areas = [
    { area: 'Kamar Tidur Asrama', items: ['merapikan ranjang tidur', 'melipat selimut kasur', 'mengganti sprei bantal', 'membersihkan kolong dipan', 'mengelap jendela kamar', 'menyapu lantai kamar', 'mengepel lantai kamar', 'menata rak buku kamar', 'membersihkan sarang laba-laba', 'menata ventilasi kamar', 'membersihkan saklar lampu', 'merapikan kabel charger aman', 'mengelap pintu kamar asrama', 'mengatur sirkulasi udara kamar', 'menata sandal depan kamar'] },
    { area: 'Pakaian & Laundry', items: ['mencuci pakaian seragam putih abu', 'mencuci seragam batik asrama', 'mencuci seragam olahraga sekolah', 'mencuci pakaian dalam mandiri', 'mencuci kaos harian santri', 'mencuci celana panjang seragam', 'mencuci kaos kaki sekolah', 'membilas cucian pakaian bersih', 'memeras pakaian dengan benar', 'menggunakan ember cucian tertib', 'menjemur pakaian di gantungan luar', 'menjemur handuk di tali jemuran', 'mengangkat jemuran pakaian kering', 'melipat baju kaos santri rapi', 'menyetrika seragam dinas sekolah', 'menyetrika celana seragam rapi', 'menata pakaian dalam lemari baju', 'menggantung pakaian pada hanger', 'memisahkan pakaian kotor dan bersih', 'mengatur keranjang cucian laundry'] },
    { area: 'Alat Makan & Dapur', items: ['mencuci piring makan sendiri', 'mencuci sendok dan garpu makan', 'mencuci gelas minum asrama', 'mencuci mangkok sayur asrama', 'mencuci nampan makan ompreng', 'mengelap meja makan setelah makan', 'membersihkan wastafel cuci piring', 'membuang sisa makanan ke tong sampah', 'menata piring di rak pengering', 'merapikan botol tumbler minum', 'memasak mie instan secara tertib', 'membuat minuman teh hangat mandiri', 'membuat minuman susu pagi mandiri', 'menggoreng telur mandiri di dapur', 'memotong buah dan sayur mandiri'] },
    { area: 'Kamar Mandi & Sanitasi', items: ['menyikat lantai kamar mandi asrama', 'menguras bak mandi penampungan air', 'membersihkan kloset wc duduk dan jongkok', 'mengelap dinding keramik kamar mandi', 'membersihkan gayung mandi asrama', 'membersihkan saringan pembuangan air', 'merapikan tempat sabun dan sampo', 'membersihkan cermin wastafel kamar mandi', 'membuang sampah tisu kamar mandi', 'mengepel area luar pintu kamar mandi'] },
    { area: 'Alas Kaki & Sepatu', items: ['mencuci sepatu sekolah bertali', 'menyemir sepatu pantofel hitam', 'mengeringkan sepatu di tempat jemur', 'membersihkan sandal jepit asrama', 'menata sepatu rapi di rak asrama', 'membersihkan sol sepatu dari lumpur', 'mengganti tali sepatu yang kotor', 'merawat kaos kaki agar tidak lembab'] },
    { area: 'Lingkungan & Fasilitas Bersama', items: ['menyapu lorong asrama lantai 1', 'menyapu lorong asrama lantai 2', 'mengepel selasar koridor asrama', 'membersihkan teras depan gedung asrama', 'memilah sampah organik dan anorganik', 'membuang kantong sampah ke tps luar', 'membersihkan kaca jendela gedung asrama', 'menyiram tanaman taman depan asrama', 'merapikan kursi dan meja aula asrama', 'membersihkan papan pengumuman asrama'] },
    { area: 'Manajemen Diri & Barang Pribadi', items: ['menata lemari pakaian pribadi rapi', 'mengunci loker barang berharga', 'merapikan tas sekolah dan ransel', 'menyortir buku pelajaran sesuai jadwal', 'mengecek perlengkapan tulis pensil pena', 'menggunting kuku tangan dan kaki', 'merapikan rambut sesuai standar kerapian', 'mencuci mukena perlengkapan sholat', 'mencuci sarung dan peci santri', 'merapikan sajadah sholat pribadi'] }
  ];

  const rhk2Actions = [
    { prefix: 'piket', time: 'pagi', action: 'Mendampingi dan membimbing peserta didik melaksanakan piket kemandirian' },
    { prefix: 'pelatihan kemandirian', time: 'sore', action: 'Membimbing dan melatih kemandirian peserta didik dalam' },
    { prefix: 'pemeriksaan kebersihan', time: 'pagi', action: 'Memeriksa dan mengevaluasi hasil ketertiban kemandirian santri dalam hal' },
    { prefix: 'pembiasaan disiplin', time: 'pagi', action: 'Membiasakan budaya hidup bersih dan mandiri peserta didik melalui kegiatan' },
    { prefix: 'asistensi kemandirian', time: 'sore', action: 'Memberikan bimbingan langsung kepada peserta didik untuk secara tertib' },
    { prefix: 'gotong royong', time: 'pagi', action: 'Mendampingi kerja bakti dan gotong royong peserta didik dalam aktivitas' },
    { prefix: 'inspeksi kebersihan', time: 'siang', action: 'Melakukan monitoring dan pendampingan kemandirian santri terkait' },
    { prefix: 'evaluasi kemandirian', time: 'sore', action: 'Mendampingi proses penuntasan tanggung jawab kemandirian peserta didik dalam' },
    { prefix: 'pembinaan disiplin', time: 'sore', action: 'Membina kedisiplinan dan tanggung jawab personal peserta didik saat' },
    { prefix: 'pendampingan rutin', time: 'pagi', action: 'Mendampingi pelaksanaan pembiasaan kemandirian harian peserta didik dalam' },
    { prefix: 'pemberdayaan santri', time: 'sore', action: 'Memberdayakan santri dalam mengasah kemandirian hidup melalui' },
    { prefix: 'arahan kebersihan', time: 'pagi', action: 'Memberikan arahan dan bimbingan teknis kebersihan asrama dalam hal' },
    { prefix: 'kontrol kemandirian', time: 'siang', action: 'Melakukan kontrol disiplin dan pengecekan kerapian mandiri terkait' },
    { prefix: 'bimbingan tata graha', time: 'pagi', action: 'Membimbing tata graha asrama dan ketertiban personal peserta didik dalam' },
    { prefix: 'pendampingan gotong royong', time: 'pagi', action: 'Mengkoordinasikan kerja bakti kemandirian peserta didik dalam rangka' }
  ];

  let c2 = 0;
  for (const grp of rhk2Areas) {
    for (const itm of grp.items) {
      for (const act of rhk2Actions) {
        if (c2 >= 1050) break;
        items.push({
          k: `${act.prefix} ${itm}`,
          a: [itm, `${act.prefix} ${grp.area.toLowerCase()}`, `mandiri ${itm}`],
          r: 'RHK 2',
          t: act.time,
          d: `${act.action} ${itm} di lingkungan ${grp.area} Sekolah Rakyat Terintegrasi 1 Kab. Kediri guna menanamkan karakter kemandirian dan rasa tanggung jawab.`,
        });
        c2++;
      }
    }
  }

  // ==========================================
  // RHK 3: Pendampingan, Motivasi & Rutinitas (1,050 items)
  // ==========================================
  const rhk3Routines = [
    { name: 'Bangun Tidur & Subuh', time: 'subuh', items: ['membangunkan tidur subuh santri', 'mengecek kehadiran santri di kamar saat subuh', 'mengajak santri segera berwudhu subuh', 'merapikan kasur saat bangun tidur', 'sholat subuh berjamaah di mushola', 'dzikir dan doa bersama ba\'da subuh', 'kultum subuh pembinaan karakter', 'tadarus subuh satu juz', 'membiasakan minum air putih setelah bangun tidur', 'mengecek kondisi fisik siswa di waktu fajar'] },
    { name: 'Persiapan Sekolah & Pagi', time: 'pagi', items: ['mengawasi antrean mandi pagi asrama', 'memeriksa kelengkapan seragam sekolah pagi', 'memeriksa kerapian dasi dan topi sekolah', 'memeriksa kartu pelajar dan name tag', 'mengawasi sarapan pagi di ruang makan', 'memastikan asupan gizi sarapan santri', 'mengingatkan adab dan doa sebelum makan pagi', 'merapikan tempat makan setelah sarapan pagi', 'apel pagi persiapan berangkat sekolah', 'pengecekan kehadiran sebelum menuju kelas', 'mendampingi jalan santri menuju gedung sekolah', 'mengantar peserta didik ke pintu gerbang sekolah'] },
    { name: 'Siang & Kepulangan Sekolah', time: 'siang', items: ['menyambut kedatangan siswa pulang sekolah', 'mengecek barang bawaan sepulang sekolah', 'mengarahkan ganti seragam sekolah ke baju asrama', 'menggantung seragam sekolah dengan rapi', 'sholat dzuhur berjamaah tepat waktu', 'mengawasi makan siang bersama di ruang makan', 'memastikan asupan nutrisi makan siang cukup', 'mengatur antrean makan siang yang tertib', 'mendampingi istirahat siang di kamar asrama', 'mengarahkan tidur siang sejenak untuk pemulihan tenaga', 'membangunkan siswa dari tidur siang tepat jam 14.30'] },
    { name: 'Sore & Aktivitas Asrama', time: 'sore', items: ['mendampingi sholat ashar berjamaah di mushola', 'wirid dan doa bersama ba\'da ashar', 'pembagian kudapan dan snack sore santri', 'memastikan hidrasi dan minum sore siswa', 'mengawasi aktivitas bebas terarah di sore hari', 'mendampingi jalan-jalan sore di halaman kampus', 'mengingatkan persiapan mandi sore santri', 'mengatur antrean tertib kamar mandi sore', 'memeriksa kerapian baju asrama sore santri', 'mengarahkan santri bersiap menuju mushola maghrib'] },
    { name: 'Malam & Ibadah Malam', time: 'malam', items: ['mendampingi sholat maghrib berjamaah mushola', 'membina kekhusyukan dan kerapian shaf sholat', 'tadarus al-quran bersama ba\'da maghrib', 'hafalan surat-surat pendek bersama santri', 'mendampingi makan malam bersama di ruang makan', 'menciptakan suasana makan malam penuh kekeluargaan', 'memastikan seluruh porsi makan malam dihabiskan', 'mendampingi sholat isya berjamaah di mushola', 'wirid dan doa bersama ba\'da isya', 'pengarahan malam sebelum jam belajar mandiri'] },
    { name: 'Belajar Wajib Malam & Tidur', time: 'malam', items: ['mengawasi jam wajib belajar malam di asrama', 'memastikan ketenangan saat belajar malam', 'memberikan motivasi semangat belajar kepada siswa', 'mengatur waktu istirahat malam santri', 'apel malam pengecekan kehadiran kamar santri', 'mengecek pintu dan jendela kamar terkunci aman', 'memadamkan lampu utama kamar tidur tepat jam 22.00', 'memimpin doa bersama sebelum tidur malam', 'memastikan seluruh siswa sudah berada di kasur', 'patroli malam keliling lorong asrama', 'memastikan keamanan dan keheningan asrama malam hari', 'mengecek siswa yang tidur tidak kedinginan'] },
    { name: 'Ibadah Sunnah & Upacara', time: 'fleksibel', items: ['mendampingi sholat dhuha berjamaah di mushola', 'membimbing pelaksanaan sholat tahajud malam', 'mendampingi pelaksanaan sholat witir malam', 'mengikuti upacara bendera hari senin', 'mengatur barisan upacara bendera santri', 'mendampingi apel kedisiplinan awal pekan', 'mendampingi senam pagi santri hari jumat', 'pembagian susu dan suplemen vitamin santri', 'mengawasi santri berkegiatan di hari libur asrama', 'menghangatkan suasana kebersamaan asrama akhir pekan'] }
  ];

  const rhk3Modifiers = [
    { prefix: 'pendampingan rutin', action: 'Melaksanakan tugas pendampingan rutin pada kegiatan' },
    { prefix: 'pengawasan disiplin', action: 'Mengawasi dengan penuh tanggung jawab jalannya aktivitas' },
    { prefix: 'bimbingan motivasi', action: 'Memberikan bimbingan, arahan, dan dorongan motivasi dalam pelaksanaan' },
    { prefix: 'fasilitasi asrama', action: 'Memfasilitasi dan mengkoordinasikan kelancaran kegiatan harian' },
    { prefix: 'monitoring kehadiran', action: 'Memantau presensi dan ketertiban seluruh peserta didik selama' },
    { prefix: 'pembiasaan karakter', action: 'Menanamkan pembiasaan karakter luhur dan disiplin melalui' },
    { prefix: 'kontrol ketertiban', action: 'Melakukan kontrol dan penertiban berkala pada pelaksanaan' },
    { prefix: 'asistensi harian', action: 'Mendampingi serta memberikan asistensi langsung pada' },
    { prefix: 'pengawalan santri', action: 'Melakukan pengawalan dan pendampingan intensif peserta didik dalam' },
    { prefix: 'arahan ketertiban', action: 'Memberikan pengarahan dan pendampingan terpadu santri saat' },
    { prefix: 'monitoring disiplin', action: 'Memastikan ketertiban dan kepatuhan norma asrama pada kegiatan' },
    { prefix: 'evaluasi rutinitas', action: 'Mengevaluasi dan mendampingi kelancaran pelaksanaan aktivitas' },
    { prefix: 'pendampingan terpadu', action: 'Melaksanakan pendampingan terpadu wali asuh dalam kegiatan' },
    { prefix: 'pembinaan kebiasaan', action: 'Membina kebiasaan positif dan budaya santun peserta didik dalam' },
    { prefix: 'pengawasan berkala', action: 'Melakukan pengawasan berkala dan pendampingan santri pada' }
  ];

  let c3 = 0;
  for (const cat of rhk3Routines) {
    for (const itm of cat.items) {
      for (const mod of rhk3Modifiers) {
        if (c3 >= 1050) break;
        items.push({
          k: `${mod.prefix} ${itm}`,
          a: [itm, `${mod.prefix} ${cat.name.toLowerCase()}`, `asrama ${itm}`],
          r: 'RHK 3',
          t: cat.time,
          d: `${mod.action} ${itm} di lingkungan asrama Sekolah Rakyat Terintegrasi 1 Kab. Kediri secara tertib, aman, dan penuh rasa kekeluargaan.`,
        });
        c3++;
      }
    }
  }

  // ==========================================
  // RHK 4: Bimbingan Spiritual dan Emosional (1,050 items)
  // ==========================================
  const rhk4Themes = [
    { name: 'Al-Quran & Tahfidz', items: ['tadarus al-quran ba\'da sholat maghrib', 'setoran hafalan surat juz 30', 'setoran hafalan surat pilihan al-waqiah', 'setoran hafalan surat yasin malam jumat', 'setoran hafalan surat al-mulk sebelum tidur', 'murajaah hafalan al-quran bersama teman', 'tahsin tilawah memperbaiki makharijul huruf', 'belajar tajwid hukum nun sukun dan tanwin', 'belajar hukum mad dan waqaf ibtida', 'menyimak bacaan al-quran santri satu persatu', 'pembacaan tartil asmaul husna pagi hari', 'bimbingan menghafal doa-doa harian mustajab'] },
    { name: 'Kajian Agama & Rohani', items: ['kajian keislaman adab penuntut ilmu', 'kajian fiqih thaharah dan bersuci', 'kultum malam jumat pembinaan hati', 'kultum subuh menumbuhkan rasa syukur', 'membaca ratibul haddad bersama malam jumat', 'pembacaan maulid diba bersama santri', 'istighosah doa bersama memohon kemudahan belajar', 'pembinaan tauhid rukun iman dalam keseharian', 'kajian sirah nabawiyah kisah keteladanan rasul', 'muhasabah diri dan renungan malam santri'] },
    { name: 'Konseling & Pendampingan Pribadi', items: ['konseling pribadi mendengarkan keluhan santri', 'konseling penyesuaian diri santri baru asrama', 'pendampingan siswa yang rindu keluarga homesick', 'mediasi perselisihan kesalahpahaman antar-teman', 'konseling motivasi santri yang malas belajar', 'pembinaan empati dan toleransi antar-kamar', 'konseling mengatasi rasa minder dan cemas', 'bimbingan pengelolaan emosi saat marah', 'pendampingan santri yang mengalami penurunan nilai', 'konseling pengembangan potensi bakat santri'] },
    { name: 'Kesehatan & Perawatan Santri Sakit', items: ['memeriksa suhu tubuh santri yang demam', 'memberikan kompres hangat santri demam', 'mengantar santri berobat ke UKS asrama', 'mengantar santri berobat ke puskesmas terdekat', 'membelikan obat sesuai resep tenaga medis', 'memberikan makanan bubur hangat santri sakit', 'memantau waktu minum obat santri sakit', 'merawat santri yang mengalami flu dan batuk', 'merawat santri yang mengalami sakit perut maag', 'mengganti plester luka ringan santri', 'membersihkan dan mensterilkan kamar isolasi santri', 'melaporkan kondisi kesehatan siswa ke orang tua'] },
    { name: 'Kedisiplinan & Tata Tertib', items: ['evaluasi kedisiplinan keterlambatan santri', 'pembinaan santri yang melanggar aturan tidur malam', 'pembinaan santri yang tidak mengikuti sholat jamaah', 'razia barang terlarang ponsel dan senjata tajam', 'pembinaan kepatuhan penggunaan bahasa asrama', 'pemberian sanksi edukatif membersihkan mushola', 'pemberian sanksi hafalan surat pendek', 'pencatatan buku pelanggaran tata tertib asrama', 'sidang kedisiplinan dewan asrama', 'pemberian apresiasi santri teladan disiplin'] },
    { name: 'Olahraga & Kesehatan Fisik Santri', items: ['senam kesegaran jasmani santri jumat pagi', 'olahraga lari keliling lapangan asrama', 'permainan futsal persahabatan antar-kamar', 'olahraga bola voli santri sore hari', 'olahraga bulutangkis di lapangan asrama', 'olahraga tenis meja santri sore hari', 'jalan sehat santri mengitari desa sabtu pagi', 'latihan push up dan sit up kebugaran jasmani', 'latihan peregangan otot setelah belajar', 'permainan tradisional gobak sodor asrama'] },
    { name: 'Keluarga & Kunjungan Orang Tua', items: ['menyambut orang tua pada hari kunjungan wali santri', 'mengatur lokasi temu ramah wali santri di aula', 'koordinasi laporan perkembangan anak ke wali santri', 'mendampingi santri video call dengan orang tua', 'menerima titipan barang dan makanan dari orang tua', 'memfasilitasi komunikasi santri dengan keluarga', 'bimbingan etika santun saat dikunjungi orang tua', 'evaluasi psikologis santri pasca-kunjungan keluarga'] }
  ];

  const rhk4Approaches = [
    { prefix: 'bimbingan spiritual', time: 'malam', action: 'Melaksanakan bimbingan spiritual dan penguatan rohani pada kegiatan' },
    { prefix: 'pendampingan emosional', time: 'siang', action: 'Memberikan bimbingan konseling dan pendampingan emosional dalam' },
    { prefix: 'pembinaan karakter', time: 'sore', action: 'Membina karakter budi pekerti dan ketenangan jiwa siswa melalui' },
    { prefix: 'konseling intensif', time: 'malam', action: 'Melakukan pendekatan konseling intensif dan bimbingan afektif terkait' },
    { prefix: 'asistensi rohani', time: 'subuh', action: 'Mendampingi serta memberikan penguatan keimanan santri dalam aktivitas' },
    { prefix: 'penanganan peduli', time: 'siang', action: 'Melakukan penanganan penuh kasih sayang dan kepedulian terhadap' },
    { prefix: 'edukasi disiplin', time: 'sore', action: 'Memberikan edukasi kedisiplinan dan pembinaan tata tertib melalui' },
    { prefix: 'fasilitasi kesehatan', time: 'pagi', action: 'Memfasilitasi penanganan kesehatan dan perawatan prima pada' },
    { prefix: 'pembinaan rohani', time: 'malam', action: 'Melaksanakan program pembinaan rohani islam secara rutin dalam hal' },
    { prefix: 'penguatan mental', time: 'sore', action: 'Memberikan dorongan mental, ketabahan, dan motivasi spiritual saat' },
    { prefix: 'monitoring keagamaan', time: 'malam', action: 'Memantau dan membimbing kelancaran program keagamaan santri dalam' },
    { prefix: 'layanan konseling', time: 'sore', action: 'Memberikan layanan bimbingan pribadi dan mediasi solutif untuk' },
    { prefix: 'pendampingan kesehatan', time: 'pagi', action: 'Mendampingi pemulihan kondisi fisik dan kesehatan santri dalam' },
    { prefix: 'pengarahan etika', time: 'malam', action: 'Memberikan pengarahan akhlakul karimah dan adab kesantunan melalui' },
    { prefix: 'konseling afektif', time: 'sore', action: 'Melaksanakan pendampingan afektif untuk membangun ketahanan mental dalam' }
  ];

  let c4 = 0;
  for (const thm of rhk4Themes) {
    for (const itm of thm.items) {
      for (const app of rhk4Approaches) {
        if (c4 >= 1050) break;
        items.push({
          k: `${app.prefix} ${itm}`,
          a: [itm, `${app.prefix} ${thm.name.toLowerCase()}`, `rohani ${itm}`],
          r: 'RHK 4',
          t: app.time,
          d: `${app.action} ${itm} bagi peserta didik Sekolah Rakyat Terintegrasi 1 Kab. Kediri guna memperkuat spiritualitas, kesehatan mental, dan budi pekerti luhur.`,
        });
        c4++;
      }
    }
  }

  // ==========================================
  // RHK 5, RHK 6, RHK 7 (1,050 items)
  // ==========================================
  const rhk5Items = [
    'pendampingan belajar khusus siswa lambat belajar slow learner',
    'bimbingan komunikasi afektif santri berkebutuhan khusus',
    'pendampingan adaptasi lingkungan asrama siswa berkebutuhan perhatian',
    'bimbingan motorik halus dan kasar santri berkebutuhan khusus',
    'konseling personal siswa dengan kecemasan tinggi sosial',
    'pendampingan kesehatan khusus siswa asma alergi menahun',
    'fasilitasi tempat tidur khusus siswa penyandang disabilitas fisik',
    'asistensi makan mandiri santri berkebutuhan khusus',
    'bimbingan sosialisasi santri inklusi dengan rekan sekamar',
    'penyusunan program pendampingan individual peserta didik inklusif',
    'pendampingan terapi wicara santri dengan hambatan artikulasi',
    'pendampingan siswa dengan gangguan konsentrasi hiperaktif adhd',
    'bimbingan regulasi emosi santri berkebutuhan khusus',
    'asistensi mobilitas kursi roda santri penyandang tuna daksa',
    'pendampingan membaca braille santri dengan gangguan penglihatan',
    'fasilitasi sarana belajar ramah disabilitas di lingkungan asrama',
    'bimbingan vokasional sederhana santri berkebutuhan khusus',
    'monitoring nutrisi diet khusus santri dengan intoleransi makanan',
    'pendampingan adaptasi sensori santri autistik di kamar tidur',
    'pendampingan psikososial intensif santri rentan psikologis'
  ];

  const rhk6Items = [
    'mengikuti rapat koordinasi mingguan wali asuh asrama',
    'mengikuti workshop pembinaan karakter remaja masa kini',
    'mengikuti bimtek penanganan konseling peserta didik berasrama',
    'mengikuti pelatihan manajemen asrama modern terpadu',
    'mengikuti webinar pengembangan kurikulum pembiasaan karakter',
    'melaksanakan rapat evaluasi bulanan kinerja pengasuhan santri',
    'mengikuti pelatihan pertolongan pertama p3k medis darurat',
    'mengikuti seminar pencegahan perundungan bullying di sekolah',
    'studi banding sistem pengasuhan asrama terintegrasi berprestasi',
    'menyusun laporan kinerja portofolio bulanan wali asuh kedinasan',
    'mengikuti pelatihan konseling trauma healing dan krisis remaja',
    'mengikuti workshop pemanfaatan teknologi informasi pendataan asrama',
    'mengikuti diklat penguatan kompetensi pedagogik wali asuh',
    'mengikuti seminar psikologi perkembangan anak dan remaja',
    'mengikuti pelatihan manajemen gizi dan sanitasi lingkungan asrama',
    'rapat evaluasi kesiapan ujian dan bimbingan belajar asrama',
    'mengikuti sosialisasi peraturan disiplin asn dan pppk terpadu',
    'mengikuti workshop penulisan karya inovasi pengasuhan asrama',
    'mengikuti bimbingan teknis keselamatan kerja k3 di lingkungan asrama',
    'rapat koordinasi lintas sektor tenaga kependidikan dan pengelola'
  ];

  const rhk7Items = [
    'melaksanakan tugas piket jaga malam posko keamanan kampus',
    'melaksanakan piket pengawasan pintu gerbang keluar masuk siswa',
    'menjadi panitia peringatan maulid nabi muhammad saw',
    'menjadi panitia peringatan isra miraj nabi muhammad saw',
    'menjadi panitia peringatan hari santri nasional di asrama',
    'menjadi panitia peringatan hut ri kemerdekaan 17 agustus',
    'menjadi panitia penerimaan peserta didik baru ppdb asrama',
    'mengawasi pelaksanaan ujian asesmen nasional berbasis komputer',
    'mendistribusikan perlengkapan seragam dan logistik santri',
    'melaksanakan kerja bakti massal penghijauan lingkungan kampus sekolah rakyat',
    'mengkoordinasikan pemeliharaan sarana dan prasarana aula serbaguna',
    'melaksanakan pendataan inventaris aset asrama dan sarana kamar',
    'menjadi tim satgas pencegahan dan penanganan kekerasan di sekolah',
    'mendampingi kontingen lomba kepramukaan santri tingkat kabupaten',
    'menjadi panitia pelepasan dan wisuda kelulusan peserta didik',
    'mengawal distribusi bantuan sosial pendidikan peserta didik',
    'melaksanakan tugas piket pelayanan informasi dan pengaduan wali murid',
    'menjadi koordinator posko sterilisasi dan kebersihan fasilitas kampus',
    'mengkoordinasikan jadwal mobil dinas antar jemput santri',
    'melaksanakan penugasan dinas khusus dari kepala sekolah terintegrasi'
  ];

  const extraModifiers = [
    { prefix: 'pelaksanaan tugas', action: 'Melaksanakan tugas pendampingan individual dan perhatian khusus dalam' },
    { prefix: 'bimbingan intensif', action: 'Memberikan asistensi intensif dan pendampingan personal terkait' },
    { prefix: 'monitoring inklusif', action: 'Memantau perkembangan afektif dan adaptasi sosial siswa dalam' },
    { prefix: 'keikutsertaan aktif', action: 'Berpartisipasi aktif dalam rangka peningkatan kompetensi wali asuh pada' },
    { prefix: 'peningkatan kompetensi', action: 'Mengikuti program pengembangan profesionalisme tenaga kependidikan dalam' },
    { prefix: 'rapat koordinasi', action: 'Menghadiri agenda koordinasi dan evaluasi kedinasan mengenai' },
    { prefix: 'tugas kedinasan', action: 'Melaksanakan penugasan kedinasan tambahan dari pimpinan dalam rangka' },
    { prefix: 'tanggung jawab panitia', action: 'Menjalankan peran tanggung jawab kepanitiaan dan tugas tambahan pada' },
    { prefix: 'piket tugas', action: 'Melaksanakan amanah piket tugas operasional kampus terkait' },
    { prefix: 'koordinasi terpadu', action: 'Melaksanakan koordinasi terpadu dan penuntasan amanah dinas pada' },
    { prefix: 'fasilitasi kedinasan', action: 'Memfasilitasi terselenggaranya agenda kedinasan penting terkait' },
    { prefix: 'pengawalan program', action: 'Melakukan pengawalan penuh integritas terhadap kelancaran' },
    { prefix: 'asistensi operasional', action: 'Memberikan dukungan asistensi teknis dan operasional dalam' },
    { prefix: 'pendampingan khusus', action: 'Melaksanakan pendampingan khusus secara dedikatif dalam rangka' },
    { prefix: 'evaluasi berkala', action: 'Melakukan evaluasi dan pelaporan berkala terkait pelaksanaan' },
    { prefix: 'penyiapan sarana', action: 'Menyiapkan sarana pendukung dan mengawal ketertiban kegiatan' },
    { prefix: 'penugasan pimpinan', action: 'Menindaklanjuti instruksi resmi penugasan dinas pimpinan pada' },
    { prefix: 'tanggung jawab operasional', action: 'Menjalankan tanggung jawab operasional kedinasan penuh dalam' }
  ];

  // --- RHK 5: 1,050 items (Peserta Didik Berkebutuhan Khusus) ---
  let c5 = 0;
  for (const itm of rhk5Items) {
    for (const mod of extraModifiers) {
      for (const ctx of ['pagi', 'siang', 'sore']) {
        if (c5 >= 1050) break;
        items.push({
          k: `${mod.prefix} ${itm} ${ctx}`,
          a: [itm, `${mod.prefix} ${itm}`, `inklusi ${itm}`],
          r: 'RHK 5',
          t: 'fleksibel',
          d: `${mod.action} ${itm} pada ${ctx} hari bagi santri berkebutuhan khusus Sekolah Rakyat Terintegrasi 1 Kab. Kediri dengan penuh kesabaran dan dedikasi.`,
        });
        c5++;
      }
    }
  }

  // --- RHK 6: 1,050 items (Pengembangan Kompetensi Tenaga Kependidikan) ---
  let c6 = 0;
  for (const itm of rhk6Items) {
    for (const mod of extraModifiers) {
      for (const ctx of ['asrama', 'sekolah', 'kedinasan']) {
        if (c6 >= 1050) break;
        items.push({
          k: `${mod.prefix} ${itm} ${ctx}`,
          a: [itm, `${mod.prefix} ${itm}`, `kompetensi ${itm}`],
          r: 'RHK 6',
          t: 'fleksibel',
          d: `${mod.action} ${itm} lingkup ${ctx} dalam rangka penguatan profesionalisme dan mutu layanan wali asuh Sekolah Rakyat Terintegrasi 1 Kab. Kediri.`,
        });
        c6++;
      }
    }
  }

  // --- RHK 7: 1,050 items (Tugas Tambahan dari Pimpinan / Kepala Sekolah) ---
  let c7 = 0;
  for (const itm of rhk7Items) {
    for (const mod of extraModifiers) {
      for (const ctx of ['pagi', 'malam', 'operasional']) {
        if (c7 >= 1050) break;
        items.push({
          k: `${mod.prefix} ${itm} ${ctx}`,
          a: [itm, `${mod.prefix} ${itm}`, `tugas tambahan ${itm}`],
          r: 'RHK 7',
          t: 'fleksibel',
          d: `${mod.action} ${itm} tugas ${ctx} sesuai arahan kedinasan kepala Sekolah Rakyat Terintegrasi 1 Kab. Kediri dengan penuh tanggung jawab dan integritas.`,
        });
        c7++;
      }
    }
  }

  return items;
}

export const LARGE_VOCABULARY_BANK: CompactVocabItem[] = buildLargeVocabularyBank();
