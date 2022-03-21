
async function createItem(item){

  let div = document.createElement('div');
  div.className = 'itemContainer';

  div.item = item;
  div.expanded = false;

  div.classList.add(item.state);

  div.innerHTML = await RequestCache.get('layouts/item.html');

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

  itemEditBtn.onclick = function(e){
    showEditItemDialog(item);
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

  itemMoveBtn.onclick = function(e){
    if(allBags.length==1) {
      alert('Neexistuje žádná taška, do které by bylo možné položku přesunout!');
      return;
    }
    showMoveItemDialog(item);
  }

  itemDeleteBtn.onclick = async function(e){
    if(!confirm('Smazat položku '+item.product.shortDesc+'?')) return;
    await POST('api/bag/deleteItem.php?itemId='+item.id);
    await refresh();
  }

  itemUseBackBtn.onclick = function(e){
    itemDetailsMenu.style.display = 'block';
    itemUseMenu.style.display = 'none';
  }

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
    // if(isNaN(itemUseCountInput.value)) itemUseCountInput.value = 1;
    // if(itemUseCountInput.value<1) itemUseCountInput.value = 1;
    // if(itemUseCountInput.value>item.count) itemUseCountInput.value = item.count;
    if(e.code=='Enter') useItem();
  }

  itemUseAcceptBtn.onclick = function(e){
    useItem();
  }

  async function useItem(){

    let count = itemUseCountInput.value;
    if(isNaN(count) || count<1 || count>item.count) {
      itemUseCountInput.classList.add('invalid');
      return;
    }

    if(item.used) await POST('api/bag/setItemUnused.php?itemId='+item.id, {'unuseCount':count});
    else await POST('api/bag/setItemUsed.php?itemId='+item.id, {'useCount':count});
    await refresh();

  }

  itemBriefShortDesc.innerText = item.product.shortDesc;
  itemBriefShortDesc.title = item.product.shortDesc;
  itemDetailsShortDesc.innerText = item.product.shortDesc;
  itemDetailsShortDesc.title = item.product.shortDesc;
  itemDetailsPackage.innerText = item.product.packageType;
  if(item.product.imgName) itemDetailsImg.style.backgroundImage = 'url(images/'+item.product.imgName+')';

  div.expand = function(){
    if(div.expanded) return;
    div.classList.add('expanded');
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
      res = item.product.type+' • '+item.product.brand;
    } else {
      res = item.product.brand+' • '+item.product.type;
    }
    if(item.product.amountValue){
      res += ' • '+item.product.amountValue+' '+item.product.amountUnit;
    }
    return res;
  }

  div.update = function(){

    if(item.count==1){
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

    itemBriefCount.innerText = '× '+item.count;
    itemDetailsCount.innerText = '× '+item.count;

    // let date = new Date(item.expiration);
    // let today = new Date(new Date().getTime()-new Date().getTime()%(1000*60*60*24));
    // if(item.expiration==null) {
    //   div.displayDate = '';
    // } else if(date<today){
    //   div.displayDate = 'Po vypršení';
    // } else /*if(date.getTime()==today.getTime()){
    //   div.displayDate = 'Dnes';
    // } else*/ {
    //   if(dateDisplayMode=='DMY'){
    //     div.displayDate = date.getDate().toString().padStart(2, '0')+'. '+(date.getMonth()+1).toString().padStart(2, '0')+'. '+date.getFullYear();
    //   } else if(dateDisplayMode=='inD'){
    //     // console.log((date-today)/());
    //     let numDays = ((date-today)/(1000*60*60*24));
    //     // if(numDays==0){
    //     //   div.displayDate = 'Dnes';
    //     // } else
    //     if(numDays==1){
    //       div.displayDate = 'Za 1 den';
    //     } else if(numDays<5){
    //       div.displayDate = 'Za '+numDays+' dny';
    //     } else {
    //       div.displayDate = 'Za '+numDays+' dnů';
    //     }
    //   } else if(dateDisplayMode=='inYMD'){
    //     // let difDate = new Date(date-today);
    //     // div.displayDate = 'Za '+(difDate.getUTCFullYear()-1970)+'r '+(difDate.getUTCMonth())+'m '+(difDate.getUTCDate()-1)+'d'
    //     //     +'-'+date.getFullYear()+'-'+(date.getMonth()+1).toString().padStart(2, '0')+'-'+date.getDate().toString().padStart(2, '0');
    //     div.displayDate = item.useIn;
    //   } else {
    //     div.displayDate = date.getFullYear()+'-'+(date.getMonth()+1).toString().padStart(2, '0')+'-'+date.getDate().toString().padStart(2, '0');
    //   }
    // }
    // itemBriefExp.innerText = div.displayDate;
    // itemDetailsExp.innerText = div.displayDate;

    itemBriefExpDate.innerText = item.displayDate;
    itemBriefExpIn.innerText = item.useIn??'';

    itemDetailsExpDate.innerText = item.displayDate;
    itemDetailsExpIn.innerText = item.useIn??'';

  }

  return div;

}
