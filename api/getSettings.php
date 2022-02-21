<?php

session_start();

require_once '../lib/php/db.php';
require_once '../config/supplies.conf.php';
require_once 'internal/getConfig.php';

$db = new DB(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME);

echo json_encode(getConfig($db));

?>
