<?php

session_start();

require_once '../../lib/php/db.php';
require_once '../../config/supplies.conf.php';

$db = new DB(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME);

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

if($_SESSION['user']['id']!=$bags[0]['userId']){
  header('HTTP/1.1 403 Forbidden');
  echo 'Bag does not belong to the current user.';
  return;
}

$db->execute("update Bag set handedOut=false where id=?", $bagId);

?>
