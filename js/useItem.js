
async function showUseItemDialog(item){

  if(dialogs['useItem']) return;

  let div = document.createElement('div');
  div.className = 'useItemDialog';
  div.innerHTML = await GET('dialogs/useItem.html');
  document.body.appendChild(div);

  // dialogs.push(div);
  dialogs['useItem'] = div;

  let closeBtn = div.querySelector('.formClose');
  let useForm = div.querySelector('.useForm');
  let formError = div.querySelector('.formError');

  useForm.useCount.value = 1;

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
    delete dialogs['useItem'];
  }

  closeBtn.onclick = function(){
    div.hide();
  }

  useForm.oninput = function(e){
    e.target.classList.remove('invalid');
    formError.style.display = 'none';
  }

  useForm.onsubmit = function(){

    let count = useForm.useCount.value;

    if(!(count>0) || count>item.count){
      useForm.useCount.classList.add('invalid');
      showError('Prosím zadejte počet mezi 1 a '+item.count+'!', useForm.useCount);
      return false;
    }

    (async function(){

      if(!await checkAuth()) return;

      try {
        await POST('api/bag/setItemUsed.php?itemId='+item.id, {'useCount':count});
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
