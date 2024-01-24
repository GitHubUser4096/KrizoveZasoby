
// TODO organize this, lots of code can be reused

window.onload = function(){

  let sidebar = document.querySelector('#sidebar');

  let params = new URLSearchParams(location.search);

  if(params.has('reauth')){
    // sidebar.style.display = 'none';
    // loginDialog.style.display = 'block';
    loginMsg.style.display = 'block';
    loginMsg.innerText = 'Prosím přihlašte se znovu pro pokračování';
  } else if(params.has('resetPassword')){
    sidebar.style.display = 'none';
    resetPasswordDialog.style.display = 'block';
    resetPasswordForm.email.value = params.get('email')??'';
    resetPasswordForm.code.value = params.get('code')??'';
  }

  loginBtn.onclick = async function(){
    
    // sidebar.style.display = 'none';

    // let auth;
    // try {
    //   auth = JSON.parse(await GET('api/user/auth.php'));
    // } catch(e){
    //   alert(e.message);
    //   sidebar.style.display = 'block';
    // }

    // if(auth.loggedIn){
    //   location.href = 'profile.php';
    //   return;
    // }

    // main.style.display = 'none';
    main.classList.add('mobileHidden');
    // loginDialog.style.display = 'block';
    loginDialog.classList.remove('mobileHidden');

  }

  loginForm_close.onclick = function(){
    // loginDialog.style.display = 'none';
    // sidebar.style.display = 'block';
    // window.history.replaceState('', '', '?');
    loginDialog.classList.add('mobileHidden');
    main.classList.remove('mobileHidden');
    loginDialog.style.display = null;
  }

  loginForm.oninput = function(e){
    e.target.classList.remove('error');
    loginMsg.style.display = 'none';
  }

  forgotPasswordForm.oninput = function(e){
    e.target.classList.remove('error');
    forgotPasswordMsg.style.display = 'none';
  }

  resetPasswordForm.oninput = function(e){
    e.target.classList.remove('error');
    resetPasswordMsg.style.display = 'none';
  }

  loginForm.forgotPassword.onclick = function(){
    loginDialog.style.display = 'none';
    forgotPasswordDialog.style.display = 'block';
    main.classList.add('mobileHidden');
  }

  loginForm.signup.onclick = function(){
    loginDialog.style.display = 'none';
    signupDialog.style.display = 'block';
    main.classList.add('mobileHidden');
  }

  forgotPasswordForm_close.onclick = function(){
    loginDialog.style.display = 'block';
    forgotPasswordDialog.style.display = 'none';
  }

  resetPasswordForm_close.onclick = function(){
    forgotPasswordDialog.style.display = 'block';
    resetPasswordDialog.style.display = 'none';
  }

  forgotPasswordForm.onsubmit = async function(e){

    e.preventDefault();

    // if(forgotPasswordForm.submitted) return;

    if(!forgotPasswordForm.email.value){
      forgotPasswordMsg.style.background = 'red';
      forgotPasswordMsg.style.color = 'white';
      forgotPasswordMsg.style.display = 'block';
      forgotPasswordMsg.innerText = 'Prosím zadejte e-mail!';
      forgotPasswordForm.email.focus();
      forgotPasswordForm.email.classList.add('error');
      return;
    }

    // forgotPasswordForm.submitted = true;

    // forgotPasswordMsg.style.background = 'var(--foreground)';
    // forgotPasswordMsg.style.color = 'black';
    // forgotPasswordMsg.style.display = 'block';
    // forgotPasswordMsg.innerText = 'Počkejte prosím...';

    (async function(){
      try {
        await POST('api/user/requestPasswordReset.php', {
          email: forgotPasswordForm.email.value,
        });
      } catch(e){
        alert(e.message);
        forgotPasswordDialog.style.display = 'block';
        resetPasswordDialog.style.display = 'none';
      }
    })();

    resetPasswordForm.email.value = forgotPasswordForm.email.value;

    forgotPasswordDialog.style.display = 'none';
    resetPasswordDialog.style.display = 'block';

  }

  resetPasswordForm.onsubmit = async function(e){

    e.preventDefault();

    if(resetPasswordForm.submitted) return;

    // if(!resetPasswordForm.email.value){
    //   resetPasswordMsg.style.background = 'red';
    //   resetPasswordMsg.style.color = 'white';
    //   resetPasswordMsg.style.display = 'block';
    //   resetPasswordMsg.innerText = 'Prosím zadejte e-mail!';
    //   resetPasswordForm.email.focus();
    //   resetPasswordForm.email.classList.add('error');
    //   return;
    // }

    if(!resetPasswordForm.code.value){
      resetPasswordMsg.style.background = 'red';
      resetPasswordMsg.style.color = 'white';
      resetPasswordMsg.style.display = 'block';
      resetPasswordMsg.innerText = 'Prosím zadejte kód!';
      resetPasswordForm.code.focus();
      resetPasswordForm.code.classList.add('error');
      return;
    }

    if(!resetPasswordForm.newPassword.value){
      resetPasswordMsg.style.background = 'red';
      resetPasswordMsg.style.color = 'white';
      resetPasswordMsg.style.display = 'block';
      resetPasswordMsg.innerText = 'Prosím zadejte nové heslo!';
      resetPasswordForm.newPassword.focus();
      resetPasswordForm.newPassword.classList.add('error');
      return;
    }

    if(!resetPasswordForm.confirmPassword.value){
      resetPasswordMsg.style.background = 'red';
      resetPasswordMsg.style.color = 'white';
      resetPasswordMsg.style.display = 'block';
      resetPasswordMsg.innerText = 'Prosím zadejte ověření hesla!';
      resetPasswordForm.confirmPassword.focus();
      resetPasswordForm.confirmPassword.classList.add('error');
      return;
    }

    if(resetPasswordForm.newPassword.value!=resetPasswordForm.confirmPassword.value){
      resetPasswordMsg.style.background = 'red';
      resetPasswordMsg.style.color = 'white';
      resetPasswordMsg.style.display = 'block';
      resetPasswordMsg.innerText = 'Hesla se neshodují!';
      resetPasswordForm.newPassword.value = '';
      resetPasswordForm.confirmPassword.value = '';
      resetPasswordForm.newPassword.classList.add('error');
      resetPasswordForm.confirmPassword.classList.add('error');
      return;
    }

    resetPasswordMsg.style.background = 'var(--foreground)';
    resetPasswordMsg.style.color = 'black';
    resetPasswordMsg.innerText = 'Přihlašování...';
    resetPasswordMsg.style.display = 'block';

    resetPasswordForm.submitted = true;

    try {

      await POST('api/user/resetPassword.php', {
        email: resetPasswordForm.email.value,
        code: resetPasswordForm.code.value,
        password: resetPasswordForm.newPassword.value,
      });

      location.href = 'profile.php';

    } catch(ex){
      resetPasswordForm.submitted = false;
      resetPasswordMsg.style.background = 'red';
      resetPasswordMsg.style.color = 'white';
      resetPasswordMsg.style.display = 'block';
      resetPasswordMsg.innerText = ex.message;
      resetPasswordForm.newPassword.value = '';
      resetPasswordForm.confirmPassword.value = '';
    }

  }

  loginForm.onsubmit = async function(e){

    e.preventDefault();

    if(loginForm.submitted) return;

    let email = e.target.email.value;
    let password = e.target.password.value;

    if(!email){
      loginMsg.style.background = 'red';
      loginMsg.style.color = 'white';
      loginForm.email.classList.add('error');
      loginForm.email.focus();
      loginMsg.style.display = 'block';
      loginMsg.innerText = 'Prosím zadejte email!';
      return;
    }

    if(!password){
      loginMsg.style.background = 'red';
      loginMsg.style.color = 'white';
      loginForm.password.classList.add('error');
      loginForm.password.focus();
      loginMsg.style.display = 'block';
      loginMsg.innerText = 'Prosím zadejte heslo!';
      return;
    }

    loginMsg.style.background = 'var(--foreground)';
    loginMsg.style.color = 'black';
    loginMsg.innerText = 'Přihlašování...';
    loginMsg.style.display = 'block';

    loginForm.submitted = true;

    let auth;
    try {
      auth = JSON.parse(await POST('api/user/auth.php', {'email':email, 'password':password}));
    } catch(e){
      loginForm.submitted = false;
      loginMsg.style.background = 'red';
      loginMsg.style.color = 'white';
      loginMsg.style.display = 'block';
      loginMsg.innerText = e.message;
      loginForm.password.value = '';
      return;
    }

    if(auth.loggedIn){
      if(auth.user.userRole=='disabled'){
        loginForm.submitted = false;
        loginMsg.style.background = 'red';
        loginMsg.style.color = 'white';
        loginMsg.style.display = 'block';
        loginMsg.innerText = 'Váš účet byl zablokován administrátorem';
        return;
      }
      location.href = 'profile.php';
    } else {
      loginForm.submitted = false;
      loginMsg.style.background = 'red';
      loginMsg.style.color = 'white';
      loginMsg.style.display = 'block';
      loginMsg.innerText = 'Unexpected error: auth successful but loggedIn!=true';
    }
    
  }

  signupForm.oninput = function(e){
    e.target.classList.remove('error');
    signupMsg.style.display = 'none';
  }

  signupForm.onsubmit = async function(e){

    e.preventDefault();

    if(signupForm.submitted) return;

    let email = e.target.email.value;
    let password = e.target.password.value;
    let confirmPassword = e.target.confirmPassword.value;

    if(!email){ // TODO check it is an email
      signupForm.email.classList.add('error');
      signupForm.email.focus();
      signupMsg.style.background = 'red';
      signupMsg.style.color = 'white';
      signupMsg.style.display = 'block';
      signupMsg.innerText = 'Prosím zadejte email!';
      return;
    }

    if(!password){
      signupForm.password.classList.add('error');
      signupForm.password.focus();
      signupMsg.style.background = 'red';
      signupMsg.style.color = 'white';
      signupMsg.style.display = 'block';
      signupMsg.innerText = 'Prosím zadejte heslo!';
      return;
    }

    if(!confirmPassword){
      signupForm.confirmPassword.classList.add('error');
      signupForm.confirmPassword.focus();
      signupMsg.style.background = 'red';
      signupMsg.style.color = 'white';
      signupMsg.style.display = 'block';
      signupMsg.innerText = 'Prosím zadejte ověření hesla!';
      return;
    }

    if(password!=confirmPassword){
      signupForm.password.classList.add('error');
      signupForm.confirmPassword.classList.add('error');
      signupMsg.style.background = 'red';
      signupMsg.style.color = 'white';
      signupMsg.style.display = 'block';
      signupMsg.innerText = 'Hesla se neshodují!';
      signupForm.password.value = '';
      signupForm.confirmPassword.value = '';
      return;
    }

    signupMsg.style.background = 'var(--foreground)';
    signupMsg.style.color = 'black';
    signupMsg.innerText = 'Počkejte prosím...';
    signupMsg.style.display = 'block';

    signupForm.submitted = true;

    let signup;

    try {
      signup = JSON.parse(await POST('api/user/signup.php', {'email':email, 'password':password}));
    } catch(e){
      signupForm.submitted = false;
      signupMsg.style.background = 'red';
      signupMsg.style.color = 'white';
      signupMsg.style.display = 'block';
      signupMsg.innerText = e.message;
      signupForm.password.value = '';
      signupForm.confirmPassword.value = '';
      return;
    }

    if(signup.success){
      location.href = 'profile.php';
    }

  }

  // signupBtn.onclick = function(){
  //   sidebar.style.display = 'none';
  //   signupDialog.style.display = 'block';
  // }

  signupForm_close.onclick = function(){
    signupDialog.style.display = 'none';
    // sidebar.style.display = 'block';
    loginDialog.style.display = 'block';
  }

  closeCookieMsg.onclick = function(){
    cookieMsg.style.display = 'none';
  }

  if(navigator.userAgent.toLowerCase().indexOf('android')>=0){
    mobileScreen.style.display = 'block';
  }

  mobileClose.onclick = function(){
    mobileScreen.style.display = 'none';
  }

}
