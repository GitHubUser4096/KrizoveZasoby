/** id of currently selected bag (the bag that should be loaded on load/refresh, should exist when no bag is loaded) **/
let selectedBagId = 0;
/** id of item to be expanded when a the current bag is refreshed **/
let expandedItemId = null;
/** id of item that was just moved to a different bag and should be expanded once refreshed **/
let movedItemId = null;
/** info about the currently selected bag **/
let selectedBag;
/** authentication data **/
let auth;
/** list of all bags **/
let allBags = [];
/** list of bag buttons **/
let bagButtons = [];
/** list of all item UI containers **/
let itemDivs = [];
/** user configuration **/
let config;

// let loadBags;
// let loadBag; // function to load all items from the current bag
// let refresh; // function to refresh everything (bags and items)
// let addItem;
// let removeItem;
// let sortItems;
// let refreshItems; // function to refresh currently cached items


// TODO what is this?
// let addedBag = false;

/** connects to the server to check whether the user is authenticated - if not, error is thrown and user is redirected to login screen **/
async function checkAuth(){
  auth = JSON.parse(await GET('api/user/auth.php'));
  if(!auth.loggedIn){
    location.href = 'index.php?reauth';
    throw new Error('Not authenticated!');
  }
  return true;
}

/** adds a button to the list of bags **/
function addBagButton(id, name, state){
  let btn = document.createElement('button');
  btn.className = 'bagBtn';
  btn.innerText = name;
  btn.title = name;
  btn.classList.add(state);
  btn.bagId = id;
  btn.onclick = function(){
    loadBag(btn.bagId);
  }
  div_bagList.appendChild(btn);
  bagButtons.push(btn);
}

// TODO split different functionalities to their own functions?
/** fetches status and user's bags, updates status and bag list, shows or hides init screen **/
async function loadBags(){

  showLoading();

  bagButtons = [];

  let status = JSON.parse(await GET('api/user/status.php'));

  statusBar.innerHTML = status.message;
  statusBar.className = 'statusbar '+status.status;

  let bags = JSON.parse(await GET('api/bag/listBags.php'));

  allBags = bags;

  if(bags.length==0){
    initScreen.style.display = 'block';
    main.style.display = 'none';
    selectedBagId = null;
    hideLoading();
    return;
  } else {
    initScreen.style.display = 'none';
    main.style.display = 'block';
  }

  div_bagList.innerText = '';
  for(let bag of bags){
    addBagButton(bag.id, bag.name, bag.state);
  }

  let bag = new URLSearchParams(location.search).get('bag');
  if(bag && bags.find(b=>b.id==bag)){
    selectedBagId = +bag;
  } else {
    selectedBagId = bags[bags.length-1].id; // TODO last or first bag?
  }

  hideLoading();

}

/** updates the user configuration **/
async function fetchConfig(){
  config = JSON.parse(await GET('api/user/getSettings.php'));
  nameDisplayOptions.value = config.itemDisplay;
  sortOptions.value = config.sort;
}

/** updates the item list (with the currently cached items) - updates display and sort, updates hints **/
function refreshItems(){

  itemListContainer.innerText = '';

  let numUsed = 0;

  if(itemDivs.length==0){
    let emptyInfo = document.createElement('div');
    emptyInfo.className = 'hintLabel emptyHint';
    emptyInfo.innerText = 'Přidejte položky kliknutím na "Přidat položku"';
    itemListContainer.appendChild(emptyInfo);
    return;
  }

  for(let div of itemDivs){
    if(div.item.state=='used'){
      numUsed++;
    } else {
      div.update();
      itemListContainer.appendChild(div);
    }
  }

  if(numUsed==0) return;

  let usedSep = document.createElement('span');
  usedSep.className = 'hintLabel usedHint';
  usedSep.innerText = 'Použité:';
  itemListContainer.appendChild(usedSep);

  for(let div of itemDivs){
    if(div.item.state=='used'){
      div.update();
      itemListContainer.appendChild(div);
    }
  }

}

/** creates an item div and adds it to local cache and item list **/
async function addItem(item){
  let itemContainer = await createItem(item);
  itemDivs.push(itemContainer);
  sortItems();
  refreshItems();
}

/** removes an item locally (from cache and list) **/
function removeItem(itemDiv){
  itemDivs.splice(itemDivs.indexOf(itemDiv), 1);
  sortItems();
  refreshItems();
}

/** sorts items in cache **/
function sortItems(){

  if(config.sort=='name'){
    itemDivs.sort((d1, d2)=>d1.getDisplayName().localeCompare(d2.getDisplayName()));
  } else {
    itemDivs.sort((d1, d2)=>(new Date(d1.item.expiration)-new Date(d2.item.expiration)));
  }

}

// TODO possibly separate this to bag.js?

// TODO should this stay in one function?
/** downloads bag info and items, shows bag info and updates item list **/
async function loadBag(id){

  showLoading();

  let start = performance.now();
  console.log('loading items');

  if(tooltip) hideTooltip();
  if(!id) {
    hideLoading();
    return;
  }
  if(!await checkAuth()) return;

  for(let btn of bagButtons){
    if(btn.bagId==id){
      btn.classList.add('selected');
    } else {
      btn.classList.remove('selected');
    }
  }

  if(id!=selectedBagId) expandedItemId = null;

  let allItems = JSON.parse(await GET('api/item/getItems.php?bagId='+id));

  itemDivs = [];
  itemListContainer.innerText = '';

  let numUnused = 0;
  let expandedItem;

  for(let item of allItems){
    let itemContainer = await createItem(item);
    itemDivs.push(itemContainer);
    if(item.id==expandedItemId){
      expandedItem = itemContainer;
      itemContainer.expand();
    }
    if(item.id==movedItemId){
      expandedItem = itemContainer;
      itemContainer.expand();
      movedItemId = null;
    }
    if(!item.used) {
      numUnused++;
    }
  }

  sortItems();
  refreshItems();

  // scroll expanded item to view AFTER all items are loaded
  if(expandedItem){
    expandedItem.scrollIntoViewIfNeeded();
  }

  console.log('loaded', performance.now()-start);

  let info = JSON.parse(await GET('api/bag/getInfo.php?bagId='+id));

  div_bagDates.innerText = 'Doporučené: '+info.useRecommended+'\n'+'Nejpozději: '+info.useBefore;
  bagInfoForm.bagName.value = info.name;
  bagInfoForm.bagNotes.value = info.description;

  selectedBagId = id;
  selectedBag = info;
  history.replaceState('', '', '?bag='+id);

  if(numUnused){
    bagInfoForm.deleteBag.classList.add('disabled');
  } else {
    bagInfoForm.deleteBag.classList.remove('disabled');
  }

  hideLoading();

}

/** refreshes the application state - status, bag list and current bag **/
async function refresh(){

  await loadBags();
  await loadBag(selectedBagId);

}

/** creates a bag online - verifies name, creates the bag, refreshes bag list and switches into the bag **/
// async function addBag(name){

//   name = name.substring(0, 1).toUpperCase()+name.substring(1).toLowerCase();

//   if(!await checkAuth()) return;

//   let donated = JSON.parse(await GET('api/bag/listDonated.php'));

//   if(donated.findIndex(b=>b.name.toLowerCase()==name.toLowerCase())>=0) {
//     alert('Taška se stejným názvem je mezi odevzdanými taškami.');
//     return;
//   }

//   if(allBags.findIndex(b=>b.name.toLowerCase()==name.toLowerCase())>=0) {
//     alert('Taška se stejným názvem již existuje.');
//     return;
//   }

//   if(name.length>64){
//     alert('Název tašky je příliš dlouhý.');
//     return;
//   }

//   let bag = JSON.parse(await POST('api/bag/createBag.php', {'name':name}));
//   if(!bag.id){
//     alert('Nelze přidat tašku');
//     return;
//   }
//   await loadBags();
//   await loadBag(bag.id);

//   return true;

// }

// TODO used only in init - move to init submit?
async function addBag(name, description){

  // this is done by maxlength attrib
  // if(name.length>64){
  //   alert('Název tašky je příliš dlouhý!');
  //   return;
  // }

  // if(description.length>1024){
  //   alert('Popis tašky je příliš dlouhý!');
  //   return;
  // }

  try {

    let bag = JSON.parse(await POST('api/bag/createBag.php', {
      'name':name,
      'description':description,
    }));

    await loadBags();
    await loadBag(bag.id);

  } catch(e){
    alert(e.message);
    initForm.bagName.focus();
  }

}

window.onfocus = async function(){
  await checkAuth();
}

window.ononline = function(){
  console.log('connection restored - refreshing');
  refresh();
}

window.onload = async function(){

  await checkAuth();

  LayoutManager.registerInput('input[type="dmy"]', async function(){
    return await createDateInput();
  }, 'js/dateInput.js', 'css/dateInput.css');

  LayoutManager.registerInput('input[type="count"]', async function(){
    return await createCounter();
  }, 'js/counter.js', 'css/counter.css');

  registerDialog('donatedBags', async function(){
    return await createDonatedBagsDialog();
  }, 'js/donatedBags.js', 'css/donatedBags.css');

  registerDialog('addItem', async function(){
    return await createAddItemDialog();
  }, 'js/addItem.js', 'css/addItem.css');

  registerDialog('addBag', async function(){
    return await createAddBagDialog();
  }, 'js/addBag.js', 'css/addBag.css');

  registerDialog('addProduct', async function(args){
    return await createAddProductDialog(...args);
  }, 'js/addProduct.js', 'css/addProduct.css');

  registerDialog('editItem', async function(args){
    return await createEditItemDialog(...args);
  }, 'js/editItem.js', 'css/editItem.css');

  registerDialog('moveItem', async function(args){
    return await createMoveItemDialog(...args);
  }, 'js/moveItem.js', 'css/moveItem.css');

  registerDialog('settings', async function(){
    return await createSettingsDialog();
  }, 'js/settings.js', 'css/settings.css');

  // TODO get rid of these (this pattern is not really followed anyway)
  // let btn_addItem = document.querySelector('#btn_addItem');
  // let div_bagInfoTitle = document.querySelector('#div_bagInfoTitle');
  // let input_bagDates = document.querySelector('#input_bagDates');
  // let input_bagNotes = document.querySelector('#input_bagNotes');
  // let currentBagDiv = document.querySelector('.currentBag');
  // let tempNewBagDiv = document.querySelector('.tempNewBag');

  userNameField.innerText = auth.user.email;

  

  // name and sort change listeners - update the state online and locally
  // (don't wait for online update - to improve performance, out of sync state does not matter too much here)

  nameDisplayOptions.onchange = async function(){
    POST('api/user/setConfig.php', {'itemDisplay':nameDisplayOptions.value});
    config['itemDisplay'] = nameDisplayOptions.value;
    sortItems();
    refreshItems();
  }

  sortOptions.onchange = async function(){
    POST('api/user/setConfig.php', {'sort':sortOptions.value});
    config['sort'] = sortOptions.value;
    sortItems();
    refreshItems();
  }

  // creating the first bag
  initForm.onsubmit = async function(e){
    e.preventDefault();
    showLoading();
    initForm.bagName.blur();
    await checkAuth();
    let name = toFirstUpper(initForm.bagName.value.trim());
    let description = initForm.bagDesc.value;
    initForm.bagName.value = '';
    initForm.bagDesc.value = '';
    if(!name){
      alert('Prosím zadejte název tašky!');
      initForm.bagName.focus();
      hideLoading();
      return;
    }
    await addBag(name, description);
    hideLoading();
    // await refresh(); // refresh to hide the init screen - TODO init screen should be hidden here directly (?) - bag has to be loaded anyway
  }

  // new bag replaced by a regular dialog - keep it that way? (code below should be deleted if we agree on the new design)

  // creating a new bag

  // // cancel entering new bag name if esc is pressed on it
  // newBagInput.onkeydown = function(e){
  //   if(e.code=='Escape'){
  //     newBagInput.value = '';
  //     // newBagInput.style.display = 'none';
  //     // newBagBtn.style.display = 'inline-block';
  //     // newBagDiv.classList.remove('enterName');
  //     newBagInput.blur(); // TODO is blur sufficient? will it always call onblur?
  //     // refresh();
  //   }
  // }

  // // TODO weird behavior when: name entered, blurred (creates the bag), clicked, blurred - does not leave new bag state
  // // TODO repeatedly quickly pressing the button and escape breaks it

  // // TODO bag gets created whenever input goes out of focus, even when for example leaving the browser window - is this the desired behavior?
  // newBagInput.onchange = async function(){
  //   let name = newBagInput.value.trim();
  //   if(!name) return;
  //   // addedBag = true;
  //   showLoading();
  //   addedBag = await addBag(name);
  //   // newBagInput.value = '';
  //   newBagInput.blur();
  //   hideLoading();
  //   // newBagDiv.classList.remove('enterName');
  //   // newBagInput.style.display = 'none';
  //   // newBagBtn.style.display = 'inline-block';
  // }

  // // if new bag input loses focus, cancel entering bag name
  // newBagInput.onblur = function(){
  //   // newBagInput.style.display = 'none';
  //   // newBagBtn.style.display = 'inline-block';
  //   newBagDiv.classList.remove('enterName');
  //   newBagInput.value = '';
  //   // itemDiv.style.display = 'block';
  //   // bagInfo.style.display = 'block';
  //   currentBagDiv.style.display = 'block';
  //   tempNewBagDiv.style.display = 'none';
  //   if(!addedBag){
  //     for(let btn of bagButtons){
  //       if(btn.bagId==selectedBagId) btn.classList.add('selected');
  //     }
  //     // refresh();
  //     // refreshItems();
  //   }
  //   addedBag = false;
  //   newBagBtn.style.display = 'block';
  //   setTimeout(function(){
  //     newBagInput.style.display = 'none';
  //   }, 150);
  // }

  // // new bag button clicked - change state to entering new bag name
  // // TODO keeping everything but temporarily changing the content feels dodgy - is there a better way?
  // newBagBtn.onclick = function(){
  //   for(let btn of bagButtons){
  //     btn.classList.remove('selected');
  //   }
  //   // itemDiv.style.display = 'none';
  //   // bagInfo.style.display = 'none';
  //   currentBagDiv.style.display = 'none';
  //   tempNewBagDiv.style.display = 'block';
  //   // div_bagDates.innerText = 'Doporučené: \nNejpozději: ';
  //   // bagInfoForm.bagName.value = '';
  //   // bagInfoForm.bagNotes.value = '';
  //   // newBagInput.style.display = 'block';
  //   // newBagBtn.style.display = 'none';
  //   newBagDiv.classList.add('enterName');
  //   // itemListContainer.innerHTML = '<div class="hintLabel emptyHint">Zadejte název tašky</div>';
  //   // newBagInput.focus();
  //   newBagInput.style.display = 'block';
  //   setTimeout(function(){
  //     newBagBtn.style.display = 'none';
  //     newBagInput.focus();
  //   }, 150);
  // }

  btn_addBag.onclick = async function(){
    showLoading();
    await checkAuth();
    await showDialog('addBag');
    hideLoading();
  }

  // adding new item
  btn_addItem.onclick = async function(){
    showLoading();
    await checkAuth();
    // dialog_addItem.style.display = 'block';
    // TODO make this more generic, don't require stuff here
    // await requireJS('js/addItem.js');
    // await requireCSS('css/addItem.css');
    // await showAddItemDialog();
    await showDialog('addItem');
    hideLoading();
  }

  // menu

  menu.onmouseover = menuBtn.onmouseover = function(){
    menu.selected = true;
  }

  menu.onmouseout = menuBtn.onmouseout = function(){
    menu.selected = false;
  }

  function showMenu(){
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

  logoutBtn.onclick = async function(){
    menu.style.display = 'none';
    showLoading();
    await POST('api/user/logout.php');
    location.href = 'index.php';
    hideLoading();
  }

  donatedBagsBtn.onclick = async function(){
    menu.style.display = 'none';
    showLoading();
    // await showDonatedBagsDialog();
    await showDialog('donatedBags');
    hideLoading();
  }

  settingsBtn.onclick = async function(){
    menu.style.display = 'none';
    showLoading();
    // await showSettingsDialog();
    await showDialog('settings');
    hideLoading();
  }

  // setting the bag as donated
  donateBtn.onclick = async function(){
    donateBtn.blur();
    // if(!await checkAuth()) return;
    // let allItems = JSON.parse(await GET('api/bag/getItems.php?bagId='+selectedBag.id));
    // if(!allItems.find(i=>!i.used)) {
    //   alert('Taška je prázdná!');
    //   return;
    // }
    if(!itemDivs.find(i=>!i.item.used)) {
      alert('Taška je prázdná!');
      return;
    }
    if(!confirm('Označit tašku '+selectedBag.name+' jako odevzdanou?\n(Odevzdané tašky můžete zobrazit/obnovit v menu -> odevzdané tašky)')) return;
    showLoading();
    await POST('api/bag/donateBag.php?bagId='+selectedBag.id);
    refresh();
  }

  // TODO can this be written more nicely?

  // changing bag info

  bagInfoForm.onsubmit = function(){
    return false;
  }

  bagInfoForm.onchange = async function(){

    bagInfoForm.bagName.blur();

    showLoading();
    checkAuth();
    let name = bagInfoForm.bagName.value.trim();

    if(!name) {
      bagInfoForm.bagName.value = selectedBag.name;
      return;
    }

    // TODO keep this for the server?
    let donated = JSON.parse(await GET('api/bag/listDonated.php'));
    hideLoading();

    if(donated.findIndex(b=>b.name.toLowerCase()==name.toLowerCase())>=0) {
      alert('Taška se stejným názvem je mezi odevzdanými taškami.');
      bagInfoForm.bagName.value = selectedBag.name;
      return;
    }

    if(allBags.findIndex(b=>(b.name.toLowerCase()==name.toLowerCase() && b.id!=selectedBag.id))>=0){
      alert('Taška se stejným názvem již existuje.');
      bagInfoForm.bagName.value = selectedBag.name;
      return;
    }

    // if(name.length>64){
    //   alert('Název je příliš dlouhý.');
    //   bagInfoForm.bagName.value = selectedBag.name;
    //   return;
    // }
    // if(bagInfoForm.bagNotes.value.length>1024){
    //   alert('Popis je příliš dlouhý.');
    //   bagInfoForm.bagNotes.value = selectedBag.description;
    //   return;
    // }
    
    if(selectedBagId) { // <--- why?
      showLoading();
      try{
        await POST('api/bag/updateInfo.php?bagId='+selectedBagId, {'name':name,'description':bagInfoForm.bagNotes.value});
      } catch(e){
        bagInfoForm.bagName.value = selectedBag.name;
        bagInfoForm.bagNotes.value = selectedBag.description;
        console.log(e);
        alert(e.message);
        hideLoading();
        return;
      }
      hideLoading();
    }

    bagButtons.find((b)=>b.bagId==selectedBag.id).innerText = name;

    await refresh();
    // await loadBags(); // doing this does not reload the bag info, changing it again does not reset it correctly

  }

  // TODO custom tooltip has to be aligned better
  // bagInfoForm.deleteBag.onmouseover = function(e){
  //   if(bagInfoForm.deleteBag.classList.contains('disabled')){
  //     let rect = bagInfoForm.bagName.getBoundingClientRect();
  //     showTooltip(rect.left, rect.top+rect.height, 'Nelze smazat plnou tašku!');
  //   }
  // }

  // bagInfoForm.deleteBag.onmouseout = function(e){
  //   hideTooltip();
  // }

  // deleting bag

  bagInfoForm.deleteBag.onclick = async function(){
    bagInfoForm.deleteBag.blur();
    if(bagInfoForm.deleteBag.classList.contains('disabled')) {
      return;
    }
    // if(!await checkAuth()) return;
    if(!confirm('Smazat tašku '+selectedBag.name+'?')) return;
    // window.history.replaceState('', '', '?');
    showLoading();
    await POST('api/bag/deleteBag.php?bagId='+selectedBag.id);
    await refresh();
  }

  // init

  await fetchConfig();
  await loadBags();
  if(selectedBagId) await loadBag(selectedBagId);
  
}
