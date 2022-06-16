<?php

session_start();

require_once '../../lib/php/db.php';
require_once '../../lib/php/formatDateDiff.php';
require_once '../../config/supplies.conf.php';
require_once '../internal/common.php';
require_once '../internal/getConfig.php';

// echo json_encode($_SESSION['user']);

$db = new DB(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME, DB_DEBUG);

checkAuth();

$today = strtotime('today midnight');
$yesterday = strtotime('yesterday midnight');

$config = getUserConfig($_SESSION['user']['id'], $db);
$criticalDiff = strtotime($config['criticalTime'])-time();
$warnDiff = strtotime($config['warnTime'])-time();
$recommendedDiff = strtotime($config['recommendedTime'])-time();

$changedItems = [];
$expiredBags = [];
$criticalBags = [];
$warnBags = [];
$recommendedBags = [];
$expiredCount = 0;
$criticalCount = 0;
$warnCount = 0;
$recommendedCount = 0;

$bags = $db->query("select * from Bag where userId=? and not donated", $_SESSION['user']['id']);

foreach($bags as $bag){

  $bagName = $bag['name'];
  $items = $db->query("select * from Item inner join Product on Product.id=productId where bagId=? and not used order by expiration", $bag['id']);

  foreach($items as $item){

    if(!$item['expiration']) continue;

    $expTime = strtotime($item['expiration']);

    $changedItem = ['item'=>$item['shortDesc'], 'expTime'=>$expTime, 'count'=>$item['count'], 'bag'=>$bag['name']];

    $changed = false;

    if($yesterday==$expTime) {
      $changedItem['state'] = 'expired';
      $changed = true;
    } else if($yesterday==$expTime-$criticalDiff) {
      $changedItem['state'] = 'critical';
      $changed = true;
    } else if($yesterday==$expTime-$warnDiff) {
      $changedItem['state'] = 'warn';
      $changed = true;
    } else if($yesterday==$expTime-$recommendedDiff) {
      $changedItem['state'] = 'recommended';
      $changed = true;
    }

    if($changed){

      if($expTime<$today) $changedItem['message'] = 'Položka '.$item['shortDesc'].' x'.$item['count'].' v tašce '.$bagName.' vypršela!';
      else $changedItem['message'] = 'Položka '.$item['shortDesc'].' x'.$item['count'].' v tašce '.$bagName.' vyprší '.formatDateDiff($today, $expTime);

      $changedItems[] = $changedItem;

    }

    if($expTime<$today){
      if(!in_array($bagName, $expiredBags)) $expiredBags[] = $bagName;
      $expiredCount++;
    } else if($expTime-$criticalDiff<$today){
      if(!in_array($bagName, $criticalBags)) $criticalBags[] = $bagName;
      $criticalCount++;
    } else if($expTime-$warnDiff<$today){
      if(!in_array($bagName, $warnBags)) $warnBags[] = $bagName;
      $warnCount++;
    } else if($expTime-$recommendedDiff<$today){
      if(!in_array($bagName, $recommendedBags)) $recommendedBags[] = $bagName;
      $recommendedCount++;
    }

  }

}

echo json_encode([
  'requiringAttention'=>$changedItems,
  'expiredBags'=>$expiredCount,
  'criticalBags'=>$criticalCount,
  'warnBags'=>$warnCount,
  'recommendedBags'=>$recommendedCount,
]);

?>
