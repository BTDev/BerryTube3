/*

	Create playlist object with a project config, a playlist DB already pre-configured, and a Video closure, for comparisons.

*/

events = require('events');

module.exports = function(bt,Video){

	//bt.config,bt.db.playlist,Video
	var config = bt.config
	var playlistdb = bt.db.playlist

	var playlist = new events.EventEmitter;
	playlist.db = playlistdb;
	playlist.name = "Playlist";
	playlist._first = null;
	playlist._active = null;
	playlist._last = null;
	playlist._length = 0;
	playlist._lookup = {};

	// Linked List Object

	playlist.add = function(after,video,callback){
		var self = this;

		if(!(video instanceof Video)) { playlist.emit('error',"must add a Video object"); return; }
		if(after && !(after instanceof Video)) { playlist.emit('error',"must use Video object or null for placement"); return; }
		//console.log("Adding video",video.data.tit,video.data._id);

		// Do we even have a playlist
		if(!playlist._first){

			// Setup first
			playlist._first = {
				prev:null,
				video:video,
				next:null
			};
			playlist._first.prev = playlist._first;
			playlist._first.next = playlist._first;

			// Copy ref to last
			playlist._last = playlist._first;

			// And active.
			playlist._active = playlist._first;

			// Adjust length
			playlist._length++;

			// Hook up the random-access helper
			playlist._lookup[video._id] = playlist._first;

			// Done!
			video.save(function(){ // Implicitly saves any new video added before callbacks, to ensure videos get an internal ID.
				self.emit("add",after,video);
				if(callback)callback();
			});
			return;
		} 

		// If "After" is null or undef, then add to end.
		var insertAfter = playlist._last;
		if(after){
			insertAfter = playlist._lookup[after._id];
			//console.log("inserting after",after._id);
		}

		// General Entry
		var entry = {
			prev:null,
			video:video,
			next:null
		}

		entry.next = insertAfter.next; 		// My next is his next
		entry.prev = insertAfter;			// My prev is him.

		insertAfter.next.prev = entry;		// His next's previous is me.
		insertAfter.next = entry;			// His next is me.

		// Check for end of list
		if(insertAfter == playlist._last){
			playlist._last = entry; // If we just inserted ourselves "after" the last element, the new element is the last one.
		}

		// Hook up the random-access helper
		playlist._lookup[video._id] = entry;

		// Adjust length
		playlist._length++;

		video.save(function(){ // Implicitly saves any new video added before callbacks, to ensure videos get an internal ID.
			self.emit("add",after,video);
			if(callback)callback();
		});

	}

	playlist.remove = function(video,callback){

		// Grab friends
		var prev = video.prev;
		var next = video.next;

		// Adjust Friends
		prev.next = next;
		next.prev = prev;

		// Update first/last as nessicary.
		if(playlist._last == video) { playlist._last = prev; }
		if(playlist._first == video) { playlist._first = next; }

		// Kill yourself.
		this.emit("remove",video);
		if(callback)callback(video);

	}

	playlist.autoSave = function(interval){

		if(!interval && playlist._autoSave){
			clearInterval(playlist._autoSave);
			return;
		}
		playlist._autoSave = setInterval(function(){
			playlist.save();
		},interval);

	}

	playlist.save = function(callback){
		var self = this;
		var flat = [];
		var elem = playlist._first;
		for(var i=0;i<playlist._length;i++){
			//console.log(elem);
			//elem.video.save();  This should be insured by the new add function save wrap.
			flat[i] = (elem.video.data._id);
			elem = elem.next;
		}
		//console.log(elem);
		playlist.db.update({ name: playlist.name }, { name: playlist.name, videos: flat }, { upsert: true }, function (err, numReplaced, upsert) {
			if(err) console.log(err);
			self.emit("save");
			if(callback) callback(err, numReplaced, upsert);
		});

	}

	playlist.load = function(callback){
		var self = this;
		playlist.db.findOne({ name: playlist.name }, function (err, doc) {

			if(err) {
				console.log(err);
				return;
			}

			if(!doc || doc.length == 0){
				self.emit("load");
				return;	
			} 

			var toadd = doc.videos;
			var last = null;

			var done = function(){
				self.emit("load");
				if(callback)callback();
			}

			var deque = function(){
				var videoid = toadd.shift();
				if(!videoid){
					done();
					return;
				}
				var vid = new Video(videoid,function(){		// Init the video
					playlist.add(last,vid,function(){	// Add to playlist
						if(toadd.length > 0){		// Check queue
							last = vid; // remember last one for placing.
							deque();
						} else {
							done();
						}
					});
					
				});
			}
			deque();

		});
	}

	playlist.get = function(videoid){
		return playlist._lookup[videoid];
	}

	playlist.getAll = function(){
		//console.log(playlist);
		var flat = [];
		var elem = playlist._first;
		for(var i=0;i<playlist._length;i++){
			flat[i] = (elem.video.data);
			//console.log(flat[i]);
			elem = elem.next;
		} 
		return flat;
	}

	//playlist.load(db);
	//console.log(playlist);
	return playlist;

};
