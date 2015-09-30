const Promise = require('promise');
const events  = require('events');
module.exports = function(bt){

	var module_name = "chat";
	var mod = { e:bt.register(module_name), events: new events.EventEmitter()  };

	// CONVENTION: e.function refers to a common entrypoint, a method that may fail.
	// the e function calls its main counterpart in the event of a "success"
	
	// Conditional
	mod.e.message = function(data,socket){
		// send secret message		
		return new Promise(function(resolve,reject){
			
			if(!socket) throw new Error("No socket present on socket entrypoint");
			if(!socket.profile) throw new Error("You must be logged in to chat.");
			if(!data) throw new Error("No data received");
			if(!data.message) throw new Error("No message received");
			
			return mod.broadcastMessage(socket.profile,data.message);
			
		});
	} 

	// Imperitive
	mod.broadcastMessage = function(profile,message){
		
		var regex = /^\/(\w+)\s(.*)/; 
		if(regex.test(message)) { 
			var match = message.match(regex);
			var command = match[1];
			message = match[2];	
			
			if(command == "title"){
				bt.util.setTitleOverride(message)
				return;
			}
			
		}
		
		return bt.io.emit(module_name,{
			ev:"message",
			data:{
				username:profile.username,
				message:message,
				timestamp: new Date()
			}
		});
	}
	
	return mod;

}