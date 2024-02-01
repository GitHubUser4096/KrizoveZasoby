
async function createAddItemDialog(){

  let selectedProduct = null;

  let div = await LayoutManager.getLayout('layouts/addItem.html');
  div.className = 'addItemDialog';

  let suggestions = document.createElement('div');
  suggestions.className = 'suggestionsBox';

  suggestions.onmouseover = function(){
    suggestions.mouseover = true;
  }
  suggestions.onmouseout = function(){
    suggestions.mouseover = false;
  }

  function showSuggestions(){
    if(document.body.contains(suggestions)) return;
    document.body.appendChild(suggestions);
  }

  function hideSuggestions(){
    if(document.body.contains(suggestions)) document.body.removeChild(suggestions);
  }

  div.onHide = function(){
    hideSuggestions();
    document.removeEventListener('keydown', closeListener);
  }

  div.onInit = function(){

    div.elements.searchProduct.focus();

    if(!checkRole('contributor')){
      form.addProduct.disabled = true;
      form.editProduct.disabled = true;
    }

  }

  let form = div.querySelector('.addItemForm'); // TODO replace by layout-id

  let closeListener;

  closeListener = function(e){
    if(e.key=='Escape'){
      if(document.body.contains(suggestions)){
        hideSuggestions();
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

  form.addProduct.onclick = async function(){
    showLoading();
    if(!await checkAuth()) return;
    await showDialog('addProduct', div);
    hideLoading();
  }

  form.clearProduct.onclick = async function(){
    div.clearProduct();
  }

  form.editProduct.onclick = async function(){
    showLoading();
    if(!await checkAuth()) return;
    await showDialog('addProduct', div, selectedProduct);
    hideLoading();
  }

  form.submitForm = async function(){

    hideSuggestions();

    let bagId = selectedBag.id;

    let productId = div.elements.productId.value;
    if(!productId)
        throw {
          message: 'Prosím vyberte produkt!',
          element: div.elements.productName,
        };
      
    let count = form.getValue(div.elements.count);
    let expiration = form.getValue(div.elements.expiration);

    let existingItem = itemDivs.find(i=>(i.item.productId==productId && (i.item.expiration??'')==(expiration??'') && !i.used));
    if(existingItem){
      if(!confirm('Položka již existuje. Spojit položky?')) {
        hideLoading();
        return;
      }
    }

    let newItem = JSON.parse(await POST('api/item/addItem.php?bagId='+bagId, {
      'productId':productId,
      'count':count,
      'expiration':expiration,
    }));
    expandedItemId = newItem.id;

    div.hide();

    await refresh();

  }

  let searchTimeout;

  div.setProduct = function(product){
    selectedProduct = product;
    form.productId.value = product.id;
    form.productName.classList.remove('invalid');
    div.elements.searchProductBox.style.display = 'none';
    div.elements.displayProductBox.style.display = 'block';

    if(product.imgName) div.elements.productImage.style.backgroundImage = 'url(images/'+product.imgName+')';
    else div.elements.productImage.style.backgroundImage = 'url(res/noImage.png)';
    // div.elements.productName.innerText = product.brand+' • '+product.productType+(product.amountValue?(' • '+product.amountValue+' '+product.amountUnit):'');
    div.elements.productName.innerText = product.shortDesc;
    // div.elements.productName.title = div.elements.productName.innerText;
    div.elements.productShortDesc.innerText = product.brand+(product.amountValue?(' • '+product.amountValue+' '+product.amountUnit):'');
    // div.elements.productShortDesc.title = product.shortDesc;
    div.elements.productPackage.innerText = product.packageType;

  }

  div.clearProduct = function(){
    selectedProduct = null;
    form.productId.value = null;
    div.elements.searchProductBox.style.display = 'block';
    div.elements.displayProductBox.style.display = 'none';
  }

  async function createSuggestionItem(product){
    let item = document.createElement('div');
    item.className = 'suggestionItem';
    item.style.display = 'block';
    let titleDiv = document.createElement('div');
    titleDiv.className = 'suggestionItemTitle';
    // titleDiv.innerText = product.brand+' • '+product.productType+(product.amountValue?(' • '+product.amountValue+' '+product.amountUnit):'');
    // titleDiv.title = titleDiv.innerText;
    titleDiv.innerText = product.shortDesc;
    item.appendChild(titleDiv);
    let descDiv = document.createElement('div');
    descDiv.className = 'suggestionItemDesc';
    // descDiv.innerText = product.shortDesc;
    // descDiv.title = descDiv.innerText;
    descDiv.innerText = product.brand+(product.amountValue?(' • '+product.amountValue+' '+product.amountUnit):'')+(product.packageType?(' • '+product.packageType):'');
    item.appendChild(descDiv);
    item.onclick = function(){
      div.setProduct(product);
      hideSuggestions();
    }
    return item;
  }

  async function loadSuggestions(){

    let products = JSON.parse(await GET('api/product/searchProducts.php?search='+encodeURIComponent(form.productName.value)));

    if(form.productName.value.length<3) {
      hideSuggestions();
      return;
    }

    suggestions.innerText = '';

    if(!products.length) {
      let div = document.createElement('div');
      div.className = 'suggestionNotFound';
      div.innerText = '(Žádný produkt nenalezen)';
      suggestions.appendChild(div);
    }

    let maxCount = 8;

    for(let i = 0; i<Math.min(products.length, maxCount); i++){
      let product = products[i];
      let item = await createSuggestionItem(product);
      suggestions.appendChild(item);
    }

    if(products.length>maxCount){
      let div = document.createElement('div');
      div.className = 'suggestionMore';
      let more = products.length-maxCount;
      let txt = (more>4) ? 'dalších' : 'další';
      div.innerText = '(+'+more+' '+txt+')';
      suggestions.appendChild(div);
    }

    showSuggestions();

  }

  function showLoadingSuggestions(){

    showSuggestions();

    suggestions.innerText = '';

    let bounds = form.productName.getBoundingClientRect();
    suggestions.style.left = bounds.left+'px';
    suggestions.style.top = (bounds.top+bounds.height)+'px';
    suggestions.style.width = bounds.width+'px';

    let div = document.createElement('div');
    div.className = 'suggestionLoading';
    div.innerText = 'Načítání...';
    suggestions.appendChild(div);

  }

  form.productName.onclick = function(){
    if(form.productName.value.length<3) return;
    showLoadingSuggestions();
    loadSuggestions();
  }

  form.productName.oninput = function(e){

    form.productId.value = null;
    form.productName.classList.remove('valid');

    if(searchTimeout) clearTimeout(searchTimeout);

    if(form.productName.value.length<3) {
      hideSuggestions();
      return;
    }

    showLoadingSuggestions();

    searchTimeout = setTimeout(async function(){
      loadSuggestions();
    }, 500);

  }

  div.onclick = function(){
    if(!suggestions.mouseover && !form.productName.mouseover){
      hideSuggestions();
    }
  }

  return div;

}
