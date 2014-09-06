 require(['#video','playlist','socket','eventEmitter'],function(){

	// Inherit from eventEmitter
	var player = new bt.eventEmitter();
	player.dom = $("#video");
	player.providers = {};
	player.activeProvider = null;

	// Define Methods
	player.loadByDomId = function(data){

		var id = data.id;
		var dom = $("#"+id);
		data.provider = dom.attr("data-provider");
		data.id = dom.attr("data-videoid");
		player.load(data);

	}

	player.load = function(data,timeout){

		var provider = data.provider;
		var id = data.id;
		var pos = data.pos;

		if(!timeout) timeout = 10;
		timeout *= 1.1;
		if(timeout > 10000) return;

		// Check for provider match
		if(player.activeProvider && player.activeProvider.handle == provider){
			console.log("use existing",player.activeProvider);
			return;
		}

		// Check for registered provider
		if(player.providers[provider]){
			//console.log("change to",player.providers[provider])
			player.activeProvider = player.providers[provider];

			player.activeProvider.embed({
				dom:player.dom,
				pos:pos,
				id:id,
			});

			return;
		}

		// No registered providers under that name.
		console.log("provider",provider,"not yet registered. trying again in a moment.",timeout);
		setTimeout(function(){
			player.load(data,timeout);
		},timeout);

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

	player.registerProvider = function(provider){
		provider.init();
		player.providers[provider.handle] = provider;
	}

	/// Hook Socket events
	bt.socket.on('vi:seek', function (data) 	{ player.seek(data); } );
	bt.socket.on('vi:play', function (data) 	{ player.play(data); } );
	bt.socket.on('vi:stop', function (data) 	{ player.stop(data); } );

	/// Hook local events
	bt.playlist.on('setactive',function(data){
		//console.log(data);
		var id = data.videoid;
		player.loadByDomId({
			id:id,
			pos:0
		});
	});


	/// Attach DOM events


	// Any initial events


	// "return" playlist.
	bt.player = player;

});