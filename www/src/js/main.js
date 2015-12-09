var bt = (function () {

	var bt = new EventEmitter2(); 

	// Create socket
	bt.socket = Q.Promise(function(resolve,reject){
		
		var iosrc = window.location.origin+"/socket.io/socket.io.js";
		var script = document.createElement("script");
		script.src = iosrc;
		document.body.appendChild(script);
		
		var check = function(){
			if(typeof io != "undefined") resolve(io());
			else setTimeout(check,100);
		}
		
		check();
		
	});
		
	bt.log = function(){
		console.log.apply(console,arguments);
	}
	
	// Define event registrar & emitter
	bt.register = (function(){

		// This is weird so i have a closured space to define a function that 
		// only this thing ever needs. This way its declared once, but still 
		// only accessible to the returned function. Cleanliness!
		var ifEventValid = function(ev,cb){
			if(ev && typeof ev.ev != "undefined" && typeof ev.data != "undefined") if(cb)cb();
		}
		
		return function(evname){
			var obj = {};

			bt.socket.done(function(socket){
				
				socket.on(evname,function(ev){
					ifEventValid(ev,function(){
						bt.triggerEvent(evname,ev);
					});
				});
				
				bt.on(evname,function(ev){
					ifEventValid(ev,function(){			
						if(obj && obj[ev.ev]) { 
						
							var p = Q.Promise(function(resolve,reject){
								resolve(obj[ev.ev](ev.data));
							}).then(function(result){}).catch(function(exception){
								console.error(exception);
							});
							
						}
						else { console.warn("(!) No handler for",evname+":"+ev.ev); }
					});
				});
				
			});
			
			return obj;
		}
	})();
	
	
	bt.triggerEvent = function(ns,ev){
		bt.emit(ns,{ ev:ev.ev, data:ev.data });
	};

	bt.rawEmit = function(ns,ev,data){
		return Q.Promise(function(resolve,reject){
			bt.socket.done(function(socket){
				  
				socket.emit(ns,{
					ev:ev,
					data:data
				},function(res){
					if(res.ev == "reject") {
						reject(res.data);
					} else {
						resolve(res.data);
					} 
				});
				
			});
		});
	}
	
	bt.setFlag = function(flag,value){
		document.body.setAttribute('data-bt-'+flag, value);
	};
	
	bt.getFlag = function(flag){
		return document.body.getAttribute('data-bt-'+flag);
	}
	
	bt.themes = [];
	var activeTheme = false;
	var activeCSS = [];
	
	bt.registerTheme = function(theme){
		bt.themes.push(theme);
		if(bt.themes.length == 1){
			bt.activateTheme(theme);
		}
	}
	
	bt.activateTheme = function(theme){
		
		// get active theme.
		var active = bt.getActiveTheme();
		
		if(active){
			if(active.unload) active.unload(theme); // unload, and tell it who's next.
			activeCSS.forEach(function(elem){
				console.log("elem",elem);
				elem.parentNode.removeChild(elem);
				activeCSS.splice(activeCSS.indexOf(elem),1);
			});
		}
		
		if(theme){
			
			if(theme.css) {
				theme.css.forEach(function(css){
					var cssdom = document.createElement("link");
					cssdom.rel = "stylesheet";
					cssdom.href = css;
					if(theme.name) cssdom.setAttribute("theme",theme.name);
					document.head.appendChild(cssdom);
					activeCSS.push(cssdom);
				});
			}
			
			if(theme.load) theme.load();
			
			activeTheme = theme;
			
		}
		
	}
	
	bt.getActiveTheme = function(){
		if(!activeTheme) return false;
		return activeTheme;
	}
	
	// Not always required, just a safe way to get async loaded modules/variables..
	bt._ = function(name){
		return Q.Promise(function(resolve,reject){

			(function look(){
				var parts = name.split('.');
				var check = bt;
				while(check){
					if(parts.length == 0){
						resolve(check);
						return;
					}
					check = check[parts.shift()];
				}
				setTimeout(look,50);
			})();
			
		});
	}
	
	var tabActive = true;
	bt.isTabActive = function(){
		return tabActive;
	}
	
	bt.whenTabActive = function(){
		return Q.Promise(function(resolve,reject){
			var x = setInterval(function(){
				if(tabActive){
					resolve();
					clearInterval(x);
				}
			},500);
		});
	}
	
	var currentNotify = false;
	bt.notify = function(words){
	
		words = words || "Hey! Listen!";
		
		var squee = function(){
			bt._('util').then(function(util){
				util.sfx.squee();
			});
		}
		
		var flashTab = function(){
		
			bt._('util').then(function(util){
			
				var eo = false;
				if(currentNotify){
					clearInterval(currentNotify);
				}
				
				currentNotify = setInterval(function(){			
					if(eo) util.setPageTitle(words);
					else util.setPageTitle();
					eo = !eo;
				},1000); 
				
				bt.whenTabActive().then(function(){
					clearInterval(currentNotify);
					util.setPageTitle();
				});
			
			});
		}
		
		if(!bt.isTabActive()) flashTab();
		if(!bt.isTabActive()) squee();
	}
	
	var onFocus = function(){ tabActive = true; console.log(bt.isTabActive()) };
	var onBlur = function(){ tabActive = false; console.log(bt.isTabActive()) };
	
	window.addEventListener('focus', onFocus);
    window.addEventListener('blur', onBlur);
	
	return bt;
}()); 








