<?php

session_start();

require_once '../../lib/php/db.php';
require_once '../../config/supplies.conf.php';

$db = new DB(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME, DB_DEBUG);

if($_SERVER['REQUEST_METHOD']==='POST'){

  // TODO use common fail()?
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

  $users = $db->query("select * from User where email=?", $_POST['email']);

  if(count($users)==0){
    header('HTTP/1.1 400 Bad request');
    echo 'Neplatný e-mail nebo heslo!';
    exit;
  }

  if(!password_verify($_POST['password'], $users[0]['password'])){
    header('HTTP/1.1 400 Bad request');
    echo 'Neplatný e-mail nebo heslo!';
    exit;
  }

  if($users[0]['userRole']=='disabled'){
    header('HTTP/1.1 400 Bad request');
    echo 'Účet je zablokován!';
    exit;
  }

  // dealing with sensitive data, make sure only necessary info is sent
  $user = [
    'id'=>$users[0]['id'],
    'email'=>$users[0]['email'],
    'userRole'=>$users[0]['userRole']
  ];

  $_SESSION['user'] = $user;

  echo json_encode(['loggedIn'=>true, 'user'=>$user]);
  return;

}

if(isSet($_SESSION['user'])){
  $users = $db->query("select * from User where id=?", $_SESSION['user']['id']);
  // dealing with sensitive data, make sure only necessary info is sent
  $user = [
    'id'=>$users[0]['id'],
    'email'=>$users[0]['email'],
    'userRole'=>$users[0]['userRole']
  ];
  $_SESSION['user'] = $user;
  echo json_encode(['loggedIn'=>true, 'user'=>$user]);
  return;
}

// return loggedIn=false instead of HTTP error to avoid reauth request on frontend
echo json_encode(['loggedIn'=>false]);

?>
