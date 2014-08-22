// Wait for the socket
require(['#playlist .queue','#playlist .list','socket','eventEmitter'],function(){

	// Inherit from eventEmitter
	var playlist = new bt.eventEmitter();
	playlist.dom = $("#playlist");
	playlist.list = $("#playlist .list");

	// Define Methods

	playlist.recv_add = function(data,callback){

		/// TODO: Needs to check for data.after for queues. null = end of list.
		if(!data.video)return;
		var newEntry = $("<div/>")

		// Attrs
		newEntry.attr("id",data.video._id);
		newEntry.attr("data-provider",data.video.pro);
		newEntry.attr("videoid",data.video.vid);

		// Elems
		var _title = $("<div/>").addClass("title").text(data.video.tit).appendTo(newEntry);
		
		// Fix Scrollbar
		playlist.list.perfectScrollbar('update');
		//playlist.jsp.reinitialise();

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

	playlist.getall = function(data,callback){

		var self = this;
		playlist.list.children().remove(); // yeah, fuck you
		
		// Async Queue of all videos
		/* 
			Im not 100% on the science, but i feel like doing this async
			makes the page lockup less than a for() would. Also allows 
			playlist.add to be async later in life if it chooses to
			like the proud black woman it is.
		*/
		var done = function(){
			self.emit("load");
		}
		var deque = function(){
			var video = data.shift();
			if(!video){	done();	return;	}
			playlist.recv_add({video:video},function(){	// Add to playlist
				if(data.length > 0){		// Check queue
					deque();
				} else {
					done();
				}
			});

		}
		deque();

	}

	/// Hook Socket events
	bt.socket.on('pl:add', function (data) 		{ playlist.recv_add(data); } );
	bt.socket.on('pl:getall', function (data) 	{ playlist.getall(data); } );

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
	playlist.list.perfectScrollbar({
		wheelSpeed: 20,
		wheelPropagation: true,
		minScrollbarLength: 20
	});

	// Any initial events
	bt.socket.emit('pl:getall'); // Get Playlist

	// "return" playlist.
	bt.playlist = playlist;

});