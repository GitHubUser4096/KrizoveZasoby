<?php

session_start();

if($_SERVER['REQUEST_METHOD']==='POST'){
  // session_unset();
  // session_abort();
  session_destroy();
} else {
  header('HTTP/1.1 400 Bad request');
  echo 'Method must be POST.';
}

?>
