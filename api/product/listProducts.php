<?php

session_start();

require_once '../../lib/php/db.php';
require_once '../../config/supplies.conf.php';
require_once '../internal/product.php';
require_once '../internal/common.php';

$db = new DB(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME, DB_DEBUG);

checkAuth();

// TODO anyone logged in can see all products - IS THIS OK?

$products = listProducts($db);
$res = [];

foreach($products as $product){

  $user = $db->query("select * from User where id=?", $product['createdBy'])[0];
  $product['createdBy'] = [
    'id'=>$user['id'],
    'email'=>$user['email'],
  ];
  $res[] = $product;

}

echo json_encode($res);

?>
