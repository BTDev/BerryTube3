// Wait for the socket
require(['#playlist .queue','#playlist .list','socket','eventEmitter'],function(){

	// Inherit from eventEmitter
	var playlist = new bt.eventEmitter();
	playlist.dom = $("#playlist");
	playlist.frame = $("#playlist .frame");
	playlist.list = $("#playlist .list");


	// Define Methods

	playlist.recv_add = function(data,callback){

		/// TODO: Needs to check for data.after for queues. null = end of list.
		if(!data.video)return;
		var newEntry = $("<div/>");

		// Class
		newEntry.addClass("track");

		// Attrs
		newEntry.attr("id",data.video._id);
		newEntry.attr("data-provider",data.video.pro);
		newEntry.attr("videoid",data.video.vid);

		// Elems
		var _title = $("<div/>").addClass("title").text(data.video.tit).appendTo(newEntry);
		
		// Fix Scrollbar
		playlist.scrollbar.update();

		// Finish Up
		playlist.list.append(newEntry);
		if(callback)callback(data);
		this.emit("add",data);

	}

	playlist.send_add = function(url,callback){

		if(!url)return;
		console.log('emitting','pl:add',url);
		bt.socket.emit("pl:add",{
			url:url
		});

	}

	playlist.setActive = function(videoid){
		//console.log(videoid);
		playlist.list.find(".active").removeClass("active");
		$("#"+videoid).addClass("active");
		this.emit("setactive",{videoid:videoid});
	}

	playlist.getall = function(data,callback){

		var self = this;
		var videos = data.videos;
		var active = data.activeid;
		playlist.list.children().remove(); // yeah, fuck you
		
		// Async Queue of all videos 
		/* 
			Im not 100% on the science, but i feel like doing this async
			makes the page lockup less than a for() would. Also allows 
			playlist.add to be async later in life if it chooses to
			like the proud black woman it is.
		*/
		var deque = function(){
			var video = videos.shift();
			if(!video){	done();	return;	}
			playlist.recv_add({video:video},function(){	// Add to playlist
				if(videos.length > 0){		// Check queue
					deque();
				} else {
					done();
				}
			});

		}
		var done = function(){
			playlist.setActive(active);
			self.emit("load",{videoid:active});
		}
		deque();

	}

	// return active video id
	playlist.getActive = function(){
		return playlist.list.find(".active").attr("id"); //should this really do a dom lookup, or should it keep the answer in memory?
	}

	playlist.jump = function(data){
		console.log("jump not fully yet implemented",data);
		var videoid = data.videoid;
		playlist.setActive(videoid);
		this.emit("jump",{videoid:videoid});
	}

	/// Hook Socket events
	bt.socket.on('pl:add', function (data) 		{ playlist.recv_add(data); } );
	bt.socket.on('pl:getall', function (data) 	{ playlist.getall(data); } );
	bt.socket.on('pl:jump', function (data) 	{ playlist.jump(data); } );

	/// Attach DOM events
	$("#playlist .queue").keypress(function(e) {
		if(e.which == 13) {
			if($("#playlist .queue").val().length){
				var url = $("#playlist .queue").val();
				console.log(url);
				bt.playlist.send_add(url);
				$("#playlist .queue").val("");
			}
		}
	});

	// Attach Fancy Scrollbar
	playlist.frame.tinyscrollbar({
		wheelSpeed:200,
		thumbSize: 20
	});
	playlist.scrollbar = playlist.frame.data("plugin_tinyscrollbar");
	
	// Any initial events
	bt.socket.emit('pl:getall'); // Get Playlist

	// "return" playlist.
	bt.playlist = playlist;

});