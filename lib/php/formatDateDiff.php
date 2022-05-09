<?php

function formatDateDiff($fromTime, $toTime){

  $fromDT = new DateTime();
  $fromDT->setTimestamp($fromTime);
  $toDT = new DateTime();
  $toDT->setTimestamp($toTime);
  $diff = $toDT->diff($fromDT);

  if($diff->days==0) return 'dnes';

  $parts = [];

  if($diff->y>0) {
    if($diff->y==1) $parts[] = '1 rok';
    else if($diff->y>=2 && $diff->y<=4) $parts[] = $diff->y.' roky';
    else $parts[] = $diff->y.' let';
  }

  if($diff->m>0) {
    if($diff->m==1) $parts[] = '1 měsíc';
    else if($diff->m>=2 && $diff->m<=4) $parts[] = $diff->m.' měsíce';
    else $parts[] = $diff->m.' měsíců';
  }

  if($diff->d>0) {
    if($diff->d==1) $parts[] = '1 den';
    else if($diff->d>=2 && $diff->d<=4) $parts[] = $diff->d.' dny';
    else $parts[] = $diff->d.' dnů';
  }

  if(count($parts)==1) return 'za '.$parts[0];
  if(count($parts)==2) return 'za '.$parts[0].' a '.$parts[1];
  return 'za '.$parts[0].', '.$parts[1].' a '.$parts[2];

}

?>
