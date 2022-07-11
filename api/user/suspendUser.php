<?php

session_start();

require_once '../../lib/php/db.php';
require_once '../../config/supplies.conf.php';
require_once '../internal/common.php';

$db = new DB(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME, DB_DEBUG);

checkAuth();
checkPost();
checkRole('editor');

$userId = getParam('userId');

if($userId==$_SESSION['user']['id']){
  fail('400 Bad request', 'Suspending yourself is not allowed!');
}

$users = $db->query("select * from User where id=?", $userId);
if(count($users)==0){
  fail('400 Bad request', 'User does not exist');
}

$db->execute("update User set userRole='viewer' where id=?", $userId);

?>