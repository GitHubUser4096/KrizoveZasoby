<?php

// TODO inaccurate/possibly misleading name?

session_start();

require_once '../../lib/php/db.php';
require_once '../../config/supplies.conf.php';
require_once '../internal/common.php';

$db = new DB(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME, DB_DEBUG);

/*
 * Registers or edits a charity
 * Method: POST
 * Get: charityId - optional - if set, edits a charity, otherwise creates new
 * Post: data* (json)
 * Charity structure:
 * {
 *   name*, orgId*, contact (web, mail, phone)*,
 *   places: [
 *     {
 *       id, (if set, place is updated, otherwise a new place is created) 
 *       street*, place*, postCode*, note, openHours*, contact (web, mail, phone), latitude, longitude
 *     },
 *     ...
 *   ]
 * }
 * Returns: id (json)
 */

checkAuth();
checkPost();

function getString($obj, $fieldName, $maxLength){
  if(!isSet($obj[$fieldName])){
    fail('400 Bad request', 'missing value for '.$fieldName);
  }
  if(!is_string($obj[$fieldName])){
    fail('400 Bad request', 'invalid type for '.$fieldName);
  }
  $value = trim($obj[$fieldName]);
  if(!$value){
    fail('400 Bad request', 'empty value for '.$fieldName);
  }
  if(strlen($value)>$maxLength){
    fail('400 Bad request', 'value too long for '.$fieldName);
  }
  return $value;
}

function optString($obj, $fieldName, $maxLength){
  if(!array_key_exists($fieldName, $obj)){
    fail('400 Bad request', 'missing value for '.$fieldName);
  }
  if($obj[$fieldName]===null){
    return null;
  }
  if(!is_string($obj[$fieldName])){
    fail('400 Bad request', 'invalid type for '.$fieldName);
  }
  $value = trim($obj[$fieldName]);
  if(strlen($value)>$maxLength){
    fail('400 Bad request', 'value too long for '.$fieldName);
  }
  return $value;
}

function optDouble($obj, $fieldName){
  if(!array_key_exists($fieldName, $obj)){
    fail('400 Bad request', 'missing value for '.$fieldName);
  }
  if($obj[$fieldName]===null){
    return null;
  }
  if(!is_string($obj[$fieldName]) && !is_double($obj[$fieldName]) && !is_int($obj[$fieldName])){
    fail('400 Bad request', 'invalid type for '.$fieldName);
  }
  if(strval(doubleval(trim($obj[$fieldName])))!=strval(trim($obj[$fieldName]))){
    fail('400 Bad request', 'invalid format for '.$fieldName);
  }
  $value = doubleval(trim($obj[$fieldName]));
  if(!is_finite($value) || is_nan($value)){
    fail('400 Bad request', 'value not number for '.$fieldName);
  }
  return $value;
}

// check for input errors

if(!isSet($_POST['data'])){
  fail('400 Bad request', 'data is missing');
}

$data = json_decode($_POST['data'], true);

$name = getString($data, 'name', 128);
$orgId = getString($data, 'orgId', 32);
$contactWeb = optString($data, 'contactWeb', 32);
$contactMail = optString($data, 'contactMail', 32);
$contactPhone = optString($data, 'contactPhone', 32);
// $contacts = getString($data, 'contacts', 256);

if($contactWeb == null && $contactMail == null && $contactPhone == null) {
  fail('400 Bad request', 'missing value for contact');
}

if(!isSet($data['places']) || !is_array($data['places']) || !count($data['places'])){
  fail('400 Bad request', 'invalid or missing value for places');
}

$places = [];

foreach($data['places'] as $place){

  $validPlace = [];

  if(isSet($place['id'])) $validPlace['id'] = $place['id'];
  $validPlace['street'] = getString($place, 'street', 64);
  $validPlace['place'] = getString($place, 'place', 64);
  $validPlace['postCode'] = getString($place, 'postCode', 32);
  $validPlace['note'] = optString($place, 'note', 256);
  $validPlace['openHours'] = getString($place, 'openHours', 256);
  // $validPlace['contacts'] = optString($place, 'contacts', 256);
  $validPlace['contactWeb'] = optString($place, 'contactWeb', 32);
  $validPlace['contactMail'] = optString($place, 'contactMail', 32);
  $validPlace['contactPhone'] = optString($place, 'contactPhone', 32);
  $validPlace['latitude'] = optDouble($place, 'latitude');
  $validPlace['longitude'] = optDouble($place, 'longitude');

  $places[] = $validPlace;

}

$charId = null;

if(isSet($_GET['charityId'])){ // if id is defined, update existing charity

  $charId = $_GET['charityId'];

  $charities = $db->query("select * from Charity where id=?", $charId);
  if(count($charities)==0){
    fail('400 Bad request', 'Charity does not exist!');
  }

  // check permission
  $charityUsers = $db->query("select * from CharityUser where charityId=? and userId=?", $charId, $_SESSION['user']['id']);
  $isAdmin = getRole('admin');
  $isManager = count($charityUsers)>0 && $charityUsers[0]['isManager'];

  if(!$isAdmin && !$isManager){
    fail('403 Forbidden', 'insufficient permission level');
  }

  // check collisions

  $sameNameChars = $db->query("select * from Charity where name=?", $name);
  // fail if there is a different charity with same name
  if(count($sameNameChars)>0 && $sameNameChars[0]['id']!=$charId){
    fail('400 Bad request', 'Charita se stejným názvem již existuje!');
  }

  $sameOrgIdChars = $db->query("select * from Charity where orgId=?", $orgId);
  // fail if there is a different charity with same orgId
  if(count($sameOrgIdChars)>0 && $sameOrgIdChars[0]['id']!=$charId){
    fail('400 Bad request', 'Charita se stejným identifikačním číslem již existuje!');
  }

  // check that places to be updated exist/have correct ids
  foreach($places as $place){
    if(isSet($place['id'])){
      $checkPlaces = $db->query("select * from CharityPlace where id=?", $place['id']);
      if(count($checkPlaces)==0){
        fail('400 Bad request', 'Place does not exist!');
      }
    }
  }

  // everything is checked - save the data

  // $db->execute("update Charity set orgId=?, name=?, contacts=? where id=?", $orgId, $name, $contacts, $charId);
  $db->execute("update Charity set orgId=?, name=?, contactWeb=?, contactMail=?, contactPhone=? where id=?", $orgId, $name, $contactWeb, $contactMail, $contactPhone, $charId);

  $savedPlaces = $db->query("select * from CharityPlace where charityId=?", $charId);

  // delete places that the user removed
  foreach($savedPlaces as $savedPlace){
    if(!has($places, function($e){
      global $savedPlace;
      return isSet($e['id']) && $e['id']==$savedPlace['id'];
    })){
      $db->execute("delete from CharityPlace where id=?", $savedPlace['id']);
    }
  }

  // save other places
  foreach($places as $place){
    if(isSet($place['id'])){ // if place has a set id, place exists and should be updated (validity of id is checked above)
      // $db->execute("update CharityPlace set street=?, place=?, postCode=?, note=?, openHours=?, contacts=?, latitude=?, longitude=? where id=?",
      //     $place['street'], $place['place'], $place['postCode'], $place['note'], $place['openHours'], $place['contacts'], $place['latitude'], $place['longitude'], $place['id']);
      $db->execute("update CharityPlace set street=?, place=?, postCode=?, note=?, openHours=?, contactWeb=?, contactMail=?, contactPhone=?, latitude=?, longitude=? where id=?",
          $place['street'], $place['place'], $place['postCode'], $place['note'], $place['openHours'], $place['contactWeb'], $place['contactMail'], $place['contactPhone'], $place['latitude'], $place['longitude'], $place['id']);
    } else { // otherwise, create a new place
      // $db->insert("insert into CharityPlace(charityId, street, place, postCode, note, openHours, contacts, latitude, longitude) values (?, ?, ?, ?, ?, ?, ?, ?, ?)",
      //   $charId, $place['street'], $place['place'], $place['postCode'], $place['note'], $place['openHours'], $place['contacts'], $place['latitude'], $place['longitude']);
      $db->insert("insert into CharityPlace(charityId, street, place, postCode, note, openHours, contactWeb, contactMail, contactPhone, latitude, longitude) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        $charId, $place['street'], $place['place'], $place['postCode'], $place['note'], $place['openHours'], $place['contactWeb'], $place['contactMail'], $place['contactPhone'], $place['latitude'], $place['longitude']);
    }
  }

} else { // create new charity

  // check permission
  if(!getRole('contributor')){
    fail('403 Forbidden', 'insufficient permission level');
  }

  // check collisions
  $sameNameChars = $db->query("select * from Charity where name=?", $data['name']);
  if(count($sameNameChars)>0){
    fail('400 Bad request', 'Charita se stejným názvem již existuje!');
  }

  $sameOrgIdChars = $db->query("select * from Charity where orgId=?", $data['orgId']);
  if(count($sameOrgIdChars)>0){
    fail('400 Bad request', 'Charita se stejným identifikačním číslem již existuje!');
  }

  // everything is checked - save

  $charId = $db->insert("insert into Charity(orgId, name, contactWeb, contactMail, contactPhone) values (?, ?, ?, ?, ?)", $orgId, $name, $contactWeb, $contactMail, $contactPhone);

  foreach($places as $place){
    $db->insert("insert into CharityPlace(charityId, street, place, postCode, note, openHours, contactWeb, contactMail, contactPhone, latitude, longitude) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        $charId, $place['street'], $place['place'], $place['postCode'], $place['note'], $place['openHours'], $place['contactWeb'], $place['contactMail'], $place['contactPhone'], $place['latitude'], $place['longitude']);
  }

  $db->insert("insert into CharityUser(charityId, userId, isManager) values (?, ?, 1)",
      $charId, $_SESSION['user']['id']);

}

echo json_encode(['id'=>$charId]);

?>
