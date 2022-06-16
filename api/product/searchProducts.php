<?php

session_start();

require_once '../../lib/php/db.php';
require_once '../../config/supplies.conf.php';
require_once '../internal/product.php';
require_once '../internal/common.php';

$db = new DB(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME, DB_DEBUG);

checkAuth();

$search = getParam('search');

if(!strlen($search)){
  echo json_encode([]);
  return;
}

$products = searchProducts($search, $db);

echo json_encode($products);

?>
