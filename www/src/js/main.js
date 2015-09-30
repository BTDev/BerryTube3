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
			if(ev && ev.ev && ev.data) if(cb)cb();
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
		document.body.getAttribute('data-bt-'+flag);
	}
	
	return bt;
}()); 








