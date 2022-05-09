
async function createDonatedBagsDialog(){

  let div = await LayoutManager.getLayout('layouts/donatedBags.html');
  div.className = 'donatedBagsDialog';
  
  // load data

  let bags = JSON.parse(await GET('api/bag/listDonated.php'));

  if(bags.length==0){
    div.elements.bagList.innerHTML = '<div class="emptyInfo">Žádné odevzdané tašky</div>';
  }

  for(let bag of bags){

    let bagDiv = document.createElement('div');
    bagDiv.className = 'bagDiv';

    let bagInfoDiv = document.createElement('div');
    bagInfoDiv.className = 'donatedBagInfo';

    let bagName = document.createElement('span');
    bagName.className = 'bagName';
    bagName.innerText = bag.name;
    bagName.title = bag.name;
    bagInfoDiv.appendChild(bagName);

    let donatedDate = document.createElement('div');
    donatedDate.className = 'donatedDate';
    donatedDate.innerText += 'Odevzdáno: '+bag.donatedDateFmt;
    bagInfoDiv.appendChild(donatedDate);

    bagDiv.appendChild(bagInfoDiv);

    let restoreDiv = document.createElement('div');
    restoreDiv.className = 'restoreDiv';

    let btn = document.createElement('button');
    btn.className = 'restoreBtn';
    btn.innerText = 'Obnovit';
    btn.onclick = async function(){
      showLoading();
      div.hide();
      await POST('api/bag/restoreDonated.php?bagId='+bag.id);
      await loadBags();
      await loadBag(bag.id);
      hideLoading();
      // hideDialogs();
    }
    restoreDiv.appendChild(btn);

    bagDiv.appendChild(restoreDiv);

    div.elements.bagList.appendChild(bagDiv);

  }

  return div;

}
