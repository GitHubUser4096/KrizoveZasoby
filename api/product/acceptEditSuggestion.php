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

$edits = $db->query("select
      productId, ProductEditSuggestion.id, changedBrandId, Brand.id as 'brandId', changedAmountValue, amountValue, changedAmountUnit, amountUnit, changedShortDesc, shortDesc, changedCode, code, changedPackageTypeId, PackageType.id as 'packageTypeId', changedImgName, imgName
    from ProductEditSuggestion
      left join Brand on Brand.id=brandId
      left join PackageType on PackageType.id=packageTypeId
    where ProductEditSuggestion.id=?", $editId);

if(count($edits)==0){
  fail('404 Not found', 'suggestion does not exist!');
}

$edit = $edits[0];

// TODO can this be optimized / written better?

if($edit['changedBrandId']){
  $db->execute("update Product set brandId=? where id=?", $edit['brandId'], $edit['productId']);
}

if($edit['changedShortDesc']){
  $db->execute("update Product set shortDesc=? where id=?", $edit['shortDesc'], $edit['productId']);
}

if($edit['changedCode']){
  $products = $db->query("select * from Product where code=?", $edit['code']);
  if(count($products)>0 && $products[0]['id']!=$edit['productId']){
    fail('400 Bad request', 'Produkt se stejným kódem již existuje!');
  }
  $db->execute("update Product set code=? where id=?", $edit['code'], $edit['productId']);
}

if($edit['changedImgName']){
  $db->execute("update Product set imgName=? where id=?", $edit['imgName'], $edit['productId']);
}

if($edit['changedPackageTypeId']){
  $db->execute("update Product set packageTypeId=? where id=?", $edit['packageTypeId'], $edit['productId']);
}

if($edit['changedAmountValue']){
  $db->execute("update Product set amountValue=? where id=?", $edit['amountValue'], $edit['productId']);
}

if($edit['changedAmountUnit']){
  $db->execute("update Product set amountUnit=? where id=?", $edit['amountUnit'], $edit['productId']);
}

$db->execute("delete from ProductEditSuggestion where id=?", $editId);

?>