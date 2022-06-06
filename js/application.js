/** General application stuff, not directly related to any particular page **/

let dialogDefs = {};
let dialogs = []; // list of all open dialogs
let tooltip; // currently shown tooltip
let loading; // loading overlay
let scripts = []; // included scripts
let stylesheets = []; // included stylesheets
/** authentication data **/
let auth;

/** returns whether currently logged in user's role level is at least the specified one **/
function checkRole(roleName){
  let roleNames = ['disabled', 'viewer', 'contributor', 'editor', 'admin'];
  let requested = roleNames.indexOf(roleName);
  let actual = roleNames.indexOf(auth.user.userRole);
  return actual>=requested;
}

/** connects to the server to check whether the user is authenticated - if not, error is thrown and user is redirected to login screen **/
async function checkAuth(){
  auth = JSON.parse(await GET('api/user/auth.php'));
  if(!auth.loggedIn){
    location.href = 'index.php?reauth';
    throw new Error('Not authenticated!');
  }
  return true;
}

function showLoading(){
  if(loading) return;
  loading = document.createElement('div');
  loading.className = 'loading';
  loading.innerHTML = '<div class="loadingBox"><img src="res/loading.gif"></img> Načítání</div>';
  document.body.appendChild(loading);
}

function hideLoading(){
  if(!loading) return;
  document.body.removeChild(loading);
  loading = null;
}

function showTooltip(x, y, msg){
  if(tooltip){
    tooltip.innerText = msg;
    tooltip.style.left = x+'px';
    tooltip.style.top = y+'px';
  } else {
    tooltip = document.createElement('div');
    tooltip.className = 'tooltip';
    tooltip.innerText = msg;
    tooltip.style.left = x+'px';
    tooltip.style.top = y+'px';
    document.body.appendChild(tooltip);
  }
}

function hideTooltip(){
  if(!tooltip) return;
  document.body.removeChild(tooltip);
  tooltip = null;
}

function hideDialogs(){
  for(let dialog in dialogs){
    dialogs[dialog].hide();
  }
}

// TODO make a dialog manager? or keep here?
function registerDialog(name, create, script, stylesheet){
  dialogDefs[name] = {
    create: create,
    script: script,
    stylesheet: stylesheet,
  };
}

async function showDialog(name, ...args){
  
  if(dialogs[name]) return;

  let dialogDef = dialogDefs[name];
  if(dialogDef.script) await requireJS(dialogDef.script);
  if(dialogDef.stylesheet) await requireCSS(dialogDef.stylesheet);
  let dialog = await dialogDef.create(args);
  document.body.appendChild(dialog);
  dialogs[name] = dialog;
  dialog.hide = function(){
    if(dialog.onHide) dialog.onHide();
    document.body.removeChild(dialog);
    delete dialogs[name];
  }

  let closeBtn = dialog.querySelector('*[dialog-close]');
  if(closeBtn){
    closeBtn.onclick = function(){
      dialog.hide();
    }
  }

  // if(dialog.onInit) dialog.onInit(); // TODO make this async?
  if(dialog.onInit){
    showLoading();
    if(dialog.onInit.constructor.name=='AsyncFunction') await dialog.onInit();
    else dialog.onInit();
    hideLoading();
  }

}

function requireJS(src){
  return new Promise((resolve, reject)=>{
    if(scripts.indexOf(src)>=0) {
      resolve();
      return;
    }
    console.log('loading', src);
    scripts.push(src);
    let script = document.createElement('script');
    script.src = src;
    script.onload = function(){
      resolve();
    }
    script.onerror = function(){
      reject();
    }
    document.head.appendChild(script);
  });
}

function requireCSS(src){
  return new Promise((resolve, reject)=>{
    if(stylesheets.indexOf(src)>=0) {
      resolve();
      return;
    }
    console.log('loading', src);
    stylesheets.push(src);
    let stylesheet = document.createElement('link');
    stylesheet.rel = 'stylesheet';
    stylesheet.href = src;
    stylesheet.onload = function(){
      resolve();
    }
    stylesheet.onerror = function(){
      reject();
    }
    document.head.appendChild(stylesheet);
  });
  
}

window.onfocus = async function(){
  await checkAuth();
}

// window.ononline = async function(){
//   console.log('connection restored - refreshing');
//   offline = false;
//   if(focused){
//     await checkAuth();
//     await refresh();
//   } else {
//     connectionRestored = true;
//   }
// }
