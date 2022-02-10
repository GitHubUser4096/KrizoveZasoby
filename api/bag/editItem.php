<?php

session_start();

require_once '../../lib/php/db.php';
require_once '../../config/supplies.conf.php';

$db = new DB(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME);

/**
Edit Item
Method: POST
Get: itemId*
Post: count*, expiration*
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
  echo 'Item id is not defined.';
  return;
}

if(!isSet($_POST['count']) || !($_POST['count']>0)){
  header('HTTP/1.1 400 Bad request');
  echo 'Invalid value: count';
  return;
}

// if(!isSet($_POST['expiration']) || !strtotime($_POST['expiration']) || strtotime($_POST['expiration'])<strtotime('2000-01-01')){
//   header('HTTP/1.1 400 Bad request');
//   echo 'Invalid value: expiration date.';
//   return;
// }

if($_POST['expiration'] && (!strtotime($_POST['expiration']) || strtotime($_POST['expiration'])<strtotime('2000-01-01'))){
  header('HTTP/1.1 400 Bad request');
  echo 'Invalid value: expiration date.';
  return;
}

$itemId = $_GET['itemId'];
$count = $_POST['count'];
$expiration = $_POST['expiration'] ? $_POST['expiration'] : null;

$items = $db->query("select * from Item where id=?", $itemId);

if(count($items)==0){
  header('HTTP/1.1 400 Bad request');
  echo 'Item does not exist.';
  return;
}

$item = $items[0];

$bag = $db->query("select * from Bag where id=?", $item['bagId'])[0];

if($_SESSION['user']['id']!=$bag['userId']){
  header('HTTP/1.1 403 Forbidden');
  echo 'Bag does not belong to the current user.';
  return;
}

if(!$expiration) $otherItems = $db->query("select * from Item where bagId=? and productId=? and expiration is null and used=? and id!=?", $item['bagId'], $item['productId'], $item['used'], $itemId);
else $otherItems = $db->query("select * from Item where bagId=? and productId=? and expiration=? and used=? and id!=?", $item['bagId'], $item['productId'], $expiration, $item['used'], $itemId);

if(count($otherItems)>0){
  $newCount = $otherItems[0]['count']+$count;
  $db->execute("update Item set count=? where id=?", $newCount, $otherItems[0]['id']);
  $db->execute("delete from Item where id=?", $itemId);
  return;
}

$db->execute("update Item set count=?, expiration=? where id=?", $count, $expiration, $itemId);

?>
