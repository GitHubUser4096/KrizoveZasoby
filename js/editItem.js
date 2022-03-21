
async function showEditItemDialog(item){

  if(dialogs['editItem']) return;

  let div = document.createElement('div');
  div.className = 'editItemDialog';
  div.innerHTML = await GET('dialogs/editItem.html');
  document.body.appendChild(div);

  // dialogs.push(div);
  dialogs['editItem'] = div;

  let closeBtn = div.querySelector('.formClose');
  let itemNameField = div.querySelector('.itemName');
  let itemImg = div.querySelector('.itemImg');
  let useBtn = div.querySelector('.useBtn');
  let unuseBtn = div.querySelector('.unuseBtn');
  let moveBtn = div.querySelector('.moveBtn');
  let deleteBtn = div.querySelector('.deleteBtn');
  let itemForm = div.querySelector('.itemForm');
  // let useForm = div.querySelector('.useForm');
  // let unuseForm = div.querySelector('.unuseForm');
  // let moveForm = div.querySelector('.moveForm');
  // let deleteForm = div.querySelector('.deleteForm');
  let formError = div.querySelector('.formError');

  div.onclick = function(){
    formError.style.display = 'none';
  }

  div.hide = function(){
    document.body.removeChild(div);
    // dialogs.splice(dialogs.indexOf(div));
    delete dialogs['editItem'];
  }

  closeBtn.onclick = function(){
    div.hide();
  }

  function showError(msg, element){
    formError.style.display = 'block';
    formError.innerText = msg;
    if(element){
      formError.style.position = 'absolute';
      formError.style.margin = '0';
      formError.style.left = (element.offsetLeft)+'px';
      formError.style.right = (element.offsetLeft+element.offsetWidth)+'px';
      formError.style.top = (element.offsetTop+element.offsetHeight-4)+'px';
    } else {
      formError.style.position = 'static';
      formError.style.margin = null;
      formError.style.left = null;
      formError.style.right = null;
      formError.style.top = null;
    }
  }

  // itemNameField.innerText = item.product.shortDesc;
  // if(item.product.imgName) itemImg.src = 'images/'+item.product.imgName;

  // itemForm.noValidate = true;

  itemForm.itemId.value = item.id;
  itemForm.count.value = item.count;
  // itemForm.expDate.value = item.expiration;
  let expDate = new Date(item.expiration);
  if(item.expiration){
    itemForm.expDay.value = (expDate.getDate()).toString().padStart(2, '0');
    itemForm.expMonth.value = (expDate.getMonth()+1).toString().padStart(2, '0');
    itemForm.expYear.value = expDate.getFullYear();
  }

  itemForm.decrementCount.onclick = function(){
    itemForm.count.value = itemForm.count.value-1;
    if(itemForm.count.value<1) itemForm.count.value = 1;
  }

  itemForm.incrementCount.onclick = function(){
    itemForm.count.value = +itemForm.count.value+1;
    if(itemForm.count.value<1) itemForm.count.value = 1;
  }

  itemForm.oninput = function(e){
    e.target.classList.remove('invalid');
    formError.style.display = 'none';
  }

  itemForm.onsubmit = function(){

    let itemId = itemForm.itemId.value;
    let count = itemForm.count.value;
    // let expiration = itemForm.expDate.value;
    let expiration;

    try {

      if(!itemForm.expYear.value || !itemForm.expMonth.value){
        if(itemForm.expDay.value){
          showError('Prosím zadejte celé datum!');
          return false;
        }
        expiration = '';
      } else {
        let expDate = new Date(itemForm.expYear.value+'-'+itemForm.expMonth.value+'-'+itemForm.expDay.value);
        if(!expDate.getTime()){
          showError('Neplatné datum!');
          return false;
        }
        if(!itemForm.expDay.value) {
          expDate.setMonth(expDate.getMonth()+1);
          expDate.setDate(0);
        }
        expiration = expDate.getFullYear()+'-'+(expDate.getMonth()+1).toString().padStart(2, '0')+'-'+expDate.getDate().toString().padStart(2, '0');
      }

      if(!count){
        showError('Prosím zadejte počet');
        itemForm.count.classList.add('invalid');
        return false;
      }

      if(!(count>0) || count>999){
        showError('Počet musí být mezi 1 a 999');
        itemForm.count.classList.add('invalid');
        return false;
      }

      // if(!expiration){
      //   showError('Prosím zadejte datum', itemForm.expDate);
      //   itemForm.expDate.classList.add('invalid');
      //   return false;
      // }

      // if(expiration && !(new Date(expiration)>new Date('2000-01-01')) || new Date(expiration)>new Date('3000-01-01')){
      //   showError('Neplatné datum (rok musí být mezi 2000 a 3000)', itemForm.expDate);
      //   itemForm.expDate.classList.add('invalid');
      //   return false;
      // }

      if((itemForm.expYear.value && !itemForm.expMonth.value) || (!itemForm.expYear.value && itemForm.expMonth.value)){
        showError('Datum musí obsahovat alespoň měsíc a rok !');
        return false;
      }

    } catch(e){console.error(e);return false}

    (async function(){

      if(!await checkAuth()) return;

      if(allItems.findIndex(i=>(i.productId==item.productId && (i.expiration??'')==expiration && i.used==item.used && i.id!=item.id))>=0)
        if(!confirm('Položka již existuje. Spojit položky?')) return;

      try {
        await POST('api/bag/editItem.php?itemId='+itemId, {'count':count, 'expiration':expiration});
      } catch(e){
        showError(e.message);
        // formError.style.display = 'block';
        // formError.style.position = 'static';
        // formError.innerText = e.message;
        return;
      }

      // document.body.removeChild(div);
      div.hide();

      await refresh();

    })();

    return false;

  }

  // useBtn.onclick = async function(){
  //   if(!await checkAuth()) return;
  //   showUseItemDialog(item);
  // }
  //
  // unuseBtn.onclick = async function(){
  //   if(!await checkAuth()) return;
  //   showUnuseItemDialog(item);
  // }
  //
  // moveBtn.onclick = async function(){
  //   if(!await checkAuth()) return;
  //   if(allBags.length==1) {
  //     alert('Neexistuje žádná taška, do které by bylo možné položku přesunout!');
  //     return;
  //   }
  //   showMoveItemDialog(item);
  // }
  //
  // deleteBtn.onclick = async function(){
  //
  //   if(!await checkAuth()) return;
  //
  //   if(!confirm('Smazat položku '+item.product.name+'?')) return;
  //   await POST('api/bag/deleteItem.php?itemId='+item.id);
  //   // document.body.removeChild(div);
  //   div.hide();
  //   await refresh();
  //
  // }
  //
  // if(item.used){
  //   useBtn.style.display = 'none';
  //   unuseBtn.style.display = 'inline-block';
  // } else {
  //   useBtn.style.display = 'inline-block';
  //   unuseBtn.style.display = 'none';
  // }

}
