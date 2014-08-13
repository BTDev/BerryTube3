console.log("Loading Scripts");
var mainJS = document.createElement('script');
mainJS.type = 'text/javascript';
mainJS.async = true;
mainJS.src = 'js/deferred.min.js';
document.getElementById("head").appendChild(mainJS);