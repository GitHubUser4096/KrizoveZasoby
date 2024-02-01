<?php

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;
use PHPMailer\PHPMailer\SMTP;

require_once '../lib/php/db.php';
require_once '../config/supplies.conf.php';
require_once '../config/mail.conf.php';
require_once '../lib/php/phpMailer/src/Exception.php';
require_once '../lib/php/phpMailer/src/PHPMailer.php';
require_once '../lib/php/phpMailer/src/SMTP.php';

// if(!isSet($_GET['key']) || $_GET['key']!=NOTIFICATION_KEY){
//   echo 'Missing or invalid security key!';
//   return;
// }

$db = new DB(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME, DB_DEBUG);

$products = $db->query("select shortDesc, Brand.name as 'brand', code, imgName, PackageType.name as 'package', amountValue, amountUnit, User.email as 'createdBy'
  from Product
    left join Brand on Brand.id=Product.brandId
    left join PackageType on PackageType.id=Product.packageTypeId
    left join User on User.id=Product.createdBy
  where notified=0");
$edits = $db->query("select
    Product.shortDesc as 'oldShortDesc', changedShortDesc, ProductEditSuggestion.shortDesc as 'newShortDesc',
    OldBrand.name as 'oldBrand', changedBrandId, NewBrand.name as 'newBrand',
    Product.code as 'oldCode', changedCode, ProductEditSuggestion.code as 'newCode',
    Product.amountValue as 'oldAmountValue', changedAmountValue, ProductEditSuggestion.amountValue as 'newAmountValue',
    Product.amountUnit as 'oldAmountUnit', changedAmountUnit, ProductEditSuggestion.amountUnit as 'newAmountUnit',
    OldPackage.name as 'oldPackage', changedPackageTypeId, NewPackage.name as 'newPackage',
    Product.imgName as 'oldImg', changedImgName, ProductEditSuggestion.imgName as 'newImg',
    User.email
  from ProductEditSuggestion
    left join Product on Product.id=productId
    left join Brand OldBrand on OldBrand.id=Product.brandId
    left join Brand NewBrand on NewBrand.id=ProductEditSuggestion.brandId
    left join PackageType OldPackage on OldPackage.id=Product.packageTypeId
    left join PackageType NewPackage on NewPackage.id=ProductEditSuggestion.packageTypeId
    left join User on User.id=editedBy
  where ProductEditSuggestion.notified=0");
$charities = $db->query("select * from Charity where notified=0");

if(!count($products) && !count($edits) && !count($charities)) exit();

// Brand.name as 'brand', code, imgName, PackageType.name as 'package', amountValue, amountUnit

// print_r($charities);

$str = '';

if(count($products)) $str .= '<h1>Nové produkty</h1>';

foreach($products as $product) {
  $str .= '<h2>'.$product['shortDesc'].'</h2>';
  $str .= '<li>Značka: '.$product['brand'].'</li>';
  if($product['amountValue']) $str .= '<li>Množství: '.$product['amountValue'].' '.$product['amountUnit'].'</li>';
  else $str .= '<li>Množství: </li>';
  $str .= '<li>Kód: '.$product['code'].'</li>';
  $str .= '<li>Balení: '.$product['package'].'</li>';
  $str .= '<li>Obrázek: <a href="http://'.$_SERVER['SERVER_NAME'].'/images/'.$product['imgName'].'">'.$product['imgName'].'</a></li>';
  $str .= '<li>Přidal: '.$product['createdBy'].'</li>';
}

if(count($edits)) $str .= '<h1>Návrhy změn produktů</h1>';

foreach($edits as $edit) {
  $str .= '<h2>'.$edit['oldShortDesc'].'</h2>';
  if($edit['changedShortDesc']) $str .= '<li>Název: <b>'.$edit['oldShortDesc'].' -> '.$edit['newShortDesc'].'</b></li>';
  else $str .= '<li>Název: '.$edit['oldShortDesc'].'</li>';
  if($edit['changedBrandId']) $str .= '<li>Značka: <b>'.$edit['oldBrand'].' -> '.$edit['newBrand'].'</b></li>';
  else $str .= '<li>Značka: '.$edit['oldBrand'].'</li>';
  if($edit['changedCode']) $str .= '<li>Kód: <b>'.$edit['oldCode'].' -> '.$edit['newCode'].'</b></li>';
  else $str .= '<li>Kód: '.$edit['oldCode'].'</li>';
  if($edit['changedAmountValue'] || $edit['changedAmountUnit']) $str .= '<li>Množství: <b>'.$edit['oldAmountValue'].' '.$edit['oldAmountUnit'].' -> '.$edit['newAmountValue'].' '.$edit['newAmountUnit'].'</b></li>';
  else $str .= '<li>Množství: '.$edit['oldAmountValue'].' '.$edit['oldAmountUnit'].'</li>';
  if($edit['changedPackageTypeId']) $str .= '<li>Balení: <b>'.$edit['oldPackage'].' -> '.$edit['newPackage'].'</b></li>';
  else $str .= '<li>Balení: '.$edit['oldPackage'].'</li>';
  if($edit['changedImgName']) $str .= '<li>Obrázek: <b><a href="http://'.$_SERVER['SERVER_NAME'].'/images/'.$edit['newImg'].'">'.$edit['newImg'].'</a></b></li>';
  $str .= '<li>Změnu navrhl: '.$edit['email'].'</li>';
}

if(count($charities)) $str .= '<h1>Nové charity</h1>';

foreach($charities as $charity) {
  $str .= '<h2>'.$charity['name'].'</h2>';
  $str .= '<li>Identifikační číslo: '.$charity['orgId'].'</li>';
  $str .= '<li>Web: '.$charity['contactWeb'].'</li>';
  $str .= '<li>E-mail: '.$charity['contactMail'].'</li>';
  $str .= '<li>Telefon: '.$charity['contactPhone'].'</li>';
  $places = $db->query("select * from CharityPlace where charityId=?", $charity['id']);
  // print_r($places);
  $str .= '<li>Místa:</li><ul>';
  foreach($places as $place) {
    $str .= '<li>'.$place['street'].', '.$place['place'].', '.$place['postCode'].'</li><ul>';
    $str .= '<li>Poznámka: '.$place['note'].'</li>';
    $str .= '<li>Otevírací doba: '.$place['openHours'].'</li>';
    $str .= '<li>Web: '.$place['contactWeb'].'</li>';
    $str .= '<li>E-mail: '.$place['contactMail'].'</li>';
    $str .= '<li>Telefon: '.$place['contactPhone'].'</li>';
    $str .= '</ul>';
  }
  $str .= '</ul>';
}

$str .= '<a href="http://'.$_SERVER['SERVER_NAME'].'/management.php">Otevřít správu webu</a>';

// echo $str;

$users = $db->query("select email from User where userRole='admin'");

// print_r($users);

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

foreach($users as $user) {
  $mail->addAddress($user['email']);
}

$mail->isHtml(true);
$mail->Subject = "Změny v krizových zásobách";
$mail->Body = $str;

$sent = $mail->send();

$db->execute("update Product set notified=1 where notified=0");
$db->execute("update ProductEditSuggestion set notified=1 where notified=0");
$db->execute("update Charity set notified=1 where notified=0");

?>