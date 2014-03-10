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

bt.playlist = {};

// Configs
app.webroot = path.join(__dirname,'www');

// Handle index.
app.get('/', function (req, res) { res.sendfile(path.join(app.webroot,'index.html')); });
app.use(express.static(app.webroot));

bt.db.playlist.loadDatabase();
bt.db.playlist.persistence.setAutocompactionInterval(1000 * 60);

// Load Playlist
/*

	When the playlist is loaded, it must be dumped into an associative object.
	Then everyone is linked up.

*/
bt.db.playlist.find({}).sort({ top: -1 }).exec(function (err, docs) {
	
	console.log("Compiling Playlist");
	
	/*
		Since we sorted by top in the query, the 0th object will be the top of the playlist.
		If it isnt, then nobody is the top, and it should default to the 0th one anyway.
	*/
	bt.playlist.init(docs);

	/*Object.keys(bt.playlist.videos).forEach(function(key) {
		var val = bt.playlist[key];
		console.log(key,val);
	});
	*/
});
bt.playlist.inflateHeap = function(){
	for(var i in bt.playlist.heap){
		if(bt.playlist.heap[i].next){ 
			var _t = bt.playlist.heap[i].next;
			if(_t in bt.playlist.heap){
				bt.playlist.heap[i].next = bt.playlist.heap[_t];
			} else {
				console.log("Critical Error, Linked Video not in heap");
			}
		} else { 
			// Broken Link. Append to end.
			bt.playlist.append(bt.playlist.heap[i]); 
		}
		if(bt.playlist.heap[i].prev){ 
			var _t = bt.playlist.heap[i].prev;
			if(_t in bt.playlist.heap){
				bt.playlist.heap[i].prev = bt.playlist.heap[_t];
			} else {
				console.log("Critical Error, Linked Video not in heap");
			}
		} else { 
			// Broken Link. Append to end.
			bt.playlist.append(bt.playlist.heap[i]);
		}
	}
}
bt.playlist.serializeVideo = function(video){
	var r = {};
	for(var i in video){
		console.log(i,video[i]);
		if(i == "next" && video[i].next && typeof video[i].next == "object") { r.next = video[i].next._id; continue; }
		if(i == "prev" && video[i].prev && typeof video[i].prev == "object") { r.prev = video[i].prev._id; continue; }
		r[i] = video[i];
	}
	return r;
}
bt.playlist.serializeHeap = function(){
	var r = [];
	var elem = bt.playlist.first;
	do{
		console.log("Linking",elem.videoTitle,">>",elem.next.videoTitle)
		r.push(bt.playlist.serializeVideo(elem));
		elem = elem.next;
	} while (elem != bt.playlist.first);
	return r;
}
bt.playlist.save = function(){
	for(var i in bt.playlist.heap){
		(function(i){
			bt.db.playlist.update({ _id: bt.playlist.heap[i]._id }, bt.playlist.serializeVideo(bt.playlist.heap[i]), {}, function (err, numReplaced) {

			});
		})(i);
	}
}
bt.playlist.append = function(source){
	// Broken Link. Append to end.
	source.prev = bt.playlist.last;
	source.next = bt.playlist.first;
	bt.playlist.last.next = source;
	bt.playlist.first.prev = source;
	bt.playlist.last = source;
}
bt.playlist.insertAfter = function(target,source){
	
}
bt.playlist.init = function(videos){

	// Placing all videos on heap..
	console.log("Loading heap");
	bt.playlist.heap = {};
	
	// There is -always- a first, current, and last video, and that video will always have a next/prev combo.
	bt.playlist.first = videos[0];
	bt.playlist.last = videos[0];
	bt.playlist.current = videos[0];
	for(var i in videos){
		videos[i].top = 0;
		bt.playlist.heap[videos[i]._id] = videos[i];
	}
	bt.playlist.inflateHeap();
	videos[0].top = 1;
			
	console.log("I am "+videos[0].videoTitle+". Next is "+videos[0].next.videoTitle);

	//bt.playlist.save();
	
}

bt.emitPlaylist = function(socket){
	socket.emit("recvPlaylist",{
		playlist:bt.playlist.serializeHeap()
	});
}

bt.deleteVideoById = function(id){
	for(var i in bt.playlist.videos){
		if(bt.playlist.videos[i]._id == id){
			console.log("deleting ",bt.playlist.videos[i]);
			bt.playlist.videos.splice(bt.playlist.videos.indexOf(bt.playlist.videos[i]),1);
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