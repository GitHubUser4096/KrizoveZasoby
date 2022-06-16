<?php

// TODO merge with setItemUsed? (changeUsedState - used: true/false)

session_start();

require_once '../../lib/php/db.php';
require_once '../../config/supplies.conf.php';
require_once '../internal/common.php';
require_once '../internal/item.php';

$db = new DB(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME, DB_DEBUG);

/**
* Sets item state to not used
* Method: POST
* Get: itemId*
* Post: unuseCount*
**/

checkAuth();
checkPost();

$itemId = getParam('itemId');
$unuseCount = validate(['name'=>'unuseCount', 'type'=>'int', 'required'=>true, 'min'=>1]);

$item = verifyItem($itemId, $db);

if($unuseCount>$item['count']){
  header('HTTP/1.1 400 Bad request');
  echo 'Unuse count must be less than or equal to item count.';
  exit;
}

$usedItem = $item;

$expiration = $usedItem['expiration'] ? $usedItem['expiration'] : null;

if(!$expiration) $unusedItems = $db->query("select * from Item where bagId=? and productId=? and expiration is null and used=0", $usedItem['bagId'], $usedItem['productId']);
else $unusedItems = $db->query("select * from Item where bagId=? and productId=? and expiration=? and used=0", $usedItem['bagId'], $usedItem['productId'], $expiration);

$db->execute('delete from Item where id=?', $usedItem['id']);
if(count($unusedItems)>0) $db->execute('delete from Item where id=?', $unusedItems[0]['id']);

$usedCount = $usedItem['count'];
$unusedCount = count($unusedItems)==0?0:$unusedItems[0]['count'];

$newUnusedCount = $unusedCount+$unuseCount;
$newUsedCount = $usedCount-$unuseCount;

$id = $db->insert("insert into Item(bagId, productId, count, expiration, used) values (?, ?, ?, ?, 0)", $usedItem['bagId'], $usedItem['productId'], $newUnusedCount, $expiration);
if($newUsedCount>0) $db->insert("insert into Item(bagId, productId, count, expiration, used) values (?, ?, ?, ?, 1)", $usedItem['bagId'], $usedItem['productId'], $newUsedCount, $expiration);

echo json_encode(['id'=>$id]);

?>
