
function toFirstUpper(str){ // TODO move this to utils
  return str.substring(0, 1).toUpperCase()+str.substring(1);
}

//const INACTIVITY_REFRESH =

//let prevLoad; // most recent time of refresh - long time of inactivity will cause an automatic refresh
let dialogs = []; // list of all open dialogs, TODO belongs to Application
let selectedBagId = 0; // id of currently selected bag, DEPRECATED - use selectedBag instead
let selectedBag; // currently selected bag
let loadBag; // function to load all items from the current bag
let refresh; // function to refresh everything (bags and items)
let refreshItems; // function to refresh currently cached items
let auth; // authentication data
let allBags = []; // list of all bags
let allItems; // list of all items in the current bags
let itemDivs = []; // list of all item UI containers
let tooltip; // currently shown tooltip, TODO belongs to Application
let config; // user configuration
// let nameDisplayMode;
// let dateDisplayMode;

function showTooltip(x, y, msg){
  if(tooltip) hideTooltip();
  tooltip = document.createElement('div');
  tooltip.innerText = msg;
  tooltip.className = 'tooltip';
  tooltip.style.left = x+'px';
  tooltip.style.top = y+'px';
  document.body.appendChild(tooltip);
}

function hideTooltip(){
  document.body.removeChild(tooltip);
  tooltip = null;
}

function hideDialogs(){
  // for(let i = dialogs.length-1; i>=0; i--){
  //   dialogs[i].hide();
  // }
  for(let dialog in dialogs){
    dialogs[dialog].hide();
  }
}

async function checkAuth(){
  auth = JSON.parse(await GET('api/auth.php'));
  if(!auth.loggedIn){
    location.href = 'index.php?reauth';
  }
  return auth.loggedIn;
}

window.onfocus = async function(){
  await checkAuth();
}

window.onload = async function(){

  if(!await checkAuth()) return;

  let bagButtons = [];

  let btn_addItem = document.querySelector('#btn_addItem');
  let div_bagInfoTitle = document.querySelector('#div_bagInfoTitle');
  let input_bagDates = document.querySelector('#input_bagDates');
  let input_bagNotes = document.querySelector('#input_bagNotes');

  function addBagButton(id, name, state){
    let btn = document.createElement('button');
    btn.className = 'bagBtn';
    btn.innerText = name;
    btn.classList.add(state);
    btn.bagId = id;
    btn.onclick = function(){
      loadBag(btn.bagId);
    }
    div_bagList.appendChild(btn);
    bagButtons.push(btn);
  }

  async function fetchConfig(){
    config = JSON.parse(await GET('api/getSettings.php'));
    nameDisplayOptions.value = config.itemDisplay;
    sortOptions.value = config.sort;
  }

  async function loadBags(){

    bagButtons = [];

    let status = JSON.parse(await GET('api/bag/status.php'));

    statusBar.innerHTML = status.message;
    statusBar.className = 'statusbar '+status.status;

    let bags = JSON.parse(await GET('api/bag/list.php'));

    allBags = bags;

    if(bags.length==0){
      initScreen.style.display = 'block';
      main.style.display = 'none';
      selectedBagId = null;
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
      selectedBagId = bags[bags.length-1].id;
    }

  }

  refreshItems = function(){

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
    usedSep.className = 'hintLabel';
    usedSep.innerText = 'Použité:';
    itemListContainer.appendChild(usedSep);

    for(let div of itemDivs){
      if(div.item.state=='used'){
        div.update();
        itemListContainer.appendChild(div);
      }
    }

  }

  function sortItems(){

    if(config.sort=='name'){
      itemDivs.sort((d1, d2)=>d1.getDisplayName().localeCompare(d2.getDisplayName()));
    } else {
      itemDivs.sort((d1, d2)=>(new Date(d1.item.expiration)-new Date(d2.item.expiration)));
    }

  }

  loadBag = async function(id){

    let start = performance.now();
    console.log('loading items');

    if(tooltip) hideTooltip();
    if(!id) return;
    if(!await checkAuth()) return;

    for(let btn of bagButtons){
      if(btn.bagId==id){
        btn.classList.add('selected');
      } else {
        btn.classList.remove('selected');
      }
    }

    allItems = JSON.parse(await GET('api/bag/getItems.php?bagId='+id));

    itemDivs = [];
    itemListContainer.innerText = '';

    let numUnused = 0;

    for(let item of allItems){
      let itemContainer = await createItem(item);
      itemDivs.push(itemContainer);
      if(!item.used) {
        numUnused++;
      }
    }

    sortItems();
    refreshItems();

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

  }

  refresh = async function(){

    await loadBags();
    await loadBag(selectedBagId);

  }

  async function addBag(name){

    name = name.substring(0, 1).toUpperCase()+name.substring(1).toLowerCase();

    if(!await checkAuth()) return;

    let handedOut = JSON.parse(await GET('api/bag/listHandedOut.php'));

    if(handedOut.findIndex(b=>b.name.toLowerCase()==name.toLowerCase())>=0) {
      alert('Taška se stejným názvem je mezi odevzdanými taškami.');
      return;
    }

    if(allBags.findIndex(b=>b.name.toLowerCase()==name.toLowerCase())>=0) {
      alert('Taška se stejným názvem již existuje.');
      return;
    }

    if(name.length>64){
      alert('Název tašky je příliš dlouhý.');
      return;
    }

    let bag = JSON.parse(await POST('api/bag/create.php', {'name':name}));
    if(!bag.id){
      alert('Nelze přidat tašku');
      return;
    }
    await loadBags();
    await loadBag(bag.id);
    // addBagButton(bag.id, name);
    // refresh();

    return true;

  }

  // btn_addBag.onclick = function(){
  //   let name = prompt('Název tašky:');
  //   if(!name) return;
  //   addBag(name);
  // }

  // sortNameBtn.onclick = function(){
  //   allItems.sort((i1, i2)=>i1.product.brand.localeCompare(i2.product.brand));
  //   displayItems();
  // }
  //
  // sortExpBtn.onclick = function(){
  //   allItems.sort((i1, i2)=>(new Date(i1.expiration)-new Date(i2.expiration)));
  //   displayItems();
  // }

  nameDisplayOptions.onchange = async function(){
    // nameDisplayMode = nameDisplayOptions.value;
    await POST('api/setConfig.php', {'itemDisplay':nameDisplayOptions.value});
    await fetchConfig();
    // refreshItems();
    sortItems();
    refreshItems();
  }

  sortOptions.onchange = async function(){
    await POST('api/setConfig.php', {'sort':sortOptions.value});
    await fetchConfig();
    sortItems();
    refreshItems();
  }

  // dateFormatOptions.onchange = function(){
  //   dateDisplayMode = dateFormatOptions.value;
  //   refreshItems();
  // }

  initForm.onsubmit = function(){
    let name = initForm.bagName.value.trim();
    initForm.bagName.value = '';
    if(!name) return false;
    addBag(name);
    refresh();
    return false;
  }

  newBagInput.onkeydown = function(e){
    if(e.code=='Escape'){
      newBagInput.value = '';
      // newBagInput.style.display = 'none';
      // newBagBtn.style.display = 'inline-block';
      newBagDiv.classList.remove('enterName');
      newBagInput.blur();
      refresh();
    }
  }

  addedBag = false;

  newBagInput.onchange = async function(){
    let name = newBagInput.value.trim();
    if(!name) return;
    // addedBag = true;
    addedBag = await addBag(name);
    newBagInput.value = '';
    newBagInput.blur();
    newBagDiv.classList.remove('enterName');
    // newBagInput.style.display = 'none';
    // newBagBtn.style.display = 'inline-block';
  }

  newBagInput.onblur = function(){
    // newBagInput.style.display = 'none';
    // newBagBtn.style.display = 'inline-block';
    newBagDiv.classList.remove('enterName');
    newBagInput.value = '';
    if(!addedBag){
      refresh();
    }
    addedBag = false;
  }

  newBagBtn.onclick = function(){
    for(let btn of bagButtons){
      btn.classList.remove('selected');
    }
    div_bagDates.innerText = 'Doporučené: \nNejpozději: ';
    bagInfoForm.bagName.value = '';
    bagInfoForm.bagNotes.value = '';
    // newBagInput.style.display = 'block';
    // newBagBtn.style.display = 'none';
    newBagDiv.classList.add('enterName');
    itemListContainer.innerHTML = '<div class="hintLabel emptyHint">Zadejte název tašky</div>';
    newBagInput.focus();
  }

  // newBagInput.style.display = 'none';

  btn_addItem.onclick = async function(){
    if(!await checkAuth()) return;
    // dialog_addItem.style.display = 'block';
    showAddItemDialog();
  }

  menuBtn.onclick = function(){
    // menuDialog.style.display = 'block';
    showUserMenu(auth.user.email);
  }

  handOutBtn.onclick = async function(){
    if(!await checkAuth()) return;
    if(!allItems.find(i=>!i.used)) {
      alert('Taška je prázdná!');
      return;
    }
    if(!confirm('Označit tašku '+selectedBag.name+' jako odevzdanou?\n(Odevzdané tašky můžete zobrazit/obnovit v menu -> odevzdané tašky)')) return;
    await POST('api/bag/handOut.php?bagId='+selectedBag.id);
    refresh();
    // if(!await checkAuth()) return;
    // handOutDialog.style.display = 'block';
    // loadCharities();
  }

  // searchBtn.onclick = async function(){
  //   if(!await checkAuth()) return;
  //   showSearchDialog();
  // }

  bagInfoForm.onsubmit = function(){
    return false;
  }

  bagInfoForm.onchange = async function(){
    if(!await checkAuth()) return;
    let name = bagInfoForm.bagName.value.trim();

    let handedOut = JSON.parse(await GET('api/bag/listHandedOut.php'));
    if(handedOut.findIndex(b=>b.name.toLowerCase()==name.toLowerCase())>=0) {
      alert('Taška se stejným názvem je mezi odevzdanými taškami.');
      bagInfoForm.bagName.value = selectedBag.name;
      return;
    }

    if(allBags.findIndex(b=>(b.name.toLowerCase()==name.toLowerCase() && b.id!=selectedBag.id))>=0){
      alert('Taška se stejným názvem již existuje.');
      bagInfoForm.bagName.value = selectedBag.name;
      return;
    }

    if(name.length>64){
      alert('Název je příliš dlouhý.');
      bagInfoForm.bagName.value = selectedBag.name;
      return;
    }
    if(bagInfoForm.bagNotes.value.length>1024){
      alert('Popis je příliš dlouhý.');
      bagInfoForm.bagNotes.value = selectedBag.description;
      return;
    }
    if(!name) {
      bagInfoForm.bagName.value = selectedBag.name;
      return;
    }
    if(selectedBagId) {
      await POST('api/bag/updateInfo.php?bagId='+selectedBagId, {'name':name,'description':bagInfoForm.bagNotes.value});
    }

    await refresh();

  }

  bagInfoForm.deleteBag.onclick = async function(){
    if(bagInfoForm.deleteBag.classList.contains('disabled')) {
      alert('Nelze smazat plnou tašku!'); // TODO make this a toast rather than alert?
      return;
    }
    if(!await checkAuth()) return;
    if(!confirm('Smazat tašku '+selectedBag.name+'?')) return;
    // window.history.replaceState('', '', '?');
    await POST('api/bag/delete.php?bagId='+selectedBag.id);
    await refresh();
  }

  await fetchConfig();
  await loadBags();
  if(selectedBagId) await loadBag(selectedBagId);
  // initAddItemDialog();
  // initAddProductDialog();
  // initEditItemDialog();

}
