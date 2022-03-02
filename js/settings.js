
async function showSettingsDialog(username){

  if(dialogs['settings']) return;

  let div = document.createElement('div');
  div.className = 'settingsDialog';
  div.innerHTML = await GET('dialogs/settings.html');
  document.body.appendChild(div);

  dialogs['settings'] = div;

  let closeBtn = div.querySelector('.formClose');
  let passwordForm = div.querySelector('.changePasswordForm');
  let settingsForm = div.querySelector('.settingsForm');
  let formInfo = div.querySelector('.formInfo');
  let criticalInput = div.querySelector('.criticalInput');
  let warnInput = div.querySelector('.warnInput');
  let recommendedInput = div.querySelector('.recommendedInput');
  let content = div.querySelector('.dialogContent');

  function showInfo(msg, status, element){
    formInfo.style.display = 'block';
    formInfo.innerText = msg;
    if(status=='error'){
      formInfo.style.background = 'red';
      formInfo.style.color = 'white';
    } else if(status=='success'){
      formInfo.style.background = '#2D1';
      formInfo.style.color = 'white';
    }
    if(element){
      formInfo.style.position = 'absolute';
      formInfo.style.margin = '0';
      formInfo.style.left = (element.offsetLeft)+'px';
      formInfo.style.right = (element.offsetLeft+element.offsetWidth)+'px';
      formInfo.style.top = (element.offsetTop+element.offsetHeight-4)+'px';
      formInfo.style.width = element.offsetWidth+'px';
      content.scrollTo(0, element.offsetTop-35);
    } else {
      formInfo.style.position = 'static';
      formInfo.style.margin = null;
      formInfo.style.left = null;
      formInfo.style.right = null;
      formInfo.style.width = null;
      formInfo.style.top = null;
      content.scrollTo(0, 0);
    }
  }

  div.hide = function(){
    document.body.removeChild(div);
    delete dialogs['settings'];
  }

  closeBtn.onclick = function(){
    div.hide();
  }

  passwordForm.onsubmit = function(){

    let password = passwordForm.password.value;
    let confirmPassword = passwordForm.confirmPassword.value;

    (async function(){

      if(!password){
        showInfo('Prosím zadejte heslo!', 'error', passwordForm.password);
        passwordForm.password.classList.add('invalid');
        return;
      }

      if(!confirmPassword){
        showInfo('Prosím zadejte ověření hesla!', 'error', passwordForm.confirmPassword);
        passwordForm.confirmPassword.classList.add('invalid');
        return;
      }

      if(password!=confirmPassword){
        showInfo('Hesla se neshodují!', 'error');
        passwordForm.password.classList.add('invalid');
        passwordForm.confirmPassword.classList.add('invalid');
        passwordForm.password.value = '';
        passwordForm.confirmPassword.value = '';
        return;
      }

      try {

        let status = await POST('api/changePassword.php', {'password':password});

        if(status=='success'){
          showInfo('Heslo změněno!', 'success');
          passwordForm.password.value = '';
          passwordForm.confirmPassword.value = '';
          return;
        }

        showInfo('Nelze změnit heslo.', 'error');
        passwordForm.password.value = '';
        passwordForm.confirmPassword.value = '';

      } catch(e) {
        showInfo(e.message, 'error');
        passwordForm.password.value = '';
        passwordForm.confirmPassword.value = '';
      }

    })();

    return false;

  }

  function toDays(str){
    if(str=='days'){
      return 1;
    } else if(str=='weeks'){
      return 7;
    }
    throw "Invalid value "+str;
  }

  settingsForm.onsubmit = function(){

    let criticalValue = settingsForm.criticalValue.value;
    let criticalUnit = settingsForm.criticalUnit.value;
    let criticalTime = criticalValue+' '+criticalUnit;
    let warnValue = settingsForm.warnValue.value;
    let warnUnit = settingsForm.warnUnit.value;
    let warnTime = warnValue+' '+warnUnit;
    let recommendedValue = settingsForm.recommendedValue.value;
    let recommendedUnit = settingsForm.recommendedUnit.value;
    let recommendedTime = recommendedValue+' '+recommendedUnit;
    let dateFormat = settingsForm.dateFormat.value;

    (async function(){

      let criticalDays = criticalValue*toDays(criticalUnit);
      let warnDays = warnValue*toDays(warnUnit);
      let recommendedDays = recommendedValue*toDays(recommendedUnit);

      if(!(criticalValue>0)){
        showInfo('Prosím zadejte číslo větší než 0!', 'error', settingsForm.criticalValue);
        settingsForm.criticalValue.classList.add('invalid');
        return;
      }

      if(!(warnValue>0)){
        showInfo('Prosím zadejte číslo větší než 0!', 'error', settingsForm.warnValue);
        settingsForm.warnValue.classList.add('invalid');
        return;
      }

      if(!(recommendedValue>0)){
        showInfo('Prosím zadejte číslo větší než 0!', 'error', settingsForm.recommendedValue);
        settingsForm.recommendedValue.classList.add('invalid');
        return;
      }

      if(criticalDays>=warnDays){
        showInfo('Počet dnů musí být menší než u následujících stavů!', 'error', settingsForm.criticalValue);
        settingsForm.criticalValue.classList.add('invalid');
        return;
      }

      if(criticalDays>=recommendedDays){
        showInfo('Počet dnů musí být menší než u následujících stavů!', 'error', settingsForm.criticalValue);
        settingsForm.criticalValue.classList.add('invalid');
        return;
      }

      if(warnDays>=recommendedDays){
        showInfo('Počet dnů musí být menší než u následujících stavů!', 'error', settingsForm.warnValue);
        settingsForm.warnValue.classList.add('invalid');
        return;
      }

      try{
        await POST('api/changeSettings.php', {'criticalTime':criticalTime,'warnTime':warnTime, 'recommendedTime':recommendedTime, 'dateFormat':dateFormat});
        showInfo('Nastavení uloženo!', 'success');
        refresh();
      } catch(e){
        showInfo(e.message, 'error');
      }

    })();

    return false;

  }

  div.oninput = function(e){
    e.target.classList.remove('invalid');
    formInfo.style.display = 'none';
  }

  div.onclick = function(){
    formInfo.style.display = 'none';
  }

  let settings = JSON.parse(await GET('api/getSettings.php'));

  if(settings.criticalTime){
    let parts = settings.criticalTime.split(' ');
    settingsForm.criticalValue.value = parts[0];
    settingsForm.criticalUnit.value = parts[1];
  }

  if(settings.warnTime){
    let parts = settings.warnTime.split(' ');
    settingsForm.warnValue.value = parts[0];
    settingsForm.warnUnit.value = parts[1];
  }

  if(settings.recommendedTime){
    let parts = settings.recommendedTime.split(' ');
    settingsForm.recommendedValue.value = parts[0];
    settingsForm.recommendedUnit.value = parts[1];
  }

  if(settings.dateFormat){
    settingsForm.dateFormat.value = settings.dateFormat;
  }

}
