<?php

session_start();

// TODO common checks

if(!isSet($_SESSION['user'])){
  header('HTTP/1.1 403 Forbidden');
  echo 'Not logged in.';
  exit;
}

if($_SERVER['REQUEST_METHOD']!=='POST'){
  header('HTTP/1.1 400 Bad request');
  echo 'Method must be post.';
  exit;
}

// TODO any other image checks needed?

if(!isSet($_FILES['file']['tmp_name'])){
  header('HTTP/1.1 400 Bad request');
  echo 'No file uploaded or file too large.';
  exit;
}

if(!getimagesize($_FILES['file']['tmp_name'])){
  header('HTTP/1.1 400 Bad request');
  echo 'Invalid image.';
  exit;
}

$pathInfo = pathinfo($_FILES['file']['name']);

if(!in_array(strtolower($pathInfo['extension']), ['jpg', 'jpeg', 'png', 'gif'])){
  header('HTTP/1.1 400 Bad request');
  echo 'Invalid file extension.';
  exit;
}

$filename = substr(preg_replace("/[^A-Za-z0-9_-]/", '', $pathInfo['filename']), 0, 32).'_'.uniqid().'.'.$pathInfo['extension'];
$path = '../../images/'.$filename;

if(file_exists($path)){
  header('HTTP/1.1 400 Bad request');
  echo 'Name collision. Try again';
  exit;
}

$uploaded = move_uploaded_file($_FILES['file']['tmp_name'], $path);
if(!$uploaded){
  header('HTTP/1.1 500 Internal server error');
  echo 'Failed to upload.';
  exit;
}

echo $filename;

?>
