<?php

session_start();

require_once '../../lib/php/db.php';
require_once '../../config/supplies.conf.php';
require_once '../internal/common.php';

$db = new DB(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME, DB_DEBUG);

checkAuth();

$code = $_GET['code'];

$products = $db->query("select * from Product where code=?", $code);

if(count($products)==0){
  echo json_encode(null); // TODO return 404 instead?
} else {
  echo json_encode($products[0]);
}

?>
