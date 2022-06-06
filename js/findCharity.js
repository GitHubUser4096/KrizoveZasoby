
async function createFindCharityDialog(){

  let div = await LayoutManager.getLayout('layouts/findCharity.html');
  div.className = 'findCharityDialog';

  let map = null;
  let allPlaces = null;
  let userPosCircle = null;

  // div.onInit = async function(){

  //   let location = null;

  //   try {
  //     location = await getLocation();
  //   } catch(e){
  //     console.error('Failed to query location');
  //   }

  //   let map = L.map('map').setView([50.075539, 14.437800], 14);

  //   L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  //       maxZoom: 19,
  //       attribution: '© OpenStreetMap'
  //   }).addTo(map);

  //   if(location){

  //     let userLat = location.coords.latitude;
  //     let userLon = location.coords.longitude;

  //     let userPosCircle = L.circle([userLat, userLon], {
  //       color: 'red',
  //       fillColor: '#F33',
  //       fillOpacity: 0.5,
  //       radius: location.coords.accuracy,
  //     }).addTo(map);

  //     userPosCircle.bindPopup('Moje poloha');

  //   }

  //   let places = JSON.parse(await GET('api/charity/listPlaces.php'));

  //   for(let place of places){

  //     let charityDiv = await LayoutManager.getLayout('layouts/charityListItem.html');
  //     charityDiv.className = 'charityItem';

  //     charityDiv.elements.name.innerText = place.charity.name+' - '+place.street+', '+place.place;
  //     charityDiv.elements.address.innerText = place.street+', '+place.place+', '+place.postCode+'\n'+(place.notes??'');
  //     charityDiv.elements.openHours.innerText = place.openHours;
  //     charityDiv.elements.contacts.innerText = (place.contacts?(place.contacts+'\n'):'')+place.charity.contacts;

  //     div.elements.charityList.appendChild(charityDiv);

  //     try { // TODO unnecessary try catch

  //       // let geocode = JSON.parse(await GET('https://nominatim.openstreetmap.org/search?q='+encodeURIComponent(place.street+', '+place.place+', Česká Republika')+'&format=json&limit=1'));

  //       // if(!geocode.length) throw new Error('No place found!');

  //       // let lat = parseFloat(geocode[0].lat);
  //       // let lon = parseFloat(geocode[0].lon);

  //       if(place.latitude && place.longitude){

  //         let lat = place.latitude;
  //         let lon = place.longitude;

  //         let mapMarker = L.marker([lat, lon]).addTo(map);
  //         mapMarker.bindPopup(escapeHTML(place.charity.name+' - '+place.street+', '+place.place));
  //         mapMarker.on('click', function(){
  //           charityDiv.scrollIntoView();
  //         });

  //         charityDiv.elements.showOnMapBtn.onclick = function(){
  //           map.setView([lat, lon], 16);
  //         }

  //         if(location){

  //           let userLat = location.coords.latitude;
  //           let userLon = location.coords.longitude;

  //           let placeLatLng = new LatLng(lat, lon);
  //           let userLatLng = new LatLng(userLat, userLon);

  //           let dist = Math.floor(placeLatLng.distance(userLatLng) * 100) / 100;

  //           // let kmPos = toKm(lat, lon);
  //           // let userKmPos = toKm(userLat, userLon);

  //           // let distX = Math.abs(kmPos[0]-userKmPos[0]);
  //           // let distY = Math.abs(kmPos[1]-userKmPos[1]);

  //           // let dist = Math.floor(Math.sqrt(distX*distX, distY*distY) * 100) / 100;

  //           charityDiv.elements.distance.innerText = dist+' km';
  //         }

  //       } else {
  //         charityDiv.elements.showOnMapBtn.style.display = 'none';
  //       }
        
  //     } catch(e){
  //       console.error('Failed to geocode '+place.street+', '+place.place, e);
  //     }

  //   }

  // }

  div.onInit = async function(){

    map = L.map('map').setView([50.075539, 14.437800], 14);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap'
    }).addTo(map);

    allPlaces = JSON.parse(await GET('api/charity/listPlaces.php'));

    await showPlaces(allPlaces);

    div.elements.searchInput.onchange = div.elements.searchBtn.onclick = async function(){
      await showPlaces(allPlaces
        .filter((e)=>(e.charity.name+' - '+e.street+', '+e.place).toLowerCase().indexOf(div.elements.searchInput.value.trim().toLowerCase())>=0));
    }

    div.elements.locateBtn.onclick = async function(){

      let location = null;

      try {
        location = await getLocation();
      } catch(e){
        console.error('Failed to query location (user refused?)');
        return;
      }

      if(userPosCircle){
        userPosCircle.remove();
      }

      userPosCircle = L.circle([location.coords.latitude, location.coords.longitude], {
        color: 'red',
        fillColor: '#F33',
        fillOpacity: 0.5,
        radius: location.coords.accuracy,
      }).addTo(map);

      userPosCircle.bindPopup('Moje poloha');

      for(let place of allPlaces){
        if(place.latitude && place.longitude){

          let placeLatLng = new LatLng(place.latitude, place.longitude);
          let userLatLng = new LatLng(location.coords.latitude, location.coords.longitude);

          let dist = Math.floor(placeLatLng.distance(userLatLng) * 100) / 100;

          place.distance = dist;

        }
      }

      await showPlaces(allPlaces
        .filter((e)=>(e.latitude && e.longitude && (e.charity.name+' - '+e.street+', '+e.place).toLowerCase().indexOf(div.elements.searchInput.value.trim().toLowerCase())>=0))
        .sort((a, b)=>a.distance-b.distance));

    }

  }

  async function showPlaces(places){

    for(let place of allPlaces){
      if(place.marker){
        place.marker.remove();
      }
    }

    let divs = [];

    for(let place of places){

      let charityDiv = await LayoutManager.getLayout('layouts/charityListItem.html');
      charityDiv.className = 'charityItem';

      if(place.distance) charityDiv.elements.distance.innerText = place.distance+' km';
      charityDiv.elements.name.innerText = place.charity.name+' - '+place.street+', '+place.place;
      charityDiv.elements.address.innerText = place.street+', '+place.place+', '+place.postCode+'\n'+(place.notes??'');
      charityDiv.elements.openHours.innerText = place.openHours;
      charityDiv.elements.contacts.innerText = (place.contacts?(place.contacts+'\n'):'')+place.charity.contacts;

      if(place.latitude && place.longitude){

        place.marker = L.marker([place.latitude, place.longitude]).addTo(map);
        place.marker.bindPopup(escapeHTML(place.charity.name+' - '+place.street+', '+place.place));
        place.marker.on('click', function(){
          charityDiv.scrollIntoView();
        });

        charityDiv.elements.showOnMapBtn.onclick = function(){
          map.setView([place.latitude, place.longitude], 16);
        }

      } else {
        charityDiv.elements.showOnMapBtn.style.display = 'none';
      }

      divs.push(charityDiv);

    }

    div.elements.charityList.innerText = '';

    for(let d of divs){
      div.elements.charityList.appendChild(d);
    }

  }

  // function toKm(lat, lon){

  //   let x = lat * 110.574;
  //   let y = lon * 111.320 * Math.cos(lat * (Math.PI / 180));

  //   return [x, y];

  // }

  async function getLocation(){
    return new Promise((resolve, reject)=>{
      navigator.geolocation.getCurrentPosition(function(pos){
        resolve(pos);
      }, function(e){
        reject(e);
      });
    });
  }

  return div;

}
