<?php

session_start();

require_once '../../lib/php/db.php';
require_once '../../config/supplies.conf.php';
require_once '../internal/common.php';
require_once '../internal/item.php';

$db = new DB(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME, DB_DEBUG);

/**
Delete Item
Method: POST
Get: itemId
**/

checkAuth();
checkPost();

$itemId = getParam('itemId');

verifyItem($itemId, $db);

$db->execute("delete from Item where id=?", $itemId);

?>
