import { z } from 'zod';
import { createEndpoint } from 'zitejs/backend';
import {
  searchVocabularyBank,
  synthesizeFallbackDeskripsi,
  saveLearnedVocabularyLocal,
  getLearnedVocabularyLocal,
  detectTimeContext as detectTime,
} from '../lib/vocabulary-database.ts';

// Detailed contextual templates organized by precise sub-activity and time-of-day
const DETAILED_TEMPLATES: Record<string, { rhk: string; templates: string[]; timeOfDays?: ('pagi' | 'siang' | 'sore' | 'malam' | 'subuh')[] }> = {
  // --- MAKAN / KONSUMSI ---
  'makan malam': {
    rhk: 'RHK 3',
    timeOfDays: ['malam'],
    templates: [
      'Mendampingi kegiatan makan malam bersama di ruang makan asrama, menciptakan suasana kekeluargaan yang hangat, serta mengingatkan peserta didik untuk menghabiskan makanan dan membersihkan tempat makan.',
      'Melaksanakan pendampingan makan malam peserta didik di asrama Sekolah Rakyat Terintegrasi Kab Kediri dengan tertib, memastikan adab makan diterapkan dengan baik dan seluruh siswa mendapatkan asupan nutrisi yang cukup.',
      'Mengawasi jalannya makan malam bersama seluruh penghuni asrama, mengecek ketertiban antrian makan, serta membiasakan budaya berdoa bersama sebelum dan sesudah makan malam.',
    ],
  },
  'makan pagi': {
    rhk: 'RHK 3',
    timeOfDays: ['pagi'],
    templates: [
      'Mengawasi kegiatan makan pagi (sarapan) peserta didik sebelum berangkat sekolah, memastikan seluruh siswa sarapan dengan cukup agar memiliki energi optimal untuk mengikuti pembelajaran.',
      'Melaksanakan pendampingan sarapan pagi bersama peserta didik di ruang makan asrama dengan tertib, memastikan asupan gizi seimbang dan kesiapan siswa menuju kegiatan sekolah.',
      'Mendampingi peserta didik pada waktu makan pagi, mengingatkan pentingnya sarapan untuk kesehatan fisik, serta membiasakan merapikan peralatan makan ke tempat pencucian.',
    ],
  },
  'sarapan': {
    rhk: 'RHK 3',
    timeOfDays: ['pagi'],
    templates: [
      'Melaksanakan pendampingan sarapan pagi peserta didik di ruang makan asrama, memastikan seluruh siswa hadir tepat waktu dan sarapan dengan gizi yang memadai sebelum berangkat sekolah.',
      'Mendampingi kegiatan sarapan bersama para peserta didik, menerapkan adab makan islami, serta mengarahkan siswa bersiap berangkat menuju sekolah dengan penuh semangat.',
    ],
  },
  'makan siang': {
    rhk: 'RHK 3',
    timeOfDays: ['siang'],
    templates: [
      'Mendampingi dan mengawasi kegiatan makan siang peserta didik di ruang makan asrama sepulang dari sekolah, memastikan suasana tertib dan asupan nutrisi tercukupi.',
      'Melaksanakan pendampingan makan siang bersama peserta didik setelah menyelesaikan kegiatan belajar di sekolah, memfasilitasi waktu makan yang teratur dan higienis.',
    ],
  },
  'makan sore': {
    rhk: 'RHK 3',
    timeOfDays: ['sore'],
    templates: [
      'Mendampingi kegiatan makan sore / kudapan sehat peserta didik di asrama, memastikan ketertiban dan kebersihan area makan asrama.',
    ],
  },
  'makan': {
    rhk: 'RHK 3',
    templates: [
      'Mendampingi peserta didik selama kegiatan makan bersama di ruang makan asrama, memastikan ketertiban antrian, penerapan adab dan tata krama makan, serta kebersihan lingkungan makan.',
      'Melaksanakan pendampingan makan bersama peserta didik dengan menerapkan kebiasaan berdoa, makan dengan tertib, serta tidak menyisakan makanan sebagai bentuk rasa syukur.',
      'Membimbing siswa-siswi dalam kegiatan makan bersama secara teratur, mengingatkan pentingnya asupan gizi seimbang, serta menanamkan kebiasaan membersihkan peralatan makan sendiri.',
    ],
  },

  // --- IBADAH SHOLAT ---
  'sholat subuh': {
    rhk: 'RHK 3',
    timeOfDays: ['subuh', 'pagi'],
    templates: [
      'Mendampingi pelaksanaan sholat Subuh berjamaah bersama seluruh peserta didik di mushola asrama, dilanjutkan dengan dzikir pagi dan kultum singkat pembinaan karakter.',
      'Membangunkan peserta didik dan mendampingi pelaksanaan ibadah sholat Subuh berjamaah tepat waktu, memastikan wudhu dilakukan dengan sempurna dan shaf sholat rapi.',
    ],
  },
  'sholat dzuhur': {
    rhk: 'RHK 3',
    timeOfDays: ['siang'],
    templates: [
      'Mendampingi pelaksanaan ibadah sholat Dzuhur berjamaah peserta didik di mushola asrama setelah kembali dari kegiatan sekolah, memastikan kekhusyukan dan ketertiban.',
      'Mengawasi dan membimbing peserta didik melaksanakan sholat Dzuhur berjamaah secara tepat waktu, mengecek kehadiran seluruh siswa di mushola.',
    ],
  },
  'sholat duhur': {
    rhk: 'RHK 3',
    timeOfDays: ['siang'],
    templates: [
      'Mendampingi pelaksanaan ibadah sholat Dzuhur berjamaah peserta didik di mushola asrama setelah kembali dari sekolah, memastikan kekhusyukan dan ketertiban.',
    ],
  },
  'sholat ashar': {
    rhk: 'RHK 3',
    timeOfDays: ['sore'],
    templates: [
      'Melaksanakan pendampingan ibadah sholat Ashar berjamaah bagi peserta didik di mushola asrama, memastikan seluruh siswa hadir dan melaksanakan ibadah tepat waktu.',
      'Mendampingi pelaksanaan sholat Ashar berjamaah di asrama dilanjutkan dengan doa bersama dan pengarahan singkat kegiatan sore hari.',
    ],
  },
  'sholat maghrib': {
    rhk: 'RHK 3',
    timeOfDays: ['malam', 'sore'],
    templates: [
      'Mendampingi pelaksanaan sholat Maghrib berjamaah bersama seluruh peserta didik di mushola asrama, dilanjutkan dengan kegiatan tadarus Al-Quran bersama.',
      'Melaksanakan pendampingan ibadah sholat Maghrib berjamaah, memastikan shaf sholat tertib dan membina suasana spiritual yang khusyuk di asrama.',
    ],
  },
  'sholat magrib': {
    rhk: 'RHK 3',
    timeOfDays: ['malam', 'sore'],
    templates: [
      'Mendampingi pelaksanaan sholat Maghrib berjamaah bersama seluruh peserta didik di mushola asrama, dilanjutkan dengan kegiatan mengaji bersama.',
    ],
  },
  'sholat isya': {
    rhk: 'RHK 3',
    timeOfDays: ['malam'],
    templates: [
      'Mendampingi pelaksanaan sholat Isya berjamaah bagi peserta didik di mushola asrama, memastikan seluruh siswa hadir tepat waktu sebelum melanjutkan kegiatan belajar malam.',
      'Melaksanakan pendampingan sholat Isya berjamaah secara tertib dan khusyuk, dilanjutkan arahan persiapan sesi belajar mandiri malam hari.',
    ],
  },
  'sholat dhuha': {
    rhk: 'RHK 4',
    timeOfDays: ['pagi'],
    templates: [
      'Membimbing peserta didik dalam pembiasaan sholat Dhuha berjamaah di mushola, menanamkan nilai-nilai spiritual dan kedisiplinan beribadah sunnah.',
    ],
  },
  'sholat': {
    rhk: 'RHK 3',
    templates: [
      'Melaksanakan pendampingan ibadah sholat berjamaah bersama peserta didik di mushola asrama, memastikan ketertiban shaf, kekhusyukan pelaksanaan, serta ketepatan waktu.',
      'Mendampingi dan mengawasi pelaksanaan sholat wajib berjamaah peserta didik, memberikan teguran lembut kepada yang terlambat, serta memastikan wudhu dilakukan dengan benar.',
    ],
  },

  // --- APEL & KEDISIPLINAN ---
  'apel pagi': {
    rhk: 'RHK 4',
    timeOfDays: ['pagi'],
    templates: [
      'Memimpin dan mendampingi kegiatan apel pagi peserta didik sebelum berangkat sekolah, mengecek kerapian atribut seragam, kebersihan diri, serta memberikan motivasi semangat belajar.',
      'Melaksanakan apel pagi di halaman asrama, melakukan presensi kehadiran siswa, dan menyampaikan arahan kedisiplinan harian.',
    ],
  },
  'apel malam': {
    rhk: 'RHK 4',
    timeOfDays: ['malam'],
    templates: [
      'Melaksanakan kegiatan apel malam bersama seluruh peserta didik di asrama, mengecek kelengkapan kehadiran siswa, mengevaluasi kegiatan hari ini, dan memberikan arahan istirahat malam.',
      'Memimpin apel malam di asrama sebagai sarana pembinaan kedisiplinan, pengecekan kondisi fisik dan psikis siswa, serta memastikan situasi asrama kondusif menjelang jam tidur.',
    ],
  },
  'apel': {
    rhk: 'RHK 4',
    templates: [
      'Melaksanakan kegiatan apel bersama peserta didik, melakukan pengecekan kehadiran dan kerapian, serta menyampaikan evaluasi singkat kegiatan harian di asrama.',
    ],
  },

  // --- BELAJAR & AKADEMIK ---
  'belajar malam': {
    rhk: 'RHK 1',
    timeOfDays: ['malam'],
    templates: [
      'Melaksanakan pendampingan kegiatan belajar malam peserta didik di ruang belajar asrama, mengondisikan suasana tenang, serta membantu siswa yang memerlukan bimbingan materi pelajaran.',
      'Mendampingi proses belajar mandiri malam hari, memastikan seluruh peserta didik fokus menyelesaikan tugas dan mengulang materi sekolah esok hari.',
    ],
  },
  'belajar mandiri': {
    rhk: 'RHK 1',
    templates: [
      'Mendampingi proses pembelajaran mandiri peserta didik di ruang belajar asrama, memberikan motivasi agar siswa tekun dan memfasilitasi tanya jawab seputar materi pelajaran.',
      'Memfasilitasi sesi belajar mandiri terarah, membantu siswa mengelola waktu belajar dengan efektif, serta mengecek pemahaman konsep akademik.',
    ],
  },
  'belajar kelompok': {
    rhk: 'RHK 1',
    templates: [
      'Memfasilitasi kegiatan belajar kelompok antar-peserta didik di asrama, mendorong tutor sebaya, dan memastikan setiap anggota kelompok aktif berdiskusi.',
    ],
  },
  'belajar': {
    rhk: 'RHK 1',
    templates: [
      'Melaksanakan pendampingan kegiatan belajar bersama peserta didik dengan menekankan penguasaan materi pelajaran serta teknik belajar yang efektif di asrama Sekolah Rakyat Terintegrasi Kab Kediri.',
      'Memberikan bimbingan belajar secara intensif kepada siswa-siswi, meliputi penjelasan materi yang belum dipahami serta latihan soal guna meningkatkan capaian akademik.',
    ],
  },
  'tugas': {
    rhk: 'RHK 1',
    templates: [
      'Membimbing peserta didik dalam mengerjakan tugas dan pekerjaan rumah (PR) sekolah secara terstruktur, memastikan siswa memahami instruksi dan menyelesaikannya tepat waktu.',
      'Melaksanakan pendampingan penyelesaian tugas harian peserta didik, memberikan bimbingan tambahan, serta memeriksa kelengkapan hasil kerja siswa.',
    ],
  },
  'laptop': {
    rhk: 'RHK 1',
    templates: [
      'Melaksanakan pendampingan pemanfaatan laptop untuk menunjang kegiatan pembelajaran digital peserta didik, memastikan penggunaan yang edukatif dan bertanggung jawab.',
      'Membimbing siswa dalam mengoperasikan perangkat komputer/laptop untuk pengerjaan tugas sekolah dan akses referensi materi pembelajaran daring.',
    ],
  },
  'jurnal': {
    rhk: 'RHK 1',
    templates: [
      'Menyusun jurnal pengasuhan harian yang mencakup catatan aktivitas, perkembangan peserta didik, serta evaluasi program sebagai bahan dokumentasi dan tindak lanjut pembinaan.',
      'Mendokumentasikan seluruh rangkaian aktivitas pendampingan dalam jurnal harian asrama secara sistematis dan akuntabel.',
    ],
  },
  'refleksi': {
    rhk: 'RHK 1',
    timeOfDays: ['malam'],
    templates: [
      'Melaksanakan kegiatan refleksi malam bersama peserta didik untuk mengevaluasi rangkaian aktivitas sepanjang hari, menyampaikan pesan motivasi, serta memetik hikmah pembelajaran.',
      'Memfasilitasi sesi refleksi dan evaluasi harian, memberi ruang peserta didik menyampaikan pengalaman dan kendala, guna mempererat kekeluargaan di asrama.',
    ],
  },
  'sharing': {
    rhk: 'RHK 1',
    templates: [
      'Memfasilitasi sesi sharing dan diskusi santai bersama peserta didik mengenai adaptasi asrama, cita-cita, serta solusi atas kendala belajar yang dihadapi.',
    ],
  },

  // --- KEMANDIRIAN & KEBERSIHAN ---
  'cuci baju': {
    rhk: 'RHK 2',
    templates: [
      'Melaksanakan pendampingan kemandirian peserta didik dalam mencuci dan menjemur pakaian secara mandiri di area laundry asrama, menanamkan kebiasaan hidup bersih.',
      'Membimbing siswa melakukan kegiatan cuci baju mandiri, mengajarkan takaran detergen yang tepat, teknik mencuci bersih, serta penjemuran yang rapi.',
    ],
  },
  'laundry': {
    rhk: 'RHK 2',
    templates: [
      'Mendampingi peserta didik dalam kegiatan laundry dan pencucian pakaian pribadi, melatih tanggung jawab dalam merawat barang milik sendiri.',
    ],
  },
  'cuci piring': {
    rhk: 'RHK 2',
    templates: [
      'Membimbing peserta didik membersihkan dan mencuci peralatan makan masing-masing setelah selesai makan, menanamkan budaya tanggung jawab dan kebersihan.',
    ],
  },
  'cuci': {
    rhk: 'RHK 2',
    templates: [
      'Melaksanakan pendampingan kegiatan kemandirian peserta didik dalam mencuci pakaian dan perlengkapan pribadi secara mandiri di lingkungan asrama Sekolah Rakyat Terintegrasi Kab Kediri.',
    ],
  },
  'piket kebersihan': {
    rhk: 'RHK 2',
    templates: [
      'Mengawasi dan mendampingi pelaksanaan piket kebersihan harian peserta didik, memastikan area kamar, lorong, dan fasilitas bersama dibersihkan dengan baik.',
    ],
  },
  'piket': {
    rhk: 'RHK 2',
    templates: [
      'Mengawasi pelaksanaan tugas piket peserta didik sesuai jadwal yang ditentukan, memastikan setiap siswa menjalankan tanggung jawabnya dengan tertib dan bersih.',
    ],
  },
  'kerja bakti': {
    rhk: 'RHK 2',
    templates: [
      'Mengoordinasikan dan mendampingi kegiatan kerja bakti gotong royong membersihkan seluruh lingkungan asrama dan halaman bersama seluruh peserta didik.',
    ],
  },
  'bersih': {
    rhk: 'RHK 2',
    templates: [
      'Melaksanakan pendampingan kegiatan kebersihan lingkungan asrama bersama peserta didik, mengarahkan untuk menyapu, mengepel, dan menata area asrama agar tetap sehat dan nyaman.',
    ],
  },
  'rapikan': {
    rhk: 'RHK 2',
    templates: [
      'Melatih dan mendampingi peserta didik merapikan tempat tidur, melipat selimut, serta menata lemari pakaian secara mandiri dan rapi di kamar asrama.',
    ],
  },
  'merapikan': {
    rhk: 'RHK 2',
    templates: [
      'Mendampingi siswa merapikan area kamar tidur dan ruang belajar, membiasakan pola hidup rapi, tertib, dan terorganisir.',
    ],
  },
  'kemandirian': {
    rhk: 'RHK 2',
    templates: [
      'Melaksanakan pembinaan kemandirian peserta didik dalam pengelolaan kebutuhan harian pribadi, kebersihan diri, dan manajemen waktu di asrama.',
    ],
  },
  'masak': {
    rhk: 'RHK 2',
    templates: [
      'Mendampingi peserta didik dalam kegiatan praktik memasak bersama sebagai bagian dari pembekalan keterampilan hidup mandiri di asrama.',
    ],
  },

  // --- SPIRITUAL, EMOSIONAL & KESEHATAN ---
  'mengaji': {
    rhk: 'RHK 4',
    templates: [
      'Melaksanakan pendampingan kegiatan mengaji Al-Quran bersama peserta didik dengan metode tartil, mencakup perbaikan bacaan tajwid, makhraj, dan hafalan surat pendek.',
      'Membimbing peserta didik dalam tilawah Al-Quran harian di mushola asrama, memberikan koreksi bacaan, serta membina kecintaan terhadap Al-Quran.',
    ],
  },
  'tadarus': {
    rhk: 'RHK 4',
    templates: [
      'Mendampingi kegiatan tadarus Al-Quran bersama peserta didik selepas ibadah sholat berjamaah, menyimak bacaan secara bergantian dengan khusyuk.',
    ],
  },
  'setoran': {
    rhk: 'RHK 4',
    templates: [
      'Menyimak dan mendampingi setoran hafalan Al-Quran peserta didik, mencatat progres capaian hafalan ayat, serta memberikan motivasi target tahfidz.',
    ],
  },
  'hafalan': {
    rhk: 'RHK 4',
    templates: [
      'Melaksanakan kegiatan bimbingan murajaah hafalan Al-Quran dan doa harian bersama peserta didik, memperkuat hafalan dengan pembiasaan rutin.',
    ],
  },
  'kajian': {
    rhk: 'RHK 4',
    templates: [
      'Melaksanakan pendampingan kegiatan kajian keagamaan sore bersama peserta didik mengenai adab dan akhlak mulia dalam kehidupan sehari-hari di asrama.',
    ],
  },
  'konseling': {
    rhk: 'RHK 4',
    templates: [
      'Melaksanakan sesi konseling dan pendampingan personal kepada peserta didik, mendengarkan keluhan dengan empati, serta memberikan dorongan motivasi emosional.',
      'Memberikan layanan konseling individual dan bimbingan psikososial bagi siswa yang membutuhkan penguatan mental dan adaptasi asrama.',
    ],
  },
  'sakit': {
    rhk: 'RHK 4',
    templates: [
      'Melakukan pemantauan dan perawatan kesehatan peserta didik yang mengeluhkan sakit di ruang UKS/kamar asrama, memberikan obat sesuai keluhan dan memastikan asupan makanan.',
      'Mendampingi peserta didik yang sedang sakit, mengecek suhu tubuh secara berkala, menyediakan makanan hangat, serta berkoordinasi dengan tenaga medis.',
    ],
  },
  'kesehatan': {
    rhk: 'RHK 4',
    templates: [
      'Melaksanakan monitoring kondisi kesehatan harian seluruh peserta didik asrama, memastikan sanitasi terjaga dan siswa dalam kondisi fit beraktivitas.',
    ],
  },
  'olahraga pagi': {
    rhk: 'RHK 4',
    timeOfDays: ['pagi'],
    templates: [
      'Melaksanakan pendampingan olahraga senam pagi bersama seluruh peserta didik di halaman asrama guna menjaga kebugaran jasmani dan kesiapan fisik belajar.',
      'Memimpin kegiatan jalan santai dan pemanasan pagi bersama siswa asrama untuk membangun semangat positif dan kesehatan tubuh.',
    ],
  },
  'olahraga sore': {
    rhk: 'RHK 4',
    timeOfDays: ['sore'],
    templates: [
      'Mendampingi peserta didik dalam kegiatan olahraga dan permainan tim sore hari di lapangan asrama, menyalurkan energi positif secara terarah dan sportif.',
    ],
  },
  'senam': {
    rhk: 'RHK 4',
    timeOfDays: ['pagi'],
    templates: [
      'Melaksanakan senam kesegaran jasmani pagi bersama seluruh peserta didik, memandu gerakan pemanasan dan pendinginan demi kebugaran tubuh.',
    ],
  },
  'olahraga': {
    rhk: 'RHK 4',
    templates: [
      'Melaksanakan pendampingan kegiatan olahraga dan aktivitas fisik bersama peserta didik guna membina kesehatan jasmani dan kekompakan tim.',
    ],
  },
  'disiplin': {
    rhk: 'RHK 4',
    templates: [
      'Melakukan pembinaan kedisiplinan dan kepatuhan tata tertib asrama kepada peserta didik, menekankan rasa tanggung jawab pribadi dan ketepatan waktu.',
    ],
  },
  'kunjungan': {
    rhk: 'RHK 4',
    templates: [
      'Mendampingi dan mengawasi kegiatan kunjungan orang tua/wali siswa ke asrama, memfasilitasi pertemuan yang tertib serta melaporkan perkembangan siswa.',
    ],
  },

  // --- MOBILITAS, RUTINITAS HARIAN ---
  'bangun': {
    rhk: 'RHK 3',
    timeOfDays: ['subuh', 'pagi'],
    templates: [
      'Membangunkan seluruh peserta didik asrama pada dini hari untuk persiapan sholat Subuh berjamaah, memastikan setiap siswa bangun dengan tertib dan segera berwudhu.',
      'Melaksanakan kegiatan membangunkan siswa pagi hari secara santun dan disiplin, mengondisikan awal hari yang penuh semangat dan keberkahan.',
    ],
  },
  'persiapan sekolah': {
    rhk: 'RHK 3',
    timeOfDays: ['pagi'],
    templates: [
      'Melaksanakan pendampingan persiapan keberangkatan sekolah peserta didik, mengecek kelengkapan seragam, tas belajar, serta kerapian penampilan siswa.',
      'Mendampingi siswa-siswi bersiap menuju sekolah di pagi hari, memastikan perlengkapan belajar lengkap dan seluruh siswa telah sarapan.',
    ],
  },
  'antar sekolah': {
    rhk: 'RHK 3',
    timeOfDays: ['pagi'],
    templates: [
      'Mendampingi dan mengantar peserta didik berangkat menuju gedung sekolah, memastikan perjalanan berlangsung aman, tertib, dan tepat waktu.',
    ],
  },
  'jemput sekolah': {
    rhk: 'RHK 3',
    timeOfDays: ['siang', 'sore'],
    templates: [
      'Melaksanakan kegiatan penjemputan dan pengawalan kepulangan peserta didik dari sekolah menuju asrama dengan selamat dan tertib.',
    ],
  },
  'sambut': {
    rhk: 'RHK 3',
    timeOfDays: ['sore', 'siang'],
    templates: [
      'Menyambut kedatangan siswa-siswi yang kembali ke asrama setelah kegiatan belajar di sekolah, mengecek presensi kehadiran dan menanyakan kondisi siswa.',
    ],
  },
  'istirahat': {
    rhk: 'RHK 3',
    templates: [
      'Mengawasi waktu istirahat siang peserta didik di kamar asrama, memastikan suasana tenang dan kondusif untuk memulihkan stamina siswa.',
    ],
  },
  'tidur malam': {
    rhk: 'RHK 3',
    timeOfDays: ['malam'],
    templates: [
      'Melaksanakan pendampingan menjelang waktu istirahat malam, memastikan seluruh siswa berada di kamar masing-masing, lampu dipadamkan, dan situasi asrama aman.',
    ],
  },
  'tidur': {
    rhk: 'RHK 3',
    timeOfDays: ['malam'],
    templates: [
      'Mengawasi kegiatan persiapan tidur malam peserta didik, mengajak berdoa sebelum tidur, serta memastikan keamanan seluruh kamar asrama.',
    ],
  },
  'upacara': {
    rhk: 'RHK 3',
    timeOfDays: ['pagi'],
    templates: [
      'Mendampingi peserta didik dalam pelaksanaan upacara bendera, memastikan barisan rapi, atribut seragam lengkap, serta siswa bersikap khidmat.',
    ],
  },
  'ekskul': {
    rhk: 'RHK 3',
    templates: [
      'Mendampingi peserta didik yang mengikuti kegiatan ekstrakurikuler di sore hari, mengawasi partisipasi aktif dan memantau bakat minat siswa.',
    ],
  },

  // --- RHK 5, 6, 7 ---
  'berkebutuhan khusus': {
    rhk: 'RHK 5',
    templates: [
      'Melaksanakan pendampingan individual secara intensif kepada peserta didik berkebutuhan khusus agar dapat beraktivitas dengan nyaman dan mandiri di asrama.',
    ],
  },
  'disabilitas': {
    rhk: 'RHK 5',
    templates: [
      'Mendampingi aktivitas harian peserta didik dengan disabilitas, memastikan aksesibilitas fasilitas dan interaksi inklusif sesama penghuni asrama.',
    ],
  },
  'pelatihan': {
    rhk: 'RHK 6',
    templates: [
      'Mengikuti kegiatan pelatihan dan pengembangan kompetensi tenaga kependidikan guna meningkatkan kualitas pengasuhan dan pembinaan karakter di asrama.',
    ],
  },
  'workshop': {
    rhk: 'RHK 6',
    templates: [
      'Mengikuti workshop peningkatan kapasitas wali asuh Sekolah Rakyat Terintegrasi dalam strategi pendampingan psikososial peserta didik.',
    ],
  },
  'webinar': {
    rhk: 'RHK 6',
    templates: [
      'Mengikuti kegiatan webinar pengembangan profesionalisme tenaga kependidikan terkait manajemen asrama dan pembinaan kedisiplinan positif.',
    ],
  },
  'tugas kepala sekolah': {
    rhk: 'RHK 7',
    templates: [
      'Melaksanakan tugas tambahan kedinasan sesuai penugasan dari Kepala Sekolah dalam rangka mendukung kelancaran operasional asrama Sekolah Rakyat Terintegrasi Kab Kediri.',
    ],
  },
  'kepanitiaan': {
    rhk: 'RHK 7',
    templates: [
      'Melaksanakan tugas kepanitiaan acara kedinasan di lingkungan Sekolah Rakyat Terintegrasi 1 Kediri sesuai arahan dan mandat pimpinan.',
    ],
  },
};

function detectTimeContext(text: string): 'pagi' | 'siang' | 'sore' | 'malam' | 'subuh' | null {
  const lower = text.toLowerCase();
  if (lower.includes('subuh') || lower.includes('dini hari')) return 'subuh';
  if (lower.includes('malam') || lower.includes('isya') || lower.includes('maghrib') || lower.includes('magrib')) return 'malam';
  if (lower.includes('sore') || lower.includes('ashar')) return 'sore';
  if (lower.includes('siang') || lower.includes('dzuhur') || lower.includes('duhur')) return 'siang';
  if (lower.includes('pagi') || lower.includes('sarapan') || lower.includes('dhuha')) return 'pagi';
  return null;
}

function detectRhkCategory(text: string): string {
  const lower = text.toLowerCase();
  if (lower.includes('khusus') || lower.includes('disabilitas') || lower.includes('inklusi') || lower.includes('abk')) {
    return 'RHK 5';
  }
  if (lower.includes('pelatihan') || lower.includes('workshop') || lower.includes('diklat') || lower.includes('webinar') || lower.includes('kompetensi')) {
    return 'RHK 6';
  }
  if (lower.includes('tugas tambahan') || lower.includes('kepala sekolah') || lower.includes('panitia')) {
    return 'RHK 7';
  }
  if (
    lower.includes('mengaji') || lower.includes('sholat') || lower.includes('kajian') ||
    lower.includes('doa') || lower.includes('spiritual') || lower.includes('sakit') ||
    lower.includes('kesehatan') || lower.includes('olahraga') || lower.includes('senam') ||
    lower.includes('konseling') || lower.includes('disiplin') || lower.includes('tata tertib') ||
    lower.includes('apel') || lower.includes('setor') || lower.includes('hafalan') ||
    lower.includes('kunjungan') || lower.includes('emosional')
  ) {
    return 'RHK 4';
  }
  if (
    lower.includes('cuci') || lower.includes('bersih') || lower.includes('rapikan') ||
    lower.includes('merapikan') || lower.includes('piket') || lower.includes('laundry') ||
    lower.includes('kemandirian') || lower.includes('kebersihan') || lower.includes('masak') ||
    lower.includes('kasur') || lower.includes('seprai') || lower.includes('lemari')
  ) {
    return 'RHK 2';
  }
  if (
    lower.includes('belajar') || lower.includes('tugas') || lower.includes('materi') ||
    lower.includes('akademik') || lower.includes('jurnal') || lower.includes('laptop') ||
    lower.includes('refleksi') || lower.includes('sharing') || lower.includes('diskusi pelajaran') ||
    lower.includes('koordinasi') || lower.includes('rapat')
  ) {
    return 'RHK 1';
  }
  return 'RHK 3';
}

function generateSmartFallback(rawKeyword: string): { deskripsi: string; rhk: string } {
  const keyword = rawKeyword.toLowerCase().trim();
  const timeContext = detectTimeContext(keyword);

  // 1. Try exact multi-word / specific phrase matches first (sorted by length descending for best specificity)
  const sortedKeys = Object.keys(DETAILED_TEMPLATES).sort((a, b) => b.length - a.length);

  for (const key of sortedKeys) {
    if (keyword.includes(key)) {
      const entry = DETAILED_TEMPLATES[key];
      // Filter templates to avoid contradicting the time of day
      const compatibleTemplates = entry.templates.filter(tpl => {
        const tplTime = detectTimeContext(tpl);
        if (timeContext && tplTime && timeContext !== tplTime) {
          // If the user said "makan malam", do not choose a template mentioning "pagi" or "sarapan"
          return false;
        }
        return true;
      });

      const pool = compatibleTemplates.length > 0 ? compatibleTemplates : entry.templates;
      const selected = pool[Math.floor(Math.random() * pool.length)];
      return { deskripsi: selected, rhk: entry.rhk };
    }
  }

  // 2. Synthesize a clean, grammatically correct Indonesian description using the exact keywords
  const rhk = detectRhkCategory(keyword);
  const cleanKeyword = rawKeyword.trim().replace(/^mendampingi\s+/i, '').replace(/^mengawasi\s+/i, '');
  const capitalized = cleanKeyword.charAt(0).toUpperCase() + cleanKeyword.slice(1);

  let deskripsi = '';
  if (timeContext === 'malam') {
    deskripsi = `Melaksanakan pendampingan kegiatan ${capitalized.toLowerCase()} bersama peserta didik di lingkungan asrama Sekolah Rakyat Terintegrasi 1 Kab. Kediri, memastikan suasana malam hari tetap tertib, aman, dan penuh rasa kekeluargaan.`;
  } else if (timeContext === 'pagi' || timeContext === 'subuh') {
    deskripsi = `Melaksanakan pendampingan kegiatan ${capitalized.toLowerCase()} peserta didik pada pagi hari di asrama Sekolah Rakyat Terintegrasi 1 Kab. Kediri dengan disiplin, tertib, dan mempersiapkan siswa dengan penuh semangat.`;
  } else if (timeContext === 'siang') {
    deskripsi = `Melaksanakan pendampingan kegiatan ${capitalized.toLowerCase()} peserta didik pada siang hari di lingkungan asrama Sekolah Rakyat Terintegrasi 1 Kab. Kediri secara tertib dan teratur.`;
  } else if (timeContext === 'sore') {
    deskripsi = `Melaksanakan pendampingan kegiatan ${capitalized.toLowerCase()} bersama peserta didik pada sore hari di lingkungan asrama Sekolah Rakyat Terintegrasi 1 Kab. Kediri, memastikan seluruh siswa mengikuti dengan antusias.`;
  } else {
    deskripsi = `Melaksanakan tugas pendampingan pada kegiatan ${capitalized.toLowerCase()} peserta didik di lingkungan asrama Sekolah Rakyat Terintegrasi 1 Kab. Kediri secara tertib, bertanggung jawab, dan mendukung pembinaan karakter siswa.`;
  }

  return { deskripsi, rhk };
}

const DEFAULT_CPANEL_URL = 'https://game.gabutgame.my.id/skp/api_kegiatan.php';

let serverVocabCache: { kataKunci: string; deskripsi: string; rhk: string }[] | null = null;
let lastServerVocabFetch = 0;

async function fetchServerDatabaseVocabulary(): Promise<{ kataKunci: string; deskripsi: string; rhk: string }[]> {
  const now = Date.now();
  // Cache for 5 minutes in memory to keep response ultra fast
  if (serverVocabCache && (now - lastServerVocabFetch < 300000)) {
    return serverVocabCache;
  }

  try {
    const res = await fetch(`${DEFAULT_CPANEL_URL}?action=get_kegiatan`);
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.records)) {
        const list: { kataKunci: string; deskripsi: string; rhk: string }[] = [];
        for (const r of data.records) {
          const desc = String(r.deskripsi_kegiatan || r.deskripsiKegiatan || '').trim();
          const kunci = String(r.kata_kunci_kegiatan || r.kataKunciKegiatan || '').trim();
          const rhk = String(r.rhk_kategori || r.rhkKategori || 'RHK 3');
          if (desc) {
            list.push({ kataKunci: kunci || desc.slice(0, 30), deskripsi: desc, rhk });
          }
        }
        serverVocabCache = list;
        lastServerVocabFetch = now;
        return list;
      }
    }
  } catch (err) {
    console.warn('[generateDeskripsi] Gagal memuat bank kosa kata dari database server:', err);
  }
  return serverVocabCache || [];
}

export default createEndpoint({
  inputSchema: z.object({ kataKunci: z.string() }),
  outputSchema: z.object({
    deskripsi: z.string(),
    rhk: z.string(),
  }),
  async execute({ input }) {
    const raw = input.kataKunci.trim();
    if (!raw) {
      return { deskripsi: '', rhk: 'RHK 3' };
    }

    // 1. Coba panggil server-side Gemini API endpoint (/api/gemini/generate-deskripsi)
    try {
      const response = await fetch('/api/gemini/generate-deskripsi', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ kataKunci: raw }),
      });

      const contentType = response.headers.get('content-type') || '';
      if (response.ok && contentType.includes('application/json')) {
        const data = await response.json();
        if (data.deskripsi && data.rhk) {
          const deskripsiStr = String(data.deskripsi);
          const rhkStr = String(data.rhk);

          // Simpan ke bank kosa kata lokal browser
          saveLearnedVocabularyLocal(raw, deskripsiStr, rhkStr);

          return {
            deskripsi: deskripsiStr,
            rhk: rhkStr,
          };
        }
      }
    } catch (err) {
      console.warn('Panggilan ke server /api/gemini/generate-deskripsi:', err);
    }

    // High precision fallback tiers:
    // 1. Check central server MySQL database bank vocabulary (shared across all devices)
    try {
      const serverRecords = await fetchServerDatabaseVocabulary();
      const cleanRaw = raw.toLowerCase().trim();
      const timeCtx = detectTime(cleanRaw);

      const matchedServer = serverRecords.filter(item => {
        const kw = item.kataKunci.toLowerCase();
        const desc = item.deskripsi.toLowerCase();
        return (kw && (cleanRaw.includes(kw) || kw.includes(cleanRaw))) ||
               desc.includes(cleanRaw);
      });

      if (matchedServer.length > 0) {
        const pool = matchedServer.filter(item => {
          const t = detectTime(item.deskripsi);
          return !timeCtx || !t || timeCtx === t;
        });
        const selected = (pool.length > 0 ? pool : matchedServer)[0];
        return { deskripsi: selected.deskripsi, rhk: selected.rhk };
      }
    } catch {
      // ignore & proceed to next fallback
    }

    // 2. Check local learned cache in browser
    try {
      const learned = getLearnedVocabularyLocal();
      const cleanRaw = raw.toLowerCase().trim();
      const timeCtx = detectTime(cleanRaw);
      const matchedLearned = learned.filter(item => {
        const kw = item.kataKunci.toLowerCase();
        return cleanRaw.includes(kw) || kw.includes(cleanRaw);
      });
      if (matchedLearned.length > 0) {
        const pool = matchedLearned.filter(item => {
          const t = detectTime(item.deskripsi);
          return !timeCtx || !t || timeCtx === t;
        });
        const selected = (pool.length > 0 ? pool : matchedLearned)[0];
        return { deskripsi: selected.deskripsi, rhk: selected.rhk };
      }
    } catch {
      // ignore
    }

    // 2. Check comprehensive pre-seeded vocabulary bank
    const bankMatch = searchVocabularyBank(raw);
    if (bankMatch) {
      return { deskripsi: bankMatch.deskripsi, rhk: bankMatch.rhk };
    }

    // 3. Fallback to existing detailed templates or synthesizer
    return generateSmartFallback(raw);
  },
});
