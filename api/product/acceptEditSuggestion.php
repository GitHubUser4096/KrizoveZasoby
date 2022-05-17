<?php

session_start();

require_once '../../lib/php/db.php';
require_once '../../config/supplies.conf.php';
require_once '../internal/common.php';
// require_once 'api/internal/product.php';

$db = new DB(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME, DB_DEBUG);

checkAuth();
checkPost();
checkRole('editor');

$editId = getParam('editId');

$edit = $db->query("select
      productId, ProductEditSuggestion.id, changedBrandId, Brand.id as 'brandId', changedTypeId, ProductType.id as 'typeId', changedAmountValue, amountValue, changedAmountUnit, amountUnit, changedShortDesc, shortDesc, changedCode, code, changedPackageTypeId, PackageType.id as 'packageTypeId', changedImgName, imgName, changedDescription, description
    from ProductEditSuggestion
      left join Brand on Brand.id=brandId
      left join PackageType on PackageType.id=packageTypeId
      left join ProductType on ProductType.id=typeId
    where ProductEditSuggestion.id=?", $editId)[0];

// TODO can this be optimized / written better?

if($edit['changedBrandId']){
  $db->execute("update Product set brandId=? where id=?", $edit['brandId'], $edit['productId']);
}

if($edit['changedTypeId']){
  $db->execute("update Product set typeId=? where id=?", $edit['typeId'], $edit['productId']);
}

if($edit['changedShortDesc']){
  $db->execute("update Product set shortDesc=? where id=?", $edit['shortDesc'], $edit['productId']);
}

if($edit['changedCode']){
  $db->execute("update Product set code=? where id=?", $edit['code'], $edit['productId']);
}

if($edit['changedImgName']){
  $db->execute("update Product set imgName=? where id=?", $edit['imgName'], $edit['productId']);
}

if($edit['changedPackageTypeId']){
  $db->execute("update Product set packageTypeId=? where id=?", $edit['packageTypeId'], $edit['productId']);
}

if($edit['changedDescription']){
  $db->execute("update Product set description=? where id=?", $edit['description'], $edit['productId']);
}

if($edit['changedAmountValue']){
  $db->execute("update Product set amountValue=? where id=?", $edit['amountValue'], $edit['productId']);
}

if($edit['changedAmountUnit']){
  $db->execute("update Product set amountUnit=? where id=?", $edit['amountUnit'], $edit['productId']);
}

$db->execute("delete from ProductEditSuggestion where id=?", $editId);

?>