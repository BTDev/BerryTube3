const Promise = require('promise');
const events  = require('events');
module.exports = function(bt){

	var module_name = "chat";
	var mod = { e:bt.register(module_name), events: new events.EventEmitter()  };
	
	mod.scrollback_size = 6;

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
	
	var messageIndex = 0;
	var messageKeyspace = 100000000
	mod.getMessageID = function(){
		if(messageIndex >= messageKeyspace){
			messageIndex = 0;
		}
		messageIndex++;
		console.log(messageIndex);
		return (messageIndex).toString(36);
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
		
		var blob = {
			username:profile.username,
			message:message,
			timestamp: new Date(),
			id: mod.getMessageID()
		}
		
		mod.addToScrollback(blob);
		
		return bt.io.emit(module_name,{
			ev:"message",
			data:blob
		});
	}
	
	mod.removeChat = function(id){
		mod.deleteFromScrollback(id);
		bt.io.emit("chat",{
			ev:"curate",
			data:{rm:[(id).toString(36)]}
		});
	}
	
	var scrollback = [];
	mod.addToScrollback = function(blob){
		scrollback.push(blob);
		while (scrollback.length > mod.scrollback_size)  scrollback.shift();
	}
	
	mod.sendScrollback = function(socket){
		return socket.emit(module_name,{
			ev:"scrollback",
			data:scrollback
		});
	}
	
	mod.deleteFromScrollback = function(id){
		for(var i=0;i<scrollback.length;i++){
			var msg = scrollback[i];
			if(msg.id == id){
				scrollback.splice(i,1);
				break;
			}
		}
	}
	
	bt.io.on("connection",function(socket){
		mod.sendScrollback(socket);		
	});
	
	return mod;

}