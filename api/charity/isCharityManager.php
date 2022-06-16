<?php

session_start();

require_once '../../lib/php/db.php';
require_once '../../config/supplies.conf.php';
require_once '../internal/common.php';

$db = new DB(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME, DB_DEBUG);

/**
 * Returns whether the signed-in user is a manager of the specified charity
 * Method: GET
 * Get: charityId
 * Returns: isManager (true|false)
 */

checkAuth();

$charityId = getParam('charityId');

$users = $db->query("select * from CharityUser where charityId=? and userId=?", $charityId, $_SESSION['user']['id']);

if(!count($users)) {
  echo 'false';
  return;
}

echo $users[0]['isManager'] ? 'true' : 'false';

?>