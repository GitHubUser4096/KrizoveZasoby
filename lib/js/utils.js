
function toFirstUpper(str){
    return str.substring(0, 1).toUpperCase()+str.substring(1);
}

function escapeHTML(str){
    let span = document.createElement('span');
    span.innerText = str;
    return span.innerHTML;
}
