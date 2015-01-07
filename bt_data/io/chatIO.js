events = require('events');

module.exports = function(bt){

	//bt.config,bt.playlist,bt.io
	var config = bt.config;
	var chat = bt.chat;
	var io = bt.io;

	var misc = new events.EventEmitter;

	// EVENT REACTIONS
	chat.once("init",function(){
		console.log("chatIO Attached to Module");
		chat.on("send",function(message){
			io.sockets.emit("ch:send",message);
		});
	});
	
	// SOCKET REACTIONS
	io.on('connection', function (socket) {
		console.log("chatIO Attached to Socket");
		socket.on("ch:send",function(data){
			chat.recv(socket,data);
			console.log(data);
		});
		
	});

	return misc;


}