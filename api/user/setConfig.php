<?php

session_start();

require_once '../../lib/php/db.php';
require_once '../../config/supplies.conf.php';
require_once '../internal/getConfig.php';
require_once '../internal/common.php';

$db = new DB(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME, DB_DEBUG);

/**
* Changes one or more specific user configuration values (itemDisplay or sort)
**/

checkAuth();
checkPost();

if(isSet($_POST['itemDisplay'])){

  if($_POST['itemDisplay']!='brandFirst' && $_POST['itemDisplay']!='typeFirst'){
    header('HTTP/1.1 400 Bad request');
    echo 'Invalid format: itemDisplay.';
    exit;
  }

  $db->execute("update Config set itemDisplay=? where userId=?", $_POST['itemDisplay'], $_SESSION['user']['id']);

}

if(isSet($_POST['sort'])){

  if($_POST['sort']!='date' && $_POST['sort']!='name'){
    header('HTTP/1.1 400 Bad request');
    echo 'Invalid format: sort.';
    exit;
  }

  $db->execute("update Config set sort=? where userId=?", $_POST['sort'], $_SESSION['user']['id']);

}

?>
