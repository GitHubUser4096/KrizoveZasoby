<?php

session_start();

// TODO common checks?

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

if(!isSet($_FILES['file']['tmp_name'])){
  header('HTTP/1.1 400 Bad request');
  echo 'No file uploaded or file too large.';
  exit;
}

if(!$_FILES['file']['tmp_name']){
  header('HTTP/1.1 400 Bad request');
  echo 'Missing filename.';
  exit;
}

$size = getimagesize($_FILES['file']['tmp_name']);

if(!$size){
  header('HTTP/1.1 400 Bad request');
  echo 'Invalid image.';
  exit;
}

$x = 0;
$y = 0;
$width = $size[0];
$height = $size[1];

if($width>$height){
  $x = ($width-$height)/2;
  $width = $height;
} else {
  $y = ($height-$width)/2;
  $height = $width;
}

$newWidth = 640;
$newHeight = 640;

$src = imagecreatefromstring(file_get_contents($_FILES['file']['tmp_name']));
$dst = imagecreatetruecolor($newWidth, $newHeight);
$white = imagecolorallocate($dst, 255, 255, 255);
imagefill($dst, 0, 0, $white);
imagecopyresampled($dst, $src, 0, 0, $x, $y, $newWidth, $newHeight, $width, $height);

$pathInfo = pathinfo($_FILES['file']['name']);

if(!isSet($pathInfo['extension']) || !in_array(strtolower($pathInfo['extension']), ['jpg', 'jpeg', 'png', 'gif'])){
  header('HTTP/1.1 400 Bad request');
  echo 'Invalid file extension.';
  exit;
}

$userName = $_SESSION['user']['email'];
$atPos = strpos($userName, '@');
if($atPos>0){
  $userName = substr($userName, 0, $atPos);
}

$filename = substr(preg_replace("/[^A-Za-z0-9_-]/", '', $userName.'_'.$pathInfo['filename']), 0, 32).'_'.uniqid().'.'.$pathInfo['extension'];
$path = '../../images/'.$filename;

if(file_exists($path)){
  header('HTTP/1.1 400 Bad request');
  echo 'Name collision. Try again';
  exit;
}

$saved = imagepng($dst, $path);
if(!$saved) {
  header('HTTP/1.1 500 Internal server error');
  echo 'Failed to upload.';
  exit;
}

echo $filename;

?>
