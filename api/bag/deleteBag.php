<?php

session_start();

require_once '../../lib/php/db.php';
require_once '../../config/supplies.conf.php';
require_once '../internal/common.php';
require_once '../internal/bag.php';

$db = new DB(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME, DB_DEBUG);

/**
Delete Bag
Method: POST
Get: bagId*
**/

checkAuth();
checkPost();

$bagId = getParam('bagId');

verifyBag($bagId, $db);

$items = $db->query("select * from Item where bagId=? and not used", $bagId);

// TODO should this check be on backend?
if(count($items)>0){
  header('HTTP/1.1 400 Bad request');
  echo 'Bag is not empty!';
  exit;
}

$db->execute("delete from Item where bagId=?", $bagId); // TODO unnecessary with check above?
$db->execute("delete from Bag where id=?", $bagId);

?>
