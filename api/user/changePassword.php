<?php

session_start();

require_once '../../lib/php/db.php';
require_once '../../config/supplies.conf.php';
require_once '../internal/common.php';

$db = new DB(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME, DB_DEBUG);

checkAuth();
checkPost();

// TODO common verify - make new password verify function?

// TODO verify (including min length, max(?) length)
if(!isSet($_POST['currentPassword'])){
  header('HTTP/1.1 400 Bad request');
  echo 'Current password is not defined.';
  exit;
}

if(!isSet($_POST['newPassword'])){
  header('HTTP/1.1 400 Bad request');
  echo 'New password is not defined.';
  exit;
}

$users = $db->query("select * from User where id=?", $_SESSION['user']['id']);

if(!password_verify($_POST['currentPassword'], $users[0]['password'])){
  header('HTTP/1.1 400 Bad request');
  echo 'Neplatné aktuální heslo!';
  exit;
}

if(strlen(trim($_POST['newPassword']))<=4){
  header('HTTP/1.1 400 Bad request');
  echo 'Nové heslo musí být delší než 4 znaky.';
  exit;
}

$passwordHash = password_hash($_POST['newPassword'], PASSWORD_DEFAULT);

$db->execute("update User set password=? where id=?", $passwordHash, $_SESSION['user']['id']);

echo 'success';

?>
