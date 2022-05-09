<?php

session_start();

require_once '../../lib/php/db.php';
require_once '../../config/supplies.conf.php';
require_once '../internal/common.php';
require_once '../internal/bag.php';

$db = new DB(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME, DB_DEBUG);

checkAuth();
checkPost();

$bagId = getParam('bagId');

verifyBag($bagId, $db);

$db->execute("update Bag set donated=true, donatedDate=now() where id=?", $bagId);

?>
