
async function createDateInput(){

  let div = await LayoutManager.getRawLayout('layouts/dateInput.html');
  div.classList.add('dateInputWrapper');

  let day = div.querySelector('.dateDay');
  let month = div.querySelector('.dateMonth');
  let year = div.querySelector('.dateYear');

  day.oninput = function(e){
    div.classList.remove('invalid');
    // if(!checkDay()) day.classList.add('invalid');
    // else day.classList.remove('invalid');
    // if(day.value.toString().length>2){
    //   day.value = day.value.substring(0, 2);
    // }
    if(day.value.toString().length>=2){
      month.focus();
      month.select();
    }
  }

  month.oninput = function(e){
    div.classList.remove('invalid');
    // if(!checkMonth()) month.classList.add('invalid');
    // else month.classList.remove('invalid');
    if(month.value.toString().length>=2){
      year.focus();
      year.select();
    }
  }

  year.oninput = function(e){
    div.classList.remove('invalid');
    // if(!checkYear()) year.classList.add('invalid');
    // else year.classList.remove('invalid');
  }

  div.setInvalid = function(){
    div.classList.add('invalid');
  }

  div.focusInput = function(){
    day.focus();
    day.select();
  }

  div.setValue = function(date){
    let dateObj = new Date(date);
    if(!dateObj.getTime()) return;
    day.value = dateObj.getDate().toString().padStart(2, '0');
    month.value = (dateObj.getMonth()+1).toString().padStart(2, '0');
    year.value = dateObj.getFullYear();
  }

  function getDateObj(){
    if(!year.value || !month.value){
      return null;
    }
    let dateObj = new Date((+year.value)+'-'+(+month.value)+'-'+(day.value ? +day.value : '01'));
    if(!day.value) {
      dateObj.setMonth(dateObj.getMonth()+1);
      dateObj.setDate(0);
    }
    return dateObj;
  }

  // function checkDay(){
  //   if(!day.value) return true;
  //   if(parseInt(day.value)!=day.value) return false;
  //   if(day.value && (day.value<1 || day.value>31)) return false;
  //   return true;
  // }

  // function checkMonth(){
  //   if(!month.value) return true;
  //   if(parseInt(month.value)!=month.value) return false;
  //   if(month.value<1 || month.value>12) return false;
  //   return true;
  // }

  // function checkYear(){
  //   if(!year.value) return true;
  //   if(parseInt(year.value)!=year.value) return false;
  //   if(year.value<1901 || year.value>3000) return false;
  //   return true;
  // }

  div.getError = function(){

    let name = div.getAttribute('layout-display')??'';

    let required = false;

    // if nothing is entered - fail if required, otherwise no error
    if(!year.value && !month.value && !day.value) {
      if(required) return 'Prosím vyplňte '+name+'!';
      return null;
    }
    
    // check both month and year are entered
    if(!year.value || !month.value) return toFirstUpper(name)+': prosím zadejte celé datum!';
    // make sure values are integers
    if(day.value && parseInt(day.value)!=day.value) return toFirstUpper(name)+': neplatná hodnota (den)';
    if(parseInt(month.value)!=month.value) return toFirstUpper(name)+': neplatná hodnota (měsíc)';
    if(parseInt(year.value)!=year.value) return toFirstUpper(name)+': neplatná hodnota (rok)';
    // make sure values are in correct range
    if(day.value && (day.value<1 || day.value>31)) return toFirstUpper(name)+': hodnota mimo rozsah (den)';
    if(month.value<1 || month.value>12) return toFirstUpper(name)+': hodnota mimo rozsah (měsíc)';
    if(year.value<1901 || year.value>3000) return toFirstUpper(name)+': hodnota mimo rozsah (rok)';

    let date = new Date((+year.value)+'-'+(+month.value)+'-'+(day.value ? +day.value : '01'));
    
    // make sure date is actually valid (new Date())
    if(!date.getTime()){
      return 'Unexpected error: getTime() returned false'; // can this happen? (should not)
    }

    // make sure day is in month's range
    if((date.getMonth()+1) != month.value) return toFirstUpper(name)+': den mimo rozsah měsíce!';

    if(div.hasAttribute('futureDate')){
      let dateObj = getDateObj();
      if(dateObj && !(dateObj>new Date())){
        return toFirstUpper(name)+' musí být později než dnes!';
      }
    }

    return null;
  }

  div.getValue = function(){
    if(div.getError()) return null;
    let dateObj = getDateObj();
    if(!dateObj) return null;
    return dateObj.getFullYear()+'-'+(dateObj.getMonth()+1).toString().padStart(2, '0')+'-'+dateObj.getDate().toString().padStart(2, '0');
  }

  return div;

}
