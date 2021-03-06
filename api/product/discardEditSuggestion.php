<?php

session_start();

require_once '../../lib/php/db.php';
require_once '../../config/supplies.conf.php';
require_once '../internal/common.php';
// require_once 'api/internal/product.php';

$db = new DB(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME, DB_DEBUG);

checkAuth();
checkPost();
checkRole('editor');

$editId = getParam('editId');

$suggestions = $db->query("select * from ProductEditSuggestion where id=?", $editId);

if(count($suggestions)==0){
  fail('404 Not found', 'Suggestion does not exist!');
}

$db->execute("delete from ProductEditSuggestion where id=?", $editId);

?>