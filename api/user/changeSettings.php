<?php

/**
This file saves user settings from the settings dialog
**/

session_start();

require_once '../../lib/php/db.php';
require_once '../../config/supplies.conf.php';
require_once '../internal/getConfig.php';
require_once '../internal/common.php';

$db = new DB(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME, DB_DEBUG);

checkAuth();
checkPost();

// TODO use common validation? - format is specific and cannot be checked by validate()

// date format

if(!isSet($_POST['dateFormat'])){
  header('HTTP/1.1 400 Bad request');
  echo 'Missing value dateFormat.';
  exit;
}

if($_POST['dateFormat']!='Y-m-d' && $_POST['dateFormat']!='d. m. Y'){
  header('HTTP/1.1 400 Bad request');
  echo 'Invalid value dateFormat.';
  exit;
}

// states

if(!isSet($_POST['criticalTime'])){
  header('HTTP/1.1 400 Bad request');
  echo 'Missing value criticalTime.';
  exit;
}

if(!isSet($_POST['warnTime'])){
  header('HTTP/1.1 400 Bad request');
  echo 'Missing value warnTime.';
  exit;
}

if(!isSet($_POST['recommendedTime'])){
  header('HTTP/1.1 400 Bad request');
  echo 'Missing value recommendedTime.';
  exit;
}

// check length

if(strlen($_POST['criticalTime'])>16){
  header('HTTP/1.1 400 Bad request');
  echo 'Value too long: criticalTime.';
  exit;
}

if(strlen($_POST['warnTime'])>16){
  header('HTTP/1.1 400 Bad request');
  echo 'Value too long: warnTime.';
  exit;
}

if(strlen($_POST['recommendedTime'])>16){
  header('HTTP/1.1 400 Bad request');
  echo 'Value too long: recommendedTime.';
  exit;
}

// make sure values can be parsed as time

$criticalTime = strtotime($_POST['criticalTime']);
$warnTime = strtotime($_POST['warnTime']);
$recommendedTime = strtotime($_POST['recommendedTime']);
$now = strtotime('now');

if(!$criticalTime){
  header('HTTP/1.1 400 Bad request');
  echo 'Invalid value criticalTime.';
  exit;
}

if(!$warnTime){
  header('HTTP/1.1 400 Bad request');
  echo 'Invalid value warnTime.';
  exit;
}

if(!$recommendedTime){
  header('HTTP/1.1 400 Bad request');
  echo 'Invalid value recommendedTime.';
  exit;
}

// make sure values are positive

// TODO values can still theoretically be absolute (can this be prevented?)

if($criticalTime<=$now){
  header('HTTP/1.1 400 Bad request');
  echo 'Value too low: criticalTime.';
  exit;
}

if($warnTime<=$now){
  header('HTTP/1.1 400 Bad request');
  echo 'Value too low: warnTime.';
  exit;
}

if($recommendedTime<=$now){
  header('HTTP/1.1 400 Bad request');
  echo 'Value too low: recommendedTime.';
  exit;
}

// verify they are in correct order

if($criticalTime>=$warnTime){
  header('HTTP/1.1 400 Bad request');
  echo 'criticalTime must be less than warnTime';
  exit;
}

if($criticalTime>=$recommendedTime){
  header('HTTP/1.1 400 Bad request');
  echo 'criticalTime must be less than recommendedTime';
  exit;
}

if($warnTime>=$recommendedTime){
  header('HTTP/1.1 400 Bad request');
  echo 'warnTime must be less than recommendedTime';
  exit;
}

$db->execute("update Config set criticalTime=?, warnTime=?, recommendedTime=?, dateFormat=? where userId=?",
    $_POST['criticalTime'], $_POST['warnTime'], $_POST['recommendedTime'], $_POST['dateFormat'], $_SESSION['user']['id']);

?>
