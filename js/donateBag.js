
async function createDonateBagDialog(){

  let div = await LayoutManager.getLayout('layouts/donateBag.html');
  div.className = 'donateBagDialog';

  div.elements.findCharityBtn.onclick = function(){

    showDialog('findCharity');

  }

  div.elements.donateBtn.onclick = async function(){

    if(!confirm('Označit tašku '+selectedBag.name+' jako odevzdanou?\n(Odevzdané tašky můžete zobrazit/obnovit v menu -> odevzdané tašky)')) return;
    showLoading();
    await POST('api/bag/donateBag.php?bagId='+selectedBag.id);
    await refresh();
    div.hide();

  }

  

  return div;

}
