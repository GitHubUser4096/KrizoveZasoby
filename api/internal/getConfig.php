<?php

function getUserConfig($userId, $db){

  $configs = $db->query("select * from Config where userId=?", $userId);

  $confMap = [];

  foreach($configs as $config){
    $confMap[$config['name']] = $config['value'];
  }

  /** Set defaults if values not set */
  if(!isSet($confMap['criticalTime'])) $confMap['criticalTime'] = '1 days';
  if(!isSet($confMap['warnTime'])) $confMap['warnTime'] = '1 weeks';
  if(!isSet($confMap['recommendedTime'])) $confMap['recommendedTime'] = '3 weeks';

  return $confMap;

}

function getConfig($db){

  if(!isSet($_SESSION['user'])){
    header('HTTP/1.1 403 Forbidden');
    echo 'Not logged in.';
    return;
  }

  $configs = $db->query("select * from Config where userId=?", $_SESSION['user']['id']);

  $confMap = [];

  foreach($configs as $config){
    $confMap[$config['name']] = $config['value'];
  }

  /** Set defaults if values not set */
  if(!isSet($confMap['criticalTime'])) $confMap['criticalTime'] = '1 days';
  if(!isSet($confMap['warnTime'])) $confMap['warnTime'] = '1 weeks';
  if(!isSet($confMap['recommendedTime'])) $confMap['recommendedTime'] = '3 weeks';

  return $confMap;

}

?>
