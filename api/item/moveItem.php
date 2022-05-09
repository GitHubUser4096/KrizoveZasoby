<?php

session_start();

require_once '../../lib/php/db.php';
require_once '../../config/supplies.conf.php';
require_once '../internal/common.php';
require_once '../internal/bag.php';
require_once '../internal/item.php';

$db = new DB(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME, DB_DEBUG);

/**
Move Item to a different bag
Method: POST
Get: itemId*
Post: bagId*, moveCount*
**/

checkAuth();
checkPost();

$itemId = getParam('itemId');

$bagId = validate(['name'=>'bagId']);

$moveCount = validate(['name'=>'moveCount', 'type'=>'int', 'required'=>true, 'min'=>1]);

verifyBag($bagId, $db);

$item = verifyItem($itemId, $db);

if($moveCount>$item['count']){
  header('HTTP/1.1 400 Bad request');
  echo 'Move count must be less than or equal to item count.';
  exit;
}

$srcItem = $item;

$expiration = $srcItem['expiration'];
if(!$expiration) $destItems = $db->query("select * from Item where productId=? and expiration is null and used=? and bagId=?", $srcItem['productId'], $srcItem['used'], $bagId);
else $destItems = $db->query("select * from Item where productId=? and expiration=? and used=? and bagId=?", $srcItem['productId'], $expiration, $srcItem['used'], $bagId);

if($srcItem['bagId']==$bagId) {
  header('HTTP/1.1 400 Bad request');
  echo 'Item is already in the bag.';
  exit;
}

$db->execute("delete from Item where id=?", $srcItem['id']);
if(count($destItems)>0) $db->execute("delete from Item where id=?", $destItems[0]['id']);

$srcCount = $srcItem['count'];
$destCount = count($destItems)==0?0:$destItems[0]['count'];

$newSrcCount = $srcCount-$moveCount;
$newDestCount = $destCount+$moveCount;

if($newSrcCount>0) $db->insert("insert into Item(productId, expiration, used, count, bagId) values (?, ?, ?, ?, ?)", $srcItem['productId'], $expiration, $srcItem['used'], $newSrcCount, $srcItem['bagId']);
$newId = $db->insert("insert into Item(productId, expiration, used, count, bagId) values (?, ?, ?, ?, ?)", $srcItem['productId'], $expiration, $srcItem['used'], $newDestCount, $bagId);

echo json_encode(['id'=>$newId]);

?>
