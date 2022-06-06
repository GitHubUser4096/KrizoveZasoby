
// TODO currently not used - charity workers are not implemented yet

async function createCharityUsersDialog(charity){

  let newUserInput;
  let addUserBtn;

  let div = await LayoutManager.getLayout('layouts/charityUsers.html');
  div.className = 'charityUsersDialog';

  div.onInit = function(){

    (async function(){

      newUserInput = document.createElement('input');
      newUserInput.className = 'newUserInput';
      newUserInput.placeholder = 'E-mail uživatele';
      newUserInput.onchange = async function(){
        // if(newUserInput.parentElement) div.elements.userList.removeChild(newUserInput);
        // div.elements.userList.removeChild(addUserBtn);
        newUserInput.blur();
        // div.elements.userList.appendChild(addUserBtn);
      }
      newUserInput.onblur = async function(){
        // if(newUserInput.parentElement)
        if(newUserInput.value){
          showLoading();
          try {
            let id = JSON.parse(await POST('api/charity/addCharityUser.php?charityId='+charity.id, {
              'email': newUserInput.value,
            })).id;
            await addUser(id, newUserInput.value, false);
            await refresh();
          } catch(e){
            alert(e.message);
            // newUserInput.value = '';
            // div.elements.userList.appendChild(addUserBtn);
            // hideLoading();
            // return;
          }
          hideLoading();
          newUserInput.value = '';
        }
        div.elements.userList.removeChild(newUserInput);
        div.elements.userList.appendChild(addUserBtn);
      }

      for(let user of charity.users){
        await addUser(user.id, user.email, user.isManager);
      }

      addUserBtn = document.createElement('button');
      addUserBtn.className = 'addUserBtn';
      addUserBtn.innerText = '+';

      addUserBtn.onclick = function(){
        div.elements.userList.removeChild(addUserBtn);
        div.elements.userList.appendChild(newUserInput);
        // div.elements.userList.appendChild(addUserBtn);
        newUserInput.focus();
      }

      div.elements.userList.appendChild(addUserBtn);

    })();

  }

  async function addUser(id, email, isManager){

    let userDiv = await LayoutManager.getLayout('layouts/charityUser.html');
    userDiv.className = 'userItem';

    userDiv.elements.username.innerText = email;
    userDiv.elements.isManagerCheckbox.checked = isManager;

    userDiv.elements.isManagerCheckbox.onchange = async function(){
      showLoading();
      try {
        await POST('api/charity/setCharityUserManager.php?id='+id, {
          isManager: userDiv.elements.isManagerCheckbox.checked,
        });
        await refresh();
      } catch(e){
        userDiv.elements.isManagerCheckbox.checked = isManager;
      }
      hideLoading();
    }

    userDiv.elements.removeBtn.onclick = async function(){
      try {
        showLoading();
        await POST('api/charity/removeCharityUser.php?id='+id);
        await refresh();
      } catch(e){
        alert(e.message);
        hideLoading();
        return;
      }
      hideLoading();
      div.elements.userList.removeChild(userDiv);
    }

    div.elements.userList.appendChild(userDiv);

  }

  return div;

}
