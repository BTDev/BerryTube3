// Wait for the socket
require(['#video','playlist','socket','eventEmitter'],function(){

	// Inherit from eventEmitter
	var player = new bt.eventEmitter();
	player.dom = $("#video");

	// Define Methods
	player.loadByDomId = function(domid){
		console.log(domid);
		var p = $("#"+domid).attr("data-provider");
		player.load(p,domid);
	}

	player.load = function(provider,id){
		console.log("player","load not yet implemented",provider,id);
	}

	player.seek = function(data){
		console.log("player","seek not yet implemented",data);
	}

	player.play = function(data){
		console.log("player","play not yet implemented",data);
	}

	player.stop = function(data){
		console.log("player","stop not yet implemented",data);
	}

	/// Hook Socket events
	bt.socket.on('vi:seek', function (data) 	{ player.seek(data); } );
	bt.socket.on('vi:play', function (data) 	{ player.play(data); } );
	bt.socket.on('vi:stop', function (data) 	{ player.stop(data); } );

	/// Hook local events
	bt.playlist.on('setactive',function(data){
		var id = data.videoid;
		player.loadByDomId(id);
	});


	/// Attach DOM events


	// Any initial events


	// "return" playlist.
	bt.player = player;

});