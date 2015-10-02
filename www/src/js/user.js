/**
	User Module. Handles login, registration, and various identity meta-operations.
*/
var bt = (function (bt,module_name) {

	const FLAG_LOGGED_IN = "logged-in";

	var user = bt.user = { e:bt.register(module_name) }; 

	user.login = function(username,password) {
		var p = bt.rawEmit(module_name,"login",{
			username:username,
			password:password
		});
		
		p.then(function(data){
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
		},function(e){
			user.profile = {};
			bt.setFlag(FLAG_LOGGED_IN,false);
		}); 
		
		return p;
	};
	
	user.register = function(username,password){
		var p = bt.rawEmit(module_name,"register",{
			username:username,
			password:password
		});
		return p;
	};
	
	return bt;
}(bt,"user"));
