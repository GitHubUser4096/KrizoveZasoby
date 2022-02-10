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
    <script src="lib/js/XHR.js" charset="utf-8"></script>
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
    <script src="js/profile.js" charset="utf-8"></script>
  </head>
  <body>

    <div class="background"></div>

    <div class="titlebar">
      <!-- Krizové Zásoby -->
      <a href="index.php"><img src="res/logo.png"></img></a>
      <span class="userMenu">
        <!--button id="searchBtn">HLEDAT</button-->
        <button class="menuBtn" id="menuBtn"><img src="res/menu.png"></img></button>
        <!-- <span id="span_username"></span>
        <a href="index.php?logout">Odhlásit se</a> -->
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
        <div>
          <input class="newBagInput" id="newBagInput" placeholder="Nová taška"></input>
        </div>
        <!-- <div class="bottomBtnBox newBag">
          <button class="bottomBtn" id="btn_addBag">Přidat tašku</button>
        </div> -->
      </div>
      <div class="items">
        <div class="lists">
          <div id="listBox_exp">
            <div class="hintLabel">Po vypršení:</div>
            <div id="div_expList" class="itemList expList"></div>
            <hr>
          </div>
          <div id="listBox_crit">
            <div class="hintLabel">Kritické:</div>
            <div id="div_critList" class="itemList critList"></div>
            <hr>
          </div>
          <div id="listBox_warn">
            <div class="hintLabel">Varování:</div>
            <div id="div_warnList" class="itemList warnList"></div>
            <hr>
          </div>
          <div id="listBox_rec">
            <div class="hintLabel">Doporučené:</div>
            <div id="div_recList" class="itemList recList"></div>
            <hr>
          </div>
          <div id="listBox_ok">
            <div class="hintLabel">V pořádku:</div>
            <div id="div_okList" class="itemList okList"></div>
            <hr>
          </div>
          <!-- <div id="listBox">
            <div id="div_itemList" class="itemList"></div>
            <hr>
          </div> -->
          <div id="listBox_used">
            <div class="hintLabel">Použité:</div>
            <div id="div_usedList" class="itemList usedList"></div>
          </div>
          <div id="listBox_empty">
            <div class="hintLabel emptyHint">Přidejte položky kliknutím na Přidat položku</div>
          </div>
        </div>
        <div class="bottomBtnBox addItem">
          <button class="bottomBtn" id="btn_addItem">Přidat položku</button>
        </div>
      </div>
      <div class="bagInfo">
        <!-- <div id="div_bagInfoTitle" class="bagInfoTitle"></div> -->
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
            <!-- Poznámky: -->
            <textarea class="bagNotesInput" name="bagNotes" placeholder="Poznámky"></textarea>
          </div>
        </form>
        <div class="bottomBtnBox handOut">
          <button id="handOutBtn" class="bottomBtn">Odevzdat</button>
        </div>
      </div>
    </div>

    <!-- <div id="menuDialog" class="menuDialog">
      <div><span id="usernameField"></span><button id="menuCloseBtn">X</button></div>
      <div><button id="logoutBtn">Odhlásit se</button></div>
      <div><button>Odevzdané tašky</button></div>
      <div><button>Registrovat charitu</button></div>
    </div> -->

    <!-- <div id="productSuggestions"></div> -->

    <!-- <div id="dialog_addProduct" class="addProductDialog">
      <div>
        <span>Přidat Produkt</span>
        <button id="dialog_addProduct_btn_close">X</button>
      </div>
      <label class="formRow">
        Název:
        <input id="dialog_addProduct_input_name"></input>
      </label>
      <label class="formRow">
        EAN:
        <input id="dialog_addProduct_input_ean"></input>
      </label>
      <label class="formRow">
        Obrázek:
        <img width="64" id="addProductImage"></img>
        <button type="button" id="addProductSelectImage">Vybrat</button>
        <button type="button" id="addProductClearImage">X</button>
      </label>
      <label class="formRow">
        Balení:
        <input id="addProductPackageType" list="package_types"></input>
        <datalist id="package_types"> -->
          <!-- <option value="Konzerva">
          <option value="PET Láhev"> -->
        <!-- </datalist>
      </label>
      <labbel class="formRow">
        Kategorie:
        <div id="addProductCategories"></div>
        <input id="addProductCatName"></input><button id="addProductNewCat" type="button">+</button>
      </label>
      <label class="formRow">
        Popis:
        <textarea id="addProductDesc"></textarea>
      </label>
      <div>
        <button id="dialog_addProduct_btn_submit">Přidat</button>
      </div>
    </div> -->

    <!-- <div id="dialog_editItem" class="editItemDialog">
      <div>
        <span>Upravit položku</span>
        <button id="dialog_editItem_btn_close">X</button>
      </div>
      <input id="dialog_editItem_input_itemId" type="hidden"></input>
      <label class="formRow">
        <span id="dialog_editItem_name"></span>
      </label>
      <label class="formRow">
        Počet:
        <input type="number" id="dialog_editItem_input_count"></input>
      </label>
      <label class="formRow">
        Minimální trvanlivost:
        <input type="date" id="dialog_editItem_input_expiration"></input>
      </label>
      <div>
        <button id="dialog_editItem_btn_save">Uložit</button>
      </div>
      <div id="editItemSetUsedDiv">
        Označit jako použité:
        <input type="number" id="dialog_editItem_input_useCount"></input>
        <button id="dialog_editItem_btn_setUsed">Označit</button>
      </div>
      <div id="editItemSetUnusedDiv">
        Označit jako nepoužité:
        <button id="dialog_editItem_btn_setUnused">Označit</button>
      </div>
      <div>
        Přesunout do jiné tašky:
        <select id="dialog_editItem_input_bags"></select>
        <button id="dialog_editItem_btn_move">Přesunout</button>
      </div>
    </div> -->

    <div id="handOutDialog" class="handOutDialog">
      <div>Odevzdat tašku<button id="handOutClose">X</button></div>
      <div>Charity:<input></input></div>
      <div id="charityList"></div>
      <div><button>Označit jako odevzdané</button></div>
    </div>

  </body>
</html>
