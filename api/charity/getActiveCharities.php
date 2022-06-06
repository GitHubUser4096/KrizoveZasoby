<?php

session_start();

require_once '../../lib/php/db.php';
require_once '../../config/supplies.conf.php';
require_once '../internal/common.php';

$db = new DB(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME, DB_DEBUG);

checkAuth();

$charities = null;
if(getRole('admin')){
  $charities = $db->query("select * from Charity where isApproved");
} else {
  $charities = $db->query("select * from Charity where isApproved and id in (select charityId from CharityUser where userId=?)", $_SESSION['user']['id']);
}

for($i = 0; $i<count($charities); $i++){

  $charities[$i]['places'] = $db->query("select * from CharityPlace where charityId=?", $charities[$i]['id']);

  $userId = $db->query("select userId from CharityUser where charityId=?", $charities[$i]['id'])[0]['userId'];
  $charities[$i]['user'] = $db->query("select * from User where id=?", $userId)[0];

}

echo json_encode($charities);

?>