
// TODO name is not accurate?
async function createRegisterCharityDialog(charity){

  // TODO title and buttons still say register even if editing

  let placeCounter = 1;

  function getPlaceCounter(){
    let res = placeCounter;
    placeCounter++;
    return res;
  }

  let div = await LayoutManager.getLayout('layouts/registerCharity.html');
  div.className = 'registerCharityDialog';

  div.onInit = async function(){

    // addContact();

    if(charity){

      div.elements.title.innerText = 'Upravit charitu';
      
      div.elements.name.value = charity.name;
      div.elements.orgId.value = charity.orgId;
      div.elements.contacts.value = charity.contacts;

      for(let place of charity.places){

        let placeDiv = await addPlace();

        placeDiv.id = place.id;
        placeDiv.elements.street.value = place.street;
        placeDiv.elements.place.value = place.place;
        placeDiv.elements.postCode.value = place.postCode;
        placeDiv.elements.note.value = place.note;
        placeDiv.elements.openHours.value = place.openHours;
        placeDiv.elements.contacts.value = place.contacts;

        placeDiv.updateName();

      }

    } else {
      addPlace();
    }

  }

  div.elements.form.submitForm = async function(){

    // console.log(getPlaces());

    let name = div.elements.form.getValue(div.elements.name);
    let orgId = div.elements.form.getValue(div.elements.orgId);
    let contacts = div.elements.form.getValue(div.elements.contacts);
    let places = await getPlaces();
    // let contacts = getContacts();

    if(places===false) return;

    if(!places.length) throw new Error('Prosím přidejte alespoň jedno místo!');
    // if(!contacts.length) throw new Error('Prosím přidejte alespoň jeden kontakt!');

    // let openHours = div.elements.form.getValue(div.elements.openHours);

    // console.log(places);
    // console.log(contacts);

    // await POST('api/charity/registerCharity.php', {
    //   data: JSON.stringify({
    //     name: name,
    //     places: places,
    //     contacts: contacts,
    //     openHours: openHours,
    //   }),
    // });

    if(charity){
      await POST('api/charity/registerCharity.php?charityId='+charity.id, {
        data: JSON.stringify({
          name: name,
          orgId: orgId,
          contacts: contacts,
          places: places,
        }),
      });
    } else {
      await POST('api/charity/registerCharity.php', {
        data: JSON.stringify({
          name: name,
          orgId: orgId,
          contacts: contacts,
          places: places,
        }),
      });
      alert('Charita byla zaregistrována. Prosím počkejte na schválení admministátorem.');
    }

    div.hide();
    await refresh();

  }

  div.elements.form.onSubmitFail = function(e){

    if(e.element && e.element.base && e.element.base.tabBtn){
      e.element.base.tabBtn.select();
    }

  }

  async function addPlace(){

    let tabBtn = document.createElement('button');
    let placeDiv = await LayoutManager.getLayout('layouts/registerCharityPlace.html');

    tabBtn.placeDiv = placeDiv;
    placeDiv.tabBtn = tabBtn;

    let placeholderName = 'Místo '+getPlaceCounter();

    function setName(name){
      placeDiv.elements.placeName.innerText = name;
      tabBtn.innerText = name;
    }

    updateName();
    tabBtn.type = 'button';
    tabBtn.className = 'placeTabBtn';

    tabBtn.select = function(){
      div.elements.placeContent.innerText = '';
      div.elements.placeContent.appendChild(placeDiv);
      for(let tab of div.elements.placeTabs.children){
        if(tab==tabBtn){
          tab.classList.add('selected');
        } else {
          tab.classList.remove('selected');
        }
      }
    }

    tabBtn.onclick = function(){
      tabBtn.select();
    }

    placeDiv.elements.removeBtn.onclick = function(){
      div.elements.placeTabs.removeChild(tabBtn);
      div.elements.placeContent.innerText = '';
      if(div.elements.placeTabs.children.length>0){
        div.elements.placeTabs.children[div.elements.placeTabs.children.length-1].select();
      }
    }

    function updateName(){
      if(!placeDiv.elements.street.value && !placeDiv.elements.place.value){
        setName(placeholderName);
      } else if(placeDiv.elements.street.value && placeDiv.elements.place.value) {
        setName(placeDiv.elements.street.value+', '+placeDiv.elements.place.value);
      } else {
        setName(placeDiv.elements.street.value || placeDiv.elements.place.value);
      }
    }

    placeDiv.updateName = updateName;

    placeDiv.elements.street.oninput = function(){
      updateName();
    }

    placeDiv.elements.place.oninput = function(){
      updateName();
    }

    div.elements.placeTabs.appendChild(tabBtn);

    // div.elements.placeContent.innerText = '';
    // div.elements.placeContent.appendChild(placeDiv);

    tabBtn.select();

    return placeDiv;

  }

  async function getPlaces(){

    let places = [];

    for(let placeTab of div.elements.placeTabs.children){
      
      let street = div.elements.form.getValue(placeTab.placeDiv.elements.street);
      let place = div.elements.form.getValue(placeTab.placeDiv.elements.place);
      let postCode = div.elements.form.getValue(placeTab.placeDiv.elements.postCode);
      let note = div.elements.form.getValue(placeTab.placeDiv.elements.note);
      let openHours = div.elements.form.getValue(placeTab.placeDiv.elements.openHours);
      let contacts = div.elements.form.getValue(placeTab.placeDiv.elements.contacts);

      let geocode = JSON.parse(await GET('https://nominatim.openstreetmap.org/search?q='+encodeURIComponent(street+', '+postCode+', Česká Republika')+'&format=json&limit=1'));

      let latitude = null;
      let longitude = null;

      if(geocode.length) {
        latitude = parseFloat(geocode[0].lat);
        longitude = parseFloat(geocode[0].lon);
      } else {
        if(!confirm('Souřadnice místa '+street+', '+place+' nebyly nalezeny - místo se nebude zobrazovat na mapě. (Prosím zkontrolujte nebo zkuste změnit adresu) Uložit místo bez souřadnic?')) return false;
      }

      let placeObj = {
        street: street,
        place: place,
        postCode: postCode,
        note: note,
        openHours: openHours,
        contacts: contacts,
        latitude: latitude,
        longitude: longitude,
      };

      if(placeTab.placeDiv.id) placeObj.id = placeTab.placeDiv.id;

      places.push(placeObj);

    }

    return places;

  }

  div.elements.addPlaceBtn.onclick = async function(){
    await addPlace();
  }

  // div.elements.addPlaceBtn.onclick = async function(){
  //   await addPlace();
  // }

  // async function addPlace(){

  //   let place = await LayoutManager.getLayout('layouts/registerCharityPlace.html');

  //   place.elements.removeBtn.onclick = function(){
  //     div.elements.placeList.removeChild(place);
  //   }

  //   div.elements.placeList.appendChild(place);

  // }

  // function getPlaces(){

  //   let places = [];

  //   for(let e of div.elements.placeList.children){

  //     let street = div.elements.form.getValue(e.elements.street);
  //     let place = div.elements.form.getValue(e.elements.place);
  //     let postCode = div.elements.form.getValue(e.elements.postCode);
  //     let note = div.elements.form.getValue(e.elements.note);

  //     places.push({
  //       street: street,
  //       place: place,
  //       postCode: postCode,
  //       note: note,
  //     });

  //   }

  //   return places;

  // }

  // div.elements.addContactBtn.onclick = async function(){

  //   // let contact = document.createElement('div');
  //   // let select = document.createElement('select');
  //   // select.className = 'contactTypeSelect';
  //   // let emailOption = document.createElement('option');
  //   // emailOption.innerText = 'E-mail:';
  //   // let phoneOption = document.createElement('option');
  //   // phoneOption.innerText = 'Telefon:';
  //   // let webOption = document.createElement('option');
  //   // webOption.innerText = 'Web:';
  //   // select.appendChild(emailOption);
  //   // select.appendChild(phoneOption);
  //   // select.appendChild(webOption);
  //   // contact.appendChild(select);
  //   // let input = document.createElement('input');
  //   // input.className = 'formInput contactInput';
  //   // contact.appendChild(input);
  //   // let removeBtn = document.createElement('button');
  //   // removeBtn.className = 'squareBtn removeContactBtn';
  //   // removeBtn.innerText = 'X';
  //   // removeBtn.type = 'button';
  //   // removeBtn.onclick = function(){
  //   //   div.elements.contactList.removeChild(contact);
  //   // }
  //   // contact.appendChild(removeBtn);

  //   // div.elements.contactList.appendChild(contact);

  //   await addContact();

  // }

  // async function addContact(){

  //   let contact = await LayoutManager.getLayout('layouts/registerCharityContact.html');

  //   contact.elements.removeBtn.onclick = function(){
  //     div.elements.contactList.removeChild(contact);
  //   }

  //   div.elements.contactList.appendChild(contact);

  // }

  // function getContacts(){

  //   let contacts = [];

  //   for(let e of div.elements.contactList.children){

  //     let type = e.elements.typeSelect.value;
  //     let contact = div.elements.form.getValue(e.elements.contactInput);

  //     contacts.push({
  //       type: type,
  //       value: contact,
  //     });

  //   }

  //   return contacts;

  // }

  return div;

}
