<?php

session_start();

if(isSet($_SESSION['user'])){
  header('Location: profile.php');
  return;
}

?>
<!DOCTYPE html>
<html lang="cs" dir="ltr">
  <head>
    <meta charset="utf-8">
    <title>Krizové Zásoby</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="icon" href="res/icon.png">
    <link rel="stylesheet" href="css/general.css">
    <link rel="stylesheet" href="css/index.css">
    <script src="js/requests.js" charset="utf-8"></script>
    <script src="js/index.js" charset="utf-8"></script>
  </head>
  <body>

    <div class="background"></div>

    <div id="main" class="main">
      <div class="mainContent">
        <div class="title">
          <img width="60px" style="vertical-align: top;" src="res/icon.png"></img>
          Krizové Zásoby
        </div>
        <div class="mainText">
          <div class="subtitle">
            Web se kterým se chráníte a zároveň s ním můžete dělat dobré skutky.
          </div>
          <div class="description">
            Web, se kterým máte pořádek ve vašich domácích zásobách. Pokud se blíží překročení termínu spotřeby, upozorní vás na to a pokud chcete, nabídne vám, jaké charitě zásoby odevzdat dříve, než projdou.
          </div>
          <div class="description">
            Je dobrý nápad mít doma základní zásoby jídla a základních potřeb. Není to pravděpodobné, ale nelze ani vyloučit situace jako dlouhodobý výpadek elektrického proudu (blackout) či pandemie - a s tím spojená dočasná nemožnost základní potřeby nakoupit.
            Web Krizové Zásoby Vám umožní zaregistrovat si doma pro případ nouze uložené základní potřeby a bude vás včas varovat, pokud se blíží vypršení jejich doporučené spotřeby či záruky.
          </div>
          <div class="description">
            Je dobrý nápad pomáhat. Web vám nabídne charity, kde můžete odevzdat zásoby, na jejichž vypršení vás upozorňuje.
          </div>
        </div>
        <div class="mobileControls">
          <button id="loginBtn" class="formSubmit mobileLoginBtn">Přihlásit se</button>
        </div>
        <div class="copyright">
          © EntsCZ 2022
        </div>
      </div>
      <div id="cookieMsg" class="cookies">
        Tento web používá soubory cookies. Pokračováním souhlasíte s použitím cookies.
        <span id="closeCookieMsg" class="cookiesClose">X</span>
      </div>
    </div>

    <div id="loginDialog" class="side loginForm mobileHidden">
      <form name="loginForm" id="loginForm">
        <div class="formTitle">
          <button type="button" class="formClose" id="loginForm_close">
            <img src="res/back_arrow.png"></img>
          </button>
          <span class="formTitleText">Přihlásit se</span>
        </div>
        <div class="msgContainer">
          <div class="msgBox" id="loginMsg"></div>
        </div>
        <label class="formRow">
          E-mail: <input class="formInput" name="email"></input>
        </label>
        <label class="formRow">
          Heslo: <input class="formInput" name="password" type="password"></input>
        </label>
        <div class="formRow">
          <button class="loginLink" name="forgotPassword" type="button">Zapomenuté heslo</button>
        </div>
        <div class="formRow">
          <button class="loginLink" name="signup" type="button">Zaregistrovat se</button>
        </div>
        <button type="submit" class="formSubmit">Přihlásit se</button>
      </form>
    </div>

    <div id="forgotPasswordDialog" class="side forgotPasswordForm">
      <div class="formBox">
        <form name="forgotPasswordForm" id="forgotPasswordForm">
          <div class="formTitle">
            <button type="button" class="formClose" id="forgotPasswordForm_close">
              <img src="res/back_arrow.png"></img>
            </button>
            <span class="formTitleText">Obnovit heslo</span>
          </div>
          <div class="msgContainer">
            <div class="msgBox" id="forgotPasswordMsg"></div>
          </div>
          <div class="formRow">
            Na váš e-mail bude odeslán kód pro obnovení hesla.
          </div>
          <label class="formRow">
            E-mail: <input type="email" class="formInput" name="email"></input>
          </label>
          <button type="submit" class="formSubmit">Odeslat</button>
        </form>
      </div>
    </div>

    <div id="resetPasswordDialog" class="side resetPasswordForm">
      <div class="formBox">
        <form name="resetPasswordForm" id="resetPasswordForm">
          <div class="formTitle">
            <button type="button" class="formClose" id="resetPasswordForm_close">
              <img src="res/back_arrow.png"></img>
            </button>
            <span class="formTitleText">Obnovit heslo</span>
          </div>
          <div class="msgContainer">
            <div class="msgBox" id="resetPasswordMsg"></div>
          </div>
          <div class="formRow">
            Zadejte kód, který bude odeslán na váš e-mail (může trvat několik minut) a nastavte nové heslo.
          </div>
          <label class="formRow">
            E-mail: <input class="formInput" name="email" autocomplete="username" disabled></input>
          </label>
          <label class="formRow">
            Kód: <input class="formInput" name="code" autocomplete="off"></input>
          </label>
          <label class="formRow">
            Nové heslo: <input class="formInput" type="password" name="newPassword" autocomplete="new-password"></input>
          </label>
          <label class="formRow">
            Ověření hesla: <input class="formInput" type="password" name="confirmPassword" autocomplete="new-password"></input>
          </label>
          <button type="submit" class="formSubmit">Obnovit heslo</button>
        </form>
      </div>
    </div>

    <div id="signupDialog" class="side signupForm">
      <div class="formBox">
        <form name="signupForm" id="signupForm">
          <div class="formTitle">
            <button type="button" class="formClose" id="signupForm_close">
              <img src="res/back_arrow.png"></img>
            </button>
            <span class="formTitleText">Registrovat</span>
          </div>
          <div class="msgContainer">
            <div class="msgBox" id="signupMsg"></div>
          </div>
          <label class="formRow">
            E-mail: <input class="formInput" name="email" type="email" autocomplete="off"></input>
          </label>
          <label class="formRow">
            Heslo: <input class="formInput" name="password" type="password" autocomplete="new-password"></input>
          </label>
          <label class="formRow">
            Ověření hesla: <input class="formInput" name="confirmPassword" type="password" autocomplete="new-password"></input>
          </label>
          <button type="submit" class="formSubmit">Registrovat</button>
        </form>
      </div>
    </div>
    
    <div id="mobileScreen" class="mobileScreen">
      <div class="mobileTitle">Krizové zásoby</div>
      <div id="mobileClose" class="mobileClose">×</div>
      <div class="mobileDesc">Na mobilním zařízení se lépe pracuje s mobilní aplikací.</div>
      <a href="download/KrizoveZasoby_app_1.0.0.apk"><div class="mobileDlBtn"><span class="mobileDlLabel">Stáhnout</span><img class="mobileDlImg" src="res/download.png"></img></div></a>
    </div>

  </body>
</html>
