
const XHR_DEBUG_NONE = 0;
const XHR_DEBUG_NO_POST = 1;
const XHR_DEBUG_ALL = 2;

const XHR_DEBUG = XHR_DEBUG_NONE;

function GET(request){
	return new Promise((resolve, reject)=>{

		let xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function(){
			if(this.readyState==4){
				if(this.status==0){
					hideLoading();
					alert('Akci nelze provést. Prosím zkontrolujte připojení k internetu.');
					reject('Connection failed');
				}
				if(this.status==401 || this.status==403){ // TODO is this safe? can there be a case when 401 or 403 does NOT mean reauth? (change status to 401 reauth?)
					location.href = 'index.php?reauth';
					reject('Auth failed');
				}
				if(this.status>=200 && this.status<300) {
					if(XHR_DEBUG) console.log('GET:', request, this.responseText);
					resolve(this.responseText);
				} else if(this.status>=400) {
					if(XHR_DEBUG) console.error('GET:', request, this.status, this.responseText);
					reject({status:this.status, message:this.responseText});
				}
			}
		}
		xhr.open('GET', request, true);
		xhr.send();

	});
}

function POST(request, data){
	return new Promise((resolve, reject)=>{

		let xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function(){
			if(this.readyState==4){
				if(this.status==0){
					hideLoading();
					alert('Akci nelze provést. Prosím zkontrolujte připojení k internetu.');
					reject('Connection failed');
				}
				if(this.status==401 || this.status==403){
					location.href = 'index.php?reauth';
					reject('Auth failed');
				}
				if(this.status>=200 && this.status<300){
					if(XHR_DEBUG==XHR_DEBUG_NO_POST) console.log('POST:', request, this.responseText);
					else if(XHR_DEBUG==XHR_DEBUG_ALL) console.log('POST:', request, data, this.responseText);
					resolve(this.responseText);
				} else if(this.status>=400){
					if(XHR_DEBUG==XHR_DEBUG_NO_POST) console.error('POST:', request, this.status, this.responseText);
					else if(XHR_DEBUG==XHR_DEBUG_ALL) console.error('POST:', request, data, this.status, this.responseText);
					reject({status:this.status, message:this.responseText});
				}
			}
		}
		xhr.open('POST', request, true);
		xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

		let dataStr;

		if((typeof data)=='object'){

			let tmpArray = [];
			for(let key in data){
				if(data[key]) tmpArray.push(encodeURIComponent(key)+'='+encodeURIComponent(data[key]));
				else tmpArray.push(encodeURIComponent(key)+'=');
			}
			dataStr = tmpArray.join('&');

		} else {
			dataStr = data;
		}

		xhr.send(dataStr);

	});
}

async function POST_FILE(request, file){

	return new Promise((resolve, reject)=>{
		let xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function(){
			if(this.readyState==4){
				if(this.status>=200 && this.status<300){
					if(XHR_DEBUG==XHR_DEBUG_NO_POST) console.log('POST:', request, this.responseText);
					else if(XHR_DEBUG==XHR_DEBUG_ALL) console.log('POST:', request, data, this.responseText);
					resolve(this.responseText);
				} else if(this.status>=400){
					if(XHR_DEBUG==XHR_DEBUG_NO_POST) console.error('POST:', request, this.status, this.responseText);
					else if(XHR_DEBUG==XHR_DEBUG_ALL) console.error('POST:', request, data, this.status, this.responseText);
					reject({status:this.status, message:this.responseText});
				}
			}
		}
		xhr.open('POST', request, true);
		// xhr.setRequestHeader("Content-type", "multipart/form-data");
		let formData = new FormData();
		formData.append('file', file);
		xhr.send(formData);
	});
}
