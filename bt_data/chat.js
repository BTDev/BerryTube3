const Promise = require('promise');
const events  = require('events');
module.exports = function(bt){

	var module_name = "chat";
	var mod = { e:bt.register(module_name), events: new events.EventEmitter()  };
	
	mod.scrollback_size = 100;

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
			
			mod.parseMessage(data.message).then(function(parsed){
				mod.broadcastMessage(socket,parsed);
			});
			
		});
	} 
	
	mod.parseMessage = function(raw){
	
		function htmlEscape(str) {
			return String(str)
					.replace(/&/g, '&amp;')
					.replace(/"/g, '&quot;')
					.replace(/'/g, '&#39;')
					.replace(/</g, '&lt;')
					.replace(/>/g, '&gt;');
		}
	
		return new Promise(function(resolve,reject){
			var parsed = htmlEscape(raw);
			// console.log(raw,parsed);
			resolve(parsed);
		});
	}
	
	var messageIndex = 0;
	var messageKeyspace = 100000000
	mod.getMessageID = function(){
		if(messageIndex >= messageKeyspace){
			messageIndex = 0;
		}
		messageIndex++;
		// console.log(messageIndex);
		return (messageIndex).toString(36);
	}
	
	mod.generateMessage = (username,message) => {
		return {
			username:username,
			message:message,
			timestamp: new Date(),
			id: mod.getMessageID()
		}
	};

	// Imperitive
	mod.broadcastMessage = function(socket,message){
			
		var regex = /^\/(\w+)\s?(.*)/; 
		if(regex.test(message)) { 
			var match = message.match(regex);
			var command = match[1];
			message = match[2];	
			
			if(command == "title"){
				bt.util.setTitleOverride(message)
				return;
			}
			
			if(command == "sessions"){
				var sockets = bt.users.getSocketsOfUser(socket.profile);		
				sockets.forEach(function(socki){
					socki.emit(module_name,{
						ev:"message",
						data:mod.generateMessage("System","Found "+sockets.length+" sessions")
					});
				});
				return;
			}
			
			if(command == "killothersessions"){
				var sockets = bt.users.getSocketsOfUser(socket.profile);		
				var i = 0;
				sockets.forEach(function(socki){
					if(socki == socket) return;
					bt.security.kick(socki);
					i++;
				});
				socket.emit(module_name,{
					ev:"message",
					data:mod.generateMessage("System","Killed "+i+" other sessions.")
				});
				return;
			}
			
		}
		
		var blob = {
			username:socket.profile.username,
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