events = require('events');

module.exports = function(bt){

	//bt.config,bt.playlist,bt.io
	var config = bt.config;
	var playlist = bt.playlist;
	var io = bt.io;

	var plio = new events.EventEmitter;

	// EVENT REACTIONS
	playlist.once("load",function(){

		// Emit Playlist additions.
		playlist.on("add",function(after,video){

			var data = {};
			if(video && video.data) data.video = video.data; // lol fuck you
			if(after && after.data) data.after = after.data; // lol fuck you
			io.emit("pl:add",data);

		})

	});

	
	// SOCKET REACTIONS
	io.on('connection', function (socket) {

		// Playlist Add Event
		socket.on("pl:add",function(data){
			bt.importer.getVideo(data.url,function(nv){
				console.log(nv);
				if(nv){ console.log("ok",data.url); playlist.add(null,nv); }
				else { console.log("bad",data.url); socket.emit('bt:err','No U'); }
			});
		});

		socket.on("pl:getall",function(){
			var broadcastableArray = playlist.getAll();
			console.log(broadcastableArray);
			io.emit("pl:getall",broadcastableArray);
		});


	});

	return plio;

}