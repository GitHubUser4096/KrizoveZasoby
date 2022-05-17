
// TODO name is not accurate anymore
async function createAddProductDialog(addItemDialog, editingProduct){

  /** CREATE DIALOG **/

  let div = await LayoutManager.getLayout('layouts/addProduct.html');
  div.className = 'addProductDialog';

  let canEdit = editingProduct ? (editingProduct.createdBy==auth.user.id || checkRole('editor')) : false;

  /** QUERY ELEMENTS **/

  // TODO get rid of these ?

  let form = div.querySelector('.form');

  let imgName = null;

  div.onInit = function(){

    div.elements.brand.focus();

    if(editingProduct){
      div.elements.brand.value = editingProduct.brand;
      div.elements.productType.value = editingProduct.productType;
      div.elements.amountValue.value = editingProduct.amountValue ? editingProduct.amountValue : '';
      div.elements.amountUnit.value = editingProduct.amountUnit ?? 'g';
      div.elements.shortDesc.value = editingProduct.shortDesc;
      div.elements.productCode.value = editingProduct.code;
      div.elements.packageType.value = editingProduct.packageType;
      div.elements.description.value = editingProduct.description;
      if(editingProduct.imgName){
        div.elements.imgPreview.style.backgroundImage = "url('images/"+editingProduct.imgName+"')";
        imgName = editingProduct.imgName;
      }
      if(canEdit){
        div.elements.warning.innerHTML = 'Upravujete produkt';
        div.elements.title.innerText = 'Upravit produkt';
      } else {
        div.elements.warning.innerHTML = 'Navrhujete úpravu produktu <a title="Změny budou zveřejněny až po potvrzení administrátorem">(?)</a>';
        div.elements.title.innerText = 'Navrhnout úpravy produktu';
      }
    } else {
      div.elements.warning.innerText = 'Přidáváte produkt do sdílené databáze';
      div.elements.title.innerText = 'Přidat produkt';
    }

    (async function(){

      // TODO identify by layout-id?

      let brands = JSON.parse(await GET('api/product/listBrands.php'));
      datalist_brands.innerText = '';

      for(let brand of brands){
        let option = document.createElement('option');
        option.value = brand.name;
        datalist_brands.appendChild(option);
      }

      let productTypes = JSON.parse(await GET('api/product/listProductTypes.php'));
      datalist_type.innerText = '';

      for(let productType of productTypes){
        let option = document.createElement('option');
        option.value = productType.name;
        datalist_type.appendChild(option);
      }

      let packageTypes = JSON.parse(await GET('api/product/listPackageTypes.php'));
      datalist_packageTypes.innerText = '';

      for(let packageType of packageTypes){
        let option = document.createElement('option');
        option.value = packageType.name;
        datalist_packageTypes.appendChild(option);
      }

    })();

  }

  /** COMMON FUNCTIONS **/

  /** INITIALIZE ELEMENTS (LISTENERS ETC.) **/

  let imgFile = null;
  let fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = 'image/*';

  fileInput.onchange = function(e){

    if(!fileInput.value) return;

    let reader = new FileReader();
    reader.onload = function(){
      let img = new Image();
      img.src = reader.result;
      img.onload = function(){
        div.elements.imgPreview.style.backgroundImage = "url('"+reader.result+"')";
        imgFile = fileInput.files[0];
      }
      img.onerror = function(){
        alert('Vybraný soubor není platný obrázek.');
      }
    }
    reader.readAsDataURL(fileInput.files[0]);

  }

  div.elements.imgSelect.onclick = function(){
    fileInput.click();
  }

  div.elements.imgClear.onclick = function(){
    div.elements.imgPreview.style.backgroundImage = '';
    imgFile = null;
    imgName = null;
  }

  form.submitForm = async function(){

    // TODO make names more consistent
    let brand = form.getValue(div.elements.brand);
    let productType = form.getValue(div.elements.productType);
    let amountValue = form.getValue(div.elements.amountValue);
    let amountUnit = div.elements.amountUnit.value;
    let shortDesc = form.getValue(div.elements.shortDesc);
    let productCode = form.getValue(div.elements.productCode);
    let packageType = form.getValue(div.elements.packageType);
    let description = form.getValue(div.elements.description);

    // let imgName = null;
    if(imgFile) {
      imgName = await POST_FILE('api/user/uploadImage.php', imgFile);
    }

    if(editingProduct){

      let product;

      if(canEdit){ // user is qualified to edit this product

        product = JSON.parse(await POST('api/product/editProduct.php?productId='+editingProduct.id, {
          'brand': brand,
          'type': productType,
          'shortDesc': shortDesc,
          'code': productCode,
          'imgName': imgName,
          'packageType': packageType,
          'description': description,
          'amountValue': amountValue,
          'amountUnit': amountUnit,
        }));

      } else { // user is not qualified to edit this product - suggest an edit

        let changed = {};
        if(brand!=editingProduct.brand) changed['brand'] = brand;
        if(productType!=editingProduct.productType) changed['type'] = productType;
        if(amountValue!=editingProduct.amountValue) changed['amountValue'] = amountValue;
        if(amountUnit!=editingProduct.amountUnit) changed['amountUnit'] = amountUnit;
        if(shortDesc!=editingProduct.shortDesc) changed['shortDesc'] = shortDesc;
        if(productCode!=editingProduct.code) changed['code'] = productCode;
        if(packageType!=editingProduct.packageType) changed['packageType'] = packageType;
        if(description!=editingProduct.description) changed['description'] = description;
        if(imgName!=editingProduct.imgName) changed['imgName'] = imgName;

        if(Object.keys(changed).length) { // save only if some property changed
          product = JSON.parse(await POST('api/product/suggestEdit.php?productId='+editingProduct.id, changed));
        }

      }
  
      if(addItemDialog && product) addItemDialog.setProduct(product);
      await refresh();

    } else {

      let product = JSON.parse(await POST('api/product/createProduct.php', {
        'brand': brand,
        'type': productType,
        'shortDesc': shortDesc,
        'code': productCode,
        'imgName': imgName,
        'packageType': packageType,
        'description': description,
        'amountValue': amountValue,
        'amountUnit': amountUnit,
      }));
  
      if(addItemDialog) addItemDialog.setProduct(product);

    }

    div.hide();

  }

  return div;

}
