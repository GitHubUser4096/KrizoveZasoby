<?php

// TODO inaccurate/possibly misleading name?

session_start();

require_once '../../lib/php/db.php';
require_once '../../config/supplies.conf.php';
require_once '../internal/common.php';

$db = new DB(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME, DB_DEBUG);

checkAuth();
checkPost();

// $bagName = validate(['name'=>'name', 'required'=>true, 'maxLength'=>64]);
// $description = validate(['name'=>'description', 'maxLength'=>1024]);

// $bags = $db->query("select * from Bag where userId=? and name=?", $_SESSION['user']['id'], $bagName);

// if(count($bags)>0){
//   if($bags[0]['donated']){
//     header('HTTP/1.1 400 Bad request');
//     echo 'Taška se stejným názvem je mezi odevzdanými taškami.';
//   } else {
//     header('HTTP/1.1 400 Bad request');
//     echo 'Taška se stejným názvem již existuje.';
//   }
//   exit;
// }

// $bagId = $db->insert("insert into Bag(name, description, userId) values (?, ?, ?)", $bagName, $description, $_SESSION['user']['id']);

// echo json_encode(['id'=>$bagId]);

if(!isSet($_POST['data'])){
  fail('400 Bad request', 'data is missing');
}

$data = json_decode($_POST['data'], true);

// TODO make this nicer
// TODO if some value is [] strlen will fail!

if(!isSet($data['name']) || !$data['name'] || strlen($data['name'])>128){
  fail('400 Bad request', 'invalid or missing value for name');
}

if(!isSet($data['orgId']) || !$data['orgId'] || strlen($data['orgId'])>32){
  fail('400 Bad request', 'invalid or missing value for orgId');
}

if(!isSet($data['contacts']) || !$data['contacts'] || strlen($data['contacts'])>256){
  fail('400 Bad request', 'invalid or missing value for contacts');
}

if(!isSet($data['places']) || !is_array($data['places']) || !count($data['places'])){
  fail('400 Bad request', 'invalid or missing value for places');
}

foreach($data['places'] as $place){

  if(!isSet($place['street']) || !$place['street'] || strlen($place['street'])>64){
    fail('400 Bad request', 'invalid or missing value for street');
  }

  if(!isSet($place['place']) || !$place['place'] || strlen($place['place'])>64){
    fail('400 Bad request', 'invalid or missing value for place');
  }

  if(!isSet($place['postCode']) || !$place['postCode'] || strlen($place['postCode'])>32){
    fail('400 Bad request', 'invalid or missing value for postCode');
  }

  if(strlen($place['note'])>256){ // TODO isSet() returns false for null values? accessing it will then throw an exception, exposing stack trace
    fail('400 Bad request', 'invalid or missing value for note');
  }

  if(!isSet($place['openHours']) || !$place['openHours'] || strlen($place['openHours'])>256){
    fail('400 Bad request', 'invalid or missing value for openHours');
  }

  if(strlen($place['contacts'])>256){
    fail('400 Bad request', 'invalid or missing value for contacts');
  }

}

$charId = null;

if(isSet($_GET['charityId'])){

  $charId = $_GET['charityId'];

  $charityUsers = $db->query("select * from CharityUser where charityId=? and userId=?", $charId, $_SESSION['user']['id']);

  $isAdmin = getRole('admin');
  $isManager = count($charityUsers)>0 && $charityUsers[0]['isManager'];

  if(!$isAdmin && !$isManager){
    fail('403 Forbidden', 'insufficient permission level');
  }

  $db->execute("update Charity set orgId=?, name=?, contacts=? where id=?", $data['orgId'], $data['name'], $data['contacts'], $charId);

  $savedPlaces = $db->query("select * from CharityPlace where charityId=?", $charId);

  foreach($savedPlaces as $savedPlace){
    if(!has($data['places'], function($e){
      global $savedPlace;
      return $e['id']==$savedPlace['id'];
    })){
      $db->execute("delete from CharityPlace where id=?", $savedPlace['id']);
    }
  }

  // TODO verify latitude and longitude are numbers or null
  foreach($data['places'] as $place){
    if(isSet($place['id'])){
      // TODO verify place exists
      $db->execute("update CharityPlace set street=?, place=?, postCode=?, note=?, openHours=?, contacts=?, latitude=?, longitude=? where id=?",
          $place['street'], $place['place'], $place['postCode'], $place['note'], $place['openHours'], $place['contacts'], $place['latitude'], $place['longitude'], $place['id']);
    } else {
      $db->insert("insert into CharityPlace(charityId, street, place, postCode, note, openHours, contacts, latitude, longitude) values (?, ?, ?, ?, ?, ?, ?, ?, ?)",
        $charId, $place['street'], $place['place'], $place['postCode'], $place['note'], $place['openHours'], $place['contacts'], $place['latitude'], $place['longitude']);
    }
  }

} else {

  if(!getRole('contributor')){
    fail('403 Forbidden', 'insufficient permission level');
  }

  $sameNameChars = $db->query("select * from Charity where name=?", $data['name']);

  if(count($sameNameChars)>0){
    fail('400 Bad request', 'Charita se stejným názvem již existuje!');
  }

  $sameOrgIdChars = $db->query("select * from Charity where orgId=?", $data['orgId']);

  if(count($sameOrgIdChars)>0){
    fail('400 Bad request', 'Charita se stejným identifikačním číslem již existuje!');
  }

  $charId = $db->insert("insert into Charity(orgId, name, contacts) values (?, ?, ?)", $data['orgId'], $data['name'], $data['contacts']);

  foreach($data['places'] as $place){
    $db->insert("insert into CharityPlace(charityId, street, place, postCode, note, openHours, contacts, latitude, longitude) values (?, ?, ?, ?, ?, ?, ?, ?, ?)",
        $charId, $place['street'], $place['place'], $place['postCode'], $place['note'], $place['openHours'], $place['contacts'], $place['latitude'], $place['longitude']);
  }

  $db->insert("insert into CharityUser(charityId, userId, isManager) values (?, ?, 1)",
      $charId, $_SESSION['user']['id']);

}

// $charId = $db->insert("insert into Charity(name, openHours) values (?, ?)", $data['name'], $data['openHours']);

// foreach($data['places'] as $place){
//   $db->insert("insert into CharityPlace(charityId, street, place, postCode, note) values (?, ?, ?, ?, ?)",
//       $charId, $place['street'], $place['place'], $place['postCode'], $place['note']);
// }

// foreach($data['contacts'] as $contact){
//   $db->insert("insert into CharityContact(charityId, contactType, contactValue) values (?, ?, ?)",
//       $charId, $contact['type'], $contact['value']);
// }

echo json_encode(['id'=>$charId]);

// echo json_encode($data);

?>
