<?php

session_start();

require_once '../../lib/php/db.php';
require_once '../../config/supplies.conf.php';
require_once '../internal/common.php';
// require_once 'api/internal/product.php';

$db = new DB(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME, DB_DEBUG);

checkAuth();
checkRole('editor');

$res = [];

$edits = $db->query("select
      productId, editedBy, ProductEditSuggestion.id, changedBrandId, Brand.name as 'brand', changedTypeId, ProductType.name as 'type', changedAmountValue, amountValue, changedAmountUnit, amountUnit, changedShortDesc, shortDesc, changedCode, code, changedPackageTypeId, PackageType.name as 'packageType', changedImgName, imgName, changedDescription, description
    from ProductEditSuggestion
      left join Brand on Brand.id=brandId
      left join PackageType on PackageType.id=packageTypeId
      left join ProductType on ProductType.id=typeId");

foreach($edits as $edit){

  $user = $db->query("select id, email from User where id=?", $edit['editedBy'])[0];

  $edit['editedBy'] = $user;

  $product = $db->query("select
        Product.id, Brand.name as 'brand', ProductType.name as 'type', ProductType.name as 'productType', amountValue, amountUnit, shortDesc, shortDesc as 'name', code, PackageType.name as 'packageType', imgName, description
      from Product
          left join Brand on Brand.id=brandId
          left join PackageType on PackageType.id=packageTypeId
          left join ProductType on ProductType.id=typeId
      where Product.id=?", $edit['productId'])[0];

  $edit['oldBrand'] = $product['brand'];
  $edit['oldType'] = $product['type'];
  $edit['oldAmountValue'] = $product['amountValue'];
  $edit['oldAmountUnit'] = $product['amountUnit'];
  $edit['oldShortDesc'] = $product['shortDesc'];
  $edit['oldCode'] = $product['code'];
  $edit['oldPackageType'] = $product['packageType'];
  $edit['oldImgName'] = $product['imgName'];
  $edit['oldDescription'] = $product['description'];

  $res[] = $edit;

}

echo json_encode($res);

?>