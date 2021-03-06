<?php

session_start();

require_once '../../lib/php/db.php';
require_once '../../config/supplies.conf.php';
require_once '../../lib/php/formatDateDiff.php';
require_once '../internal/getConfig.php';
require_once '../internal/common.php';

$db = new DB(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME, DB_DEBUG);

/**
* Shows the users profile status
* Method: GET
* Returns: status, message (json)
**/

checkAuth();

$userId = $_SESSION['user']['id'];

$bags = $db->query("select id, name from Bag where userId=? and not donated", $userId);

if(count($bags)==0){
  echo json_encode(['message'=>'', 'status'=>'hidden']);
  return;
}

$config = getConfig($db);

$today = strtotime('today midnight');
$otherDay = strtotime('yesterday midnight');
$prevDay = strtotime('today midnight');
$criticalTime = strtotime($config['criticalTime'])-time();
$warnTime = strtotime($config['warnTime'])-time();
$recommendedTime = strtotime($config['recommendedTime'])-time();

$expBags = [];
$critBags = [];
$warnBags = [];
$recBags = [];

$nearestRec = null;
$nearestRecBag;
$nearestExp = null;
$nearestExpBag;
$hasItems = false;

for($i = 0; $i<count($bags); $i++){

  // TODO globalize this?

  $items = $db->query("select * from Item where bagId=? and not used and expiration is not null order by expiration", $bags[$i]['id']);

  if(count($items)==0){
    continue;
  }

  $hasItems = true;

  if(!$items[0]['expiration']){
    continue;
  }

  $bagExp = strtotime($items[0]['expiration']);
  $bagRec = $bagExp-$recommendedTime;

  if($bagExp<$today){
    $expBags[] = $bags[$i]['name'];
    continue;
  }

  if($nearestExp==null || $bagExp<$nearestExp){
    $nearestExp = $bagExp;
    $nearestExpBag = $bags[$i]['name'];
  }

  if($bagExp-$criticalTime<$today){
    $critBags[] = $bags[$i]['name'];
    continue;
  }

  if($bagExp-$warnTime<$today){
    $warnBags[] = $bags[$i]['name'];
    continue;
  }

  if($bagRec<$today){
    $recBags[] = $bags[$i]['name'];
    continue;
  }

  if($nearestRec==null || $bagRec<$nearestRec){
    $nearestRec = $bagRec;
    $nearestRecBag = $bags[$i]['name'];
  }

}

// TODO globalize this?

$message = '';
$status = '';

if(!$hasItems){

  $message = 'Nem??te ????dn?? aktivn?? polo??ky.';
  $status = 'ok';

} else if(count($expBags)>0){

  if(count($expBags)==1){
    $message = 'V ta??ce '.htmlspecialchars($expBags[0]).' jsou vypr??en?? polo??ky';
  } else {
    $message = 'Po??et ta??ek s vypr??en??mi polo??kami: '.count($expBags);
  }
  $status = 'expired';

} else if(count($critBags)>0){

  if(count($critBags)==1){
    $message = 'V ta??ce '.htmlspecialchars($critBags[0]).' jsou polo??ky v kritick??m stavu';
    $message .= ', nejbli?????? vypr???? '.formatDateDiff($nearestExp, $prevDay);
  } else {
    $message = 'Po??et ta??ek v kritick??m stavu: '.count($critBags);
    $message .= ' | Nejbli?????? vypr??en?? '.formatDateDiff($nearestExp, $prevDay).' (ta??ka '.htmlspecialchars($nearestExpBag).')';
  }
  $status = 'critical';

} else if(count($warnBags)>0){

  if(count($warnBags)==1){
    $message = 'V ta??ce '.htmlspecialchars($warnBags[0]).' jsou polo??ky s varov??n??m';
    $message .= ', nejbli?????? vypr???? '.formatDateDiff($nearestExp, $prevDay);
  } else {
    $message = 'Po??et ta??ek s varov??n??m: '.count($warnBags);
    $message .= ' | Nejbli?????? vypr??en?? '.formatDateDiff($nearestExp, $prevDay).' (ta??ka '.htmlspecialchars($nearestExpBag).')';
  }
  $status = 'warn';

} else if(count($recBags)>0){

  if(count($recBags)==1){
    $message = 'V ta??ce '.htmlspecialchars($recBags[0]).' jsou polo??ky s doporu??en??m odevzd??n??m';
    $message .= ', nejbli?????? vypr???? '.formatDateDiff($nearestExp, $prevDay);
  } else {
    $message = 'Po??et ta??ek s doporu??en??m odevzd??n??m: '.count($recBags);
    $message .= ' | Nejbli?????? vypr??en?? '.formatDateDiff($nearestExp, $prevDay).' (ta??ka '.htmlspecialchars($nearestExpBag).')';
  }
  $status = 'recommended';

} else if(isSet($nearestRecBag)) {

  $message = 'Nejbli?????? doporu??en?? odevzd??n?? '.formatDateDiff($nearestRec, $otherDay).' (ta??ka '.htmlspecialchars($nearestRecBag).')';
  $status = 'ok';

}

echo json_encode(['message'=>$message, 'status'=>$status]);

?>
