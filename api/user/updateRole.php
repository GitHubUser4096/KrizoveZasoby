<?php

session_start();

require_once '../../lib/php/db.php';
require_once '../../config/supplies.conf.php';
require_once '../internal/common.php';

$db = new DB(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME, DB_DEBUG);

checkAuth();
checkPost();
checkRole('admin');

$userId = getParam('userId');

if(!isSet($_POST['userRole'])){
  fail('400 Bad request', 'userRole is missing');
}

// $userRole = $_POST['userRole'];
$userRole = validate(['name'=>'userRole', 'required'=>true, 'enum'=>['disabled', 'viewer', 'contributor', 'editor', 'admin']]);

$users = $db->query("select * from User where id=?", $userId);
if(count($users)==0){
  fail('400 Bad request', 'User does not exist');
}

$db->execute("update User set userRole=? where id=?", $userRole, $userId);

?>