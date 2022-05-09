<?php

session_start();

require_once '../../lib/php/db.php';
require_once '../../config/supplies.conf.php';
require_once '../internal/getConfig.php';
require_once '../internal/common.php';

$db = new DB(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME, DB_DEBUG);

/**
List all user's bags
Method: GET
Returns: the bags (json)
**/

checkAuth();

$userId = $_SESSION['user']['id'];

$config = getConfig($db);

$today = strtotime('today midnight');
$criticalTime = strtotime($config['criticalTime'])-time();
$warnTime = strtotime($config['warnTime'])-time();
$recommendedTime = strtotime($config['recommendedTime'])-time();

$bags = $db->query("select id, name from Bag where userId=? and not donated", $userId);

for($i = 0; $i<count($bags); $i++){

  $items = $db->query("select * from Item where bagId=? and not used order by expiration", $bags[$i]['id']);

  if(count($items)==0){
    $bags[$i]['state'] = 'empty';
    continue;
  }

  $items = $db->query("select * from Item where bagId=? and not used and expiration is not null order by expiration", $bags[$i]['id']);

  if(count($items)==0){
    $bags[$i]['state'] = 'ok';
    continue;
  }

  if(!$items[0]['expiration']){
    $bags[$i]['state'] = 'N/A';
    continue;
  }

  $expTime = strtotime($items[0]['expiration']);

  // TODO globalize this?
  if($expTime<$today){
    $bags[$i]['state'] = 'expired';
  } else if($expTime-$criticalTime<$today){
    $bags[$i]['state'] = 'critical';
  } else if($expTime-$warnTime<$today){
    $bags[$i]['state'] = 'warn';
  } else if($expTime-$recommendedTime<$today){
    $bags[$i]['state'] = 'recommended';
  } else {
    $bags[$i]['state'] = 'ok';
  }

}

echo json_encode($bags);

?>
