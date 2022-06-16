<?php

session_start();

require_once '../../lib/php/db.php';
require_once '../../config/supplies.conf.php';
require_once '../internal/common.php';
require_once '../internal/product.php';

$db = new DB(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME, DB_DEBUG);

/**
 * Finds a product by it's code
 * Method: GET
 * Get: code*
 * Returns: the product (json)
 */

checkAuth();

$code = getParam('code');

echo json_encode(getProductByCode($code, $db));

?>
