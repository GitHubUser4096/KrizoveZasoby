<?php

session_start();

require_once '../../lib/php/db.php';
require_once '../../config/supplies.conf.php';

$db = new DB(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME);

/**
Sets item state to not used
Method: POST
Get: itemId*
Post: unuseCount*
**/

if(!isSet($_SESSION['user'])){
  header('HTTP/1.1 403 Forbidden');
  echo 'Not logged in.';
  return;
}

if($_SERVER['REQUEST_METHOD']!=='POST'){
  header('HTTP/1.1 400 Bad request');
  echo 'Method must be post.';
  return;
}

if(!isSet($_GET['itemId'])){
  header('HTTP/1.1 400 Bad request');
  echo 'Missing item Id.';
  return;
}

if(!isSet($_POST['unuseCount'])){
  header('HTTP/1.1 400 Bad request');
  echo 'Missing unuse count.';
  return;
}

$itemId = $_GET['itemId'];
$unuseCount = $_POST['unuseCount'];

$items = $db->query("select * from Item where id=?", $itemId);

if(count($items)==0){
  header('HTTP/1.1 400 Bad request');
  echo 'Invalid item Id.';
  return;
}

if($unuseCount>$items[0]['count']){
  header('HTTP/1.1 400 Bad request');
  echo 'Unuse count must be less than or equal to item count.';
  return;
}

$bag = $db->query("select * from Bag where id=?", $items[0]['bagId'])[0];

if($_SESSION['user']['id']!=$bag['userId']){
  header('HTTP/1.1 403 Forbidden');
  echo 'Item does not belong to the current user.';
  return;
}

$usedItem = $items[0];

$expiration = $usedItem['expiration'] ? $usedItem['expiration'] : null;

if(!$expiration) $unusedItems = $db->query("select * from Item where bagId=? and productId=? and expiration is null and used=0", $usedItem['bagId'], $usedItem['productId']);
else $unusedItems = $db->query("select * from Item where bagId=? and productId=? and expiration=? and used=0", $usedItem['bagId'], $usedItem['productId'], $expiration);

$db->execute('delete from Item where id=?', $usedItem['id']);
if(count($unusedItems)>0) $db->execute('delete from Item where id=?', $unusedItems[0]['id']);

$usedCount = $usedItem['count'];
$unusedCount = count($unusedItems)==0?0:$unusedItems[0]['count'];

$newUnusedCount = $unusedCount+$unuseCount;
$newUsedCount = $usedCount-$unuseCount;

$db->insert("insert into Item(bagId, productId, count, expiration, used) values (?, ?, ?, ?, 0)", $usedItem['bagId'], $usedItem['productId'], $newUnusedCount, $expiration);
if($newUsedCount>0) $db->insert("insert into Item(bagId, productId, count, expiration, used) values (?, ?, ?, ?, 1)", $usedItem['bagId'], $usedItem['productId'], $newUsedCount, $expiration);

// $item = $db->query("select * from Item where id=?", $_GET['itemId'])[0];
//
// if(!$item['used']) return;
//
// $unusedItems = $db->query("select * from Item where bagId=? and productId=? and expiration=? and used=0", $item['bagId'], $item['productId'], $item['expiration']);
//
// $unuseCount = $_POST['unuseCount'];
//
// if(count($unusedItems)>0){
//   $id = $unusedItems[0]['id'];
//   $newCount = $item['count']+$unusedItems[0]['count'];
//   $db->execute("update Item set count=? where id=?", $newCount, $id);
//   $db->execute("delete from Item where id=?", $_GET['itemId']);
// } else {
//
//   if($unuseCount==$unusedItems[0]['count']){
//     $db->execute("update Item set used=0 where id=?", $_GET['itemId']);
//   } else {
//     $remCount = $unusedItems[0]['count']-$unuseCount;
//     $db->execute("update Item set count=? used=0 where id=?", $unuseCount, $_GET['itemId']);
//   }
//
// }

?>
