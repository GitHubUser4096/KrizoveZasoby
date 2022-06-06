<?php

session_start();

require_once '../../lib/php/db.php';
require_once '../../config/supplies.conf.php';
require_once '../internal/common.php';

$db = new DB(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME, DB_DEBUG);

checkAuth();

$charityId = getParam('charityId');

$charities = $db->query("select * from Charity where isApproved and id=?", $charityId);

if(!count($charities)){
  fail('404 Not found', 'charity not found');
}

for($i = 0; $i<count($charities); $i++){

  $charities[$i]['places'] = $db->query("select * from CharityPlace where charityId=?", $charities[$i]['id']);
  $users = $db->query("select * from CharityUser where charityId=?", $charities[$i]['id']);
  $charities[$i]['users'] = [];

  for($j = 0; $j<count($users); $j++){
    $email = $db->query("select email from User where id=?", $users[$j]['userId'])[0]['email'];
    $charities[$i]['users'][] = [
      'userId'=>$users[$j]['userId'],
      'id'=>$users[$j]['id'],
      'isManager'=>$users[$j]['isManager'],
      'email'=>$email,
    ];
  }

}

echo json_encode($charities[0]);

?>