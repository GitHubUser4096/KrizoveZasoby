<?php

/** Verifies that an item exists and belongs to the user and returns it **/
function verifyItem($itemId, $db){

  $items = $db->query("select * from Item where id=?", $itemId);

  if(count($items)==0){
    header('HTTP/1.1 400 Bad request');
    echo 'Item does not exist.';
    exit;
  }

  $item = $items[0];

  $bag = $db->query("select * from Bag where id=?", $item['bagId'])[0];

  if($_SESSION['user']['id']!=$bag['userId']){
    header('HTTP/1.1 403 Forbidden');
    echo 'Item does not belong to the current user!';
    exit;
  }

  return $item;

}

/** Returns a full item object (including product and state) by id, OWNERSHIP VERIFICATION is NOT INCLUDED - verify it before or after! **/
function getItemById($itemId, $db){

  $config = getConfig($db);
  $today = strtotime('today midnight');
  $criticalTime = strtotime($config['criticalTime'])-time();
  $warnTime = strtotime($config['warnTime'])-time();
  $recommendedTime = strtotime($config['recommendedTime'])-time();

  $items = $db->query("select * from Item where id=?", $itemId);

  if(count($items)==0) return null;

  $item = $items[0];

  $item['product'] = getProductById($item['productId'], $db);

  $expTime = strtotime($item['expiration']);
  $item['displayDate'] = $expTime ? date($config['dateFormat'], $expTime) : null;
  if(!$item['used']){
    if($expTime>=$today) $item['useIn'] = formatDateDiff($expTime, $today);
    else if($expTime) $item['useIn'] = 'po vypršení';
  }

  if($item['used']){
    $item['state'] = 'used';
  } else if(!$expTime){
    $item['state'] = 'N/A';
  } else if($expTime<$today){
    $item['state'] = 'expired';
  } else if($expTime-$criticalTime<$today){
    $item['state'] = 'critical';
  } else if($expTime-$warnTime<$today){
    $item['state'] = 'warn';
  } else if($expTime-$recommendedTime<$today){
    $item['state'] = 'recommended';
  } else {
    $item['state'] = 'ok';
  }

  return $item;

}

/** Returns all full item objects (including product and state) from a bag, OWNERSHIP VERIFICATION is NOT INCLUDED - verify it before or after! **/
function getItemsFromBag($bagId, $db){

  $config = getConfig($db);
  $today = strtotime('today midnight');
  $criticalTime = strtotime($config['criticalTime'])-time();
  $warnTime = strtotime($config['warnTime'])-time();
  $recommendedTime = strtotime($config['recommendedTime'])-time();

  $items = $db->query("select * from Item where bagId=? order by used, expiration", $bagId);

  for($i = 0; $i<count($items); $i++){

    $items[$i]['product'] = getProductById($items[$i]['productId'], $db);

    $expTime = strtotime($items[$i]['expiration']);
    $items[$i]['displayDate'] = $expTime ? date($config['dateFormat'], $expTime) : null;
    if(!$items[$i]['used']){
      if($expTime>=$today) $items[$i]['useIn'] = formatDateDiff($expTime, $today);
      else if($expTime) $items[$i]['useIn'] = 'po vypršení';
    }

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

  return $items;

}

?>
