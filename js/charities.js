// TODO DEPRECATED moved to web management

let loadedCharityId = null;

async function refresh(){
  if(loadedCharityId) {
    await loadCharity(loadedCharityId);
  } else {
    await loadCharities();
  }
}

async function loadCharity(id){

  let charity = JSON.parse(await GET('api/charity/getCharity.php?charityId='+id));

  showLoading();

  loadedCharityId = id;

  setTitle(charity.name, function(){
    loadCharities();
  });

  itemListContainer.innerText = '';

  let div = await LayoutManager.getLayout('layouts/charity.html');

  div.elements.name.innerText = charity.name;
  div.elements.contacts.innerText = charity.contacts;

  for(let place of charity.places){

    let placeDiv = await LayoutManager.getLayout('layouts/charityPlace.html');

    placeDiv.elements.address.innerText = place.street+', '+place.place+' '+place.postCode;
    placeDiv.elements.openHours.innerText = place.openHours;
    placeDiv.elements.contacts.innerText = place.contacts;

    div.elements.places.appendChild(placeDiv);

    // div.elements.places.innerText += place.street+', '+place.place+' '+place.postCode+'\n'+
    //     place.openHours+'\n'+
    //     place.contacts+'\n';
    // itemListContainer.innerText += place.street+', '+place.place+' '+place.postCode+'\n'+
    //     place.openHours+'\n'+
    //     place.contacts+'\n';
  }

  for(let user of charity.users){
    let userDiv = document.createElement('div');
    userDiv.innerText = user.email+' '+(user.isManager ? '(správce)' : '');
    div.elements.users.appendChild(userDiv);
    // div.elements.users.innerText += user.email+' '+(user.isManager ? '(správce)' : '');
    // div.elements.users.appendChild(document.createElement('br'));
  }

  let isManager = JSON.parse(await GET('api/charity/isCharityManager.php?charityId='+charity.id));

  if(checkRole('admin') || isManager){

    div.elements.editInfoBtn.style.display = 'block';

    div.elements.editInfoBtn.onclick = async function(){
      showLoading();
      await showDialog('registerCharity', charity);
      hideLoading();
    }

    div.elements.editUsersBtn.style.display = 'block';
  
    div.elements.editUsersBtn.onclick = async function(){
      showLoading();
      await showDialog('charityUsers', charity);
      hideLoading();
    }

  } else {

    div.elements.editInfoBtn.style.display = 'none';
    div.elements.editUsersBtn.style.display = 'none';

  }

  itemListContainer.appendChild(div);

  // itemListContainer.innerText = charity.name+'\n'+
  //     charity.contacts+'\n';

  // for(let place of charity.places){
  //   itemListContainer.innerText += place.street+', '+place.place+' '+place.postCode+'\n'+
  //       place.openHours+'\n'+
  //       place.contacts+'\n';
  // }

  // for(let user of charity.users){
  //   itemListContainer.innerText += user.email+' '+user.isManager;
  // }

  hideLoading();

}

async function loadCharities(){

  showLoading();

  loadedCharityId = null;

  setTitle('Charity', function(){
    history.back();
  });

  itemListContainer.innerText = '';

  let charities = JSON.parse(await GET('api/charity/listCharities.php'));

  for(let charity of charities) {

    let charityDiv = document.createElement('div');
    charityDiv.className = 'charityItem';
    charityDiv.innerText = charity.name;

    charityDiv.onclick = async function(){
      await loadCharity(charity.id);
    }

    itemListContainer.appendChild(charityDiv);

  }

  // for(let i = 0; i<100; i++){
  //   let charityDiv = document.createElement('div');
  //   charityDiv.innerText = i;
  //   itemListContainer.appendChild(charityDiv);
  // }

  hideLoading();

}

function setTitle(title, backFunc){
  subtitleText.innerText = title;
  statusBarBackBtn.onclick = backFunc;
}

window.onload = async function(){

  showLoading();

  await checkAuth();

  // registerDialog('settings', async function(){
  //   return await createSettingsDialog();
  // }, 'js/settings.js', 'css/settings.css');

  registerDialog('registerCharity', async function(args){
    return await createRegisterCharityDialog(...args);
  }, 'js/registerCharity.js', 'css/registerCharity.css');

  registerDialog('charityUsers', async function(args){
    return await createCharityUsersDialog(...args);
  }, 'js/charityUsers.js', 'css/charityUsers.css');
  
  initMenu('charities');

  // statusBarBackBtn.onclick = function(){
  //   history.back();
  // }

  await loadCharities();

  hideLoading();

}
