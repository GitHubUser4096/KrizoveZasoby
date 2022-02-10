
async function showAddItemDialog(){

  let div = document.createElement('div');
  div.className = 'addItemDialog';
  div.innerHTML = await GET('dialogs/addItem.html');
  document.body.appendChild(div);

  let suggestions = document.createElement('div');
  suggestions.className = 'suggestions';

  suggestions.onmouseover = function(){
    suggestions.mouseover = true;
  }
  suggestions.onmouseout = function(){
    suggestions.mouseover = false;
  }

  function showSuggestions(){
    if(document.body.contains(suggestions)) document.body.removeChild(suggestions);
    document.body.appendChild(suggestions);
  }

  function hideSuggestions(){
    if(document.body.contains(suggestions)) document.body.removeChild(suggestions);
  }

  let form = div.querySelector('.addItemForm');

  let formError = form.querySelector('.formError');

  function showError(msg, element){
    formError.style.display = 'block';
    formError.innerText = msg;
    if(element){
      formError.style.position = 'absolute';
      formError.style.margin = '0';
      formError.style.left = (element.offsetLeft)+'px';
      formError.style.right = (element.offsetLeft+element.offsetWidth)+'px';
      formError.style.top = (element.offsetTop+element.offsetHeight-4)+'px';
      formError.style.width = element.offsetWidth+'px';
    } else {
      formError.style.position = 'static';
      formError.style.margin = null;
      formError.style.left = null;
      formError.style.right = null;
      formError.style.top = null;
    }
  }

  let closeListener;

  function closeDialog(){
    hideSuggestions();
    document.removeEventListener('keydown', closeListener);
    document.body.removeChild(div);
  }

  form.close.onclick = function(){
    closeDialog();
  }

  closeListener = function(e){
    if(e.key=='Escape'){
      if(document.body.contains(suggestions)){
        hideSuggestions();
      } else {
        // closeDialog();
      }
    }
  }

  document.addEventListener('keydown', closeListener);

  form.productName.onmouseover = function(){
    form.productName.mouseover = true;
  }
  form.productName.onmouseout = function(){
    form.productName.mouseover = false;
  }

  // function showError(msg){
  //   formError.style.display = 'block';
  //   formError.innerText = msg;
  // }

  // let dialog = document.querySelector('#dialog_addItem');
  // let btn_close = document.querySelector('#dialog_addItem_btn_close');
  // // let input_productId = document.querySelector('#dialog_addItem_input_productId');
  // let btn_addProduct = document.querySelector('#dialog_addItem_btn_addProduct');
  // let input_count = document.querySelector('#dialog_addItem_input_count');
  // let input_expDate = document.querySelector('#dialog_addItem_input_expDate');
  // let btn_submit = document.querySelector('#dialog_addItem_btn_submit');
  //
  // let addProductDialog = document.querySelector('#dialog_addProduct');
  //
  // btn_close.onclick = function(){
  //   productSuggestions.innerText = '';
  //   dialog.style.display = 'none';
  // }
  //
  // btn_submit.onclick = async function(){
  //
  //   productSuggestions.innerText = '';
  //
  //   let bagId = selectedBagId;
  //   let productId = addItemProductId.value;
  //   let count = input_count.value;
  //   let expDate = input_expDate.value;
  //
  //   await POST('api/bag/addItem.php?bagId='+bagId, {'productId':productId, 'count':count, 'expDate':expDate});
  //
  //   dialog.style.display = 'none';
  //   await loadBag(selectedBagId);
  //
  // }

  form.addProduct.onclick = async function(){
    if(!await checkAuth()) return;
    showAddProductDialog(form.productName.value, div);
  }

  form.onsubmit = function(){

    hideSuggestions();

    let bagId = selectedBagId;
    let productId = form.productId.value;
    let count = form.count.value;
    let expiration = form.expDate.value;

    if(!productId){
      showError('Prosím vyberte produkt ze seznamu', form.productName);
      form.productName.classList.add('invalid');
      return false;
    }

    if(!count){
      showError('Prosím zadejte počet', form.count);
      form.count.classList.add('invalid');
      return false;
    }

    if(!(count>0) || count>999){
      form.count.classList.add('invalid');
      showError('Počet musí být mezi 1 a 999', form.count);
      return false;
    }

    // if(!expiration){
    //   showError('Prosím zadejte datum', form.expDate);
    //   form.expDate.classList.add('invalid');
    //   return false;
    // }

    if(expiration && !(new Date(expiration)>new Date()) || new Date(expiration)>new Date('3000-01-01')){
      showError('Datum musí být později než dnes.', form.expDate);
      form.expDate.classList.add('invalid');
      return false;
    }

    (async function() {

      if(!await checkAuth()) return;

      if(allItems.findIndex(i=>(i.productId==productId && (i.expiration??'')==expiration && !i.used))>=0)
        if(!confirm('Položka již existuje. Spojit položky?')) return;

      try {
        await POST('api/bag/addItem.php?bagId='+bagId, {'productId':productId, 'count':count, 'expiration':expiration});
      } catch(e) {
        showError(e.message);
        return;
      }

      closeDialog();
      await refresh();

    })();

    return false;

  }

  let searchTimeout;

  div.setProduct = function(id, name){
    form.productId.value = id;
    form.productName.value = name;
    form.productName.classList.remove('invalid');
    form.productName.classList.add('valid');
  }

  async function loadSuggestions(){

    if(!form.productName.value) return;

    let products = JSON.parse(await GET('api/product/find.php?search='+encodeURIComponent(form.productName.value)));

    let bounds = form.productName.getBoundingClientRect();
    suggestions.style.left = bounds.left+'px';
    suggestions.style.top = (bounds.top+bounds.height)+'px';

    suggestions.innerText = '';

    if(!products.length) {
      let btn = document.createElement('button');
      btn.className = 'suggestionItem';
      btn.innerText = '(Žádný produkt nenalezen)';
      btn.style.color = 'gray';
      btn.style.display = 'block';
      suggestions.appendChild(btn);
    }

    for(let product of products){
      let btn = document.createElement('button');
      btn.className = 'suggestionItem';
      btn.productId = product.id;
      btn.innerText = product.name;
      btn.style.display = 'block';
      btn.onclick = function(){
        div.setProduct(btn.productId, btn.innerText);
        // productSuggestions.innerText = '';
        hideSuggestions();
      }
      suggestions.appendChild(btn);
    }

    showSuggestions();

  }

  form.oninput = function(e){
    e.target.classList.remove('invalid');
    formError.style.display = 'none';
  }

  form.productName.onclick = function(){
    loadSuggestions();
  }

  form.productName.oninput = function(e){

    form.productId.value = null;
    form.productName.classList.remove('valid');

    if(searchTimeout) clearTimeout(searchTimeout);

    if(!form.productName.value) {
      // suggestions.innerText = '';
      hideSuggestions();
      return;
    }

    hideSuggestions();

    searchTimeout = setTimeout(async function(){
      loadSuggestions();
    }, 500);

  }

  div.onclick = function(){
    formError.style.display = 'none';
    if(!suggestions.mouseover && !form.productName.mouseover){
      hideSuggestions();
    }
  }

}
