<?php

session_start();

require_once '../../lib/php/db.php';
require_once '../../config/supplies.conf.php';
require_once '../internal/getConfig.php';
require_once '../internal/common.php';

$db = new DB(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME, DB_DEBUG);

/**
* List all user's donated bags
* Method: GET
* Returns: the bags (json)
**/

checkAuth();

$config = getConfig($db);

$userId = $_SESSION['user']['id'];

$bags = $db->query("select id, name, donatedDate from Bag where userId=? and donated order by donatedDate desc", $userId);

for($i=0; $i < count($bags); $i++) {

  $bags[$i]['donatedDateFmt'] = date($config['dateFormat'], strtotime($bags[$i]['donatedDate']));

}

echo json_encode($bags);

?>
