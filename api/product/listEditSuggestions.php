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
      productId, editedBy, ProductEditSuggestion.id, changedBrandId, Brand.name as 'brand', changedAmountValue, amountValue, changedAmountUnit, amountUnit, changedShortDesc, shortDesc, changedCode, code, changedPackageTypeId, PackageType.name as 'packageType', changedImgName, imgName
    from ProductEditSuggestion
      left join Brand on Brand.id=brandId
      left join PackageType on PackageType.id=packageTypeId");

foreach($edits as $edit){

  $user = $db->query("select id, email from User where id=?", $edit['editedBy'])[0];

  $edit['editedBy'] = $user;

  $product = $db->query("select
        Product.id, Brand.name as 'brand', amountValue, amountUnit, shortDesc, shortDesc as 'name', code, PackageType.name as 'packageType', imgName
      from Product
          left join Brand on Brand.id=brandId
          left join PackageType on PackageType.id=packageTypeId
      where Product.id=?", $edit['productId'])[0];

  $edit['oldBrand'] = $product['brand'];
  $edit['oldAmountValue'] = $product['amountValue'];
  $edit['oldAmountUnit'] = $product['amountUnit'];
  $edit['oldShortDesc'] = $product['shortDesc'];
  $edit['oldCode'] = $product['code'];
  $edit['oldPackageType'] = $product['packageType'];
  $edit['oldImgName'] = $product['imgName'];

  $res[] = $edit;

}

echo json_encode($res);

?>