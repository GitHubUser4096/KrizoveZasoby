/** stuff related to a generic page (profile, management) **/

let roleColors = {'viewer':'gray', 'contributor':'black', 'editor':'green', 'admin':'red'};

function initMenu(page){

  checkAuth();

  userNameField.innerText = auth.user.email;
  userNameField.style.color = roleColors[auth.user.userRole];

  menu.onmouseover = menuBtn.onmouseover = function(){
    menu.selected = true;
  }

  menu.onmouseout = menuBtn.onmouseout = function(){
    menu.selected = false;
  }

  function showMenu(){ // TODO unnecessary?
    menu.style.display = menu.style.display=='block' ? 'none' : 'block';
    // menu.style.display = 'block';
  }

  menuBtn.onclick = function(){
    // menuDialog.style.display = 'block';
    // showUserMenu(auth.user.email);
    showMenu();
  }

  document.addEventListener('click', function(){
    if(!menu.selected){
      menu.style.display = 'none';
    }
  });

  let logoutBtn = document.createElement('button');
  logoutBtn.className = 'menuItemBtn';
  logoutBtn.innerText = 'Odhlásit se';
  menu.appendChild(logoutBtn);

  logoutBtn.onclick = async function(){
    menu.style.display = 'none';
    showLoading();
    await POST('api/user/logout.php');
    location.href = 'index.php';
    hideLoading();
  }

  if(page=='profile'){

    let donatedBagsBtn = document.createElement('button');
    donatedBagsBtn.className = 'menuItemBtn';
    donatedBagsBtn.innerText = 'Odevzdané Tašky';
    menu.appendChild(donatedBagsBtn);

    donatedBagsBtn.onclick = async function(){
      menu.style.display = 'none';
      showLoading();
      // await showDonatedBagsDialog();
      await showDialog('donatedBags');
      hideLoading();
    }

    // TODO keep settings in management?
    let settingsBtn = document.createElement('button');
    settingsBtn.className = 'menuItemBtn';
    settingsBtn.innerText = 'Nastavení';
    menu.appendChild(settingsBtn);

    settingsBtn.onclick = async function(){
      menu.style.display = 'none';
      showLoading();
      // await showSettingsDialog();
      await showDialog('settings');
      hideLoading();
    }

    if(checkRole('editor')){

      let managementBtn = document.createElement('button');
      managementBtn.className = 'menuItemBtn';
      managementBtn.innerText = 'Správa webu';
      menu.appendChild(managementBtn);

      managementBtn.onclick = async function(){
        location.href = 'management.php';
      }

    }

  } else if(page=='management'){

    let profileBtn = document.createElement('button');
    profileBtn.className = 'menuItemBtn';
    profileBtn.innerText = 'Moje tašky';
    menu.appendChild(profileBtn);

    profileBtn.onclick = async function(){
      location.href = 'profile.php';
    }

  }

}
