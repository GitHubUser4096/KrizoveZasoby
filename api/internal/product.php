<?php

// TODO query - organize, remove duplicates

$productQueryString =
    "select
      Product.id, Brand.name as 'brand', ProductType.name as 'type', ProductType.name as 'productType', amountValue, amountUnit, shortDesc, shortDesc as 'name', code, PackageType.name as 'packageType', imgName, description, createdBy
    from Product
        left join Brand on Brand.id=brandId
        left join PackageType on PackageType.id=packageTypeId
        left join ProductType on ProductType.id=typeId";

function getProductById($id, $db){
  global $productQueryString;
  // return processEdits($db->query($productQueryString." where Product.id=?", $id), $db)[0];
  $products = $db->query($productQueryString." where Product.id=?", $id);
  if(count($products)==0){
    fail('400 Bad request', 'Product not found'); // TODO should this be 404?
  }
  return processEdits($products, $db)[0];
}

function getProductByCode($code, $db){
  global $productQueryString;
  $products = $db->query($productQueryString." where Product.code=?", $code);
  if(count($products)==0){
    fail('400 Bad request', 'Product not found'); // TODO should this be 404?
  }
  return processEdits($products, $db)[0];
}

function listProducts($db){
  global $productQueryString;
  return processEdits($db->query($productQueryString), $db);
}

function searchProducts($searchPhrase, $db){
  // global $productQueryString;
  // return processEdits($db->query($productQueryString." where concat(Brand.name, ' ', ProductType.name, ' ', shortDesc) like lower('%".$db->escape($searchPhrase)."%')"), $db);
  // TODO can this be done faster? (using SQL)
  $products = listProducts($db); // list products processes edits
  $res = [];
  foreach($products as $product){
    $prodName = $product['brand'].' '.$product['type'].' '.$product['shortDesc'].' '.$product['code'];
    if(strpos(strtolower($prodName), strtolower($searchPhrase))!==false){
      $res[] = $product;
    }
  }
  return $res;
}

function processEdits($productList, $db){
  for($i = 0; $i<count($productList); $i++){
    $edits = $db->query("select
        ProductEditSuggestion.id, changedBrandId, Brand.name as 'brand', changedTypeId, ProductType.name as 'type', changedAmountValue, amountValue, changedAmountUnit, amountUnit, changedShortDesc, shortDesc, changedCode, code, changedPackageTypeId, PackageType.name as 'packageType', changedImgName, imgName, changedDescription, description
      from ProductEditSuggestion
        left join Brand on Brand.id=brandId
        left join PackageType on PackageType.id=packageTypeId
        left join ProductType on ProductType.id=typeId
      where editedBy=? and productId=?", $_SESSION['user']['id'], $productList[$i]['id']);
    if(count($edits)>0){
      $edit = $edits[0];
      if($edit['changedBrandId']) $productList[$i]['brand'] = $edit['brand'];
      if($edit['changedTypeId']) $productList[$i]['type'] = $edit['type'];
      if($edit['changedTypeId']) $productList[$i]['productType'] = $edit['type'];
      if($edit['changedAmountValue']) $productList[$i]['amountValue'] = $edit['amountValue'];
      if($edit['changedAmountUnit']) $productList[$i]['amountUnit'] = $edit['amountUnit'];
      if($edit['changedShortDesc']) $productList[$i]['shortDesc'] = $edit['shortDesc'];
      if($edit['changedCode']) $productList[$i]['code'] = $edit['code'];
      if($edit['changedPackageTypeId']) $productList[$i]['packageType'] = $edit['packageType'];
      if($edit['changedImgName']) $productList[$i]['imgName'] = $edit['imgName'];
      if($edit['changedDescription']) $productList[$i]['description'] = $edit['description'];
    }
  }
  return $productList;
}

?>
