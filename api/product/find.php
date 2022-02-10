<?php

session_start();

require_once '../../lib/php/db.php';
require_once '../../config/supplies.conf.php';

$db = new DB(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME);

$products = $db->query("select * from Product where lower(name) like lower('%".$db->escape($_GET['search'])."%')");

echo json_encode($products);

?>
