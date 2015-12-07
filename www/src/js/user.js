/**
	User Module. Handles login, registration, and various identity meta-operations.
*/
var bt = (function (bt,module_name) {

	const FLAG_LOGGED_IN = "logged-in";

	var user = bt.user = { e:bt.register(module_name) }; 

	user.handleLoginGood = function(data){
		// This is where the user would "download" his profile to the page for things
		// like visibility, functions, special bt-gold powers, and so on.
		user.profile = data || {};
		bt.setFlag(FLAG_LOGGED_IN,true);
		console.log(user.profile);
		if(user.profile.perms){
			for(var i=0;i<user.profile.perms.length;i++){
				bt.setFlag(user.profile.perms[i],true);
			}
		}
	}
	
	user.handleLoginBad = function(e){
		user.profile = {};
		bt.setFlag(FLAG_LOGGED_IN,false);
		localStorage.removeItem('token');
	}
	
	user.loginWithToken = function(token){
	
		var p = bt.rawEmit(module_name,"login",{
			token:token
		});
		
		p.then(user.handleLoginGood,user.handleLoginBad); 
		p.then(function(){ localStorage.setItem('token', user.profile.token); });
		
		return p;
		
	}
	
	user.login = function(username,password,remember) {
	
		var p = bt.rawEmit(module_name,"login",{
			username:username,
			password:password
		});
		
		p.then(user.handleLoginGood,user.handleLoginBad); 
		p.then(function(){
			if(remember){
				localStorage.setItem('token', user.profile.token);
			}
		});
		
		return p;
	};
	
	if(localStorage.getItem('token')){
		var token = localStorage.getItem('token');
		user.loginWithToken(token);
	}
	
	user.register = function(username,password){
		var p = bt.rawEmit(module_name,"register",{
			username:username,
			password:password
		});
		return p;
	};
	
	return bt;
}(bt,"user"));
