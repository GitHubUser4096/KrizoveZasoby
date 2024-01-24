/** id of currently selected bag (the bag that should be loaded on load/refresh, should exist when no bag is loaded) **/
let selectedBagId = 0;
/** id of item to be expanded when a the current bag is refreshed **/
let expandedItemId = null;
/** id of item that was just moved to a different bag and should be expanded once refreshed **/
let movedItemId = null;
/** info about the currently selected bag **/
let selectedBag;
/** list of all bags **/
let allBags = [];
/** list of bag buttons **/
let bagButtons = [];
/** list of all item UI containers **/
let itemDivs = [];
/** user configuration **/
let config;
let itemDisplay;
let itemSort;

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
    selectedBagId = bags[bags.length-1].id; // TODO last or first bag? - make it previous loaded bag (save to DB)
  }

  hideLoading();

}

/** updates the user configuration **/
async function fetchConfig(){
  config = JSON.parse(await GET('api/user/getSettings.php'));
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

  if(itemSort=='name'){
    itemDivs.sort((d1, d2)=>d1.getDisplayName().localeCompare(d2.getDisplayName()));
  } else {
    itemDivs.sort((d1, d2)=>{
      // if only one item has a date, put it before the other one (items with a date will be above those without)
      let exp1 = d1.item.expiration ? d1.item.expiration : "";
      let exp2 = d2.item.expiration ? d2.item.expiration : "";
      if(Math.sign(exp1.length)!=Math.sign(exp2.length)){
        return exp1.length ? -1 : 1;
      }
      return new Date(d1.item.expiration)-new Date(d2.item.expiration);
    });
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
    // expandedItem.scrollIntoViewIfNeeded(); // scrollIntoViewIfNeeded is not supported on some platforms
    // TODO check if in view manually and then call scrollIntoView()
    expandedItem.scrollIntoViewIfNeeded ? expandedItem.scrollIntoViewIfNeeded() : expandedItem.scrollIntoView();
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

  div_bags.classList.add('mobileHidden');
  div_currentBag.classList.remove('mobileHidden');
  div_bagInfo.classList.add('mobileHidden');
  div_items.classList.remove('mobileHidden');
  mobileBagName.innerText = 'Taška: '+selectedBag.name;

  hideLoading();

}

/** refreshes the application state - status, bag list and current bag **/
async function refresh(){

  await loadBags();
  await loadBag(selectedBagId);

}

// TODO used only in init - move to init submit?
async function addBag(name, description){

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

  registerDialog('registerCharity', async function(){
    return await createRegisterCharityDialog();
  }, 'js/registerCharity.js', 'css/registerCharity.css');

  registerDialog('findCharity', async function(){
    return await createFindCharityDialog();
  }, 'js/findCharity.js', 'css/findCharity.css');

  registerDialog('donateBag', async function(){
    return await createDonateBagDialog();
  }, 'js/donateBag.js', 'css/donateBag.css');

  initMenu('profile');

  // name and sort change listeners

  nameDisplayOptions.onchange = async function(){
    itemDisplay = nameDisplayOptions.value;
    localStorage.setItem('itemDisplay', itemDisplay);
    sortItems();
    refreshItems();
  }

  sortOptions.onchange = async function(){
    itemSort = sortOptions.value;
    localStorage.setItem('itemSort', itemSort);
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
  }

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
    await showDialog('addItem');
    hideLoading();
  }

  // setting the bag as donated
  donateBtn.onclick = async function(){
    donateBtn.blur();
    if(!itemDivs.find(i=>!i.item.used)) {
      alert('Taška je prázdná!');
      return;
    }
    showLoading();
    await checkAuth();
    await showDialog('donateBag');
    hideLoading();
  }

  // TODO can this be written more nicely?

  // changing bag info

  bagInfoForm.onsubmit = function(){
    return false;
  }

  bagInfoForm.onchange = async function(){

    bagInfoForm.bagName.blur();

    showLoading();
    await checkAuth();
    let name = toFirstUpper(bagInfoForm.bagName.value.trim());

    if(!name) {
      bagInfoForm.bagName.value = selectedBag.name;
      hideLoading();
      return;
    }

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
      hideLoading();
      return;
    }

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

    await refresh();

  }

  mobileBagsBtn.onclick = function(){
    div_bags.classList.remove('mobileHidden');
    div_currentBag.classList.add('mobileHidden');
  }

  mobileBagInfoBtn.onclick = function(){
    div_bagInfo.classList.remove('mobileHidden');
    div_items.classList.add('mobileHidden');
  }

  // saveBagInfoBtn.onclick = function(){
  //   div_bagInfo.classList.add('mobileHidden');
  //   div_items.classList.remove('mobileHidden');
  // }

  bagInfoBackBtn.onclick = function(){
    div_bagInfo.classList.add('mobileHidden');
    div_items.classList.remove('mobileHidden');
  }

  bagsBackBtn.onclick = function(){
    div_bags.classList.add('mobileHidden');
    div_currentBag.classList.remove('mobileHidden');
  }

  // deleting bag

  bagInfoForm.deleteBag.onclick = async function(){
    bagInfoForm.deleteBag.blur();
    if(bagInfoForm.deleteBag.classList.contains('disabled')) {
      return;
    }
    if(!confirm('Smazat tašku '+selectedBag.name+'?')) return;
    showLoading();
    await POST('api/bag/deleteBag.php?bagId='+selectedBag.id);
    await refresh();
  }

  // init

  itemDisplay = localStorage.getItem('itemDisplay') ?? 'brandFirst';
  itemSort = localStorage.getItem('itemSort') ?? 'date';

  nameDisplayOptions.value = itemDisplay;
  sortOptions.value = itemSort;

  await fetchConfig();
  await loadBags();
  if(selectedBagId) await loadBag(selectedBagId);
  
}
