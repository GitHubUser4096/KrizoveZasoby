<?php

session_start();

if($_SERVER['REQUEST_METHOD']==='POST'){
  session_regenerate_id();
  session_destroy();
}

?>
