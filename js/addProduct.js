
async function showAddProductDialog(addItemDialog){

  if(dialogs['addProduct']) return;

  let div = document.createElement('div');
  div.className = 'addProductDialog';
  div.innerHTML = await GET('dialogs/addProduct.html');
  document.body.appendChild(div);

  dialogs['addProduct'] = div;

  div.hide = function(){
    document.body.removeChild(div);
    delete dialogs['addProduct'];
  }

  let closeBtn = div.querySelector('.formClose');

  closeBtn.onclick = function(){
    div.hide();
  }

  let content = div.querySelector('.dialogContent');
  let form = div.querySelector('.form');
  // let catDiv = div.querySelector('.categories');
  let imgPreview = div.querySelector('.imgPreview');
  let imgSelect = div.querySelector('.imgSelect');
  let imgClear = div.querySelector('.imgClear');
  let formError = div.querySelector('.formError');

  function showError(msg, element){
    formError.style.display = 'block';
    formError.innerText = msg;
    formError.style.position = 'absolute';
    formError.style.margin = '0';
    formError.style.left = '0';
    formError.style.right = '0';
    formError.style.top = '0';
    formError.style.width = '100%';
    content.scrollTo(0, 0);
    if(element){
      element.classList.add('invalid');
    }
    // if(element){
    //   element.classList.add('invalid');
    //   formError.style.position = 'absolute';
    //   formError.style.margin = '0';
    //   formError.style.left = (element.offsetLeft)+'px';
    //   formError.style.right = (element.offsetLeft+element.offsetWidth)+'px';
    //   formError.style.top = (element.offsetTop+element.offsetHeight-4)+'px';
    //   formError.style.width = element.offsetWidth+'px';
    //   content.scrollTo(0, element.offsetTop-35);
    // } else {
    //   formError.style.position = 'static';
    //   formError.style.margin = null;
    //   formError.style.left = null;
    //   formError.style.right = null;
    //   formError.style.top = null;
    //   content.scrollTo(0, 0);
    // }
  }

  // form.productName.value = name;

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

  // let categories = JSON.parse(await GET('api/product/listCategories.php'));
  // catDiv.innerText = '';
  //
  // for(let category of categories){
  //   let label = document.createElement('label');
  //   let input = document.createElement('input');
  //   input.type = 'checkbox';
  //   label.appendChild(input);
  //   label.appendChild(document.createTextNode(category.name));
  //   catDiv.appendChild(label);
  // }
  //
  // function addCategory(){
  //
  //   let catName = form.catName.value.trim();
  //
  //   if(!catName) return;
  //
  //   if(catName.length>30) {
  //     form.catName.classList.add('invalid');
  //     showError('Název kategorie je příliš dlouhý!', form.catName);
  //     return;
  //   }
  //
  //   let categories = [];
  //   for(let label of catDiv.children){
  //     let text = label.childNodes[1].nodeValue;
  //     categories.push(text);
  //   }
  //
  //   // if(categories.indexOf(catName)>=0) {
  //   if(categories.findIndex(c=>catName.toLowerCase()==c.toLowerCase())>=0) {
  //     form.catName.classList.add('invalid');
  //     showError('Kategorie již existuje!', form.catName);
  //     return;
  //   }
  //
  //   let label = document.createElement('label');
  //   let input = document.createElement('input');
  //   input.type = 'checkbox';
  //   input.checked = true;
  //   label.appendChild(input);
  //   label.appendChild(document.createTextNode(catName.substring(0, 1).toUpperCase()+catName.substring(1).toLowerCase()));
  //
  //   catDiv.appendChild(label);
  //
  //   form.catName.value = '';
  //
  // }
  //
  // // form.newCat.onclick = addCategory;
  //
  // form.catName.oninput = function(){
  //   form.catName.classList.remove('invalid');
  // }
  //
  // form.catName.onchange = function(){
  //   addCategory();
  // }
  //
  // form.catName.onkeydown = function(e){
  //   // console.log(e);
  //   if(e.key=='Enter'){
  //     addCategory();
  //     return false;
  //   }
  // }

  let imgFile = null;
  let fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = 'image/*';

  fileInput.onchange = function(e){

    if(!fileInput.value) return;

    let reader = new FileReader();
    reader.onload = function(){
      // imgPreview.src = reader.result;
      let img = new Image();
      img.src = reader.result;
      img.onload = function(){
        imgPreview.style.backgroundImage = "url('"+reader.result+"')";
        imgFile = fileInput.files[0];
      }
      img.onerror = function(){
        alert('Vybraný soubor není platný obrázek.');
      }
    }
    reader.readAsDataURL(fileInput.files[0]);

  }

  imgSelect.onclick = function(){
    fileInput.click();
  }

  imgClear.onclick = function(){
    imgPreview.style.backgroundImage = '';
    imgFile = null;
  }

  form.onsubmit = function(e){

    try {

      let brand = toFirstUpper(form.brand.value.trim());
      let productType = toFirstUpper(form.productType.value.trim());
      let shortDesc = form.shortDesc.value.trim();
      let productCode = form.productCode.value.trim();
      let packageType = toFirstUpper(form.packageType.value.trim());
      let description = form.description.value.trim();
      let amountValue = form.amountValue.value.trim();
      let amountUnit = form.amountUnit.value;

      if(!brand){
        showError('Prosím zadejte výrobce/značku!', form.brand);
        return false;
      }

      if(brand.length>64){
        showError('Značka je příliš dlouhá!', form.brand);
        return false;
      }

      if(!productType){
        showError('Prosím zadejte typ produktu!', form.productType);
        return false;
      }

      if(productType.length>64){
        showError('Typ produktu je příliš dlouhý!', form.productType);
        return false;
      }

      if(!shortDesc){
        showError('Prosím zadejte krátký popis!', form.shortDesc);
        return false;
      }

      if(shortDesc.length>128){
        showError('Krátký popis je příliš dlouhý!', form.shortDesc);
        return false;
      }

      if(!productCode){
        showError('Prosím zadejte kód produktu!', form.productCode);
        return false;
      }

      if(productCode.length>64){
        showError('Kód produktu je příliš dlouhý!', form.productCode);
        return false;
      }

      if(amountValue){
        if(parseInt(amountValue)!=amountValue){
          showError('Prosím zadejte celé číslo!', form.amountValue);
          return false;
        }
        if(amountValue<=0){
          showError('Prosím zadejte kladné číslo!', form.amountValue);
          return false;
        }
      }

      // let name = form.productName.value.trim();
      // let ean = form.ean.value.trim();
      // let desc = form.description.value;
      // let packageType = form.packageType.value.trim();
      // packageType = packageType.substring(0, 1).toUpperCase()+packageType.substring(1).toLowerCase();

      // if(!name){
      //   // content.scrollTo(0, 0);
      //   form.productName.classList.add('invalid');
      //   showError('Prosím zadejte název!', form.productName);
      //   return false;
      // }

      // if(name.length>99){
      //   form.productName.classList.add('invalid');
      //   showError('Název je příliš dlouhý!', form.productName);
      //   return false;
      // }

      // if(!ean){
      //   // content.scrollTo(0, 0);
      //   form.ean.classList.add('invalid');
      //   showError('Prosím zadejte EAN kód!', form.ean);
      //   return false;
      // }
      //
      // if(ean.length>13){
      //   form.ean.classList.add('invalid');
      //   showError('EAN kód je příliš dlouhý!', form.ean);
      //   return false;
      // }

      if(description && description.length>1024){
        // content.scrollTo(0, 0);
        // form.description.classList.add('invalid');
        showError('Popis je příliš dlouhý!', form.description);
        return false;
      }

      if(packageType && packageType.length>30){
        // content.scrollTo(0, 0);
        // form.packageType.classList.add('invalid');
        showError('Typ balení je příliš dlouhý!', form.packageType);
        return false;
      }

      // let categories = [];
      // for(let label of catDiv.children){
      //   let input = label.childNodes[0];
      //   let text = label.childNodes[1].nodeValue;
      //   if(input.checked) categories.push(text);
      // }

      (async function(){

        if(!await checkAuth()) return;

        try {

          let imgName = null;
          if(imgFile) {
            imgName = await POST_FILE('api/uploadImage.php', imgFile);
          }

          let product = JSON.parse(await POST('api/product/create.php', {
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

          // document.body.removeChild(div);
          div.hide();

        } catch(e){
          showError(e.message);
        }

      })();

    } catch(e){
      console.log(e);
      return false;
    }

    return false;
  }

  form.oninput = function(e){
    e.target.classList.remove('invalid');
    formError.style.display = 'none';
  }

  div.onclick = function(){
    formError.style.display = 'none';
  }

  // categoryForm.onsubmit = function(){
  //   console.log('submitting category form');
  //   return false;
  // }

}

// async function showAddProductDialog(name){
//
//   dialog_addProduct_input_name.value = name;
//
//   dialog_addProduct.style.display = 'block';
//
//   let categories = JSON.parse(await GET('api/product/listCategories.php'));
//
//   addProductCategories.innerText = '';
//
//   for(let category of categories){
//     let label = document.createElement('label');
//     let input = document.createElement('input');
//     input.type = 'checkbox';
//     label.appendChild(input);
//     label.appendChild(document.createTextNode(category.name));
//     addProductCategories.appendChild(label);
//   }
//
//   let packageTypes = JSON.parse(await GET('api/product/listPackageTypes.php'));
//
//   package_types.innerText = '';
//
//   for(let packageType of packageTypes){
//     let option = document.createElement('option');
//     option.value = packageType.name;
//     package_types.appendChild(option);
//   }
//
// }
//
// function initAddProductDialog(){
//
//   let dialog = document.querySelector('#dialog_addProduct');
//   let btn_close = document.querySelector('#dialog_addProduct_btn_close');
//   let input_name = document.querySelector('#dialog_addProduct_input_name');
//   let btn_submit = document.querySelector('#dialog_addProduct_btn_submit');
//
//   btn_close.onclick = function(){
//     dialog.style.display = 'none';
//   }
//
//   btn_submit.onclick = async function(){
//
//     let name = input_name.value;
//     let EAN = dialog_addProduct_input_ean.value;
//     let desc = addProductDesc.value;
//     let packageType = addProductPackageType.value;
//
//     let categories = [];
//     for(let label of addProductCategories.children){
//       let input = label.childNodes[0];
//       let text = label.childNodes[1].nodeValue;
//       if(input.checked) categories.push(text);
//     }
//
//     await POST('api/product/create.php', {'name':name, 'EAN':EAN, 'description':desc, 'packageType':packageType, 'categories':JSON.stringify(categories)});
//
//     dialog.style.display = 'none';
//
//   }
//
//   let fileInput = document.createElement('input');
//   fileInput.type = 'file';
//   fileInput.accept = 'image/*';
//
//   fileInput.onchange = function(e){
//
//     if(!fileInput.value) return;
//
//     let reader = new FileReader();
//     reader.onload = function(){
//       addProductImage.src = reader.result;
//     }
//     reader.readAsDataURL(fileInput.files[0]);
//
//   }
//
//   addProductSelectImage.onclick = function(){
//     fileInput.click();
//   }
//
//   addProductClearImage.onclick = function(){
//     addProductImage.src = ''
//   }
//
//   addProductNewCat.onclick = function(){
//
//     let catName = addProductCatName.value;
//
//     let label = document.createElement('label');
//     let input = document.createElement('input');
//     input.type = 'checkbox';
//     input.checked = true;
//     label.appendChild(input);
//     label.appendChild(document.createTextNode(catName));
//
//     addProductCategories.appendChild(label);
//
//     addProductCatName.value = '';
//
//   }
//
// }
