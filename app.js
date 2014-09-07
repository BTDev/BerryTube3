// Tools
var path = require('path');

var bt = {} // Let there be light.
bt.config = require('./bt_data/config.js');

// Setup Net Services
bt.express = require('express');
bt.web = bt.express();
bt.server = require('http').Server(bt.web);
bt.io = require('socket.io')(bt.server);

// Setup Database
var Datastore = require('nedb');
bt.db = {};

// Enumerate
bt.db.user = new Datastore({ filename: bt.config.dbinfo._dir+bt.config.dbinfo.user.path, autoload: true });
bt.db.playlist = new Datastore({ filename: bt.config.dbinfo._dir+bt.config.dbinfo.playlist.path, autoload: true });
bt.db.video = new Datastore({ filename: bt.config.dbinfo._dir+bt.config.dbinfo.video.path, autoload: true });
for(var i in bt.db){
	bt.db[i].persistence.setAutocompactionInterval(bt.config.dbinfo[i].aci);
}

// Configure Playlist Controls
// Create Base Video Constructor
var Video = require('./bt_data/video.js')(bt);
// Load playlist and IO Modules
bt.playlist = require('./bt_data/playlist.js')(bt,Video);
bt.playlistIO = require('./bt_data/io/playlistIO.js')(bt);
bt.playlist.load();
bt.playlist.autoSave(1000 * 10);

// Load importer
bt.importer = require('./bt_data/importer.js')(bt,Video);

// do a thing
bt.playlist.on("load",function(){
	console.log("Loaded");
	bt.playlist.init();
	/*
	bt.importer.getVideo('https://www.youtube.com/watch?v=QIFn0wqZx7Y',function(video){
		//console.log(video,'main!');
		bt.playlist.add(null,video,function(){
			bt.playlist.save();
		});	
	})
	*/
});

// Misc IO
bt.miscIO = require('./bt_data/io/miscIO.js')(bt);

// Configure Web Provider
bt.web.engine('jade', require('jade').__express);
bt.web.set('views', __dirname + '/www/views')
bt.web.set('view engine', 'jade')
bt.web.use(bt.express.static(__dirname + '/www/dist'));

// ATTACH ROUTES HERE
bt.web.get('/',require('./routes/index.js'));

// Start Server
bt.server.listen(3000);

