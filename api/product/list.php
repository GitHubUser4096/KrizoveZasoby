<?php

session_start();

require_once '../../lib/php/db.php';
require_once '../../config/supplies.conf.php';

$db = new DB(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME);

$products = $db->query("select * from Product");
$packageTypes = $db->queryMap("select * from PackageType", 'id');
$categories = $db->queryMap("select * from Category", 'id');

for($i = 0; $i<count($products); $i++){

  if($products[$i]['packageTypeId']){
    $products[$i]['packageType'] = $packageTypes[$products[$i]['packageTypeId']]['name'];
  }

  $prodCats = $db->query("select * from ProductCategory where productId=?", $products[$i]['id']);

  $products[$i]['categories'] = [];

  foreach($prodCats as $prodCat){
    $products[$i]['categories'][] = $categories[$prodCat['categoryId']]['name'];
  }

}

echo json_encode($products);

?>
