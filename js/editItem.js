
async function showEditItemDialog(item){

  let div = document.createElement('div');
  div.className = 'editItemDialog';
  div.innerHTML = await GET('dialogs/editItem.html');
  document.body.appendChild(div);

  dialogs.push(div);

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
    dialogs.splice(dialogs.indexOf(div));
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

  itemNameField.innerText = item.product.name;
  // itemImg.src = 'res/icon.png';
  if(item.product.imgName) itemImg.src = 'images/'+item.product.imgName;

  itemForm.itemId.value = item.id;
  itemForm.count.value = item.count;
  itemForm.expDate.value = item.expiration;

  itemForm.oninput = function(e){
    e.target.classList.remove('invalid');
    formError.style.display = 'none';
  }

  itemForm.onsubmit = function(){

    let itemId = itemForm.itemId.value;
    let count = itemForm.count.value;
    let expiration = itemForm.expDate.value;

    if(!count){
      showError('Prosím zadejte počet', itemForm.count);
      itemForm.count.classList.add('invalid');
      return false;
    }

    if(!(count>0) || count>999){
      showError('Počet musí být mezi 1 a 999', itemForm.count);
      itemForm.count.classList.add('invalid');
      return false;
    }

    // if(!expiration){
    //   showError('Prosím zadejte datum', itemForm.expDate);
    //   itemForm.expDate.classList.add('invalid');
    //   return false;
    // }

    if(expiration && !(new Date(expiration)>new Date('2000-01-01')) || new Date(expiration)>new Date('3000-01-01')){
      showError('Neplatné datum (rok musí být mezi 2000 a 3000)', itemForm.expDate);
      itemForm.expDate.classList.add('invalid');
      return false;
    }

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

  useBtn.onclick = async function(){
    if(!await checkAuth()) return;
    showUseItemDialog(item);
  }

  unuseBtn.onclick = async function(){
    if(!await checkAuth()) return;
    showUnuseItemDialog(item);
  }

  moveBtn.onclick = async function(){
    if(!await checkAuth()) return;
    if(allBags.length==1) {
      alert('Neexistuje žádná taška, do které by bylo možné položku přesunout!');
      return;
    }
    showMoveItemDialog(item);
  }

  deleteBtn.onclick = async function(){

    if(!await checkAuth()) return;

    if(!confirm('Smazat položku '+item.product.name+'?')) return;
    await POST('api/bag/deleteItem.php?itemId='+item.id);
    // document.body.removeChild(div);
    div.hide();
    await refresh();

  }

  if(item.used){
    useBtn.style.display = 'none';
    unuseBtn.style.display = 'inline-block';
  } else {
    useBtn.style.display = 'inline-block';
    unuseBtn.style.display = 'none';
  }

  // useForm.oninput = function(e){
  //   e.target.classList.remove('invalid');
  //   formError.style.display = 'none';
  // }
  //
  // useForm.onsubmit = function(){
  //
  //     let itemId = itemForm.itemId.value;
  //   let count = useForm.useCount.value;
  //
  //   if(!(count>0) || count>item.count){
  //     useForm.useCount.classList.add('invalid');
  //     return false;
  //   }
  //
  //   (async function(){
  //
  //     try {
  //       await POST('api/bag/setItemUsed.php?itemId='+itemId, {'useCount':count});
  //     } catch(e){
  //       formError.style.display = 'block';
  //       formError.innerText = e.message;
  //       return;
  //     }
  //
  //     document.body.removeChild(div);
  //
  //     await refresh();
  //
  //   })();
  //
  //   return false;
  //
  // }
  //
  // unuseForm.oninput = function(e){
  //   e.target.classList.remove('invalid');
  //   formError.style.display = 'none';
  // }
  //
  // unuseForm.onsubmit = function(){
  //
  //   let itemId = itemForm.itemId.value;
  //   let count = unuseForm.unuseCount.value;
  //
  //   if(!(count>0) || count>item.count){
  //     unuseForm.unuseCount.classList.add('invalid');
  //     return false;
  //   }
  //
  //   (async function(){
  //
  //     try {
  //       await POST('api/bag/setItemUnused.php?itemId='+itemId, {'unuseCount':count});
  //     } catch(e){
  //       formError.style.display = 'block';
  //       formError.innerText = e.message;
  //       return;
  //     }
  //
  //     document.body.removeChild(div);
  //
  //     await refresh();
  //
  //   })();
  //
  //   return false;
  //
  // }
  //
  // moveForm.oninput = function(e){
  //   e.target.classList.remove('invalid');
  //   formError.style.display = 'none';
  // }
  //
  // moveForm.onsubmit = function(){
  //
  //   let itemId = itemForm.itemId.value;
  //   let count = moveForm.moveCount.value;
  //   let bagId = moveForm.bag.value;
  //
  //   if(!(count>0) || count>item.count){
  //     moveForm.moveCount.classList.add('invalid');
  //     return false;
  //   }
  //
  //   if(!bagId) return false;
  //
  //   (async function(){
  //
  //     try {
  //       await POST('api/bag/moveItem.php?itemId='+itemId, {'moveCount':count, 'bagId':bagId});
  //     } catch(e){
  //       formError.style.display = 'block';
  //       formError.innerText = e.message;
  //       return;
  //     }
  //
  //     document.body.removeChild(div);
  //
  //     await loadBag(bagId);
  //     await refresh();
  //
  //   })();
  //
  //   return false;
  //
  // }
  //
  // deleteForm.onsubmit = function(){
  //
  //   if(!confirm('Smazat položku '+item.product.name+'?')) return false;
  //
  //   (async function(){
  //
  //     await POST('api/bag/deleteItem.php?itemId='+item.id);
  //
  //     document.body.removeChild(div);
  //
  //     await refresh();
  //
  //   })();
  //
  //   return false;
  //
  // }
  //
  // if(item.used){
  //   useForm.style.display = 'none';
  //   unuseForm.style.display = 'block';
  // } else {
  //   useForm.style.display = 'block';
  //   unuseForm.style.display = 'none';
  // }
  //
  // let bags = JSON.parse(await GET('api/bag/list.php?userId='+auth.user.id));
  //
  // moveForm.bag.innerText = '';
  // for(let bag of bags){
  //   if(bag.id==selectedBagId) continue;
  //   let option = document.createElement('option');
  //   option.value = bag.id;
  //   option.innerText = bag.name;
  //   moveForm.bag.add(option);
  // }

}

// async function showEditItemDialog(item){
//
//   let dialog = document.querySelector('#dialog_editItem');
//   let title = document.querySelector('#dialog_editItem_name');
//   let input_itemId = document.querySelector('#dialog_editItem_input_itemId');
//   let input_count = document.querySelector('#dialog_editItem_input_count');
//   let input_expiration = document.querySelector('#dialog_editItem_input_expiration');
//   let input_bags = document.querySelector('#dialog_editItem_input_bags');
//
//   if(item.used){
//     editItemSetUsedDiv.style.display = 'none';
//     editItemSetUnusedDiv.style.display = 'block';
//   } else {
//     editItemSetUsedDiv.style.display = 'block';
//     editItemSetUnusedDiv.style.display = 'none';
//   }
//
//   title.innerText = item.product.name;
//   input_itemId.value = item.id;
//   input_count.value = item.count;
//   input_expiration.value = item.expiration;
//
//   let bags = JSON.parse(await GET('api/bag/list.php?userId='+auth.user.id));
//
//   input_bags.innerText = '';
//   for(let bag of bags){
//     let option = document.createElement('option');
//     option.value = bag.id;
//     option.innerText = bag.name;
//     input_bags.add(option);
//   }
//
//   dialog.style.display = 'block';
//
// }
//
// function initEditItemDialog(){
//
//   let dialog = document.querySelector('#dialog_editItem');
//   let btn_close = document.querySelector('#dialog_editItem_btn_close');
//   let btn_save = document.querySelector('#dialog_editItem_btn_save');
//   let btn_setUsed = document.querySelector('#dialog_editItem_btn_setUsed');
//   let btn_setUnused = document.querySelector('#dialog_editItem_btn_setUnused');
//   let btn_move = document.querySelector('#dialog_editItem_btn_move');
//   let input_itemId = document.querySelector('#dialog_editItem_input_itemId');
//   let input_count = document.querySelector('#dialog_editItem_input_count');
//   let input_expiration = document.querySelector('#dialog_editItem_input_expiration');
//   let input_useCount = document.querySelector('#dialog_editItem_input_useCount');
//   let input_bags = document.querySelector('#dialog_editItem_input_bags');
//
//   btn_close.onclick = function(){
//     dialog.style.display = 'none';
//   }
//
//   btn_save.onclick = async function(){
//
//     let itemId = input_itemId.value;
//     let count = input_count.value;
//     let expiration = input_expiration.value;
//
//     await POST('api/bag/editItem.php?itemId='+itemId, {'count':count, 'expiration':expiration});
//
//     dialog.style.display = 'none';
//
//     // await loadBag(selectedBagId);
//     await refresh();
//
//   }
//
//   btn_setUsed.onclick = async function(){
//
//     let itemId = input_itemId.value;
//     let useCount = input_useCount.value;
//
//     await POST('api/bag/setItemUsed.php?itemId='+itemId, {'useCount':useCount});
//
//     dialog.style.display = 'none';
//
//     // await loadBag(selectedBagId);
//     await refresh();
//
//   }
//
//   btn_setUnused.onclick = async function(){
//
//     let itemId = input_itemId.value;
//
//     await POST('api/bag/setItemUnused.php?itemId='+itemId);
//
//     dialog.style.display = 'none';
//
//     // await loadBag(selectedBagId);
//     await refresh();
//
//   }
//
//   btn_move.onclick = async function(){
//
//     let itemId = input_itemId.value;
//     let bagId = input_bags.value;
//
//     await POST('api/bag/moveItem.php?itemId='+itemId, {'bagId':bagId});
//
//     dialog.style.display = 'none';
//
//     // await loadBag(bagId);
//     await refresh();
//
//   }
//
// }
