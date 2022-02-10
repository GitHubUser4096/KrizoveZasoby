<?php

session_start();

require_once '../../lib/php/db.php';
require_once '../../config/supplies.conf.php';
require_once '../../lib/php/formatDateDiff.php';
require_once '../internal/getConfig.php';

$db = new DB(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME);

/**
Get Bag Info
Method: GET
Get: bagId*
Returns: useRecommended, useBefore, id, name, description (json)
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
  echo 'Invalid bag Id.';
  return;
}

$bagInfo = $bags[0];

if($bagInfo['userId']!=$_SESSION['user']['id']){
  header('HTTP/1.1 400 Bad request');
  echo 'Bag is not owned by the current user.';
  return;
}

$items = $db->query("select * from Item where bagId=? and not used order by expiration", $bagInfo['id']);

if(count($items)==0){
  $recDateStr = '-';
  $useDateStr = '-';
} else {
  $config = getConfig($db);

  $today = strtotime('today midnight');
  // $closestExp = PHP_INT_MAX;

  // $closestExp = strtotime($items[0]['expiration']);

  // foreach($items as $item){
  //   $cExp = strtotime($item['expiration']);
  //   if($cExp>=$today && $cExp<$closestExp){
  //     $closestExp = $cExp;
  //   }
  // }

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
      // $recDateStr = date('Y-m-d', $closestExp-$recommendedTime);
      $recDateStr = formatDateDiff($closestExp-$recommendedTime, $today);
    }

    if($closestExp==$today){
      $useDateStr = 'dnes';
    } else {
      // $useDateStr = date('Y-m-d', $closestExp); // change this to 'Za X měsíců, Y týdnů, Z dnů'
      $useDateStr = formatDateDiff($closestExp, $today);
    }
  }



  // $recDate = $useDate-(60*60*24*7*3);
  //
  // $recDateStr = date('Y-m-d', $recDate);
  // $useDateStr = date('Y-m-d', $useDate);
  //
  // if($useDate==PHP_INT_MAX){
  //
  // } else if($recDate<=strtotime('today midnight')){
  //   $recDateStr = 'Nyní';
  // }
}

echo json_encode(['useRecommended'=>$recDateStr, 'useBefore'=>$useDateStr, 'id'=>$bagInfo['id'], 'name'=>$bagInfo['name'], 'description'=>$bagInfo['description']]);
// TODO why the fuck did I return userId?
// echo json_encode(['useRecommended'=>$recDateStr, 'useBefore'=>$useDateStr, 'id'=>$bagInfo['id'], 'name'=>$bagInfo['name'], 'description'=>$bagInfo['description'], 'userId'=>$bagInfo['userId']]);

?>
