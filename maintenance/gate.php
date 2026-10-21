<?php
/*
 * SPOTTER — modalità manutenzione
 *
 * Usato da maintenance/index.php (Apache, tramite .htaccess) e da
 * scripts/dev-router.php (server PHP di sviluppo). Finché la manutenzione è
 * attiva ogni richiesta passa di qui: senza sblocco valido si vede la pagina
 * «Lavori in corso» con la password; con lo sblocco il sito funziona normalmente.
 *
 * Lo sblocco è il cookie gs_maint = scadenza.firma, firmato con HMAC-SHA256 con
 * una chiave casuale salvata in storage/maintenance/secret.key (creata al primo
 * uso, mai nel repository) e legato all'hash della password: cambiarla revoca
 * tutti gli sblocchi. Massimo 5 tentativi errati ogni 10 minuti per IP.
 */
declare(strict_types=1);

const GS_MAINT_COOKIE = 'gs_maint';
const GS_MAINT_MAX_ATTEMPTS = 5;
const GS_MAINT_WINDOW = 600;

function gs_maint_root(): string
{
    return dirname(__DIR__);
}

function gs_maint_config(): array
{
    static $cfg;
    if ($cfg === null) {
        $cfg = require __DIR__ . '/config.php';
        $env = getenv('GS_MAINT_PASSWORD_HASH');
        if ($env) {
            $cfg['password_hash'] = $env;
        }
    }
    return $cfg;
}

function gs_maint_enabled(): bool
{
    $cfg = gs_maint_config();
    return !empty($cfg['enabled']) && !empty($cfg['password_hash']);
}

function gs_maint_dir(): string
{
    $dir = gs_maint_root() . '/storage/maintenance';
    if (!is_dir($dir)) {
        @mkdir($dir, 0700, true);
    }
    return $dir;
}

function gs_maint_secret(): string
{
    $file = gs_maint_dir() . '/secret.key';
    $key = is_file($file) ? (string) file_get_contents($file) : '';
    if (strlen($key) < 32) {
        $key = bin2hex(random_bytes(32));
        file_put_contents($file, $key, LOCK_EX);
        @chmod($file, 0600);
    }
    return $key;
}

function gs_maint_sign(int $exp): string
{
    return hash_hmac('sha256', $exp . '|' . gs_maint_config()['password_hash'], gs_maint_secret());
}

function gs_maint_unlocked(): bool
{
    $raw = (string) ($_COOKIE[GS_MAINT_COOKIE] ?? '');
    if (!preg_match('/^(\d{10})\.([0-9a-f]{64})$/', $raw, $m)) {
        return false;
    }
    return (int) $m[1] > time() && hash_equals(gs_maint_sign((int) $m[1]), $m[2]);
}

function gs_maint_https(): bool
{
    return (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
        || strtolower((string) ($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '')) === 'https';
}

function gs_maint_unlock(): void
{
    $exp = time() + max(1, (int) (gs_maint_config()['unlock_hours'] ?? 168)) * 3600;
    setcookie(GS_MAINT_COOKIE, $exp . '.' . gs_maint_sign($exp), [
        'expires' => $exp, 'path' => '/', 'secure' => gs_maint_https(), 'httponly' => true, 'samesite' => 'Lax',
    ]);
}

/* ---------- limite ai tentativi ---------- */
function gs_maint_attempts_file(): string
{
    return gs_maint_dir() . '/attempts-' . hash('sha256', (string) ($_SERVER['REMOTE_ADDR'] ?? '') . gs_maint_secret()) . '.json';
}

function gs_maint_blocked(): bool
{
    $f = gs_maint_attempts_file();
    if (!is_file($f)) {
        return false;
    }
    $a = json_decode((string) file_get_contents($f), true) ?: [];
    if (time() - (int) ($a['first'] ?? 0) > GS_MAINT_WINDOW) {
        @unlink($f);
        return false;
    }
    return (int) ($a['count'] ?? 0) >= GS_MAINT_MAX_ATTEMPTS;
}

function gs_maint_fail(): void
{
    $f = gs_maint_attempts_file();
    $a = is_file($f) ? (json_decode((string) file_get_contents($f), true) ?: []) : [];
    if (time() - (int) ($a['first'] ?? 0) > GS_MAINT_WINDOW) {
        $a = ['first' => time(), 'count' => 0];
    }
    $a['count'] = (int) $a['count'] + 1;
    file_put_contents($f, json_encode($a), LOCK_EX);
    @chmod($f, 0600);
    // pulizia dei contatori scaduti
    foreach (glob(gs_maint_dir() . '/attempts-*.json') ?: [] as $old) {
        if (filemtime($old) < time() - GS_MAINT_WINDOW) {
            @unlink($old);
        }
    }
}

/* ---------- percorsi sempre accessibili (servono alla pagina di manutenzione) ---------- */
function gs_maint_public_path(string $path): bool
{
    return (bool) preg_match('#^/assets/(fonts/[a-z0-9-]+\.woff2|css/fonts\.css|img/favicon\.svg)$#', $path);
}

/*
 * Gestisce la richiesta. Restituisce true se l'utente può proseguire verso il sito,
 * altrimenti ha già inviato la pagina di manutenzione o il redirect dopo il login.
 */
function gs_maint_handle(string $path): bool
{
    if (!gs_maint_enabled() || gs_maint_public_path($path)) {
        return true;
    }
    header('X-Robots-Tag: noindex, nofollow');
    header('Cache-Control: private, no-store');
    if (gs_maint_unlocked()) {
        return true;
    }

    $error = '';
    if (($_SERVER['REQUEST_METHOD'] ?? '') === 'POST' && isset($_POST['gs_maint_password'])) {
        $origin = (string) ($_SERVER['HTTP_ORIGIN'] ?? '');
        $o = parse_url($origin);
        $originHost = isset($o['host']) ? strtolower($o['host']) . (isset($o['port']) ? ':' . $o['port'] : '') : '';
        if ($origin !== '' && $originHost !== strtolower((string) ($_SERVER['HTTP_HOST'] ?? ''))) {
            $error = 'Richiesta non valida.';
        } elseif (gs_maint_blocked()) {
            $error = 'Troppi tentativi. Riprova tra qualche minuto.';
        } elseif (password_verify((string) $_POST['gs_maint_password'], gs_maint_config()['password_hash'])) {
            gs_maint_unlock();
            $target = preg_match('#^/[A-Za-z0-9/._-]*$#', $path) ? $path : '/';
            header('Location: ' . $target, true, 303);
            return false;
        } else {
            gs_maint_fail();
            usleep(400000);
            $error = 'Password non corretta.';
        }
    }
    gs_maint_page($error);
    return false;
}

/* ---------- serve un file del sito (solo modalità Apache, dopo lo sblocco) ---------- */
function gs_maint_serve(string $path): void
{
    $root = realpath(gs_maint_root());
    if (preg_match('#(^|/)\.|^/(storage|scripts|maintenance)(/|$)#', $path) || str_contains($path, "\0")) {
        gs_maint_not_found();
    }
    $file = realpath($root . $path);
    if ($file !== false && is_dir($file)) {
        if (!str_ends_with($path, '/')) {
            header('Location: ' . $path . '/' . (isset($_SERVER['QUERY_STRING']) && $_SERVER['QUERY_STRING'] !== '' ? '?' . $_SERVER['QUERY_STRING'] : ''), true, 301);
            exit;
        }
        $file = realpath($file . '/index.html');
    }
    if ($file === false || !is_file($file) || !str_starts_with($file, $root . DIRECTORY_SEPARATOR)) {
        gs_maint_not_found();
    }
    $ext = strtolower(pathinfo($file, PATHINFO_EXTENSION));
    if ($ext === 'php') {
        // unico script eseguibile del sito
        if ($file !== $root . '/api/consent.php') {
            gs_maint_not_found();
        }
        require $file;
        exit;
    }
    $types = [
        'html' => 'text/html; charset=utf-8', 'css' => 'text/css; charset=utf-8', 'js' => 'text/javascript; charset=utf-8',
        'json' => 'application/json', 'xml' => 'application/xml; charset=utf-8', 'txt' => 'text/plain; charset=utf-8',
        'svg' => 'image/svg+xml', 'png' => 'image/png', 'jpg' => 'image/jpeg', 'jpeg' => 'image/jpeg', 'webp' => 'image/webp',
        'ico' => 'image/x-icon', 'woff2' => 'font/woff2', 'md' => 'text/plain; charset=utf-8',
    ];
    if (!isset($types[$ext])) {
        gs_maint_not_found();
    }
    header('Content-Type: ' . $types[$ext]);
    header('Content-Length: ' . filesize($file));
    header('X-Content-Type-Options: nosniff');
    readfile($file);
    exit;
}

function gs_maint_not_found(): never
{
    http_response_code(404);
    header('Content-Type: text/plain; charset=utf-8');
    echo 'Pagina non trovata';
    exit;
}

/* ---------- pagina «Lavori in corso» ---------- */
function gs_maint_page(string $error): void
{
    http_response_code(503);
    header('Retry-After: 86400');
    header('Content-Type: text/html; charset=utf-8');
    header("Content-Security-Policy: default-src 'none'; style-src 'unsafe-inline' 'self'; font-src 'self'; img-src 'self'; form-action 'self'; frame-ancestors 'none'; base-uri 'none'");
    header('Referrer-Policy: same-origin');
    $err = htmlspecialchars($error, ENT_QUOTES, 'UTF-8');
    ?>
<!doctype html>
<html lang="it">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <meta name="robots" content="noindex, nofollow">
  <meta name="theme-color" content="#121211">
  <title>Lavori in corso — Spotter</title>
  <link rel="icon" href="/assets/img/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="/assets/css/fonts.css?v=1">
  <style>
    :root { --ink: #121211; --paper: #FBF9F4; --volt: #D8FF3C; --mute: rgba(251, 249, 244, .6); }
    * { box-sizing: border-box; }
    html, body { height: 100%; }
    body { margin: 0; display: grid; place-items: center; padding: 24px 16px; background: var(--ink); color: var(--paper); font-family: 'Instrument Sans', system-ui, sans-serif; -webkit-font-smoothing: antialiased; overflow-x: hidden; }
    body::before { content: ''; position: fixed; right: -20vmax; top: -30vmax; width: 70vmax; height: 70vmax; border-radius: 50%; background: radial-gradient(circle, rgba(216, 255, 60, .16), transparent 60%); pointer-events: none; }
    main { position: relative; width: 100%; max-width: 420px; }
    .brand { display: flex; align-items: center; gap: 10px; font-family: 'Archivo', system-ui, sans-serif; font-stretch: 125%; font-variation-settings: "wdth" 125; font-weight: 900; font-style: italic; font-size: 24px; letter-spacing: -.02em; }
    .pin { width: 13px; height: 13px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); background: var(--volt); box-shadow: 0 0 22px rgba(216, 255, 60, .6); }
    .mono { display: block; margin-top: 48px; font-family: 'Martian Mono', ui-monospace, monospace; font-size: 11px; letter-spacing: .06em; text-transform: uppercase; color: var(--volt); }
    h1 { margin: 14px 0 14px; font-family: 'Archivo', system-ui, sans-serif; font-stretch: 125%; font-variation-settings: "wdth" 125; font-weight: 900; text-transform: uppercase; font-size: clamp(40px, 12vw, 64px); line-height: .95; letter-spacing: -.03em; }
    p { margin: 0 0 28px; color: var(--mute); font-size: 16.5px; line-height: 1.55; }
    form { display: grid; gap: 10px; }
    label { font-size: 14px; font-weight: 700; }
    input { width: 100%; height: 54px; padding: 0 16px; border: 0; border-radius: 16px; background: rgba(255, 255, 255, .08); box-shadow: inset 0 0 0 1.5px rgba(255, 255, 255, .18); color: var(--paper); font: inherit; font-size: 16px; }
    input:focus { outline: none; box-shadow: inset 0 0 0 2px var(--volt); }
    button { height: 54px; border: 0; border-radius: 16px; background: var(--volt); color: var(--ink); font: inherit; font-weight: 700; font-size: 16px; cursor: pointer; }
    button:focus-visible { outline: 3px solid var(--paper); outline-offset: 2px; }
    .err { margin: 0; padding: 12px 14px; border-radius: 14px; background: rgba(255, 90, 70, .14); color: #FFB4A8; font-size: 14.5px; font-weight: 600; }
  </style>
</head>
<body>
  <main>
    <div class="brand"><span class="pin"></span>SPOTTER</div>
    <span class="mono">Sito in preparazione</span>
    <h1>Lavori in corso</h1>
    <p>Stiamo preparando il nuovo sito di Spotter. Se hai la password puoi entrare in anteprima.</p>
    <form method="post" autocomplete="off">
      <?php if ($err !== '') { echo '<p class="err" role="alert">' . $err . '</p>'; } ?>
      <label for="pw">Password</label>
      <input id="pw" name="gs_maint_password" type="password" required autofocus autocomplete="current-password">
      <button type="submit">Accedi</button>
    </form>
  </main>
</body>
</html>
<?php
}
