<?php

session_start();

require_once '../../lib/php/db.php';
require_once '../../config/supplies.conf.php';

$db = new DB(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME);

/**
Sets item state to used
Method: POST
Get: itemId*
Post: useCount*
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

if(!isSet($_POST['useCount'])){
  header('HTTP/1.1 400 Bad request');
  echo 'Missing use count.';
  return;
}

$itemId = $_GET['itemId'];
$useCount = $_POST['useCount'];

$items = $db->query("select * from Item where id=?", $itemId);

if(count($items)==0){
  header('HTTP/1.1 400 Bad request');
  echo 'Invalid item Id.';
  return;
}

if($useCount>$items[0]['count']){
  header('HTTP/1.1 400 Bad request');
  echo 'Use count must be less than or equal to item count.';
  return;
}

$bag = $db->query("select * from Bag where id=?", $items[0]['bagId'])[0];

if($_SESSION['user']['id']!=$bag['userId']){
  header('HTTP/1.1 403 Forbidden');
  echo 'Item does not belong to the current user.';
  return;
}

$unusedItem = $items[0];

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
$db->insert("insert into Item(bagId, productId, count, expiration, used) values (?, ?, ?, ?, 1)", $unusedItem['bagId'], $unusedItem['productId'], $newUsedCount, $expiration);

// $item = $db->query("select * from Item where id=?", $_GET['itemId'])[0];
//
// if($item['used']) return;
//
// $usedCount = $_POST['useCount'];
//
// if($usedCount<=0) return;
// if($usedCount>$item['count']) return;
//
// $usedItems = $db->query("select * from Item where bagId=? and productId=? and expiration=? and used=1", $item['bagId'], $item['productId'], $item['expiration']);
//
// if($usedCount==$item['count']){
//   if(count($usedItems)>0){
//     $id = $usedItems[0]['id'];
//     $newUsedCount = $usedCount+$usedItems[0]['count'];
//     $db->execute("update Item set count=? where id=?", $newUsedCount, $id);
//     $db->execute("delete from Item where id=?", $_GET['itemId']);
//   } else {
//     $db->execute("update Item set used=1 where id=?", $_GET['itemId']);
//   }
//   return;
// }
//
// $remCount = $item['count']-$usedCount;
//
// $db->execute("update Item set count=? where id=?", $remCount, $_GET['itemId']);
//
// if(count($usedItems)>0){
//   $id = $usedItems[0]['id'];
//   $newUsedCount = $usedCount+$usedItems[0]['count'];
//   $db->execute("update Item set count=? where id=?", $newUsedCount, $id);
// } else {
//   $db->insert("insert into Item(bagId, productId, count, expiration, used) values (?, ?, ?, ?, 1)", $item['bagId'], $item['productId'], $usedCount, $item['expiration']);
// }

?>
