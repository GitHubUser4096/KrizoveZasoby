
async function createEditItemDialog(item){

  /** CREATE DIALOG **/

  let div = await LayoutManager.getLayout('layouts/editItem.html');
  div.className = 'editItemDialog';
  
  let itemForm = div.querySelector('.itemForm'); // TODO layout-id

  /** INITIALIZE FORM **/

  div.onInit = function(){
    div.elements.count.focusInput();
  }

  // TODO move these to onInit?
  div.elements.itemId.value = item.id;
  div.elements.count.setValue(item.count);
  if(item.expiration!=null)
      div.elements.expiration.setValue(item.expiration);

  /** SUBMIT **/

  itemForm.submitForm = async function(){

    let itemId = div.elements.itemId.value;
    let count = itemForm.getValue(div.elements.count);
    let expiration = itemForm.getValue(div.elements.expiration);

    let existingItem = itemDivs.find(i=>(i.item.productId==item.productId && (i.item.expiration??'')==expiration && i.item.used==item.used && i.item.id!=item.id));
    if(existingItem){
      if(!confirm('Položka již existuje. Spojit položky?')) {
        hideLoading();
        return;
      }
    }

    await POST('api/item/editItem.php?itemId='+itemId, {
      'count':count,
      'expiration':expiration
    });

    div.hide();

    await refresh();

  }

  return div;

}
