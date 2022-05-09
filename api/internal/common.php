<?php

function fail($status, $msg){
  header('HTTP/1.1 '.$status);
  echo $msg;
  exit;
}

function checkAuth(){
  if(!isSet($_SESSION['user'])){
    fail('401 Unauthorized', 'Unauthorized');
  }
}

function checkPost(){
  if($_SERVER['REQUEST_METHOD']!=='POST'){
    fail('400 Bad request', 'Method must be POST');
  }
}

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
      // TODO if date is in some weird format (ex. '2000-01' or 'today'), strtotime accepts it but DB does not
      if(!strtotime($value)){
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

?>
