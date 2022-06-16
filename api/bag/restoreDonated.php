<?php

session_start();

require_once '../../lib/php/db.php';
require_once '../../config/supplies.conf.php';
require_once '../internal/common.php';
require_once '../internal/bag.php';

$db = new DB(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME, DB_DEBUG);

/**
* Restore a donated bag
* Method: POST
* Get: bagId*
*/

checkAuth();
checkPost();

$bagId = getParam('bagId');

$bag = getBag($bagId, $db);

if(!$bag['donated']){
  fail('400 Bad request', 'Bad not donated');
}

$db->execute("update Bag set donated=false where id=?", $bagId);

?>
