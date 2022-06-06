<?php

session_start();

require_once '../../lib/php/db.php';
require_once '../../config/supplies.conf.php';
require_once '../../lib/php/formatDateDiff.php';
require_once '../internal/getConfig.php';
require_once '../internal/common.php';
require_once '../internal/bag.php';
require_once '../internal/item.php';
require_once '../internal/product.php';

$db = new DB(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME, DB_DEBUG);

/**
Returns item by id as json
Method: GET
Get: itemId*
Returns: item (json)
**/

checkAuth();

$itemId = getParam('itemId');

verifyItem($itemId, $db);

echo json_encode(getItemById($itemId, $db));

?>
