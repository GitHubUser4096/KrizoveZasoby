<?php

session_start();

require_once '../../lib/php/db.php';
require_once '../../config/supplies.conf.php';
require_once '../internal/common.php';
require_once '../internal/bag.php';

$db = new DB(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME, DB_DEBUG);

/**
Update Bag Info
Method: POST
Get: bagId*
Post: name*, description
Returns: id (json)
**/

checkAuth();
checkPost();

$bagId = getParam('bagId');
$name = validate(['name'=>'name', 'required'=>true, 'maxLength'=>64]);
$description = validate(['name'=>'description', 'maxLength'=>1024]);

verifyBag($bagId, $db);

$bags = $db->query("select * from Bag where userId=? and name=? and id!=?", $_SESSION['user']['id'], $name, $bagId);

if(count($bags)>0){
  header('HTTP/1.1 400 Bad request');
  echo 'Taška se stejným názvem již existuje!';
  exit;
}

$db->execute("update Bag set name=?, description=? where id=?", $name, $description, $bagId);

?>
