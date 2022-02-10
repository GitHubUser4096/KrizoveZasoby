<?php

session_start();

require_once '../../lib/php/db.php';
require_once '../../config/supplies.conf.php';

$db = new DB(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME);

/**
Delete Item
Method: POST
Get: itemId
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
  echo 'Item Id is not defined.';
  return;
}

$itemId = $_GET['itemId'];

$items = $db->query("select * from Item where id=?", $itemId);

if(count($items)==0){
  header('HTTP/1.1 400 Bad request');
  echo 'Invalid item.';
  return;
}

$bag = $db->query("select * from Bag where id=?", $items[0]['bagId'])[0];

if($_SESSION['user']['id']!=$bag['userId']){
  header('HTTP/1.1 403 Forbidden');
  echo 'Bag does not belong to the current user.';
  return;
}

$db->execute("delete from Item where id=?", $_GET['itemId']);

?>
