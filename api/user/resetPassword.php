<?php

session_start();

require_once '../../lib/php/db.php';
require_once '../../config/supplies.conf.php';
require_once '../internal/common.php';

$db = new DB(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME, DB_DEBUG);

// check post, check whether code and password are included
checkPost();

if(!isSet($_POST['email'])){
  header('HTTP/1.1 400 Bad request');
  echo 'E-mail is not defined.';
  exit;
}

if(!isSet($_POST['code'])){
  header('HTTP/1.1 400 Bad request');
  echo 'Code is not defined.';
  exit;
}

if(!isSet($_POST['password'])){
  header('HTTP/1.1 400 Bad request');
  echo 'Password is not defined.';
  exit;
}

// check whether code exists, email matches and code is not expired
$requests = $db->query("select * from ResetPasswordRequests where code=?", $_POST['code']);

if(count($requests)==0){
  header('HTTP/1.1 400 Bad request');
  echo 'Neplatný kód!';
  exit;
}

$request = $requests[0];

$users = $db->query("select * from User where id=?", $request['userId']);

if(count($users)==0){
  header('HTTP/1.1 400 Bad request');
  echo 'Unexpected error: user not found!';
  exit;
}

if($users[0]['email']!=$_POST['email']){
  header('HTTP/1.1 400 Bad request');
  echo 'Neplatný e-mail!';
  exit;
}

$expires = strtotime($request['expires']);

if(strtotime('now')>$expires){
  header('HTTP/1.1 400 Bad request');
  echo 'Platnost kódu vypršela!';
  exit;
}

// check new (TODO globalize)
if(strlen(trim($_POST['password']))<=4){
  header('HTTP/1.1 400 Bad request');
  echo 'Nové heslo musí být delší než 4 znaky.';
  exit;
}

// update password (TODO globalize)
$passwordHash = password_hash($_POST['password'], PASSWORD_DEFAULT);

$db->execute("update User set password=? where id=?", $passwordHash, $request['userId']);

// delete request DB entry
$db->execute("delete from ResetPasswordRequests where id=?", $request['id']);

// log the user in

// TODO globalize this
$user = [
  'id'=>$users[0]['id'],
  'email'=>$users[0]['email'],
  'userRole'=>$users[0]['userRole']
];

$_SESSION['user'] = $user;

?>