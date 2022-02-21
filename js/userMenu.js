
async function showUserMenu(username){

  let div = document.createElement('div');
  div.className = 'userMenuDialog';
  div.innerHTML = await GET('dialogs/userMenu.html');
  document.body.appendChild(div);

  dialogs.push(div);

  let usernameField = div.querySelector('.usernameField');
  let closeBtn = div.querySelector('.formClose');
  let logoutBtn = div.querySelector('.logoutBtn');
  let settingsBtn = div.querySelector('.settingsBtn');
  let handedOutBagsBtn = div.querySelector('.handedOutBagsBtn');

  usernameField.innerText = username;

  closeBtn.onclick = function(){
    div.hide();
  }

  logoutBtn.onclick = async function(){
    await POST('api/logout.php');
    location.href = 'index.php';
  }

  settingsBtn.onclick = async function(){
    showSettingsDialog();
  }

  handedOutBagsBtn.onclick = async function(){
    showHandedOutBagsDialog();
  }

  div.hide = function(){
    document.body.removeChild(div);
    dialogs.splice(dialogs.indexOf(div));
  }

}
