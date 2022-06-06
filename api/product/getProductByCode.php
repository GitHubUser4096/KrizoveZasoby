<?php

session_start();

require_once '../../lib/php/db.php';
require_once '../../config/supplies.conf.php';
require_once '../internal/common.php';
require_once '../internal/product.php';

$db = new DB(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME, DB_DEBUG);

checkAuth();

// if(!isSet($_GET['code'])){
//   fail('400 Bad request', 'Missing parameter code');
// }

// $code = $_GET['code'];

$code = getParam('code');

echo json_encode(getProductByCode($code, $db));

// $products = $db->query("select * from Product where code=?", $code);

// if(count($products)==0){
//   echo json_encode(null);
// } else {
//   echo json_encode($products[0]);
// }

?>
