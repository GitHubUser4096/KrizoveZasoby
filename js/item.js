
async function createItem(item){

  // let div = document.createElement('div');
  let div = await LayoutManager.getLayout('layouts/item.html');
  div.className = 'itemContainer';

  div.item = item;
  item.container = div;
  div.expanded = false;

  if(checkRole('contributor')){
    div.classList.add('productEditable');
  }

  // div.classList.add(item.state);

  // div.innerHTML = await RequestCache.get('layouts/item.html');

  // TODO what to do with these? (layout-id?)

  let itemBrief = div.querySelector('.itemBrief');
  let itemBriefName = div.querySelector('.itemBriefName');
  let itemBriefShortDesc = div.querySelector('.itemBriefShortDesc');
  let itemBriefCount = div.querySelector('.itemBriefCount');
  // let itemBriefExp = div.querySelector('.itemBriefExp');
  let itemBriefExpDate = div.querySelector('.itemBriefExpDate');
  let itemBriefExpIn = div.querySelector('.itemBriefExpIn');

  let itemDetails = div.querySelector('.itemDetails');
  let itemDetailsImg = div.querySelector('.itemDetailsImg');
  let itemDetailsName = div.querySelector('.itemDetailsName');
  let itemDetailsEditProduct = div.querySelector('.itemDetailsEditProduct');
  let itemDetailsShortDesc = div.querySelector('.itemDetailsShortDesc');
  let itemDetailsPackage = div.querySelector('.itemDetailsPackage');
  let itemDetailsCount = div.querySelector('.itemDetailsCount');
  // let itemDetailsExp = div.querySelector('.itemDetailsExp');
  let itemDetailsExpDate = div.querySelector('.itemDetailsExpDate');
  let itemDetailsExpIn = div.querySelector('.itemDetailsExpIn');

  let itemDetailsMenu = div.querySelector('.itemDetailsMenu');
  let itemUseMenu = div.querySelector('.itemUseMenu');

  let itemEditBtn = div.querySelector('.itemEditBtn');
  let itemUseBtn = div.querySelector('.itemUseBtn');
  let itemUnuseBtn = div.querySelector('.itemUnuseBtn');
  let itemMoveBtn = div.querySelector('.itemMoveBtn');
  let itemDeleteBtn = div.querySelector('.itemDeleteBtn');

  let itemUseBackBtn = div.querySelector('.itemUseBackBtn');
  let itemUseDecrementBtn = div.querySelector('.itemUseDecrementBtn');
  let itemUseCountInput = div.querySelector('.itemUseCountInput');
  let itemUseIncrementBtn = div.querySelector('.itemUseIncrementBtn');
  let itemUseAcceptBtn = div.querySelector('.itemUseAcceptBtn');

  itemDetailsEditProduct.onclick = async function(e){
    e.stopPropagation();
    showLoading();
    if(!await checkAuth()) return;
    await showDialog('addProduct', null, div.item.product);
    hideLoading();
  }

  itemDetailsMenu.onclick = function(e){
    e.stopPropagation();
  }

  itemUseMenu.onclick = function(e){
    e.stopPropagation();
  }

  if(item.used){
    itemUseBtn.style.display = 'none';
  } else {
    itemUnuseBtn.style.display = 'none';
  }

  itemEditBtn.onclick = async function(e){
    showLoading();
    await checkAuth();
    // await showEditItemDialog(div.item);
    await showDialog('editItem', div.item);
    hideLoading();
  }

  itemUseBtn.onclick = function(e){
    itemDetailsMenu.style.display = 'none';
    itemUseMenu.style.display = 'block';
    itemUseCountInput.classList.remove('invalid');
    itemUseCountInput.value = 1;
  }

  itemUnuseBtn.onclick = function(e){
    itemDetailsMenu.style.display = 'none';
    itemUseMenu.style.display = 'block';
    itemUseCountInput.classList.remove('invalid');
    itemUseCountInput.value = 1;
  }

  itemMoveBtn.onclick = async function(e){
    if(allBags.length==1) {
      alert('Neexistuje žádná taška, do které by bylo možné položku přesunout!');
      return;
    }
    showLoading();
    await checkAuth();
    // await showMoveItemDialog(item);
    await showDialog('moveItem', item);
    hideLoading();
  }

  itemDeleteBtn.onclick = async function(e){
    itemDeleteBtn.blur();
    if(!confirm('Smazat položku '+item.product.shortDesc+'?')) return;
    showLoading();
    await POST('api/item/deleteItem.php?itemId='+item.id);
    hideLoading();
    await refresh();
  }

  itemUseBackBtn.onclick = function(e){
    itemDetailsMenu.style.display = 'block';
    itemUseMenu.style.display = 'none';
  }

  // TODO replace this with counter?

  itemUseDecrementBtn.onclick = function(e){
    itemUseCountInput.classList.remove('invalid');
    itemUseCountInput.value = itemUseCountInput.value-1;
    if(itemUseCountInput.value<1) itemUseCountInput.value = 1;
    if(itemUseCountInput.value>item.count) itemUseCountInput.value = item.count;
  }

  itemUseDecrementBtn.onmousedown = function(e){
    itemUseDecrementBtn.holdTimeout = setTimeout(function(){
      itemUseCountInput.value = 1;
    }, 400);
  }

  itemUseDecrementBtn.onmouseup = function(e){
    clearTimeout(itemUseDecrementBtn.holdTimeout);
  }

  itemUseIncrementBtn.onclick = function(e){
    itemUseCountInput.classList.remove('invalid');
    itemUseCountInput.value = +itemUseCountInput.value+1;
    if(itemUseCountInput.value<1) itemUseCountInput.value = 1;
    if(itemUseCountInput.value>item.count) itemUseCountInput.value = item.count;
  }

  itemUseIncrementBtn.onmousedown = function(e){
    itemUseIncrementBtn.holdTimeout = setTimeout(function(){
      itemUseCountInput.value = item.count;
    }, 400);
  }

  itemUseIncrementBtn.onmouseup = function(e){
    clearTimeout(itemUseIncrementBtn.holdTimeout);
  }

  itemUseCountInput.oninput = function(){
    itemUseCountInput.classList.remove('invalid');
  }

  itemUseCountInput.onkeypress = function(e){
    if(e.code=='Enter') useItem();
  }

  itemUseAcceptBtn.onclick = function(e){
    useItem();
  }

  async function useItem(){

    if(div.submitted) return;
    div.submitted = true;

    let count = itemUseCountInput.value;
    if(parseInt(count)!=count || count<1 || count>item.count) {
      itemUseCountInput.classList.add('invalid');
      div.submitted = false;
      return;
    }
    count = parseInt(count);

    showLoading();
    let res;
    if(item.used) res = JSON.parse(await POST('api/item/setItemUnused.php?itemId='+div.item.id, {'unuseCount':count}));
    else res = JSON.parse(await POST('api/item/setItemUsed.php?itemId='+div.item.id, {'useCount':count}));
    expandedItemId = res.id;
    hideLoading();

    await refresh();

    div.submitted = false;

  }

  itemBriefShortDesc.innerText = item.product.shortDesc;
  itemBriefShortDesc.title = item.product.shortDesc;
  itemDetailsShortDesc.innerText = item.product.shortDesc;
  itemDetailsShortDesc.title = item.product.shortDesc;
  itemDetailsPackage.innerText = item.product.packageType;
  itemDetailsPackage.title = item.product.packageType;
  if(item.product.imgName) itemDetailsImg.style.backgroundImage = 'url(images/'+item.product.imgName+')';
  else itemDetailsImg.style.backgroundImage = 'url(res/noImage.png)';

  div.expand = function(){
    for(let itemDiv of itemDivs){
      itemDiv.collapse();
    }
    div.classList.add('expanded');
    expandedItemId = div.item.id;
    div.expanded = true;
    itemBrief.style.display = 'block';
    itemDetails.style.display = 'block';
    setTimeout(function(){
      itemBrief.style.display = 'none';
      itemDetails.style.display = 'block';
    }, 200);
  }

  div.collapse = function(){
    if(!div.expanded) return;
    expandedItemId = null;
    div.classList.remove('expanded');
    div.expanded = false;
    itemDetailsMenu.style.display = 'block';
    itemUseMenu.style.display = 'none';
    itemBrief.style.display = 'block';
    itemDetails.style.display = 'block';
    setTimeout(function(){
      itemBrief.style.display = 'block';
      itemDetails.style.display = 'none';
    }, 200);
  }

  div.onclick = function(e){

    let expanded = div.expanded;

    for(let itemDiv of itemDivs){
      itemDiv.collapse();
    }

    if(!expanded) div.expand();

  }

  div.getDisplayName = function(){
    let res = '';
    if(config.itemDisplay=='typeFirst'){
      res = div.item.product.type+' • '+div.item.product.brand;
    } else {
      res = div.item.product.brand+' • '+div.item.product.type;
    }
    if(div.item.product.amountValue){
      res += ' • '+div.item.product.amountValue+' '+div.item.product.amountUnit;
    }
    return res;
  }

  div.setItem = function(item){
    div.item = item;
    item.container = div;
    div.update();
  }

  div.update = function(){

    div.className = 'itemContainer '+div.item.state+(div.expanded?' expanded':'');

    if(checkRole('contributor')){
      div.classList.add('productEditable');
    }

    if(div.item.count==1){
      itemUseDecrementBtn.classList.add('disabled');
      itemUseIncrementBtn.classList.add('disabled');
      itemUseCountInput.disabled = true;
    } else {
      itemUseDecrementBtn.classList.remove('disabled');
      itemUseIncrementBtn.classList.remove('disabled');
      itemUseCountInput.disabled = false;
    }

    let displayName = div.getDisplayName();
    itemBriefName.innerText = displayName;
    itemBriefName.title = displayName;
    itemDetailsName.innerText = displayName;
    itemDetailsName.title = displayName;

    itemBriefCount.innerText = '× '+div.item.count;
    itemDetailsCount.innerText = '× '+div.item.count;

    itemBriefExpDate.innerText = div.item.displayDate;
    itemBriefExpIn.innerText = div.item.useIn??'';

    itemDetailsExpDate.innerText = div.item.displayDate;
    itemDetailsExpIn.innerText = div.item.useIn??'';

  }

  return div;

}
