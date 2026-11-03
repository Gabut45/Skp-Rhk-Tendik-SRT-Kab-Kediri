/**
 * Database Kosa Kata & Bank Deskripsi Kegiatan Bimbingan dan Pembinaan Peserta Didik
 * Khusus Lingkungan: Sekolah Rakyat Terintegrasi 1 Kab. Kediri (SRT 1 Kediri / SRMA 24 Kediri)
 *
 * Berisi perbendaharaan kata realistis terlengkap untuk tugas Wali Asuh, Tenaga Kependidikan,
 * dan Pembina Karakter Peserta Didik, lengkap dengan variasi kalimat dinamis dan penanganan waktu.
 */

export interface VocabularyEntry {
  keyword: string;
  aliases?: string[];
  rhk: 'RHK 1' | 'RHK 2' | 'RHK 3' | 'RHK 4' | 'RHK 5' | 'RHK 6' | 'RHK 7';
  timeContext?: 'pagi' | 'siang' | 'sore' | 'malam' | 'subuh' | 'fleksibel';
  templates: string[];
}

export const VOCABULARY_BANK: VocabularyEntry[] = [
  // ==========================================
  // KELOMPOK 1: KONSUMSI & GIZI ASRAMA (RHK 3)
  // ==========================================
  {
    keyword: 'makan malam',
    aliases: ['dinner', 'santap malam', 'konsumsi malam'],
    rhk: 'RHK 3',
    timeContext: 'malam',
    templates: [
      'Mendampingi kegiatan makan malam bersama peserta didik di ruang makan asrama, menciptakan suasana kekeluargaan yang hangat, serta membiasakan berdoa dan adab makan yang tertib.',
      'Melaksanakan pendampingan makan malam peserta didik di asrama SRMA 24 Kediri, memastikan asupan nutrisi tercukupi dan seluruh siswa merapikan kembali peralatan makannya.',
      'Mengawasi jalannya makan malam bersama seluruh penghuni asrama, mengecek ketertiban antrean makan, serta memastikan tidak ada makanan yang terbuang percuma.',
      'Mendampingi makan malam santri/peserta didik secara tertib dan teratur, mempererat kebersamaan antar-siswa, serta memastikan kebersihan meja makan setelah selesai.',
    ],
  },
  {
    keyword: 'makan pagi',
    aliases: ['sarapan', 'sarapan pagi', 'breakfast'],
    rhk: 'RHK 3',
    timeContext: 'pagi',
    templates: [
      'Mengawasi kegiatan makan pagi (sarapan) peserta didik sebelum berangkat sekolah, memastikan seluruh siswa sarapan dengan cukup agar memiliki stamina optimal mengikuti pembelajaran.',
      'Melaksanakan pendampingan sarapan pagi bersama peserta didik di ruang makan asrama dengan tertib, memastikan asupan gizi seimbang dan kesiapan siswa menuju kegiatan sekolah.',
      'Mendampingi peserta didik pada waktu makan pagi, mengingatkan pentingnya sarapan untuk kesehatan fisik, serta membiasakan merapikan peralatan makan ke tempat pencucian.',
      'Memfasilitasi sarapan pagi peserta didik tepat waktu, memantau porsi makan sehat, dan membimbing siswa mengawali hari dengan doa dan rasa syukur.',
    ],
  },
  {
    keyword: 'makan siang',
    aliases: ['lunch', 'santap siang', 'konsumsi siang'],
    rhk: 'RHK 3',
    timeContext: 'siang',
    templates: [
      'Mendampingi dan mengawasi kegiatan makan siang peserta didik di ruang makan asrama sepulang dari sekolah, memastikan suasana tertib dan asupan nutrisi pasca-belajar tercukupi.',
      'Melaksanakan pendampingan makan siang bersama peserta didik setelah menyelesaikan kegiatan belajar di sekolah, memfasilitasi waktu makan yang teratur, higienis, dan santun.',
      'Mengkoordinasikan jam makan siang peserta didik di asrama dengan tertib, memastikan seluruh siswa hadir makan siang tepat waktu sebelum waktu istirahat siang.',
    ],
  },
  {
    keyword: 'makan sore',
    aliases: ['snack sore', 'kudapan sore', 'makan petang'],
    rhk: 'RHK 3',
    timeContext: 'sore',
    templates: [
      'Mendampingi kegiatan pembagian kudapan/makan sore sehat bagi peserta didik di asrama, menjaga ketertiban dan kebersihan area makan asrama.',
      'Mengawasi waktu kudapan sore peserta didik selepas aktivitas olahraga/ekskul, memastikan asupan nutrisi ringan dan hidrasi yang cukup.',
    ],
  },
  {
    keyword: 'makan',
    aliases: ['konsumsi', 'makan bersama', 'ruang makan'],
    rhk: 'RHK 3',
    timeContext: 'fleksibel',
    templates: [
      'Mendampingi peserta didik selama kegiatan makan bersama di ruang makan asrama, memastikan ketertiban antrean, penerapan adab makan islami, dan kebersihan lingkungan makan.',
      'Melaksanakan pendampingan makan bersama peserta didik dengan menerapkan kebiasaan berdoa, makan dengan tertib, serta tidak menyisakan makanan sebagai bentuk rasa syukur.',
      'Membimbing siswa-siswi dalam kegiatan makan bersama secara teratur, mengingatkan pentingnya asupan gizi seimbang, serta menanamkan budaya mencuci peralatan makan sendiri.',
    ],
  },

  // ==========================================
  // KELOMPOK 2: IBADAH SHOLAT & SPIRITUAL (RHK 3 & RHK 4)
  // ==========================================
  {
    keyword: 'sholat subuh',
    aliases: ['solat subuh', 'salat subuh', 'subuh berjamaah'],
    rhk: 'RHK 3',
    timeContext: 'subuh',
    templates: [
      'Mendampingi pelaksanaan sholat Subuh berjamaah bersama seluruh peserta didik di mushola asrama, dilanjutkan dengan dzikir pagi dan kultum singkat pembinaan karakter.',
      'Membangunkan peserta didik dan mendampingi pelaksanaan ibadah sholat Subuh berjamaah tepat waktu, memastikan wudhu dilakukan dengan sempurna dan shaf sholat rapi.',
      'Mengimami / mengawasi sholat Subuh berjamaah peserta didik di mushola asrama, dilanjutkan pembacaan wirid dan pembiasaan doa pagi untuk mengawali aktivitas.',
    ],
  },
  {
    keyword: 'sholat dzuhur',
    aliases: ['sholat duhur', 'solat dzuhur', 'salat dhuhur', 'dzuhur berjamaah'],
    rhk: 'RHK 3',
    timeContext: 'siang',
    templates: [
      'Mendampingi pelaksanaan ibadah sholat Dzuhur berjamaah peserta didik di mushola asrama setelah kembali dari kegiatan sekolah, memastikan kekhusyukan dan ketertiban.',
      'Mengawasi dan membimbing peserta didik melaksanakan sholat Dzuhur berjamaah secara tepat waktu, mengecek kehadiran seluruh siswa di mushola secara disiplin.',
      'Melaksanakan pendampingan sholat Dzuhur berjamaah, membina ketertiban shaf, dan dilanjutkan doa bersama sebelum siswa melanjutkan istirahat siang.',
    ],
  },
  {
    keyword: 'sholat ashar',
    aliases: ['solat ashar', 'salat ashar', 'ashar berjamaah'],
    rhk: 'RHK 3',
    timeContext: 'sore',
    templates: [
      'Melaksanakan pendampingan ibadah sholat Ashar berjamaah bagi peserta didik di mushola asrama, memastikan seluruh siswa hadir dan melaksanakan ibadah tepat waktu.',
      'Mendampingi pelaksanaan sholat Ashar berjamaah di asrama dilanjutkan dengan doa bersama dan pengarahan singkat pembagian jadwal aktivitas sore hari.',
      'Mengajak seluruh peserta didik untuk menghentikan aktivitas sore dan segera mengambil wudhu guna menunaikan sholat Ashar berjamaah dengan khusyuk.',
    ],
  },
  {
    keyword: 'sholat maghrib',
    aliases: ['sholat magrib', 'solat maghrib', 'salat maghrib', 'maghrib berjamaah'],
    rhk: 'RHK 3',
    timeContext: 'malam',
    templates: [
      'Mendampingi pelaksanaan sholat Maghrib berjamaah bersama seluruh peserta didik di mushola asrama, dilanjutkan dengan kegiatan tadarus Al-Quran bersama.',
      'Melaksanakan pendampingan ibadah sholat Maghrib berjamaah, memastikan shaf sholat tertib dan membina suasana spiritual yang khusyuk di lingkungan asrama.',
      'Mengawasi kehadiran peserta didik saat sholat Maghrib berjamaah, memimpin doa bersama, dan mengarahkan siswa untuk tetap di mushola menyimak bacaan tilawah.',
    ],
  },
  {
    keyword: 'sholat isya',
    aliases: ['solat isya', 'salat isya', 'isya berjamaah'],
    rhk: 'RHK 3',
    timeContext: 'malam',
    templates: [
      'Mendampingi pelaksanaan sholat Isya berjamaah bagi peserta didik di mushola asrama, memastikan seluruh siswa hadir tepat waktu sebelum melanjutkan kegiatan belajar malam.',
      'Melaksanakan pendampingan sholat Isya berjamaah secara tertib dan khusyuk, dilanjutkan arahan persiapan sesi belajar mandiri malam hari.',
      'Mengawasi sholat Isya berjamaah di mushola asrama, menanamkan kedisiplinan beribadah tepat waktu bagi seluruh peserta didik asrama.',
    ],
  },
  {
    keyword: 'sholat dhuha',
    aliases: ['solat dhuha', 'salat dhuha', 'dhuha'],
    rhk: 'RHK 4',
    timeContext: 'pagi',
    templates: [
      'Membimbing peserta didik dalam pembiasaan sholat Dhuha di mushola sekolah/asrama, menanamkan nilai-nilai spiritual, ketenangan jiwa, dan kedisiplinan beribadah sunnah.',
      'Mendampingi pelaksanaan sholat Dhuha berjamaah pagi hari, dilanjutkan doa memohon kemudahan belajar dan keberkahan ilmu bagi peserta didik.',
    ],
  },
  {
    keyword: 'sholat tahajud',
    aliases: ['tahajud', 'qiyamul lail', 'sholat malam'],
    rhk: 'RHK 4',
    timeContext: 'subuh',
    templates: [
      'Mendampingi dan membimbing peserta didik dalam pelaksanaan sholat Tahajud dan Qiyamul Lail di sepertiga malam terakhir, melatih kedekatan spiritual dan pembentukan akhlak mulia.',
      'Mengajak peserta didik bangun lebih awal untuk menunaikan ibadah sholat sunnah Tahajud dan muhasabah diri di mushola asrama sebelum waktu Subuh.',
    ],
  },
  {
    keyword: 'sholat jumat',
    aliases: ['jumatan', 'sholat jum\'at'],
    rhk: 'RHK 3',
    timeContext: 'siang',
    templates: [
      'Mendampingi peserta didik putra melaksanakan ibadah Sholat Jumat di masjid, memastikan kerapian pakaian muslim, wudhu, dan kehadiran tepat waktu sebelum khutbah dimulai.',
      'Melaksanakan pendampingan dan pengawalan peserta didik menuju masjid untuk sholat Jumat, membina ketertiban dan adab di dalam masjid.',
    ],
  },
  {
    keyword: 'sholat',
    aliases: ['ibadah sholat', 'sholat berjamaah', 'salat'],
    rhk: 'RHK 3',
    timeContext: 'fleksibel',
    templates: [
      'Melaksanakan pendampingan ibadah sholat berjamaah bersama peserta didik di mushola asrama, memastikan ketertiban shaf, kekhusyukan pelaksanaan, serta ketepatan waktu.',
      'Mendampingi dan mengawasi pelaksanaan sholat wajib berjamaah peserta didik, memberikan bimbingan tata cara wudhu yang benar dan doa-doa selepas sholat.',
    ],
  },
  {
    keyword: 'mengaji',
    aliases: ['tilawah', 'tadarus', 'baca quran', 'mengkaji quran'],
    rhk: 'RHK 4',
    timeContext: 'fleksibel',
    templates: [
      'Melaksanakan pendampingan kegiatan mengaji Al-Quran bersama peserta didik dengan metode tartil, mencakup perbaikan bacaan tajwid, makharijul huruf, dan pemahaman ayat.',
      'Membimbing peserta didik dalam tilawah Al-Quran harian di mushola asrama, menyimak bacaan secara bergantian, serta membina kecintaan terhadap Al-Quran.',
      'Mendampingi sesi mengaji bersama para siswa di asrama, memberikan bimbingan fashahah dan penguatan adab-adab dalam membaca kitab suci.',
    ],
  },
  {
    keyword: 'tadarus',
    aliases: ['tadarus al-quran', 'tadarus bersama'],
    rhk: 'RHK 4',
    timeContext: 'malam',
    templates: [
      'Mendampingi kegiatan tadarus Al-Quran bersama peserta didik selepas ibadah sholat maghrib/isya, membiasakan khataman rutin dan pembacaan yang tartil.',
      'Melaksanakan kegiatan tadarus Al-Quran terarah di mushola asrama, membimbing peserta didik yang masih perlu pendampingan tajwid.',
    ],
  },
  {
    keyword: 'setoran hafalan',
    aliases: ['setoran tahfidz', 'tahfidz', 'setoran ayat', 'hafalan quran'],
    rhk: 'RHK 4',
    timeContext: 'fleksibel',
    templates: [
      'Menyimak dan mendampingi setoran hafalan Al-Quran peserta didik, mencatat progres capaian hafalan ayat/juz pada buku kontrol tahfidz, serta memberikan motivasi target.',
      'Melaksanakan kegiatan bimbingan murajaah dan setoran hafalan surat-surat pendek peserta didik di asrama secara berkala.',
    ],
  },
  {
    keyword: 'kajian',
    aliases: ['kultum', 'tausiyah', 'kajian sore', 'kajian malam', 'ceramah'],
    rhk: 'RHK 4',
    timeContext: 'fleksibel',
    templates: [
      'Melaksanakan pendampingan kegiatan kajian keagamaan dan pembinaan akhlak peserta didik mengenai adab kehidupan sehari-hari, sopan santun, dan bakti kepada orang tua.',
      'Mendampingi penyampaian kultum/kajian singkat selepas sholat berjamaah oleh peserta didik sebagai ajang latihan berbicara di depan umum dan penguatan spiritual.',
    ],
  },
  {
    keyword: 'doa bersama',
    aliases: ['dzikir', 'istighosah', 'muhasabah', 'doa pagi'],
    rhk: 'RHK 4',
    timeContext: 'fleksibel',
    templates: [
      'Memimpin kegiatan doa bersama dan dzikir pagi/petang bersama seluruh peserta didik asrama, memohon perlindungan, kemudahan belajar, dan kesehatan jasmani rohani.',
      'Melaksanakan sesi doa dan muhasabah bersama siswa asrama guna menumbuhkan kesadaran diri, ketulusan niat belajar, dan kedamaian hati.',
    ],
  },

  // ==========================================
  // KELOMPOK 3: KEMANDIRIAN & KEBERSIHAN (RHK 2)
  // ==========================================
  {
    keyword: 'cuci baju',
    aliases: ['mencuci pakaian', 'cuci pakaian', 'laundry mandiri', 'mencuci baju'],
    rhk: 'RHK 2',
    timeContext: 'fleksibel',
    templates: [
      'Melaksanakan pendampingan kemandirian peserta didik dalam mencuci pakaian secara mandiri di area laundry asrama, menanamkan kebiasaan hidup bersih, rapi, dan bertanggung jawab.',
      'Membimbing siswa melakukan kegiatan cuci baju mandiri, mengajarkan takaran detergen yang tepat, teknik membilas bersih, serta tata cara penjemuran yang rapi.',
      'Mengawasi kegiatan cuci pakaian peserta didik di akhir pekan/pagi hari, melatih siswa merawat pakaian sekolah dan seragam asrama milik sendiri secara disiplin.',
    ],
  },
  {
    keyword: 'menjemur pakaian',
    aliases: ['jemur baju', 'jemur pakaian', 'mengangkat jemuran'],
    rhk: 'RHK 2',
    timeContext: 'pagi',
    templates: [
      'Mendampingi peserta didik menjemur pakaian di tempat jemuran asrama dengan tertib, menggunakan hanger secara teratur agar pakaian cepat kering dan rapi.',
      'Melatih peserta didik mengangkat dan merapikan jemuran yang sudah kering, mencegah pakaian tertukar atau tertinggal di area jemuran luar.',
    ],
  },
  {
    keyword: 'menyetrika',
    aliases: ['setrika baju', 'menyetrika pakaian', 'setrika seragam'],
    rhk: 'RHK 2',
    timeContext: 'fleksibel',
    templates: [
      'Mendampingi dan mengawasi peserta didik dalam kegiatan menyetrika seragam sekolah, memperhatikan aspek keselamatan penggunaan alat listrik dan kerapian lipatan.',
      'Melatih keterampilan hidup mandiri peserta didik dalam menyetrika pakaian seragam harian agar selalu berpenampilan rapi dan siap mengikuti pembelajaran.',
    ],
  },
  {
    keyword: 'cuci piring',
    aliases: ['mencuci piring', 'cuci ompreng', 'cuci mangkok'],
    rhk: 'RHK 2',
    timeContext: 'fleksibel',
    templates: [
      'Membimbing peserta didik membersihkan dan mencuci peralatan makan masing-masing setelah selesai makan, menanamkan budaya tanggung jawab, kemandirian, dan kebersihan diri.',
      'Melatih kedisiplinan peserta didik untuk langsung mencuci piring dan sendok di wastafel asrama tanpa menumpuk cucian kotor.',
    ],
  },
  {
    keyword: 'piket kebersihan',
    aliases: ['piket kamar', 'piket asrama', 'piket pagi', 'piket sore', 'bersih kamar'],
    rhk: 'RHK 2',
    timeContext: 'fleksibel',
    templates: [
      'Mengawasi dan mendampingi pelaksanaan piket kebersihan harian peserta didik, memastikan area kamar tidur, lorong, dan fasilitas bersama disapu serta dipel dengan baik.',
      'Melaksanakan pemantauan jadwal piket kebersihan asrama, membimbing siswa dalam pembagian tugas menyapu, membuang sampah, dan menata perabotan kamar.',
      'Mendampingi peserta didik menjalankan piket harian asrama dengan penuh tanggung jawab, menciptakan lingkungan asrama yang bersih, asri, dan sehat.',
    ],
  },
  {
    keyword: 'kerja bakti',
    aliases: ['gotong royong', 'korve', 'bersih-bersih lingkungan', 'kebersihan massal'],
    rhk: 'RHK 2',
    timeContext: 'fleksibel',
    templates: [
      'Mengoordinasikan dan mendampingi kegiatan kerja bakti gotong royong membersihkan seluruh lingkungan asrama, halaman, dan drainase bersama peserta didik.',
      'Melaksanakan kegiatan gotong royong membersihkan lingkungan asrama SRMA 24 Kediri, menanamkan kepedulian lingkungan dan kebersamaan antar-siswa.',
    ],
  },
  {
    keyword: 'merapikan tempat tidur',
    aliases: ['rapikan kasur', 'lipat selimut', 'tata kamar', 'merapikan kasur'],
    rhk: 'RHK 2',
    timeContext: 'pagi',
    templates: [
      'Melatih dan mendampingi peserta didik merapikan tempat tidur, melipat selimut, menata bantal, serta membersihkan seprai secara mandiri setiap pagi hari di kamar asrama.',
      'Menginspeksi kerapian tempat tidur peserta didik pasca bangun tidur, membiasakan kerapian dan estetika kamar asrama sebagai cermin pribadi disiplin.',
    ],
  },
  {
    keyword: 'merapikan lemari',
    aliases: ['tata lemari', 'susun pakaian', 'merapikan loker'],
    rhk: 'RHK 2',
    timeContext: 'fleksibel',
    templates: [
      'Mendampingi peserta didik dalam menata dan merapikan pakaian di lemari/loker masing-masing, mengelompokkan seragam, pakaian santai, dan perlengkapan ibadah secara teratur.',
      'Membimbing siswa melakukan penyusunan lemari asrama yang rapi, menjaga kebersihan lemari, dan mencegah penumpukan barang-barang yang tidak terpakai.',
    ],
  },
  {
    keyword: 'kebersihan diri',
    aliases: ['potong kuku', 'cukur rambut', 'mandi', 'kebersihan sanitasi'],
    rhk: 'RHK 2',
    timeContext: 'fleksibel',
    templates: [
      'Melakukan pendampingan dan pemeriksaan kebersihan diri peserta didik, meliputi kerapian rambut, kebersihan kuku, kesehatan kulit, dan sanitasi pakaian.',
      'Membimbing peserta didik dalam penerapan pola hidup bersih dan sehat (PHBS) di asrama guna menjaga kesehatan fisik dan mencegah timbulnya penyakit menular.',
    ],
  },
  {
    keyword: 'memasak',
    aliases: ['masak mandiri', 'praktik memasak', 'membuat makanan'],
    rhk: 'RHK 2',
    timeContext: 'fleksibel',
    templates: [
      'Mendampingi peserta didik dalam kegiatan memasak sederhana dan penyiapan makanan sehat di dapur asrama, melatih keterampilan hidup mandiri (*life skill*).',
      'Membimbing siswa dalam praktik pengolahan makanan ringan yang higienis, mengajarkan tata cara penggunaan kompor yang aman dan pembersihan dapur pasca-masak.',
    ],
  },

  // ==========================================
  // KELOMPOK 4: BELAJAR & AKADEMIK (RHK 1)
  // ==========================================
  {
    keyword: 'belajar malam',
    aliases: ['jam belajar', 'sinau malam', 'belajar mandiri malam', 'sesi belajar'],
    rhk: 'RHK 1',
    timeContext: 'malam',
    templates: [
      'Melaksanakan pendampingan kegiatan belajar malam peserta didik di ruang belajar asrama, mengondisikan suasana tenang, serta membantu siswa yang memerlukan bimbingan materi pelajaran.',
      'Mendampingi proses belajar mandiri malam hari, memastikan seluruh peserta didik fokus menyelesaikan tugas sekolah dan mengulang kembali materi yang telah diajarkan.',
      'Mengawasi jam belajar terarah di asrama, memfasilitasi tanya jawab materi sulit, serta memotivasi siswa untuk tekun dan konsisten mengejar prestasi akademik.',
    ],
  },
  {
    keyword: 'belajar kelompok',
    aliases: ['diskusi belajar', 'tutor sebaya', 'kelompok belajar'],
    rhk: 'RHK 1',
    timeContext: 'fleksibel',
    templates: [
      'Memfasilitasi kegiatan belajar kelompok antar-peserta didik di asrama, mendorong penerapan tutor sebaya, dan memastikan setiap anggota kelompok aktif berdiskusi positif.',
      'Mendampingi sesi diskusi akademik kelompok peserta didik, membantu memecahkan kebuntuan pembahasan soal, serta memupuk budaya kolaborasi cerdas antar-siswa.',
    ],
  },
  {
    keyword: 'mengerjakan tugas',
    aliases: ['tugas sekolah', 'mengerjakan pr', 'bimbingan tugas', 'pekerjaan rumah'],
    rhk: 'RHK 1',
    timeContext: 'fleksibel',
    templates: [
      'Membimbing peserta didik dalam menyelesaikan pekerjaan rumah (PR) dan tugas sekolah secara teliti, memastikan siswa memahami konsep materi dan mengumpulkan tepat waktu.',
      'Melaksanakan pendampingan pengerjaan tugas proyek sekolah peserta didik di asrama, memberikan bimbingan teknis, serta memeriksa kelengkapan hasil kerja siswa.',
    ],
  },
  {
    keyword: 'pemanfaatan laptop',
    aliases: ['belajar digital', 'akses laptop', 'tugas komputer', 'laptop belajar'],
    rhk: 'RHK 1',
    timeContext: 'fleksibel',
    templates: [
      'Melaksanakan pendampingan pemanfaatan perangkat komputer/laptop untuk menunjang kegiatan pembelajaran digital peserta didik, memastikan penggunaan yang edukatif dan bertanggung jawab.',
      'Membimbing siswa dalam mengoperasikan laptop untuk pencarian referensi materi ilmiah, pengetikan makalah tugas sekolah, serta menjaga keamanan aset perangkat.',
    ],
  },
  {
    keyword: 'literasi membaca',
    aliases: ['membaca buku', 'sudut baca', 'perpustakaan', 'buku bacaan'],
    rhk: 'RHK 1',
    timeContext: 'fleksibel',
    templates: [
      'Mendampingi kegiatan membaca buku / literasi harian peserta didik di ruang baca asrama, merangsang minat baca dan memperluas wawasan pengetahuan umum siswa.',
      'Memfasilitasi sesi gerakan literasi membaca 15 menit sebelum kegiatan belajar malam, melatih daya nalar kritis dan kemampuan merangkum bacaan.',
    ],
  },
  {
    keyword: 'refleksi malam',
    aliases: ['evaluasi harian', 'muhasabah malam', 'evaluasi diri'],
    rhk: 'RHK 1',
    timeContext: 'malam',
    templates: [
      'Melaksanakan kegiatan refleksi malam bersama peserta didik untuk mengevaluasi rangkaian aktivitas sepanjang hari, memetik hikmah pembelajaran, serta menyusun rencana esok hari.',
      'Memfasilitasi sesi evaluasi diri dan refleksi harian di asrama, memberi ruang bagi siswa menyampaikan kendala yang dialami serta memberikan arahan konstruktif.',
    ],
  },
  {
    keyword: 'bimbingan akademik',
    aliases: ['konsultasi pelajaran', 'review materi', 'bimbingan ujian', 'persiapan ujian'],
    rhk: 'RHK 1',
    timeContext: 'fleksibel',
    templates: [
      'Memberikan layanan bimbingan akademik intensif kepada peserta didik menjelang ujian penilaian harian, membantu penguasaan kisi-kisi dan trik pemecahan soal.',
      'Melaksanakan pendampingan review materi pelajaran yang dirasa sulit oleh peserta didik, memberikan penguatan konsep dan latihan terstruktur.',
    ],
  },

  // ==========================================
  // KELOMPOK 5: KEDISIPLINAN, APEL & EMOSIONAL (RHK 4)
  // ==========================================
  {
    keyword: 'apel pagi',
    aliases: ['briefing pagi', 'baris pagi', 'apel keberangkatan'],
    rhk: 'RHK 4',
    timeContext: 'pagi',
    templates: [
      'Memimpin dan mendampingi kegiatan apel pagi peserta didik sebelum berangkat sekolah, mengecek kerapian seragam, atribut, kebersihan diri, serta memberikan motivasi semangat belajar.',
      'Melaksanakan apel pagi di halaman asrama, melakukan presensi kehadiran siswa, menyampaikan arahan kedisiplinan harian, dan melepas siswa menuju ruang kelas.',
      'Mendampingi apel pagi peserta didik dengan tertib, menanamkan sikap sigap, disiplin waktu, dan kepatuhan terhadap norma tata tertib sekolah.',
    ],
  },
  {
    keyword: 'apel malam',
    aliases: ['briefing malam', 'cek kehadiran malam', 'apel istirahat'],
    rhk: 'RHK 4',
    timeContext: 'malam',
    templates: [
      'Melaksanakan kegiatan apel malam bersama seluruh peserta didik di asrama, mengecek kelengkapan kehadiran siswa, mengevaluasi kegiatan hari ini, dan memberikan arahan istirahat tidur.',
      'Memimpin apel malam di asrama sebagai sarana pembinaan kedisiplinan, pengecekan kondisi fisik dan psikis siswa, serta memastikan situasi asrama kondusif menjelang jam tidur.',
      'Mengkoordinasikan apel malam santri/siswa, memastikan 100% siswa hadir lengkap di aula, menyampaikan informasi penting, dan memimpin doa penutup hari.',
    ],
  },
  {
    keyword: 'konseling',
    aliases: ['bimbingan konseling', 'curhat siswa', 'konseling individual', 'konseling pribadi'],
    rhk: 'RHK 4',
    timeContext: 'fleksibel',
    templates: [
      'Melaksanakan sesi konseling individual kepada peserta didik yang mengalami hambatan adaptasi atau kejenuhan belajar, mendengarkan dengan empati dan merumuskan solusi bersama.',
      'Memberikan layanan bimbingan psikososial dan motivasi personal kepada siswa, membantu meredakan kecemasan, serta memulihkan rasa percaya diri siswa di asrama.',
      'Melaksanakan pendekatan konseling humanistik terhadap peserta didik, menggali permasalahan pribadi/akademik secara privat, dan menyusun komitmen perbaikan sikap.',
    ],
  },
  {
    keyword: 'mediasi konflik',
    aliases: ['penyelesaian masalah siswa', 'mediasi perselisihan', 'damai siswa', 'melerai pertengkaran'],
    rhk: 'RHK 4',
    timeContext: 'fleksibel',
    templates: [
      'Melaksanakan mediasi terhadap peserta didik yang mengalami perselisihan paham, memberikan pengertian dengan adil, serta memfasilitasi kesepakatan damai dan saling memaafkan.',
      'Menangani potensi konflik antar-siswa di asrama dengan pendekatan persuasif dan kekeluargaan, mencegah terjadinya perundungan (*bullying*), dan memulihkan kerukunan.',
    ],
  },
  {
    keyword: 'pemeriksaan kerapian seragam',
    aliases: ['cek atribut', 'tertib seragam', 'razia atribut', 'kerapian pakaian'],
    rhk: 'RHK 4',
    timeContext: 'pagi',
    templates: [
      'Melakukan pemeriksaan kelengkapan atribut seragam sekolah (dasi, topi, ikat pinggang, kaos kaki, dan sepatu) kepada seluruh peserta didik sebelum berangkat ke sekolah.',
      'Memeriksa kerapian seragam peserta didik, memberikan arahan bagi yang kurang rapi agar segera membetulkan sesuai dengan standar tata tertib sekolah.',
    ],
  },
  {
    keyword: 'razia ketertiban',
    aliases: ['pemeriksaan kamar', 'sidak asrama', 'cek barang terlarang', 'pemeriksaan berkala'],
    rhk: 'RHK 4',
    timeContext: 'fleksibel',
    templates: [
      'Melaksanakan pemeriksaan ketertiban (*sidak*) berkala di kamar asrama untuk memastikan tidak ada barang-barang yang melanggar aturan sekolah/asrama, menjaga kenyamanan bersama.',
      'Menginspeksi kepatuhan tata tertib asrama bersama tim pembina, mengedukasi peserta didik tentang barang yang diperbolehkan demi keamanan dan fokus belajar.',
    ],
  },
  {
    keyword: 'pembinaan kedisiplinan',
    aliases: ['tata tertib', 'disiplin waktu', 'pengarahan tata tertib', 'edukasi disiplin'],
    rhk: 'RHK 4',
    timeContext: 'fleksibel',
    templates: [
      'Melakukan pembinaan kedisiplinan dan internalisasi tata tertib asrama kepada peserta didik, menekankan pentingnya manajemen waktu dan rasa tanggung jawab bersama.',
      'Memberikan pengarahan dan bimbingan kepatuhan norma asrama bagi siswa yang melakukan pelanggaran ringan, mengarahkan pada sanksi edukatif yang mendidik.',
    ],
  },
  {
    keyword: 'anti perundungan',
    aliases: ['anti bullying', 'cegah bully', 'sosialisasi anti kekerasan'],
    rhk: 'RHK 4',
    timeContext: 'fleksibel',
    templates: [
      'Memberikan sosialisasi dan edukasi pencegahan perundungan (*stop bullying*) di lingkungan asrama, menumbuhkan sikap saling menghargai, menyayangi, dan menjunjung toleransi.',
      'Membina kehangatan komunikasi antar-tingkat siswa di asrama, menegaskan kebijakan nol-toleransi terhadap kekerasan verbal maupun fisik.',
    ],
  },
  {
    keyword: 'kunjungan orang tua',
    aliases: ['sambang asrama', 'besuk siswa', 'pertemuan wali murid', 'wali santri datang'],
    rhk: 'RHK 4',
    timeContext: 'fleksibel',
    templates: [
      'Mendampingi dan memfasilitasi kegiatan kunjungan/besuk orang tua peserta didik di asrama, memastikan tata tertib kunjungan dipatuhi, serta melaporkan perkembangan putra-putrinya.',
      'Menerima kedatangan wali murid dalam agenda sambang asrama, berdialog mengenai progres pembinaan karakter dan kesehatan siswa secara ramah dan transparan.',
    ],
  },
  {
    keyword: 'home visit',
    aliases: ['kunjungan rumah', 'sambang rumah', 'silaturahmi ke wali murid'],
    rhk: 'RHK 4',
    timeContext: 'fleksibel',
    templates: [
      'Melaksanakan kunjungan rumah (*home visit*) ke kediaman orang tua/wali peserta didik guna menjalin silaturahmi erat dan mengkoordinasikan perkembangan perilaku serta presensi siswa.',
      'Melakukan *home visit* dalam rangka koordinasi pembinaan terpadu bersama keluarga siswa, menyelaraskan pola asuh antara pihak asrama sekolah dan orang tua di rumah.',
    ],
  },

  // ==========================================
  // KELOMPOK 6: KESEHATAN, OLAHRAGA & FISIK (RHK 4)
  // ==========================================
  {
    keyword: 'merawat siswa sakit',
    aliases: ['siswa sakit', 'penanganan sakit', 'pendampingan uks', 'pemberian obat', 'cek suhu'],
    rhk: 'RHK 4',
    timeContext: 'fleksibel',
    templates: [
      'Melakukan pemantauan dan perawatan terhadap peserta didik yang sedang sakit di ruang UKS/kamar perawatan asrama, menyediakan obat sesuai keluhan, makanan hangat, dan cek suhu tubuh.',
      'Mendampingi peserta didik yang mengeluhkan gangguan kesehatan, memberikan pertolongan pertama, serta segera berkoordinasi dengan tenaga medis / puskesmas setempat bila diperlukan.',
      'Memantau kondisi kesehatan peserta didik yang beristirahat karena sakit, memastikan kebutuhan nutrisi, cairan, dan istirahat tercukupi dengan baik.',
    ],
  },
  {
    keyword: 'senam pagi',
    aliases: ['senam kesegaran', 'senam sehat', 'skj pagi'],
    rhk: 'RHK 4',
    timeContext: 'pagi',
    templates: [
      'Melaksanakan pendampingan senam kesegaran jasmani (SKJ) pagi bersama seluruh peserta didik di halaman asrama guna membina kebugaran fisik dan kesiapan mental belajar.',
      'Memandu gerakan senam pagi sehat bagi peserta didik asrama, menciptakan suasana ceria dan penuh semangat menyongsong aktivitas sekolah.',
    ],
  },
  {
    keyword: 'olahraga pagi',
    aliases: ['jalan santai', 'jogging pagi', 'lari pagi'],
    rhk: 'RHK 4',
    timeContext: 'pagi',
    templates: [
      'Mendampingi kegiatan olahraga dan jalan santai pagi bersama peserta didik mengelilingi area asrama dan lingkungan sekitar, menghirup udara segar dan menjaga vitalitas tubuh.',
      'Memimpin aktivitas pemanasan dan lari pagi bersama siswa asrama untuk memperkuat daya tahan fisik serta mempererat kekompakan.',
    ],
  },
  {
    keyword: 'olahraga sore',
    aliases: ['futsal sore', 'voli sore', 'badminton sore', 'main bola'],
    rhk: 'RHK 4',
    timeContext: 'sore',
    templates: [
      'Mendampingi peserta didik dalam kegiatan olahraga dan permainan beregu (futsal/bola voli) sore hari di lapangan asrama, menyalurkan energi secara positif, sehat, dan sportif.',
      'Mengawasi aktivitas olahraga sore peserta didik, memastikan keselamatan siswa saat bermain, serta menanamkan nilai-nilai sportivitas dan kerjasama tim.',
    ],
  },
  {
    keyword: 'pemeriksaan kesehatan',
    aliases: ['cek kesehatan', 'screening kesehatan', 'timbang badan', 'cek fisik'],
    rhk: 'RHK 4',
    timeContext: 'fleksibel',
    templates: [
      'Mendampingi pelaksanaan pemeriksaan kesehatan berkala peserta didik oleh petugas kesehatan/UKS, mencakup pengukuran tinggi badan, berat badan, serta kebersihan fisik.',
      'Memfasilitasi kegiatan screening kesehatan siswa di asrama, mencatat rekam kondisi kesehatan peserta didik sebagai bahan rujukan pembinaan fisik.',
    ],
  },

  // ==========================================
  // KELOMPOK 7: MOBILITAS & RUTINITAS ASRAMA (RHK 3)
  // ==========================================
  {
    keyword: 'membangunkan siswa',
    aliases: ['bangun subuh', 'bangun tidur', 'membangunkan pagi', 'bangun dini hari'],
    rhk: 'RHK 3',
    timeContext: 'subuh',
    templates: [
      'Membangunkan seluruh peserta didik asrama pada dini hari untuk persiapan ibadah sholat Subuh berjamaah, memastikan setiap siswa bangun dengan santun dan segera berwudhu.',
      'Melaksanakan rutinitas membangunkan siswa di seluruh kamar asrama secara bertahap dan disiplin, mengondisikan awal hari yang tertib dan penuh kesiapan.',
    ],
  },
  {
    keyword: 'persiapan berangkat sekolah',
    aliases: ['persiapan sekolah', 'berangkat sekolah', 'siap-siap sekolah'],
    rhk: 'RHK 3',
    timeContext: 'pagi',
    templates: [
      'Melaksanakan pendampingan persiapan keberangkatan sekolah peserta didik, mengecek kelengkapan buku pelajaran, tas sekolah, serta kerapian busana para siswa.',
      'Mendampingi peserta didik bersiap berangkat menuju gedung sekolah, memastikan seluruh siswa telah sarapan dan mengunci kamar asrama dengan aman.',
    ],
  },
  {
    keyword: 'mengantar siswa',
    aliases: ['antar sekolah', 'pengawalan berangkat', 'antar jemput'],
    rhk: 'RHK 3',
    timeContext: 'pagi',
    templates: [
      'Mendampingi dan mengawal peserta didik berjalan menuju gedung sekolah dengan tertib, memperhatikan keselamatan penyeberangan jalan, serta tiba tepat waktu di ruang kelas.',
      'Melaksanakan pengawasan mobilitas keberangkatan peserta didik dari asrama ke area sekolah dengan tertib dan mematuhi tata tertib perjalanan.',
    ],
  },
  {
    keyword: 'menjemput siswa',
    aliases: ['jemput sekolah', 'penjemputan pulang', 'pengawalan kepulangan'],
    rhk: 'RHK 3',
    timeContext: 'siang',
    templates: [
      'Melaksanakan penjemputan dan pengawalan kepulangan peserta didik dari gedung sekolah menuju asrama selepas bel pelajaran usai dengan selamat dan tertib.',
      'Mengkoordinasikan kepulangan siswa dari ruang kelas ke asrama, memastikan tidak ada siswa yang berkeliaran di luar lingkungan sekolah tanpa izin.',
    ],
  },
  {
    keyword: 'menyambut kepulangan siswa',
    aliases: ['sambut siswa', 'penyambutan asrama', 'kedatangan siswa'],
    rhk: 'RHK 3',
    timeContext: 'siang',
    templates: [
      'Menyambut kedatangan siswa-siswi yang kembali ke asrama setelah selesai kegiatan belajar di sekolah, mengecek presensi kehadiran dan menyapa kondisi fisik/psikis siswa.',
      'Menerima kepulangan peserta didik di lobi asrama dengan hangat, mengarahkan siswa menaruh sepatu di rak, berganti pakaian santai, dan bersiap makan siang.',
    ],
  },
  {
    keyword: 'istirahat siang',
    aliases: ['tidur siang', 'istirahat kamar', 'rehat siang'],
    rhk: 'RHK 3',
    timeContext: 'siang',
    templates: [
      'Mengawasi waktu istirahat siang peserta didik di kamar asrama masing-masing, menciptakan suasana hening dan kondusif untuk memulihkan kebugaran sebelum kegiatan sore.',
      'Mendampingi jam rehat siang peserta didik, memastikan seluruh siswa berada di kamar dan tidak membuat kegaduhan yang mengganggu ketenangan asrama.',
    ],
  },
  {
    keyword: 'tidur malam',
    aliases: ['istirahat malam', 'jam tidur', 'padam lampu', 'istirahat tidur'],
    rhk: 'RHK 3',
    timeContext: 'malam',
    templates: [
      'Melaksanakan pendampingan persiapan tidur malam peserta didik, memastikan seluruh siswa telah berada di kamar, mematikan lampu kamar, dan berdoa sebelum tidur.',
      'Mengawasi ketertiban jam malam di asrama, memastikan tidak ada siswa yang begadang bermain gawai/mengobrol, demi menjaga waktu tidur yang cukup dan sehat.',
    ],
  },
  {
    keyword: 'patroli malam',
    aliases: ['ronda malam', 'keamanan asrama', 'cek malam', 'keliling asrama'],
    rhk: 'RHK 3',
    timeContext: 'malam',
    templates: [
      'Melaksanakan patroli dan pengecekan keliling asrama pada malam hari, memastikan seluruh pintu dan jendela terkunci aman, kran air tertutup, serta lingkungan asrama kondusif.',
      'Melakukan pengawasan keamanan berkala di lingkungan asrama SRMA 24 Kediri selama jam istirahat malam demi menjamin keselamatan dan kenyamanan seluruh peserta didik.',
    ],
  },
  {
    keyword: 'upacara bendera',
    aliases: ['upacara hari senin', 'upacara', 'pengibaran bendera'],
    rhk: 'RHK 3',
    timeContext: 'pagi',
    templates: [
      'Mendampingi peserta didik dalam pelaksanaan Upacara Bendera hari Senin di lapangan sekolah, memastikan kelengkapan seragam resmi dan barisan berdiri dengan khidmat.',
      'Melaksanakan pengawasan dan pendampingan peserta didik selama upacara bendera, memantau ketertiban barisan serta sigap menangani siswa yang merasa kurang enak badan.',
    ],
  },
  {
    keyword: 'ekstrakurikuler',
    aliases: ['ekskul', 'kegiatan ekskul', 'pramuka', 'paskibra', 'seni tari'],
    rhk: 'RHK 3',
    timeContext: 'sore',
    templates: [
      'Mendampingi dan memantau keikutsertaan peserta didik dalam kegiatan ekstrakurikuler sore hari di sekolah, mendorong pengembangan minat, bakat, dan keterampilan berorganisasi.',
      'Melaksanakan pengawasan kegiatan ekstrakurikuler wajib (Pramuka/PMR) peserta didik, memastikan kegiatan berlangsung aman, terarah, dan menumbuhkan kepemimpinan.',
    ],
  },

  // ==========================================
  // KELOMPOK 8: ABK, PENGEMBANGAN DIRI & TUGAS DINAS (RHK 5, RHK 6, RHK 7)
  // ==========================================
  {
    keyword: 'berkebutuhan khusus',
    aliases: ['abk', 'siswa disabilitas', 'inklusi', 'pendampingan khusus'],
    rhk: 'RHK 5',
    timeContext: 'fleksibel',
    templates: [
      'Melaksanakan pendampingan individual secara intensif dan penuh kesabaran kepada peserta didik berkebutuhan khusus (ABK) agar dapat beraktivitas harian dengan nyaman dan mandiri di asrama.',
      'Mendampingi aktivitas belajar dan kemandirian siswa inklusi di asrama, memfasilitasi aksesibilitas sarana dan membangun lingkungan sosial yang ramah dan saling menerima.',
    ],
  },
  {
    keyword: 'pelatihan tenaga kependidikan',
    aliases: ['pelatihan', 'workshop', 'diklat', 'webinar', 'bimbingan teknis', 'bimtek'],
    rhk: 'RHK 6',
    timeContext: 'fleksibel',
    templates: [
      'Mengikuti kegiatan pelatihan dan pengembangan kompetensi tenaga kependidikan dalam strategi pengasuhan ramah anak dan manajemen asrama modern.',
      'Berpartisipasi dalam workshop pembinaan karakter dan penanganan psikososial peserta didik guna meningkatkan profesionalisme pelayanan di Sekolah Rakyat Terintegrasi 1 Kab. Kediri.',
      'Mengikuti webinar kedinasan terkait peningkatan mutu layanan bimbingan peserta didik dan penguatan kurikulum berbasis karakter asrama.',
    ],
  },
  {
    keyword: 'tugas kepala sekolah',
    aliases: ['tugas tambahan', 'disposisi kepala sekolah', 'perintah pimpinan', 'tugas kedinasan'],
    rhk: 'RHK 7',
    timeContext: 'fleksibel',
    templates: [
      'Melaksanakan tugas tambahan kedinasan sesuai surat penugasan / arahan Kepala Sekolah dalam rangka mendukung kelancaran operasional dan program asrama SRMA 24 Kediri.',
      'Menjalankan disposisi kedinasan dari pimpinan sekolah terkait koordinasi lintas unit dan pengelolaan fasilitas penunjang peserta didik secara bertanggung jawab.',
    ],
  },
  {
    keyword: 'kepanitiaan',
    aliases: ['panitia kegiatan', 'panitia phbi', 'panitia phbn', 'panitia mos', 'panitia mpls'],
    rhk: 'RHK 7',
    timeContext: 'fleksibel',
    templates: [
      'Melaksanakan tugas kepanitiaan acara kedinasan di lingkungan Sekolah Rakyat Terintegrasi 1 Kediri sesuai surat keputusan penetapan panitia.',
      'Mengoordinasikan rangkaian acara kepanitiaan bersama tim kerja sekolah demi suksesnya penyelenggaraan kegiatan peserta didik secara tertib dan lancar.',
    ],
  },
  {
    keyword: 'rapat koordinasi',
    aliases: ['rapat wali asuh', 'koordinasi pengasuhan', 'evaluasi mingguan'],
    rhk: 'RHK 7',
    timeContext: 'fleksibel',
    templates: [
      'Mengikuti rapat koordinasi berkala tim wali asuh dan pengelola asrama untuk mengevaluasi program kerja pengasuhan serta menyamakan persepsi pembinaan karakter siswa.',
      'Melaksanakan pertemuan koordinasi bersama kepala asrama dan staf tenaga kependidikan guna merumuskan tindak lanjut catatan perkembangan peserta didik.',
    ],
  },
];

// Helper: detect time context from string
export function detectTimeContext(text: string): 'pagi' | 'siang' | 'sore' | 'malam' | 'subuh' | null {
  const lower = text.toLowerCase();
  if (lower.includes('subuh') || lower.includes('dini hari') || lower.includes('fajar') || lower.includes('tahajud')) return 'subuh';
  if (lower.includes('malam') || lower.includes('isya') || lower.includes('maghrib') || lower.includes('magrib') || lower.includes('tidur')) return 'malam';
  if (lower.includes('sore') || lower.includes('ashar') || lower.includes('petang')) return 'sore';
  if (lower.includes('siang') || lower.includes('dzuhur') || lower.includes('duhur')) return 'siang';
  if (lower.includes('pagi') || lower.includes('sarapan') || lower.includes('dhuha') || lower.includes('subuh')) return 'pagi';
  return null;
}

// Helper: detect RHK category from string
export function detectRhkCategory(text: string): 'RHK 1' | 'RHK 2' | 'RHK 3' | 'RHK 4' | 'RHK 5' | 'RHK 6' | 'RHK 7' {
  const lower = text.toLowerCase();
  if (lower.includes('khusus') || lower.includes('disabilitas') || lower.includes('inklusi') || lower.includes('abk')) {
    return 'RHK 5';
  }
  if (lower.includes('pelatihan') || lower.includes('workshop') || lower.includes('diklat') || lower.includes('webinar') || lower.includes('kompetensi') || lower.includes('bimtek')) {
    return 'RHK 6';
  }
  if (lower.includes('tugas tambahan') || lower.includes('kepala sekolah') || lower.includes('panitia') || lower.includes('disposisi') || lower.includes('rapat koordinasi')) {
    return 'RHK 7';
  }
  if (
    lower.includes('mengaji') || lower.includes('sholat') || lower.includes('solat') || lower.includes('kajian') ||
    lower.includes('doa') || lower.includes('spiritual') || lower.includes('sakit') || lower.includes('uks') ||
    lower.includes('kesehatan') || lower.includes('olahraga') || lower.includes('senam') || lower.includes('futsal') ||
    lower.includes('konseling') || lower.includes('disiplin') || lower.includes('tata tertib') ||
    lower.includes('apel') || lower.includes('setor') || lower.includes('hafalan') || lower.includes('tahfidz') ||
    lower.includes('kunjungan') || lower.includes('emosional') || lower.includes('perundungan') || lower.includes('bully')
  ) {
    return 'RHK 4';
  }
  if (
    lower.includes('cuci') || lower.includes('bersih') || lower.includes('rapikan') ||
    lower.includes('merapikan') || lower.includes('piket') || lower.includes('laundry') ||
    lower.includes('kemandirian') || lower.includes('kebersihan') || lower.includes('masak') ||
    lower.includes('kasur') || lower.includes('seprai') || lower.includes('lemari') ||
    lower.includes('setrika') || lower.includes('jemur')
  ) {
    return 'RHK 2';
  }
  if (
    lower.includes('belajar') || lower.includes('tugas') || lower.includes('materi') ||
    lower.includes('akademik') || lower.includes('jurnal') || lower.includes('laptop') ||
    lower.includes('refleksi') || lower.includes('sharing') || lower.includes('literasi') ||
    lower.includes('baca buku') || lower.includes('pr')
  ) {
    return 'RHK 1';
  }
  return 'RHK 3';
}

/**
 * Searches the vocabulary bank for matches based on keyword tokens, aliases, and time-of-day.
 */
export function searchVocabularyBank(rawKeyword: string): { deskripsi: string; rhk: string; matchedKeyword: string } | null {
  const clean = rawKeyword.toLowerCase().trim();
  if (!clean) return null;

  const timeContext = detectTimeContext(clean);

  // 1. Direct or partial match prioritizing longer, specific entries first
  const sortedBank = [...VOCABULARY_BANK].sort((a, b) => b.keyword.length - a.keyword.length);

  for (const entry of sortedBank) {
    const isKeywordMatched = clean.includes(entry.keyword);
    const isAliasMatched = entry.aliases?.some(alias => clean.includes(alias.toLowerCase()));

    if (isKeywordMatched || isAliasMatched) {
      // Filter templates matching time context if both specify time
      const compatibleTemplates = entry.templates.filter(tpl => {
        const tplTime = detectTimeContext(tpl);
        if (timeContext && tplTime && timeContext !== tplTime) {
          return false;
        }
        return true;
      });

      const pool = compatibleTemplates.length > 0 ? compatibleTemplates : entry.templates;
      const selected = pool[Math.floor(Math.random() * pool.length)];

      return {
        deskripsi: selected,
        rhk: entry.rhk,
        matchedKeyword: entry.keyword,
      };
    }
  }

  return null;
}

/**
 * Synthesizes a formal, grammatically polished Indonesian civil-service description
 * if no exact vocabulary entry was found. Guarantees 0% failure rate!
 */
export function synthesizeFallbackDeskripsi(rawKeyword: string): { deskripsi: string; rhk: string } {
  const keyword = rawKeyword.toLowerCase().trim();
  const timeContext = detectTimeContext(keyword);
  const rhk = detectRhkCategory(keyword);

  const cleanKeyword = rawKeyword
    .trim()
    .replace(/^(mendampingi|mengawasi|membimbing|melaksanakan|mengikuti)\s+/i, '');
  const capitalized = cleanKeyword.charAt(0).toUpperCase() + cleanKeyword.slice(1);

  let deskripsi = '';
  if (timeContext === 'malam') {
    deskripsi = `Melaksanakan pendampingan kegiatan ${capitalized.toLowerCase()} bersama peserta didik di lingkungan asrama Sekolah Rakyat Terintegrasi 1 Kab. Kediri, memastikan suasana malam hari tetap tertib, aman, kondusif, dan penuh rasa kekeluargaan.`;
  } else if (timeContext === 'pagi' || timeContext === 'subuh') {
    deskripsi = `Melaksanakan pendampingan kegiatan ${capitalized.toLowerCase()} peserta didik pada pagi hari di asrama Sekolah Rakyat Terintegrasi 1 Kab. Kediri dengan disiplin dan tertib guna mempersiapkan siswa mengawali hari dengan penuh semangat.`;
  } else if (timeContext === 'siang') {
    deskripsi = `Melaksanakan pendampingan kegiatan ${capitalized.toLowerCase()} peserta didik pada siang hari di lingkungan asrama Sekolah Rakyat Terintegrasi 1 Kab. Kediri secara tertib, terarah, dan bertanggung jawab.`;
  } else if (timeContext === 'sore') {
    deskripsi = `Melaksanakan pendampingan kegiatan ${capitalized.toLowerCase()} bersama peserta didik pada sore hari di lingkungan asrama Sekolah Rakyat Terintegrasi 1 Kab. Kediri, memastikan seluruh siswa mengikuti dengan tertib dan antusias.`;
  } else {
    deskripsi = `Melaksanakan tugas pendampingan pada kegiatan ${capitalized.toLowerCase()} peserta didik di lingkungan asrama Sekolah Rakyat Terintegrasi 1 Kab. Kediri secara tertib, bertanggung jawab, dan mendukung pembinaan karakter siswa.`;
  }

  return { deskripsi, rhk };
}

// Client-side LocalStorage cache management for learned AI vocabulary
const STORAGE_KEY = 'skp_ai_vocabulary_cache';

export interface LearnedItem {
  kataKunci: string;
  deskripsi: string;
  rhk: string;
  timestamp: number;
}

export function saveLearnedVocabularyLocal(kataKunci: string, deskripsi: string, rhk: string): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const list: LearnedItem[] = raw ? JSON.parse(raw) : [];

    // Avoid exact duplicate
    const exists = list.some(item =>
      item.kataKunci.toLowerCase() === kataKunci.toLowerCase() &&
      item.deskripsi === deskripsi
    );

    if (!exists) {
      list.unshift({
        kataKunci: kataKunci.trim(),
        deskripsi: deskripsi.trim(),
        rhk: rhk.trim(),
        timestamp: Date.now(),
      });
      // Keep up to 200 items in browser cache
      const trimmedList = list.slice(0, 200);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmedList));
    }
  } catch {
    // Ignore storage quota errors
  }
}

export function getLearnedVocabularyLocal(): LearnedItem[] {
  if (typeof window === 'undefined' || !window.localStorage) return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
