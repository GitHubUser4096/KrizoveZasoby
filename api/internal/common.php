<?php

// TODO possibly do database init and user init ($user = ...) here?

function fail($status, $msg){
  header('HTTP/1.1 '.$status);
  echo $msg;
  exit;
}

/** check that user is logged in, otherwise exits with http 401 **/
function checkAuth(){
  // TODO temp solution to make sure user roles are up-to-date
  if(!isSet($_SESSION['user'])){
    fail('401 Unauthorized', 'Unauthorized');
  }
  $db = new DB(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME, DB_DEBUG);
  $users = $db->query("select * from User where id=?", $_SESSION['user']['id']);
  // dealing with sensitive data, make sure only necessary info is sent
  $user = [
    'id'=>$users[0]['id'],
    'email'=>$users[0]['email'],
    'userRole'=>$users[0]['userRole']
  ];
  $_SESSION['user'] = $user;
  checkRole('viewer'); // if user is disabled, checkAuth will fail
}

/** check that request method is POST, otherwise exits with http 400 **/
function checkPost(){
  if($_SERVER['REQUEST_METHOD']!=='POST'){
    fail('400 Bad request', 'Method must be POST');
  }
}

/** returns whether user has the requested qualification **/
function getRole($roleName){
  if(!isSet($_SESSION['user'])) return false; // if user is not logged in, any role check will fail
  $roleNames = ['disabled', 'viewer', 'contributor', 'editor', 'admin'];
  $requested = array_search($roleName, $roleNames); // find the level of requested role
  $actual = array_search($_SESSION['user']['userRole'], $roleNames); // level of actual role
  return $actual>=$requested; // actual role level has to be greater than or equal to requested role
}

/** checks if user has the requested qualification, otherwise exits with http 403 **/
function checkRole($roleName){
  if(!getRole($roleName)){
    fail('403 Forbidden', 'User is not qualified for this action');
  }
}

/** returns a GET parameter if defined, otherwise exits with http 400 **/
function getParam($name){
  if(!isSet($_GET[$name])){
    fail('400 Bad request', 'parameter '.$name.' is missing');
  }
  return $_GET[$name];
}

/** Validates a POST input - if correct, returns the value, otherwise exits with 400 Bad request **/
function validate($input){

  if(!isSet($_POST[$input['name']])){
    fail('400 Bad request', $input['name'].' is missing');
    return null;
  }

  $value = trim($_POST[$input['name']]);

  if(strlen($value)==0){
    if(isSet($input['required']) && $input['required']){
      fail('400 Bad request', $input['name'].' is required');
    }
    return null;
  }
  if(isSet($input['maxLength']) && strlen($value)>$input['maxLength']){
    fail('400 Bad request', $input['name'].' exceeded max length');
  }
  if(isSet($input['type'])){
    if($input['type']=='int'){
      // TODO int limit (overflow) check
      if(strval($value)!==strval(intval($value))){
        fail('400 Bad request', $input['name'].' is not an integer');
      }
      if(isSet($input['min']) && intval($value)<$input['min']){
        fail('400 Bad request', $input['name'].' has to be at least '.$input['min']);
      }
      if(isSet($input['max']) && intval($value)>$input['max']){
        fail('400 Bad request', $input['name'].' has to be at most '.$input['max']);
      }
    } else if($input['type']=='date'){
      if(date('Y-m-d', strtotime($value))!=$value){
        fail('400 Bad request', $input['name'].' is not a valid date');
      }
      if(strtotime($value)<strtotime('1901-01-01') || strtotime($value)>=strtotime('3001-01-01')){
        fail('400 Bad request', $input['name'].' is out of range');
      }
    }
  }
  if(isSet($input['enum'])){
    if(strlen($value)>0 && !in_array($value, $input['enum'])){
      fail('400 Bad request', $input['name'].' is an incorrect enum value');
    }
  }

  if(isSet($input['type']) && $input['type']=='int'){
    return intval($value);
  }

  return $value;

}

// TODO belongs to utils.php
function has($array, $filter){
  foreach($array as $e){
    if($filter($e)) return true;
  }
  return false;
}

?>
