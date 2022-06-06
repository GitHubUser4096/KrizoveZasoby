<?php

session_start();

require_once '../../lib/php/db.php';
require_once '../../config/supplies.conf.php';
require_once '../internal/common.php';
// require_once 'api/internal/product.php';

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

// TODO check that charity exists and is not approved

$db->execute("delete from CharityUser where charityId=?", $charityId);
$db->execute("delete from CharityPlace where charityId=?", $charityId);
$db->execute("delete from Charity where id=?", $charityId);

?>