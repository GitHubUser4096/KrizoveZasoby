
window.onload = function(){

  let sidebar = document.querySelector('#sidebar');

  if(new URLSearchParams(location.search).has('reauth')){
    sidebar.style.display = 'none';
    loginDialog.style.display = 'block';
    loginMsg.style.display = 'block';
    loginMsg.innerText = 'Prosím přihlašte se znovu pro pokračování';
  }

  loginBtn.onclick = async function(){

    let auth = JSON.parse(await GET('api/auth.php'));

    if(auth.loggedIn){
      location.href = 'profile.php';
      return;
    }

    sidebar.style.display = 'none';
    loginDialog.style.display = 'block';

  }

  loginForm_close.onclick = function(){
    loginDialog.style.display = 'none';
    sidebar.style.display = 'block';
    window.history.replaceState('', '', '?');
  }

  loginForm.oninput = function(e){
    e.target.classList.remove('error');
    loginMsg.style.display = 'none';
  }

  // loginForm.email.oninput = function(){
  //   this.classList.remove('error');
  //   loginMsg.style.display = 'none';
  // }
  //
  // loginForm.password.oninput = function(){
  //   this.classList.remove('error');
  //   loginMsg.style.display = 'none';
  // }

  loginForm.onsubmit = async function(e){

    e.preventDefault();

    // console.log(e.target);

    let email = e.target.email.value;
    let password = e.target.password.value;

    if(!email){
      loginForm.email.classList.add('error');
      loginMsg.style.display = 'block';
      loginMsg.innerText = 'Prosím zadejte email!';
      return;
    }

    if(!password){
      loginForm.password.classList.add('error');
      loginMsg.style.display = 'block';
      loginMsg.innerText = 'Prosím zadejte heslo!';
      return;
    }

    let auth = JSON.parse(await POST('api/auth.php', {'email':email, 'password':password}));

    if(auth.loggedIn){
      location.href = 'profile.php';
    } else {
      loginMsg.style.display = 'block';
      loginMsg.innerText = auth.message;
      // alert(auth.message);
      e.target.password.value = '';
    }

    // return false;

  }

  signupForm.oninput = function(e){
    e.target.classList.remove('error');
    signupMsg.style.display = 'none';
  }

  signupForm.onsubmit = async function(e){

    e.preventDefault();

    let email = e.target.email.value;
    let password = e.target.password.value;
    let confirmPassword = e.target.confirmPassword.value;

    if(!email){ // TODO check it is an email
      signupForm.email.classList.add('error');
      signupMsg.style.display = 'block';
      signupMsg.innerText = 'Prosím zadejte email!';
      return;
    }

    if(!password){
      signupForm.password.classList.add('error');
      signupMsg.style.display = 'block';
      signupMsg.innerText = 'Prosím zadejte heslo!';
      return;
    }

    if(!confirmPassword){
      signupForm.confirmPassword.classList.add('error');
      signupMsg.style.display = 'block';
      signupMsg.innerText = 'Prosím zadejte ověření hesla!';
      return;
    }

    if(password!=confirmPassword){
      signupForm.password.classList.add('error');
      signupForm.confirmPassword.classList.add('error');
      signupMsg.style.display = 'block';
      signupMsg.innerText = 'Hesla se neshodují!';
      return;
    }

    // let auth = JSON.parse(await POST('api/auth.php', {'email':email, 'password':password}));
    //
    // if(auth.loggedIn){
    //   location.href = 'profile.php';
    // } else {
    //   loginMsg.style.display = 'block';
    //   loginMsg.innerText = auth.message;
    //   // alert(auth.message);
    //   e.target.password.value = '';
    // }

    let signup = JSON.parse(await POST('api/signup.php', {'email':email, 'password':password, 'verifyPassword':confirmPassword}));

    if(signup.success){
      location.href = 'profile.php';
    } else {
      signupMsg.style.display = 'block';
      signupMsg.innerText = signup.message;
      e.target.password.value = '';
      e.target.confirmPassword.value = '';
    }

    // return false;

  }

  // signupForm_signup.onclick = async function(){
  //
  //   let email = signupForm_email.value;
  //   let password = signupForm_password.value;
  //   let verifyPassword = signupForm_verifyPassword.value;
  //
  //   if(password!=verifyPassword){
  //     alert('Hesla se neshodují!');
  //     return;
  //   }
  //
  //   let signup = JSON.parse(await POST('api/signup.php', {'email':email, 'password':password, 'verifyPassword':verifyPassword}));
  //
  //   if(signup.success){
  //     location.href = 'profile.php';
  //   } else {
  //     alert(signup.message);
  //   }
  //
  // }

  // let sidebar = document.querySelector('#sidebar');
  // let signupBtn = document.querySelector('#signupBtn');
  // let loginBtn = document.querySelector('#loginBtn');
  //
  // let loginForm = document.querySelector('#loginForm');
  // let loginClose = document.querySelector('#loginForm_close');
  // let loginEmail = document.querySelector('#loginForm_email');
  // let loginPassword = document.querySelector('#loginForm_password');
  // let loginSubmit = document.querySelector('#loginForm_login');
  //
  // let signupForm = document.querySelector('#signupForm');
  // let signupClose = document.querySelector('#signupForm_close');
  // let signupEmail = document.querySelector('#signupForm_email');
  // let signupPassword = document.querySelector('#signupForm_password');
  // let signupVerifyPassword = document.querySelector('#signupForm_verifyPassword');
  // let signupSubmit = document.querySelector('#signupForm_signup');
  //
  // loginBtn.onclick = function(){
  //   sidebar.style.display = 'none';
  //   loginForm.style.display = 'block';
  // }

  signupBtn.onclick = function(){
    sidebar.style.display = 'none';
    signupDialog.style.display = 'block';
  }

  signupForm_close.onclick = function(){
    signupDialog.style.display = 'none';
    sidebar.style.display = 'block';
  }

  // loginSubmit.onclick = async function(){
  //
  //   let email = loginEmail.value;
  //   let password = loginPassword.value;
  //
  //   let auth = JSON.parse(await POST('api/auth.php', {'email':email, 'password':password}));
  //
  //   if(auth.loggedIn){
  //     location.href = 'profile.php';
  //   } else {
  //     alert(auth.message);
  //   }
  //
  // }

  // loginClose.onclick = function(){
  //   loginForm.style.display = 'none';
  //   sidebar.style.display = 'block';
  // }

}
