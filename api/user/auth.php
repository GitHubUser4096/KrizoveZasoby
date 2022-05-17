<?php

session_start();

require_once '../../lib/php/db.php';
require_once '../../config/supplies.conf.php';

$db = new DB(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME, DB_DEBUG);

if($_SERVER['REQUEST_METHOD']==='POST'){

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

  // TODO make sure user is not disabled (sorry, I know it sounds bad)

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

echo json_encode(['loggedIn'=>false]); // TODO should this return loggedIn=false or HTTP error? - keep it this way to avoid reauth request when pressing login

// header('HTTP/1.1 401 Unauthorized');
// echo 'Not authorized!';
// exit;

?>
