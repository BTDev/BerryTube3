

module.exports = function(config,db){

	var Video = require('./video.js')(config);
	var Datastore = require('nedb');

	var playlist = {};
	playlist.db = new Datastore({ filename: config.dbinfo.playlist_db_path, autoload: true });
	playlist._first = null;
	playlist._active = null;
	playlist._last = null;
	playlist._lookup = {};

	playlist.add = function(after,video,callback){

		// video must have at _least_ provider and videoid
		if(typeof video.videoid == 'undefined') { playlist.trigger('error',"Must have videoid"); return; }
		if(typeof video.provider == 'undefined') { playlist.trigger('error',"Must have provider"); return; }
		console.log("Add video",video,"after",after);
		
		var newVid = new Video(video);
		console.log(newVid);

		// Do we even have a playlist
		if(!playlist._first){
			playlist._first = newVid;
		}

		newVid.save();

	}

	playlist.load = function(db){
		console.log(db);
	}

	playlist.trigger = function(event,message){
		console.log(event,message);
	}

	playlist.load(db);
	return playlist;

};
