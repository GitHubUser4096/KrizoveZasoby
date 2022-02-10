<?php

session_start();

require_once '../../lib/php/db.php';
require_once '../../config/supplies.conf.php';

$db = new DB(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME);

/**
Create Bag
Method: POST
Post: name*
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

if(!isSet($_POST['name'])){
  header('HTTP/1.1 400 Bad request');
  echo 'Missing value: name';
  return;
}

$bags = $db->query("select * from Bag where userId=? and name=?", $_SESSION['user']['id'], $_POST['name']);

if(count($bags)>0){
  header('HTTP/1.1 400 Bad request');
  echo 'Bag with this name already exists';
  return;
}

$bagId = $db->insert("insert into Bag(name, userId) values (?, ?)", $_POST['name'], $_SESSION['user']['id']);

echo json_encode(['id'=>$bagId]);

?>
