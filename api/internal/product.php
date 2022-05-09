<?php

// TODO query - organize, remove duplicates

$productQueryString =
    "select
      Product.id, Brand.name as 'brand', ProductType.name as 'type', ProductType.name as 'productType', amountValue, amountUnit, shortDesc, shortDesc as 'name', code, PackageType.name as 'packageType', imgName, description
    from Product
        left join Brand on Brand.id=brandId
        left join PackageType on PackageType.id=packageTypeId
        left join ProductType on ProductType.id=typeId";

function getProductById($id, $db){
  global $productQueryString;
  return $db->query($productQueryString." where Product.id=?", $id)[0];
}

function listProducts($db){
  global $productQueryString;
  return $db->query($productQueryString);
}

function searchProducts($searchPhrase, $db){
  global $productQueryString;
  return $db->query($productQueryString." where concat(Brand.name, ' ', ProductType.name, ' ', shortDesc) like lower('%".$db->escape($searchPhrase)."%')");
}

?>
