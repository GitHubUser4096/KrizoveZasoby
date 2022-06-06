<?php

session_start();

require_once '../../lib/php/db.php';
require_once '../../config/supplies.conf.php';
require_once '../internal/common.php';

$db = new DB(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME, DB_DEBUG);

/**
Create Bag
Method: POST
Post: name*, description
Returns: id (json)
**/

checkAuth();
checkPost();

$bagName = validate(['name'=>'name', 'required'=>true, 'maxLength'=>64]);
$description = validate(['name'=>'description', 'maxLength'=>1024]);

$bags = $db->query("select * from Bag where userId=? and name=?", $_SESSION['user']['id'], $bagName);

if(count($bags)>0){
  if($bags[0]['donated']){
    header('HTTP/1.1 400 Bad request');
    echo 'Taška se stejným názvem je mezi odevzdanými taškami.';
  } else {
    header('HTTP/1.1 400 Bad request');
    echo 'Taška se stejným názvem již existuje.';
  }
  exit;
}

$bagId = $db->insert("insert into Bag(name, description, userId) values (?, ?, ?)", $bagName, $description, $_SESSION['user']['id']);

echo json_encode(['id'=>$bagId]);

?>
