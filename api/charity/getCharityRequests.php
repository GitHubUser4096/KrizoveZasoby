<?php

session_start();

require_once '../../lib/php/db.php';
require_once '../../config/supplies.conf.php';
require_once '../internal/common.php';

$db = new DB(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME, DB_DEBUG);

/*
 * Returns all charities that are not approved (admin only)
 * Method: GET
 * Returns: list of charities (json)
 */

checkAuth();
checkRole('admin');

$charities = $db->query("select * from Charity where not isApproved");

for($i = 0; $i<count($charities); $i++){

  $charities[$i]['places'] = $db->query("select * from CharityPlace where charityId=?", $charities[$i]['id']);

  $userId = $db->query("select userId from CharityUser where charityId=?", $charities[$i]['id'])[0]['userId'];
  $charities[$i]['user'] = $db->query("select * from User where id=?", $userId)[0];

}

echo json_encode($charities);

?>