var path = require('path');
var zlib = require('zlib');
var fs = require('fs');
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
server.listen(63447);
var Datastore = require('nedb');

io.set('log level', 1); 

bt = {};
bt.db = {};
bt.db.playlist = new Datastore({ filename: path.join(__dirname,'db','playlist.db') });

// Configs
app.webroot = path.join(__dirname,'www');

// Handle index.
app.get('/', function (req, res) { res.sendfile(path.join(app.webroot,'index.html')); });
app.use(express.static(app.webroot));

bt.db.playlist.loadDatabase();

/*
var v1 = {
	videoId:"GqYR-cddwt4",
	videoTitle:"Celestia's%20Ballad%20(WolfOfSadness%20Remix)",
	videoLength:379,
	videoVia:"miggyb",
	videoType:"yt"	
}
bt.db.playlist.insert(v1, function (err, newDoc) {   // Callback is optional
	console.log(newDoc);
});
*/

// Load Playlist
bt.db.playlist.find({}, function (err, playlist) {

	bt.playlist = playlist;
	
	// Check if playlist import exists
	var importPath = 'videos.json';
	fs.exists(importPath, function(exists) { 
		console.log("Checking for 'videos.json' to import");
		if (exists) { 
			var importedNum = 0;
			var skippedNum = 0;
			console.log("Found; Attempting Import...");
			fs.readFile(importPath, function (err, data) {
				if (err) throw err;
				var imported = JSON.parse(data);
				for(var i in imported){
					(function(i){
						bt.db.playlist.find({ videoId: imported[i].videoid }, function (err, docs) {
						  if(docs.length == 0){
							bt.db.playlist.insert({
								videoId:imported[i].videoid,
								videoTitle:decodeURI(imported[i].videotitle),
								videoLength:imported[i].videolength,
								videoVia:imported[i].videovia,
								videoType:imported[i].videotype	
							}, function (err, newDoc) {   // Callback is optional
								if (err) throw err;
								importedNum++;
								console.log("Imported: "+importedNum);
							  // newDoc is the newly inserted document, including its _id
							  // newDoc has no key called notToBeSaved since its value was undefined
							});
						  } else {
							skippedNum++;
							//console.log("Skipped: "+skippedNum);
							//console.log(docs,"Exists");
						  }
						});
					})(i);
				}
				console.log("Import Complete!");
			});
		} else {
			console.log("Not found; Skipping Import");
		}
	}); 
});
bt.emitPlaylist = function(socket){
	socket.emit("recvPlaylist",{
		playlist:bt.playlist
	});
}

bt.deleteVideoById = function(id){
	for(var i in bt.playlist){
		if(bt.playlist[i]._id == id){
			console.log("deleting ",bt.playlist[i]);
			bt.playlist.splice(bt.playlist.indexOf(bt.playlist[i]),1);
			io.sockets.emit("deleteVideoById",{
				id:id
			});
			break;
		}
	}
}

bt.connectedUsers = 0;
io.sockets.on('connection', function (socket) {

	bt.connectedUsers++;
	io.sockets.emit("userCount",bt.connectedUsers);
	socket.on("disconnect",function(){
		bt.connectedUsers--;
		io.sockets.emit("userCount",bt.connectedUsers);
	});
	
	bt.emitPlaylist(socket);
	
	socket.on('my other event', function (data) {
		console.log(data);
	});
	
	socket.on('deleteVideo', function (data) {
		bt.deleteVideoById(data.id);
	});
  
});