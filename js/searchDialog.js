
function showSearchDialog(){

  let div = document.createElement('div');

  div.className = 'searchDialog';

  div.innerHTML = `
    <div class="dialog">
      <div>
        Hledat <button class="closeBtn">X</button>
      </div>
      <div>
        <form class="searchForm">
          <input name="search"></input>
          <button type="submit">Hledat</button>
        </form>
      </div>
    </div>
  `;

  let closeBtn = div.querySelector('.closeBtn');
  let searchForm = div.querySelector('.searchForm');
  // let searchInput = div.querySelector('.searchInput');

  searchForm.onsubmit = function(){
    console.log(searchForm['search'].value);
    return false;
  }

  closeBtn.onclick = function(){
    document.body.removeChild(div);
  }

  document.body.appendChild(div);

}
