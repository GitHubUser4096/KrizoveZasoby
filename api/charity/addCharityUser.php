<?php

// sets a user as a charity worker
// TODO currently not used - charity workers are not implemented yet

// session_start();

// require_once '../../lib/php/db.php';
// require_once '../../config/supplies.conf.php';
// require_once '../internal/common.php';

// $db = new DB(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME, DB_DEBUG);

// checkAuth();
// checkPost();

// // TODO make sure user is authorized to do this

// $charityId = getParam('charityId');
// $email = $_POST['email']; // TODO verify

// $users = $db->query("select * from User where email=?", $email);

// if(!count($users)){
//   fail('404 Not found', 'User not found');
// }

// $id = $db->insert("insert into CharityUser(charityId, userId, isManager) values (?, ?, 0)", $charityId, $users[0]['id']);

// echo json_encode(['id'=>$id]);

?>