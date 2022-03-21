<?php

/*session_start();

if(isSet($_GET['logout'])){
  session_destroy();
  session_regenerate_id();
  header('Location: index.php');
  return;
}*/

?>
<!DOCTYPE html>
<html lang="cs" dir="ltr">
  <head>
    <meta charset="utf-8">
    <title>Krizové Zásoby</title>
    <link rel="icon" href="res/icon.png">
    <link rel="stylesheet" href="css/general.css">
    <link rel="stylesheet" href="css/index.css">
    <script src="lib/js/XHR.js" charset="utf-8"></script>
    <script src="js/index.js" charset="utf-8"></script>
  </head>
  <body>

    <div class="background"></div>

    <div class="main">
      <h1 class="title">Krizové Zásoby</h1>
      <p class="description">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Maecenas volutpat blandit aliquam etiam erat velit scelerisque. Elementum facilisis leo vel fringilla est ullamcorper eget nulla facilisi. Urna neque viverra justo nec. Venenatis a condimentum vitae sapien pellentesque habitant morbi tristique senectus. In ante metus dictum at tempor commodo ullamcorper a lacus. Sed turpis tincidunt id aliquet. Aliquam nulla facilisi cras fermentum odio eu feugiat pretium nibh. Orci nulla pellentesque dignissim enim. Nunc mi ipsum faucibus vitae aliquet nec ullamcorper sit. Mauris ultrices eros in cursus. Cras tincidunt lobortis feugiat vivamus at augue. Sed blandit libero volutpat sed cras ornare arcu. Et magnis dis parturient montes nascetur ridiculus.</p>
    </div>

    <div id="sidebar" class="side sidebar">
      <div class="sidebarButtons">
        <button class="sideBtn signupBtn" id="signupBtn">Registrovat</button>
        <button class="sideBtn loginBtn" id="loginBtn">Moje Zásoby</button>
      </div>
    </div>

    <div id="loginDialog" class="side loginForm">
      <div class="formBox">
        <form name="loginForm" id="loginForm">
          <div class="formTitle">
            <button type="button" class="formClose" id="loginForm_close">&lt;</button>
            <span class="formTitleText">Přihlásit se</span>
          </div>
          <div class="loginMsg" id="loginMsg"></div>
          <label class="formRow">
            E-mail: <input class="formInput" name="email"></input>
          </label>
          <label class="formRow">
            Heslo: <input class="formInput" name="password" type="password"></input>
          </label>
          <!-- <div class="formRow">
            <button class="forgotPassword" name="forgotPassword" type="button">Zapomenuté heslo</button>
          </div> -->
          <button type="submit" class="formSubmit">Přihlásit se</button>
        </form>
      </div>
    </div>

    <div id="forgotPasswordDialog" class="side loginForm">
      <div class="formBox">
        <form name="forgotPasswordForm" id="forgotPasswordForm" method="POST" action="forgotPassword.php">
          <div class="formTitle">
            <button type="button" class="formClose" id="forgotPasswordForm_close">&lt;</button>
            <span class="formTitleText">Zapomenuté heslo</span>
          </div>
          <div class="loginMsg" id="forgotPasswordMsg"></div>
          <div class="formRow">
            Na váš e-mail bude odeslán odkaz na obnovení hesla.
          </div>
          <label class="formRow">
            E-mail: <input class="formInput" name="email"></input>
          </label>
          <button type="submit" class="formSubmit">Obnovit heslo</button>
        </form>
      </div>
    </div>

    <div id="signupDialog" class="side signupForm">
      <div class="formBox">
        <form name="signupForm" id="signupForm">
          <div class="formTitle">
            <button type="button" class="formClose" id="signupForm_close">&lt;</button>
            <span class="formTitleText">Registrovat</span>
          </div>
          <div class="loginMsg" id="signupMsg"></div>
          <label class="formRow">
            E-mail: <input class="formInput" name="email"></input>
          </label>
          <label class="formRow">
            Heslo: <input class="formInput" name="password" type="password"></input>
          </label>
          <label class="formRow">
            Ověření hesla: <input class="formInput" name="confirmPassword" type="password"></input>
          </label>
          <button type="submit" class="formSubmit">Registrovat</button>
        </form>
      </div>
    </div>

  </body>
</html>
