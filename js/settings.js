
async function createSettingsDialog(){

  let div = await LayoutManager.getLayout('layouts/settings.html');
  div.className = 'settingsDialog';

  // TODO replace these with layout-id
  let passwordForm = div.querySelector('.changePasswordForm');
  let settingsForm = div.querySelector('.settingsForm');
  let changePasswordInfo = div.querySelector('.changePasswordInfo');
  let appSettingsInfo = div.querySelector('.appSettingsInfo');
  
  // TODO make these part of layoutManager as well?
  function showChangePasswordInfo(msg){
    changePasswordInfo.innerText = msg;
    changePasswordInfo.classList.add('show');
  }

  function showAppSettingsInfo(msg){
    appSettingsInfo.innerText = msg;
    appSettingsInfo.classList.add('show');
    appSettingsInfo.scrollIntoView();
  }

  passwordForm.submitForm = async function(){

    // TODO layout-id?

    let currentPassword = passwordForm.getValue(passwordForm.currentPassword);
    let newPassword = passwordForm.getValue(passwordForm.newPassword);
    let confirmPassword = passwordForm.getValue(passwordForm.confirmPassword);

    if(newPassword!=confirmPassword){
      passwordForm.newPassword.classList.add('invalid');
      passwordForm.confirmPassword.classList.add('invalid');
      passwordForm.currentPassword.value = '';
      passwordForm.newPassword.value = '';
      passwordForm.confirmPassword.value = '';
      throw {
        message: 'Hesla se neshodují!'
      };
    }

    let status;

    try {
      status = await POST('api/user/changePassword.php', {
        'currentPassword': currentPassword,
        'newPassword': newPassword,
      });
    } catch(e){
      passwordForm.currentPassword.value = '';
      passwordForm.newPassword.value = '';
      passwordForm.confirmPassword.value = '';
      throw e;
    }

    hideLoading();

    if(status=='success'){
      showChangePasswordInfo('Heslo změněno!');
      passwordForm.currentPassword.value = '';
      passwordForm.newPassword.value = '';
      passwordForm.confirmPassword.value = '';
      return;
    }

    passwordForm.currentPassword.value = '';
    passwordForm.newPassword.value = '';
    passwordForm.confirmPassword.value = '';

    throw {
      message: 'Nelze změnit heslo!'
    };

  }

  // passwordForm.onSubmitFail = function(){
  //   passwordForm.currentPassword.value = '';
  //   passwordForm.newPassword.value = '';
  //   passwordForm.confirmPassword.value = '';
  // }

  function toDays(str){
    if(str=='days'){
      return 1;
    } else if(str=='weeks'){
      return 7;
    }
    throw "Invalid value "+str;
  }

  settingsForm.submitForm = async function(){

    // TODO change these to layout-id? (for consistency)

    let criticalValue = settingsForm.getValue(settingsForm.criticalValue);
    let warnValue = settingsForm.getValue(settingsForm.warnValue);
    let recommendedValue = settingsForm.getValue(settingsForm.recommendedValue);
    let dateFormat = settingsForm.dateFormat.value;
    let criticalUnit = settingsForm.criticalUnit.value;
    let warnUnit = settingsForm.warnUnit.value;
    let recommendedUnit = settingsForm.recommendedUnit.value;
    let sendNotifs = settingsForm.sendNotifs.checked?1:0;

    if(!dateFormat) {
      throw {
        message: 'Prosím vyberte formát datumu!',
        element: settingsForm.dateFormat
      };
    }

    if(!criticalUnit) {
      throw {
        message: 'Prosím vyberte jednotku kritického stavu!',
        element: settingsForm.criticalUnit
      };
    }

    if(!warnUnit) {
      throw {
        message: 'Prosím vyberte jednotku stavu varování!',
        element: settingsForm.warnUnit
      };
    }

    if(!recommendedUnit) {
      throw {
        message: 'Prosím vyberte jednotku doporučeného odevzdání!',
        element: settingsForm.recommendedUnit
      };
    }

    let criticalTime = criticalValue+' '+criticalUnit;
    let warnTime = warnValue+' '+warnUnit;
    let recommendedTime = recommendedValue+' '+recommendedUnit;

    let criticalDays = criticalValue*toDays(criticalUnit);
    let warnDays = warnValue*toDays(warnUnit);
    let recommendedDays = recommendedValue*toDays(recommendedUnit);

    if(criticalDays>=warnDays){
      throw {
        message: 'Kritický stav musí být menší než stav varování!', // TODO message?
        element: settingsForm.criticalValue
      };
    }

    if(criticalDays>=recommendedDays){
      throw {
        message: 'Kritický stav musí být menší než doporučené odevzdání!',
        element: settingsForm.criticalValue
      };
    }

    if(warnDays>=recommendedDays){
      throw {
        message: 'Stav varování musí být menší než doporučené odevzdání!',
        element: settingsForm.warnValue
      };
    }

    await POST('api/user/changeSettings.php', {
      'criticalTime':criticalTime,
      'warnTime':warnTime,
      'recommendedTime':recommendedTime,
      'dateFormat':dateFormat,
      'sendNotifs':sendNotifs,
    });

    showAppSettingsInfo('Nastavení uloženo!');
    await refresh();

  }

  div.oninput = function(e){
    changePasswordInfo.classList.remove('show');
    appSettingsInfo.classList.remove('show');
  }

  div.onclick = function(){
    changePasswordInfo.classList.remove('show');
    appSettingsInfo.classList.remove('show');
  }

  // tab management

  let tabs = [
    {btn: div.elements.changePasswordTabBtn, tab: div.elements.changePasswordTab},
    {btn: div.elements.appSettingsTabBtn, tab: div.elements.appSettingsTab},
  ];

  function setTab(index){
    for(let i = 0; i<tabs.length; i++){
      if(i==index){
        tabs[i].btn.classList.add('selected');
        tabs[i].tab.style.display = 'block';
      } else {
        tabs[i].btn.classList.remove('selected');
        tabs[i].tab.style.display = 'none';
      }
    }
  }

  div.elements.changePasswordTabBtn.onclick = function(){
    setTab(0);
  }

  div.elements.appSettingsTabBtn.onclick = function(){
    setTab(1);
  }

  // TODO move to onInit

  setTab(0);

  // load current settings

  let settings = JSON.parse(await GET('api/user/getSettings.php'));

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

  settingsForm.sendNotifs.checked = !!settings.sendNotifs;

  return div;

}
