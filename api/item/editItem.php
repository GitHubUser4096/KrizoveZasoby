<?php

session_start();

require_once '../../lib/php/db.php';
require_once '../../config/supplies.conf.php';
require_once '../../lib/php/formatDateDiff.php';
require_once '../internal/getConfig.php';
require_once '../internal/common.php';
require_once '../internal/bag.php';
require_once '../internal/item.php';
require_once '../internal/product.php';

$db = new DB(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME, DB_DEBUG);

/**
* Edit Item
* Method: POST
* Get: itemId*
* Post: count*, expiration
* Returns: edited item (json)
**/

checkAuth();
checkPost();

$itemId = getParam('itemId');

$count = validate(['name'=>'count', 'required'=>true, 'type'=>'int', 'min'=>1, 'max'=>99]);

$expiration = validate(['name'=>'expiration', 'type'=>'date']);

$item = verifyItem($itemId, $db);

if(!$expiration) $otherItems = $db->query("select * from Item where bagId=? and productId=? and expiration is null and used=? and id!=?", $item['bagId'], $item['productId'], $item['used'], $itemId);
else $otherItems = $db->query("select * from Item where bagId=? and productId=? and expiration=? and used=? and id!=?", $item['bagId'], $item['productId'], $expiration, $item['used'], $itemId);

if(count($otherItems)>0){
  $newCount = $otherItems[0]['count']+$count;
  $db->execute("update Item set count=? where id=?", $newCount, $otherItems[0]['id']);
  $db->execute("delete from Item where id=?", $itemId);

  echo json_encode(getItemById($otherItems[0]['id'], $db));

  return;
}

$db->execute("update Item set count=?, expiration=? where id=?", $count, $expiration, $itemId);

echo json_encode(getItemById($itemId, $db));

?>
