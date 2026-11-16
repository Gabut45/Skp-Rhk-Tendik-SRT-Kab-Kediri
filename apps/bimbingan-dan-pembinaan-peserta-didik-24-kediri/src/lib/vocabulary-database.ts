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
  {
    keyword: 'makan sahur',
    aliases: ['sahur bersama', 'pendampingan sahur', 'makan sahur bersama'],
    rhk: 'RHK 3',
    timeContext: 'subuh',
    templates: [
      'Mendampingi peserta didik melaksanakan makan sahur bersama di ruang makan asrama Sekolah Rakyat Terintegrasi 1 Kab. Kediri pada dini hari dengan tertib, memastikan asupan gizi dan kecukupan minum terjaga agar siswa kuat menjalankan ibadah puasa.',
      'Mengawasi jalannya makan sahur peserta didik secara tertib dan penuh kekeluargaan, membimbing doa niat berpuasa, serta merapikan peralatan makan sebelum waktu Subuh.',
    ],
  },
  {
    keyword: 'berbuka puasa',
    aliases: ['buka puasa', 'buka bersama', 'takjil puasa'],
    rhk: 'RHK 3',
    timeContext: 'sore',
    templates: [
      'Mendampingi peserta didik pada waktu berbuka puasa bersama di ruang makan asrama Sekolah Rakyat Terintegrasi 1 Kab. Kediri, memimpin doa berbuka puasa, menjaga ketertiban antrean hidangan, serta mengarahkan siswa untuk melaksanakan sholat Maghrib berjamaah.',
      'Memfasilitasi dan mengawasi kegiatan berbuka puasa bersama peserta didik dengan suasana hangat dan penuh rasa syukur agar seluruh siswa memperoleh hidangan berbuka tepat waktu.',
    ],
  },
  {
    keyword: 'mendata peserta puasa',
    aliases: ['data peserta puasa', 'pendataan siswa puasa', 'rekap peserta puasa'],
    rhk: 'RHK 3',
    timeContext: 'fleksibel',
    templates: [
      'Melaksanakan pendataan peserta didik yang menjalankan ibadah puasa wajib maupun sunnah di asrama Sekolah Rakyat Terintegrasi 1 Kab. Kediri guna memastikan koordinasi penyiapan konsumsi sahur dan berbuka puasa dengan bagian dapur berjalan akurat dan tepat sasaran.',
      'Mencatat dan memverifikasi daftar nama peserta didik yang berpuasa agar distribusi takjil, menu sahur, serta pembinaan ibadah selama berpuasa berlangsung tertib.',
    ],
  },
  {
    keyword: 'makan siang di kantin',
    aliases: ['makan siang dengan tertib'],
    rhk: 'RHK 3',
    timeContext: 'siang',
    templates: [
      'Mendampingi peserta didik melaksanakan makan siang di kantin/ruang makan Sekolah Rakyat Terintegrasi 1 Kab. Kediri dengan tertib, membiasakan antre teratur, berdoa sebelum dan sesudah makan, serta merapikan peralatan makan.',
      'Mengawasi ketertiban peserta didik saat makan siang di kantin sekolah, memastikan seluruh siswa memperoleh porsi gizi seimbang dan menjaga kebersihan meja makan.',
    ],
  },
  {
    keyword: 'makan malam dengan tertib',
    aliases: ['makan malam tertib'],
    rhk: 'RHK 3',
    timeContext: 'malam',
    templates: [
      'Mendampingi dan mengawasi peserta didik melaksanakan makan malam dengan tertib di ruang makan asrama Sekolah Rakyat Terintegrasi 1 Kab. Kediri, menanamkan kebiasaan antre rapi, adab makan santun, berdoa, dan membersihkan meja makan.',
      'Membimbing peserta didik menjaga ketertiban selama makan malam berlangsung sehingga tercipta suasana kebersamaan yang nyaman dan penuh rasa syukur.',
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
    aliases: ['jumatan', 'sholat jum\'at', 'sholat jum\'at berjamaah', 'sholat jumat berjamaah'],
    rhk: 'RHK 3',
    timeContext: 'siang',
    templates: [
      'Mendampingi peserta didik putra melaksanakan ibadah Sholat Jum\'at berjamaah di masjid Sekolah Rakyat Terintegrasi 1 Kab. Kediri, memastikan kerapian busana muslim, kesempurnaan wudhu, serta ketertiban selama khutbah dan sholat.',
      'Melaksanakan pendampingan dan pengawalan peserta didik menuju masjid untuk menunaikan sholat Jum\'at berjamaah secara khidmat dan tepat waktu.',
    ],
  },
  {
    keyword: 'sholat di asrama',
    aliases: ['sholat berjamaah di asrama', 'sholat di mushola asrama'],
    rhk: 'RHK 3',
    timeContext: 'fleksibel',
    templates: [
      'Mendampingi peserta didik melaksanakan ibadah sholat fardhu berjamaah di lingkungan/mushola asrama Sekolah Rakyat Terintegrasi 1 Kab. Kediri, menertibkan shaf sholat, memastikan kekhusyukan, dan memimpin doa bersama seusai sholat.',
      'Mengawasi ketertiban dan kedisiplinan waktu sholat berjamaah peserta didik di asrama guna membiasakan pelaksanaan ibadah tepat pada waktunya.',
    ],
  },
  {
    keyword: 'sholat',
    aliases: ['ibadah sholat', 'sholat berjamaah', 'salat'],
    rhk: 'RHK 3',
    timeContext: 'fleksibel',
    templates: [
      'Melaksanakan pendampingan ibadah sholat berjamaah bersama peserta didik di masjid/mushola asrama, memastikan ketertiban shaf, kekhusyukan pelaksanaan, serta ketepatan waktu.',
      'Mendampingi dan mengawasi pelaksanaan sholat wajib berjamaah peserta didik, memberikan bimbingan tata cara wudhu yang benar dan doa-doa selepas sholat.',
    ],
  },
  {
    keyword: 'adzan subuh',
    aliases: ['mendampingi adzan subuh'],
    rhk: 'RHK 3',
    timeContext: 'subuh',
    templates: [
      'Membimbing dan mendampingi peserta didik yang bertugas mengumandangkan adzan Subuh di masjid/mushola asrama Sekolah Rakyat Terintegrasi 1 Kab. Kediri tepat waktu guna membangkitkan semangat ibadah fajar.',
      'Melatih keberanian, ketepatan lafadz, dan merdunya suara peserta didik saat bertugas melantunkan adzan Subuh sebelum sholat Subuh berjamaah.',
    ],
  },
  {
    keyword: 'adzan maghrib',
    aliases: ['adzan magrib', 'mendampingi adzan maghrib', 'mendampingi adzan magrib'],
    rhk: 'RHK 3',
    timeContext: 'malam',
    templates: [
      'Membimbing dan mendampingi peserta didik yang terjadwal mengumandangkan adzan Maghrib di masjid/mushola asrama Sekolah Rakyat Terintegrasi 1 Kab. Kediri secara tepat waktu sebagai penanda masuknya waktu sholat Maghrib.',
      'Mengawasi kesiapan muadzin dari kalangan peserta didik menjelang waktu Maghrib serta memastikan kumandang adzan dilakukan dengan tartil dan khidmat.',
    ],
  },
  {
    keyword: 'mendampingi adzan',
    aliases: ['latihan adzan', 'jadwal adzan'],
    rhk: 'RHK 3',
    timeContext: 'fleksibel',
    templates: [
      'Membimbing dan mendampingi peserta didik yang bertugas mengumandangkan adzan di masjid/mushola asrama tepat waktu guna melatih keberanian, ketepatan makhraj, dan kedisiplinan beribadah.',
      'Mengoordinasikan jadwal petugas adzan harian peserta didik dan memberikan pendampingan langsung sebelum pelaksanaan sholat berjamaah dimulai.',
    ],
  },
  {
    keyword: 'mendampingi kegiatan di masjid',
    aliases: ['kegiatan di masjid', 'pembinaan di masjid'],
    rhk: 'RHK 3',
    timeContext: 'fleksibel',
    templates: [
      'Mendampingi dan mengawasi peserta didik dalam mengikuti rangkaian kegiatan ibadah dan pembinaan keagamaan di masjid Sekolah Rakyat Terintegrasi 1 Kab. Kediri agar berjalan tertib, khidmat, dan kondusif.',
      'Melaksanakan pendampingan ketertiban serta partisipasi aktif peserta didik selama pelaksanaan agenda kegiatan di masjid kampus/asrama.',
    ],
  },
  {
    keyword: 'mengaji di masjid',
    aliases: ['ngaji di masjid', 'mengaji Al-Quran di masjid'],
    rhk: 'RHK 4',
    timeContext: 'fleksibel',
    templates: [
      'Mendampingi dan menyimak kegiatan mengaji Al-Qur\'an bersama peserta didik di masjid Sekolah Rakyat Terintegrasi 1 Kab. Kediri, membimbing ketepatan bacaan tajwid dan makharijul huruf dengan suasana religius yang khidmat.',
      'Melaksanakan pendampingan tadarus serta pembelajaran membaca Al-Qur\'an bagi peserta didik di masjid secara tertib, santun, dan penuh kekhusyukan.',
    ],
  },
  {
    keyword: 'mengaji di kelas',
    aliases: ['ngaji di kelas', 'pembinaan mengaji di kelas'],
    rhk: 'RHK 4',
    timeContext: 'fleksibel',
    templates: [
      'Mendampingi peserta didik mengikuti kegiatan mengaji Al-Qur\'an di ruang kelas Sekolah Rakyat Terintegrasi 1 Kab. Kediri, membimbing kelancaran tilawah, perbaikan hukum tajwid, serta ketertiban suasana belajar mengaji.',
      'Membimbing kelompok belajar mengaji peserta didik di ruang kelas agar setiap siswa dapat membaca Al-Qur\'an maupun Iqra\' dengan tartil dan benar.',
    ],
  },
  {
    keyword: 'mengaji',
    aliases: ['tilawah', 'baca quran', 'mengkaji quran', 'mengaji bersama', 'mendapatkan mengaji'],
    rhk: 'RHK 4',
    timeContext: 'fleksibel',
    templates: [
      'Melaksanakan pendampingan kegiatan mengaji Al-Qur\'an bersama peserta didik dengan metode tartil, mencakup perbaikan bacaan tajwid, makharijul huruf, dan pemahaman adab membaca Al-Qur\'an.',
      'Membimbing peserta didik dalam tilawah Al-Qur\'an harian secara bersama-sama, menyimak bacaan secara bergantian, serta menumbuhkan kecintaan terhadap Al-Qur\'an.',
    ],
  },
  {
    keyword: 'yasin dan tahlil',
    aliases: ['pembacaan yasin dan tahlil', 'yasin tahlil'],
    rhk: 'RHK 4',
    timeContext: 'malam',
    templates: [
      'Mendampingi dan memimpin peserta didik melaksanakan pembacaan Surat Yasin dan tahlil bersama di masjid/mushola Sekolah Rakyat Terintegrasi 1 Kab. Kediri dengan penuh kekhidmatan sebagai pembiasaan amaliah rutin asrama.',
      'Mengawasi ketertiban dan kekhusyukan peserta didik selama kegiatan pembacaan Yasin dan tahlil bersama serta mendoakan keberkahan belajar bagi seluruh keluarga besar sekolah.',
    ],
  },
  {
    keyword: 'melantunkan mahalul qiyam',
    aliases: ['mahalul qiyam dengan khidmat', 'mahalul qiyam dengan kidmat', 'mahalul qiyam'],
    rhk: 'RHK 4',
    timeContext: 'malam',
    templates: [
      'Mendampingi peserta didik melantunkan shalawat Mahalul Qiyam dengan penuh khidmat dan tertib di Sekolah Rakyat Terintegrasi 1 Kab. Kediri guna menumbuhkan kecintaan kepada Rasulullah SAW serta memperhalus budi pekerti santri.',
      'Membimbing kekompakan dan adab peserta didik saat berdiri melantunkan bacaan Mahalul Qiyam dengan khidmat dalam rangkaian pembinaan rohani Islam di asrama.',
    ],
  },
  {
    keyword: 'mengaji diba\'',
    aliases: ['diba\'an', 'maulid diba\'', 'membaca diba\''],
    rhk: 'RHK 4',
    timeContext: 'malam',
    templates: [
      'Mendampingi peserta didik melaksanakan kegiatan mengaji Maulid Diba\' bersama di masjid/aula asrama Sekolah Rakyat Terintegrasi 1 Kab. Kediri dengan penuh kekhidmatan untuk menanamkan nilai keteladanan akhlak Nabi Muhammad SAW.',
      'Mengawasi jalannya pembacaan shalawat Nabi dalam kegiatan mengaji Diba\' agar berlangsung rapi, merdu, dan kondusif.',
    ],
  },
  {
    keyword: 'pendampingan keputrian di hari jumat',
    aliases: ['pendampingan keputrian di hari jum\'at', 'kegiatan keputrian hari jumat', 'keputrian jumat'],
    rhk: 'RHK 4',
    timeContext: 'siang',
    templates: [
      'Melaksanakan pendampingan kegiatan keputrian bagi peserta didik putri pada hari Jum\'at di Sekolah Rakyat Terintegrasi 1 Kab. Kediri guna membina pemahaman fiqih wanita, adab muslimah, kebersihan diri, serta keterampilan positif selama waktu sholat Jum\'at berlangsung.',
      'Mendampingi dan memfasilitasi pembinaan rohani serta penguatan karakter muslimah dalam agenda rutin keputrian hari Jum\'at secara tertib dan inspiratif.',
    ],
  },
  {
    keyword: 'kultum pagi',
    aliases: ['kultum subuh', 'kuliah tujuh menit pagi'],
    rhk: 'RHK 4',
    timeContext: 'pagi',
    templates: [
      'Mendampingi dan menyimak kegiatan kultum pagi bersama peserta didik di Sekolah Rakyat Terintegrasi 1 Kab. Kediri sebagai sarana pembinaan karakter, penguatan nilai spiritual, pelatihan public speaking islami, dan motivasi sebelum beraktivitas.',
      'Membimbing peserta didik dalam pelaksanaan kultum pagi guna menanamkan akhlakul karimah dan kesiapan mental spiritual mengawali kegiatan belajar.',
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
    keyword: 'dzikir bersama',
    aliases: ['dzikir', 'istighosah', 'muhasabah'],
    rhk: 'RHK 4',
    timeContext: 'fleksibel',
    templates: [
      'Memimpin dan mendampingi peserta didik melaksanakan dzikir bersama di masjid/mushola asrama Sekolah Rakyat Terintegrasi 1 Kab. Kediri untuk menumbuhkan ketenangan hati, keimanan, dan keberkahan dalam menuntut ilmu.',
      'Melaksanakan pembinaan rohani melalui dzikir bersama dan muhasabah diri guna memperkokoh spiritualitas serta kerukunan antar-peserta didik.',
    ],
  },
  {
    keyword: 'doa bersama',
    aliases: ['berdoa', 'doa pagi', 'memimpin doa'],
    rhk: 'RHK 4',
    timeContext: 'fleksibel',
    templates: [
      'Memimpin dan mendampingi kegiatan doa bersama peserta didik di Sekolah Rakyat Terintegrasi 1 Kab. Kediri, memohon perlindungan, kesehatan jasmani rohani, serta kemudahan dalam mengikuti proses pembelajaran.',
      'Membiasakan peserta didik berdoa bersama dengan sikap khusyuk dan tertib sebelum maupun sesudah melaksanakan rangkaian kegiatan harian.',
    ],
  },

  // ==========================================
  // KELOMPOK 3: KEMANDIRIAN & KEBERSIHAN (RHK 2)
  // ==========================================
  {
    keyword: 'cuci baju',
    aliases: ['mencuci pakaian', 'cuci pakaian', 'laundry mandiri', 'mencuci baju', 'mencuci'],
    rhk: 'RHK 2',
    timeContext: 'fleksibel',
    templates: [
      'Melaksanakan pendampingan kemandirian peserta didik dalam mencuci pakaian secara mandiri di area laundry asrama, menanamkan kebiasaan hidup bersih, rapi, dan bertanggung jawab.',
      'Membimbing siswa melakukan kegiatan cuci baju mandiri, mengajarkan takaran detergen yang tepat, teknik membilas bersih, serta tata cara penjemuran yang rapi.',
      'Mengawasi kegiatan cuci pakaian peserta didik, melatih siswa merawat pakaian sekolah dan seragam asrama milik sendiri secara disiplin.',
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
    aliases: ['setrika baju', 'menyetrika baju', 'menyetrika pakaian', 'setrika seragam'],
    rhk: 'RHK 2',
    timeContext: 'fleksibel',
    templates: [
      'Mendampingi dan mengawasi peserta didik dalam kegiatan menyetrika baju serta seragam sekolah secara mandiri, memperhatikan aspek keselamatan penggunaan alat listrik dan kerapian lipatan.',
      'Melatih keterampilan hidup mandiri peserta didik dalam menyetrika pakaian seragam harian agar selalu tampil rapi dan siap mengikuti pembelajaran.',
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
    aliases: ['menyapu bersama siswa', 'mendampingi menyapu', 'siswa menyapu', 'menyapu'],
    rhk: 'RHK 2',
    timeContext: 'fleksibel',
    templates: [
      'Mendampingi dan membimbing peserta didik melaksanakan kegiatan menyapu lantai ruangan maupun area sekitar Sekolah Rakyat Terintegrasi 1 Kab. Kediri agar lingkungan tetap bersih, rapi, dan sehat.',
      'Mengawasi peserta didik saat melaksanakan piket menyapu secara tertib, mengarahkan penyapuan hingga sudut ruangan serta pengumpulan sampah ke tempat pembuangan secara bertanggung jawab.',
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
    keyword: 'membersihkan masjid dan sekitarnya',
    aliases: ['bersih masjid dan sekitarnya', 'membersihkan sekitar masjid'],
    rhk: 'RHK 2',
    timeContext: 'fleksibel',
    templates: [
      'Mendampingi dan membimbing peserta didik membersihkan area dalam masjid hingga halaman sekitarnya di Sekolah Rakyat Terintegrasi 1 Kab. Kediri, meliputi menyapu halaman, membersihkan tempat wudhu, menata sajadah, dan membuang sampah agar rumah ibadah selalu bersih dan asri.',
      'Menggerakkan peserta didik melaksanakan kerja bakti membersihkan masjid beserta lingkungan sekitarnya guna menanamkan kepedulian terhadap kesucian dan kenyamanan tempat ibadah.',
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
    keyword: 'membersihkan gedung kelas',
    aliases: ['bersih gedung kelas', 'kerja bakti gedung kelas'],
    rhk: 'RHK 2',
    timeContext: 'fleksibel',
    templates: [
      'Mendampingi dan mengoordinasikan peserta didik melaksanakan kerja bakti membersihkan gedung kelas Sekolah Rakyat Terintegrasi 1 Kab. Kediri, meliputi penyapuan selasar, kaca jendela, halaman depan kelas, serta ruang belajar agar tercipta suasana sekolah yang bersih dan sehat.',
      'Mengawasi ketertiban peserta didik saat membersihkan area gedung kelas secara gotong royong demi menjaga kelayakan fasilitas belajar.',
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
    keyword: 'membersihkan asrama',
    aliases: ['bersih asrama', 'bersih lingkungan asrama', 'membersihkan lingkungan asrama'],
    rhk: 'RHK 2',
    timeContext: 'fleksibel',
    templates: [
      'Mendampingi dan membimbing peserta didik melaksanakan kerja bakti membersihkan gedung dan lingkungan asrama Sekolah Rakyat Terintegrasi 1 Kab. Kediri agar tercipta hunian belajar yang sehat, rapi, bebas sampah, dan nyaman.',
      'Mengoordinasikan peserta didik membersihkan area asrama secara gotong royong, mulai dari kamar tidur, lorong selasar, hingga halaman asrama untuk menanamkan kemandirian dan kepedulian lingkungan.',
    ],
  },
  {
    keyword: 'membersihkan kamar',
    aliases: ['bersih kamar', 'merapikan kamar tidur'],
    rhk: 'RHK 2',
    timeContext: 'fleksibel',
    templates: [
      'Mengawasi dan membimbing peserta didik membersihkan kamar tidur asrama, merapikan tempat tidur, menyapu lantai, serta menata barang pribadi agar kamar selalu bersih, sehat, dan nyaman ditempati.',
      'Melaksanakan pemeriksaan sekaligus pendampingan saat peserta didik membersihkan kamar asrama guna menanamkan kebiasaan hidup rapi dan bertanggung jawab.',
    ],
  },
  {
    keyword: 'mengepel lantai kamar',
    aliases: ['mengepel lantai', 'pel lantai kamar', 'mengepel'],
    rhk: 'RHK 2',
    timeContext: 'fleksibel',
    templates: [
      'Mendampingi dan membimbing peserta didik mengepel lantai kamar maupun koridor asrama setelah disapu hingga bersih dan harum agar kenyamanan serta kesehatan lingkungan hunian tetap terjaga.',
      'Mengawasi pelaksanaan piket mengepel lantai secara aman dan tertib guna melatih kemandirian peserta didik dalam menjaga kebersihan ruangan.',
    ],
  },
  {
    keyword: 'membersihkan kamar mandi',
    aliases: ['membersihkan toilet', 'bersih kamar mandi', 'bersih toilet', 'sikat kamar mandi'],
    rhk: 'RHK 2',
    timeContext: 'fleksibel',
    templates: [
      'Membimbing dan mengawasi peserta didik membersihkan kamar mandi dan toilet asrama Sekolah Rakyat Terintegrasi 1 Kab. Kediri secara berkala, meliputi menyikat lantai, membersihkan kloset, serta menguras bak air agar selalu higienis dan bebas bau.',
      'Melaksanakan pendampingan piket kebersihan sanitasi kamar mandi/toilet peserta didik guna menanamkan pola hidup bersih dan tanggung jawab terhadap fasilitas umum asrama.',
    ],
  },
  {
    keyword: 'membersihkan kantin',
    aliases: ['menyapu kantin', 'bersih kantin', 'piket kantin'],
    rhk: 'RHK 2',
    timeContext: 'siang',
    templates: [
      'Mendampingi peserta didik membersihkan dan menyapu area kantin/ruang makan Sekolah Rakyat Terintegrasi 1 Kab. Kediri setelah jam makan selesai agar tetap bersih, higienis, dan nyaman digunakan kembali.',
      'Mengawasi pelaksanaan piket membersihkan dan menata meja kursi kantin bersama peserta didik secara tertib dan penuh tanggung jawab.',
    ],
  },
  {
    keyword: 'menata sepatu',
    aliases: ['merapikan sepatu', 'rak sepatu', 'susun sepatu'],
    rhk: 'RHK 2',
    timeContext: 'fleksibel',
    templates: [
      'Membimbing dan membiasakan peserta didik menata sepatu serta sandal secara rapi pada rak sepatu asrama setelah beraktivitas guna melatih ketertiban, kerapian, dan kemandirian menjaga barang pribadi.',
      'Melakukan pengecekan dan pendampingan penataan rak sepatu peserta didik di depan kamar/asrama agar lingkungan tampak teratur dan nyaman.',
    ],
  },
  {
    keyword: 'seragam bersih',
    aliases: ['kelengkapan seragam bersih', 'pengecekan seragam bersih'],
    rhk: 'RHK 2',
    timeContext: 'pagi',
    templates: [
      'Membimbing serta memeriksa kebersihan dan kerapian seragam sekolah peserta didik sebelum berangkat ke kelas agar siswa tampil bersih, wangi, rapi, dan percaya diri mengikuti pembelajaran.',
      'Menanamkan kebiasaan mandiri kepada peserta didik untuk selalu menjaga kebersihan seragam sekolah yang dikenakan serta mencucinya secara teratur.',
    ],
  },
  {
    keyword: 'mendampingi potong rambut',
    aliases: ['potong rambut', 'cukur rambut siswa', 'pangkas rambut'],
    rhk: 'RHK 2',
    timeContext: 'fleksibel',
    templates: [
      'Mendampingi peserta didik dalam kegiatan potong rambut berkala di Sekolah Rakyat Terintegrasi 1 Kab. Kediri guna menjaga kerapian penampilan dan kebersihan diri sesuai ketentuan tata tertib asrama.',
      'Mengoordinasikan antrean peserta didik saat pelaksanaan potong rambut serta membiasakan kebersihan diri pasca pangkas rambut.',
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
    aliases: ['tata lemari', 'susun pakaian', 'merapikan loker', 'merapikan baju di almari', 'merapikan baju'],
    rhk: 'RHK 2',
    timeContext: 'fleksibel',
    templates: [
      'Mendampingi peserta didik melipat, menata, dan merapikan baju di dalam almari/lemari masing-masing secara teratur, mengelompokkan seragam sekolah, pakaian harian, dan perlengkapan ibadah agar mudah ditemukan.',
      'Membimbing siswa melakukan penyusunan lemari pakaian asrama yang rapi guna melatih keteraturan diri serta mencegah penumpukan pakaian kotor.',
    ],
  },
  {
    keyword: 'bersih diri',
    aliases: ['menjaga bersih diri', 'perawatan bersih diri'],
    rhk: 'RHK 2',
    timeContext: 'pagi',
    templates: [
      'Membimbing dan mengawasi peserta didik dalam pelaksanaan bersih diri (mandi, menggosok gigi, mencuci muka, dan berbusana rapi) guna membiasakan pola hidup sehat dan menjaga kesegaran jasmani sebelum beraktivitas.',
      'Mendampingi rutinitas bersih diri peserta didik di asrama secara tertib agar seluruh siswa selalu menjaga higienitas personal.',
    ],
  },
  {
    keyword: 'mandi pagi',
    aliases: ['antre mandi pagi', 'membimbing mandi pagi'],
    rhk: 'RHK 2',
    timeContext: 'pagi',
    templates: [
      'Mengatur antrean dan mengawasi ketertiban peserta didik saat melaksanakan mandi pagi di asrama agar seluruh siswa selesai tepat waktu, tampil bersih, serta siap berangkat ke sekolah.',
      'Membimbing peserta didik melaksanakan mandi pagi secara efisien dan menjaga kebersihan kamar mandi setelah digunakan.',
    ],
  },
  {
    keyword: 'kebersihan diri',
    aliases: ['potong kuku', 'cukur rambut', 'mandi', 'kebersihan sanitasi'],
    rhk: 'RHK 2',
    timeContext: 'fleksibel',
    templates: [
      'Melakukan pendampingan dan pemeriksaan kebersihan diri peserta didik, meliputi kerapian rambut, kebersihan kuku, kesehatan kulit, serta higienitas pakaian harian.',
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
    aliases: ['jam belajar', 'sinau malam', 'belajar mandiri malam', 'sesi belajar', 'belajar di malam hari'],
    rhk: 'RHK 1',
    timeContext: 'malam',
    templates: [
      'Melaksanakan pendampingan kegiatan belajar di malam hari bagi peserta didik di ruang belajar asrama, mengondisikan suasana tenang, serta membantu siswa yang memerlukan bimbingan materi pelajaran.',
      'Mendampingi proses belajar mandiri pada malam hari, memastikan seluruh peserta didik fokus menyelesaikan tugas sekolah dan mengulang kembali materi pelajaran untuk esok hari.',
      'Mengawasi jam wajib belajar malam di asrama, memfasilitasi tanya jawab materi sulit, serta memotivasi siswa untuk tekun mengejar prestasi akademik.',
    ],
  },
  {
    keyword: 'belajar kelompok',
    aliases: ['diskusi belajar', 'tutor sebaya', 'kelompok belajar', 'sesi diskusi dengan anak asuh', 'diskusi bersama'],
    rhk: 'RHK 1',
    timeContext: 'fleksibel',
    templates: [
      'Memfasilitasi sesi diskusi dan belajar bersama anak asuh di Sekolah Rakyat Terintegrasi 1 Kab. Kediri mengenai materi pelajaran, pemecahan kendala tugas sekolah, maupun evaluasi perkembangan belajar secara aktif dan kolaboratif.',
      'Mendampingi diskusi kelompok bersama peserta didik guna melatih kemampuan berpikir kritis, keberanian menyampaikan pendapat, serta budaya saling membantu antar-siswa.',
    ],
  },
  {
    keyword: 'mengerjakan tugas',
    aliases: ['tugas sekolah', 'mengerjakan pr', 'mendampingi mengerjakan pr', 'bimbingan tugas', 'pekerjaan rumah'],
    rhk: 'RHK 1',
    timeContext: 'fleksibel',
    templates: [
      'Membimbing dan mendampingi peserta didik dalam mengerjakan pekerjaan rumah (PR) serta tugas sekolah secara terstruktur, memastikan siswa memahami instruksi soal dan menuntaskannya tepat waktu.',
      'Melaksanakan pendampingan penyelesaian PR dan tugas akademik peserta didik di asrama, memberikan penjelasan apabila terdapat kesulitan, serta memeriksa kelengkapan hasil kerja siswa.',
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
    keyword: 'membaca di perpustakaan',
    aliases: ['kunjungan perpustakaan', 'literasi di perpustakaan', 'perpustakaan'],
    rhk: 'RHK 1',
    timeContext: 'fleksibel',
    templates: [
      'Mendampingi peserta didik dalam kegiatan membaca buku dan literasi di perpustakaan Sekolah Rakyat Terintegrasi 1 Kab. Kediri, membimbing pemilihan bahan bacaan edukatif, serta menjaga ketenangan dan ketertiban ruang perpustakaan.',
      'Memfasilitasi peserta didik memanfaatkan koleksi buku di perpustakaan guna meningkatkan minat baca, memperkaya kosakata, dan memperluas wawasan pengetahuan siswa.',
    ],
  },
  {
    keyword: 'literasi membaca',
    aliases: ['membaca buku', 'sudut baca', 'buku bacaan'],
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
    aliases: ['mendampingi siswa belajar', 'pendampingan belajar', 'membimbing belajar', 'belajar di kelas', 'membantu belajar'],
    rhk: 'RHK 1',
    timeContext: 'fleksibel',
    templates: [
      'Melaksanakan pendampingan dan membantu belajar peserta didik di ruang belajar asrama maupun di ruang kelas Sekolah Rakyat Terintegrasi 1 Kab. Kediri, mengondisikan suasana tenang, membantu memahami materi pelajaran sulit, serta memotivasi ketekunan belajar siswa.',
      'Mendampingi peserta didik dalam kegiatan belajar terstruktur, memeriksa kelengkapan catatan dan pengerjaan tugas sekolah, serta memastikan seluruh siswa fokus mengikuti pembelajaran.',
    ],
  },
  {
    keyword: 'mendampingi ekstra coding',
    aliases: ['ekstra coding', 'ekstrakurikuler coding', 'ekskul coding', 'coding'],
    rhk: 'RHK 1',
    timeContext: 'sore',
    templates: [
      'Mendampingi peserta didik mengikuti kegiatan ekstrakurikuler coding di Sekolah Rakyat Terintegrasi 1 Kab. Kediri, membimbing penguasaan logika pemrograman dasar, penggunaan perangkat komputer secara tertib, serta pengembangan kreativitas digital siswa.',
      'Melaksanakan pendampingan latihan ekstrakurikuler coding guna melatih keterampilan berpikir komputasional dan pemecahan masalah teknologi peserta didik.',
    ],
  },
  {
    keyword: 'ekstra robotik',
    aliases: ['mendampingi ekstra robotik', 'ekstrakurikuler robotik', 'ekskul robotik', 'robotik'],
    rhk: 'RHK 1',
    timeContext: 'sore',
    templates: [
      'Mendampingi peserta didik mengikuti kegiatan ekstrakurikuler robotik di Sekolah Rakyat Terintegrasi 1 Kab. Kediri, membimbing perakitan komponen, ketelitian kerja tim, serta penanaman minat sains dan rekayasa teknologi.',
      'Mengawasi jalannya praktik ekstrakurikuler robotik peserta didik agar berjalan aman, kreatif, dan menghasilkan proyek teknologi yang edukatif.',
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
    aliases: ['ekstrakurikuler pertanian', 'ekstra pertanian', 'ekskul pertanian', 'mendampingi ekstra pertanian', 'keahlian pertanian', 'pertanian'],
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
    keyword: 'mendampingi ekstra pramuka',
    aliases: ['pramuka', 'ekstra pramuka', 'ekskul pramuka', 'ekstrakurikuler pramuka'],
    rhk: 'RHK 4',
    timeContext: 'sore',
    templates: [
      'Mendampingi dan mengawasi peserta didik dalam kegiatan ekstrakurikuler Pramuka di Sekolah Rakyat Terintegrasi 1 Kab. Kediri guna membentuk karakter mandiri, kedisiplinan, kecakapan tali-temali/kepramukaan, kerja sama regu, serta jiwa kepemimpinan.',
      'Melaksanakan pendampingan latihan rutin kepramukaan agar seluruh peserta didik berpartisipasi aktif dengan penuh semangat dan tertib.',
    ],
  },
  {
    keyword: 'mendampingi ekstra rebana',
    aliases: ['ekstra rebana', 'ekstrakurikuler rebana', 'ekskul rebana', 'rebana', 'hadrah'],
    rhk: 'RHK 4',
    timeContext: 'sore',
    templates: [
      'Mendampingi dan membina peserta didik dalam kegiatan ekstrakurikuler seni islami rebana/hadrah di Sekolah Rakyat Terintegrasi 1 Kab. Kediri untuk mengembangkan bakat seni musik religi, kekompakan irama, dan kecintaan melantunkan shalawat.',
      'Mengawasi jalannya latihan rutin ekstrakurikuler rebana peserta didik guna menjaga ketertiban peralatan serta menumbuhkan kreativitas seni islami di asrama.',
    ],
  },
  {
    keyword: 'mendengarkan cerita siswa',
    aliases: ['mendengarkan curhatan anak asuh', 'mendengarkan cerita anak asuh', 'curhatan anak asuh'],
    rhk: 'RHK 4',
    timeContext: 'fleksibel',
    templates: [
      'Meluangkan waktu mendengarkan cerita dan curhatan peserta didik/anak asuh dengan penuh empati dan keterbukaan di Sekolah Rakyat Terintegrasi 1 Kab. Kediri guna memahami kondisi emosional, meredakan beban pikiran, serta memberikan bimbingan moril yang menenangkan.',
      'Melaksanakan pendekatan personal secara kekeluargaan dengan mendengarkan keluh kesah dan cerita anak asuh agar terjalin kedekatan emosional serta ketahanan mental selama tinggal di asrama.',
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
    aliases: ['tata tertib', 'disiplin waktu', 'pengarahan tata tertib', 'edukasi disiplin', 'mendampingi melakukan pendisiplinan'],
    rhk: 'RHK 4',
    timeContext: 'fleksibel',
    templates: [
      'Melaksanakan pembinaan dan pendampingan pendisiplinan peserta didik secara edukatif dan humanis di Sekolah Rakyat Terintegrasi 1 Kab. Kediri guna menumbuhkan kesadaran menaati tata tertib asrama serta tanggung jawab pribadi.',
      'Memberikan pengarahan dan bimbingan kepatuhan norma asrama bagi peserta didik agar senantiasa menjaga sikap, ketepatan waktu, dan ketertiban lingkungan bersama.',
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
    keyword: 'memastikan keamanan kunjungan',
    aliases: ['keamanan kunjungan', 'pengamanan kunjungan'],
    rhk: 'RHK 4',
    timeContext: 'fleksibel',
    templates: [
      'Melaksanakan penjagaan dan pemantauan situasi guna memastikan keamanan kegiatan kunjungan orang tua/wali di lingkungan Sekolah Rakyat Terintegrasi 1 Kab. Kediri tetap aman, tertib, dan terkendali.',
      'Mengawasi akses area kunjungan serta pergerakan tamu dan peserta didik selama jam kunjungan berlangsung demi menjamin keselamatan seluruh anak asuh.',
    ],
  },
  {
    keyword: 'memastikan orang tua bertemu dengan anak di kunjungan',
    aliases: ['memastikan orang tua bertemu dengan anaknya saat kunjungan', 'pertemuan orang tua dan anak saat kunjungan'],
    rhk: 'RHK 4',
    timeContext: 'fleksibel',
    templates: [
      'Memfasilitasi dan memastikan orang tua/wali bertemu langsung dengan putra-putrinya di area kunjungan Sekolah Rakyat Terintegrasi 1 Kab. Kediri secara terdata, tertib, aman, dan penuh kehangatan keluarga.',
      'Mengoordinasikan pemanggilan peserta didik serta mencatat pertemuan anak asuh dengan orang tua pada hari kunjungan agar seluruh tamu terlayani dengan baik.',
    ],
  },
  {
    keyword: 'mendampingi kegiatan kunjungan',
    aliases: ['kunjungan aman dan tertib', 'memastikan kunjungan berjalan lancar'],
    rhk: 'RHK 4',
    timeContext: 'fleksibel',
    templates: [
      'Mendampingi seluruh rangkaian kegiatan kunjungan orang tua/wali di Sekolah Rakyat Terintegrasi 1 Kab. Kediri, memastikan alur kunjungan aman, tertib, serta pertemuan keluarga berlangsung lancar sesuai jadwal asrama.',
      'Melaksanakan pengawasan dan pelayanan ramah selama agenda kunjungan berlangsung agar tercipta suasana tertib, komunikatif, dan kondusif.',
    ],
  },
  {
    keyword: 'menjaga ketertiban kunjungan',
    aliases: ['ketertiban kunjungan', 'menjaga ketertiban kunjungan orang tua', 'pengawasan kunjungan', 'tertib kunjungan'],
    rhk: 'RHK 4',
    timeContext: 'fleksibel',
    templates: [
      'Melaksanakan pengawasan dan menjaga ketertiban selama kegiatan kunjungan orang tua/wali di Sekolah Rakyat Terintegrasi 1 Kab. Kediri, mengatur alur kedatangan tamu, menjaga kesesuaian area kunjungan, serta memastikan suasana kunjungan aman dan kondusif.',
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
    aliases: ['kunjungan rumah', 'sambang rumah', 'silaturahmi ke wali murid', 'berkunjung ke rumah siswa'],
    rhk: 'RHK 4',
    timeContext: 'fleksibel',
    templates: [
      'Melaksanakan kunjungan rumah (*home visit*) ke kediaman orang tua/wali peserta didik guna menjalin silaturahmi erat serta mengoordinasikan perkembangan karakter, kehadiran, dan pembinaan anak asuh.',
      'Melakukan *home visit* ke rumah siswa dalam rangka penyelarasan pola pengasuhan antara pihak Sekolah Rakyat Terintegrasi 1 Kab. Kediri dan keluarga.',
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
    keyword: 'olahraga pagi di depan aula',
    aliases: ['olahraga depan aula'],
    rhk: 'RHK 4',
    timeContext: 'pagi',
    templates: [
      'Mendampingi dan memandu peserta didik melaksanakan olahraga pagi di depan aula Sekolah Rakyat Terintegrasi 1 Kab. Kediri guna melatih kebugaran fisik, kebersamaan, dan semangat memulai aktivitas hari.',
      'Mengawasi jalannya senam pemanasan dan olahraga pagi di area depan aula asrama secara tertib dan penuh antusiasme.',
    ],
  },
  {
    keyword: 'olahraga pagi',
    aliases: ['jalan santai', 'jogging pagi', 'lari pagi'],
    rhk: 'RHK 4',
    timeContext: 'pagi',
    templates: [
      'Mendampingi kegiatan olahraga pagi dan peregangan bersama peserta didik di lingkungan Sekolah Rakyat Terintegrasi 1 Kab. Kediri untuk menjaga kebugaran fisik dan vitalitas tubuh.',
      'Memimpin aktivitas pemanasan dan lari/jalan santai pagi bersama siswa asrama guna memperkuat daya tahan tubuh serta mempererat kekompakan.',
    ],
  },
  {
    keyword: 'olahraga sore',
    aliases: ['futsal sore', 'main bola'],
    rhk: 'RHK 4',
    timeContext: 'sore',
    templates: [
      'Mendampingi peserta didik dalam kegiatan olahraga sore hari di lapangan Sekolah Rakyat Terintegrasi 1 Kab. Kediri, menyalurkan energi secara positif, sehat, aman, dan sportif.',
      'Mengawasi aktivitas olahraga sore peserta didik serta menanamkan nilai-nilai sportivitas, keselamatan bermain, dan kerja sama tim.',
    ],
  },
  {
    keyword: 'olahraga mandiri',
    aliases: ['latihan fisik mandiri'],
    rhk: 'RHK 4',
    timeContext: 'fleksibel',
    templates: [
      'Mengawasi dan mendampingi peserta didik melaksanakan kegiatan olahraga mandiri secara terarah dan aman guna memelihara kebugaran jasmani serta mengisi waktu luang dengan aktivitas positif.',
      'Memantau aktivitas olahraga mandiri anak asuh di area kampus/asrama agar tetap tertib, menjaga keselamatan fisik, dan mematuhi batas waktu kegiatan.',
    ],
  },
  {
    keyword: 'bermain voli',
    aliases: ['bermain voly', 'olahraga voli', 'voli sore'],
    rhk: 'RHK 4',
    timeContext: 'sore',
    templates: [
      'Mendampingi dan mengawasi peserta didik bermain bola voli di lapangan Sekolah Rakyat Terintegrasi 1 Kab. Kediri guna melatih kelincahan, kerja sama tim, sportivitas, dan kebugaran fisik.',
      'Mengatur jalannya permainan bola voli peserta didik secara sportif dan aman sebagai bagian dari pembinaan kebugaran jasmani.',
    ],
  },
  {
    keyword: 'bermain pingpong',
    aliases: ['bermain tenis meja', 'tenis meja', 'pingpong'],
    rhk: 'RHK 4',
    timeContext: 'sore',
    templates: [
      'Mendampingi peserta didik bermain tenis meja (pingpong) di fasilitas olahraga/rekreasi Sekolah Rakyat Terintegrasi 1 Kab. Kediri guna melatih refleks ketangkasan, sportivitas, serta mempererat keakraban.',
      'Mengawasi penggunaan fasilitas tenis meja (pingpong) oleh peserta didik secara bergantian, tertib, dan penuh kegembiraan.',
    ],
  },
  {
    keyword: 'bermain basket',
    aliases: ['olahraga basket', 'latihan basket'],
    rhk: 'RHK 4',
    timeContext: 'sore',
    templates: [
      'Mendampingi dan mengawasi peserta didik bermain bola basket di lapangan Sekolah Rakyat Terintegrasi 1 Kab. Kediri guna mengembangkan kelincahan fisik, kerja sama tim, dan jiwa sportivitas.',
      'Mengawal ketertiban dan keselamatan peserta didik selama berlatih dan bermain bola basket di lingkungan sekolah.',
    ],
  },
  {
    keyword: 'bermain kasti',
    aliases: ['olahraga kasti'],
    rhk: 'RHK 4',
    timeContext: 'sore',
    templates: [
      'Mendampingi peserta didik bermain kasti di lapangan Sekolah Rakyat Terintegrasi 1 Kab. Kediri guna melatih ketangkasan, kekompakan regu, keceriaan, dan kebugaran jasmani secara sportif.',
      'Mengawasi jalannya permainan kasti anak asuh dengan mengutamakan keselamatan bermain dan keakraban antar-peserta didik.',
    ],
  },
  {
    keyword: 'bermain bulu tangkis',
    aliases: ['bermain bulutangkis', 'badminton', 'olahraga bulu tangkis'],
    rhk: 'RHK 4',
    timeContext: 'sore',
    templates: [
      'Mendampingi peserta didik bermain bulu tangkis di area lapangan Sekolah Rakyat Terintegrasi 1 Kab. Kediri guna melatih kelincahan gerak, koordinasi tubuh, kebugaran, serta sportivitas.',
      'Mengawasi peserta didik melaksanakan permainan bulu tangkis secara bergantian dan tertib sebagai sarana olahraga sehat.',
    ],
  },
  {
    keyword: 'rekreasi',
    aliases: ['kegiatan rekreasi', 'rekreasi edukatif'],
    rhk: 'RHK 4',
    timeContext: 'fleksibel',
    templates: [
      'Mendampingi peserta didik dalam kegiatan rekreasi dan penyegaran mental di lingkungan Sekolah Rakyat Terintegrasi 1 Kab. Kediri maupun luar kampus guna menjaga kesehatan emosional, mengurangi kejenuhan belajar, serta mempererat kebersamaan.',
      'Mengawal ketertiban, keamanan, dan keceriaan seluruh anak asuh selama agenda rekreasi berlangsung.',
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
    keyword: 'kembali ke sekolah',
    aliases: ['mengawal kembali ke sekolah', 'siap kembali ke sekolah'],
    rhk: 'RHK 3',
    timeContext: 'siang',
    templates: [
      'Mengawal dan memastikan seluruh peserta didik kembali ke ruang kelas/gedung sekolah tepat waktu setelah jam istirahat dan sholat Dzuhur selesai dengan pakaian rapi serta perlengkapan belajar lengkap.',
      'Mendampingi mobilitas peserta didik kembali ke area sekolah pada siang hari guna memastikan ketepatan waktu dan kesiapan mengikuti pelajaran lanjutan.',
    ],
  },
  {
    keyword: 'menemani bermain',
    aliases: ['menemani siswa bermain', 'bermain dengan anak asuh', 'menemani anak bermain'],
    rhk: 'RHK 3',
    timeContext: 'sore',
    templates: [
      'Menemani dan mengawasi peserta didik bermain pada waktu luang di lingkungan asrama Sekolah Rakyat Terintegrasi 1 Kab. Kediri guna membangun keakraban, keceriaan, keharmonisan sosial, dan keamanan anak asuh.',
      'Berinteraksi hangat menemani bermain bersama anak asuh untuk menumbuhkan ikatan kekeluargaan yang positif antara Wali Asuh dan peserta didik.',
    ],
  },
  {
    keyword: 'mendampingi siswa sd',
    aliases: ['pendampingan siswa sd', 'anak asuh sd'],
    rhk: 'RHK 3',
    timeContext: 'fleksibel',
    templates: [
      'Melaksanakan pendampingan khusus dengan penuh kasih sayang, kesabaran, dan perhatian ekstra bagi peserta didik jenjang Sekolah Dasar (SD) di Sekolah Rakyat Terintegrasi 1 Kab. Kediri dalam aktivitas belajar, makan, kebersihan diri, dan adaptasi asrama.',
      'Membimbing peserta didik jenjang SD secara bertahap dan ramah anak agar merasa aman, nyaman, serta terbantu dalam menjalani rutinitas harian asrama.',
    ],
  },
  {
    keyword: 'evaluasi pagi dari wali asuh',
    aliases: ['evaluasi pagi'],
    rhk: 'RHK 3',
    timeContext: 'pagi',
    templates: [
      'Melaksanakan evaluasi pagi dari Wali Asuh bersama anak asuh di Sekolah Rakyat Terintegrasi 1 Kab. Kediri terkait kedisiplinan waktu bangun, kerapian kamar, kelengkapan perlengkapan sekolah, serta penyampaian arahan kegiatan hari ini.',
      'Memberikan penguatan motivasi dan evaluasi singkat di pagi hari sebelum keberangkatan sekolah agar peserta didik siap secara mental dan disiplin.',
    ],
  },
  {
    keyword: 'evaluasi malam',
    aliases: ['evaluasi anak asuh malam'],
    rhk: 'RHK 3',
    timeContext: 'malam',
    templates: [
      'Melaksanakan evaluasi malam bersama anak asuh di asrama Sekolah Rakyat Terintegrasi 1 Kab. Kediri untuk merefleksikan kegiatan sepanjang hari, memeriksa kelengkapan kehadiran kamar, serta menyampaikan pesan perbaikan menjelang waktu tidur.',
      'Memfasilitasi pertemuan evaluasi malam agar kendala harian siswa dapat segera ditindaklanjuti secara bijak sebelum beristirahat.',
    ],
  },
  {
    keyword: 'evaluasi kegiatan',
    aliases: ['evaluasi harian kegiatan', 'melaksanakan evaluasi kegiatan'],
    rhk: 'RHK 3',
    timeContext: 'fleksibel',
    templates: [
      'Melaksanakan evaluasi kegiatan harian peserta didik di Sekolah Rakyat Terintegrasi 1 Kab. Kediri untuk meninjau capaian ketertiban, partisipasi siswa, serta menyusun tindak lanjut pembinaan pengasuhan yang lebih efektif.',
      'Membahas hasil pelaksanaan kegiatan bersama peserta didik guna mengapresiasi hal-hal positif dan memperbaiki kekurangan secara konstruktif.',
    ],
  },
  {
    keyword: 'memeriksa kondisi asrama dan lingkungannya',
    aliases: ['cek kondisi asrama', 'pemeriksaan kondisi asrama dan lingkungan'],
    rhk: 'RHK 3',
    timeContext: 'fleksibel',
    templates: [
      'Melaksanakan pemeriksaan menyeluruh terhadap kondisi asrama dan lingkungannya di Sekolah Rakyat Terintegrasi 1 Kab. Kediri, mencakup pengecekan keamanan pintu/jendela, kelayakan fasilitas kamar, sanitasi air, kebersihan koridor, serta ketertiban area sekitar asrama.',
      'Melakukan kontrol berkala sarana prasarana dan kebersihan lingkungan asrama guna memastikan hunian peserta didik aman, sehat, dan layak digunakan.',
    ],
  },
  {
    keyword: 'menonton bioskop di aula',
    aliases: ['menonton di aula'],
    rhk: 'RHK 3',
    timeContext: 'fleksibel',
    templates: [
      'Mendampingi dan mengawasi peserta didik dalam kegiatan menonton tayangan/film edukatif bersama (bioskop asrama) di aula Sekolah Rakyat Terintegrasi 1 Kab. Kediri, menjaga ketertiban tempat duduk, serta mengarahkan siswa mengambil pesan moral positif.',
      'Memfasilitasi kegiatan menonton bersama di aula sebagai sarana hiburan sehat, penyegaran mental, dan penguatan rasa kekeluargaan peserta didik.',
    ],
  },
  {
    keyword: 'menonton di ruang makan',
    aliases: ['mendampingi menonton di ruang makan'],
    rhk: 'RHK 3',
    timeContext: 'fleksibel',
    templates: [
      'Mendampingi peserta didik dalam kegiatan menonton tayangan edukatif bersama di ruang makan Sekolah Rakyat Terintegrasi 1 Kab. Kediri dengan tetap menjaga ketertiban posisi duduk, kebersihan ruangan, dan norma kesopanan.',
      'Mengawasi jalannya kegiatan menonton bersama di ruang makan asrama agar berlangsung tertib, kondusif, dan menghibur secara positif.',
    ],
  },
  {
    keyword: 'mendampingi menonton',
    aliases: ['mendampingi siswa menonton', 'menonton bersama', 'menonton film edukatif'],
    rhk: 'RHK 3',
    timeContext: 'fleksibel',
    templates: [
      'Mendampingi dan mengawasi peserta didik dalam kegiatan menonton tayangan/film edukatif bersama di lingkungan Sekolah Rakyat Terintegrasi 1 Kab. Kediri, memastikan konten tontonan mendidik, menjaga ketertiban, serta mengarahkan siswa memetik pesan moral positif.',
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
    aliases: ['ekskul', 'kegiatan ekskul', 'ekstrakulikuler', 'paskibra', 'seni tari'],
    rhk: 'RHK 1',
    timeContext: 'sore',
    templates: [
      'Mendampingi dan memantau keikutsertaan peserta didik dalam kegiatan ekstrakurikuler di Sekolah Rakyat Terintegrasi 1 Kab. Kediri sesuai minat dan bakat guna mengoptimalkan potensi, keterampilan, serta kedisiplinan siswa.',
      'Melaksanakan pengawasan kegiatan ekstrakurikuler peserta didik, memastikan kegiatan berlangsung aman, terarah, dan menumbuhkan kreativitas serta kerja sama tim.',
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
    keyword: 'menghadiri acara diseminasi',
    aliases: ['menghadiri acara desiminasi', 'mengikuti diseminasi', 'mengikuti desiminasi'],
    rhk: 'RHK 6',
    timeContext: 'fleksibel',
    templates: [
      'Menghadiri dan mengikuti acara diseminasi program/ilmu pengasuhan dan pendidikan di lingkungan Sekolah Rakyat guna memperluas wawasan profesional, menyerap praktik baik (*best practice*), dan meningkatkan kompetensi kinerja sebagai Wali Asuh.',
      'Berpartisipasi aktif dalam forum diseminasi informasi serta pengembangan inovasi layanan pendidikan agar dapat diimplementasikan bagi peserta didik di Sekolah Rakyat Terintegrasi 1 Kab. Kediri.',
    ],
  },
  {
    keyword: 'acara diseminasi',
    aliases: ['acara desiminasi', 'diseminasi', 'desiminasi'],
    rhk: 'RHK 6',
    timeContext: 'fleksibel',
    templates: [
      'Mengikuti kegiatan diseminasi pengembangan kompetensi tenaga kependidikan guna memperbarui pengetahuan strategis, metode pembinaan karakter, serta standar mutu pengasuhan peserta didik di Sekolah Rakyat Terintegrasi 1 Kab. Kediri.',
      'Berpartisipasi dalam agenda diseminasi materi dan hasil pelatihan kependidikan untuk memperkuat profesionalisme pelayanan terhadap anak asuh.',
    ],
  },
  {
    keyword: 'studi tiru dari sekolah rakyat lain',
    aliases: ['study tiru dari sekolah rakyat lain'],
    rhk: 'RHK 6',
    timeContext: 'fleksibel',
    templates: [
      'Melaksanakan kegiatan studi tiru (*benchmarking*) dari Sekolah Rakyat lain guna mempelajari sistem manajemen asrama, pola pengasuhan efektif, serta program pembinaan peserta didik unggulan untuk diadaptasi di Sekolah Rakyat Terintegrasi 1 Kab. Kediri.',
      'Berpartisipasi aktif dalam agenda studi tiru bersama Sekolah Rakyat mitra guna bertukar pengalaman praktik terbaik peningkatan kompetensi Wali Asuh dan layanan siswa.',
    ],
  },
  {
    keyword: 'studi tiru',
    aliases: ['study tiru', 'studi banding'],
    rhk: 'RHK 6',
    timeContext: 'fleksibel',
    templates: [
      'Mengikuti kegiatan studi tiru (*benchmarking*) pengembangan kompetensi tenaga kependidikan untuk mengobservasi tata kelola pengasuhan, inovasi program asrama, dan pembinaan karakter yang dapat diterapkan di Sekolah Rakyat Terintegrasi 1 Kab. Kediri.',
      'Melaksanakan studi tiru ke lembaga pendidikan rujukan dalam rangka peningkatan kapasitas profesionalisme Wali Asuh dan mutu pembinaan peserta didik.',
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
    keyword: 'menghadiri rapat',
    aliases: ['mengikuti rapat', 'rapat dinas', 'rapat'],
    rhk: 'RHK 7',
    timeContext: 'fleksibel',
    templates: [
      'Menghadiri rapat koordinasi kedinasan bersama pimpinan dan tim tenaga kependidikan Sekolah Rakyat Terintegrasi 1 Kab. Kediri guna membahas evaluasi program kerja, pembagian tugas operasional, serta perumusan langkah tindak lanjut pelayanan asrama.',
      'Berpartisipasi aktif dalam pelaksanaan rapat internal instansi sebagai bentuk dukungan terhadap tata kelola manajemen sekolah dan asrama yang terkoordinasi.',
    ],
  },
  {
    keyword: 'mengikuti rapat di zoom',
    aliases: ['hadir rapat online', 'hafir rapat online', 'zoom meeting', 'menghadiri zoom meeting', 'rapat zoom', 'rapat online'],
    rhk: 'RHK 7',
    timeContext: 'fleksibel',
    templates: [
      'Menghadiri dan mengikuti rapat koordinasi kedinasan secara daring melalui aplikasi Zoom Meeting sesuai jadwal instansi guna menyimak arahan pimpinan, menyampaikan laporan perkembangan asrama, serta menyelaraskan kebijakan operasional sekolah.',
      'Berpartisipasi aktif dalam pertemuan rapat online (Zoom Meeting) bersama jajaran pimpinan dan tenaga kependidikan untuk membahas koordinasi program pembinaan peserta didik.',
    ],
  },
  {
    keyword: 'tugas dinas',
    aliases: ['melaksanakan tugas dinas', 'surat tugas dinas'],
    rhk: 'RHK 7',
    timeContext: 'fleksibel',
    templates: [
      'Melaksanakan tugas dinas kedinasan sesuai mandat dan surat tugas dari Kepala Sekolah Rakyat Terintegrasi 1 Kab. Kediri dengan penuh integritas, profesionalisme, dan ketuntasan pelaporan hasil tugas.',
      'Menjalankan penugasan dinas di dalam maupun luar lingkungan sekolah guna mewakili serta mendukung kelancaran program kerja instansi.',
    ],
  },
  {
    keyword: 'membuat laporan bulanan',
    aliases: ['menyusun laporan bulanan', 'laporan bulanan'],
    rhk: 'RHK 7',
    timeContext: 'fleksibel',
    templates: [
      'Menyusun dan menyelesaikan laporan bulanan pelaksanaan tugas pengasuhan, perkembangan peserta didik, serta rekapitulasi kegiatan harian Wali Asuh sebagai bentuk pertanggungjawaban kinerja kepada Kepala Sekolah Rakyat Terintegrasi 1 Kab. Kediri.',
      'Mengkompilasi data kegiatan, dokumentasi, dan catatan evaluasi selama satu bulan penuh ke dalam laporan bulanan kedinasan secara sistematis dan akurat.',
    ],
  },
  {
    keyword: 'membuat laporan',
    aliases: ['menyusun laporan', 'pembuatan laporan', 'laporan kegiatan'],
    rhk: 'RHK 7',
    timeContext: 'fleksibel',
    templates: [
      'Menyusun dan melengkapi dokumen laporan pelaksanaan kegiatan serta tugas tambahan Wali Asuh Sekolah Rakyat Terintegrasi 1 Kab. Kediri secara sistematis, akuntabel, dan tepat waktu untuk diserahkan kepada pimpinan.',
      'Mendokumentasikan rincian pelaksanaan tugas dan hasil kegiatan ke dalam laporan tertulis sebagai bahan evaluasi dan arsip kedinasan sekolah.',
    ],
  },
  {
    keyword: 'mengabsensi daftar hadir kunjungan',
    aliases: ['absensi daftar hadir kunjungan', 'daftar hadir kunjungan', 'mengabsen kunjungan'],
    rhk: 'RHK 7',
    timeContext: 'fleksibel',
    templates: [
      'Melaksanakan tugas pencatatan dan pengabsensian daftar hadir kunjungan orang tua/wali peserta didik di pos layanan kunjungan Sekolah Rakyat Terintegrasi 1 Kab. Kediri secara teliti dan tertib sebagai tertib administrasi tamu.',
      'Memverifikasi identitas wali murid serta mengisi daftar hadir resmi kunjungan guna memastikan seluruh tamu terdokumentasi dengan akurat.',
    ],
  },
  {
    keyword: 'memeriksa barang kunjungan',
    aliases: ['pengecekan barang kunjungan', 'pengecekan barang', 'memeriksa kesesuaian barang siswa'],
    rhk: 'RHK 7',
    timeContext: 'fleksibel',
    templates: [
      'Melaksanakan tugas tambahan memeriksa kesesuaian barang bawaan saat kunjungan orang tua/wali sesuai ketentuan tata tertib Sekolah Rakyat Terintegrasi 1 Kab. Kediri guna mencegah masuknya barang terlarang serta menjaga keamanan lingkungan asrama.',
      'Melakukan pengecekan teliti dan santun terhadap barang titipan orang tua pada hari kunjungan agar tetap sesuai standar aturan gizi, kebersihan, dan keselamatan asrama.',
    ],
  },
  {
    keyword: 'menjadi petugas pemanggil dan pemberi pengumuman di kunjungan',
    aliases: ['petugas pemanggil kunjungan', 'pemberi pengumuman kunjungan', 'petugas pengumuman kunjungan'],
    rhk: 'RHK 7',
    timeContext: 'fleksibel',
    templates: [
      'Menjalankan tugas tambahan sebagai petugas pemanggil peserta didik serta pemberi pengumuman informasi di pos layanan kunjungan orang tua Sekolah Rakyat Terintegrasi 1 Kab. Kediri dengan suara jelas, komunikatif, dan tertib agar alur pertemuan berjalan lancar.',
      'Mengumumkan jadwal, tata tertib kunjungan, serta memanggil anak asuh yang dikunjungi orang tuanya secara teratur sehingga tidak terjadi penumpukan antrean tamu.',
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
  if (lower.includes('subuh') || lower.includes('dini hari') || lower.includes('fajar') || lower.includes('tahajud') || lower.includes('sahur')) return 'subuh';
  if (lower.includes('malam') || lower.includes('isya') || lower.includes('maghrib') || lower.includes('magrib') || (lower.includes('tidur') && !lower.includes('tempat tidur'))) return 'malam';
  if (lower.includes('sore') || lower.includes('ashar') || lower.includes('petang') || lower.includes('berbuka')) return 'sore';
  if (lower.includes('siang') || lower.includes('dzuhur') || lower.includes('duhur') || lower.includes("jum'at") || lower.includes('jumat')) return 'siang';
  if (lower.includes('pagi') || lower.includes('sarapan') || lower.includes('dhuha')) return 'pagi';
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
  s = s.replace(/\bhafir\b/g, 'hadir');
  s = s.replace(/\bdesiminasi\b/g, 'diseminasi');
  s = s.replace(/\bstudy tiru\b/g, 'studi tiru');
  s = s.replace(/\bvoly\b/g, 'voli');
  s = s.replace(/\bkidmat\b/g, 'khidmat');
  s = s.replace(/\bfaham\b/g, 'paham');
  s = s.replace(/\bjum\'at\b/g, 'jumat');
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

  // Matches "kamar 1", "kamar 3", "kamar melati" while excluding generic facility nouns ("kamar mandi", "kamar tidur", "kamar kecil")
  const roomMatch = text.match(/\b(kamar(?:\s*(?=[0-9])[\w\-_]+|\s+(?!mandi\b|tidur\b|kecil\b|ganti\b|perawatan\b|asrama\b|uks\b|santri\b|siswa\b|tamu\b|kosong\b)[a-z0-9\-_]+))\b/i);
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

  // 2. Pengembangan Profesi & Kompetensi Tenaga Kependidikan
  if (
    lower.includes('pelatihan') || lower.includes('workshop') || lower.includes('diklat') ||
    lower.includes('webinar') || lower.includes('kompetensi') || lower.includes('bimtek') ||
    lower.includes('studi banding') || lower.includes('studi tiru') || lower.includes('diseminasi')
  ) {
    return 'RHK 6';
  }

  // 3. Tugas Tambahan / Kepanitiaan / Rapat / Laporan Kedinasan / Petugas Kunjungan
  if (
    lower.includes('tugas tambahan') || lower.includes('kepala sekolah') || lower.includes('tugas dinas') ||
    lower.includes('panitia') || lower.includes('disposisi') || lower.includes('anbk') ||
    lower.includes('ppdb') || lower.includes('satgas') || lower.includes('rapat') ||
    lower.includes('zoom') || lower.includes('meeting') || lower.includes('laporan') ||
    lower.includes('daftar hadir kunjungan') || lower.includes('barang kunjungan') ||
    lower.includes('pengecekan barang') || lower.includes('petugas pemanggil') ||
    lower.includes('pemberi pengumuman') || lower.includes('supervisi')
  ) {
    return 'RHK 7';
  }

  // 4. Kemandirian & Tata Graha (RHK 2)
  if (
    lower.includes('cuci') || lower.includes('mencuci') || lower.includes('laundry') ||
    lower.includes('setrika') || lower.includes('menyetrika') || lower.includes('jemur') ||
    lower.includes('menjemur') || lower.includes('piring') || lower.includes('ompreng') ||
    lower.includes('kasur') || lower.includes('ranjang') || lower.includes('seprai') ||
    lower.includes('sprei') || lower.includes('selimut') || lower.includes('kloset') ||
    lower.includes('kamar mandi') || lower.includes('toilet') || lower.includes('piket kamar') ||
    lower.includes('piket kebersihan') || lower.includes('menyapu') || lower.includes('sapu') ||
    lower.includes('mengepel') || lower.includes('membersihkan') || lower.includes('bersih diri') ||
    lower.includes('kebersihan diri') || lower.includes('mandi pagi') || lower.includes('bersih asrama') ||
    lower.includes('bersih lingkungan') || lower.includes('bersih-bersih') || lower.includes('kerja bakti') ||
    lower.includes('gotong royong') || lower.includes('tata graha') || lower.includes('loker') ||
    lower.includes('almari') || lower.includes('lemari') || lower.includes('potong rambut') ||
    lower.includes('seragam bersih') || lower.includes('sandal') ||
    (lower.includes('sepatu') && !lower.includes('olahraga'))
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

  // 6. Olahraga, Bela Diri IPSI, Baris-Berbaris/LKBB, Pramuka, Rebana & Rekreasi (RHK 4 vs RHK 1)
  if (
    lower.includes('olahraga') || lower.includes('senam') || lower.includes('futsal') ||
    lower.includes('voli') || lower.includes('basket') || lower.includes('kasti') ||
    lower.includes('bulutangkis') || lower.includes('bulu tangkis') || lower.includes('badminton') ||
    lower.includes('tenis meja') || lower.includes('pingpong') || lower.includes('lari') ||
    lower.includes('jogging') || lower.includes('kebugaran') || lower.includes('rekreasi') ||
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
    lower.includes('yasin') || lower.includes('tahlil') || lower.includes('mahalul qiyam') ||
    lower.includes('diba') || lower.includes('dzikir') || lower.includes('doa bersama') ||
    lower.includes('berdoa') || lower.includes('sholat dhuha') || lower.includes('sholat tahajud') ||
    lower.includes('kajian') || lower.includes('kultum') || lower.includes('keputrian') ||
    lower.includes('spiritual') || lower.includes('rohani') || lower.includes('istighosah') ||
    lower.includes('sakit') || lower.includes('uks') || lower.includes('puskesmas') ||
    lower.includes('rumah sakit') || lower.includes('berobat') || lower.includes('memeriksakan') ||
    lower.includes('kesehatan') || lower.includes('demam') || lower.includes('obat') ||
    lower.includes('konseling') || lower.includes('cerita siswa') || lower.includes('cerita anak') ||
    lower.includes('curhat') || lower.includes('afektif') || lower.includes('disiplin') ||
    lower.includes('pendisiplinan') || lower.includes('tata tertib') || lower.includes('razia') ||
    lower.includes('homesick') || lower.includes('rindu') || lower.includes('kunjungan orang tua') ||
    lower.includes('ketertiban kunjungan') || lower.includes('keamanan kunjungan') ||
    lower.includes('kegiatan kunjungan') || lower.includes('kunjungan aman') ||
    lower.includes('kunjungan berjalan') || lower.includes('bertemu dengan anak') ||
    lower.includes('berkunjung ke rumah') || lower.includes('wali murid') ||
    lower.includes('emosional') || lower.includes('perundungan') || lower.includes('bully') ||
    lower.includes('melerai') || lower.includes('bertengkar') || lower.includes('mendamaikan') ||
    lower.includes('berselisih') || lower.includes('apel') || lower.includes('pramuka') ||
    lower.includes('rebana')
  ) {
    return 'RHK 4';
  }

  // 8. Pembelajaran & Akademik (RHK 1)
  if (
    lower.includes('belajar') || lower.includes('tugas') || lower.includes('materi') ||
    lower.includes('akademik') || lower.includes('jurnal') || lower.includes('laptop') ||
    lower.includes('refleksi') || lower.includes('literasi') || lower.includes('perpustakaan') ||
    lower.includes('baca buku') || lower.includes('membaca') || lower.includes('diskusi') ||
    lower.includes('pr') || lower.includes('ulangan') || lower.includes('ujian') ||
    lower.includes('matematika') || lower.includes('ipa') || lower.includes('ips') ||
    lower.includes('fisika') || lower.includes('kimia') || lower.includes('biologi') ||
    lower.includes('bahasa') || lower.includes('lomba') || lower.includes('ekstrakurikuler')
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

  // 0. Pengembangan Kompetensi (RHK 6), Tugas Tambahan & Kedinasan (RHK 7), ABK (RHK 5)
  if (rhk === 'RHK 6') {
    if (normalized.includes('diseminasi')) {
      return {
        deskripsi: `Menghadiri dan berpartisipasi aktif dalam kegiatan diseminasi program serta praktik baik pengasuhan di Sekolah Rakyat guna meningkatkan wawasan dan kompetensi profesional Wali Asuh Sekolah Rakyat Terintegrasi 1 Kab. Kediri.`,
        rhk: 'RHK 6',
      };
    }
    if (normalized.includes('studi tiru') || normalized.includes('studi banding')) {
      return {
        deskripsi: `Melaksanakan kegiatan studi tiru (benchmarking) tata kelola asrama dan sistem pembinaan peserta didik dari Sekolah Rakyat lain guna meningkatkan mutu pengasuhan di Sekolah Rakyat Terintegrasi 1 Kab. Kediri.`,
        rhk: 'RHK 6',
      };
    }
    return {
      deskripsi: `Mengikuti kegiatan pengembangan kompetensi tenaga kependidikan (${normalized}) guna meningkatkan kualitas pelayanan pengasuhan peserta didik di Sekolah Rakyat Terintegrasi 1 Kab. Kediri.`,
      rhk: 'RHK 6',
    };
  }

  if (rhk === 'RHK 7') {
    if (normalized.includes('zoom') || normalized.includes('meeting') || normalized.includes('rapat online')) {
      return {
        deskripsi: `Menghadiri dan mengikuti rapat koordinasi kedinasan secara daring melalui Zoom Meeting sesuai jadwal instansi guna menyimak arahan pimpinan serta menyelaraskan pelaksanaan program asrama Sekolah Rakyat Terintegrasi 1 Kab. Kediri.`,
        rhk: 'RHK 7',
      };
    }
    if (normalized.includes('rapat')) {
      return {
        deskripsi: `Menghadiri rapat koordinasi kedinasan bersama pimpinan dan tim tenaga kependidikan Sekolah Rakyat Terintegrasi 1 Kab. Kediri guna membahas evaluasi program kerja dan tindak lanjut layanan asrama.`,
        rhk: 'RHK 7',
      };
    }
    if (normalized.includes('laporan')) {
      return {
        deskripsi: `Menyusun dan menyelesaikan laporan kedinasan pelaksanaan tugas pengasuhan serta perkembangan peserta didik Sekolah Rakyat Terintegrasi 1 Kab. Kediri secara sistematis, akurat, dan tepat waktu.`,
        rhk: 'RHK 7',
      };
    }
    if (normalized.includes('daftar hadir kunjungan') || normalized.includes('barang kunjungan') || normalized.includes('petugas pemanggil')) {
      return {
        deskripsi: `Melaksanakan tugas tambahan operasional layanan kunjungan orang tua (${normalized}) di Sekolah Rakyat Terintegrasi 1 Kab. Kediri secara teliti, santun, dan tertib sesuai ketentuan tata tertib asrama.`,
        rhk: 'RHK 7',
      };
    }
    return {
      deskripsi: `Melaksanakan penugasan dinas tambahan (${normalized}) sesuai mandat Kepala Sekolah Rakyat Terintegrasi 1 Kab. Kediri dengan penuh integritas dan tanggung jawab.`,
      rhk: 'RHK 7',
    };
  }

  if (rhk === 'RHK 5') {
    return {
      deskripsi: `Melaksanakan pendampingan individual secara intensif dan penuh kesabaran bagi peserta didik berkebutuhan khusus (${normalized}) di Sekolah Rakyat Terintegrasi 1 Kab. Kediri agar dapat beraktivitas dengan nyaman.`,
      rhk: 'RHK 5',
    };
  }

  // 1. Olahraga & Kebugaran Jasmani (RHK 4 atau RHK 1)
  if (
    normalized.includes('olahraga') || normalized.includes('senam') ||
    normalized.includes('futsal') || normalized.includes('voli') ||
    normalized.includes('basket') || normalized.includes('kasti') ||
    normalized.includes('bulutangkis') || normalized.includes('bulu tangkis') || normalized.includes('badminton') ||
    normalized.includes('tenis meja') || normalized.includes('pingpong') ||
    normalized.includes('lari') || normalized.includes('jogging') ||
    normalized.includes('kebugaran')
  ) {
    let sportActivity = 'olahraga dan kebugaran jasmani';
    if (normalized.includes('futsal')) sportActivity = 'olahraga futsal bersama';
    else if (normalized.includes('voli')) sportActivity = 'olahraga bola voli';
    else if (normalized.includes('basket')) sportActivity = 'olahraga bola basket';
    else if (normalized.includes('kasti')) sportActivity = 'permainan olahraga kasti';
    else if (normalized.includes('tenis meja') || normalized.includes('pingpong')) sportActivity = 'olahraga tenis meja (pingpong)';
    else if (normalized.includes('bulutangkis') || normalized.includes('bulu tangkis') || normalized.includes('badminton')) sportActivity = 'olahraga bulu tangkis';
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
    else if (normalized.includes('cuci pakaian') || normalized.includes('laundry') || normalized.includes('mencuci')) cleanAction = 'mencuci dan menjemur pakaian seragam secara mandiri';
    else if (normalized.includes('setrika')) cleanAction = 'menyetrika dan merapikan pakaian seragam ke dalam almari';
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
