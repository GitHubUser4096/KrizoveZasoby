<?php

session_start();

require_once '../../lib/php/db.php';
require_once '../../config/supplies.conf.php';
require_once '../internal/common.php';

$db = new DB(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME, DB_DEBUG);

checkPost();

// TODO common verification? (including e-mail format)

if(!isSet($_POST['email'])){
  header('HTTP/1.1 400 Bad request');
  echo 'Prosím zadejte e-mail!';
  exit;
}

if(!isSet($_POST['password'])){
  header('HTTP/1.1 400 Bad request');
  echo 'Prosím zadejte heslo!';
  exit;
}

if(!filter_var($_POST['email'], FILTER_VALIDATE_EMAIL)) {
  header('HTTP/1.1 400 Bad request');
  echo 'Nesprávný formát e-mailu!';
  exit;
}

$users = $db->query("select * from User where email=?", $_POST['email']);

if(count($users)>0){
  header('HTTP/1.1 400 Bad request');
  echo 'Email již byl použit!';
  exit;
}

// TODO common verify - make new password verify function?

if(strlen(trim($_POST['password']))<=4){
  header('HTTP/1.1 400 Bad request');
  echo 'Heslo musí být delší než 4 znaky!';
  exit;
}

$passwordHash = password_hash($_POST['password'], PASSWORD_DEFAULT);

$userId = $db->insert("insert into User(email, password) values (?, ?)", $_POST['email'], $passwordHash);

$_SESSION['user'] = ['id'=>$userId, 'email'=>$_POST['email']];

echo json_encode(['success'=>true]);

?>
