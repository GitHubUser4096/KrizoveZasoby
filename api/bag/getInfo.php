<?php

session_start();

require_once '../../lib/php/db.php';
require_once '../../config/supplies.conf.php';
require_once '../../lib/php/formatDateDiff.php';
require_once '../internal/getConfig.php';
require_once '../internal/common.php';
require_once '../internal/bag.php';

$db = new DB(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME, DB_DEBUG);

/**
Get Bag Info
Method: GET
Get: bagId*
Returns: useRecommended, useBefore, id, name, description (json)
**/

checkAuth();

$bagId = getParam('bagId');

$bagInfo = getBag($bagId, $db);

$items = $db->query("select * from Item where bagId=? and not used order by expiration", $bagInfo['id']);

if(count($items)==0){
  $recDateStr = '-';
  $useDateStr = '-';
} else {
  $config = getConfig($db);

  $today = strtotime('today midnight');

  $isNotExp = false;

  foreach($items as $item){
    $cExp = strtotime($item['expiration']);
    if($cExp>=$today){
      $closestExp = $cExp;
      $isNotExp = true;
      break;
    }
  }

  if(!$isNotExp){
    $recDateStr = '-';
    $useDateStr = '-';
  } else {
    $recommendedTime = strtotime($config['recommendedTime'])-time();

    if($closestExp-$recommendedTime<$today){
      $recDateStr = 'nyní';
    } else {
      $recDateStr = formatDateDiff($closestExp-$recommendedTime, $today);
    }

    if($closestExp==$today){
      $useDateStr = 'dnes';
    } else {
      $useDateStr = formatDateDiff($closestExp, $today);
    }
  }

}

echo json_encode(['useRecommended'=>$recDateStr, 'useBefore'=>$useDateStr, 'id'=>$bagInfo['id'], 'name'=>$bagInfo['name'], 'description'=>$bagInfo['description']]);

?>
