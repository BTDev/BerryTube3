// Wait for the socket
require(['socket','eventEmitter'],function(){

	// Inherit from eventEmitter
	var playlist = new bt.eventEmitter();
	playlist.dom = $("#playlist");

	// Define Methods
	playlist.add = function(data,callback){

		/// TODO: Needs to check for data.after for queues. null = end of list.
		if(!data.video)return;
		var newEntry = $("<div/>")

		// Attrs
		newEntry.attr("id",data.video._id);
		newEntry.attr("data-provider",data.video.pro);
		newEntry.attr("videoid",data.video.vid);

		// Elems
		var _title = $("<div/>").addClass("title").text(data.video.tit).appendTo(newEntry);
		
		// Finish Up
		playlist.dom.append(newEntry);
		callback(data);
		this.emit("add",data);

	}

	playlist.getall = function(data,callback){

		var self = this;
		playlist.dom.children().remove(); // yeah, fuck you
		
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
			playlist.add({video:video},function(){	// Add to playlist
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
	bt.socket.on('pl:add', function (data) 		{ playlist.add(data); } );
	bt.socket.on('pl:getall', function (data) 	{ playlist.getall(data); } );

	// Any initial events
	bt.socket.emit('pl:getall'); // Get Playlist

	// "return" playlist.
	bt.playlist = playlist;

});