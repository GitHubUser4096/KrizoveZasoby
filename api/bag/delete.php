<?php

session_start();

require_once '../../lib/php/db.php';
require_once '../../config/supplies.conf.php';

$db = new DB(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME);

/**
Delete Bag
Method: POST
Get: bagId*
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

$bagId = $_GET['bagId'];

$bags = $db->query("select * from Bag where id=?", $bagId);

if(count($bags)==0){
  header('HTTP/1.1 400 Bad request');
  echo 'Invalid bag.';
  return;
}

if($bags[0]['userId']!=$_SESSION['user']['id']){
  header('HTTP/1.1 400 Bad request');
  echo 'Bag is not owned by the current used.';
  return;
}

$items = $db->query("select * from Item where bagId=? and not used", $bagId);

if(count($items)>0){
  header('HTTP/1.1 500 Internal server error');
  echo 'Bag is not empty!';
  return;
}

$db->execute("delete from Item where bagId=?", $bagId);
$db->execute("delete from Bag where id=?", $bagId);

?>
