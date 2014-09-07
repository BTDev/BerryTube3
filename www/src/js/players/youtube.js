require(['player'],function(){

	var provider = {};


	// REQUIRED
	provider.handle = "youtube";
	// To allow chrome/chromeless players.
	provider.chromeless = false; 
	provider.init = function(){
		$.getScript("https://www.youtube.com/iframe_api");
	};
	provider.embed = function(data){
		// Embed should imply play();

		if(!provider.apiready){
			setTimeout(function(){
				provider.embed(data);
			},100);
			return;
		}

		provider.dom = data.dom;
		provider.iframe = null;
		var id = data.id;
		var pos = data.pos;
		var lag = new Date().getTime(); // lag counter to modify position by once the video loads.

		// Kill the child.
		provider.dom.children().remove();

		if(provider.chromeless){
			provider.iframe = $("<iframe/>").attr("id","youtube-iframe").attr("src","https://www.youtube.com/embed/"+id+"?version=3&enablejsapi=1&controls=0&showinfo=0");
		} else {
			provider.iframe = $("<iframe/>").attr("id","youtube-iframe").attr("src","https://www.youtube.com/embed/"+id+"?version=3&enablejsapi=1");
		}

		provider.iframe.appendTo(provider.dom);
		provider.player = new YT.Player('youtube-iframe',{
			events:{
				'onReady': function(){
					provider.activeid = id;
					provider.play({
						lag:lag,
						id:id,
						pos:pos
					})
				}, 
			}
		});

	}
	provider.play = function(data){
		if(data){
			lag = data.lag; 
			pos = data.pos;
			id = data.id; 
		}
		if(!lag) lag = new Date().getTime();
		if(!pos) pos = -3;
		if(!id) id = false;

		// Calculate lag
		lag = (new Date().getTime() - lag)/1000;
		pos+=lag;

		if(id && provider.activeid !== id){
			console.log("playing a different video");
			var url = 'http://www.youtube.com/v/'+id+'?version=3';
			provider.player.loadVideoByUrl(url);
			provider.activeid = id;
			if(pos < 0){
				provider.player.seekTo(0);
				provider.player.pauseVideo();
				setTimeout(function(){
					provider.player.playVideo();
				},(-1000*pos))
			} else {
				provider.player.seekTo(pos);
				provider.player.playVideo();
			}
		} else {
			if(pos < 0){
				provider.player.seekTo(0);
				provider.player.pauseVideo();
				setTimeout(function(){
					provider.player.playVideo();
				},(-1000*pos))
			} else {
				provider.player.seekTo(pos);
				provider.player.playVideo();
			}
		}

		
	}
	provider.seek = function(to){
		if(!provider.player){
			return;
		}
		provider.player.seekTo(to);
	}
	provider.getTime = function(callback){
		if(!provider.player){
			if(callback)callback(-1);
			return;
		}
		if(callback)callback(provider.player.getCurrentTime());
	}

	/// Provider-specific methods/properties
	provider.apiready = false;
	provider.activeid = null;

	// Ready flag for youtube's api.
	window.onYouTubeIframeAPIReady = function(){
		provider.apiready = true;
	}

	bt.player.registerProvider(provider);

});