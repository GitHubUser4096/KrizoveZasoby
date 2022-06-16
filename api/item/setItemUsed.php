<?php

// TODO merge with setItemUnused? (changeUsedState - used: true/false)

session_start();

require_once '../../lib/php/db.php';
require_once '../../config/supplies.conf.php';
require_once '../internal/common.php';
require_once '../internal/item.php';

$db = new DB(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME, DB_DEBUG);

/**
* Sets item state to used
* Method: POST
* Get: itemId*
* Post: useCount*
**/

checkAuth();
checkPost();

$itemId = getParam('itemId');
$useCount = validate(['name'=>'useCount', 'type'=>'int', 'required'=>true, 'min'=>1]);

$item = verifyItem($itemId, $db);

if($useCount>$item['count']){
  header('HTTP/1.1 400 Bad request');
  echo 'Use count must be less than or equal to item count.';
  exit;
}

$unusedItem = $item;

$expiration = $unusedItem['expiration'] ? $unusedItem['expiration'] : null;
if(!$expiration) $usedItems = $db->query("select * from Item where bagId=? and productId=? and expiration is null and used=1", $unusedItem['bagId'], $unusedItem['productId']);
else $usedItems = $db->query("select * from Item where bagId=? and productId=? and expiration=? and used=1", $unusedItem['bagId'], $unusedItem['productId'], $expiration);

$db->execute("delete from Item where id=?", $unusedItem['id']);
if(count($usedItems)>0) $db->execute("delete from Item where id=?", $usedItems[0]['id']);

$unusedCount = $unusedItem['count'];
$usedCount = count($usedItems)==0?0:$usedItems[0]['count'];

$newUnusedCount = $unusedCount-$useCount;
$newUsedCount = $usedCount+$useCount;

if($newUnusedCount>0) $db->insert("insert into Item(bagId, productId, count, expiration, used) values (?, ?, ?, ?, 0)", $unusedItem['bagId'], $unusedItem['productId'], $newUnusedCount, $expiration);
$id = $db->insert("insert into Item(bagId, productId, count, expiration, used) values (?, ?, ?, ?, 1)", $unusedItem['bagId'], $unusedItem['productId'], $newUsedCount, $expiration);

echo json_encode(['id'=>$id]);

?>
