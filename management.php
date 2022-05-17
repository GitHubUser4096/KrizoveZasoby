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
      <a href="index.php"><img src="res/logo.png"></img></a>
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
          <!-- <button class="actionBtn">Návrhy změn</button>
          <button class="actionBtn">Produkty</button>
          <button class="actionBtn">Uživatelé</button> -->
        </div>
        <!-- <div class="newBagBtnDiv" id="newBagDiv">
          <input class="newBagInput" id="newBagInput" placeholder="Zadejte název"></input>
          <button class="newBagBtn" id="newBagBtn">+</button>
        </div> -->
        <!-- <div class="bottomBtnBox addBag">
          <button class="bottomBtn addBagBtn" id="btn_addBag">Přidat tašku</button>
        </div> -->
      </div>
      <div class="currentAction">
        <div class="items">
          <div class="listContent" id="itemListContainer">
            <!-- <div class="hintLabel">Navrhované změny:</div>
            <div class="itemContainer">
              Změna 1
            </div> -->
          </div>
        </div>
      </div>
      <!-- <div class="currentBag">
        <div class="items">
          <div class="lists">
            <div class="itemsTopBar">
              <span class="topBarItem">Název:</span>
              <select class="topBarSelect" id="nameDisplayOptions">
                <option value="brandFirst">Značka • Typ</option>
                <option value="typeFirst">Typ • Značka</option>
              </select>
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
        <div class="bagInfo">
          <form id="bagInfoForm">
            <div class="bagInfoTitle">
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
          <div class="bottomBtnBox donate">
            <button id="donateBtn" class="bottomBtn">Odevzdat</button>
          </div>
        </div>
      </div> -->
    </div>

    <div class="menu" id="menu">
      <!-- <div><button id="logoutBtn" class="menuItemBtn">Odhlásit se</button></div>
      <div><button id="donatedBagsBtn" class="menuItemBtn">Odevzdané Tašky</button></div>
      <div><button id="settingsBtn" class="menuItemBtn">Nastavení</button></div> -->
    </div>

  </body>
</html>
