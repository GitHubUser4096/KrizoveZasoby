
async function createMoveItemDialog(item){

  let div = await LayoutManager.getLayout('layouts/moveItem.html');
  div.className = 'moveItemDialog';
  
  let moveForm = div.querySelector('.moveForm'); // TODO replace by layout-id?
  
  // TODO move to onInit?
  let bags = JSON.parse(await GET('api/bag/listBags.php?userId='+auth.user.id));

  moveForm.bag.innerText = '';
  for(let bag of bags){
    if(bag.id==selectedBagId) continue;
    let option = document.createElement('option');
    option.value = bag.id;
    option.innerText = bag.name;
    moveForm.bag.add(option);
  }

  div.onInit = function(){
    div.elements.moveCount.focusInput();
    div.elements.moveCount.setMax(item.count);
  }

  moveForm.submitForm = async function(){

    let count = moveForm.getValue(div.elements.moveCount);
    let bagId = moveForm.bag.value;

    let items = JSON.parse(await GET('api/item/getItems.php?bagId='+bagId));

    if(items.findIndex(i=>(i.productId==item.productId && i.expiration==item.expiration && i.used==item.used))>=0)
      if(!confirm('Položka již existuje. Spojit položky?')) return;

    let newItem = JSON.parse(await POST('api/item/moveItem.php?itemId='+item.id, {
      'moveCount':count,
      'bagId':bagId
    }));

    div.hide();

    movedItemId = newItem.id;

    await loadBag(bagId);
    await refresh();

  }

  return div;

}
