<?php

session_start();

require_once '../../lib/php/db.php';
require_once '../../config/supplies.conf.php';
require_once '../internal/getConfig.php';

$db = new DB(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME);

if(!isSet($_SESSION['user'])){
  header('HTTP/1.1 403 Forbidden');
  echo 'Not loggeed in.';
  return;
}

$config = getConfig($db);

$userId = $_SESSION['user']['id'];

$bags = $db->query("select id, name, handedOutDate from Bag where userId=? and handedOut order by handedOutDate desc", $userId);

for($i=0; $i < count($bags); $i++) {

  $bags[$i]['handedOutDateFmt'] = date($config['dateFormat'], strtotime($bags[$i]['handedOutDate']));

}

echo json_encode($bags);

?>
