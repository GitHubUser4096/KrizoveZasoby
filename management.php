<?php

session_start();

if(!isSet($_SESSION['user'])){
  header('Location: index.php?reauth');
  return;
}

?>
<!DOCTYPE html>
<html lang="cs" dir="ltr">
  <head>
    <script>
      let loadHeadStart = performance.now();
    </script>
    <meta charset="utf-8">
    <title>Krizové zásoby</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="icon" href="res/icon.png">
    <link rel="stylesheet" href="css/management.css.php">
    <script src="js/management.js.php" charset="utf-8"></script>
    <script>
      console.log('loading head done', performance.now()-loadHeadStart, 'ms');
    </script>
  </head>
  <body>

    <div class="background"></div>

    <div class="titlebar">
      <!-- <a href="profile.php"><img src="res/logo.png"></img></a> -->
      <a class="titleLink" href="profile.php">
        <img class="titleImg" src="res/icon.png"></img>
        <span class="titleText">Krizové Zásoby</span>
      </a>
      <span class="userMenu">
        <div class="userNameField" id="userNameField"></div>
        <button class="menuBtn" id="menuBtn"><img src="res/menu.png"></img></button>
      </span>
    </div>
    <div id="statusBar" class="statusbar"><button id="statusBarBackBtn" class="statusBarBackBtn">&lt;</button>Správa webu</div>
    <div id="main" class="main">
      <div class="actions">
        <div class="actionsTitle">Možnosti:</div>
        <div id="div_actionList" class="actionList">
        </div>
      </div>
      <div class="currentAction">
        <div class="items">
          <div class="listContent" id="itemListContainer">
          </div>
        </div>
      </div>
    </div>
    <div class="offlineOverlay" id="offlineOverlay">
      <div class="offlineBox"><img src="res/warning.png"></img> Chyba připojení</div>
    </div>

    <div class="menu" id="menu"></div>

  </body>
</html>
