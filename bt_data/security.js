const Promise = require('promise');

module.exports = function(bt){

	var module_name = "security";
	var mod = { e:bt.register(module_name) };

	/*
		Known Perms
		playlist-sort: Allows moving items on the playlist.
		playlist-options: Allows for opening control panes above the playlist.
		playlist-queue: Allows for adding videos to the playlist.
		playlist-delete: Allows for removing videos from the playlist.
	*/
	
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
	
	mod.hard = function(socket,perm){
		var sec = mod.soft(socket,perm);
		sec.catch(function(){
			mod.kick(socket);
		})
		return sec;
	}
	
	mod.kick = function(socket){
		socket.disconnect();
		console.log("Disconnected socket for illegal activity");
	}
	
	return mod;

}