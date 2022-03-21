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

if(!isSet($_POST['code']) || strlen(trim($_POST['code']))==0){
  header('HTTP/1.1 400 Bad request');
  echo 'Prosím zadejte kód produktu!';
  return;
}

if(!isSet($_POST['brand']) || strlen(trim($_POST['brand']))==0){
  header('HTTP/1.1 400 Bad request');
  echo 'Prosím zadejte značku produktu!';
  return;
}

if(!isSet($_POST['type']) || strlen(trim($_POST['type']))==0){
  header('HTTP/1.1 400 Bad request');
  echo 'Prosím zadejte typ produktu!';
  return;
}

if(!isSet($_POST['shortDesc']) || strlen(trim($_POST['shortDesc']))==0){
  header('HTTP/1.1 400 Bad request');
  echo 'Prosím zadejte krátký popis!';
  return;
}

$products = $db->query("select * from Product where code=?", $_POST['code']);

if(count($products)>0){
  header('HTTP/1.1 400 Bad request');
  echo 'Produkt již existuje.';
  return;
}

$brands = $db->query("select * from Brand where name=?", $_POST['brand']);
if(count($brands)==0){
  $brandId = $db->insert("insert into Brand(name) values (?)", $_POST['brand']);
} else {
  $brandId = $brands[0]['id'];
}

$productTypes = $db->query("select * from ProductType where name=?", $_POST['type']);
if(count($productTypes)==0){
  $productTypeId = $db->insert("insert into ProductType(name) values (?)", $_POST['type']);
} else {
  $productTypeId = $productTypes[0]['id'];
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

$prodId = $db->insert("insert into Product(brandId, typeId, shortDesc, code, imgName, packageTypeId, description, amountValue, amountUnit) values (?, ?, ?, ?, ?, ?, ?, ?, ?)",
    $brandId, $productTypeId, $_POST['shortDesc'], $_POST['code'], $imgName, $packageTypeId, $_POST['description'], $_POST['amountValue'], $_POST['amountUnit']);

echo json_encode(['id'=>$prodId, 'brand'=>$_POST['brand'], 'productType'=>$_POST['type'], 'packageType'=>$_POST['packageType'], 'shortDesc'=>$_POST['shortDesc'], 'imgName'=>$imgName]);

?>
