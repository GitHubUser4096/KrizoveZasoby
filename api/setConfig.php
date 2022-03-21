<?php

/**
This file changes one or more specific user configuration values (itemDisplay or sort)
**/

session_start();

require_once '../lib/php/db.php';
require_once '../config/supplies.conf.php';
require_once 'internal/getConfig.php';

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

if(isSet($_POST['itemDisplay'])){
  $db->execute("update Config set itemDisplay=? where userId=?", $_POST['itemDisplay'], $_SESSION['user']['id']);
}

if(isSet($_POST['sort'])){
  $db->execute("update Config set sort=? where userId=?", $_POST['sort'], $_SESSION['user']['id']);
}

?>
