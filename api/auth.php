<?php

session_start();

require_once '../lib/php/db.php';
require_once '../config/supplies.conf.php';

$db = new DB(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME);

if($_SERVER['REQUEST_METHOD']==='POST'){

  if(!isSet($_POST['email'])){
    echo json_encode(['loggedIn'=>false, 'message'=>'Prosím zadejte e-mail.']);
    return;
  }

  if(!isSet($_POST['password'])){
    echo json_encode(['loggedIn'=>false, 'message'=>'Prosím zadejte heslo.']);
    return;
  }

  $users = $db->query("select * from User where email=?", $_POST['email']);

  if(count($users)==0){
    echo json_encode(['loggedIn'=>false, 'message'=>'Neplatný e-mail nebo heslo']);
    return;
  }

  if(!password_verify($_POST['password'], $users[0]['password'])){
    echo json_encode(['loggedIn'=>false, 'message'=>'Neplatný e-mail nebo heslo']);
    return;
  }

  $_SESSION['user'] = $users[0];

  unset($_SESSION['user']['password']);

  echo json_encode(['loggedIn'=>true, 'user'=>$_SESSION['user']]);
  return;

}

if(isSet($_SESSION['user'])){
  echo json_encode(['loggedIn'=>true, 'user'=>$_SESSION['user']]);
  return;
}

echo json_encode(['loggedIn'=>false]);

?>
