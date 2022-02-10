<?php

session_start();

require_once '../../lib/php/db.php';
require_once '../../config/supplies.conf.php';
require_once '../internal/getConfig.php';

$db = new DB(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME);

/**
List items in a bag
Method: GET
Get: bagId*
Returns: list of items (json)
**/

if(!isSet($_SESSION['user'])){
  header('HTTP/1.1 403 Forbidden');
  echo 'Not logged in.';
  return;
}

if(!isSet($_GET['bagId'])){
  header('HTTP/1.1 400 Bad request');
  echo 'Missing bag Id.';
  return;
}

$bags = $db->query("select * from Bag where id=?", $_GET['bagId']);

if(count($bags)==0){
  header('HTTP/1.1 400 Bad request');
  echo 'Invalid bag.';
  return;
}

if($bags[0]['userId']!=$_SESSION['user']['id']){
  header('HTTP/1.1 403 Forbidden');
  echo 'Bag is not owned by the current user.';
  return;
}

$config = getConfig($db);

$today = strtotime('today midnight');
$criticalTime = strtotime($config['criticalTime'])-time();
$warnTime = strtotime($config['warnTime'])-time();
$recommendedTime = strtotime($config['recommendedTime'])-time();

$items = $db->query("select * from Item where bagId=? order by expiration", $_GET['bagId']);

for($i = 0; $i<count($items); $i++){

  /** Get item type (product) */
  $product = $db->query("select * from Product where id=?", $items[$i]['productId'])[0];
  $items[$i]['product'] = $product;

  $expTime = strtotime($items[$i]['expiration']);

  if($items[$i]['used']){
    $items[$i]['state'] = 'used';
  } else if(!$expTime){
    $items[$i]['state'] = 'N/A';
  } else if($expTime<$today){
    $items[$i]['state'] = 'expired';
  } else if($expTime-$criticalTime<$today){
    $items[$i]['state'] = 'critical';
  } else if($expTime-$warnTime<$today){
    $items[$i]['state'] = 'warn';
  } else if($expTime-$recommendedTime<$today){
    $items[$i]['state'] = 'recommended';
  } else {
    $items[$i]['state'] = 'ok';
  }

}

echo json_encode($items);

?>
