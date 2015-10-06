const Promise = require('promise');

module.exports = function(bt){

	var module_name = "security";
	var mod = { e:bt.register(module_name) };

	mod.soft = function(socket,perm){
		return new Promise(function(resolve,rekt){
			if(socket === true) return true;  // If we are called with literally true as the socket (ie. programatically) give it a pass.
			if(!socket.profile) throw new Error("Illegal Action");
			if(!!~socket.profile.perms.indexOf(perm)){
				resolve(socket);
			} else {
				throw new Error("Illegal Action");
			}
		});
	}
	
	return mod;

}