<?php

session_start();

require_once '../../lib/php/db.php';
require_once '../../config/supplies.conf.php';
require_once '../internal/common.php';

$db = new DB(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME, DB_DEBUG);

checkAuth();
checkRole('admin');

$users = $db->query("select * from User");
$res = [];

foreach($users as $user){

  // make sure password hash is not leaked
  $res[] = [
    'id'=>$user['id'],
    'email'=>$user['email'],
    'userRole'=>$user['userRole'],
  ];

}

echo json_encode($res);

?>