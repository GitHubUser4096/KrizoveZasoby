
async function createAddProductDialog(addItemDialog){

  /** CREATE DIALOG **/

  let div = await LayoutManager.getLayout('layouts/addProduct.html');
  div.className = 'addProductDialog';
  
  /** QUERY ELEMENTS **/

  // TODO get rid of these ?

  let form = div.querySelector('.form');

  div.onInit = function(){
    div.elements.brand.focus();
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
  }

  form.submitForm = async function(){

    let brand = form.getValue(div.elements.brand);
    let productType = form.getValue(div.elements.productType);
    let amountValue = form.getValue(div.elements.amountValue);
    let amountUnit = div.elements.amountUnit.value;
    let shortDesc = form.getValue(div.elements.shortDesc);
    let productCode = form.getValue(div.elements.productCode);
    let packageType = form.getValue(div.elements.packageType);
    let description = form.getValue(div.elements.description);

    let imgName = null;
    if(imgFile) {
      imgName = await POST_FILE('api/user/uploadImage.php', imgFile);
    }

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

    div.hide();

  }

  /** LOAD DATA **/

  // TODO move to onInit? identify by layout-id?
  let datalist_brands = div.querySelector('#datalist_brands');
  let datalist_type = div.querySelector('#datalist_type');
  let datalist_packageTypes = div.querySelector('#datalist_packageTypes');

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

  return div;

}
