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
		var called = +new Date();
		return new Q.Promise(function(resolve,reject){
			innerPlayer.done(function(ip){
				bt._('util').then(function(util){
					
					var halfPing = (util.getPing() / 2000);
					var now = +new Date();
					var delta = (now - called) / 1000;
					//console.log('delta = (now - called) / 1000',now,"-",called,"=",delta);
					//console.log("basetime",time,"ping",halfPing,"delta",delta);
				
					time = time + halfPing + delta; 
					if(time < 0){
						ip.loadVideoById(key, 0, "large");
						ip.pauseVideo();
						var delay = time * -1000;
						setTimeout(function(){
							//console.log("waited",delay,"to play");
							ip.playVideo();
						},delay);
					} else {
						var data = ip.getVideoData();
						if(data && data.video_id == key){
							player.seek(time);
						} else {
							ip.loadVideoById(key, time, "large");
						}
						
					}
				
				});
			});
		});
	};
	player.seek = function(time,force){
		innerPlayer.done(function(ip){
			var distance = Math.abs(ip.getCurrentTime() - time);
			if(force || distance > 1){
				ip.seekTo(time);
			}
		})
	}
	
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