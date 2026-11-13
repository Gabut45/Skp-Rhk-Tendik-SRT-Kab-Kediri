<?php
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
// FUNGSI PENYIMPANAN FOTO KE FILE MANAGER HOSTING
// ==========================================
function saveBase64ToFile($base64Data, $subfolder = 'uploads') {
    if (empty($base64Data) || !is_string($base64Data)) return $base64Data;
    
    // Jika sudah berupa URL online (http:// atau https://), tidak perlu dikonversi ulang
    if (strpos($base64Data, 'http://') === 0 || strpos($base64Data, 'https://') === 0) {
        return $base64Data;
    }

    // Deteksi apakah format data base64 gambar (menggunakan delimiter # agar bebas escape karakter)
    if (preg_match('#^data:image/([a-zA-Z0-9]+);base64,#', $base64Data, $type)) {
        $data = substr($base64Data, strpos($base64Data, ',') + 1);
        $ext = strtolower($type[1]);
        if ($ext === 'jpeg') $ext = 'jpg';
        if (!in_array($ext, ['jpg', 'jpeg', 'png', 'webp', 'gif'])) {
            $ext = 'jpg';
        }
        $data = base64_decode($data);
        if ($data === false) return $base64Data;
    } else {
        return $base64Data;
    }

    // Buat subfolder rapi berdasarkan tahun dan bulan: uploads/2026/11
    $yearMonth = date('Y/m');
    $targetDir = __DIR__ . '/' . $subfolder . '/' . $yearMonth;
    if (!is_dir($targetDir)) {
        @mkdir($targetDir, 0755, true);
    }

    // Pastikan folder uploads memiliki .htaccess dengan izin CORS lengkap agar browser bisa merender gambar ke PDF tanpa blokir
    $htPath = __DIR__ . '/uploads/.htaccess';
    if (!file_exists($htPath)) {
        $htData = "<IfModule mod_headers.c>\n    Header set Access-Control-Allow-Origin *\n    Header set Access-Control-Allow-Methods GET,OPTIONS\n</IfModule>\n";
        @file_put_contents($htPath, $htData);
    }

    $fileName = 'foto_' . date('Ymd_His') . '_' . bin2hex(random_bytes(4)) . '.' . $ext;
    $filePath = $targetDir . '/' . $fileName;

    if (@file_put_contents($filePath, $data)) {
        // Otomatis bangun URL publik lengkap
        $isHttps = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') || (isset($_SERVER['SERVER_PORT']) && $_SERVER['SERVER_PORT'] == 443);
        $protocol = $isHttps ? 'https://' : 'http://';
        $host = $_SERVER['HTTP_HOST'];
        $rawDir = dirname($_SERVER['SCRIPT_NAME']);
        $cleanDir = str_replace(chr(92), '/', $rawDir);
        $scriptDir = ($cleanDir === '/' || $cleanDir === '.') ? '' : rtrim($cleanDir, '/');
        return $protocol . $host . $scriptDir . '/' . $subfolder . '/' . $yearMonth . '/' . $fileName;
    }

    return $base64Data;
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

    if ($action === 'get_image') {
        $file = $_GET['file'] ?? '';
        if (strpos($file, 'http') === 0) {
            $parsed = parse_url($file, PHP_URL_PATH);
            $file = preg_replace('#^.*?/skp/#', '', $parsed);
        }
        $file = ltrim(str_replace('..', '', $file), '/');
        $fullPath = __DIR__ . '/' . $file;
        if (file_exists($fullPath) && is_file($fullPath)) {
            $ext = strtolower(pathinfo($fullPath, PATHINFO_EXTENSION));
            $mimes = [
                'jpg' => 'image/jpeg',
                'jpeg' => 'image/jpeg',
                'png' => 'image/png',
                'webp' => 'image/webp',
                'gif' => 'image/gif'
            ];
            header('Access-Control-Allow-Origin: *');
            header('Access-Control-Allow-Methods: GET, OPTIONS');
            header('Content-Type: ' . ($mimes[$ext] ?? 'image/jpeg'));
            header('Cache-Control: public, max-age=86400');
            readfile($fullPath);
            exit;
        }
        http_response_code(404);
        echo json_encode(['error' => 'File not found']);
        exit;
    }

    if ($action === 'migrate_photos') {
        $batch = isset($_GET['limit']) ? intval($_GET['limit']) : 30;
        $stmt = $pdo->prepare("SELECT id, foto_kegiatan, tanda_tangan FROM kegiatan_harian 
            WHERE (foto_kegiatan LIKE '%data:image%' OR tanda_tangan LIKE '%data:image%') 
            LIMIT :lim");
        $stmt->bindValue(':lim', $batch, PDO::PARAM_INT);
        $stmt->execute();
        $rows = $stmt->fetchAll();

        $migratedPhotos = 0;
        $migratedRecords = 0;
        $updateStmt = $pdo->prepare("UPDATE kegiatan_harian SET foto_kegiatan = :foto, tanda_tangan = :ttd WHERE id = :id");

        foreach ($rows as $r) {
            $fotos = !empty($r['foto_kegiatan']) ? json_decode($r['foto_kegiatan'], true) : [];
            $changed = false;
            if (is_array($fotos)) {
                foreach ($fotos as &$f) {
                    $u = is_string($f) ? $f : ($f['url'] ?? '');
                    if (strpos($u, 'data:image') === 0) {
                        $newUrl = saveBase64ToFile($u, 'uploads');
                        if ($newUrl !== $u) {
                            $f = is_string($f) ? $newUrl : ['url' => $newUrl];
                            $changed = true;
                            $migratedPhotos++;
                        }
                    }
                }
            }

            $ttds = !empty($r['tanda_tangan']) ? json_decode($r['tanda_tangan'], true) : [];
            if (is_array($ttds)) {
                foreach ($ttds as &$t) {
                    $u = is_string($t) ? $t : ($t['url'] ?? '');
                    if (strpos($u, 'data:image') === 0) {
                        $newTtdUrl = saveBase64ToFile($u, 'uploads/ttd');
                        if ($newTtdUrl !== $u) {
                            $t = is_string($t) ? $newTtdUrl : ['url' => $newTtdUrl];
                            $changed = true;
                        }
                    }
                }
            }

            if ($changed) {
                $updateStmt->execute([
                    ':id' => $r['id'],
                    ':foto' => json_encode($fotos),
                    ':ttd' => !empty($ttds) ? json_encode($ttds) : null,
                ]);
                $migratedRecords++;
            }
        }

        $countStmt = $pdo->query("SELECT COUNT(*) as sisa FROM kegiatan_harian WHERE foto_kegiatan LIKE '%data:image%' OR tanda_tangan LIKE '%data:image%'");
        $remaining = intval($countStmt->fetch()['sisa'] ?? 0);

        echo json_encode([
            'success' => true,
            'message' => "Migrasi batch selesai: $migratedPhotos foto berhasil dipindahkan ke File Manager!",
            'migrated_records' => $migratedRecords,
            'migrated_photos' => $migratedPhotos,
            'remaining_records' => $remaining
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

        $hasUrutan = false;
        try {
            $colCheck = $pdo->query("SHOW COLUMNS FROM kegiatan_harian LIKE 'urutan'")->fetch();
            $hasUrutan = !empty($colCheck);
        } catch (Exception $e) {}

        $sql .= $hasUrutan
            ? " ORDER BY tanggal DESC, COALESCE(urutan, 999999) ASC, id_kegiatan ASC"
            : " ORDER BY tanggal DESC, id_kegiatan ASC";
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $rows = $stmt->fetchAll();

        $is_summary = !empty($_GET['summary']) || !empty($_GET['summaryOnly']);
        // Decode JSON fields
        foreach ($rows as &$r) {
            $fotos = $r['foto_kegiatan'] ? json_decode($r['foto_kegiatan'], true) : [];
            $r['foto_count'] = is_array($fotos) ? count($fotos) : 0;
            if ($is_summary) {
                $r['foto_kegiatan'] = [];
                $r['tanda_tangan'] = null;
            } else {
                $r['foto_kegiatan'] = is_array($fotos) ? $fotos : [];
                $r['tanda_tangan'] = $r['tanda_tangan'] ? json_decode($r['tanda_tangan'], true) : null;
            }
        }

        echo json_encode(['success' => true, 'records' => $rows]);
        exit;
    }

    if ($action === 'get_users') {
        try {
            $stmt = $pdo->query("SELECT id, username, password, role, nama_lengkap as namaLengkap, nip, jabatan, unit_kerja as unitKerja, created_at as createdAt, updated_at as updatedAt FROM pengguna ORDER BY nama_lengkap ASC");
            $rows = $stmt->fetchAll();
            echo json_encode(['success' => true, 'records' => $rows]);
            exit;
        } catch (PDOException $e) {
            // Fallback jika tabel pengguna belum dibuat di phpMyAdmin
            $stmt = $pdo->query("SELECT deskripsi_kegiatan FROM kegiatan_harian WHERE kata_kunci_kegiatan = '__USER_ACCOUNT__' LIMIT 1");
            $row = $stmt->fetch();
            if ($row && !empty($row['deskripsi_kegiatan'])) {
                $decoded = json_decode($row['deskripsi_kegiatan'], true);
                echo json_encode(['success' => true, 'records' => $decoded['accounts'] ?? []]);
                exit;
            }
            echo json_encode(['success' => true, 'records' => []]);
            exit;
        }
    }
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // 0. Handler Upload File Langsung (Multipart FormData / File Manager)
    if (!empty($_FILES['file']) || !empty($_FILES['foto'])) {
        $fileObj = !empty($_FILES['file']) ? $_FILES['file'] : $_FILES['foto'];
        $tmp = $fileObj['tmp_name'] ?? '';
        $origName = $fileObj['name'] ?? 'foto.jpg';
        $ext = strtolower(pathinfo($origName, PATHINFO_EXTENSION));
        if (!in_array($ext, ['jpg', 'jpeg', 'png', 'webp', 'gif'])) $ext = 'jpg';

        $yearMonth = date('Y/m');
        $targetDir = __DIR__ . '/uploads/' . $yearMonth;
        if (!is_dir($targetDir)) @mkdir($targetDir, 0755, true);

        $fileName = 'foto_' . date('Ymd_His') . '_' . bin2hex(random_bytes(4)) . '.' . $ext;
        $filePath = $targetDir . '/' . $fileName;

        if (@move_uploaded_file($tmp, $filePath)) {
            $isHttps = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') || (isset($_SERVER['SERVER_PORT']) && $_SERVER['SERVER_PORT'] == 443);
            $protocol = $isHttps ? 'https://' : 'http://';
            $host = $_SERVER['HTTP_HOST'];
            $rawDir = dirname($_SERVER['SCRIPT_NAME']);
            $cleanDir = str_replace(chr(92), '/', $rawDir);
            $scriptDir = ($cleanDir === '/' || $cleanDir === '.') ? '' : rtrim($cleanDir, '/');
            $fullUrl = $protocol . $host . $scriptDir . '/uploads/' . $yearMonth . '/' . $fileName;
            echo json_encode([
                'success' => true,
                'message' => 'Foto berhasil diunggah ke File Manager cPanel!',
                'url' => $fullUrl
            ]);
            exit;
        }
    }

    $raw = file_get_contents('php://input');
    $data = json_decode($raw, true);

    // Handler Upload Foto via JSON Base64
    if ($action === 'upload_foto' || $action === 'upload') {
        $fotoData = $data['foto'] ?? ($data['image'] ?? ($data['data'] ?? ''));
        $subfolder = !empty($data['subfolder']) ? $data['subfolder'] : 'uploads';
        if (!empty($fotoData)) {
            $savedUrl = saveBase64ToFile($fotoData, $subfolder);
            echo json_encode([
                'success' => true,
                'message' => 'Foto berhasil disimpan ke File Manager hosting!',
                'url' => $savedUrl
            ]);
            exit;
        }
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Data foto kosong']);
        exit;
    }

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
        $unitKerja = $data['unitKerja'] ?? 'SEKOLAH RAKYAT TERINTEGRASI 1 KAB. KEDIRI';
        $items = $data['kegiatan'] ?? [];

        // Simpan Tanda Tangan ke file di folder uploads/ttd/ jika format base64
        $processedTtd = null;
        if (!empty($data['tandaTangan'])) {
            $ttdUrl = saveBase64ToFile($data['tandaTangan'], 'uploads/ttd');
            $processedTtd = json_encode([['url' => $ttdUrl]]);
        }

        try {
            $colCheck = $pdo->query("SHOW COLUMNS FROM kegiatan_harian LIKE 'urutan'")->fetch();
            if (empty($colCheck)) {
                $pdo->exec("ALTER TABLE kegiatan_harian ADD COLUMN urutan INT NULL DEFAULT NULL");
            }
        } catch (Exception $e) {}

        $hasUrutan = false;
        try {
            $colCheck = $pdo->query("SHOW COLUMNS FROM kegiatan_harian LIKE 'urutan'")->fetch();
            $hasUrutan = !empty($colCheck);
        } catch (Exception $e) {}

        if ($hasUrutan) {
            $stmt = $pdo->prepare("INSERT INTO kegiatan_harian 
                (id, nama_pelapor, nip, tanggal, waktu_mulai, waktu_selesai, kata_kunci_kegiatan, deskripsi_kegiatan, rhk_kategori, foto_kegiatan, tanda_tangan, unit_kerja, urutan)
                VALUES (:id, :nama, :nip, :tanggal, :mulai, :selesai, :kunci, :deskripsi, :rhk, :foto, :ttd, :unit, :urutan)
                ON DUPLICATE KEY UPDATE 
                waktu_mulai = VALUES(waktu_mulai),
                waktu_selesai = VALUES(waktu_selesai),
                kata_kunci_kegiatan = VALUES(kata_kunci_kegiatan),
                deskripsi_kegiatan = VALUES(deskripsi_kegiatan),
                rhk_kategori = VALUES(rhk_kategori),
                foto_kegiatan = VALUES(foto_kegiatan),
                urutan = VALUES(urutan)");
        } else {
            $stmt = $pdo->prepare("INSERT INTO kegiatan_harian 
                (id, nama_pelapor, nip, tanggal, waktu_mulai, waktu_selesai, kata_kunci_kegiatan, deskripsi_kegiatan, rhk_kategori, foto_kegiatan, tanda_tangan, unit_kerja)
                VALUES (:id, :nama, :nip, :tanggal, :mulai, :selesai, :kunci, :deskripsi, :rhk, :foto, :ttd, :unit)
                ON DUPLICATE KEY UPDATE 
                waktu_mulai = VALUES(waktu_mulai),
                waktu_selesai = VALUES(waktu_selesai),
                kata_kunci_kegiatan = VALUES(kata_kunci_kegiatan),
                deskripsi_kegiatan = VALUES(deskripsi_kegiatan),
                rhk_kategori = VALUES(rhk_kategori),
                foto_kegiatan = VALUES(foto_kegiatan)");
        }

        $savedCount = 0;
        foreach ($items as $idx => $it) {
            $id = $it['id'] ?? uniqid('keg_', true);
            $processedPhotos = [];
            if (!empty($it['fotoKegiatan']) && is_array($it['fotoKegiatan'])) {
                foreach ($it['fotoKegiatan'] as $photo) {
                    $u = is_string($photo) ? $photo : ($photo['url'] ?? '');
                    if (!empty($u)) {
                        $savedUrl = saveBase64ToFile($u, 'uploads');
                        $processedPhotos[] = ['url' => $savedUrl];
                    }
                }
            }
            $fotoJson = json_encode($processedPhotos);

            $execParams = [
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
                ':ttd' => $processedTtd,
                ':unit' => $unitKerja
            ];
            if ($hasUrutan) {
                $execParams[':urutan'] = isset($it['urutan']) ? intval($it['urutan']) : $idx;
            }
            $stmt->execute($execParams);
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
    // Helper: Hapus berkas fisik di File Manager cPanel berdasarkan URL/path di folder uploads/
    function deletePhysicalFileByUrl($fileUrl) {
        if (!$fileUrl || !is_string($fileUrl)) return;
        $trimmed = trim($fileUrl);
        if (!$trimmed || strpos($trimmed, 'data:') === 0) return;
        $parsedPath = parse_url($trimmed, PHP_URL_PATH);
        if (!$parsedPath) $parsedPath = $trimmed;
        $pos = strpos($parsedPath, '/uploads/');
        if ($pos !== false) {
            $rel = substr($parsedPath, $pos + 1); // uploads/...
        } elseif (strpos($parsedPath, 'uploads/') === 0) {
            $rel = $parsedPath;
        } else {
            return;
        }
        if (strpos($rel, '..') !== false) return;
        $fullPath = __DIR__ . '/' . $rel;
        if (is_file($fullPath)) {
            @unlink($fullPath);
        }
    }

    function deletePhotosFromColumn($fotoCol) {
        if (!$fotoCol) return;
        $decoded = json_decode($fotoCol, true);
        if (is_array($decoded)) {
            foreach ($decoded as $u) {
                $url = is_string($u) ? $u : ($u['url'] ?? '');
                deletePhysicalFileByUrl($url);
            }
        } elseif (is_string($fotoCol)) {
            deletePhysicalFileByUrl($fotoCol);
        }
    }

    // Aksi: Hapus Kegiatan (Permanen Selamanya + Hapus File Fisik)
    if ($action === 'delete_kegiatan') {
        $delId = $data['id'] ?? ($_GET['id'] ?? '');
        $delNum = $data['id_numeric'] ?? null;
        $delIds = $data['ids'] ?? [];
        $tgl = $data['tanggal'] ?? ($_GET['tanggal'] ?? null);
        $tglMulai = $data['tanggalMulai'] ?? ($data['tanggal_mulai'] ?? null);
        $tglSelesai = $data['tanggalSelesai'] ?? ($data['tanggal_selesai'] ?? null);
        $waktuMulai = $data['waktu_mulai'] ?? ($data['waktuMulai'] ?? null);
        $pelapor = $data['namaPelapor'] ?? ($data['nama_pelapor'] ?? ($_GET['namaPelapor'] ?? null));
        $deleteAll = !empty($data['delete_all']) || !empty($data['deleteAll']);

        if ($deleteAll) {
            $q = $pdo->query("SELECT foto_kegiatan FROM kegiatan_harian WHERE kata_kunci_kegiatan != '__PRESET_TTD__'");
            while ($r = $q->fetch(PDO::FETCH_ASSOC)) deletePhotosFromColumn($r['foto_kegiatan'] ?? '');
            $pdo->exec("DELETE FROM kegiatan_harian WHERE kata_kunci_kegiatan != '__PRESET_TTD__'");
        }
        if (!empty($delIds) && is_array($delIds)) {
            $inClause = implode(',', array_fill(0, count($delIds), '?'));
            $sel = $pdo->prepare("SELECT foto_kegiatan FROM kegiatan_harian WHERE id IN ($inClause)");
            $sel->execute($delIds);
            while ($r = $sel->fetch(PDO::FETCH_ASSOC)) deletePhotosFromColumn($r['foto_kegiatan'] ?? '');
            $stmt = $pdo->prepare("DELETE FROM kegiatan_harian WHERE id IN ($inClause)");
            $stmt->execute($delIds);
        }
        if ($delId) {
            $numVal = $delNum ?? (is_numeric($delId) ? $delId : 0);
            $sel = $pdo->prepare("SELECT foto_kegiatan FROM kegiatan_harian WHERE id = :id OR id_kegiatan = :num");
            $sel->execute([':id' => $delId, ':num' => $numVal]);
            while ($r = $sel->fetch(PDO::FETCH_ASSOC)) deletePhotosFromColumn($r['foto_kegiatan'] ?? '');
            $stmt = $pdo->prepare("DELETE FROM kegiatan_harian WHERE id = :id OR id_kegiatan = :num");
            $stmt->execute([':id' => $delId, ':num' => $numVal]);
        }
        if ($waktuMulai && $tgl && $pelapor) {
            $sel = $pdo->prepare("SELECT foto_kegiatan FROM kegiatan_harian WHERE tanggal = :tgl AND nama_pelapor = :pelapor AND (waktu_mulai = :wm OR waktu_mulai LIKE :wmp)");
            $sel->execute([':tgl' => $tgl, ':pelapor' => $pelapor, ':wm' => $waktuMulai, ':wmp' => "$waktuMulai%"]);
            while ($r = $sel->fetch(PDO::FETCH_ASSOC)) deletePhotosFromColumn($r['foto_kegiatan'] ?? '');
            $stmt = $pdo->prepare("DELETE FROM kegiatan_harian WHERE tanggal = :tgl AND nama_pelapor = :pelapor AND (waktu_mulai = :wm OR waktu_mulai LIKE :wmp)");
            $stmt->execute([':tgl' => $tgl, ':pelapor' => $pelapor, ':wm' => $waktuMulai, ':wmp' => "$waktuMulai%"]);
        } elseif ($tgl && $pelapor && empty($delId)) {
            $sel = $pdo->prepare("SELECT foto_kegiatan FROM kegiatan_harian WHERE tanggal = :tgl AND nama_pelapor = :pelapor");
            $sel->execute([':tgl' => $tgl, ':pelapor' => $pelapor]);
            while ($r = $sel->fetch(PDO::FETCH_ASSOC)) deletePhotosFromColumn($r['foto_kegiatan'] ?? '');
            $stmt = $pdo->prepare("DELETE FROM kegiatan_harian WHERE tanggal = :tgl AND nama_pelapor = :pelapor");
            $stmt->execute([':tgl' => $tgl, ':pelapor' => $pelapor]);
        }
        if ($tglMulai && $tglSelesai && $pelapor && empty($delId)) {
            $sel = $pdo->prepare("SELECT foto_kegiatan FROM kegiatan_harian WHERE tanggal >= :tm AND tanggal <= :ts AND nama_pelapor = :pelapor");
            $sel->execute([':tm' => $tglMulai, ':ts' => $tglSelesai, ':pelapor' => $pelapor]);
            while ($r = $sel->fetch(PDO::FETCH_ASSOC)) deletePhotosFromColumn($r['foto_kegiatan'] ?? '');
            $stmt = $pdo->prepare("DELETE FROM kegiatan_harian WHERE tanggal >= :tm AND tanggal <= :ts AND nama_pelapor = :pelapor");
            $stmt->execute([':tm' => $tglMulai, ':ts' => $tglSelesai, ':pelapor' => $pelapor]);
        }
        echo json_encode([
            'success' => true,
            'message' => 'Kegiatan berhasil dihapus secara permanen dari cPanel MySQL!'
        ]);
        exit;
    }

    // Aksi: Hapus Riwayat File (Permanen Selamanya)
    if ($action === 'delete_riwayat') {
        $delId = $data['id'] ?? ($_GET['id'] ?? '');
        $delIds = $data['ids'] ?? [];
        $tgl = $data['tanggal'] ?? ($_GET['tanggal'] ?? null);
        $tglMulai = $data['tanggalMulai'] ?? ($data['tanggal_mulai'] ?? null);
        $tglSelesai = $data['tanggalSelesai'] ?? ($data['tanggal_selesai'] ?? null);
        $pelapor = $data['namaPelapor'] ?? ($data['nama_pelapor'] ?? ($_GET['namaPelapor'] ?? null));
        $deleteAll = !empty($data['delete_all']) || !empty($data['deleteAll']);

        if ($deleteAll) {
            $q = $pdo->query("SELECT file_url FROM riwayat_file");
            while ($r = $q->fetch(PDO::FETCH_ASSOC)) deletePhysicalFileByUrl($r['file_url'] ?? '');
            $pdo->exec("DELETE FROM riwayat_file");
        }
        if (!empty($delIds) && is_array($delIds)) {
            $inClause = implode(',', array_fill(0, count($delIds), '?'));
            $sel = $pdo->prepare("SELECT file_url FROM riwayat_file WHERE id IN ($inClause)");
            $sel->execute($delIds);
            while ($r = $sel->fetch(PDO::FETCH_ASSOC)) deletePhysicalFileByUrl($r['file_url'] ?? '');
            $stmt = $pdo->prepare("DELETE FROM riwayat_file WHERE id IN ($inClause)");
            $stmt->execute($delIds);
        }
        if ($delId) {
            $sel = $pdo->prepare("SELECT file_url FROM riwayat_file WHERE id = :id");
            $sel->execute([':id' => $delId]);
            while ($r = $sel->fetch(PDO::FETCH_ASSOC)) deletePhysicalFileByUrl($r['file_url'] ?? '');
            $stmt = $pdo->prepare("DELETE FROM riwayat_file WHERE id = :id");
            $stmt->execute([':id' => $delId]);
        }
        if ($tgl && $pelapor) {
            $sel = $pdo->prepare("SELECT file_url FROM riwayat_file WHERE (tanggal_mulai = :tgl OR tanggal_selesai = :tgl) AND nama_pelapor = :pelapor");
            $sel->execute([':tgl' => $tgl, ':pelapor' => $pelapor]);
            while ($r = $sel->fetch(PDO::FETCH_ASSOC)) deletePhysicalFileByUrl($r['file_url'] ?? '');
            $stmt = $pdo->prepare("DELETE FROM riwayat_file WHERE (tanggal_mulai = :tgl OR tanggal_selesai = :tgl) AND nama_pelapor = :pelapor");
            $stmt->execute([':tgl' => $tgl, ':pelapor' => $pelapor]);
        }
        if ($tglMulai && $tglSelesai && $pelapor) {
            $sel = $pdo->prepare("SELECT file_url FROM riwayat_file WHERE tanggal_mulai >= :tm AND tanggal_selesai <= :ts AND nama_pelapor = :pelapor");
            $sel->execute([':tm' => $tglMulai, ':ts' => $tglSelesai, ':pelapor' => $pelapor]);
            while ($r = $sel->fetch(PDO::FETCH_ASSOC)) deletePhysicalFileByUrl($r['file_url'] ?? '');
            $stmt = $pdo->prepare("DELETE FROM riwayat_file WHERE tanggal_mulai >= :tm AND tanggal_selesai <= :ts AND nama_pelapor = :pelapor");
            $stmt->execute([':tm' => $tglMulai, ':ts' => $tglSelesai, ':pelapor' => $pelapor]);
        }
        echo json_encode([
            'success' => true,
            'message' => 'Riwayat file berhasil dihapus secara permanen dari cPanel MySQL!'
        ]);
        exit;
    }

    // Aksi: Simpan Akun Pengguna (Wali Asuh / Super Admin)
    if ($action === 'save_user') {
        $acc = $data['user'] ?? $data;
        $id = $acc['id'] ?? uniqid('usr_', true);
        $username = $acc['username'] ?? '';
        $password = $acc['password'] ?? '';
        $role = $acc['role'] ?? 'wali_asuh';
        $nama = $acc['namaLengkap'] ?? ($acc['nama_lengkap'] ?? '');
        $nip = $acc['nip'] ?? '';
        $jabatan = $acc['jabatan'] ?? 'Wali Asuh';
        $unit = $acc['unitKerja'] ?? ($acc['unit_kerja'] ?? 'SEKOLAH RAKYAT TERINTEGRASI 1 KAB. KEDIRI');

        try {
            $stmt = $pdo->prepare("INSERT INTO pengguna (id, username, password, role, nama_lengkap, nip, jabatan, unit_kerja)
                VALUES (:id, :username, :password, :role, :nama, :nip, :jabatan, :unit)
                ON DUPLICATE KEY UPDATE
                password = VALUES(password),
                role = VALUES(role),
                nama_lengkap = VALUES(nama_lengkap),
                nip = VALUES(nip),
                jabatan = VALUES(jabatan),
                unit_kerja = VALUES(unit_kerja)");
            $stmt->execute([
                ':id' => $id,
                ':username' => $username,
                ':password' => $password,
                ':role' => $role,
                ':nama' => $nama,
                ':nip' => $nip,
                ':jabatan' => $jabatan,
                ':unit' => $unit
            ]);
        } catch (PDOException $e) {}

        echo json_encode(['success' => true, 'message' => 'Akun pengguna berhasil disimpan ke cPanel MySQL!']);
        exit;
    }

    // Aksi: Hapus Akun Pengguna
    if ($action === 'delete_user') {
        $delId = $data['id'] ?? ($_GET['id'] ?? '');
        $delUsername = $data['username'] ?? ($_GET['username'] ?? '');
        try {
            $stmt = $pdo->prepare("DELETE FROM pengguna WHERE id = :id OR username = :username");
            $stmt->execute([':id' => $delId, ':username' => $delUsername]);
        } catch (PDOException $e) {}

        echo json_encode(['success' => true, 'message' => 'Akun pengguna berhasil dihapus dari cPanel MySQL!']);
        exit;
    }
}

echo json_encode(['success' => false, 'message' => 'Action tidak dikenali']);
