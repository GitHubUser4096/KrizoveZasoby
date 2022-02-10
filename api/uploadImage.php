<?php

session_start();

if(!isSet($_SESSION['user'])){
  header('HTTP/1.1 403 Forbidden');
  echo 'Not logged in.';
  return;
}

if($_SERVER['REQUEST_METHOD']!=='POST'){
  header('HTTP/1.1 400 Bad request');
  echo 'Method must be post.';
  return;
}

if(!isSet($_FILES['file']['tmp_name'])){
  header('HTTP/1.1 400 Bad request');
  echo 'No file uploaded or file too large.';
  return;
}

if(!getimagesize($_FILES['file']['tmp_name'])){
  header('HTTP/1.1 400 Bad request');
  echo 'Invalid image.';
  return;
}

$pathInfo = pathinfo($_FILES['file']['name']);

if(!in_array(strtolower($pathInfo['extension']), ['jpg', 'jpeg', 'png', 'gif'])){
  header('HTTP/1.1 400 Bad request');
  echo 'Invalid file extension.';
  return;
}

$filename = substr(preg_replace("/[^A-Za-z0-9_-]/", '', $pathInfo['filename']), 0, 32).'_'.uniqid().'.'.$pathInfo['extension'];
$path = '../images/'.$filename;

if(file_exists($path)){
  header('HTTP/1.1 400 Bad request');
  echo 'Name collision. Try again';
  return;
}

$uploaded = move_uploaded_file($_FILES['file']['tmp_name'], $path);
if(!$uploaded){
  header('HTTP/1.1 500 Internal server error');
  echo 'Failed to upload.';
  return;
}

echo $filename;

?>
