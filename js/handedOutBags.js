
async function showHandedOutBagsDialog(username){

  if(dialogs['handedOutBags']) return;

  let div = document.createElement('div');
  div.className = 'handedOutBagsDialog';
  div.innerHTML = await GET('dialogs/handedOutBags.html');
  document.body.appendChild(div);

  // dialogs.push(div);
  dialogs['handedOutBags'] = div;

  let closeBtn = div.querySelector('.formClose');
  let bagList = div.querySelector('.bagList');

  closeBtn.onclick = function(){
    div.hide();
  }

  div.hide = function(){
    document.body.removeChild(div);
    // dialogs.splice(dialogs.indexOf(div));
    delete dialogs['handedOutBags'];
  }

  let bags = JSON.parse(await GET('api/bag/listHandedOut.php'));

  if(bags.length==0){
    bagList.innerHTML = '<div class="emptyInfo">Žádné odevzdané tašky</div>';
  }

  for(let bag of bags){

    let bagDiv = document.createElement('div');
    bagDiv.className = 'bagDiv';

    let bagInfoDiv = document.createElement('div');
    bagInfoDiv.className = 'handedOutBagInfo';

    let bagName = document.createElement('span');
    bagName.className = 'bagName';
    bagName.innerText += bag.name;
    bagInfoDiv.appendChild(bagName);

    let handedOutDate = document.createElement('div');
    handedOutDate.className = 'handedOutDate';
    handedOutDate.innerText += 'Odevzdáno: '+bag.handedOutDateFmt;
    bagInfoDiv.appendChild(handedOutDate);

    bagDiv.appendChild(bagInfoDiv);

    let restoreDiv = document.createElement('div');
    restoreDiv.className = 'restoreDiv';

    let btn = document.createElement('button');
    btn.className = 'restoreBtn';
    btn.innerText = 'Obnovit';
    btn.onclick = async function(){
      await POST('api/bag/restoreHandedOut.php?bagId='+bag.id);
      refresh();
      hideDialogs();
    }
    restoreDiv.appendChild(btn);

    bagDiv.appendChild(restoreDiv);

    bagList.appendChild(bagDiv);

  }

}
