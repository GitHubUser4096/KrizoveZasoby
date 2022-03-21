<?php

session_start();

require_once '../../lib/php/db.php';
require_once '../../config/supplies.conf.php';

$db = new DB(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME);

$products = $db->query("select
      Product.id, Brand.name as 'brand', PackageType.name as 'packageType', ProductType.name as 'productType', shortDesc, shortDesc as 'name', imgName, amountValue, amountUnit
    from Product
        left join Brand on Brand.id=brandId
        left join PackageType on PackageType.id=packageTypeId
        left join ProductType on ProductType.id=typeId
    where concat(Brand.name, ' ', ProductType.name, ' ', shortDesc) like lower('%".$db->escape($_GET['search'])."%')");

echo json_encode($products);

?>
