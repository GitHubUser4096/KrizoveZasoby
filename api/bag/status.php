<?php

session_start();

require_once '../../lib/php/db.php';
require_once '../../config/supplies.conf.php';
require_once '../../lib/php/formatDateDiff.php';
require_once '../internal/getConfig.php';

$db = new DB(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME);

/**
Shows the users profile status
Method: GET
Returns: status, message (json)
**/

if(!isSet($_SESSION['user'])){
  header('HTTP/1.1 403 Forbidden');
  echo 'Not loggeed in.';
  return;
}

$userId = $_SESSION['user']['id'];

$bags = $db->query("select id, name from Bag where userId=?", $userId);

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

  // if(count($expired)==0) continue;

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

  // if(count($items)>0){
  //   $hasItems = true;
  // }

  // $nearestExp = PHP_INT_MAX;
  //
  // foreach($items as $item){
  //   if($item['used']) continue;
  //   $cDate = strtotime($item['expiration']);
  //   if($cDate<$useDate){
  //     $useDate = $cDate;
  //   }
  // }
  //
  // $recDate = $useDate-(60*60*24*7*3);
  //
  // if($useDate!=PHP_INT_MAX){
  //
  //   if($recDate>=$now && ($recDate<$nearestRec || $nearestRec==null)){
  //     $nearestRec = $recDate;
  //     $nearestRecBag = $bags[$i]['name'];
  //   }
  //
  //   if($useDate>=$now && ($useDate<$nearestExp || $nearestExp==null)){
  //     $nearestExp = $useDate;
  //     $nearestExpBag = $bags[$i]['name'];
  //   }
  //
  // }
  //
  // $recDateStr = date('Y-m-d', $recDate);
  // $useDateStr = date('Y-m-d', $useDate);
  //
  // if($useDate<$now){
  //   $expired[] = $bags[$i];
  // } else if($recDate<=$now){
  //   $recommended[] = $bags[$i];
  // }

}

$message = '';
$status = '';

if(!$hasItems){

  $message = 'Nemáte žádné aktivní položky.';
  $status = 'ok';

} else if(count($expBags)>0){

  if(count($expBags)==1){
    $message = 'V tašce '.htmlspecialchars($expBags[0]).' jsou vypršené položky';
  } else {
    $message = 'Počet tašek s vypršenými položkami: '.count($expBags);
  }
  $status = 'expired';

} else if(count($critBags)>0){

  if(count($critBags)==1){
    $message = 'V tašce '.htmlspecialchars($critBags[0]).' jsou položky v kritickém stavu';
    $message .= ', nejbližší vyprší '.formatDateDiff($nearestExp, $prevDay);
  } else {
    $message = 'Počet tašek v kritickém stavu: '.count($critBags);
    $message .= ' | Nejbližší vypršení '.formatDateDiff($nearestExp, $prevDay).' (taška '.htmlspecialchars($nearestExpBag).')';
  }
  $status = 'critical';

} else if(count($warnBags)>0){

  if(count($warnBags)==1){
    $message = 'V tašce '.htmlspecialchars($warnBags[0]).' jsou položky s varováním';
    $message .= ', nejbližší vyprší '.formatDateDiff($nearestExp, $prevDay);
  } else {
    $message = 'Počet tašek s varováním: '.count($warnBags);
    $message .= ' | Nejbližší vypršení '.formatDateDiff($nearestExp, $prevDay).' (taška '.htmlspecialchars($nearestExpBag).')';
  }
  $status = 'warn';

} else if(count($recBags)>0){

  if(count($recBags)==1){
    $message = 'V tašce '.htmlspecialchars($recBags[0]).' jsou položky s doporučeným odevzdáním';
    $message .= ', nejbližší vyprší '.formatDateDiff($nearestExp, $prevDay);
  } else {
    $message = 'Počet tašek s doporučeným odevzdáním: '.count($recBags);
    $message .= ' | Nejbližší vypršení '.formatDateDiff($nearestExp, $prevDay).' (taška '.htmlspecialchars($nearestExpBag).')';
  }
  $status = 'recommended';

} else if(isSet($nearestRecBag)) {

  $message = 'Nejbližší doporučené odevzdání '.formatDateDiff($nearestRec, $otherDay).' (taška '.htmlspecialchars($nearestRecBag).')';
  $status = 'ok';

}



// if(count($expired)>0){
//   if(count($expired)==1){
//     $message .= 'V tašce '.htmlspecialchars($expired[0]['name']).' jsou vypršené položky';
//   } else {
//     $message .= 'Počet tašek s vypršenými položkami: '.count($expired);
//   }
//   $status = 'critical';
// } else if(count($recommended)>0){
//   if(count($recommended)==1){
//     $message .= 'V tašce '.htmlspecialchars($recommended[0]['name']).' jsou položky s doporučeným odevzdáním';
//   } else {
//     $message .= 'Počet tašek s doporučeným odevzdáním: '.count($recommended);
//   }
//   if($nearestExp!=null){
//     $nowDT = new DateTime('today midnight');
//     // $nowDT->setTimestamp($now);
//     $expDT = new DateTime();
//     $expDT->setTimestamp($nearestExp);
//     $diff = $nowDT->diff($expDT);
//     $message .= ' - Nejbližší vypršení '.formatDateDiff($diff).' (taška '.htmlspecialchars($nearestExpBag).')';
//     $status = 'ok';
//   }
//   $status = 'warn';
// } else if($nearestRec!=null){
//   $nowDT = new DateTime('today midnight');
//   // $nowDT->setTimestamp($now);
//   $recDT = new DateTime();
//   $recDT->setTimestamp($nearestRec);
//   $diff = $nowDT->diff($recDT);
//   $message .= 'Nejbližší doporučené odevzdání '.formatDateDiff($diff).' (taška '.htmlspecialchars($nearestRecBag).')';
//   $status = 'ok';
// }

echo json_encode(['message'=>$message, 'status'=>$status]);

?>
