
async function showUserMenu(username){

  let div = document.createElement('div');
  div.className = 'userMenuDialog';
  div.innerHTML = await GET('dialogs/userMenu.html');
  document.body.appendChild(div);

  let usernameField = div.querySelector('.usernameField');
  let closeBtn = div.querySelector('.formClose');
  let logoutBtn = div.querySelector('.logoutBtn');

  usernameField.innerText = username;

  closeBtn.onclick = function(){
    document.body.removeChild(div);
  }

  logoutBtn.onclick = async function(){
    await POST('api/logout.php');
    location.href = 'index.php';
  }

}
