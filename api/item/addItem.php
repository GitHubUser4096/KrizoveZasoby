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
Add Item
Method: POST
Get: bagId*
Post: productId*, count*, expiration
Returns: item (json)
**/

checkAuth();
checkPost();

$bagId = getParam('bagId');

$count = validate(['name'=>'count', 'required'=>true, 'type'=>'int', 'min'=>1, 'max'=>99999]);

$expiration = validate(['name'=>'expiration', 'type'=>'date']);

$productId = validate(['name'=>'productId', 'required'=>true]);

verifyBag($bagId, $db);

$products = $db->query("select * from Product where id=?", $productId);

if(count($products)==0){
  header('HTTP/1.1 400 Bad request');
  echo 'Invalid product.';
  exit;
}

if(!$expiration) $items = $db->query("select * from Item where bagId=? and productId=? and expiration is null and used=0", $bagId, $productId);
else $items = $db->query("select * from Item where bagId=? and productId=? and expiration=? and used=0", $bagId, $productId, $expiration);

if(count($items)>0){
  $newCount = $items[0]['count']+$count;
  $db->execute("update Item set count=? where id=?", $newCount, $items[0]['id']);

  echo json_encode(getItemById($items[0]['id'], $db));

  return;
}

$itemId = $db->insert("insert into Item(bagId, productId, count, expiration) values (?, ?, ?, ?)", $bagId, $productId, $count, $expiration);

echo json_encode(getItemById($itemId, $db));

?>
