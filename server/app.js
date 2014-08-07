var bt = {} // Let there be light.
bt.config = require('./bt_data/config.js');

// Setup Database
var Datastore = require('nedb');
bt.db = {};
bt.db.users = new Datastore({ filename: bt.config.dbinfo.user_db_path, autoload: true });
//console.log(bt.config);

// Configure Playlist Controls
//bt.playlist = require('./bt_data/playlist.js')(bt.config,Datastore);
//bt.playlist.add(0,{provider:"youtube",videoid:"QIFn0wqZx7Y"})

var Video = require('./bt_data/video.js')(bt.config);
var v = new Video();
v.load("7BIEhsdww9OS0S5d",function(){
	v.data.tit = "Kek saved";
	v.save();
});

//v.save();