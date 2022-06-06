/** stuff related to a generic page (profile, management) **/

let roleColors = {'viewer':'gray', 'contributor':'black', 'editor':'green', 'admin':'red'};

async function initMenu(page){

  function addMenuBtn(text, onclick, icon){
    let menuBtn = document.createElement('button');
    menuBtn.className = 'menuItemBtn';
    // menuBtn.innerText = text;
    let label = document.createElement('span');
    label.innerText = text;
    menuBtn.appendChild(label);
    if(icon){
      let img = document.createElement('img');
      img.src = icon;
      menuBtn.appendChild(img);
    }
    menuBtn.onclick = onclick;
    menu.appendChild(menuBtn);
  }

  await checkAuth();

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

  // let logoutBtn = document.createElement('button');
  // logoutBtn.className = 'menuItemBtn';
  // logoutBtn.innerText = 'Odhlásit se';
  // menu.appendChild(logoutBtn);

  // logoutBtn.onclick = async function(){
  //   menu.style.display = 'none';
  //   showLoading();
  //   await POST('api/user/logout.php');
  //   location.href = 'index.php';
  //   hideLoading();
  // }

  addMenuBtn('Odhlásit se', async function(){
    menu.style.display = 'none';
    showLoading();
    await POST('api/user/logout.php');
    location.href = 'index.php';
    hideLoading();
  }, 'res/logout.png');

  if(page=='profile'){

    // let donatedBagsBtn = document.createElement('button');
    // donatedBagsBtn.className = 'menuItemBtn';
    // donatedBagsBtn.innerText = 'Odevzdané Tašky';
    // menu.appendChild(donatedBagsBtn);

    // donatedBagsBtn.onclick = async function(){
    //   menu.style.display = 'none';
    //   showLoading();
    //   // await showDonatedBagsDialog();
    //   await showDialog('donatedBags');
    //   hideLoading();
    // }

    addMenuBtn('Odevzdané tašky', async function(){
      menu.style.display = 'none';
      showLoading();
      // await showDonatedBagsDialog();
      await showDialog('donatedBags');
      hideLoading();
    }, 'res/bag.png');

    // let registerCharityBtn = document.createElement('button');
    // registerCharityBtn.className = 'menuItemBtn';
    // registerCharityBtn.innerText = 'Regsitrovat charitu';
    // menu.appendChild(registerCharityBtn);

    // registerCharityBtn.onclick = async function(){
    //   menu.style.display = 'none';
    //   showLoading();
    //   // await showDonatedBagsDialog();
    //   await showDialog('registerCharity');
    //   hideLoading();
    // }

    addMenuBtn('Regsitrovat charitu', async function(){
      menu.style.display = 'none';
      showLoading();
      // await showDonatedBagsDialog();
      await showDialog('registerCharity');
      hideLoading();
    }, 'res/add.png');

    // let findCharityBtn = document.createElement('button');
    // findCharityBtn.className = 'menuItemBtn';
    // findCharityBtn.innerText = 'Najít charitu';
    // menu.appendChild(findCharityBtn);

    // findCharityBtn.onclick = async function(){
    //   menu.style.display = 'none';
    //   showLoading();
    //   // await showDonatedBagsDialog();
    //   await showDialog('findCharity');
    //   hideLoading();
    // }

    addMenuBtn('Najít charitu', async function(){
      menu.style.display = 'none';
      showLoading();
      // await showDonatedBagsDialog();
      await showDialog('findCharity');
      hideLoading();
    }, 'res/location.png');

    // TODO keep settings in management?
    // let settingsBtn = document.createElement('button');
    // settingsBtn.className = 'menuItemBtn';
    // settingsBtn.innerText = 'Nastavení';
    // menu.appendChild(settingsBtn);

    // settingsBtn.onclick = async function(){
    //   menu.style.display = 'none';
    //   showLoading();
    //   // await showSettingsDialog();
    //   await showDialog('settings');
    //   hideLoading();
    // }

    addMenuBtn('Nastavení', async function(){
      menu.style.display = 'none';
      showLoading();
      // await showSettingsDialog();
      await showDialog('settings');
      hideLoading();
    }, 'res/settings.png');

    // let charitiesBtn = document.createElement('button');
    // charitiesBtn.className = 'menuItemBtn';
    // charitiesBtn.innerText = 'Charity';
    // menu.appendChild(charitiesBtn);

    // charitiesBtn.onclick = async function(){
    //   location.href = 'charities.php';
    // }

    let charities = JSON.parse(await GET('api/charity/getActiveCharities.php'));

    if(checkRole('editor') || charities.length>0){

      // let managementBtn = document.createElement('button');
      // managementBtn.className = 'menuItemBtn';
      // managementBtn.innerText = 'Správa webu';
      // menu.appendChild(managementBtn);

      // managementBtn.onclick = async function(){
      //   location.href = 'management.php';
      // }

      addMenuBtn('Správa webu', function(){
        location.href = 'management.php';
      }, 'res/web.png');

    }

  } else if(page=='management'){

    // let profileBtn = document.createElement('button');
    // profileBtn.className = 'menuItemBtn';
    // profileBtn.innerText = 'Moje tašky';
    // menu.appendChild(profileBtn);

    // profileBtn.onclick = async function(){
    //   location.href = 'profile.php';
    // }

    addMenuBtn('Moje tašky', function(){
      location.href = 'profile.php';
    }, 'res/noImage.png');

  }

}
