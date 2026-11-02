import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@project/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@project/components/ui/tabs';
import { Button } from '@project/components/ui/button';
import { Input } from '@project/components/ui/input';
import { Label } from '@project/components/ui/label';
import { Badge } from '@project/components/ui/badge';
import { toast } from 'sonner';
import {
  Database,
  Download,
  FileCode,
  CheckCircle2,
  Server,
  Key,
  Globe,
  Send,
  AlertTriangle,
  Copy,
  ExternalLink,
} from 'lucide-react';
import { getKegiatan, getRiwayat } from 'zitejs/api';

const SCHEMA_SQL = `-- ========================================================
-- SKRIP DATABASE MYSQL / MARIADB UNTUK CPANEL
-- Aplikasi: Bimbingan dan Pembinaan Peserta Didik 24 Kediri
-- SRT 1 KABUPATEN KEDIRI
-- ========================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- 1. Tabel Kegiatan Harian
CREATE TABLE IF NOT EXISTS \`kegiatan_harian\` (
  \`id\` VARCHAR(64) NOT NULL PRIMARY KEY,
  \`id_kegiatan\` INT AUTO_INCREMENT UNIQUE,
  \`nama_pelapor\` VARCHAR(255) NOT NULL,
  \`nip\` VARCHAR(64) NOT NULL,
  \`tanggal\` DATE NOT NULL,
  \`waktu_mulai\` VARCHAR(16) NOT NULL,
  \`waktu_selesai\` VARCHAR(16) NOT NULL,
  \`kata_kunci_kegiatan\` VARCHAR(255) DEFAULT '',
  \`deskripsi_kegiatan\` TEXT NOT NULL,
  \`rhk_kategori\` VARCHAR(64) DEFAULT 'RHK 3',
  \`foto_kegiatan\` JSON DEFAULT NULL COMMENT 'Array URL / base64 foto',
  \`tanda_tangan\` JSON DEFAULT NULL COMMENT 'Array URL / base64 ttd',
  \`unit_kerja\` VARCHAR(255) DEFAULT 'SEKOLAH RAKYAT TERINTEGRASI 1 KAB. KEDIRI',
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX \`idx_tanggal\` (\`tanggal\`),
  INDEX \`idx_pelapor\` (\`nama_pelapor\`),
  INDEX \`idx_rhk\` (\`rhk_kategori\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Tabel Laporan RHK
CREATE TABLE IF NOT EXISTS \`laporan_rhk\` (
  \`id\` VARCHAR(64) NOT NULL PRIMARY KEY,
  \`id_laporan\` INT AUTO_INCREMENT UNIQUE,
  \`judul_laporan\` VARCHAR(255) NOT NULL,
  \`rhk_nomor\` VARCHAR(64) NOT NULL,
  \`nama_pelapor\` VARCHAR(255) NOT NULL,
  \`nip\` VARCHAR(64) NOT NULL,
  \`tanggal_mulai\` DATE NOT NULL,
  \`tanggal_selesai\` DATE NOT NULL,
  \`isi_laporan\` LONGTEXT,
  \`pdf_url\` TEXT,
  \`tanda_tangan\` JSON DEFAULT NULL,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX \`idx_rhk_nomor\` (\`rhk_nomor\`),
  INDEX \`idx_periode\` (\`tanggal_mulai\`, \`tanggal_selesai\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Tabel Riwayat File Cetak (PDF / Word)
CREATE TABLE IF NOT EXISTS \`riwayat_file\` (
  \`id\` VARCHAR(64) NOT NULL PRIMARY KEY,
  \`id_file\` INT AUTO_INCREMENT UNIQUE,
  \`nama_file\` VARCHAR(255) NOT NULL,
  \`jenis_laporan\` VARCHAR(64) NOT NULL,
  \`nama_pelapor\` VARCHAR(255) NOT NULL,
  \`pdf_url\` LONGTEXT,
  \`tanggal_mulai\` DATE DEFAULT NULL,
  \`tanggal_selesai\` DATE DEFAULT NULL,
  \`rhk_nomor\` VARCHAR(64) DEFAULT NULL,
  \`dibuat_pada\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX \`idx_jenis\` (\`jenis_laporan\`),
  INDEX \`idx_pelapor_file\` (\`nama_pelapor\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
`;

const PHP_API_CODE = `<?php
/**
 * BACKEND API CPANEL (PHP + MySQL PDO)
 * Upload file ini ke: public_html/api/api_kegiatan.php di cPanel Anda.
 */

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-API-KEY');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// ==========================================
// 1. KONFIGURASI DATABASE CPANEL ANDA
// ==========================================
$db_host = 'localhost';               // Biasanya 'localhost' di cPanel
$db_name = 'u123456_srtkediri';       // GANTI dengan nama database cPanel Anda
$db_user = 'u123456_dbuser';          // GANTI dengan nama user database Anda
$db_pass = 'PasswordKuatDatabaseAnda'; // GANTI dengan password user database Anda

// Kunci Keamanan API (opsional, kosongkan jika tidak ingin membatasi)
$api_secret = ''; // Misal: 'srt1-kediri-secret-key-2026'

// ==========================================
// 2. KONEKSI KE MYSQL MENGGUNAKAN PDO
// ==========================================
try {
    $pdo = new PDO("mysql:host=$db_host;dbname=$db_name;charset=utf8mb4", $db_user, $db_pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Gagal koneksi database MySQL cPanel: ' . $e->getMessage()
    ]);
    exit;
}

// Cek token keamanan jika dikonfigurasi
if (!empty($api_secret)) {
    $headers = getallheaders();
    $client_token = $headers['X-API-KEY'] ?? $headers['x-api-key'] ?? '';
    if ($client_token !== $api_secret) {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Unauthorized: Token API tidak valid']);
        exit;
    }
}

// ==========================================
// 3. HANDLER REQUEST
// ==========================================
$action = $_GET['action'] ?? 'ping';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if ($action === 'ping') {
        echo json_encode([
            'success' => true,
            'message' => 'Server cPanel MySQL terkoneksi dengan sukses!',
            'server_time' => date('Y-m-d H:i:s'),
            'database' => $db_name
        ]);
        exit;
    }

    if ($action === 'get_kegiatan') {
        $tgl_mulai = $_GET['tanggalMulai'] ?? null;
        $tgl_selesai = $_GET['tanggalSelesai'] ?? null;
        $pelapor = $_GET['namaPelapor'] ?? null;

        $sql = "SELECT * FROM kegiatan_harian WHERE 1=1";
        $params = [];

        if ($tgl_mulai) {
            $sql .= " AND tanggal >= :tgl_mulai";
            $params['tgl_mulai'] = $tgl_mulai;
        }
        if ($tgl_selesai) {
            $sql .= " AND tanggal <= :tgl_selesai";
            $params['tgl_selesai'] = $tgl_selesai;
        }
        if ($pelapor) {
            $sql .= " AND nama_pelapor = :pelapor";
            $params['pelapor'] = $pelapor;
        }

        $sql .= " ORDER BY tanggal ASC, waktu_mulai ASC LIMIT 500";
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $rows = $stmt->fetchAll();

        // Decode JSON fields
        foreach ($rows as &$r) {
            $r['foto_kegiatan'] = $r['foto_kegiatan'] ? json_decode($r['foto_kegiatan'], true) : [];
            $r['tanda_tangan'] = $r['tanda_tangan'] ? json_decode($r['tanda_tangan'], true) : null;
        }

        echo json_encode(['success' => true, 'records' => $rows]);
        exit;
    }
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $raw = file_get_contents('php://input');
    $data = json_decode($raw, true);

    if (!$data) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Data JSON tidak valid']);
        exit;
    }

    // Aksi: Simpan Kegiatan Batch / Single
    if ($action === 'save_bulk' || isset($data['kegiatan'])) {
        $namaPelapor = $data['namaPelapor'] ?? '';
        $nip = $data['nip'] ?? '';
        $tanggal = $data['tanggal'] ?? date('Y-m-d');
        $tandaTangan = isset($data['tandaTangan']) ? json_encode([['url' => $data['tandaTangan']]]) : null;
        $unitKerja = $data['unitKerja'] ?? 'SEKOLAH RAKYAT TERINTEGRASI 1 KAB. KEDIRI';
        $items = $data['kegiatan'] ?? [];

        $stmt = $pdo->prepare("INSERT INTO kegiatan_harian 
            (id, nama_pelapor, nip, tanggal, waktu_mulai, waktu_selesai, kata_kunci_kegiatan, deskripsi_kegiatan, rhk_kategori, foto_kegiatan, tanda_tangan, unit_kerja)
            VALUES (:id, :nama, :nip, :tanggal, :mulai, :selesai, :kunci, :deskripsi, :rhk, :foto, :ttd, :unit)
            ON DUPLICATE KEY UPDATE 
            deskripsi_kegiatan = VALUES(deskripsi_kegiatan),
            rhk_kategori = VALUES(rhk_kategori),
            foto_kegiatan = VALUES(foto_kegiatan)");

        $savedCount = 0;
        foreach ($items as $it) {
            $id = $it['id'] ?? uniqid('keg_', true);
            $fotoJson = !empty($it['fotoKegiatan']) ? json_encode(array_map(function($u) { return ['url' => $u]; }, $it['fotoKegiatan'])) : json_encode([]);

            $stmt->execute([
                ':id' => $id,
                ':nama' => $namaPelapor,
                ':nip' => $nip,
                ':tanggal' => $tanggal,
                ':mulai' => $it['waktuMulai'] ?? '08:00',
                ':selesai' => $it['waktuSelesai'] ?? '09:00',
                ':kunci' => $it['kataKunciKegiatan'] ?? '',
                ':deskripsi' => $it['deskripsiKegiatan'] ?? '',
                ':rhk' => $it['rhkKategori'] ?? 'RHK 3',
                ':foto' => $fotoJson,
                ':ttd' => $tandaTangan,
                ':unit' => $unitKerja
            ]);
            $savedCount++;
        }

        echo json_encode([
            'success' => true,
            'message' => "$savedCount kegiatan berhasil disimpan ke MySQL cPanel!",
            'count' => $savedCount
        ]);
        exit;
    }

    // Aksi: Sync Full (Batch Import)
    if ($action === 'sync_all' && isset($data['records'])) {
        $stmt = $pdo->prepare("INSERT INTO kegiatan_harian 
            (id, nama_pelapor, nip, tanggal, waktu_mulai, waktu_selesai, kata_kunci_kegiatan, deskripsi_kegiatan, rhk_kategori, unit_kerja)
            VALUES (:id, :nama, :nip, :tanggal, :mulai, :selesai, :kunci, :deskripsi, :rhk, :unit)
            ON DUPLICATE KEY UPDATE 
            deskripsi_kegiatan = VALUES(deskripsi_kegiatan),
            rhk_kategori = VALUES(rhk_kategori)");

        $count = 0;
        foreach ($data['records'] as $r) {
            $stmt->execute([
                ':id' => $r['id'] ?? uniqid('keg_', true),
                ':nama' => $r['namaPelapor'] ?? '',
                ':nip' => $r['nip'] ?? '',
                ':tanggal' => $r['tanggal'] ?? date('Y-m-d'),
                ':mulai' => $r['waktuMulai'] ?? '',
                ':selesai' => $r['waktuSelesai'] ?? '',
                ':kunci' => $r['kataKunciKegiatan'] ?? '',
                ':deskripsi' => $r['deskripsiKegiatan'] ?? '',
                ':rhk' => $r['rhkKategori'] ?? 'RHK 3',
                ':unit' => $r['unitKerja'] ?? 'SEKOLAH RAKYAT TERINTEGRASI 1 KAB. KEDIRI'
            ]);
            $count++;
        }

        echo json_encode([
            'success' => true,
            'message' => "Sinkronisasi berhasil: $count rekaman diperbarui di cPanel!",
            'count' => $count
        ]);
        exit;
    }
    // Aksi: Hapus Kegiatan
    if ($action === 'delete_kegiatan') {
        $delId = $data['id'] ?? ($_GET['id'] ?? '');
        if ($delId) {
            $stmt = $pdo->prepare("DELETE FROM kegiatan_harian WHERE id = :id");
            $stmt->execute([':id' => $delId]);
            echo json_encode([
                'success' => true,
                'message' => "Kegiatan berhasil dihapus dari cPanel MySQL!",
                'id' => $delId
            ]);
            exit;
        }
    }
}

echo json_encode(['success' => false, 'message' => 'Action tidak dikenali']);
`;

export const DEFAULT_CPANEL_URL = 'https://game.gabutgame.my.id/skp/api_kegiatan.php';

export default function CpanelModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [apiUrl, setApiUrl] = useState(() => localStorage.getItem('cpanel_api_url') || DEFAULT_CPANEL_URL);
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('cpanel_api_key') || '');
  const [autoSync, setAutoSync] = useState(() => localStorage.getItem('cpanel_auto_sync') !== 'false');
  const [testing, setTesting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<string | null>(null);

  const handleSaveConfig = () => {
    localStorage.setItem('cpanel_api_url', apiUrl.trim());
    localStorage.setItem('cpanel_api_key', apiKey.trim());
    localStorage.setItem('cpanel_auto_sync', String(autoSync));
    toast.success('Konfigurasi cPanel berhasil disimpan di browser!');
  };

  const handleDownloadSchema = () => {
    const blob = new Blob([SCHEMA_SQL], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'schema_cpanel_srt_kediri.sql';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('File schema_cpanel_srt_kediri.sql berhasil diunduh!');
  };

  const handleDownloadPhpApi = () => {
    const blob = new Blob([PHP_API_CODE], { type: 'application/x-httpd-php;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'api_kegiatan.php';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('File api_kegiatan.php berhasil diunduh!');
  };

  const handleExportDataSql = async () => {
    try {
      toast.info('Menyiapkan data ekspor SQL...');
      const { records: kegList } = await getKegiatan({});
      const { records: riwList } = await getRiwayat({});

      let sqlDump = `-- ========================================================\n`;
      sqlDump += `-- DATA DUMP KEGIATAN & RIWAYAT SRT 1 KABUPATEN KEDIRI\n`;
      sqlDump += `-- Dibuat pada: ${new Date().toLocaleString('id-ID')}\n`;
      sqlDump += `-- ========================================================\n\n`;

      if (kegList.length > 0) {
        sqlDump += `-- Data Kegiatan Harian (${kegList.length} baris)\n`;
        sqlDump += `INSERT INTO \`kegiatan_harian\` (\`id\`, \`nama_pelapor\`, \`nip\`, \`tanggal\`, \`waktu_mulai\`, \`waktu_selesai\`, \`kata_kunci_kegiatan\`, \`deskripsi_kegiatan\`, \`rhk_kategori\`, \`unit_kerja\`)\nVALUES\n`;
        const values = kegList.map(k => {
          const esc = (s: string = '') => `'${s.replace(/'/g, "''")}'`;
          return `(${esc(k.id)}, ${esc(k.namaPelapor)}, ${esc(k.nip)}, ${esc(k.tanggal)}, ${esc(k.waktuMulai)}, ${esc(k.waktuSelesai)}, ${esc(k.kataKunciKegiatan)}, ${esc(k.deskripsiKegiatan)}, ${esc(k.rhkKategori)}, ${esc(k.unitKerja)})`;
        });
        sqlDump += values.join(',\n') + `\nON DUPLICATE KEY UPDATE deskripsi_kegiatan=VALUES(deskripsi_kegiatan), rhk_kategori=VALUES(rhk_kategori);\n\n`;
      }

      if (riwList.length > 0) {
        sqlDump += `-- Data Riwayat File (${riwList.length} baris)\n`;
        sqlDump += `INSERT INTO \`riwayat_file\` (\`id\`, \`nama_file\`, \`jenis_laporan\`, \`nama_pelapor\`, \`tanggal_mulai\`, \`tanggal_selesai\`, \`rhk_nomor\`)\nVALUES\n`;
        const riwValues = riwList.map(r => {
          const esc = (s: string = '') => `'${s.replace(/'/g, "''")}'`;
          return `(${esc(r.id)}, ${esc(r.namaFile)}, ${esc(r.jenisLaporan)}, ${esc(r.namaPelapor)}, ${esc(r.tanggalMulai)}, ${esc(r.tanggalSelesai)}, ${esc(r.rhkNomor)})`;
        });
        sqlDump += riwValues.join(',\n') + `;\n\n`;
      }

      const blob = new Blob([sqlDump], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `data_kegiatan_srt_kediri_${new Date().toISOString().split('T')[0]}.sql`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('File dump SQL berhasil diekspor dan diunduh!');
    } catch (err: any) {
      toast.error('Gagal mengekspor data SQL: ' + (err?.message || 'Error'));
    }
  };

  const handleTestConnection = async () => {
    if (!apiUrl.trim()) {
      return toast.error('Harap masukkan URL API cPanel Anda terlebih dahulu');
    }
    setTesting(true);
    setConnectionStatus(null);
    try {
      const targetUrl = apiUrl.trim().includes('?')
        ? `${apiUrl.trim()}&action=ping`
        : `${apiUrl.trim()}?action=ping`;

      const headers: Record<string, string> = {};
      if (apiKey.trim()) {
        headers['X-API-KEY'] = apiKey.trim();
      }

      const res = await fetch(targetUrl, {
        method: 'GET',
        headers,
      });

      if (!res.ok) {
        throw new Error(`HTTP Error ${res.status}: ${res.statusText}`);
      }

      const data = await res.json();
      if (data.success) {
        setConnectionStatus(`Terkoneksi ke cPanel! Database: ${data.database || 'OK'} (${data.server_time || ''})`);
        toast.success('Koneksi ke API cPanel Berhasil!');
      } else {
        setConnectionStatus(`Koneksi ditolak: ${data.message || 'Error'}`);
        toast.error('Gagal: ' + (data.message || 'Error'));
      }
    } catch (err: any) {
      setConnectionStatus(`Koneksi gagal: ${err.message}. Pastikan URL benar, file api_kegiatan.php sudah diupload, dan CORS diizinkan.`);
      toast.error('Gagal menghubungkan ke cPanel');
    } finally {
      setTesting(false);
    }
  };

  const handleSyncAllToCpanel = async () => {
    if (!apiUrl.trim()) {
      return toast.error('Harap masukkan URL API cPanel Anda terlebih dahulu');
    }
    setSyncing(true);
    try {
      const { records } = await getKegiatan({});
      if (records.length === 0) {
        toast.info('Belum ada data kegiatan untuk disinkronkan');
        setSyncing(false);
        return;
      }

      const targetUrl = apiUrl.trim().includes('?')
        ? `${apiUrl.trim()}&action=sync_all`
        : `${apiUrl.trim()}?action=sync_all`;

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (apiKey.trim()) {
        headers['X-API-KEY'] = apiKey.trim();
      }

      const res = await fetch(targetUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({ records }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(`Berhasil menyinkronkan ${records.length} data kegiatan ke cPanel MySQL!`);
      } else {
        toast.error(`Gagal sinkronisasi: ${data.message}`);
      }
    } catch (err: any) {
      toast.error('Gagal mengirim data ke cPanel: ' + err.message);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 text-primary">
            <Database className="w-6 h-6" />
            <DialogTitle className="text-xl">Integrasi Database cPanel (MySQL)</DialogTitle>
          </div>
          <DialogDescription>
            Panduan persiapan, skrip SQL database, file API PHP, dan sinkronisasi otomatis ke hosting cPanel Anda.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="guide" className="w-full mt-2">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="guide">1. Panduan Persiapan</TabsTrigger>
            <TabsTrigger value="files">2. Skrip & Ekspor Data</TabsTrigger>
            <TabsTrigger value="sync">3. Sinkronisasi Live</TabsTrigger>
          </TabsList>

          {/* TAB 1: PANDUAN */}
          <TabsContent value="guide" className="space-y-4 pt-3">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-amber-900 text-xs flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong>Penting tentang Keamanan cPanel:</strong> Mayoritas shared hosting cPanel memblokir port MySQL eksternal (port 3306) untuk mencegah serangan hacker. Oleh karena itu, cara paling standar dan anti-gagal adalah membuat satu file API PHP di folder <code>public_html/api/</code> yang menghubungkan aplikasi web ke MySQL cPanel secara lokal (<code>localhost</code>).
              </div>
            </div>

            <div className="space-y-3 text-sm">
              <div className="border rounded-lg p-3 space-y-1">
                <div className="flex items-center gap-2 font-semibold text-primary">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <span>Langkah 1: Buat Database & User MySQL di cPanel</span>
                </div>
                <p className="text-muted-foreground text-xs pl-6">
                  Masuk ke cPanel &gt; menu <strong>MySQL Databases</strong> (atau <strong>MySQL Database Wizard</strong>). Buat database baru (misal: <code>usercpanel_srtkediri</code>), lalu buat user baru (misal: <code>usercpanel_dbuser</code>) dan beri password yang kuat. Pastikan pilih <strong>ALL PRIVILEGES</strong> saat menambahkan user ke database.
                </p>
              </div>

              <div className="border rounded-lg p-3 space-y-1">
                <div className="flex items-center gap-2 font-semibold text-primary">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <span>Langkah 2: Import Struktur Tabel di phpMyAdmin</span>
                </div>
                <p className="text-muted-foreground text-xs pl-6">
                  Buka menu <strong>phpMyAdmin</strong> di cPanel, klik nama database Anda di sisi kiri, buka tab <strong>Import</strong>, lalu upload file <code>schema_cpanel_srt_kediri.sql</code> yang dapat diunduh di tab &quot;Skrip & Ekspor Data&quot;.
                </p>
              </div>

              <div className="border rounded-lg p-3 space-y-1">
                <div className="flex items-center gap-2 font-semibold text-primary">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <span>Langkah 3: Upload File API PHP ke File Manager cPanel</span>
                </div>
                <p className="text-muted-foreground text-xs pl-6">
                  Di cPanel &gt; <strong>File Manager</strong>, masuk ke folder <code>public_html/</code>, buat folder baru bernama <code>api</code>, dan upload file <code>api_kegiatan.php</code>. Buka file tersebut dan sesuaikan 3 baris: <code>$db_name</code>, <code>$db_user</code>, dan <code>$db_pass</code>.
                </p>
              </div>

              <div className="border rounded-lg p-3 space-y-1">
                <div className="flex items-center gap-2 font-semibold text-primary">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <span>Langkah 4: Masukkan URL API di Aplikasi Ini</span>
                </div>
                <p className="text-muted-foreground text-xs pl-6">
                  Masuk ke tab &quot;Sinkronisasi Live&quot;, masukkan URL endpoint Anda (misal: <code>https://domain-anda.com/api/api_kegiatan.php</code>), lalu klik <strong>Uji Koneksi</strong>.
                </p>
              </div>
            </div>
          </TabsContent>

          {/* TAB 2: FILES & EKSPOR */}
          <TabsContent value="files" className="space-y-4 pt-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="border rounded-xl p-4 bg-muted/20 space-y-3">
                <div className="flex items-center gap-2">
                  <Database className="w-5 h-5 text-primary" />
                  <div>
                    <h4 className="font-semibold text-sm">1. Struktur Tabel SQL</h4>
                    <p className="text-xs text-muted-foreground">Tabel kegiatan_harian, laporan_rhk, riwayat_file</p>
                  </div>
                </div>
                <Button onClick={handleDownloadSchema} variant="outline" className="w-full gap-2 text-xs">
                  <Download className="w-4 h-4" />
                  Download schema_cpanel.sql
                </Button>
              </div>

              <div className="border rounded-xl p-4 bg-muted/20 space-y-3">
                <div className="flex items-center gap-2">
                  <FileCode className="w-5 h-5 text-orange-600" />
                  <div>
                    <h4 className="font-semibold text-sm">2. Script Backend PHP</h4>
                    <p className="text-xs text-muted-foreground">Jembatan API siap pakai untuk cPanel MySQL</p>
                  </div>
                </div>
                <Button onClick={handleDownloadPhpApi} variant="outline" className="w-full gap-2 text-xs">
                  <Download className="w-4 h-4" />
                  Download api_kegiatan.php
                </Button>
              </div>
            </div>

            <div className="border-t pt-4 space-y-3">
              <div>
                <h4 className="font-semibold text-sm flex items-center gap-2">
                  <Download className="w-4 h-4 text-primary" />
                  3. Ekspor Seluruh Data Saat Ini ke File SQL
                </h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Ingin memindahkan seluruh data kinerja yang sudah tersimpan di aplikasi ini ke phpMyAdmin cPanel? Unduh dump SQL lengkap di bawah:
                </p>
              </div>
              <Button onClick={handleExportDataSql} className="gap-2">
                <Database className="w-4 h-4" />
                Ekspor Semua Data ke .SQL (phpMyAdmin)
              </Button>
            </div>
          </TabsContent>

          {/* TAB 3: LIVE SYNC */}
          <TabsContent value="sync" className="space-y-4 pt-3">
            <div className="space-y-3 border rounded-xl p-4 bg-card">
              <div className="space-y-1">
                <Label htmlFor="api_url" className="text-xs font-semibold flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-primary" />
                  URL API cPanel Anda
                </Label>
                <Input
                  id="api_url"
                  placeholder="https://domain-anda.com/api/api_kegiatan.php"
                  value={apiUrl}
                  onChange={e => setApiUrl(e.target.value)}
                  className="text-xs font-mono"
                />
                <p className="text-[11px] text-muted-foreground">
                  Alamat file <code>api_kegiatan.php</code> yang sudah Anda letakkan di hosting cPanel.
                </p>
              </div>

              <div className="space-y-1">
                <Label htmlFor="api_key" className="text-xs font-semibold flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-primary" />
                  API Secret Key (Opsional)
                </Label>
                <Input
                  id="api_key"
                  type="password"
                  placeholder="Opsional jika Anda menyetel $api_secret di PHP"
                  value={apiKey}
                  onChange={e => setApiKey(e.target.value)}
                  className="text-xs font-mono"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="auto_sync"
                  checked={autoSync}
                  onChange={e => setAutoSync(e.target.checked)}
                  className="rounded border-gray-300 text-primary focus:ring-primary"
                />
                <Label htmlFor="auto_sync" className="text-xs cursor-pointer font-medium">
                  Kirim salinan otomatis ke cPanel saat menyimpan kegiatan baru
                </Label>
              </div>

              <div className="flex flex-wrap gap-2 pt-2 border-t">
                <Button onClick={handleSaveConfig} variant="secondary" size="sm" className="text-xs">
                  Simpan Konfigurasi
                </Button>
                <Button
                  onClick={handleTestConnection}
                  disabled={testing}
                  variant="outline"
                  size="sm"
                  className="text-xs gap-1.5"
                >
                  <Server className="w-3.5 h-3.5" />
                  {testing ? 'Menguji...' : 'Uji Koneksi'}
                </Button>
                <Button
                  onClick={handleSyncAllToCpanel}
                  disabled={syncing}
                  size="sm"
                  className="text-xs gap-1.5 ml-auto"
                >
                  <Send className="w-3.5 h-3.5" />
                  {syncing ? 'Mengirim Data...' : 'Kirim Semua Data ke cPanel'}
                </Button>
              </div>

              {connectionStatus && (
                <div className={`p-2.5 rounded text-xs font-mono ${
                  connectionStatus.includes('Terkoneksi')
                    ? 'bg-green-50 text-green-800 border border-green-200'
                    : 'bg-red-50 text-red-800 border border-red-200'
                }`}>
                  {connectionStatus}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
