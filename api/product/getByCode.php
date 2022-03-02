<?php

session_start();

require_once '../../lib/php/db.php';
require_once '../../config/supplies.conf.php';

$db = new DB(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME);

$code = $_GET['code'];

$products = $db->query("select * from Product where EAN=?", $code);

if(count($products)==0){
  echo json_encode(null);
} else {
  echo json_encode($products[0]);
}

?>
