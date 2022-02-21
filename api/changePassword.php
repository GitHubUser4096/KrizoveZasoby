<?php

session_start();

require_once '../lib/php/db.php';
require_once '../config/supplies.conf.php';

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

if(!isSet($_POST['password'])){
  header('HTTP/1.1 400 Bad request');
  echo 'Password is not defined.';
  return;
}

if(strlen(trim($_POST['password']))<=4){
  header('HTTP/1.1 400 Bad request');
  echo 'Heslo musí být delší než 4 znaky.';
  return;
}

$passwordHash = password_hash($_POST['password'], PASSWORD_DEFAULT);

$db->execute("update User set password=? where id=?", $passwordHash, $_SESSION['user']['id']);

echo 'success';

?>
