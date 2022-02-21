<?php

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

if(!isSet($_POST['criticalTime'])){
  header('HTTP/1.1 400 Bad request');
  echo 'Missing value criticalTime.';
  return;
}

if(!isSet($_POST['warnTime'])){
  header('HTTP/1.1 400 Bad request');
  echo 'Missing value warnTime.';
  return;
}

if(!isSet($_POST['recommendedTime'])){
  header('HTTP/1.1 400 Bad request');
  echo 'Missing value recommendedTime.';
  return;
}

if(!isSet($_POST['dateFormat'])){
  header('HTTP/1.1 400 Bad request');
  echo 'Missing value dateFormat.';
  return;
}

$criticalTime = strtotime($_POST['criticalTime']);
$warnTime = strtotime($_POST['warnTime']);
$recommendedTime = strtotime($_POST['recommendedTime']);

if(!$criticalTime){
  header('HTTP/1.1 400 Bad request');
  echo 'Invalid value criticalTime.';
  return;
}

if(!$warnTime){
  header('HTTP/1.1 400 Bad request');
  echo 'Invalid value warnTime.';
  return;
}

if(!$recommendedTime){
  header('HTTP/1.1 400 Bad request');
  echo 'Invalid value recommendedTime.';
  return;
}

if($criticalTime>=$warnTime){
  header('HTTP/1.1 400 Bad request');
  echo 'criticalTime must be less than warnTime';
  return;
}

if($criticalTime>=$recommendedTime){
  header('HTTP/1.1 400 Bad request');
  echo 'criticalTime must be less than recommendedTime';
  return;
}

if($warnTime>=$recommendedTime){
  header('HTTP/1.1 400 Bad request');
  echo 'warnTime must be less than recommendedTime';
  return;
}

$configs = $db->query("select * from Config where userId=?", $userId);

$confMap = [];

foreach($configs as $config){
  $confMap[$config['name']] = $config;
}

if(isSet($confMap['criticalTime'])) $db->execute('update Config set value=? where id=?', $_POST['criticalTime'], $confMap['criticalTime']['id']);
else $db->execute('insert into Config(userId, name, value) values (?, ?, ?)', $_SESSION['user']['id'], 'criticalTime', $_POST['criticalTime']);

if(isSet($confMap['warnTime'])) $db->execute('update Config set value=? where id=?', $_POST['warnTime'], $confMap['warnTime']['id']);
else $db->execute('insert into Config(userId, name, value) values (?, ?, ?)', $_SESSION['user']['id'], 'warnTime', $_POST['warnTime']);

if(isSet($confMap['recommendedTime'])) $db->execute('update Config set value=? where id=?', $_POST['recommendedTime'], $confMap['recommendedTime']['id']);
else $db->execute('insert into Config(userId, name, value) values (?, ?, ?)', $_SESSION['user']['id'], 'recommendedTime', $_POST['recommendedTime']);

if(isSet($confMap['dateFormat'])) $db->execute('update Config set value=? where id=?', $_POST['dateFormat'], $confMap['dateFormat']['id']);
else $db->execute('insert into Config(userId, name, value) values (?, ?, ?)', $_SESSION['user']['id'], 'dateFormat', $_POST['dateFormat']);

?>
