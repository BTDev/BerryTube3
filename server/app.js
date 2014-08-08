var bt = {} // Let there be light.
bt.config = require('./bt_data/config.js');

// Setup Database
var Datastore = require('nedb');
bt.db = {};
// Enumerate
bt.db.user = new Datastore({ filename: bt.config.dbinfo.user.path, autoload: true });
bt.db.playlist = new Datastore({ filename: bt.config.dbinfo.playlist.path, autoload: true });
bt.db.video = new Datastore({ filename: bt.config.dbinfo.video.path, autoload: true });
for(var i in bt.db){
	bt.db[i].persistence.setAutocompactionInterval(bt.config.dbinfo[i].aci);
}

// Configure Playlist Controls

var Video = require('./bt_data/video.js')(bt.config,bt.db.video);
bt.playlist = require('./bt_data/playlist.js')(bt.config,bt.db.playlist,Video);
bt.playlist.load(function(){
	bt.playlist.save();
});


/*
for(var i=0;i<100;i++){
	(function(i){
		var v = new Video();
		v.data.tit = "Episode "+i;
		v.save(function(){
			//console.log(v);
			bt.playlist.add(null,v);	
		});
	})(i)
}

setTimeout(function(){bt.playlist.save();},3000);
*/
//setTimeout(function(){console.log(bt.playlist);},3000);
//v.save();