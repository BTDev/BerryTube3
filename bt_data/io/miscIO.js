events = require('events');

module.exports = function(bt){

	//bt.config,bt.playlist,bt.io
	var config = bt.config;
	var io = bt.io;

	var misc = new events.EventEmitter;

	// SOCKET REACTIONS
	io.on('connection', function (socket) {
		console.log("miscIO Attached");
		// ping support.
		socket.on("ping",function(data){
			socket.emit("pong");
		});

	});

	return misc;


}