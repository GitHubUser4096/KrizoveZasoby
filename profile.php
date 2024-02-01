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
    <link rel="stylesheet" href="css/profile.css.php">
    <script src="js/profile.js.php" charset="utf-8"></script>
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.8.0/dist/leaflet.css"
        integrity="sha512-hoalWLoI8r4UszCkZ5kL8vayOGVae1oxXe/2A4AO6J9+580uKHDO3JdHb7NzwwzK5xr/Fs0W40kiNHxM9vyTtQ=="
        crossorigin=""/>
    <script src="https://unpkg.com/leaflet@1.8.0/dist/leaflet.js"
        integrity="sha512-BB3hKbKWOc9Ez/TAwyWxNXeoV9c1v6FIeYiBieIWkpLjauysF18NzgR1MBNBXf8/KABdlkX68nAhlwcDFLGPCQ=="
        crossorigin=""></script>
    <script>
      console.log('loading head done', performance.now()-loadHeadStart, 'ms');
    </script>
  </head>
  <body>

    <div class="background"></div>

    <div class="titlebar">
      <a class="titleLink" href="profile.php">
        <img class="titleImg" src="res/icon.png"></img>
        <span class="titleText">Krizové Zásoby</span>
      </a>
      <span class="userMenu">
        <div class="userNameField" id="userNameField"></div>
        <button class="menuBtn" id="menuBtn"><img src="res/menu.png"></img></button>
      </span>
    </div>
    <div id="statusBar" class="statusbar"></div>
    <div id="initScreen" class="initScreen">
      <div class="initTitle">Vítejte v krizových zásobách!</div>
      <div class="initSubtitle">Začněte přidáním tašky.</div>
      <form class="initForm" id="initForm">
        <div class="initFormRow">
          <div class="initFormLabel">Název:</div>
          <input name="bagName" maxlength="64" class="initFormInput" placeholder="např. Taška 1"></input>
        </div>
        <div class="initFormRow">
          <div class="initFormLabel">Popis:</div>
          <textarea name="bagDesc" maxlength="1024" class="initFormTextarea"></textarea>
        </div>
        <button type="submit" class="initFormSubmit">Přidat</button>
      </form>
    </div>
    <div id="main" class="main">
      <div id="div_bags" class="bags mobileHidden">
        <div class="bagsTitle">
          <button id="bagsBackBtn" class="bagsBackBtn"><img src="res/back.png"></img></button>
          <span class="bagsTitleText">Tašky:</span>
        </div>
        <div id="div_bagList" class="bagList"></div>
        <div class="bottomBtnBox addBag">
          <button class="bottomBtn addBagBtn" id="btn_addBag">Přidat tašku</button>
        </div>
      </div>
      <div id="div_currentBag" class="currentBag">
        <div id="div_items" class="items">
          <div class="lists">
            <div class="mobileControls">
              <div id="mobileBagsBtn" class="mobileBagsBtn">
                <img src="res/menu.png"></img>
                <span id="mobileBagName">Tašky</span>
              </div>
              <div id="mobileBagInfoBtn" class="mobileBagInfoBtn">
                <img src="res/edit.png"></img>
              </div>
            </div>
            <div class="itemsTopBar">
              <!-- <span class="topBarItem">Název:</span>
              <select class="topBarSelect" id="nameDisplayOptions">
                <option value="brandFirst">Značka • Typ</option>
                <option value="typeFirst">Typ • Značka</option>
              </select> -->
              <span class="topBarItem">Řazení:</span>
              <select class="topBarSelect" id="sortOptions">
                <option value="date">Datum</option>
                <option value="name">Název</option>
              </select>
            </div>
            <div class="listContent" id="itemListContainer">
            </div>
          </div>
          <div class="bottomBtnBox addItem">
            <button class="bottomBtn" id="btn_addItem">Přidat položku</button>
          </div>
        </div>
        <div id="div_bagInfo" class="bagInfo mobileHidden">
          <div class="bagInfoBox">
            <form id="bagInfoForm">
              <div class="bagInfoTitle">
                <button id="bagInfoBackBtn" class="bagInfoBackBtn"><img src="res/back.png"></img></button>
                <input name="bagName" maxlength="64" class="bagInfoName"></input>
                <button type="button" name="deleteBag" class="deleteBagBtn">
                  <img class="enImg" src="res/delete.png" title="Smazat tašku"></img>
                  <img class="disImg" src="res/delete_disabled.png" title="Nelze smazat plnou tašku!"></img>
                </button>
              </div>
              <div class="bagInfoContent">
                <div class="bagInfoText">
                  Kdy odevzdat nevypršené položky:
                  <div id="div_bagDates"></div>
                </div>
                <textarea class="bagNotesInput" name="bagNotes" maxlength="1024" placeholder="Popis"></textarea>
              </div>
            </form>
          </div>
          <div class="bottomBtnBox donate">
            <button id="donateBtn" class="bottomBtn">Odevzdat</button>
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
