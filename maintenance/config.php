<?php
/*
 * Modalità manutenzione del sito.
 *
 * enabled        true = tutto il sito chiede la password (risposta 503 + noindex)
 * password_hash  hash bcrypt della password, mai la password in chiaro.
 *                Nuovo hash: php -r 'echo password_hash("nuova-password", PASSWORD_DEFAULT), "\n";'
 *                La variabile d'ambiente GS_MAINT_PASSWORD_HASH, se presente, ha la precedenza.
 * unlock_hours   per quanto resta sbloccato il browser dopo la password giusta.
 *
 * Cambiare la password invalida gli sblocchi già concessi.
 */
return [
    'enabled' => true,
    'password_hash' => '$2y$12$8mdAE4KOIqQ4SshIoIS2uOAsA35Mpt7cnU5pjfLBqjmYJkeGQQ6C.',
    'unlock_hours' => 168,
];
