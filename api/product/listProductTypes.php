<?php

session_start();

require_once '../../lib/php/db.php';
require_once '../../config/supplies.conf.php';

$db = new DB(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME);

$productTypes = $db->query("select * from ProductType order by name");

echo json_encode($productTypes);

?>
