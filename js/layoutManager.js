
let LayoutManager = new (function(){

  let replacements = {};

  this.registerInput = function(selector, createFunction, script, stylesheet){
    replacements[selector] = {
      script: script,
      stylesheet: stylesheet,
      create: createFunction,
    };
  }

  let layouts = {};

  async function processElement(base, element){

    let replacement = null;

    for(let selector in replacements){
      if(element.matches(selector)){
        let replacementInfo = replacements[selector];
        await requireJS(replacementInfo.script);
        await requireCSS(replacementInfo.stylesheet);
        replacement = await replacementInfo.create();
        element.replaceWith(replacement);
      }
    }

    if(replacement){

      replacement.base = base;

      if(element.hasAttribute('layout-id')){
        base.elements[element.getAttribute('layout-id')] = replacement;
      }

      for(let attrib of element.attributes){
        replacement.setAttribute(attrib.name, attrib.value);
      }

    } else {

      element.base = base;

      if(element.hasAttribute('tooltip')){
        element.onmousemove = function(e){
          showTooltip(e.clientX+5, e.clientY+5, element.getAttribute('tooltip'));
        }
        element.onmouseout = function(){
          hideTooltip();
        }
      }

      if(element.hasAttribute('layout-id')){
        base.elements[element.getAttribute('layout-id')] = element;
      }

      if(element.tagName=='INPUT' || element.tagName=='TEXTAREA'){

        element.oninput = function(){ // TODO use addEventListener instead? (to avoid overriding)
          if(element.getError()) {
            element.classList.add('invalid');
          } else {
            element.classList.remove('invalid');
          }
        }
        element.getValue = function(){
          if(element.getError()) return null;
          if(!element.hasAttribute('required') && !element.value.trim()) return null;
          if(element.getAttribute('type')=='int') return +element.value;
          return element.value.trim();
        }
        element.getError = function(){
          // TODO what if layout-display is not defined?
          let name = element.getAttribute('layout-display')??'';
          if(element.validity.badInput) return 'Neplatný formát pole '+name+'!';
          if(element.hasAttribute('required') && !element.value.trim()) return 'Prosím vyplňte pole '+name+'!';
          if(element.hasAttribute('maxlength')){
            if(element.value.trim().length>element.getAttribute('maxlength')) return 'Hodnota pole '+name+' je příliš dlouhá!';
          }
          if(element.getAttribute('type')=='int' || element.getAttribute('type')=='number'){
            if(element.value) {
              if(parseInt(element.value)!=element.value) return toFirstUpper(name)+' musí být celé číslo!';
              if(element.hasAttribute('min') && +element.value<+element.getAttribute('min')) return toFirstUpper(name)+' musí být nejméně '+element.getAttribute('min')+'!';
              if(element.hasAttribute('max') && +element.value>+element.getAttribute('max')) return toFirstUpper(name)+' musí být nejvíce '+element.getAttribute('max')+'!';
            }
          }
          return null;
        }
        element.setInvalid = function(){
          element.classList.add('invalid');
        }
        element.focusInput = function(){
          element.focus();
        }

      } else if(element.tagName=='FORM') {

        element.showError = function(msg, el){
          let formError = base.elements[element.getAttribute('layout-error')];
          if(!formError) return;
          formError.classList.add('show');
          formError.innerText = msg;
          formError.scrollIntoView();
          if(el){
            if(el.setInvalid) el.setInvalid();
            if(el.focusInput) el.focusInput();
          }
        }
    
        // TODO move this to input.getValue() ?
        element.getValue = function(el){
          if(el.getError())
              throw {
                message: el.getError(),
                element: el
              };
          return el.getValue();
        }
    
        element.noValidate = true;
    
        element.onsubmit = async function(ev){ // TODO use addEventListener? (maybe not here)
          ev.preventDefault();
          if(element.submitted) return;
          element.submitted = true;
          showLoading();
          try {
            await element.submitForm();
          } catch(e){
            if(element.onSubmitFail) element.onSubmitFail(e);
            element.showError(e.message, e.element);
            console.error('Error thrown in form:', e);
          }
          element.submitted = false;
          hideLoading();
        }

        element.oninput = function(e){ // TODO use addEventListener?
          let formError = base.elements[element.getAttribute('layout-error')];
          if(!formError) return;
          formError.classList.remove('show');
        }
        
        base.addEventListener('click', function(){
          let formError = base.elements[element.getAttribute('layout-error')];
          if(!formError) return;
          formError.classList.remove('show');
        });

      }

      for(let e of element.children){
        await processElement(base, e);
      }

    }

  }

  this.getRawLayout = async function(src){

    if(!layouts[src]){
      layouts[src] = await GET(src);
    }

    if(!layouts[src]) throw new Error('Failed to load layout: '+src);

    let div = document.createElement('div');
    div.innerHTML = layouts[src];

    return div;

  }

  this.getLayout = async function(src){

    let div = await this.getRawLayout(src);

    div.elements = [];

    for(let element of div.children){
      await processElement(div, element);
    }

    return div;

  }

})();
