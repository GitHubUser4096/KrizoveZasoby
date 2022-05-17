<?php

session_start();

require_once '../../lib/php/db.php';
require_once '../../config/supplies.conf.php';
require_once '../internal/common.php';
require_once '../internal/product.php';

$db = new DB(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME, DB_DEBUG);

checkAuth();
checkPost();
checkRole('contributor');

$productId = getParam('productId');

// TODO can this be written better?

$changedCode = false;
$changedBrand = false;
$changedType = false;
$changedShortDesc = false;
$changedAmountValue = false;
$changedPackageType = false;
$changedAmountUnit = false;
$changedDescription = false;
$changedImgName = false;

if(isSet($_POST['code'])){
  $changedCode = true;
  $code = validate(['name'=>'code', 'required'=>true, 'maxLength'=>64]);
}

if(isSet($_POST['brand'])){
  $changedBrand = true;
  $brand = validate(['name'=>'brand', 'required'=>true, 'maxLength'=>64]);
}

if(isSet($_POST['type'])){
  $changedType = true;
  $type = validate(['name'=>'type', 'required'=>true, 'maxLength'=>64]);
}

if(isSet($_POST['shortDesc'])){
  $changedShortDesc = true;
  $shortDesc = validate(['name'=>'shortDesc', 'required'=>true, 'maxLength'=>128]);
}

if(isSet($_POST['amountValue'])){
  $changedAmountValue = true;
  $amountValue = validate(['name'=>'amountValue', 'type'=>'int', 'min'=>1]); // TODO max
}

if(isSet($_POST['packageType'])){
  $changedPackageType = true;
  $packageType = validate(['name'=>'packageType', 'maxLength'=>128]);
}

if(isSet($_POST['amountUnit'])){
  $changedAmountUnit = true;
  $amountUnit = validate(['name'=>'amountUnit', 'required'=>true, 'enum'=>['g', 'ml']]);
}

if(isSet($_POST['description'])){
  $changedDescription = true;
  $description = validate(['name'=>'description', 'maxLength'=>1024]);
}

if(isSet($_POST['imgName'])){
  $changedImgName = true;
  $imgName = $_POST['imgName'];
}



if($changedBrand){
  $brands = $db->query("select * from Brand where name=?", $brand);
  if(count($brands)==0){
    $brandId = $db->insert("insert into Brand(name) values (?)", $brand);
  } else {
    $brandId = $brands[0]['id'];
  }
}

if($changedType){
  $productTypes = $db->query("select * from ProductType where name=?", $type);
  if(count($productTypes)==0){
    $productTypeId = $db->insert("insert into ProductType(name) values (?)", $type);
  } else {
    $productTypeId = $productTypes[0]['id'];
  }
}

if($changedPackageType){
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
}

// $imgName = (isSet($_POST['imgName']) && $_POST['imgName']) ? $_POST['imgName'] : null;

$edits = $db->query("select * from ProductEditSuggestion where editedBy=? and productId=?", $_SESSION['user']['id'], $productId);

if(count($edits)>0){
  $editId = $edits[0]['id'];
} else {
  $editId = $db->insert("insert into ProductEditSuggestion(productId, editedBy) values(?, ?)", $productId, $_SESSION['user']['id']);
}

// TODO can this be optimized?

if($changedBrand){
  $db->execute("update ProductEditSuggestion set changedBrandId=true, brandId=? where id=?", $brandId, $editId);
}

if($changedType){
  $db->execute("update ProductEditSuggestion set changedTypeId=true, typeId=? where id=?", $productTypeId, $editId);
}

if($changedShortDesc){
  $db->execute("update ProductEditSuggestion set changedShortDesc=true, shortDesc=? where id=?", $shortDesc, $editId);
}

if($changedCode){
  $db->execute("update ProductEditSuggestion set changedCode=true, code=? where id=?", $code, $editId);
}

if($changedImgName){
  $db->execute("update ProductEditSuggestion set changedImgName=true, imgName=? where id=?", $imgName, $editId);
}

if($changedPackageType){
  $db->execute("update ProductEditSuggestion set changedPackageTypeId=true, packageTypeId=? where id=?", $packageTypeId, $editId);
}

if($changedDescription){
  $db->execute("update ProductEditSuggestion set changedDescription=true, description=? where id=?", $description, $editId);
}

if($changedAmountValue){
  $db->execute("update ProductEditSuggestion set changedAmountValue=true, amountValue=? where id=?", $amountValue, $editId);
}

if($changedAmountUnit){
  $db->execute("update ProductEditSuggestion set changedAmountUnit=true, amountUnit=? where id=?", $amountUnit, $editId);
}

// $db->execute("update ProductEditSuggestion set brandId=?, typeId=?, shortDesc=?, code=?, imgName=?, packageTypeId=?, description=?, amountValue=?, amountUnit=? where id=?",
//     $brandId, $productTypeId, $shortDesc, $code, $imgName, $packageTypeId, $description, $amountValue, $amountUnit, $editId);

$product = getProductById($productId, $db);

echo json_encode($product);

?>
