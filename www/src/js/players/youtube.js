require(['player'],function(){

	var provider = {};


	// REQUIRED
	provider.handle = "youtube";
	// To allow chrome/chromeless players.
	provider.chromeless = false; 
	provider.init = function(){
		$.getScript("https://www.youtube.com/iframe_api");
		console.log("Do any \"do once\" stuff here.");
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

		// Kill the child.
		provider.dom.children().remove();

		console.log("Youtube got",data);

		if(provider.chromeless){
			provider.iframe = $("<iframe/>").attr("id","youtube-iframe").attr("src","https://www.youtube.com/embed/"+id+"?version=3&enablejsapi=1&controls=0&showinfo=0");
		} else {
			provider.iframe = $("<iframe/>").attr("id","youtube-iframe").attr("src","https://www.youtube.com/embed/"+id+"?version=3&enablejsapi=1");
		}

		provider.iframe.appendTo(provider.dom);
		provider.player = new YT.Player('youtube-iframe',{
			events:{
				'onReady': function(){
					provider.player.playVideo()
				}, 
			}
		});

		// console.log(provider.player);

		window.xx = provider.player;

	}



	/// Provider-specific methods/properties
	provider.apiready = false;
	provider.videoready = false;

	// Ready flag for youtube's api.
	window.onYouTubeIframeAPIReady = function(x){
		provider.apiready = true;
		console.log(x);
	}

	bt.player.registerProvider(provider);

});