<?php

session_start();

require_once '../../lib/php/db.php';
require_once '../../config/supplies.conf.php';

$db = new DB(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME);

/**
Move Item to a different bag
Method: POST
Get: itemId*
Post: bagId*, moveCount*
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
  echo 'Missing ïtem Id.';
  return;
}

if(!isSet($_POST['bagId'])){
  header('HTTP/1.1 400 Bad request');
  echo 'Missing bag Id.';
  return;
}

if(!isSet($_POST['moveCount']) || !($_POST['moveCount'])>0){
  header('HTTP/1.1 400 Bad request');
  echo 'Invalid value: move count.';
  return;
}

$itemId = $_GET['itemId'];
$bagId = $_POST['bagId'];
$moveCount = $_POST['moveCount'];

$items = $db->query("select * from Item where id=?", $itemId);

if(count($items)==0){
  header('HTTP/1.1 400 Bad request');
  echo 'Invalid item Id.';
  return;
}

if($moveCount>$items[0]['count']){
  header('HTTP/1.1 400 Bad request');
  echo 'Move count must be less than or equal to item count.';
  return;
}

$bags = $db->query("select * from Bag where id=?", $bagId);

if(count($bags)==0){
  header('HTTP/1.1 400 Bad request');
  echo 'Invalid bag.';
  return;
}

if($_SESSION['user']['id']!=$bags[0]['userId']){
  header('HTTP/1.1 403 Forbidden');
  echo 'Item does not belong to the current user.';
  return;
}

$srcItem = $items[0];

$expiration = $srcItem['expiration'];
if(!$expiration) $destItems = $db->query("select * from Item where productId=? and expiration is null and used=? and bagId=?", $srcItem['productId'], $srcItem['used'], $bagId);
else $destItems = $db->query("select * from Item where productId=? and expiration=? and used=? and bagId=?", $srcItem['productId'], $expiration, $srcItem['used'], $bagId);

if($srcItem['bagId']==$bagId) {
  header('HTTP/1.1 400 Bad request');
  echo 'Item is already in the bag.';
  return;
}

$db->execute("delete from Item where id=?", $srcItem['id']);
if(count($destItems)>0) $db->execute("delete from Item where id=?", $destItems[0]['id']);

$srcCount = $srcItem['count'];
$destCount = count($destItems)==0?0:$destItems[0]['count'];

$newSrcCount = $srcCount-$moveCount;
$newDestCount = $destCount+$moveCount;

if($newSrcCount>0) $db->insert("insert into Item(productId, expiration, used, count, bagId) values (?, ?, ?, ?, ?)", $srcItem['productId'], $expiration, $srcItem['used'], $newSrcCount, $srcItem['bagId']);
$db->insert("insert into Item(productId, expiration, used, count, bagId) values (?, ?, ?, ?, ?)", $srcItem['productId'], $expiration, $srcItem['used'], $newDestCount, $bagId);

// $db->execute("update Item set bagId=? where id=?", $_POST['bagId'], $_GET['itemId']);

?>
