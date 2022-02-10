<?php

session_start();

require_once '../lib/php/db.php';
require_once '../config/supplies.conf.php';

$db = new DB(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME);

if($_SERVER['REQUEST_METHOD']!=='POST'){
  header('HTTP/1.1 400 Bad request');
  return;
}

if(!filter_var($_POST['email'], FILTER_VALIDATE_EMAIL)) {
  echo json_encode(['success'=>false, 'message'=>'Nesprávný formát e-mailu!']);
  return;
}

$users = $db->query("select * from User where email=?", $_POST['email']);

if(count($users)>0){
  echo json_encode(['success'=>false, 'message'=>'Email již byl použit']);
  return;
}

$passwordHash = password_hash($_POST['password'], PASSWORD_DEFAULT);

$userId = $db->insert("insert into User(email, password) values (?, ?)", $_POST['email'], $passwordHash);

$_SESSION['user'] = ['id'=>$userId, 'email'=>$_POST['email'], 'password'=>$passwordHash];

echo json_encode(['success'=>true]);
return;

?>
