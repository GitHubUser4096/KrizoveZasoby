
let COUNTER_HOLD_TIME = 400;
let COUNTER_STEP_TIME = 400;

async function createCounter(){

  let div = await LayoutManager.getRawLayout('layouts/counter.html');
  div.classList.add('counterWrapper');

  let decrementBtn = div.querySelector('.decrementBtn');
  let counterValue = div.querySelector('.counterValue');
  let incrementBtn = div.querySelector('.incrementBtn');

  function getMin(){
    let min = div.getAttribute('min');
    min = min ? +min : -Infinity;
    return min;
  }

  function getMax(){
    let max = div.getAttribute('max');
    max = max ? +max : +Infinity;
    return max;
  }

  function isRequired(){
    return div.hasAttribute('required');
  }

  function decrement(){
    counterValue.value = Math.floor(+counterValue.value-1);
    if(isNaN(counterValue.value)) counterValue.value = 0;
  }

  function increment(){
    counterValue.value = Math.floor(+counterValue.value+1);
    if(isNaN(counterValue.value)) counterValue.value = 0;
  }

  counterValue.oninput = function(e){
    if(div.getError()) counterValue.classList.add('invalid');
    else counterValue.classList.remove('invalid');
  }

  decrementBtn.onmousedown = function(e){
    decrementBtn.held = false;
    let hold = div.getAttribute('hold');
    if(hold=='none') return;
    decrementBtn.holdTimeout = setTimeout(function(){
      decrementBtn.held = true;
      counterValue.classList.remove('invalid');
      if(hold=='jump'){
        if(div.hasAttribute('min')) counterValue.value = getMin();
      } else {
        if(counterValue.value<getMin()) counterValue.value = getMin();
        if(counterValue.value>getMax()) counterValue.value = getMax();
        decrementBtn.stepInterval = setInterval(function(){
          decrement();
          if(+counterValue.value<=+getMin()){
            counterValue.value = getMin();
            clearInterval(decrementBtn.stepInterval);
          }
        }, COUNTER_STEP_TIME);
      }
    }, COUNTER_HOLD_TIME);
  }

  decrementBtn.onmouseup = decrementBtn.onmouseleave = function(e){
    if(decrementBtn.holdTimeout) clearTimeout(decrementBtn.holdTimeout);
    decrementBtn.holdTimeout = null;
    if(decrementBtn.stepInterval) clearInterval(decrementBtn.stepInterval);
    decrementBtn.stepInterval = null;
  }

  incrementBtn.onmousedown = function(e){
    incrementBtn.held = false;
    let hold = div.getAttribute('hold');
    if(hold=='none') return;
    incrementBtn.holdTimeout = setTimeout(function(){
      incrementBtn.held = true;
      counterValue.classList.remove('invalid');
      if(hold=='jump'){
        if(div.hasAttribute('max')) counterValue.value = getMax();
      } else {
        if(counterValue.value<getMin()) counterValue.value = getMin();
        if(counterValue.value>getMax()) counterValue.value = getMax();
        incrementBtn.stepInterval = setInterval(function(){
          increment();
          if(+counterValue.value>=+getMax()){
            counterValue.value = getMax();
            clearInterval(incrementBtn.stepInterval);
          }
        }, COUNTER_STEP_TIME);
      }
    }, COUNTER_HOLD_TIME);
  }

  incrementBtn.onmouseup = incrementBtn.onmouseleave = function(e){
    if(incrementBtn.holdTimeout) clearTimeout(incrementBtn.holdTimeout);
    incrementBtn.holdTimeout = null;
    if(incrementBtn.stepInterval) clearInterval(incrementBtn.stepInterval);
    incrementBtn.stepInterval = null;
  }

  decrementBtn.onclick = function(){
    if(decrementBtn.held) return;
    decrement();
    if(+counterValue.value<+getMin()) counterValue.value = getMin();
    if(+counterValue.value>+getMax()) counterValue.value = getMax();
    counterValue.classList.remove('invalid');
  }

  incrementBtn.onclick = function(){
    if(incrementBtn.held) return;
    increment();
    if(+counterValue.value<+getMin()) counterValue.value = getMin();
    if(+counterValue.value>+getMax()) counterValue.value = getMax();
    counterValue.classList.remove('invalid');
  }

  function checkMinMax(){
    if(getMin()==getMax()){
      counterValue.disabled = true;
      div.classList.add('disabled');
    } else {
      counterValue.disabled = false;
      div.classList.remove('disabled');
    }
  }

  div.setMin = function(newMin){
    if(newMin>getMax()) return;
    div.setAttribute('min', newMin);
    checkMinMax();
  }

  div.setMax = function(newMax){
    if(newMax<getMin()) return;
    div.setAttribute('max', newMax);
    checkMinMax();
  }

  div.setRequired = function(required){
    if(required) div.setAttribute('required', '');
    else div.removeAttribute('required');
  }

  div.setValue = function(value){
    if(parseInt(value)!=value) return;
    if(!value && isRequired()) return;
    if(value<getMin() || value>getMax()) return;
    counterValue.value = value;
  }
  
  div.focusInput = function(){
    counterValue.focus();
  }

  div.setInvalid = function(){
    counterValue.classList.add('invalid');
  }

  div.getError = function(){
    let name = div.getAttribute('layout-display')??'';
    if(!counterValue.value){
      if(isRequired()) return 'Prosím vyplňte '+name+'!';
      return null;
    }
    if(parseInt(counterValue.value)!=counterValue.value) return toFirstUpper(name)+' musí být celé číslo!';
    if(+counterValue.value<getMin()) return toFirstUpper(name)+' musí být nejméně '+getMin()+'!';
    if(+counterValue.value>getMax()) return toFirstUpper(name)+' musí být nejvíce '+getMax()+'!';
    return null;
  }

  div.getValue = function(){
    if(div.getError()) return null;
    return +counterValue.value;
  }

  return div;

}
