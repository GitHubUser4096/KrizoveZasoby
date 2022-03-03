<?php

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;
use PHPMailer\PHPMailer\SMTP;

require_once '../lib/php/db.php';
require_once '../config/supplies.conf.php';
require_once '../api/internal/getConfig.php';
require_once '../lib/php/formatDateDiff.php';
require_once '../config/mail.conf.php';
require_once '../config/notification.conf.php';
require_once '../lib/php/phpMailer/src/Exception.php';
require_once '../lib/php/phpMailer/src/PHPMailer.php';
require_once '../lib/php/phpMailer/src/SMTP.php';

if(!isSet($_GET['key']) || $_GET['key']!=NOTIFICATION_KEY){
  echo 'Missing or invalid security key!';
  return;
}

$db = new DB(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME);

$users = $db->query("select * from User");

$today = strtotime('today midnight');
$yesterday = strtotime('yesterday midnight');

foreach($users as $user){

  $config = getUserConfig($user['id'], $db);
  $criticalDiff = strtotime($config['criticalTime'])-time();
  $warnDiff = strtotime($config['warnTime'])-time();
  $recommendedDiff = strtotime($config['recommendedTime'])-time();

  $changedItems = [];
  $expiredBags = [];
  $criticalBags = [];
  $warnBags = [];
  $recommendedBags = [];
  $expiredCount = 0;
  $criticalCount = 0;
  $warnCount = 0;
  $recommendedCount = 0;

  $bags = $db->query("select * from Bag where userId=? and not handedOut", $user['id']);

  foreach($bags as $bag){

    $bagName = $bag['name'];
    $items = $db->query("select * from Item inner join Product on Product.id=productId where bagId=? and not used order by expiration", $bag['id']);

    foreach($items as $item){

      if(!$item['expiration']) continue;

      $expTime = strtotime($item['expiration']);

      if($yesterday==$expTime) {
        $changedItems[] = ['item'=>$item['name'], 'expTime'=>$expTime, 'count'=>$item['count'], 'bag'=>$bag['name'], 'state'=>'expired'];
      } else if($yesterday==$expTime-$criticalDiff) {
        $changedItems[] = ['item'=>$item['name'], 'expTime'=>$expTime, 'count'=>$item['count'], 'bag'=>$bag['name'], 'state'=>'critical'];
      } else if($yesterday==$expTime-$warnDiff) {
        $changedItems[] = ['item'=>$item['name'], 'expTime'=>$expTime, 'count'=>$item['count'], 'bag'=>$bag['name'], 'state'=>'warn'];
      } else if($yesterday  ==$expTime-$recommendedDiff) {
        $changedItems[] = ['item'=>$item['name'], 'expTime'=>$expTime, 'count'=>$item['count'], 'bag'=>$bag['name'], 'state'=>'recommended'];
      }

      if($expTime<$today){
        if(!in_array($bagName, $expiredBags)) $expiredBags[] = $bagName;
        $expiredCount++;
      } else if($expTime-$criticalDiff<$today){
        if(!in_array($bagName, $criticalBags)) $criticalBags[] = $bagName;
        $criticalCount++;
      } else if($expTime-$warnDiff<$today){
        if(!in_array($bagName, $warnBags)) $warnBags[] = $bagName;
        $warnCount++;
      } else if($expTime-$recommendedDiff<$today){
        if(!in_array($bagName, $recommendedBags)) $recommendedBags[] = $bagName;
        $recommendedCount++;
      }

    }

  }

  if(NOTIFICATION_DEBUG) echo '<h2>Oznámení pro uživatele '.$user['email'].'</h2>';

  if(count($changedItems)==0){
    if(NOTIFICATION_DEBUG) echo 'Žádné oznámení nebude vygenerováno<hr>';
    continue;
  }

  $str = '';

  $spanStyle = 'display: inline-block; padding: 5px; margin: 2px;';
  $expStyle = $spanStyle.' background: red; color: white;';
  $critStyle = $spanStyle.' background: #F70; color: white;';
  $warnStyle = $spanStyle.' background: #FF0;';
  $recStyle = $spanStyle.' background: #CF0;';

  $styles = ['expired'=>$expStyle, 'critical'=>$critStyle, 'warn'=>$warnStyle, 'recommended'=>$recStyle];

  $str .= '<h2>Tyto položky vyžadují vaší pozornost:</h2>';
  $str .= '<ul>';

  foreach($changedItems as $item){
    $str .= '<li><span style="'.$styles[$item['state']].'">';
    if($item['expTime']<$today) $str .= 'Položka <b>'.$item['item'].' x'.$item['count'].'</b> v tašce <b>'.$item['bag'].' vypršela!</b>';
    else $str .= 'Položka <b>'.$item['item'].' x'.$item['count'].'</b> v tašce <b>'.$item['bag'].'</b> vyprší <b>'.formatDateDiff($today, $item['expTime']).'</b>';
    $str .= '</span></li>';
  }

  $str .= '</ul>';
  $str .= "<h3>Stav vašich zásob:</h3>";

  if($expiredCount) $str .= '<div><span style="'.$expStyle.'">Vypršené položky: celkem <b>'.$expiredCount.'</b> v taškách <b>'.implode(', ', $expiredBags).'</b></span></div>';
  if($criticalCount) $str .= '<div><span style="'.$critStyle.'">Položky v kritickém stavu: celkem <b>'.$criticalCount.'</b> v taškách <b>'.implode(', ', $criticalBags).'</b></span></div>';
  if($warnCount) $str .= '<div><span style="'.$warnStyle.'">Položky s varováním: celkem <b>'.$warnCount.'</b> v taškách <b>'.implode(', ', $warnBags).'</b></span></div>';
  if($recommendedCount) $str .= '<div><span style="'.$recStyle.'">Položky s doporučeným odevzdáním: celkem <b>'.$recommendedCount.'</b> v taškách <b>'.implode(', ', $recommendedBags).'</b></span></div>';

  $str .= '<p><a target="blank" href="http://'.$_SERVER['HTTP_HOST'].'/profile.php">Přejít do mých zásob</a></p>';

  if(NOTIFICATION_DEBUG) echo $str;

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

    $mail->addAddress($user['email']);

    $mail->isHtml(true);
    $mail->Subject = "Některé vaše zásoby vyžadují vaší pozornost!";
    $mail->Body = $str;

    $sent = $mail->send();

    if($sent) echo '<br>Mail sent';

  } catch(Exception $e){
    echo '<br>Mail not sent: '.$e;
  }

  if(NOTIFICATION_DEBUG) echo '<hr>';

}

echo '<br>Sending done!';

?>
