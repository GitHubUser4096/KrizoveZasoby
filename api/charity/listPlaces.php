<?php

session_start();

require_once '../../lib/php/db.php';
require_once '../../config/supplies.conf.php';
require_once '../internal/common.php';

$db = new DB(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME, DB_DEBUG);

checkAuth();

$places = [];
$charities = $db->query("select * from Charity where isApproved");

foreach($charities as $charity){
  $charPlaces = $db->query("select * from CharityPlace where charityId=?", $charity['id']);
  foreach($charPlaces as $place){
    $place['charity'] = $charity;
    $places[] = $place;
  }
}

echo json_encode($places);

?>