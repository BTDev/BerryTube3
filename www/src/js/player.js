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

		if(typeof provider == "undefined"){
			console.log("Got an undefined provider");
			console.trace();
			return;
		}

		if(!timeout) timeout = 10;
		timeout *= 1.1;
		if(timeout > 10000) return;

		// Check for provider match
		if(player.activeProvider && player.activeProvider.handle == provider){
			player.activeProvider.play({
				id:id,
				pos:pos
			})
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

	player.seek = function(to,incorporate_lag){
		if(incorporate_lag && bt.socket.avgping) to += bt.socket.avgping;
		player.ensureProvider(function(){
			player.activeProvider.seek(to);
		});
	}

	player.play = function(data){
		player.ensureProvider(function(){
			player.activeProvider.play(data);
		});
	}

	player.stop = function(data){
		console.log("player","stop not yet implemented",data);
	}

	player.ensureProvider = function(callback,timeout){
		if(!timeout) timeout = 10;
		timeout *= 1.1;
		if(timeout > 10000) return;

		if(!player.activeProvider){
			setTimeout(function(){
				player.ensureProvider(callback,timeout);
			},timeout);
			return;
		}

		if(callback)callback();
	}

	player.heartbeat = function(data,timeout){

		// timeout
		pos = data.pos;
		player.activeProvider.getTime(function(time){
			var diff = Math.abs(pos-time)/2;
			if(diff > 1){ // TODO: Use localstorage / User Account Module
				console.log("diff of",diff);
				player.seek(pos);
			}
		});

	}

	player.registerProvider = function(provider){
		provider.init();
		player.providers[provider.handle] = provider;
	}

	/// Hook Socket events
	bt.socket.on('vi:seek', function (data) 		{ player.seek(data,true);	} );
	bt.socket.on('vi:play', function (data) 		{ player.play(data);		} );
	bt.socket.on('vi:stop', function (data) 		{ player.stop(data);		} );
	bt.socket.on('vi:heartbeat', function (data) 	{ player.heartbeat(data);	} );

	/// Hook local events
	bt.playlist.on('setactive',function(data){
		var id = data.videoid;
		var pos = data.pos || -3;
		player.loadByDomId({
			id:id,
			pos:pos
		});
	});


	/// Attach DOM events


	// Any initial events


	// "return" playlist.
	bt.player = player;

});