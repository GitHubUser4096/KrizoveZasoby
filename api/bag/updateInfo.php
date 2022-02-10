<?php

session_start();

require_once '../../lib/php/db.php';
require_once '../../config/supplies.conf.php';

$db = new DB(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME);

/**
Update Bag Info
Method: POST
Get: bagId*
Post: name*, description
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

if(!isSet($_POST['name']) || !$_POST['name']){
  header('HTTP/1.1 400 Bad request');
  echo 'Invalid name.';
  return;
}

$bagId = $_GET['bagId'];
$name = $_POST['name'];
$description = $_POST['description'];

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

$bags = $db->query("select * from Bag where userId=? and name=? and id!=?", $_SESSION['user']['id'], $name, $bagId);

if(count($bags)>0){
  header('HTTP/1.1 400 Bad request');
  echo 'Bag with this name already exists';
  return;
}

$db->execute("update Bag set name=?, description=? where id=?", $name, $description, $bagId);

?>
