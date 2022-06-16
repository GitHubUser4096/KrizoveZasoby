<?php

// session_start();

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;
use PHPMailer\PHPMailer\SMTP;

require_once '../../lib/php/db.php';
require_once '../../lib/php/phpMailer/src/Exception.php';
require_once '../../lib/php/phpMailer/src/PHPMailer.php';
require_once '../../lib/php/phpMailer/src/SMTP.php';
require_once '../../config/supplies.conf.php';
require_once '../../config/mail.conf.php';
require_once '../internal/common.php';

$db = new DB(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME, DB_DEBUG);

// check post, check that mail is included
checkPost();

if(!isSet($_POST['email'])){
  header('HTTP/1.1 400 Bad request');
  echo 'E-mail is not defined.';
  exit;
}

// get and verify the user
$users = $db->query("select * from User where email=?", $_POST['email']);

// good security practice - don't let the user know if user exists or not
if(count($users)==0){
  // header('HTTP/1.1 400 Bad request');
  // echo 'Uživate neexistuje!';
  exit;
}

$userId = $users[0]['id'];

// generate code

// brute forcing 1 code per 1ms - worst case should take 102304247919 years (secure enough) - TODO are my calculations right?
// TODO is this generation predictable in some way? (should not be)
$code = random_bytes(9); // start with 9 random bytes (aligns to 12 base64 characters) ('cryptographically secure' according to php manual)
// $code = hash('md5', $code); // hash it to make it a hex string of fixed length
// $code = substr($code, 0, 9); // get only 9 characters from it (9 aligns nicely for base64, output is 12 chars which should be a reasonable length)
// $code = bin2hex($code);
$code = base64_encode($code); // encode it to base64 to make it human-readable
// $code = substr($code, 0, 12);
// slash and plus (possible base64 values) can mess with URLs, change them to something else
// since we don't need to decode it back, we can choose anything
$code = str_replace('/', 'A', $code);
$code = str_replace('+', 'B', $code);

$expires = strtotime('+1 day');

// TODO DO NOT USE THIS! (except for debug), THIS PAGE **MUST NEVER** REVEAL THE CODE!
// echo json_encode(['code'=>$code, 'expires'=>date('Y-m-d H:i:s', $expires)]);
// return;

// save database entry
$db->insert("insert into ResetPasswordRequests(userId, code, expires) values(?, ?, ?)", $userId, $code, date('Y-m-d H:i:s', $expires));

// send mail

// <title>Obnovení hesla k vašemu účtu</title>
// <big>Kód: [code]</big>
// Kód zadejte na stránce, kde jste požádali o obnovení hesla (?) nebo <<< zde (link) >>>
// Kód je platný do: [expires]
// Pokud jste nepožádali o obnovení hesla ...?
$str = '<div>Obnovení hesla:</div>';
$str .= '<div>Kód: '.$code.'</div>';
$url = $_SERVER['HTTP_HOST'].'/index.php?resetPassword&email='.$_POST['email'].'&code='.$code;
$str .= '<div>Odkaz: <a href="'.$url.'">'.$url.'</div>';
$str .= '<div>Kód vyprší: '.date('Y-m-d H:i:s', $expires).'</div>';

// TODO this is a possible vulnerability - sending an e-mail is slow
// anyone can easily find whether the mail was sent (and an account exists) based on response delay
// TODO figure out a platform-independent background task solution (working both on localhost and hosting)

try {

  $mail = new PHPMailer(true);

  $mail->CharSet = "UTF-8";
  // $mail->SMTPDebug = SMTP::DEBUG_SERVER;
  $mail->isSmtp();
  $mail->Host = MAIL_HOST;
  $mail->SMTPAuth = true;
  $mail->Username = MAIL_USERNAME;
  $mail->Password = MAIL_PASSWORD;
  $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
  $mail->Port = 12345;

  $mail->setFrom(MAIL_FROM, 'Krizové Zásoby');

  $mail->addAddress($_POST['email']);

  $mail->isHtml(true);
  $mail->Subject = "Zapomenuté heslo";
  $mail->Body = $str;

  $sent = $mail->send();

  // if($sent) echo '<br>Mail sent';

} catch(Exception $e){
  // echo '<br>Mail not sent: '.$e;
  // header('HTTP/1.1 400 Bad request');
  // echo 'Nelze odeslat e-mail!';
  exit;
}

?>