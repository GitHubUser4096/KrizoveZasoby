
let dialogs = [];
let selectedBagId = 0;
let selectedBag;
let loadBag;
let refresh;
let auth;
let allBags = [];
let allItems;
let tooltip;

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
  for(let i = dialogs.length-1; i>=0; i--){
    dialogs[i].hide();
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

  // let span_username = document.querySelector('#span_username');
  // usernameField.innerText = auth.user.email;

  let div_bagList = document.querySelector('#div_bagList');
  // let btn_addBag = document.querySelector('#btn_addBag');
  let div_itemList = document.querySelector('#div_itemList');
  let div_expList = document.querySelector('#div_expList');
  let div_usedList = document.querySelector('#div_usedList');
  let btn_addItem = document.querySelector('#btn_addItem');
  // let dialog_addItem = document.querySelector('#dialog_addItem');
  let div_bagInfoTitle = document.querySelector('#div_bagInfoTitle');
  let input_bagDates = document.querySelector('#input_bagDates');
  let input_bagNotes = document.querySelector('#input_bagNotes');

  function addBagButton(id, name, state){
    let btn = document.createElement('button');
    btn.className = 'bagBtn';
    btn.innerText = name;
    btn.classList.add(state);
    // if(state=='expired'){
    //   btn.classList.add('bagBtnExp');
    //   // btn.style.color = 'red';
    // } else if(state=='useRecommended'){
    //   btn.classList.add('bagBtnRec');
    //   // btn.style.color = 'yellow';
    // } else if(state=='empty'){
    //   btn.classList.add('bagBtnUsed');
    //   // btn.style.color = 'gray';
    // }
    btn.bagId = id;
    btn.onclick = function(){
      loadBag(btn.bagId);
    }
    div_bagList.appendChild(btn);
    bagButtons.push(btn);
  }

  async function loadBags(){

    bagButtons = [];

    let status = JSON.parse(await GET('api/bag/status.php'));

    statusBar.innerHTML = status.message;
    statusBar.className = 'statusbar '+status.status;

    let bags = JSON.parse(await GET('api/bag/list.php'));

    if(bags.length==0){
      initScreen.style.display = 'block';
      main.style.display = 'none';
      selectedBagId = null;
      return;
    } else {
      initScreen.style.display = 'none';
      main.style.display = 'block';
    }

    allBags = bags;

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

  loadBag = async function(id){

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

    let items = JSON.parse(await GET('api/bag/getItems.php?bagId='+id));

    allItems = items;

    if(items.length==0){
      listBox_empty.style.display = 'block';
    } else {
      listBox_empty.style.display = 'none';
    }

    let numUnused = 0;

    // let numItems = 0;
    let numExp = 0;
    let numCrit = 0;
    let numWarn = 0;
    let numRec = 0;
    let numOk = 0;
    let numUsed = 0;

    div_expList.innerText = '';
    div_critList.innerText = '';
    div_warnList.innerText = '';
    div_recList.innerText = '';
    div_okList.innerText = '';
    // div_itemList.innerText = '';
    div_usedList.innerText = '';
    for(let item of items){

      let div = document.createElement('div');
      div.className = 'listItem';
      let itemSpan = document.createElement('span');
      itemSpan.innerText = item.product.name+' ×'+item.count+' ';
      let expSpan = document.createElement('span');
      // expSpan.innerText = item.expiration ? (item.expiration+(item.useIn?(' ('+item.useIn+')'):'')) : '---';
      expSpan.innerText = item.expiration ? item.expiration : '---';
      expSpan.className = 'listItemExp';

      expSpan.onmouseover = function(e){
        let bounds = expSpan.getBoundingClientRect();
        if(item.useIn) showTooltip(bounds.left, bounds.top+bounds.height, item.useIn);
      }

      expSpan.onmouseout = function(e){
        if(tooltip) hideTooltip();
      }

      let optBtn = document.createElement('button');
      optBtn.innerText = '···';
      optBtn.className = 'listItemOpt';
      optBtn.onclick = async function(){
        if(!await checkAuth()) return;
        showEditItemDialog(item);
      }
      div.appendChild(itemSpan);
      div.appendChild(expSpan);
      div.appendChild(optBtn);

      let today = new Date();
      today.setHours(0, 0, 0, 0);

      if(item.used) {
        div_usedList.appendChild(div);
        numUsed++;
      } else {
        numUnused++;
        if(item.state=='expired'){
          div_expList.appendChild(div);
          numExp++;
        } else if(item.state=='critical'){
          div_critList.appendChild(div);
          numCrit++;
        } else if(item.state=='warn'){
          div_warnList.appendChild(div);
          numWarn++;
        } else if(item.state=='recommended'){
          div_recList.appendChild(div);
          numRec++;
        } else {
          div_okList.appendChild(div);
          numOk++;
        }
      }
      // else if(new Date(item.expiration)<today){
      //   div_expList.appendChild(div);
      //   numExp++;
      // } else {
      //   div_itemList.appendChild(div);
      //   numItems++;
      //   if(Math.abs(new Date(item.expiration)-today)<1000*60*60*24*7*3){ // TODO global config rec exp date
      //     div.classList.add('nearExp');
      //   }
      // }

    }

    listBox_exp.style.display = numExp?'block':'none';
    listBox_crit.style.display = numCrit?'block':'none';
    listBox_warn.style.display = numWarn?'block':'none';
    listBox_rec.style.display = numRec?'block':'none';
    listBox_ok.style.display = numOk?'block':'none';
    listBox_used.style.display = numUsed?'block':'none';

    // if(numExp){
    //   listBox_exp.style.display = 'block';
    // } else {
    //   listBox_exp.style.display = 'none';
    // }
    //
    // if(numUsed){
    //   listBox_used.style.display = 'block';
    // } else {
    //   listBox_used.style.display = 'none';
    // }
    //
    // if(numItems){
    //   listBox.style.display = 'block';
    // } else {
    //   listBox.style.display = 'none';
    // }

    let info = JSON.parse(await GET('api/bag/getInfo.php?bagId='+id));

    div_bagDates.innerText = 'Doporučené: '+info.useRecommended+'\n'+'Nejpozději: '+info.useBefore;

    // div_bagInfoTitle.innerText = info.name;
    bagInfoForm.bagName.value = info.name;
    // input_bagNotes.value = info.description;
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

    if(allBags.findIndex(b=>b.name.toLowerCase()==name.toLowerCase())>=0) {
      alert('Taška se stejným názvem již existuje.');
      return;
    }

    let handedOut = JSON.parse(await GET('api/bag/listHandedOut.php'));

    if(handedOut.findIndex(b=>b.name.toLowerCase()==name.toLowerCase())>=0) {
      alert('Taška se stejným názvem je mezi odevzdanými taškami.');
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

  }

  // btn_addBag.onclick = function(){
  //   let name = prompt('Název tašky:');
  //   if(!name) return;
  //   addBag(name);
  // }

  initForm.onsubmit = function(){
    let name = initForm.bagName.value.trim();
    initForm.bagName.value = '';
    if(!name) return false;
    addBag(name);
    refresh();
    return false;
  }

  newBagInput.onchange = function(){
    let name = newBagInput.value.trim();
    if(!name) return;
    addBag(name);
    newBagInput.value = '';
  }

  btn_addItem.onclick = async function(){
    if(!await checkAuth()) return;
    // dialog_addItem.style.display = 'block';
    showAddItemDialog();
  }

  // input_bagNotes.onchange = async function(e){
  //   if(selectedBagId) await POST('api/bag/updateInfo.php?bagId='+selectedBagId, {'description':input_bagNotes.value});
  // }

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

  // menuCloseBtn.onclick = function(){
  //   menuDialog.style.display = 'none';
  // }

  handOutClose.onclick = function(){
    handOutDialog.style.display = 'none';
  }

  // searchBtn.onclick = async function(){
  //   if(!await checkAuth()) return;
  //   showSearchDialog();
  // }

  // logoutBtn.onclick = async function(){
  //   await POST('api/logout.php');
  //   location.href = 'index.php';
  // }

  bagInfoForm.onsubmit = function(){
    return false;
  }

  bagInfoForm.onchange = async function(){
    if(!await checkAuth()) return;
    let name = bagInfoForm.bagName.value.trim();
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

  await loadBags();
  if(selectedBagId) await loadBag(selectedBagId);
  // initAddItemDialog();
  // initAddProductDialog();
  // initEditItemDialog();

}
