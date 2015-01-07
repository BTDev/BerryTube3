var EventEmitter = require('events').EventEmitter;

module.exports = function(bt){
	
	// This module contains actions for all chat-related actions. Chats, actions, administrative measures, and so on.
	var config = bt.config;
	var chat = new events.EventEmitter;
	
	chat.send = function(message){
	
		/**
			Expects
			message.from; "Cades"
			message.words; "Give me Money"
			Optional
			message.secrets {} of PRIVATE metadata ( Never leaves app )
			message.meta {} of PUBLIC metadata ( Expected to leave app )
		*/
		if(!message) return;
		if(!message.from) return;
		if(!message.words) return;
		
		// Act on any secrets
		delete message.secrets;
		
		this.emit("send",message);
		
	}
	
	chat.recv = function(socket,message){
		// This function is used to parse out a message from a user.
		// Attach name, timestamp, and check sentinel settings.
		console.log(socket.request.connection.remoteAddress);
		chat.send({
			from:socket.request.connection.remoteAddress,
			words:message.words
		});
	}
	
	chat.init = function(){
		this.emit("init");
		var self = this;
		setInterval(function(){
			self.send({
				from:"SERVER",
				words:"Eat shit lol"
			});
		},10000);
	}

	return chat;

}
