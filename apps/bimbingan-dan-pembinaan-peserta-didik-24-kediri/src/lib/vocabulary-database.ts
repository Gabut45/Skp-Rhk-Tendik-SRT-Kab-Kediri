/**
 * Database Kosa Kata & Bank Deskripsi Kegiatan Bimbingan dan Pembinaan Peserta Didik
 * Khusus Lingkungan: Sekolah Rakyat Terintegrasi Kab Kediri
 *
 * Berisi perbendaharaan kata realistis terlengkap untuk tugas Wali Asuh, Tenaga Kependidikan,
 * dan Pembina Karakter Peserta Didik, lengkap dengan variasi kalimat dinamis dan penanganan waktu.
 */

import { LARGE_VOCABULARY_BANK, type CompactVocabItem } from './vocabulary-large-bank.ts';

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
      'Melaksanakan pendampingan makan malam peserta didik di asrama Sekolah Rakyat Terintegrasi Kab Kediri, memastikan asupan nutrisi tercukupi dan seluruh siswa merapikan kembali peralatan makannya.',
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
      'Melaksanakan kegiatan gotong royong membersihkan lingkungan asrama Sekolah Rakyat Terintegrasi Kab Kediri, menanamkan kepedulian lingkungan dan kebersamaan antar-siswa.',
    ],
  },
  {
    keyword: 'mendampingi siswa menyapu',
    aliases: ['menyapu bersama siswa', 'mendampingi menyapu', 'siswa menyapu'],
    rhk: 'RHK 2',
    timeContext: 'fleksibel',
    templates: [
      'Mendampingi dan membimbing peserta didik melaksanakan kegiatan menyapu lantai ruangan maupun area sekitar Sekolah Rakyat Terintegrasi 1 Kab. Kediri agar lingkungan tetap bersih, rapi, dan sehat.',
      'Mengawasi peserta didik saat melaksanakan piket menyapu bersama secara tertib, mengarahkan penyapuan hingga sudut ruangan serta pengumpulan sampah ke tempat pembuangan secara bertanggung jawab.',
    ],
  },
  {
    keyword: 'menyapu aula',
    aliases: ['mendampingi siswa menyapu aula', 'menyapu gedung aula', 'sapu aula', 'piket menyapu aula'],
    rhk: 'RHK 2',
    timeContext: 'fleksibel',
    templates: [
      'Mendampingi dan membimbing peserta didik melaksanakan kegiatan menyapu lantai aula Sekolah Rakyat Terintegrasi 1 Kab. Kediri secara menyeluruh agar aula selalu bersih, bebas debu, dan siap digunakan untuk kegiatan bersama.',
      'Melaksanakan pengawasan piket kebersihan menyapu aula asrama bersama peserta didik secara tertib serta memastikan sampah terkumpul rapi di tempat sampah.',
    ],
  },
  {
    keyword: 'membersihkan aula',
    aliases: ['bersih aula', 'bersih-bersih aula', 'piket aula', 'membersihkan gedung aula'],
    rhk: 'RHK 2',
    timeContext: 'fleksibel',
    templates: [
      'Mendampingi peserta didik melaksanakan kegiatan membersihkan aula Sekolah Rakyat Terintegrasi 1 Kab. Kediri, meliputi menyapu dan mengepel lantai, menata kursi serta meja, dan memastikan ruangan kembali bersih dan nyaman.',
      'Mengoordinasikan peserta didik dalam kerja bakti membersihkan aula secara gotong royong guna menjaga kebersihan dan kelayakan fasilitas bersama asrama.',
    ],
  },
  {
    keyword: 'membersihkan masjid',
    aliases: ['bersih masjid', 'membersihkan mushola', 'bersih-bersih masjid', 'kerja bakti masjid', 'piket masjid'],
    rhk: 'RHK 2',
    timeContext: 'fleksibel',
    templates: [
      'Mendampingi dan membimbing peserta didik membersihkan area masjid Sekolah Rakyat Terintegrasi 1 Kab. Kediri, mulai dari menata sajadah dan karpet shaf, menyapu serta mengepel lantai, hingga membersihkan area tempat wudhu agar tercipta suasana ibadah yang bersih dan khusyuk.',
      'Melaksanakan kegiatan gotong royong membersihkan masjid bersama peserta didik guna menanamkan kecintaan menjaga kesucian rumah ibadah serta membiasakan pola hidup bersih.',
    ],
  },
  {
    keyword: 'membersihkan kelas',
    aliases: ['bersih kelas', 'piket kelas', 'bersih-bersih kelas', 'membersihkan ruang kelas'],
    rhk: 'RHK 2',
    timeContext: 'fleksibel',
    templates: [
      'Mendampingi peserta didik melaksanakan piket membersihkan ruang kelas Sekolah Rakyat Terintegrasi 1 Kab. Kediri, meliputi menyapu lantai, merapikan meja dan kursi belajar, membersihkan papan tulis, serta membuang sampah pada tempatnya.',
      'Mengawasi dan membimbing siswa membersihkan ruang kelas agar lingkungan belajar senantiasa bersih, rapi, sehat, dan mendukung konsentrasi belajar peserta didik.',
    ],
  },
  {
    keyword: 'menyapu kelas',
    aliases: ['mendampingi siswa menyapu kelas', 'sapu kelas', 'menyapu ruang kelas', 'piket menyapu kelas'],
    rhk: 'RHK 2',
    timeContext: 'fleksibel',
    templates: [
      'Mendampingi peserta didik melaksanakan tugas menyapu lantai ruang kelas secara bergiliran dan teliti agar ruang belajar tetap bersih, bebas debu, dan nyaman ditempati.',
      'Membimbing peserta didik menyapu lantai kelas hingga kolong bangku dan sudut ruangan dengan tertib serta membuang kotoran ke tempat sampah yang tersedia.',
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
    keyword: 'mendampingi belajar',
    aliases: ['mendampingi siswa belajar', 'pendampingan belajar', 'membimbing belajar'],
    rhk: 'RHK 1',
    timeContext: 'fleksibel',
    templates: [
      'Melaksanakan pendampingan belajar bagi peserta didik di ruang belajar asrama maupun kelas Sekolah Rakyat Terintegrasi 1 Kab. Kediri, menciptakan suasana kondusif, membantu memahami materi pelajaran yang sulit, serta memotivasi ketekunan belajar siswa.',
      'Mendampingi peserta didik dalam kegiatan belajar terstruktur, mengecek kelengkapan catatan dan pengerjaan tugas sekolah, serta memastikan seluruh siswa fokus mengikuti sesi belajar dengan baik.',
    ],
  },
  {
    keyword: 'pembagian raport',
    aliases: ['pembagian rapor', 'pengambilan raport', 'penerimaan raport', 'mendampingi pembagian raport', 'pembagian hasil belajar'],
    rhk: 'RHK 1',
    timeContext: 'fleksibel',
    templates: [
      'Mendampingi dan memfasilitasi kegiatan pembagian raport hasil belajar peserta didik kepada orang tua/wali murid di Sekolah Rakyat Terintegrasi 1 Kab. Kediri secara tertib, membantu kelancaran registrasi tamu, serta berkoordinasi mengenai perkembangan akademik dan sikap anak asuh.',
      'Melaksanakan pendampingan agenda pembagian raport semester dengan ramah dan teratur, mendukung komunikasi konstruktif antara wali kelas, wali asuh, dan orang tua demi peningkatan prestasi belajar siswa.',
    ],
  },
  {
    keyword: 'mendampingi outing class',
    aliases: ['mendampingi kegiatan outing class'],
    rhk: 'RHK 1',
    timeContext: 'fleksibel',
    templates: [
      'Mendampingi secara penuh seluruh peserta didik selama pelaksanaan kegiatan Outing Class dari keberangkatan hingga kepulangan, mengecek kelengkapan presensi siswa secara berkala, menjaga ketertiban di lokasi kunjungan, serta membimbing siswa mengamati materi belajar di lapangan.',
      'Melaksanakan tugas pengawalan dan pendampingan Outing Class bersama peserta didik Sekolah Rakyat Terintegrasi 1 Kab. Kediri guna memastikan keamanan, kedisiplinan, dan terserapnya pengalaman pembelajaran luar kelas secara optimal.',
    ],
  },
  {
    keyword: 'outing class',
    aliases: ['kegiatan outing class', 'pembelajaran luar kelas'],
    rhk: 'RHK 1',
    timeContext: 'fleksibel',
    templates: [
      'Mendampingi peserta didik dalam kegiatan Outing Class (pembelajaran di luar kelas) Sekolah Rakyat Terintegrasi 1 Kab. Kediri secara terarah, menjaga keselamatan dan ketertiban rombongan, serta memfasilitasi pengamatan materi edukatif di lapangan.',
      'Melaksanakan pendampingan kegiatan Outing Class guna memperluas wawasan kontekstual peserta didik dengan tetap mengutamakan ketertiban, kekompakan, dan keamanan siswa.',
    ],
  },
  {
    keyword: 'mendampingi kokurikuler membatik',
    aliases: ['kokurikuler membatik', 'ekstrakurikuler membatik', 'kegiatan membatik', 'membatik'],
    rhk: 'RHK 1',
    timeContext: 'fleksibel',
    templates: [
      'Mendampingi dan membimbing peserta didik dalam kegiatan kokurikuler membatik di Sekolah Rakyat Terintegrasi 1 Kab. Kediri, mulai dari pembuatan pola motif, pencantingan malam dengan memperhatikan keselamatan kerja, hingga proses pewarnaan kain guna menumbuhkan kreativitas dan pelestarian budaya.',
      'Melaksanakan pendampingan praktik kokurikuler membatik bersama peserta didik, mengawasi ketertiban penggunaan peralatan membatik, serta memotivasi ketelatenan dan apresiasi seni kriya siswa.',
    ],
  },
  {
    keyword: 'mendampingi ekstrakurikuler peternakan',
    aliases: ['ekstrakurikuler peternakan', 'ekstra peternakan', 'ekskul peternakan', 'mendampingi ekstra peternakan', 'keahlian peternakan'],
    rhk: 'RHK 1',
    timeContext: 'fleksibel',
    templates: [
      'Mendampingi peserta didik dalam kegiatan ekstrakurikuler peternakan di Sekolah Rakyat Terintegrasi 1 Kab. Kediri, membimbing teknik perawatan hewan ternak, pengaturan pakan, menjaga kebersihan area kandang, serta menanamkan rasa tanggung jawab dan keterampilan agribisnis.',
      'Melaksanakan pengawasan dan pendampingan praktik ekstrakurikuler peternakan peserta didik agar seluruh rangkaian perawatan ternak berjalan aman, higienis, dan membekali siswa keterampilan vokasional nyata.',
    ],
  },
  {
    keyword: 'mendampingi ekstrakurikuler perhotelan',
    aliases: ['menjadi ekstrakurikuler perhotelan', 'ekstrakurikuler perhotelan', 'ekstra perhotelan', 'ekskul perhotelan', 'mendampingi ekstra perhotelan', 'keahlian perhotelan'],
    rhk: 'RHK 1',
    timeContext: 'fleksibel',
    templates: [
      'Mendampingi dan membina peserta didik dalam kegiatan ekstrakurikuler perhotelan di Sekolah Rakyat Terintegrasi 1 Kab. Kediri, melatih keterampilan tata graha (housekeeping), penataan kamar yang rapi, etika keramahan pelayanan tamu (hospitality), serta kedisiplinan standar profesi.',
      'Melaksanakan pendampingan praktik keahlian ekstrakurikuler perhotelan guna membekali peserta didik keterampilan layanan akomodasi yang teliti, santun, dan profesional.',
    ],
  },
  {
    keyword: 'mendampingi ekstrakurikuler pertanian',
    aliases: ['ekstrakurikuler pertanian', 'ekstra pertanian', 'ekskul pertanian', 'mendampingi ekstra pertanian', 'keahlian pertanian'],
    rhk: 'RHK 1',
    timeContext: 'fleksibel',
    templates: [
      'Mendampingi peserta didik dalam kegiatan ekstrakurikuler pertanian di lahan praktik Sekolah Rakyat Terintegrasi 1 Kab. Kediri, meliputi pengolahan media tanam, penyemaian bibit, penyiraman, pemupukan, dan pemeliharaan tanaman guna menumbuhkan keterampilan budidaya serta kemandirian pangan.',
      'Melaksanakan pengawasan dan bimbingan praktik ekstrakurikuler pertanian peserta didik agar siswa terampil, tekun, dan peduli terhadap kelestarian lingkungan.',
    ],
  },
  {
    keyword: 'keahlian tata boga',
    aliases: ['mendampingi keahlian tata boga', 'ekstrakurikuler tata boga', 'ekstra tata boga', 'ekskul tata boga', 'mendampingi ekstra tata boga', 'tata boga'],
    rhk: 'RHK 1',
    timeContext: 'fleksibel',
    templates: [
      'Mendampingi peserta didik dalam pembelajaran dan praktik keahlian tata boga di Sekolah Rakyat Terintegrasi 1 Kab. Kediri, membimbing teknik persiapan bahan pangan, pengolahan serta penyajian hidangan yang higienis dan menarik, sekaligus mengawasi keselamatan penggunaan peralatan dapur.',
      'Melaksanakan pendampingan pengembangan keahlian tata boga peserta didik guna mengasah keterampilan kuliner, kerja sama tim dapur, serta kedisiplinan kebersihan area praktik pasca-memasak.',
    ],
  },
  {
    keyword: 'mendampingi ekstrakurikuler kecantikan',
    aliases: ['ekstrakurikuler kecantikan', 'ekstra kecantikan', 'ekskul kecantikan', 'keahlian kecantikan', 'tata kecantikan', 'mendampingi keahlian kecantikan'],
    rhk: 'RHK 1',
    timeContext: 'fleksibel',
    templates: [
      'Mendampingi peserta didik dalam kegiatan ekstrakurikuler tata kecantikan di Sekolah Rakyat Terintegrasi 1 Kab. Kediri, membimbing praktik perawatan diri dan tata rias secara higienis, rapi, serta memastikan penggunaan alat dan bahan sesuai prosedur keamanan.',
      'Melaksanakan pengawasan dan pendampingan ekstrakurikuler kecantikan guna mengasah ketelitian, estetika, serta keterampilan vokasional peserta didik secara positif dan profesional.',
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
    aliases: ['briefing pagi', 'baris pagi', 'apel keberangkatan', 'mengikuti apel pagi', 'mendampingi apel pagi'],
    rhk: 'RHK 4',
    timeContext: 'pagi',
    templates: [
      'Memimpin dan mendampingi kegiatan apel pagi peserta didik di halaman Sekolah Rakyat Terintegrasi 1 Kab. Kediri sebelum berangkat sekolah, memeriksa presensi kehadiran, kerapian seragam dan atribut, kebersihan diri, serta memberikan motivasi semangat belajar.',
      'Melaksanakan apel pagi di halaman asrama, melakukan pengecekan barisan dan jumlah siswa, menyampaikan arahan kedisiplinan harian, dan mengoordinasikan keberangkatan siswa menuju ruang kelas.',
      'Mendampingi apel pagi peserta didik secara tertib dan khidmat untuk menanamkan sikap sigap, disiplin waktu, dan kepatuhan terhadap norma tata tertib sekolah.',
    ],
  },
  {
    keyword: 'apel malam',
    aliases: ['briefing malam', 'cek kehadiran malam', 'apel istirahat', 'mengikuti apel malam', 'mendampingi apel malam'],
    rhk: 'RHK 4',
    timeContext: 'malam',
    templates: [
      'Melaksanakan kegiatan apel malam bersama seluruh peserta didik di asrama Sekolah Rakyat Terintegrasi 1 Kab. Kediri, mengecek kelengkapan kehadiran siswa, mengevaluasi rangkaian kegiatan sepanjang hari, serta memberikan arahan persiapan istirahat tidur.',
      'Memimpin apel malam di asrama sebagai sarana pembinaan kedisiplinan, pengecekan kondisi fisik maupun psikis anak asuh, serta memastikan situasi asrama aman dan kondusif menjelang jam tidur.',
      'Mengkoordinasikan apel malam peserta didik secara tertib, memastikan seluruh siswa hadir lengkap sesuai data kamar, menyampaikan informasi penting esok hari, dan memimpin doa penutup.',
    ],
  },
  {
    keyword: 'mendamaikan baris berbaris',
    aliases: ['mendampingi baris berbaris', 'menertibkan baris berbaris', 'latihan baris berbaris', 'baris berbaris', 'pbb'],
    rhk: 'RHK 4',
    timeContext: 'fleksibel',
    templates: [
      'Mendampingi, menertibkan, dan membina kekompakan peserta didik dalam kegiatan baris-berbaris di Sekolah Rakyat Terintegrasi 1 Kab. Kediri, memastikan keselarasan langkah, sikap siap yang tegap, serta menjaga suasana latihan tetap rukun dan disiplin.',
      'Melaksanakan pendampingan serta menertibkan barisan peserta didik selama latihan baris-berbaris agar tercipta keseragaman gerak, kerja sama tim yang harmonis, dan kedisiplinan tinggi.',
    ],
  },
  {
    keyword: 'mendampingi baris lkbb',
    aliases: ['mendampingi lkbb(berbaris)', 'mendampingi lkbb', 'latihan lkbb', 'baris lkbb', 'lkbb'],
    rhk: 'RHK 4',
    timeContext: 'fleksibel',
    templates: [
      'Mendampingi dan membimbing peserta didik dalam kegiatan Latihan Keterampilan Baris-Berbaris (LKBB) di Sekolah Rakyat Terintegrasi 1 Kab. Kediri guna melatih kedisiplinan, ketegasan sikap, ketahanan fisik, serta kekompakan formasi barisan.',
      'Mengawasi dan memotivasi peserta didik saat latihan baris LKBB, membantu menyelaraskan ketepatan gerakan dasar PBB, respons terhadap aba-aba, dan menjaga ketertiban regu.',
    ],
  },
  {
    keyword: 'ekstrakurikuler ipsi',
    aliases: ['ekstra ipsi', 'ekskul ipsi', 'mendampingi ekstrakurikuler ipsi', 'pencak silat ipsi', 'silat ipsi', 'ipsi'],
    rhk: 'RHK 4',
    timeContext: 'fleksibel',
    templates: [
      'Mendampingi dan mengawasi peserta didik dalam kegiatan ekstrakurikuler Pencak Silat IPSI di Sekolah Rakyat Terintegrasi 1 Kab. Kediri, memastikan latihan jurus dan fisik berlangsung aman serta menanamkan nilai sportivitas, pengendalian emosi, dan budi pekerti luhur.',
      'Melaksanakan pendampingan latihan rutin ekstrakurikuler bela diri IPSI bersama pelatih, memantau kedisiplinan sikap serta menjaga aspek keselamatan peserta didik selama sesi latihan berlangsung.',
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
    keyword: 'melerai siswa',
    aliases: ['melerai siswa bertengkar', 'melerai pertengkaran', 'melerai perselisihan', 'melerai perkelahian siswa'],
    rhk: 'RHK 4',
    timeContext: 'fleksibel',
    templates: [
      'Bertindak sigap, tegas, dan persuasif dalam melerai peserta didik yang terlibat perselisihan di lingkungan asrama/sekolah, memisahkan pihak terkait ke area aman, menenangkan kondisi emosional siswa, dan menindaklanjuti dengan pembinaan damai.',
      'Melaksanakan penanganan segera dengan melerai peserta didik yang berselisih paham agar situasi kembali aman dan kondusif, dilanjutkan mediasi serta edukasi tata tertib asrama.',
    ],
  },
  {
    keyword: 'mendamaikan siswa yang bertengkar',
    aliases: ['mendamaikan siswa', 'mendamaikan siswa yang berselisih faham', 'mediasi siswa bertengkar', 'mendamaikan perselisihan siswa'],
    rhk: 'RHK 4',
    timeContext: 'fleksibel',
    templates: [
      'Melaksanakan mediasi dan pendampingan konseling secara adil, bijak, dan kekeluargaan untuk mendamaikan peserta didik yang bertengkar di Sekolah Rakyat Terintegrasi 1 Kab. Kediri, menggali duduk persoalan secara objektif, serta membangun kesepakatan saling memaafkan dan hidup rukun.',
      'Menangani perselisihan antar-peserta didik melalui pembinaan afektif dan mediasi damai agar konflik terselesaikan tuntas, memulihkan keharmonisan antarsantri, serta mencegah terulangnya pertengkaran.',
    ],
  },
  {
    keyword: 'mediasi konflik',
    aliases: ['penyelesaian masalah siswa', 'mediasi perselisihan', 'damai siswa'],
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
    keyword: 'menjaga ketertiban kunjungan',
    aliases: ['ketertiban kunjungan', 'menjaga ketertiban kunjungan orang tua', 'pengawasan kunjungan', 'tertib kunjungan'],
    rhk: 'RHK 4',
    timeContext: 'fleksibel',
    templates: [
      'Melaksanakan pengawasan dan menjaga ketertiban selama kegiatan kunjungan orang tua/wali di Sekolah Rakyat Terintegrasi 1 Kab. Kediri, mengatur alur kedatangan tamu, memeriksa kesesuaian barang bawaan sesuai tata tertib asrama, serta memastikan suasana kunjungan aman dan kondusif.',
      'Menjaga ketertiban dan kelancaran agenda kunjungan wali murid di lingkungan asrama, memastikan seluruh tamu mematuhi area serta jadwal kunjungan yang telah ditetapkan.',
    ],
  },
  {
    keyword: 'kunjungan orang tua',
    aliases: ['sambang asrama', 'besuk siswa', 'pertemuan wali murid', 'wali santri datang', 'kunjungan wali murid'],
    rhk: 'RHK 4',
    timeContext: 'fleksibel',
    templates: [
      'Mendampingi dan memfasilitasi kegiatan kunjungan orang tua/wali peserta didik di asrama Sekolah Rakyat Terintegrasi 1 Kab. Kediri, memastikan tata tertib kunjungan dipatuhi, serta melaporkan perkembangan belajar, karakter, dan kesehatan putra-putrinya.',
      'Menerima kedatangan orang tua dalam agenda kunjungan di asrama, menjalin komunikasi harmonis mengenai progres pembinaan peserta didik secara ramah dan transparan.',
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
    keyword: 'mendampingi siswa sakit di uks',
    aliases: ['menjaga siswa sakit di uks', 'merawat siswa sakit di uks', 'siswa sakit di uks', 'pendampingan siswa sakit di uks'],
    rhk: 'RHK 4',
    timeContext: 'fleksibel',
    templates: [
      'Mendampingi dan memantau kondisi kesehatan peserta didik yang sedang sakit di ruang UKS Sekolah Rakyat Terintegrasi 1 Kab. Kediri, melakukan pemeriksaan suhu tubuh, memberikan pertolongan pertama, memastikan konsumsi obat serta makanan hangat, dan berkoordinasi dengan petugas kesehatan.',
      'Melaksanakan pendampingan intensif terhadap peserta didik yang mengalami keluhan sakit di ruang UKS agar mendapatkan perawatan awal yang layak, istirahat yang nyaman, dan pemulihan kondisi kesehatan.',
    ],
  },
  {
    keyword: 'istirahat di uks',
    aliases: ['menemani siswa istirahat di uks', 'istirahat sakit di uks', 'pemulihan di uks'],
    rhk: 'RHK 4',
    timeContext: 'fleksibel',
    templates: [
      'Mendampingi dan memantau peserta didik yang sedang beristirahat pemulihan kondisi kesehatan di ruang UKS Sekolah Rakyat Terintegrasi 1 Kab. Kediri, memastikan ruangan tetap tenang, kebutuhan air minum dan makanan hangat terpenuhi, serta keluhan kesehatannya terpantau berkala.',
      'Melaksanakan pengawasan terhadap peserta didik yang beristirahat di ruang UKS agar memperoleh pemulihan optimal dan segera berkoordinasi dengan tenaga medis apabila diperlukan penanganan lanjutan.',
    ],
  },
  {
    keyword: 'menjaga siswa sakit di rumah sakit',
    aliases: ['menunggu siswa di rumah sakit', 'mendampingi siswa di rumah sakit', 'menjaga siswa rawat inap', 'siswa sakit di rumah sakit'],
    rhk: 'RHK 4',
    timeContext: 'fleksibel',
    templates: [
      'Melaksanakan tugas menjaga dan mendampingi peserta didik yang sedang menjalani perawatan medis/rawat inap di rumah sakit secara penuh perhatian, memantau perkembangan kondisi kesehatan, memenuhi kebutuhan harian siswa, serta melaporkan perkembangannya secara berkala kepada pimpinan sekolah dan orang tua.',
      'Mendampingi peserta didik yang dirawat di rumah sakit dengan sigap dan empatik, membantu koordinasi pelayanan dengan tim medis rumah sakit, serta memberikan dukungan moril selama masa penyembuhan.',
    ],
  },
  {
    keyword: 'menjaga siswa sakit di puskesmas',
    aliases: ['menjaga siswa sakut di puskesmas', 'mengantarkan periksa ke puskesmas', 'mendampingi siswa di puskesmas', 'siswa sakit di puskesmas', 'siswa sakut di puskesmas'],
    rhk: 'RHK 4',
    timeContext: 'fleksibel',
    templates: [
      'Mengantar, menjaga, dan mendampingi peserta didik yang menjalani pemeriksaan serta perawatan medis di Puskesmas, memastikan prosedur layanan kesehatan berjalan lancar, menebus obat sesuai anjuran dokter, serta melaporkan kondisi siswa kepada pimpinan Sekolah Rakyat Terintegrasi 1 Kab. Kediri.',
      'Melaksanakan pendampingan penuh tanggung jawab dalam menjaga peserta didik yang sakit di Puskesmas hingga kondisinya stabil dan aman untuk kembali beristirahat di asrama.',
    ],
  },
  {
    keyword: 'mengantar berobat',
    aliases: ['mengantarkan berobat', 'antar berobat', 'mengantar siswa berobat'],
    rhk: 'RHK 4',
    timeContext: 'fleksibel',
    templates: [
      'Mengantar dan mendampingi peserta didik yang mengalami keluhan kesehatan untuk berobat ke fasilitas kesehatan terdekat, memastikan siswa memperoleh pemeriksaan dokter, resep obat yang tepat, serta kembali ke asrama dengan aman.',
      'Melaksanakan pengantaran dan pendampingan siswa berobat serta mengoordinasikan catatan tindak lanjut medis dan jadwal minum obat bersama petugas UKS asrama.',
    ],
  },
  {
    keyword: 'memeriksakan siswa',
    aliases: ['memeriksakan kesehatan siswa', 'memeriksakan siswa sakit', 'periksa kesehatan siswa', 'mengantar periksa siswa'],
    rhk: 'RHK 4',
    timeContext: 'fleksibel',
    templates: [
      'Mendampingi dan memeriksakan kondisi kesehatan peserta didik kepada petugas UKS maupun tenaga medis di fasilitas kesehatan terdekat guna memperoleh diagnosis awal, penanganan medis, dan pemberian obat yang sesuai.',
      'Melaksanakan fasilitasi pemeriksaan kesehatan bagi peserta didik yang menunjukkan gejala kurang sehat agar segera ditangani secara tepat dan tidak mengganggu aktivitas belajar.',
    ],
  },
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
    keyword: 'sholat di masjid',
    aliases: ['sholat berjamaah di masjid', 'sholat di masjid asrama', 'menuju masjid untuk sholat'],
    rhk: 'RHK 3',
    timeContext: 'fleksibel',
    templates: [
      'Mendampingi peserta didik melaksanakan ibadah sholat berjamaah di masjid Sekolah Rakyat Terintegrasi 1 Kab. Kediri dengan tertib dan khusyuk, mengawal keberangkatan menuju masjid, memastikan kesempurnaan wudhu, kerapian shaf, serta menjaga ketenangan selama beribadah.',
      'Mengawal dan membimbing seluruh peserta didik melaksanakan sholat berjamaah di masjid secara tepat waktu guna menanamkan kedisiplinan ibadah dan akhlakul karimah.',
    ],
  },
  {
    keyword: 'istirahat di asrama',
    aliases: ['istirahat asrama', 'pendampingan istirahat di asrama', 'jam istirahat di asrama'],
    rhk: 'RHK 3',
    timeContext: 'fleksibel',
    templates: [
      'Mendampingi dan mengawasi waktu istirahat peserta didik di lingkungan asrama Sekolah Rakyat Terintegrasi 1 Kab. Kediri, memastikan suasana kamar dan blok asrama tetap tenang, aman, tertib, dan kondusif guna memulihkan kebugaran fisik siswa.',
      'Melaksanakan pengawasan jam istirahat peserta didik di asrama agar seluruh siswa memanfaatkan waktu istirahat dengan baik serta tidak menimbulkan kegaduhan yang mengganggu penghuni kamar lain.',
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
    keyword: 'mendampingi menonton',
    aliases: ['menonton di aula', 'menonton bioskop di aula', 'mendampingi siswa menonton', 'menonton bersama', 'menonton film edukatif'],
    rhk: 'RHK 3',
    timeContext: 'fleksibel',
    templates: [
      'Mendampingi dan mengawasi peserta didik dalam kegiatan menonton tayangan/film edukatif bersama di aula maupun ruang bersama Sekolah Rakyat Terintegrasi 1 Kab. Kediri, memastikan konten tontonan mendidik, menjaga ketertiban tempat duduk, serta mengarahkan siswa memetik pesan moral positif.',
      'Melaksanakan pendampingan kegiatan menonton bersama peserta didik sebagai sarana hiburan sehat, penguatan rasa kekeluargaan, dan penyegaran mental terarah di lingkungan asrama.',
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
      'Melakukan pengawasan keamanan berkala di lingkungan asrama Sekolah Rakyat Terintegrasi Kab Kediri selama jam istirahat malam demi menjamin keselamatan dan kenyamanan seluruh peserta didik.',
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
      'Melaksanakan tugas tambahan kedinasan sesuai surat penugasan / arahan Kepala Sekolah dalam rangka mendukung kelancaran operasional dan program asrama Sekolah Rakyat Terintegrasi Kab Kediri.',
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

// Helper: normalizer for common user typos in Indonesian civil-service keywords
export function normalizeKeyword(raw: string): string {
  let s = raw.toLowerCase().replace(/\s+/g, ' ').trim();
  // Prefix typos
  s = s.replace(/\bmendampin[h|g]i\b/g, 'mendampingi');
  s = s.replace(/\bmendapngi\b/g, 'mendampingi');
  s = s.replace(/\bmendapingi\b/g, 'mendampingi');
  s = s.replace(/\bmngawasi\b/g, 'mengawasi');
  s = s.replace(/\bmengawsi\b/g, 'mengawasi');
  s = s.replace(/\bmembinbing\b/g, 'membimbing');
  s = s.replace(/\bmembiimbing\b/g, 'membimbing');
  s = s.replace(/\bmelaksnakan\b/g, 'melaksanakan');
  s = s.replace(/\bmelaksankan\b/g, 'melaksanakan');
  // Common action typos
  s = s.replace(/\bolhraga\b/g, 'olahraga');
  s = s.replace(/\bolahrga\b/g, 'olahraga');
  s = s.replace(/\bsholat\b/g, 'sholat');
  s = s.replace(/\bsolat\b/g, 'sholat');
  s = s.replace(/\bsalat\b/g, 'sholat');
  s = s.replace(/\bdhuhur\b/g, 'dzuhur');
  s = s.replace(/\bduhur\b/g, 'dzuhur');
  s = s.replace(/\bzuhur\b/g, 'dzuhur');
  s = s.replace(/\bmagrib\b/g, 'maghrib');
  s = s.replace(/\bmahgrib\b/g, 'maghrib');
  s = s.replace(/\btahfid\b/g, 'tahfidz');
  s = s.replace(/\btahfiz\b/g, 'tahfidz');
  s = s.replace(/\bsakut\b/g, 'sakit');
  s = s.replace(/\bpuskemas\b/g, 'puskesmas');
  s = s.replace(/\bekstrakulikuler\b/g, 'ekstrakurikuler');
  s = s.replace(/\bklas\b/g, 'kelas');
  s = s.replace(/\bkls\b/g, 'kelas');
  s = s.replace(/\basrma\b/g, 'asrama');
  s = s.replace(/\bmkn\b/g, 'makan');
  s = s.replace(/\bsrpan\b/g, 'sarapan');
  return s;
}

// Helper: extract target class, room, or group from input (e.g. "kelas 7-4", "kamar 3")
export function extractTargetEntity(text: string): { targetLabel: string | null; targetPhrase: string } {
  // Matches "kelas 7-4", "kelas 7 4", "kelas 7A", "kelas 8.2", "kelas VII", "kelas IX"
  const classMatch = text.match(/\b(kelas\s*[0-9ivx]+[\w\-_./]*)\b/i);
  if (classMatch) {
    const rawClass = classMatch[1].trim();
    return { targetLabel: rawClass, targetPhrase: `peserta didik ${rawClass}` };
  }

  // Matches "kamar 1", "kamar 3", "kamar melati"
  const roomMatch = text.match(/\b(kamar\s*[\w\-_]+)\b/i);
  if (roomMatch) {
    const rawRoom = roomMatch[1].trim();
    return { targetLabel: rawRoom, targetPhrase: `santri penghuni ${rawRoom}` };
  }

  // Matches "asrama putra", "asrama putri"
  const dormMatch = text.match(/\b(asrama\s*(putra|putri))\b/i);
  if (dormMatch) {
    return { targetLabel: dormMatch[1].trim(), targetPhrase: `santri ${dormMatch[1].trim()}` };
  }

  return { targetLabel: null, targetPhrase: 'peserta didik' };
}

// Helper: detect RHK category accurately with strict domain separation
export function detectRhkCategory(text: string): 'RHK 1' | 'RHK 2' | 'RHK 3' | 'RHK 4' | 'RHK 5' | 'RHK 6' | 'RHK 7' {
  const lower = normalizeKeyword(text);

  // 1. Inklusi / Kebutuhan Khusus
  if (
    lower.includes('inklusi') || lower.includes('disabilitas') ||
    lower.includes('berkebutuhan khusus') || lower.includes('abk') ||
    lower.includes('autis') || lower.includes('slow learner') || lower.includes('tuna')
  ) {
    return 'RHK 5';
  }

  // 2. Pengembangan Profesi Guru & Wali Asuh
  if (
    lower.includes('pelatihan') || lower.includes('workshop') || lower.includes('diklat') ||
    lower.includes('webinar') || lower.includes('kompetensi') || lower.includes('bimtek') ||
    lower.includes('studi banding')
  ) {
    return 'RHK 6';
  }

  // 3. Tugas Tambahan / Kepanitiaan Dinas Pimpinan
  if (
    lower.includes('tugas tambahan') || lower.includes('kepala sekolah') ||
    lower.includes('panitia') || lower.includes('disposisi') || lower.includes('anbk') ||
    lower.includes('ppdb') || lower.includes('satgas')
  ) {
    return 'RHK 7';
  }

  // 4. Kemandirian & Tata Graha (RHK 2)
  // Check laundry/cleaning FIRST only if washing/cleaning actions are explicitly mentioned
  if (
    lower.includes('cuci') || lower.includes('mencuci') || lower.includes('laundry') ||
    lower.includes('setrika') || lower.includes('menyetrika') || lower.includes('jemur') ||
    lower.includes('menjemur') || lower.includes('piring') || lower.includes('ompreng') ||
    lower.includes('kasur') || lower.includes('ranjang') || lower.includes('seprai') ||
    lower.includes('sprei') || lower.includes('selimut') || lower.includes('kloset') ||
    lower.includes('kamar mandi') || lower.includes('piket kamar') || lower.includes('piket kebersihan') ||
    lower.includes('menyapu') || lower.includes('sapu') || lower.includes('mengepel') ||
    lower.includes('membersihkan') || lower.includes('bersih-bersih') || lower.includes('kerja bakti') ||
    lower.includes('gotong royong') || lower.includes('tata graha') || lower.includes('loker') ||
    lower.includes('sandal') || (lower.includes('sepatu') && !lower.includes('olahraga'))
  ) {
    return 'RHK 2';
  }

  // 5. Keterampilan Vokasi, Kokurikuler, Outing Class & Raport (RHK 1)
  if (
    lower.includes('membatik') || lower.includes('kokurikuler') ||
    lower.includes('tata boga') || lower.includes('perhotelan') ||
    lower.includes('pertanian') || lower.includes('peternakan') ||
    lower.includes('kecantikan') || lower.includes('coding') ||
    lower.includes('robotik') || lower.includes('outing class') ||
    lower.includes('raport') || lower.includes('rapor')
  ) {
    return 'RHK 1';
  }

  // 6. Olahraga, Bela Diri IPSI, Baris-Berbaris/LKBB & Kebugaran Jasmani (RHK 4 vs RHK 1)
  if (
    lower.includes('olahraga') || lower.includes('senam') || lower.includes('futsal') ||
    lower.includes('voli') || lower.includes('bulutangkis') || lower.includes('badminton') ||
    lower.includes('lari') || lower.includes('jogging') || lower.includes('kebugaran') ||
    lower.includes('ipsi') || lower.includes('pencak silat') || lower.includes('silat') ||
    lower.includes('lkbb') || lower.includes('baris berbaris') || lower.includes('baris-berbaris')
  ) {
    if (lower.includes('pjok') || lower.includes('pelajaran olahraga') || lower.includes('teori olahraga')) {
      return 'RHK 1';
    }
    return 'RHK 4';
  }

  // 7. Spiritual, Rohani, Konseling, Konflik, Apel, Kunjungan & Kesehatan UKS/RS/Puskesmas (RHK 4)
  if (
    lower.includes('mengaji') || lower.includes('ngaji') || lower.includes('tadarus') ||
    lower.includes('tahfidz') || lower.includes('tahsin') || lower.includes('hafalan') ||
    lower.includes('kajian') || lower.includes('spiritual') || lower.includes('rohani') ||
    lower.includes('doa bersama') || lower.includes('istighosah') || lower.includes('sakit') ||
    lower.includes('uks') || lower.includes('puskesmas') || lower.includes('rumah sakit') ||
    lower.includes('berobat') || lower.includes('memeriksakan') || lower.includes('kesehatan') ||
    lower.includes('demam') || lower.includes('obat') || lower.includes('konseling') ||
    lower.includes('afektif') || lower.includes('disiplin') || lower.includes('tata tertib') ||
    lower.includes('razia') || lower.includes('homesick') || lower.includes('rindu') ||
    lower.includes('kunjungan orang tua') || lower.includes('ketertiban kunjungan') ||
    lower.includes('wali murid') || lower.includes('emosional') || lower.includes('perundungan') ||
    lower.includes('bully') || lower.includes('melerai') || lower.includes('bertengkar') ||
    lower.includes('mendamaikan') || lower.includes('berselisih') || lower.includes('apel') ||
    lower.includes('pramuka') || lower.includes('rebana')
  ) {
    return 'RHK 4';
  }

  // 8. Pembelajaran & Akademik (RHK 1)
  if (
    lower.includes('belajar') || lower.includes('tugas') || lower.includes('materi') ||
    lower.includes('akademik') || lower.includes('jurnal') || lower.includes('laptop') ||
    lower.includes('refleksi') || lower.includes('literasi') || lower.includes('perpustakaan') ||
    lower.includes('baca buku') || lower.includes('pr') || lower.includes('ulangan') ||
    lower.includes('ujian') || lower.includes('matematika') || lower.includes('ipa') ||
    lower.includes('ips') || lower.includes('fisika') || lower.includes('kimia') ||
    lower.includes('biologi') || lower.includes('bahasa') || lower.includes('lomba')
  ) {
    return 'RHK 1';
  }

  // 9. Rutinitas Asrama & Ibadah Wajib (RHK 3)
  return 'RHK 3';
}

// Fast lookup index for massive 50,000+ vocabulary database
let _largeBankIndexed = false;
const _exactLargeMap = new Map<string, CompactVocabItem>();
const _tokensMap = new Map<string, CompactVocabItem[]>();

function ensureLargeBankIndex() {
  if (_largeBankIndexed) return;
  for (let i = 0; i < LARGE_VOCABULARY_BANK.length; i++) {
    const item = LARGE_VOCABULARY_BANK[i];
    const key = item.k.toLowerCase().trim();
    _exactLargeMap.set(key, item);

    // Index aliases
    if (item.a) {
      for (const al of item.a) {
        _exactLargeMap.set(al.toLowerCase().trim(), item);
      }
    }

    // Index individual words/tokens with broad representation per token
    const words = key.split(/\s+/).filter(w => w.length > 2);
    for (const w of words) {
      let list = _tokensMap.get(w);
      if (!list) {
        list = [];
        _tokensMap.set(w, list);
      }
      if (list.length < 80) {
        list.push(item);
      }
    }
  }
  _largeBankIndexed = true;
}

function matchPhrase(haystack: string, needle: string): boolean {
  const n = needle.toLowerCase().trim();
  if (!n) return false;
  if (n.length <= 5) {
    const escaped = n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp(`(?:^|\\s)${escaped}(?:$|\\s)`).test(haystack);
  }
  return haystack.includes(n);
}

/**
 * Searches the vocabulary bank with typo tolerance, longest-phrase priority, RHK consistency, and situational target integration.
 */
export function searchVocabularyBank(rawKeyword: string): { deskripsi: string; rhk: string; matchedKeyword: string } | null {
  const normalized = normalizeKeyword(rawKeyword);
  if (!normalized) return null;

  const { targetLabel } = extractTargetEntity(rawKeyword);
  const expectedRhk = detectRhkCategory(normalized);
  const timeContext = detectTimeContext(normalized);

  // If a specific target group (like "kelas 7-4" or "kamar 3") was entered,
  // prioritize synthesis so the specific class/room is naturally integrated into the description.
  if (targetLabel) {
    const synthesized = synthesizeFallbackDeskripsi(rawKeyword);
    return {
      deskripsi: synthesized.deskripsi,
      rhk: synthesized.rhk,
      matchedKeyword: normalized,
    };
  }

  // 0. Exact match in standard curated bank first (highest priority, full template variations)
  for (const entry of VOCABULARY_BANK) {
    const isExactKw = normalized === entry.keyword.toLowerCase();
    const isExactAlias = entry.aliases?.some(al => normalized === al.toLowerCase());
    if (isExactKw || isExactAlias) {
      const compatibleTemplates = entry.templates.filter(tpl => {
        const tplTime = detectTimeContext(tpl);
        if (timeContext && tplTime && timeContext !== tplTime) return false;
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

  // 1a. Exact match in massive curated/pre-seeded bank
  ensureLargeBankIndex();
  const exactItem = _exactLargeMap.get(normalized);
  if (exactItem) {
    return {
      deskripsi: exactItem.d,
      rhk: exactItem.r,
      matchedKeyword: exactItem.k,
    };
  }

  // 1b. Longest specific phrase match across standard curated bank (scored by matched phrase length, RHK match, and timeContext)
  const phraseCandidates: { entry: VocabularyEntry; matchLen: number; rhkScore: number }[] = [];
  for (const entry of VOCABULARY_BANK) {
    let bestLen = 0;
    if (matchPhrase(normalized, entry.keyword)) {
      bestLen = Math.max(bestLen, entry.keyword.length);
    }
    if (entry.aliases) {
      for (const alias of entry.aliases) {
        if (matchPhrase(normalized, alias)) {
          bestLen = Math.max(bestLen, alias.length);
        }
      }
    }
    if (bestLen > 0) {
      phraseCandidates.push({
        entry,
        matchLen: bestLen,
        rhkScore: entry.rhk === expectedRhk ? 1 : 0,
      });
    }
  }

  if (phraseCandidates.length > 0) {
    phraseCandidates.sort((a, b) => {
      if (b.matchLen !== a.matchLen) return b.matchLen - a.matchLen;
      return b.rhkScore - a.rhkScore;
    });
    const best = phraseCandidates[0].entry;
    const compatibleTemplates = best.templates.filter(tpl => {
      const tplTime = detectTimeContext(tpl);
      if (timeContext && tplTime && timeContext !== tplTime) return false;
      return true;
    });
    const pool = compatibleTemplates.length > 0 ? compatibleTemplates : best.templates;
    const selected = pool[Math.floor(Math.random() * pool.length)];
    return {
      deskripsi: selected,
      rhk: best.rhk,
      matchedKeyword: best.keyword,
    };
  }

  // 2. Token / Word intersection search in massive pre-seeded database with strict RHK category matching
  const cleanTokens = normalized.split(/\s+/).filter(w => w.length > 2 && !['dan', 'yang', 'dari', 'untuk', 'pada', 'dengan'].includes(w));
  const candidates: CompactVocabItem[] = [];

  for (const token of cleanTokens) {
    const matchedItems = _tokensMap.get(token);
    if (matchedItems) {
      for (const m of matchedItems) {
        if (m.r === expectedRhk && !candidates.includes(m)) {
          candidates.push(m);
        }
      }
    }
  }

  if (candidates.length > 0) {
    candidates.sort((a, b) => {
      let scoreA = 0;
      let scoreB = 0;
      for (const t of cleanTokens) {
        if (a.k.includes(t)) scoreA++;
        if (b.k.includes(t)) scoreB++;
      }
      return scoreB - scoreA;
    });

    const compatible = candidates.filter(c => {
      if (!timeContext || !c.t || c.t === 'fleksibel') return true;
      return c.t === timeContext;
    });

    const chosen = (compatible.length > 0 ? compatible : candidates)[0];
    return {
      deskripsi: chosen.d,
      rhk: chosen.r,
      matchedKeyword: chosen.k,
    };
  }

  // 3. Fallback to intelligent contextual synthesizer
  const synthesized = synthesizeFallbackDeskripsi(rawKeyword);
  return {
    deskripsi: synthesized.deskripsi,
    rhk: synthesized.rhk,
    matchedKeyword: normalized,
  };
}

/**
 * Returns exact vocabulary count statistics per RHK
 */
export function getVocabularyBreakdown() {
  const counts: Record<string, number> = {
    'RHK 1': 0,
    'RHK 2': 0,
    'RHK 3': 0,
    'RHK 4': 0,
    'RHK 5': 0,
    'RHK 6': 0,
    'RHK 7': 0,
    total: 0,
  };

  // Standard bank
  for (const item of VOCABULARY_BANK) {
    counts[item.rhk] = (counts[item.rhk] || 0) + 1;
    counts.total++;
  }

  // Large bank
  for (const item of LARGE_VOCABULARY_BANK) {
    counts[item.r] = (counts[item.r] || 0) + 1;
    counts.total++;
  }

  return counts;
}

/**
 * Intelligent contextual synthesizer: Generates precise, formal civil-service descriptions
 * with exact grammatical matching, typo normalization, and situational target integration.
 */
export function synthesizeFallbackDeskripsi(rawKeyword: string): { deskripsi: string; rhk: string } {
  const normalized = normalizeKeyword(rawKeyword);
  const { targetLabel, targetPhrase } = extractTargetEntity(rawKeyword);
  const rhk = detectRhkCategory(normalized);
  const timeContext = detectTimeContext(normalized);

  // 1. Olahraga & Kebugaran Jasmani (RHK 4 atau RHK 1)
  if (
    normalized.includes('olahraga') || normalized.includes('senam') ||
    normalized.includes('futsal') || normalized.includes('voli') ||
    normalized.includes('bulutangkis') || normalized.includes('badminton') ||
    normalized.includes('lari') || normalized.includes('jogging') ||
    normalized.includes('kebugaran')
  ) {
    let sportActivity = 'olahraga dan kebugaran jasmani';
    if (normalized.includes('futsal')) sportActivity = 'olahraga futsal bersama';
    else if (normalized.includes('voli')) sportActivity = 'olahraga bola voli';
    else if (normalized.includes('bulutangkis') || normalized.includes('badminton')) sportActivity = 'olahraga bulutangkis';
    else if (normalized.includes('senam')) sportActivity = 'senam kebugaran jasmani';
    else if (normalized.includes('lari') || normalized.includes('jogging')) sportActivity = 'olahraga lari dan jalan santai';

    if (rhk === 'RHK 1') {
      return {
        deskripsi: `Mendampingi kegiatan pembelajaran dan bimbingan praktik Pendidikan Jasmani, Olahraga, dan Kesehatan (PJOK) materi ${sportActivity} ${targetPhrase} di Sekolah Rakyat Terintegrasi 1 Kab. Kediri secara tertib dan bersemangat.`,
        rhk: 'RHK 1',
      };
    }

    return {
      deskripsi: `Mendampingi pelaksanaan kegiatan ${sportActivity} ${targetPhrase} di lapangan Sekolah Rakyat Terintegrasi 1 Kab. Kediri, memastikan seluruh siswa berpartisipasi aktif secara tertib, sportif, dan menjaga keselamatan fisik.`,
      rhk: 'RHK 4',
    };
  }

  // 2. Bimbingan Belajar, Kokurikuler, Vokasi & Akademik (RHK 1)
  if (rhk === 'RHK 1') {
    if (normalized.includes('raport') || normalized.includes('rapor')) {
      return {
        deskripsi: `Mendampingi dan memfasilitasi kegiatan pembagian raport hasil belajar ${targetPhrase} kepada orang tua/wali murid di Sekolah Rakyat Terintegrasi 1 Kab. Kediri secara tertib dan komunikatif.`,
        rhk: 'RHK 1',
      };
    }
    if (normalized.includes('outing class')) {
      return {
        deskripsi: `Mendampingi ${targetPhrase} dalam kegiatan Outing Class (pembelajaran luar kelas) Sekolah Rakyat Terintegrasi 1 Kab. Kediri guna memperluas wawasan belajar secara aman dan tertib.`,
        rhk: 'RHK 1',
      };
    }
    if (normalized.includes('membatik')) {
      return {
        deskripsi: `Mendampingi ${targetPhrase} dalam kegiatan kokurikuler membatik di Sekolah Rakyat Terintegrasi 1 Kab. Kediri, membimbing ketelatenan teknik membatik dan menjaga keselamatan kerja.`,
        rhk: 'RHK 1',
      };
    }
    if (normalized.includes('tata boga')) {
      return {
        deskripsi: `Mendampingi ${targetPhrase} dalam praktik keahlian tata boga di Sekolah Rakyat Terintegrasi 1 Kab. Kediri, membimbing pengolahan makanan yang higienis dan keselamatan dapur.`,
        rhk: 'RHK 1',
      };
    }
    if (normalized.includes('perhotelan')) {
      return {
        deskripsi: `Mendampingi ${targetPhrase} dalam kegiatan ekstrakurikuler keahlian perhotelan di Sekolah Rakyat Terintegrasi 1 Kab. Kediri guna melatih tata graha dan etika pelayanan tamu.`,
        rhk: 'RHK 1',
      };
    }
    if (normalized.includes('peternakan')) {
      return {
        deskripsi: `Mendampingi ${targetPhrase} dalam kegiatan ekstrakurikuler peternakan di Sekolah Rakyat Terintegrasi 1 Kab. Kediri, membimbing pemeliharaan ternak dan kebersihan kandang.`,
        rhk: 'RHK 1',
      };
    }
    if (normalized.includes('pertanian')) {
      return {
        deskripsi: `Mendampingi ${targetPhrase} dalam kegiatan ekstrakurikuler pertanian di Sekolah Rakyat Terintegrasi 1 Kab. Kediri, mulai dari pengolahan media tanam hingga perawatan tanaman.`,
        rhk: 'RHK 1',
      };
    }
    if (normalized.includes('kecantikan')) {
      return {
        deskripsi: `Mendampingi ${targetPhrase} dalam kegiatan ekstrakurikuler tata kecantikan di Sekolah Rakyat Terintegrasi 1 Kab. Kediri guna mengasah keterampilan perawatan dan estetika secara higienis.`,
        rhk: 'RHK 1',
      };
    }

    let subject = 'materi pelajaran';
    if (normalized.includes('matematika')) subject = 'Matematika';
    else if (normalized.includes('ipa') || normalized.includes('fisika') || normalized.includes('kimia') || normalized.includes('biologi')) subject = 'Ilmu Pengetahuan Alam (IPA)';
    else if (normalized.includes('ips') || normalized.includes('sejarah') || normalized.includes('geografi') || normalized.includes('ekonomi')) subject = 'Ilmu Pengetahuan Sosial (IPS)';
    else if (normalized.includes('bahasa indonesia')) subject = 'Bahasa Indonesia';
    else if (normalized.includes('bahasa inggris')) subject = 'Bahasa Inggris';
    else if (normalized.includes('bahasa arab')) subject = 'Bahasa Arab';
    else if (normalized.includes('ppkn') || normalized.includes('pancasila')) subject = 'Pendidikan Pancasila';
    else if (normalized.includes('tik') || normalized.includes('komputer') || normalized.includes('laptop')) subject = 'Teknologi Informasi & Komputer (TIK)';
    else if (normalized.includes('literasi') || normalized.includes('buku') || normalized.includes('perpustakaan')) subject = 'Literasi Membaca';

    return {
      deskripsi: `Mendampingi sesi bimbingan belajar dan pengerjaan tugas sekolah bidang studi ${subject} ${targetPhrase} di ruang belajar asrama Sekolah Rakyat Terintegrasi 1 Kab. Kediri, memastikan setiap siswa memahami konsep materi dengan baik dan bersemangat.`,
      rhk: 'RHK 1',
    };
  }

  // 3. Kemandirian, Kebersihan & Tata Graha (RHK 2)
  if (rhk === 'RHK 2') {
    let cleanAction = 'kebersihan dan kerapian';
    if (normalized.includes('menyapu') && normalized.includes('aula')) cleanAction = 'menyapu dan membersihkan area aula';
    else if (normalized.includes('menyapu') && normalized.includes('kelas')) cleanAction = 'menyapu lantai ruang kelas hingga bersih';
    else if (normalized.includes('membersihkan') && normalized.includes('masjid')) cleanAction = 'membersihkan area masjid dan tempat wudhu';
    else if (normalized.includes('membersihkan') && normalized.includes('aula')) cleanAction = 'membersihkan dan merapikan area aula';
    else if (normalized.includes('membersihkan') && normalized.includes('kelas')) cleanAction = 'membersihkan ruang kelas dan merapikan bangku belajar';
    else if (normalized.includes('menyapu')) cleanAction = 'menyapu lantai ruangan dan area sekitar hingga bersih';
    else if (normalized.includes('cuci pakaian') || normalized.includes('laundry')) cleanAction = 'mencuci dan menjemur pakaian seragam secara mandiri';
    else if (normalized.includes('setrika')) cleanAction = 'menyetrika dan merapikan pakaian seragam ke dalam lemari';
    else if (normalized.includes('cuci piring') || normalized.includes('piring') || normalized.includes('ompreng')) cleanAction = 'mencuci dan merapikan peralatan makan mandiri';
    else if (normalized.includes('kamar mandi') || normalized.includes('kloset') || normalized.includes('toilet')) cleanAction = 'membersihkan dan menyikat sanitasi kamar mandi asrama';
    else if (normalized.includes('kamar') || normalized.includes('kasur') || normalized.includes('ranjang') || normalized.includes('sprei')) cleanAction = 'merapikan tempat tidur dan membersihkan kamar asrama';
    else if (normalized.includes('sepatu') || normalized.includes('sandal')) cleanAction = 'mencuci dan menata alas kaki rapi pada rak sepatu';

    return {
      deskripsi: `Mendampingi dan membimbing ${targetPhrase} melaksanakan kegiatan kemandirian ${cleanAction} di lingkungan Sekolah Rakyat Terintegrasi 1 Kab. Kediri guna menanamkan nilai kedisiplinan, kebersihan, dan tanggung jawab.`,
      rhk: 'RHK 2',
    };
  }

  // 4. Spiritual, Rohani, Konseling, Ketertiban & Kesehatan (RHK 4)
  if (rhk === 'RHK 4') {
    if (normalized.includes('ipsi') || normalized.includes('silat')) {
      return {
        deskripsi: `Mendampingi ${targetPhrase} dalam kegiatan ekstrakurikuler Pencak Silat IPSI di Sekolah Rakyat Terintegrasi 1 Kab. Kediri guna membina kebugaran fisik, sportivitas, dan pengendalian diri.`,
        rhk: 'RHK 4',
      };
    }
    if (normalized.includes('lkbb') || normalized.includes('baris')) {
      return {
        deskripsi: `Mendampingi dan menertibkan ${targetPhrase} dalam latihan baris-berbaris / LKBB di Sekolah Rakyat Terintegrasi 1 Kab. Kediri guna melatih kedisiplinan, keselarasan gerak, dan kekompakan tim.`,
        rhk: 'RHK 4',
      };
    }
    if (normalized.includes('melerai') || normalized.includes('bertengkar') || normalized.includes('mendamaikan') || normalized.includes('berselisih')) {
      return {
        deskripsi: `Melaksanakan tindakan cepat melerai serta memediasi secara bijak dan kekeluargaan untuk mendamaikan ${targetPhrase} yang berselisih di lingkungan Sekolah Rakyat Terintegrasi 1 Kab. Kediri agar kembali rukun dan kondusif.`,
        rhk: 'RHK 4',
      };
    }
    if (normalized.includes('rumah sakit')) {
      return {
        deskripsi: `Menjaga dan mendampingi ${targetPhrase} yang sedang menjalani perawatan medis di rumah sakit secara penuh perhatian serta melaporkan perkembangan kondisinya kepada pimpinan dan orang tua.`,
        rhk: 'RHK 4',
      };
    }
    if (normalized.includes('puskesmas')) {
      return {
        deskripsi: `Mengantar, menjaga, dan mendampingi ${targetPhrase} yang memeriksakan kesehatan/dirawat di Puskesmas hingga memperoleh penanganan medis yang tepat.`,
        rhk: 'RHK 4',
      };
    }
    if (normalized.includes('berobat') || normalized.includes('memeriksakan')) {
      return {
        deskripsi: `Mengantar serta mendampingi ${targetPhrase} untuk memeriksakan kesehatan dan berobat guna mendapatkan penanganan medis sedini mungkin.`,
        rhk: 'RHK 4',
      };
    }
    if (normalized.includes('tahfidz') || normalized.includes('hafalan') || normalized.includes('tahsin') || normalized.includes('mengaji') || normalized.includes('tadarus')) {
      return {
        deskripsi: `Mendampingi dan menyimak kegiatan setoran hafalan Al-Qur'an (Tahfidz) ${targetPhrase} di mushola asrama Sekolah Rakyat Terintegrasi 1 Kab. Kediri dengan lancar, tertib, dan penuh kekhusyukan.`,
        rhk: 'RHK 4',
      };
    }
    if (normalized.includes('sakit') || normalized.includes('uks') || normalized.includes('kesehatan') || normalized.includes('demam') || normalized.includes('obat')) {
      return {
        deskripsi: `Mendampingi dan memantau ${targetPhrase} yang mengalami keluhan kesehatan di ruang UKS asrama Sekolah Rakyat Terintegrasi 1 Kab. Kediri, memberikan pertolongan pertama, memastikan istirahat cukup, dan berkoordinasi dengan petugas kesehatan.`,
        rhk: 'RHK 4',
      };
    }
    if (normalized.includes('kunjungan')) {
      return {
        deskripsi: `Menjaga ketertiban serta mendampingi agenda kunjungan orang tua/wali ${targetPhrase} di lingkungan Sekolah Rakyat Terintegrasi 1 Kab. Kediri agar berlangsung tertib, aman, dan komunikatif.`,
        rhk: 'RHK 4',
      };
    }
    if (normalized.includes('apel')) {
      const apelWaktu = timeContext === 'malam' ? 'apel malam' : timeContext === 'pagi' ? 'apel pagi' : 'apel';
      return {
        deskripsi: `Memimpin dan mendampingi pelaksanaan ${apelWaktu} ${targetPhrase} di lingkungan Sekolah Rakyat Terintegrasi 1 Kab. Kediri, melakukan presensi kehadiran, pengecekan kesiapan, serta menyampaikan arahan kedisiplinan.`,
        rhk: 'RHK 4',
      };
    }
    if (normalized.includes('konseling') || normalized.includes('afektif') || normalized.includes('motivasi') || normalized.includes('homesick') || normalized.includes('rindu')) {
      return {
        deskripsi: `Melaksanakan sesi bimbingan konseling dan pendampingan personal bagi ${targetPhrase} di lingkungan asrama Sekolah Rakyat Terintegrasi 1 Kab. Kediri guna memberikan penguatan motivasi belajar dan ketahanan mental.`,
        rhk: 'RHK 4',
      };
    }
    if (normalized.includes('disiplin') || normalized.includes('razia') || normalized.includes('tata tertib')) {
      return {
        deskripsi: `Melaksanakan pengawasan kedisiplinan dan penegakan tata tertib asrama bagi ${targetPhrase} di Sekolah Rakyat Terintegrasi 1 Kab. Kediri guna menciptakan lingkungan belajar yang tertib, aman, dan kondusif.`,
        rhk: 'RHK 4',
      };
    }
    return {
      deskripsi: `Melaksanakan pembinaan karakter spiritual dan budi pekerti luhur bagi ${targetPhrase} di lingkungan Sekolah Rakyat Terintegrasi 1 Kab. Kediri secara tertib dan berkelanjutan.`,
      rhk: 'RHK 4',
    };
  }

  // 5. Rutinitas Asrama, Ibadah Sholat & Makan (RHK 3)
  if (normalized.includes('sholat') || normalized.includes('solat') || normalized.includes('jamaah')) {
    let sholatName = 'sholat';
    if (normalized.includes('subuh')) sholatName = 'sholat Subuh';
    else if (normalized.includes('dzuhur') || normalized.includes('duhur')) sholatName = 'sholat Dzuhur';
    else if (normalized.includes('ashar')) sholatName = 'sholat Ashar';
    else if (normalized.includes('maghrib')) sholatName = 'sholat Maghrib';
    else if (normalized.includes('isya')) sholatName = 'sholat Isya';
    else if (normalized.includes('dhuha')) sholatName = 'sholat Dhuha';
    else if (normalized.includes('tahajud')) sholatName = 'sholat Tahajud';

    const tempatSholat = normalized.includes('masjid') ? 'masjid' : 'mushola asrama';
    return {
      deskripsi: `Mendampingi pelaksanaan ibadah ${sholatName} berjamaah bersama ${targetPhrase} di ${tempatSholat} Sekolah Rakyat Terintegrasi 1 Kab. Kediri, dilanjutkan dengan wirid bersama dan pembinaan karakter santri secara khusyuk.`,
      rhk: 'RHK 3',
    };
  }

  if (normalized.includes('makan') || normalized.includes('sarapan')) {
    let mealTime = 'bersama';
    if (normalized.includes('malam')) mealTime = 'makan malam';
    else if (normalized.includes('siang')) mealTime = 'makan siang';
    else if (normalized.includes('pagi') || normalized.includes('sarapan')) mealTime = 'sarapan pagi';

    return {
      deskripsi: `Mendampingi kegiatan ${mealTime} bersama ${targetPhrase} di ruang makan asrama Sekolah Rakyat Terintegrasi 1 Kab. Kediri, memastikan ketertiban antrean, penerapan adab makan islami, dan asupan nutrisi tercukupi.`,
      rhk: 'RHK 3',
    };
  }

  if (normalized.includes('tidur') || normalized.includes('patroli')) {
    return {
      deskripsi: `Melaksanakan pengawasan jam istirahat malam santri dan patroli keliling lingkungan asrama Sekolah Rakyat Terintegrasi 1 Kab. Kediri, memastikan seluruh peserta didik telah beristirahat di kamar secara aman, tertib, dan kondusif.`,
      rhk: 'RHK 3',
    };
  }

  if (normalized.includes('apel') || normalized.includes('upacara')) {
    return {
      deskripsi: `Mendampingi pelaksanaan apel kedisiplinan ${targetPhrase} di halaman kampus Sekolah Rakyat Terintegrasi 1 Kab. Kediri, memeriksa presensi kehadiran dan kesiapan sikap santri sebelum memulai rangkaian kegiatan.`,
      rhk: 'RHK 3',
    };
  }

  // General fallback
  const cleanKeyword = normalized
    .replace(/^(mendampingi|mengawasi|membimbing|melaksanakan|mengikuti)\s+/i, '')
    .trim();
  const capitalized = cleanKeyword ? cleanKeyword.charAt(0).toUpperCase() + cleanKeyword.slice(1) : 'kegiatan harian';

  let timeDesc = 'secara tertib, bertanggung jawab, dan mendukung pembinaan karakter siswa';
  if (timeContext === 'malam') timeDesc = 'pada malam hari di lingkungan asrama Sekolah Rakyat Terintegrasi 1 Kab. Kediri dalam suasana yang aman, tertib, dan kondusif';
  else if (timeContext === 'pagi' || timeContext === 'subuh') timeDesc = 'pada pagi hari di asrama Sekolah Rakyat Terintegrasi 1 Kab. Kediri dengan disiplin dan penuh semangat';
  else if (timeContext === 'siang') timeDesc = 'pada siang hari di lingkungan asrama Sekolah Rakyat Terintegrasi 1 Kab. Kediri secara tertib dan terarah';
  else if (timeContext === 'sore') timeDesc = 'pada sore hari di lingkungan asrama Sekolah Rakyat Terintegrasi 1 Kab. Kediri dengan antusias dan tertib';

  return {
    deskripsi: `Melaksanakan pendampingan kegiatan ${capitalized.toLowerCase()} bersama ${targetPhrase} di Sekolah Rakyat Terintegrasi 1 Kab. Kediri ${timeDesc}.`,
    rhk: rhk || 'RHK 3',
  };
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
      // Keep up to 1,000 items in browser cache
      const trimmedList = list.slice(0, 1000);
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
