<?php

session_start();

require_once '../../lib/php/db.php';
require_once '../../config/supplies.conf.php';

$db = new DB(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME);

$packageTypes = $db->query("select * from PackageType order by name");

echo json_encode($packageTypes);

?>
