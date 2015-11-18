var bt = (function (bt) {

	var player = {};
		
	var youtubeReady = new Q.Promise(function(resolve){
	
		// Make in-system hook.
		var APIReady = function(){
			resolve(arguments);
		}
		
		window.onYouTubeIframeAPIReady = function(){
			APIReady.call(player,arguments);
			delete window.onYouTubeIframeAPIReady;
		}
	
		var tag = document.createElement('script');
		tag.src = "https://www.youtube.com/iframe_api";
		var firstScriptTag = document.getElementsByTagName('script')[0];
		firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
		var can = document.getElementById("vidcanvas");
		var ytplaceholder = document.createElement('div');
		ytplaceholder.setAttribute("id","ytplaceholder");
		can.appendChild(ytplaceholder);
		
	});
	
	var innerPlayer = new Q.Promise(function(resolve){
		youtubeReady.done(function(){
			var ip = new YT.Player('ytplaceholder', {
				height: '100%',
				width: '100%',
				events: {
					'onReady': function(){
						resolve(ip);
						window.player = ip;
					},
				},
                playerVars:{
                    rel: false,
                    modestbranding: true,
                    autohide: 1,
                    showinfo: 0,
                }
			});
		});
	});
	
	// REQUIRED
	player.name = "youtube";
	player.play = function(key,time){
		return new Q.Promise(function(resolve,reject){
			innerPlayer.done(function(ip){
				if(time < 0){
					ip.loadVideoById(key, 0, "large");
					ip.pauseVideo();
					var delay = time * -1000;
					setTimeout(function(){
						console.log("waited",delay,"to play");
						ip.playVideo();
					},delay);
				} else {
					ip.loadVideoById(key, time, "large");
				}
			});
		});
	};
	
	// The naming here is a little confusing, but deal with it.
	var assignPlayer = function(){
		if(!bt.player){
			setTimeout(assignPlayer,100);
			return;
		}
		bt.player.register(player);
	}
	assignPlayer();
	

	return bt;
}(bt));