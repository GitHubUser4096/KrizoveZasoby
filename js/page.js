/** stuff related to a generic page (profile, management) **/

let roleColors = {'viewer':'gray', 'contributor':'black', 'editor':'green', 'admin':'red'};

window.onoffline = function(){
  offlineOverlay.style.display = 'block';
}

window.ononline = function(){
  offlineOverlay.style.display = 'none';
}

async function initMenu(page){

  function addMenuBtn(text, onclick, icon){
    let menuBtn = document.createElement('button');
    menuBtn.className = 'menuItemBtn';
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
  }

  menuBtn.onclick = function(){
    showMenu();
  }

  document.addEventListener('click', function(){
    if(!menu.selected){
      menu.style.display = 'none';
    }
  });

  addMenuBtn('Odhlásit se', async function(){
    menu.style.display = 'none';
    showLoading();
    await POST('api/user/logout.php');
    location.href = 'index.php';
    hideLoading();
  }, 'res/logout.png');

  if(page=='profile'){

    addMenuBtn('Odevzdané tašky', async function(){
      menu.style.display = 'none';
      showLoading();
      await checkAuth();
      await showDialog('donatedBags');
      hideLoading();
    }, 'res/bag.png');

    addMenuBtn('Regsitrovat charitu', async function(){
      menu.style.display = 'none';
      showLoading();
      await checkAuth();
      await showDialog('registerCharity');
      hideLoading();
    }, 'res/add.png');

    addMenuBtn('Najít charitu', async function(){
      menu.style.display = 'none';
      showLoading();
      await checkAuth();
      await showDialog('findCharity');
      hideLoading();
    }, 'res/location.png');

    // TODO keep settings in management?

    addMenuBtn('Nastavení', async function(){
      menu.style.display = 'none';
      showLoading();
      await checkAuth();
      await showDialog('settings');
      hideLoading();
    }, 'res/settings.png');

    let charities = JSON.parse(await GET('api/charity/getActiveCharities.php'));

    if(checkRole('editor') || charities.length>0){

      addMenuBtn('Správa webu', function(){
        location.href = 'management.php';
      }, 'res/web.png');

    }

  } else if(page=='management'){

    addMenuBtn('Moje tašky', function(){
      location.href = 'profile.php';
    }, 'res/bag.png');

  }

}
