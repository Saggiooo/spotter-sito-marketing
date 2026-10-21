<?php
/* Front controller per Apache: .htaccess indirizza qui tutte le richieste.
 * Prima controlla la manutenzione, poi serve il file richiesto. */
declare(strict_types=1);
require __DIR__ . '/gate.php';

$path = rawurldecode((string) parse_url((string) ($_SERVER['REQUEST_URI'] ?? '/'), PHP_URL_PATH));
if (gs_maint_handle($path)) {
    gs_maint_serve($path);
}
