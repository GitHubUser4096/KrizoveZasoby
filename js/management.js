
let actionBtns = [];
let actionBtn;

async function refresh(){
  await actionBtn.onSelect();
}

async function loadEditSuggestions(){

  showLoading();

  // rather useless - either remove or change to a non-scrolling title
  // let info = document.createElement('div');
  // info.className = 'hintLabel';
  // info.innerText = 'Navrhované změny:';
  // itemListContainer.appendChild(info);

  let edits = JSON.parse(await GET('api/product/listEditSuggestions.php'));
  let divs = [];

  for(let edit of edits){

    let div = await LayoutManager.getLayout('layouts/editSuggestion.html');
    div.className = 'itemContainer editSuggestionItem';

    div.elements.email.innerText = edit.editedBy.email;

    div.elements.oldTitle.innerText = div.elements.oldTitle.title = edit.oldBrand+' • '+edit.oldType+(edit.oldAmountValue ? (' • '+edit.oldAmountValue+' '+edit.oldAmountUnit) : '');
    div.elements.oldShortDesc.innerText = div.elements.oldShortDesc.title = edit.oldShortDesc;
    div.elements.oldCode.innerText = div.elements.oldCode.title = 'Kód: '+edit.oldCode;
    div.elements.oldPackageType.innerText = div.elements.oldPackageType.title = 'Balení: '+(edit.oldPackageType??'-');
    div.elements.oldDescription.innerText = div.elements.oldDescription.title = 'Poznámky: '+(edit.oldDescription??'-');
    if(edit.oldImgName) div.elements.oldImg.style.backgroundImage = 'url(images/'+edit.oldImgName+')';
    else div.elements.oldImg.style.backgroundImage = 'url(res/noImage.png)';
    
    let brandSpan = document.createElement('span');
    let typeSpan = document.createElement('span');
    let amountValueSpan = document.createElement('span');
    let amountUnitSpan = document.createElement('span');

    if(edit.changedBrandId){
      brandSpan.innerText = edit.brand;
      brandSpan.style.color = 'red';
    } else {
      brandSpan.innerText = edit.oldBrand;
    }

    if(edit.changedTypeId){
      typeSpan.innerText = edit.type;
      typeSpan.style.color = 'red';
    } else {
      typeSpan.innerText = edit.oldType;
    }

    if(edit.changedAmountValue){
      amountValueSpan.innerText = edit.amountValue;
      amountValueSpan.style.color = 'red';
    } else {
      amountValueSpan.innerText = edit.oldAmountValue;
    }

    if(edit.changedAmountUnit){
      amountUnitSpan.innerText = edit.amountUnit;
      amountUnitSpan.style.color = 'red';
    } else {
      amountUnitSpan.innerText = edit.oldAmountUnit;
    }

    // div.elements.newTitle.innerText = edit.brand+' • '+edit.type+' • '+edit.amountValue+' '+edit.amountUnit;
    div.elements.newTitle.appendChild(brandSpan);
    div.elements.newTitle.appendChild(document.createTextNode(' • '));
    div.elements.newTitle.appendChild(typeSpan);
    if((edit.changedAmountValue && edit.amountValue) || edit.oldAmountValue){
      div.elements.newTitle.appendChild(document.createTextNode(' • '));
      div.elements.newTitle.appendChild(amountValueSpan);
      div.elements.newTitle.appendChild(document.createTextNode(' '));
      div.elements.newTitle.appendChild(amountUnitSpan);
    }
    div.elements.newTitle.title = div.elements.newTitle.innerText;

    if(edit.changedShortDesc){
      div.elements.newShortDesc.innerText = edit.shortDesc;
      div.elements.newShortDesc.style.color = 'red';
    } else {
      div.elements.newShortDesc.innerText = edit.oldShortDesc;
    }
    div.elements.newShortDesc.title = div.elements.newShortDesc.innerText;

    if(edit.changedCode){
      div.elements.newCode.innerText = 'Kód: '+edit.code;
      div.elements.newCode.style.color = 'red';
    } else {
      div.elements.newCode.innerText = 'Kód: '+edit.oldCode;
    }
    div.elements.newCode.title = div.elements.newCode.innerText;

    if(edit.changedPackageType){
      div.elements.newPackageType.innerText = 'Balení: '+(edit.packageType??'-');
      div.elements.newPackageType.style.color = 'red';
    } else {
      div.elements.newPackageType.innerText = 'Balení: '+(edit.oldPackageType??'-');
    }
    div.elements.newPackageType.title = div.elements.newPackageType.innerText;

    if(edit.changedDescription){
      div.elements.newDescription.innerText = 'Poznámky: '+(edit.description??'-');
      div.elements.newDescription.style.color = 'red';
    } else {
      div.elements.newDescription.innerText = 'Poznámky: '+(edit.oldDescription??'-');
    }
    div.elements.newDescription.title = div.elements.newDescription.innerText;

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
      try {
        await POST('api/product/acceptEditSuggestion.php?editId='+edit.id);
      } catch(e){
        console.error(e);
        alert('Akci nelze provést - neočekávaná chyba');
      }
      await loadEditSuggestions();
      hideLoading();
    }

    div.elements.discardBtn.onclick = async function(){
      div.elements.discardBtn.blur();
      showLoading();
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

  // let div = await LayoutManager.getLayout('layouts/editSuggestion.html');
  // div.className = 'itemContainer editSuggestionItem';
  // itemListContainer.appendChild(div);

}

// TODO this should be paged or loaded dynamically
// TODO make image loading dynamic / more efficient
async function loadProducts(){

  showLoading();

  let divs = [];
  let products = JSON.parse(await GET('api/product/listProducts.php'));

  // let divs = [];
  // for(let product of products){
  //   let div = await LayoutManager.getLayout('layouts/product.html');
  //   div.className = 'itemContainer productItem';
  //   divs.push(div);
  // }

  // let info = document.createElement('div');
  // info.className = 'hintLabel';
  // info.innerText = 'Všechny produkty:';
  // itemListContainer.appendChild(info);

  // let i = 0;
  for(let product of products){

    let div = await LayoutManager.getLayout('layouts/product.html');
    div.className = 'itemContainer productItem';
    // let div = divs[i];
    // i++;

    div.elements.productTitle.innerText = div.elements.productTitle.title =
        product.brand+' • '+product.type+(product.amountValue ? (' • '+product.amountValue+' '+product.amountUnit) : '');
    div.elements.productShortDesc.innerText = div.elements.productShortDesc.title = product.shortDesc;
    div.elements.productCode.innerText = div.elements.productCode.title = 'Kód: '+product.code;
    div.elements.productPackageType.innerText = div.elements.productPackageType.title = 'Balení: '+(product.packageType??'-');
    div.elements.productDescription.innerText = div.elements.productDescription.title = 'Poznámky: '+(product.description??'-');
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

    // let div = document.createElement('div');
    // div.innerText = product.shortDesc;

    divs.push(div);

  }

  itemListContainer.innerText = '';

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
      // console.log(user.id, div.elements.roleSelect.value);
      showLoading();
      let userRole = div.elements.roleSelect.value;
      try {
        await POST('api/user/updateRole.php?userId='+user.id, {
          userRole: userRole,
        });
      } catch(e){
        console.error(e);
        alert('Akci nelze provést - neočekávaná chyba');
      }
      hideLoading();
      loadUsers();
    }

    // div.innerText = user.email;

    // itemListContainer.appendChild(div);
    divs.push(div);

  }

  itemListContainer.innerText = '';

  // let info = document.createElement('div');
  // info.className = 'hintLabel';
  // info.innerText = 'Uživatelé:';
  // itemListContainer.appendChild(info);

  for(let div of divs){
    itemListContainer.appendChild(div);
  }

  // for(let user of users){

  //   if(user.id==auth.user.id) continue;

  //   let div = await LayoutManager.getLayout('layouts/user.html');
  //   div.className = 'itemContainer userItem';

  //   div.elements.email.innerText = user.email;
  //   div.elements.roleSelect.value = user.userRole;

  //   div.elements.roleSelect.onchange = async function(){
  //     // console.log(user.id, div.elements.roleSelect.value);
  //     showLoading();
  //     let userRole = div.elements.roleSelect.value;
  //     await POST('api/user/updateRole.php?userId='+user.id, {
  //       userRole: userRole,
  //     });
  //     hideLoading();
  //     loadUsers();
  //   }

  //   // div.innerText = user.email;

  //   itemListContainer.appendChild(div);

  // }

  hideLoading();

}

function addActionBtn(text, onSelect){
  let btn = document.createElement('button');
  btn.className = 'actionBtn';
  btn.innerText = text;
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
  
  initMenu('management');

  statusBarBackBtn.onclick = function(){
    history.back();
  }

  addActionBtn('Návrhy změn', loadEditSuggestions);
  addActionBtn('Produkty', loadProducts);

  if(checkRole('admin')){
    addActionBtn('Uživatelé', loadUsers);
  }

  actionBtns[0].onSelect();

  // await loadEditSuggestions();

  hideLoading();

}
