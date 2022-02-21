<!DOCTYPE html>
<html lang="en" dir="ltr">
  <head>
    <meta charset="utf-8">
    <title>Test page</title>
    <script src="lib/js/XHR.js"></script>
    <script type="text/javascript">

    window.onload = async function(){

      let products = JSON.parse(await GET('api/product/list.php'));

      console.log(products);

      for(let product of products){

        let div = document.createElement('div');

        let name = document.createElement('div');
        name.innerHTML += '<h2>'+product.name+'</h2>';
        div.appendChild(name);

        let imgName = document.createElement('div');
        imgName.innerText = 'Image: '+product.imgName;
        div.appendChild(imgName);

        if(product.imgName){
          let img = document.createElement('img');
          img.src = 'images/'+product.imgName;
          div.appendChild(img);
        }

        let ean = document.createElement('div');
        ean.innerText = 'EAN: '+product.EAN;
        div.appendChild(ean);

        let desc = document.createElement('div');
        desc.innerText = 'Description: '+product.description;
        div.appendChild(desc);

        let packType = document.createElement('div');
        packType.innerText = 'Package: '+(product.packageType??'-');
        div.appendChild(packType);

        let cats = document.createElement('div');
        cats.innerText = 'Categories: '+product.categories.join(', ');
        div.appendChild(cats);

        prodDiv.appendChild(div);
        prodDiv.appendChild(document.createElement('hr'));

      }

    }

    </script>
  </head>
  <body>

    <div id="prodDiv">

    </div>

  </body>
</html>
