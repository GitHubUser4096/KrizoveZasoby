<?php

// Returns specified bag if exists and belongs to the user, otherwise exits page with HTTP error
function getBag($bagId, $db){

  $bags = $db->query("select * from Bag where id=?", $bagId);

  if(count($bags)==0){
    header('HTTP/1.1 400 Bad request');
    echo 'Invalid bag.';
    exit;
  }

  if($_SESSION['user']['id']!=$bags[0]['userId']){
    header('HTTP/1.1 403 Forbidden');
    echo 'Bag does not belong to the current user.';
    exit;
  }

  return $bags[0];

}

// Checks whether a bag exists and belongs to the current user
function verifyBag($bagId, $db){

  $bags = $db->query("select * from Bag where id=?", $bagId);

  if(count($bags)==0){
    header('HTTP/1.1 400 Bad request');
    echo 'Invalid bag.';
    exit;
  }

  if($_SESSION['user']['id']!=$bags[0]['userId']){
    header('HTTP/1.1 403 Forbidden');
    echo 'Bag does not belong to the current user.';
    exit;
  }

}

?>
