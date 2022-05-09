/** Application stuff, not related to profile directly **/

let dialogDefs = {};
let dialogs = []; // list of all open dialogs
let tooltip; // currently shown tooltip
let loading; // loading overlay
let scripts = []; // included scripts
let stylesheets = []; // included stylesheets

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
  await requireJS(dialogDef.script);
  await requireCSS(dialogDef.stylesheet);
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

  if(dialog.onInit) dialog.onInit();

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
