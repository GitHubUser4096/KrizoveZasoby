
async function showUnuseItemDialog(item){

  if(dialogs['unuseItem']) return;

  let div = document.createElement('div');
  div.className = 'unuseItemDialog';
  div.innerHTML = await GET('dialogs/unuseItem.html');
  document.body.appendChild(div);

  // dialogs.push(div);
  dialogs['unuseItem'] = div;

  let closeBtn = div.querySelector('.formClose');
  let unuseForm = div.querySelector('.unuseForm');
  let formError = div.querySelector('.formError');

  unuseForm.unuseCount.value = 1;

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
    // dialogs.splice(dialogs.indexOf(div));
    delete dialogs['unuseItem'];
  }

  closeBtn.onclick = function(){
    div.hide();
  }

  unuseForm.oninput = function(e){
    e.target.classList.remove('invalid');
    formError.style.display = 'none';
  }

  unuseForm.onsubmit = function(){

    let count = unuseForm.unuseCount.value;

    if(!(count>0) || count>item.count){
      unuseForm.unuseCount.classList.add('invalid');
      showError('Prosím zadejte počet mezi 1 a '+item.count+'!', unuseForm.unuseCount);
      return false;
    }

    (async function(){

      if(!await checkAuth()) return;

      try {
        await POST('api/bag/setItemUnused.php?itemId='+item.id, {'unuseCount':count});
      } catch(e){
        showError(e.message);
        // formError.style.display = 'block';
        // formError.innerText = e.message;
        return;
      }

      // document.body.removeChild(div);
      hideDialogs();

      await refresh();

    })();

    return false;

  }

}
