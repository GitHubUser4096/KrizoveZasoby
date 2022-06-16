<?php

session_start();

require_once '../../lib/php/db.php';
require_once '../../config/supplies.conf.php';
require_once '../internal/common.php';
require_once '../internal/product.php';

$db = new DB(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME, DB_DEBUG);

/**
 * Create a product
 * Method: POST
 * Post: code*, brand*, type*, shortDesc*, amountValue, amountUnit*, description, imgName
 * Returns: created product (json)
 */

checkAuth();
checkPost();
checkRole('contributor');

$code = validate(['name'=>'code', 'required'=>true, 'maxLength'=>64]);
$brand = validate(['name'=>'brand', 'required'=>true, 'maxLength'=>64]);
$type = validate(['name'=>'type', 'required'=>true, 'maxLength'=>64]);
$shortDesc = validate(['name'=>'shortDesc', 'required'=>true, 'maxLength'=>128]);
$amountValue = validate(['name'=>'amountValue', 'type'=>'int', 'min'=>1, 'max'=>99999]);
$packageType = validate(['name'=>'packageType', 'maxLength'=>64]);
$amountUnit = validate(['name'=>'amountUnit', 'required'=>true, 'enum'=>['g', 'ml']]);
$description = validate(['name'=>'description', 'maxLength'=>1024]);

$products = $db->query("select * from Product where code=?", $code);
if(count($products)>0){
  fail('400 Bad request', 'Produkt již existuje.');
}

$brands = $db->query("select * from Brand where name=?", $brand);
if(count($brands)==0){
  $brandId = $db->insert("insert into Brand(name) values (?)", $brand);
} else {
  $brandId = $brands[0]['id'];
}

$productTypes = $db->query("select * from ProductType where name=?", $type);
if(count($productTypes)==0){
  $productTypeId = $db->insert("insert into ProductType(name) values (?)", $type);
} else {
  $productTypeId = $productTypes[0]['id'];
}

if($packageType){
  $packageTypes = $db->query("select * from PackageType where name=?", $packageType);
  if(count($packageTypes)==0){
    $packageTypeId = $db->insert("insert into PackageType(name) values (?)", $packageType);
  } else {
    $packageTypeId = $packageTypes[0]['id'];
  }
} else {
  $packageTypeId = null;
}

$imgName = (isSet($_POST['imgName']) && $_POST['imgName']) ? $_POST['imgName'] : null;

if($imgName && strlen($imgName)>64){
  fail('400 Bad request', 'imgName too long');
}

$prodId = $db->insert("insert into Product(brandId, typeId, shortDesc, code, imgName, packageTypeId, description, amountValue, amountUnit, createdBy) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    $brandId, $productTypeId, $shortDesc, $code, $imgName, $packageTypeId, $description, $amountValue, $amountUnit, $_SESSION['user']['id']);

$product = getProductById($prodId, $db);

echo json_encode($product);

?>
