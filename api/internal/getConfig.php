<?php

function getUserConfig($userId, $db){

  $configs = $db->query("select * from Config where userId=?", $userId);

  if(count($configs)==0){
    $db->insert("insert into Config(userId) values (?)", $userId);
    $configs = $db->query("select * from Config where userId=?", $userId);
  }

  return $configs[0];

}

function getConfig($db){

  if(!isSet($_SESSION['user'])){
    header('HTTP/1.1 403 Forbidden');
    echo 'Not logged in.';
    exit;
  }

  return getUserConfig($_SESSION['user']['id'], $db);

}

?>
