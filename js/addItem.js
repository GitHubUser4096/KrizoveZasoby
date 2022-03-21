
async function showAddItemDialog(){

  if(dialogs['addItem']) return;

  let div = document.createElement('div');
  div.className = 'addItemDialog';
  div.innerHTML = await GET('dialogs/addItem.html');
  document.body.appendChild(div);

  dialogs['addItem'] = div;

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

  div.hide = function(){
    hideSuggestions();
    document.removeEventListener('keydown', closeListener);
    document.body.removeChild(div);
    delete dialogs['addItem'];
  }

  let form = div.querySelector('.addItemForm');
  let searchProductDiv = div.querySelector('.searchProduct');
  let displayProductDiv = div.querySelector('.displayProduct');
  let productImageDiv = div.querySelector('.productImage');
  let productNameDiv = div.querySelector('.productName');
  let productShortDescDiv = div.querySelector('.productShortDesc');
  let productPackageDiv = div.querySelector('.productPackage');
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
      // formError.style.position = 'static';
      formError.style.margin = '10px';
      formError.style.left = null;
      formError.style.right = null;
      formError.style.top = '0';
      formError.style.width = 'calc(100% - 20px)';
    }
  }

  let closeListener;

  // function closeDialog(){
  //   hideSuggestions();
  //   document.removeEventListener('keydown', closeListener);
  //   document.body.removeChild(div);
  // }

  form.close.onclick = function(){
    // closeDialog();
    div.hide();
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
    showAddProductDialog(div);
  }

  form.clearProduct.onclick = async function(){
    div.clearProduct();
  }

  form.onsubmit = function(){

    hideSuggestions();

    let bagId = selectedBagId;
    let productId = form.productId.value;
    let count = form.count.value;
    // let expiration = form.expDate.value;
    let expiration;

    if(!form.expYear.value || !form.expMonth.value){
      if(form.expDay.value){
        showError('Prosím zadejte celé datum!');
        return false;
      }
      expiration = '';
    } else {
      let expDate = new Date(form.expYear.value+'-'+form.expMonth.value+'-'+form.expDay.value);
      if(!expDate.getTime()){
        showError('Neplatné datum!');
        return false;
      }
      if(!form.expDay.value) {
        expDate.setMonth(expDate.getMonth()+1);
        expDate.setDate(0);
      }
      expiration = expDate.getFullYear()+'-'+(expDate.getMonth()+1).toString().padStart(2, '0')+'-'+expDate.getDate().toString().padStart(2, '0');
    }

    // console.log(form.expYear.value+'-'+form.expMonth.value+'-'+form.expDay.value, expDate);
    // return false;

    if(!productId){
      showError('Prosím vyberte produkt ze seznamu');
      form.productName.classList.add('invalid');
      return false;
    }

    if(!count){
      showError('Prosím zadejte počet');
      form.count.classList.add('invalid');
      return false;
    }

    if(!(count>0) || count>999){
      form.count.classList.add('invalid');
      showError('Neplatný počet!');
      return false;
    }

    // if(!expiration){
    //   showError('Prosím zadejte datum', form.expDate);
    //   form.expDate.classList.add('invalid');
    //   return false;
    // }

    if((form.expYear.value && !form.expMonth.value) || (!form.expYear.value && form.expMonth.value)){
      showError('Datum musí obsahovat alespoň měsíc a rok !');
      return false;
    }

    if(expiration && !(new Date(expiration)>new Date()) || new Date(expiration)>new Date('3000-01-01')){
      showError('Datum musí být později než dnes.');
      // form.expDate.classList.add('invalid');
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

      // closeDialog();
      div.hide();
      await refresh();

    })();

    return false;

  }

  let searchTimeout;

  div.setProduct = function(product){
    form.productId.value = product.id;
    // form.productName.value = name;
    form.productName.classList.remove('invalid');
    // form.productName.classList.add('valid');
    searchProductDiv.style.display = 'none';
    displayProductDiv.style.display = 'block';

    if(product.imgName) productImageDiv.style.backgroundImage = 'url(images/'+product.imgName+')';
    productNameDiv.innerText = product.brand+' • '+product.productType+(product.amountValue?(' • '+product.amountValue+' '+product.amountUnit):'');
    productNameDiv.title = productNameDiv.innerText;
    productShortDescDiv.innerText = product.shortDesc;
    productShortDescDiv.title = product.shortDesc;
    productPackageDiv.innerText = product.packageType;

  }

  div.clearProduct = function(){
    form.productId.value = null;
    searchProductDiv.style.display = 'block';
    displayProductDiv.style.display = 'none';
  }

  async function createSuggestionItem(product){
    let item = document.createElement('div');
    item.className = 'suggestionItem';
    item.style.display = 'block';
    // item.innerText = product.name;
    let titleDiv = document.createElement('div');
    titleDiv.className = 'suggestionItemTitle';
    titleDiv.innerText = product.brand+' • '+product.productType+' • '+product.amountValue+' '+product.amountUnit;
    titleDiv.title = titleDiv.innerText;
    item.appendChild(titleDiv);
    let descDiv = document.createElement('div');
    descDiv.className = 'suggestionItemDesc';
    descDiv.innerText = product.shortDesc;
    descDiv.title = descDiv.innerText;
    item.appendChild(descDiv);
    item.onclick = function(){
      div.setProduct(product);
      // productSuggestions.innerText = '';
      hideSuggestions();
    }
    return item;
  }

  async function loadSuggestions(){

    if(!form.productName.value) return;

    let products = JSON.parse(await GET('api/product/find.php?search='+encodeURIComponent(form.productName.value)));

    let bounds = form.productName.getBoundingClientRect();
    suggestions.style.left = bounds.left+'px';
    suggestions.style.top = (bounds.top+bounds.height)+'px';
    suggestions.style.width = bounds.width+'px';

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
      let item = await createSuggestionItem(product);
      suggestions.appendChild(item);
    }

    showSuggestions();

  }

  form.decrementCount.onclick = function(){
    form.count.value = form.count.value-1;
    if(form.count.value<1) form.count.value = 1;
  }

  form.incrementCount.onclick = function(){
    form.count.value = +form.count.value+1;
    if(form.count.value<1) form.count.value = 1;
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
