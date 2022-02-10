
async function showMoveItemDialog(item){

  let div = document.createElement('div');
  div.className = 'moveItemDialog';
  div.innerHTML = await GET('dialogs/moveItem.html');
  document.body.appendChild(div);

  dialogs.push(div);

  let closeBtn = div.querySelector('.formClose');
  let moveForm = div.querySelector('.moveForm');
  let formError = div.querySelector('.formError');

  moveForm.moveCount.value = 1;

  let bags = JSON.parse(await GET('api/bag/list.php?userId='+auth.user.id));

  moveForm.bag.innerText = '';
  for(let bag of bags){
    if(bag.id==selectedBagId) continue;
    let option = document.createElement('option');
    option.value = bag.id;
    option.innerText = bag.name;
    moveForm.bag.add(option);
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

  moveForm.oninput = function(e){
    e.target.classList.remove('invalid');
    formError.style.display = 'none';
  }

  moveForm.onsubmit = function(){

    let count = moveForm.moveCount.value;
    let bagId = moveForm.bag.value;

    if(!(count>0) || count>item.count){
      moveForm.moveCount.classList.add('invalid');
      showError('Prosím zadejte počet mezi 1 a '+item.count+'!', moveForm.moveCount);
      return false;
    }

    if(!bagId) return false;

    (async function(){

      if(!await checkAuth()) return;

      let items = JSON.parse(await GET('api/bag/getItems.php?bagId='+bagId));

      if(items.findIndex(i=>(i.productId==item.productId && i.expiration==item.expiration && i.used==item.used))>=0)
        if(!confirm('Položka již existuje. Spojit položky?')) return;

      try {
        await POST('api/bag/moveItem.php?itemId='+item.id, {'moveCount':count, 'bagId':bagId});
      } catch(e){
        showError(e.message);
        // formError.style.display = 'block';
        // formError.innerText = e.message;
        return;
      }

      // div.hide();
      hideDialogs();

      await loadBag(bagId);
      await refresh();

    })();

    return false;

  }

}
