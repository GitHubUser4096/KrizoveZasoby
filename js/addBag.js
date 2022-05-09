
async function createAddBagDialog(){

  let div = await LayoutManager.getLayout('layouts/addBag.html');
  div.className = 'addBagDialog';

  div.onInit = function(){
    div.elements.bagName.focus();
  }

  div.elements.form.submitForm = async function(){

    // let count = form.getValue(div.elements.count);
    // let expiration = form.getValue(div.elements.expiration);

    let bagName = toFirstUpper(div.elements.form.getValue(div.elements.bagName));
    let description = div.elements.form.getValue(div.elements.description);

    // let existingItem = itemDivs.find(i=>(i.item.productId==productId && (i.item.expiration??'')==(expiration??'') && !i.used));
    // if(existingItem){
    //   if(!confirm('Položka již existuje. Spojit položky?')) {
    //     hideLoading();
    //     return;
    //   }
    // }

    let bag = JSON.parse(await POST('api/bag/createBag.php', {
      'name':bagName,
      'description':description,
    }));

    div.hide();

    // await refresh();
    await loadBags();
    await loadBag(bag.id);

  }

  return div;

}
