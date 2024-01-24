
// TODO name is not accurate - used both for registering and editing charities
async function createRegisterCharityDialog(charity){

  let placeCounter = 1;

  function getPlaceCounter(){
    let res = placeCounter;
    placeCounter++;
    return res;
  }

  let div = await LayoutManager.getLayout('layouts/registerCharity.html');
  div.className = 'registerCharityDialog';

  div.onInit = async function(){

    if(charity){

      div.elements.title.innerText = 'Upravit charitu';
      
      div.elements.name.value = charity.name;
      div.elements.orgId.value = charity.orgId;
      // div.elements.contacts.value = charity.contacts;
      div.elements.contactWeb.value = charity.contactWeb;
      div.elements.contactMail.value = charity.contactMail;
      div.elements.contactPhone.value = charity.contactPhone;

      for(let place of charity.places){

        let placeDiv = await addPlace();

        placeDiv.id = place.id;
        placeDiv.elements.street.value = place.street;
        placeDiv.elements.place.value = place.place;
        placeDiv.elements.postCode.value = place.postCode;
        placeDiv.elements.note.value = place.note;
        placeDiv.elements.openHours.value = place.openHours;
        // placeDiv.elements.contacts.value = place.contacts;
        placeDiv.elements.contactWeb.value = place.contactWeb;
        placeDiv.elements.contactMail.value = place.contactMail;
        placeDiv.elements.contactPhone.value = place.contactPhone;

        placeDiv.updateName();

      }

    } else {
      addPlace();
    }

  }

  div.elements.form.submitForm = async function(){

    let name = div.elements.form.getValue(div.elements.name);
    let orgId = div.elements.form.getValue(div.elements.orgId);
    // let contacts = div.elements.form.getValue(div.elements.contacts);
    let contactWeb = div.elements.form.getValue(div.elements.contactWeb);
    let contactMail = div.elements.form.getValue(div.elements.contactMail);
    let contactPhone = div.elements.form.getValue(div.elements.contactPhone);

    if(!contactWeb && !contactMail && !contactPhone) throw new Error('Prosím vyplňte alespoň jeden kontakt!');

    let places = await getPlaces();
    if(places===false) return;
    if(!places.length) throw new Error('Prosím přidejte alespoň jedno místo!');

    if(charity){
      await POST('api/charity/registerCharity.php?charityId='+charity.id, {
        data: JSON.stringify({
          name: name,
          orgId: orgId,
          // contacts: contacts,
          contactWeb: contactWeb,
          contactMail: contactMail,
          contactPhone: contactPhone,
          places: places,
        }),
      });
    } else {
      await POST('api/charity/registerCharity.php', {
        data: JSON.stringify({
          name: name,
          orgId: orgId,
          // contacts: contacts,
          contactWeb: contactWeb,
          contactMail: contactMail,
          contactPhone: contactPhone,
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
      // let contacts = div.elements.form.getValue(placeTab.placeDiv.elements.contacts);
      let contactWeb = div.elements.form.getValue(placeTab.placeDiv.elements.contactWeb);
      let contactMail = div.elements.form.getValue(placeTab.placeDiv.elements.contactMail);
      let contactPhone = div.elements.form.getValue(placeTab.placeDiv.elements.contactPhone);

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
        // contacts: contacts,
        contactWeb: contactWeb,
        contactMail: contactMail,
        contactPhone: contactPhone,
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

  return div;

}
