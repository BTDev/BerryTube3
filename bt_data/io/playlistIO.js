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
			io.sockets.emit("pl:add",data);

		});

		// TODO 
		/*
			Right now the server playlist module handles all video operations and playlist operations.
			I'm not sure if i want to keep it this way, but the server dosnt actually have any concept of 
			a video player, so decoupling them seems over complicated, opposed to just having the
			playlist io send video events.
		*/
		playlist.on("seek",function(data){
			io.sockets.emit("vi:seek",data);
		});

		playlist.on("play",function(data){
			io.sockets.emit("vi:play",data);
		});

		playlist.on("stop",function(data){
			io.sockets.emit("vi:stop",data);
		});

		playlist.on("jump",function(data){
			io.sockets.emit("pl:jump",data);
		});

		// Heartbeat
		setInterval(function(){
			io.sockets.emit("vi:heartbeat",{
				activeid:playlist._active.video._id,
				pos:playlist.getTime(),
			});
		},5000)

	});

	
	// SOCKET REACTIONS
	io.on('connection', function (socket) {
		console.log("playlistIO Attached");
		// Playlist Add Event
		socket.on("pl:add",function(data){
			bt.importer.getVideo(data.url,function(nv){
				if(nv){ playlist.add(null,nv); }
				else { socket.emit('bt:err','No U'); }
			});
		});

		socket.on("pl:getall",function(){
			var broadcastableArray = playlist.getAll();
			//console.log(broadcastableArray);
			io.emit("pl:getall",{
				activeid:playlist._active.video._id,
				pos:playlist.getTime(),
				videos:broadcastableArray
			});
		});

		socket.on("pl:skip",function(){
			playlist.playNext();
		});

	});


	return plio;

}