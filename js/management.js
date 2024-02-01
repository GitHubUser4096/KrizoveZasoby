
let actionBtns = [];
let actionBtn;

async function refresh(){
  await actionBtn.onSelect();
}

async function loadEditSuggestions(){

  titleBar.innerText = "Návrhy změn produktů";

  showLoading();

  let edits = JSON.parse(await GET('api/product/listEditSuggestions.php'));
  let divs = [];

  for(let edit of edits){

    let div = await LayoutManager.getLayout('layouts/editSuggestion.html');
    div.className = 'itemContainer editSuggestionItem';

    div.elements.email.innerText = edit.editedBy.email;

    div.elements.oldTitle.innerText = edit.oldShortDesc;
    div.elements.oldBrand.innerText = edit.oldBrand;
    div.elements.oldAmount.innerText = edit.oldAmountValue ? (edit.oldAmountValue+' '+edit.oldAmountUnit) : '-';
    div.elements.oldCode.innerText = edit.oldCode;
    div.elements.oldPackageType.innerText = edit.oldPackageType??'-';
    if(edit.oldImgName) div.elements.oldImg.style.backgroundImage = 'url(images/'+edit.oldImgName+')';
    else div.elements.oldImg.style.backgroundImage = 'url(res/noImage.png)';

    if(edit.changedShortDesc){
      div.elements.newTitle.innerText = edit.shortDesc;
      div.elements.newTitle.style.color = 'red';
    } else {
      div.elements.newTitle.innerText = edit.oldShortDesc;
    }
    
    if(edit.changedBrandId){
      div.elements.newBrand.innerText = edit.brand;
      div.elements.newBrand.style.color = 'red';
    } else {
      div.elements.newBrand.innerText = edit.oldBrand;
    }

    if(edit.changedAmountValue || edit.changedAmountUnit){
      div.elements.newAmount.style.color = 'red';
    }
    div.elements.newAmount.innerText = (edit.changedAmountValue ? edit.amountValue : edit.oldAmountValue)+' '+(edit.changedAmountUnit ? edit.amountUnit : edit.oldAmountUnit);

    if(edit.changedCode){
      div.elements.newCode.innerText = edit.code;
      div.elements.newCode.style.color = 'red';
    } else {
      div.elements.newCode.innerText = edit.oldCode;
    }

    if(edit.changedPackageType){
      div.elements.newPackageType.innerText = edit.packageType??'-';
      div.elements.newPackageType.style.color = 'red';
    } else {
      div.elements.newPackageType.innerText = edit.oldPackageType??'-';
    }

    if(edit.changedImgName){
      if(edit.imgName) div.elements.newImg.style.backgroundImage = 'url(images/'+edit.imgName+')';
      else div.elements.newImg.style.backgroundImage = 'url(res/noImage.png)';
    } else {
      if(edit.oldImgName) div.elements.newImg.style.backgroundImage = 'url(images/'+edit.oldImgName+')';
      else div.elements.newImg.style.backgroundImage = 'url(res/noImage.png)';
    }

    div.elements.acceptBtn.onclick = async function(){
      div.elements.acceptBtn.blur();
      showLoading();
      await checkAuth();
      try {
        await POST('api/product/acceptEditSuggestion.php?editId='+edit.id);
      } catch(e){
        alert('Akci nelze provést: '+e.message);
      }
      await loadEditSuggestions();
      hideLoading();
    }

    div.elements.discardBtn.onclick = async function(){
      div.elements.discardBtn.blur();
      showLoading();
      await checkAuth();
      try {
        await POST('api/product/discardEditSuggestion.php?editId='+edit.id);
      } catch(e){
        console.error(e);
        alert('Akci nelze provést - neočekávaná chyba');
      }
      await loadEditSuggestions();
      hideLoading();
    }

    div.elements.suspendUserBtn.onclick = async function(){
      div.elements.suspendUserBtn.blur();
      showLoading();
      await checkAuth();
      try {
        await POST('api/product/discardEditSuggestion.php?editId='+edit.id);
        await POST('api/user/suspendUser.php?userId='+edit.editedBy.id);
      } catch(e){
        console.error(e);
        alert('Akci nelze provést - neočekávaná chyba');
      }
      await loadEditSuggestions();
      hideLoading();
    }

    divs.push(div);

  }

  itemListContainer.innerText = '';

  for(let div of divs){
    itemListContainer.appendChild(div);
  }

  if(!divs.length){
    let info = document.createElement('div');
    info.className = 'hintLabel';
    info.innerText = 'Žádné navrhované změny.';
    itemListContainer.appendChild(info);
  }

  hideLoading();

}

// TODO this should be paged or loaded dynamically
// TODO make image loading dynamic / more efficient
async function loadProducts(){

  showLoading();

  let divs = [];
  let products = JSON.parse(await GET('api/product/listProducts.php'));

  for(let product of products){

    let div = await LayoutManager.getLayout('layouts/product.html');
    div.className = 'itemContainer productItem';

    div.searchable = (product.shortDesc+' '+product.brand+' '+product.code+' '+product.packageType).toLowerCase();

    div.elements.productTitle.innerText = product.shortDesc;
        // product.brand+' • '+product.type+(product.amountValue ? (' • '+product.amountValue+' '+product.amountUnit) : '');
    div.elements.productBrand.innerText = 'Značka: '+product.brand;
    div.elements.productAmount.innerText = 'Množství: '+(product.amountValue ? (product.amountValue+' '+product.amountUnit) : '-');
    div.elements.productCode.innerText = 'Kód: '+product.code;
    div.elements.productPackageType.innerText = 'Balení: '+(product.packageType??'-');
    if(product.imgName) div.elements.productImage.style.backgroundImage = 'url(images/'+product.imgName+')';
    else div.elements.productImage.style.backgroundImage = 'url(res/noImage.png)';
    div.elements.email.innerText = product.createdBy.email;

    div.elements.editBtn.onclick = async function(){
      div.elements.editBtn.blur();
      showLoading();
      await checkAuth();
      await showDialog('addProduct', null, product);
      hideLoading();
    }

    divs.push(div);

  }

  titleBar.innerText = '';
  itemListContainer.innerText = '';

  let titleDiv = document.createElement('span');
  titleDiv.className = "pageTitle";
  titleDiv.innerText = "Všechny produkty";
  titleBar.appendChild(titleDiv);
  let searchBox = document.createElement('span');
  searchBox.className = "searchBox";
  let searchBar = document.createElement('input');
  searchBar.className = "searchBar";
  searchBar.placeholder = "Hledat";
  searchBox.appendChild(searchBar);
  let searchImg = document.createElement('img');
  searchImg.className = "searchImg";
  searchImg.src = "res/search.png";
  searchImg.onclick = function() {
    if(titleBar.classList.contains('mobileSearch')) {
      titleBar.classList.remove('mobileSearch');
    } else {
      titleBar.classList.add('mobileSearch');
    }
  }
  searchBox.appendChild(searchImg);
  titleBar.appendChild(searchBox);
  let addProductBtn = document.createElement('button');
  addProductBtn.innerText = "+";
  addProductBtn.onclick = async function(e) {
    showLoading();
    if(!await checkAuth()) return;
    await showDialog('addProduct');
    hideLoading();
  }
  addProductBtn.className = "addProductBtn";
  addProductBtn.title = "Přidat produkt";
  titleBar.appendChild(addProductBtn);

  searchBar.onchange = function(e) {
    itemListContainer.innerText = '';
    for(let div of divs){
      if(div.searchable.indexOf(e.target.value.toLowerCase()) >= 0) {
        itemListContainer.appendChild(div);
      }
    }
  }

  for(let div of divs){
    itemListContainer.appendChild(div);
  }

  if(!divs.length){
    let info = document.createElement('div');
    info.className = 'hintLabel';
    info.innerText = 'Žádné produkty.';
    itemListContainer.appendChild(info);
  }

  hideLoading();

}

async function loadUsers(){

  titleBar.innerText = "Uživatelé";

  showLoading();

  let users = JSON.parse(await GET('api/user/listUsers.php'));

  let divs = [];
  for(let user of users){
    
    if(user.id==auth.user.id) continue;

    let div = await LayoutManager.getLayout('layouts/user.html');
    div.className = 'itemContainer userItem';

    div.elements.email.innerText = user.email;
    div.elements.roleSelect.value = user.userRole;

    div.elements.roleSelect.onchange = async function(){
      showLoading();
      let userRole = div.elements.roleSelect.value;
      try {
        await checkAuth();
        await POST('api/user/updateRole.php?userId='+user.id, {
          userRole: userRole,
        });
      } catch(e){
        console.error(e);
        alert(e.message);
      }
      hideLoading();
      loadUsers();
    }

    divs.push(div);

  }

  itemListContainer.innerText = '';

  for(let div of divs){
    itemListContainer.appendChild(div);
  }

  hideLoading();

}

async function loadCharityRequests(){

  titleBar.innerText = "Registrace charit";

  showLoading();

  let divs = [];
  let charities = JSON.parse(await GET('api/charity/getCharityRequests.php'));

  for(let charity of charities){

    let div = await LayoutManager.getLayout('layouts/charityRequest.html');
    div.className = 'itemContainer charityRequestItem';

    div.elements.name.innerText = charity.name;
    div.elements.orgId.innerText = charity.orgId;
    // div.elements.contacts.innerText = charity.contacts;
    div.elements.user.innerText = charity.user.email;

    if(charity.contactWeb) div.elements.contacts.innerHTML += '<div>Web: <a target="_blank" href="'+charity.contactWeb+'">'+charity.contactWeb+'</a></div>';
    if(charity.contactMail) div.elements.contacts.innerHTML += '<div>E-mail: <a href="mailto:'+charity.contactMail+'">'+charity.contactMail+'</a></div>';
    if(charity.contactPhone) div.elements.contacts.innerHTML += '<div>Telefon: <a href="tel:'+charity.contactPhone+'">'+charity.contactPhone+'</a></div>';
    
    for(let place of charity.places) {
      let placeDiv = document.createElement('div');
      placeDiv.innerHTML = '<div>'+place.street+', '+place.place+', '+place.postCode+' '+(place.note??'')+'</div>'+
          '<div>'+place.openHours+'</div>';
      if(place.contactWeb) placeDiv.innerHTML += '<div>Web: <a target="_blank" href="'+place.contactWeb+'">'+place.contactWeb+'</a></div>';
      if(place.contactMail) placeDiv.innerHTML += '<div>E-mail: <a href="mailto:'+place.contactMail+'">'+place.contactMail+'</a></div>';
      if(place.contactPhone) placeDiv.innerHTML += '<div>Telefon: <a href="tel:'+place.contactPhone+'">'+place.contactPhone+'</a></div>';
      div.elements.places.appendChild(placeDiv);
      div.elements.places.appendChild(document.createElement('hr'));
    }

    div.elements.acceptBtn.onclick = async function(){
      div.elements.acceptBtn.blur();
      showLoading();
      await checkAuth();
      try {
        await POST('api/charity/acceptCharityRequest.php?charityId='+charity.id);
      } catch(e){
        console.error(e);
        alert('Akci nelze provést - neočekávaná chyba');
      }
      await loadCharityRequests();
      hideLoading();
    }

    div.elements.discardBtn.onclick = async function(){
      div.elements.discardBtn.blur();
      showLoading();
      await checkAuth();
      try {
        await POST('api/charity/discardCharityRequest.php?charityId='+charity.id);
      } catch(e){
        console.error(e);
        alert('Akci nelze provést - neočekávaná chyba');
      }
      await loadCharityRequests();
      hideLoading();
    }

    div.elements.suspendUserBtn.onclick = async function(){
      div.elements.suspendUserBtn.blur();
      showLoading();
      await checkAuth();
      try {
        await POST('api/charity/discardCharityRequest.php?charityId='+charity.id);
        await POST('api/user/suspendUser.php?userId='+charity.user.id);
      } catch(e){
        console.error(e);
        alert('Akci nelze provést - neočekávaná chyba');
      }
      await loadCharityRequests();
      hideLoading();
    }

    divs.push(div);

  }

  itemListContainer.innerText = '';

  for(let div of divs){
    itemListContainer.appendChild(div);
  }

  hideLoading();

}

async function loadCharities() {

  titleBar.innerText = "Správa charit";

  showLoading();

  let divs = [];
  let charities = JSON.parse(await GET('api/charity/getActiveCharities.php'));

  for(let charity of charities){

    let div = await LayoutManager.getLayout('layouts/activeCharity.html');
    div.className = 'itemContainer activeCharityItem';

    div.elements.name.innerText = charity.name;
    div.elements.orgId.innerText = charity.orgId;
    // div.elements.contacts.innerText = charity.contacts;
    div.elements.user.innerText = charity.user.email;

    if(charity.contactWeb) div.elements.contacts.innerHTML += '<div>Web: <a target="_blank" href="'+charity.contactWeb+'">'+charity.contactWeb+'</a></div>';
    if(charity.contactMail) div.elements.contacts.innerHTML += '<div>E-mail: <a href="mailto:'+charity.contactMail+'">'+charity.contactMail+'</a></div>';
    if(charity.contactPhone) div.elements.contacts.innerHTML += '<div>Telefon: <a href="tel:'+charity.contactPhone+'">'+charity.contactPhone+'</a></div>';
    
    for(let place of charity.places) {
      let placeDiv = document.createElement('div');
      // placeDiv.innerText = place.street+', '+place.place+', '+place.postCode+' '+(place.note??'')+'\n'+
      //     place.openHours+'\n'+
      //     (place.contacts??'');
      placeDiv.innerHTML = '<div>'+place.street+', '+place.place+', '+place.postCode+' '+(place.note??'')+'</div>'+
          '<div>'+place.openHours+'</div>';
      if(place.contactWeb) placeDiv.innerHTML += '<div>Web: <a target="_blank" href="'+place.contactWeb+'">'+place.contactWeb+'</a></div>';
      if(place.contactMail) placeDiv.innerHTML += '<div>E-mail: <a href="mailto:'+place.contactMail+'">'+place.contactMail+'</a></div>';
      if(place.contactPhone) placeDiv.innerHTML += '<div>Telefon: <a href="tel:'+place.contactPhone+'">'+place.contactPhone+'</a></div>';
      div.elements.places.appendChild(placeDiv);
      div.elements.places.appendChild(document.createElement('hr'));
    }

    div.elements.editBtn.onclick = async function(){
      showLoading();
      await checkAuth();
      await showDialog('registerCharity', charity);
      hideLoading();
    }

    divs.push(div);

  }

  itemListContainer.innerText = '';

  for(let div of divs){
    itemListContainer.appendChild(div);
  }

  hideLoading();

}

function addActionBtn(text, onSelect){
  let btn = document.createElement('button');
  btn.className = 'actionBtn';
  btn.innerText = text;
  btn.title = text;
  btn.onSelect = async function(){
    for(let b of actionBtns){
      if(b==btn){
        b.classList.add('selected');
      } else {
        b.classList.remove('selected');
      }
    }
    actionBtn = btn;
    await onSelect();
  }
  // reset scroll, but only if button pressed - possibly unclear
  btn.onclick = async function(){
    itemListContainer.innerText = '';
    btn.onSelect();
    main.classList.remove('showMenu');
  }
  actionBtns.push(btn);
  div_actionList.appendChild(btn);
}

window.onload = async function(){

  showLoading();

  await checkAuth();

  registerDialog('donatedBags', async function(){
    return await createDonatedBagsDialog();
  }, 'js/donatedBags.js', 'css/donatedBags.css');

  registerDialog('addProduct', async function(args){
    return await createAddProductDialog(...args);
  }, 'js/addProduct.js', 'css/addProduct.css');

  registerDialog('settings', async function(){
    return await createSettingsDialog();
  }, 'js/settings.js', 'css/settings.css');

  registerDialog('registerCharity', async function(args){
    return await createRegisterCharityDialog(...args);
  }, 'js/registerCharity.js', 'css/registerCharity.css');
  
  initMenu('management');

  statusBarBackBtn.onclick = function(){
    // history.back();
    location.href = 'profile.php';
  }

  mobileMenu.onclick = function() {
    main.classList.add('showMenu');
  }

  if(checkRole('editor')){
    addActionBtn('Návrhy změn produktů', loadEditSuggestions);
    addActionBtn('Všechny produkty', loadProducts);
  }

  if(checkRole('admin')){
    addActionBtn('Registrace charit', loadCharityRequests);
  }

  let charities = JSON.parse(await GET('api/charity/getActiveCharities.php'));

  if(checkRole('admin') || charities.length>0){
    addActionBtn('Správa charit', loadCharities);
  }

  if(checkRole('admin')){
    addActionBtn('Uživatelé', loadUsers);
  }

  if(actionBtns.length>0) actionBtns[0].onSelect();

  hideLoading();

}
