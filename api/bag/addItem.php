<?php

session_start();

require_once '../../lib/php/db.php';
require_once '../../config/supplies.conf.php';

$db = new DB(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME);

/**
Add Item
Method: POST
Get: bagId*
Post: productId*, count*, expiration*
Returns: id (json)
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

if(!isSet($_GET['bagId'])){
  header('HTTP/1.1 400 Bad request');
  echo 'Bag Id is not defined.';
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

if(!isSet($_POST['productId'])){
  header('HTTP/1.1 400 Bad request');
  echo 'Missing product Id.';
  return;
}

$bagId = $_GET['bagId'];
$productId = $_POST['productId'];
$count = $_POST['count'];
$expiration = $_POST['expiration'] ? $_POST['expiration'] : null;

$bags = $db->query("select * from Bag where id=?", $bagId);

if(count($bags)==0){
  header('HTTP/1.1 400 Bad request');
  echo 'Invalid bag.';
  return;
}

if($_SESSION['user']['id']!=$bags[0]['userId']){
  header('HTTP/1.1 403 Forbidden');
  echo 'Bag does not belong to the current user.';
  return;
}

$products = $db->query("select * from Product where id=?", $productId);

if(count($products)==0){
  header('HTTP/1.1 400 Bad request');
  echo 'Invalid product.';
  return;
}

if(!$expiration) $items = $db->query("select * from Item where bagId=? and productId=? and expiration is null and used=0", $bagId, $productId);
else $items = $db->query("select * from Item where bagId=? and productId=? and expiration=? and used=0", $bagId, $productId, $expiration);

if(count($items)>0){
  $newCount = $items[0]['count']+$count;
  $db->execute("update Item set count=? where id=?", $newCount, $items[0]['id']);
  echo json_encode(['id'=>$items[0]['id']]);
  return;
}

$itemId = $db->insert("insert into Item(bagId, productId, count, expiration) values (?, ?, ?, ?)", $bagId, $productId, $count, $expiration);

echo json_encode(['id'=>$itemId]);

?>
