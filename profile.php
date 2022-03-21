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
    <meta charset="utf-8">
    <title>Krizové zásoby</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="icon" href="res/icon.png">
    <link rel="stylesheet" href="css/general.css">
    <link rel="stylesheet" href="css/item.css">
    <link rel="stylesheet" href="css/profile.css">
    <link rel="stylesheet" href="css/form.css">
    <link rel="stylesheet" href="css/addItemDialog.css">
    <link rel="stylesheet" href="css/editItemDialog.css">
    <link rel="stylesheet" href="css/useItemDialog.css">
    <link rel="stylesheet" href="css/unuseItemDialog.css">
    <link rel="stylesheet" href="css/moveItemDialog.css">
    <link rel="stylesheet" href="css/addProductDialog.css">
    <link rel="stylesheet" href="css/searchDialog.css">
    <link rel="stylesheet" href="css/userMenuDialog.css">
    <link rel="stylesheet" href="css/settingsDialog.css">
    <link rel="stylesheet" href="css/handedOutBagsDialog.css">
    <script src="lib/js/XHR.js" charset="utf-8"></script>
    <script src="lib/js/cache.js" charset="utf-8"></script>
    <script src="js/addItem.js" charset="utf-8"></script>
    <script src="js/editItem.js" charset="utf-8"></script>
    <script src="js/addProduct.js" charset="utf-8"></script>
    <script src="js/editItem.js" charset="utf-8"></script>
    <script src="js/useItem.js" charset="utf-8"></script>
    <script src="js/unuseItem.js" charset="utf-8"></script>
    <script src="js/moveItem.js" charset="utf-8"></script>
    <script src="js/charities.js" charset="utf-8"></script>
    <script src="js/searchDialog.js" charset="utf-8"></script>
    <script src="js/userMenu.js" charset="utf-8"></script>
    <script src="js/settings.js" charset="utf-8"></script>
    <script src="js/handedOutBags.js" charset="utf-8"></script>
    <script src="js/item.js" charset="utf-8"></script>
    <script src="js/profile.js" charset="utf-8"></script>
  </head>
  <body>

    <div class="background"></div>

    <div class="titlebar">
      <a href="index.php"><img src="res/logo.png"></img></a>
      <span class="userMenu">
        <!--button id="searchBtn">HLEDAT</button-->
        <button class="menuBtn" id="menuBtn"><img src="res/menu.png"></img></button>
      </span>
    </div>
    <div id="statusBar" class="statusbar"></div>
    <div id="initScreen" class="initScreen">
      <div class="initTitle">Vítejte v krizových zásobách.</div>
      <div class="initSubtitle">Začněte přidáním tašky.</div>
      <form class="initForm" id="initForm">
        <label class="initFormField">
          Název:
          <input name="bagName" class="initFormInput" placeholder="např. Taška 1"></input>
        </label>
        <button type="submit" class="initFormSubmit">Přidat</button>
      </form>
    </div>
    <div id="main" class="main">
      <div class="bags">
        <div class="bagsTitle">Tašky:</div>
        <div id="div_bagList" class="bagList"></div>
        <div class="newBagBtnDiv" id="newBagDiv">
          <input class="newBagInput" id="newBagInput" placeholder="Zadejte název"></input>
          <button class="newBagBtn" id="newBagBtn">+</button>
        </div>
        <!-- <div class="bottomBtnBox newBag">
          <button class="bottomBtn" id="btn_addBag">Přidat tašku</button>
        </div> -->
      </div>
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
            <!-- <span class="topBarItem">Vypršení:</span>
            <select class="topBarSelect" id="dateFormatOptions">
              <option value="YMD">RRRR-MM-DD</option>
              <option value="DMY">DD. MM. RRRR</option>
              <option value="inD">za D dnů</option>
              <option value="inYMD">za R r, M m, D d</option>
            </select> -->
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
            <input name="bagName" class="bagInfoName"></input>
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
            <textarea class="bagNotesInput" name="bagNotes" placeholder="Poznámky"></textarea>
          </div>
        </form>
        <div class="bottomBtnBox handOut">
          <button id="handOutBtn" class="bottomBtn">Odevzdat</button>
        </div>
      </div>
    </div>

  </body>
</html>
