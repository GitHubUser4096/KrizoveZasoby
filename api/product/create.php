<?php

session_start();

require_once '../../lib/php/db.php';
require_once '../../config/supplies.conf.php';

$db = new DB(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME);

if(!isSet($_SESSION['user'])){
  header('HTTP/1.1 403 Forbidden');
  echo 'Not logged in.';
  return;
}

if($_SERVER['REQUEST_METHOD']!=='POST'){
  header('HTTP/1.1 400 Bad request');
  echo 'Method must be POST.';
  return;
}

$products = $db->query("select * from Product where name=? or EAN=?", $_POST['name'], $_POST['EAN']);

if(count($products)>0){
  header('HTTP/1.1 400 Bad request');
  echo 'Produkt již existuje.';
  return;
}

if($_POST['packageType']){
  $packageTypes = $db->query("select * from PackageType where name=?", $_POST['packageType']);
  if(count($packageTypes)>0){
    $packageTypeId = $packageTypes[0]['id'];
  } else {
    $packageTypeId = $db->insert("insert into PackageType(name) values (?)", $_POST['packageType']);
  }
} else {
  $packageTypeId = null;
}

$imgName = ($_POST['imgName'] && $_POST['imgName']!='null') ? $_POST['imgName'] : null;

$prodId = $db->insert("insert into Product(name, EAN, imgName, description, packageTypeId) values (?, ?, ?, ?, ?)", $_POST['name'], $_POST['EAN'], $imgName, $_POST['description'], $packageTypeId);

$categories = json_decode($_POST['categories']);

foreach($categories as $category){
  $dbCats = $db->query("select * from Category where name=?", $category);
  if(count($dbCats)>0){
    $catId = $dbCats[0]['id'];
  } else {
    $catId = $db->insert("insert into Category(name) values (?)", $category);
  }
  $db->insert('insert into ProductCategory(productId, categoryId) values (?, ?)', $prodId, $catId);
}

echo json_encode(['id'=>$prodId]);

?>
