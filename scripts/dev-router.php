<?php
/* Router per il server di sviluppo PHP:
 *   php -S 127.0.0.1:5518 -t . scripts/dev-router.php
 * Blocca storage/, scripts/, maintenance/ e i file nascosti come farebbero .htaccess
 * o nginx in produzione, applica la modalità manutenzione e serve il resto come file
 * statico (cartelle → index.html). */
$path = rawurldecode(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH) ?? '/');
if (preg_match('#^/(storage|scripts|maintenance)(/|$)#', $path) || preg_match('#/\.(?!well-known)#', $path)) {
    http_response_code(404);
    exit;
}
require dirname(__DIR__) . '/maintenance/gate.php';
if (!gs_maint_handle($path)) {
    exit;
}
return false;
