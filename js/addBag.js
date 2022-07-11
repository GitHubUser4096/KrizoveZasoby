
async function createAddBagDialog(){

  let div = await LayoutManager.getLayout('layouts/addBag.html');
  div.className = 'addBagDialog';

  div.onInit = function(){
    div.elements.bagName.focus();
  }

  div.elements.form.submitForm = async function(){

    let bagName = toFirstUpper(div.elements.form.getValue(div.elements.bagName));
    let description = div.elements.form.getValue(div.elements.description);

    let bag = JSON.parse(await POST('api/bag/createBag.php', {
      'name':bagName,
      'description':description,
    }));

    div.hide();

    await loadBags();
    await loadBag(bag.id);

  }

  return div;

}
