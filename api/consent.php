<?php
/*
 * SPOTTER — registro dei consensi cookie
 *
 * POST /api/consent.php  (JSON inviato da assets/js/consent.js)
 *   { "id": uuid, "version": "AAAA-MM-GG", "choice": "accept_all|reject_all|custom|close",
 *     "marketing": bool, "page": "/percorso" }
 *
 * Ogni scelta diventa una riga JSON in storage/consent/consent-AAAA-MM-GG.jsonl
 * (o nella cartella indicata da GS_CONSENT_DIR, meglio se fuori dalla root web).
 * Si salvano solo: data UTC, ID casuale del consenso, versione, scelta, pagina,
 * IP troncato (IPv4 /24, IPv6 /48) e browser (user agent, max 300 caratteri).
 * I file più vecchi di 180 giorni vengono cancellati automaticamente, al più una
 * volta al giorno; da riga di comando: php api/consent.php --purge
 *
 * Variabili d'ambiente facoltative:
 *   GS_CONSENT_DIR      cartella del registro
 *   GS_CLIENT_IP_HEADER header con l'IP reale dietro proxy fidato, es. CF-Connecting-IP
 *                       (usarlo solo se il sito è raggiungibile esclusivamente dal proxy)
 */
declare(strict_types=1);

const RETENTION_DAYS = 180;
const MAX_BODY_BYTES = 2048;
const MAX_DAILY_BYTES = 20 * 1024 * 1024;
const CHOICES = ['accept_all', 'reject_all', 'custom', 'close'];

function consent_dir(): string
{
    $dir = getenv('GS_CONSENT_DIR') ?: dirname(__DIR__) . '/storage/consent';
    if (!is_dir($dir) && !mkdir($dir, 0700, true) && !is_dir($dir)) {
        throw new RuntimeException('cartella registro non disponibile');
    }
    return rtrim($dir, '/');
}

function purge(string $dir, bool $force = false): int
{
    $today = gmdate('Y-m-d');
    $marker = $dir . '/.last-purge';
    $fh = fopen($marker, 'c+');
    if ($fh === false) {
        return 0;
    }
    $removed = 0;
    if (flock($fh, LOCK_EX | LOCK_NB)) {
        $last = trim((string) stream_get_contents($fh));
        if ($force || $last !== $today) {
            $limit = gmdate('Y-m-d', time() - RETENTION_DAYS * 86400);
            foreach (glob($dir . '/consent-*.jsonl') ?: [] as $file) {
                if (preg_match('/consent-(\d{4}-\d{2}-\d{2})\.jsonl$/', $file, $m) && $m[1] < $limit && @unlink($file)) {
                    $removed++;
                }
            }
            ftruncate($fh, 0);
            rewind($fh);
            fwrite($fh, $today);
        }
        flock($fh, LOCK_UN);
    }
    fclose($fh);
    return $removed;
}

function anonymize_ip(string $ip): string
{
    if (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_IPV4)) {
        return preg_replace('/\.\d+$/', '.0', $ip);
    }
    if (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_IPV6)) {
        $bin = inet_pton($ip);
        return inet_ntop(substr($bin, 0, 6) . str_repeat("\0", 10)) ?: '';
    }
    return '';
}

function client_ip(): string
{
    $header = getenv('GS_CLIENT_IP_HEADER');
    if ($header) {
        $key = 'HTTP_' . strtoupper(str_replace('-', '_', $header));
        $value = trim(explode(',', (string) ($_SERVER[$key] ?? ''))[0]);
        if ($value !== '') {
            return $value;
        }
    }
    return (string) ($_SERVER['REMOTE_ADDR'] ?? '');
}

function reply(int $status): never
{
    http_response_code($status);
    exit;
}

/* ---------- riga di comando: pulizia manuale o da cron ---------- */
if (PHP_SAPI === 'cli') {
    if (in_array('--purge', $argv, true)) {
        $n = purge(consent_dir(), true);
        fwrite(STDOUT, "File rimossi: $n\n");
        exit(0);
    }
    fwrite(STDERR, "Uso: php api/consent.php --purge\n");
    exit(1);
}

header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');
header('Referrer-Policy: same-origin');

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    header('Allow: POST');
    reply(405);
}

/* Solo richieste dallo stesso sito: l'Origin deve coincidere con l'host richiesto. */
$origin = (string) ($_SERVER['HTTP_ORIGIN'] ?? '');
$host = strtolower((string) ($_SERVER['HTTP_HOST'] ?? ''));
$o = parse_url($origin);
$originHost = isset($o['host']) ? strtolower($o['host']) . (isset($o['port']) ? ':' . $o['port'] : '') : '';
if ($originHost === '' || $originHost !== $host) {
    reply(403);
}

if (stripos((string) ($_SERVER['CONTENT_TYPE'] ?? ''), 'application/json') !== 0) {
    reply(415);
}
$raw = file_get_contents('php://input', false, null, 0, MAX_BODY_BYTES + 1);
if ($raw === false || strlen($raw) > MAX_BODY_BYTES) {
    reply(413);
}

$in = json_decode($raw, true);
if (!is_array($in)
    || !is_string($in['id'] ?? null) || !preg_match('/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/', $in['id'])
    || !is_string($in['version'] ?? null) || !preg_match('/^\d{4}-\d{2}-\d{2}$/', $in['version'])
    || !in_array($in['choice'] ?? null, CHOICES, true)
    || !is_bool($in['marketing'] ?? null)
    || ($in['choice'] === 'accept_all' && !$in['marketing'])
    || (in_array($in['choice'], ['reject_all', 'close'], true) && $in['marketing'])) {
    reply(422);
}
$page = is_string($in['page'] ?? null) && preg_match('#^/[A-Za-z0-9/._-]{0,199}$#', $in['page']) ? $in['page'] : '/';
$ua = preg_replace('/[^\x20-\x7E]/', '', substr((string) ($_SERVER['HTTP_USER_AGENT'] ?? ''), 0, 300));

$record = [
    'ts' => gmdate('Y-m-d\TH:i:s\Z'),
    'id' => $in['id'],
    'version' => $in['version'],
    'choice' => $in['choice'],
    'marketing' => $in['marketing'],
    'page' => $page,
    'ip' => anonymize_ip(client_ip()),
    'ua' => $ua,
];

try {
    $dir = consent_dir();
    purge($dir);
    $file = $dir . '/consent-' . gmdate('Y-m-d') . '.jsonl';
    clearstatcache(true, $file);
    if (is_file($file) && filesize($file) > MAX_DAILY_BYTES) {
        reply(503);
    }
    $isNew = !is_file($file);
    $fh = fopen($file, 'ab');
    if ($fh === false) {
        reply(500);
    }
    if ($isNew) {
        @chmod($file, 0600);
    }
    flock($fh, LOCK_EX);
    fwrite($fh, json_encode($record, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) . "\n");
    fflush($fh);
    flock($fh, LOCK_UN);
    fclose($fh);
} catch (Throwable $e) {
    error_log('consent.php: ' . $e->getMessage());
    reply(500);
}

reply(204);
