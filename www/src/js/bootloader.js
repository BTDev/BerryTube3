console.log("Loading Scripts");
var mainJS = document.createElement('script');
mainJS.type = 'text/javascript';
mainJS.async = true;
mainJS.src = 'js/deferred.min.js';
document.getElementById("head").appendChild(mainJS);
window.bt = {}; // 4 DA MODDERZ
// Preloader Functions
window.require = function(modules,callback,wait){ // Lets modules Require other modules.

	// Growing delay
	if(!wait) wait = 10; else wait = Math.floor(wait * 1.1);
	if(wait > 10000) wait = 10000;

	// Ensure defined modules
	var pass = true;
	for(var i in modules){

		// If the item starts with anything except a-zA-Z we assume its a dom selector
		if(/^[a-zA-Z]/.test(modules[i])){
			if(!(modules[i] in window.bt) || typeof window.bt[modules[i]] == "undefined" || !window.bt[modules[i]]){
				pass = false;
				break;
			}
		} else {
			// ensure jquery is loaded
			if(typeof jQuery == "undefined"){
				pass=false;
				break;
			}
			if(!$(modules[i]).length){
				pass=false;
				break;
			}
		}
	}

	// Check and fire callbacks if true.
	if(pass){
		callback();
	} else {
		setTimeout(function(){
			require(modules,callback,wait);
		},wait);
	}

}