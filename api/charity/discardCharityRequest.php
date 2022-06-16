<?php

session_start();

require_once '../../lib/php/db.php';
require_once '../../config/supplies.conf.php';
require_once '../internal/common.php';

$db = new DB(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME, DB_DEBUG);

/*
 * Deletes an unapproved charity
 * Method: POST
 * Get: charityId
 */

checkAuth();
checkPost();
checkRole('admin');

$charityId = getParam('charityId');

$charities = $db->query("select * from Charity where id=?", $charityId);

if(count($charities)==0){
  fail('400 Bad request', 'Charity does not exist');
}

if($charities[0]['isApproved']){
  fail('400 Bad request', 'Charity is approved');
}

$db->execute("delete from CharityUser where charityId=?", $charityId);
$db->execute("delete from CharityPlace where charityId=?", $charityId);
$db->execute("delete from Charity where id=?", $charityId);

?>