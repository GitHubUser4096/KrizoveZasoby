
RequestCache = new (function(){

  let requests = {};

  this.get = async function(request){

    if(requests[request]!=null){
      return requests[request];
    }

    let response = await GET(request);
    requests[request] = response;
    return response;

  }

})();
