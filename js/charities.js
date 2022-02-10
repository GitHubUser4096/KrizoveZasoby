
async function loadCharities(){

  let charities = JSON.parse(await GET('api/charity/list.php'));

  charityList.innerText = '';

  charityList.innerHTML += '<div>'
      +'<span>Název</span>'
      +'<span>Kontakt</span>'
      +'<span>Adresa</span>'
      +'<span>Poznámky</span>'
      +'</div>';

  for(let charity of charities){

    charityList.innerHTML += '<div>'
        +'<span>'+charity.name+'</span>'
        +'<span>'+charity.contact+'</span>'
        +'<span>'+charity.address+'</span>'
        +'<span>'+charity.notes+'</span>'
        +'</div>';

  }

}
