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
bt.db.playlist.find({}).sort({ order: 1 }).exec(function (err, docs) {
	console.log("Compiling Playlist");
	bt.playlist.init(docs);
});
bt.playlist.append = function(video){

	// Add to videoheap
	bt.playlist.heap[video._id] = video;
	// Ensure a few things.
	if(bt.playlist.length == 0){
		// Only video? skip the append actually. just set it up.
		bt.playlist.active = video;
		bt.playlist.first = bt.playlist.active;
		bt.playlist.last = bt.playlist.active;
		bt.playlist.last.next = bt.playlist.first;
		bt.playlist.last.prev = bt.playlist.first;
		bt.playlist.first.next = bt.playlist.last;
		bt.playlist.first.prev = bt.playlist.last;
		bt.playlist.length++;
		return;
	}

	// Appending happens at the end.
	video.next = bt.playlist.last.next;
	video.prev = bt.playlist.last;
	bt.playlist.last.next.prev = video;
	bt.playlist.last.next = video;
	bt.playlist.last = video;
	bt.playlist.length++;
	// click!
	
	
	//console.log(video);
}

bt.playlist.init = function(videos){
	bt.playlist.length = 0;
	bt.playlist.heap = {};
	for(var i in videos){
		bt.playlist.append(videos[i]);
	}
	bt.playlist.save();
}
bt.playlist.save = function(){
	var i = 0;
	var elem = bt.playlist.first;
	do {
		(function(elem,i){
			elem.order = i;
			bt.db.playlist.update({ _id: elem._id }, bt.playlist.deflate(elem), {}, function (err, numReplaced) {
				if(err) console.error(err);
				//else console.log(surrogate.videoTitle+" Saved");
			});
		})(elem,i++);
		elem = elem.next;
	} while(elem != bt.playlist.first);
}
bt.playlist.deflate = function(video){
	var surrogate = {};
	for(var attr in video){
		if(attr == 'next') continue;
		if(attr == 'prev') continue;
		surrogate[attr] = video[attr];
	}
	return surrogate;
}
bt.playlist.deflateHeap = function(){
	var surrogate = [];
	var elem = bt.playlist.first;
	do {
		surrogate.push(bt.playlist.deflate(elem));
		elem = elem.next;
	} while(elem != bt.playlist.first);
	return surrogate;
}
bt.playlist.emitFull = function(socket){
	socket.emit("recvPlaylist",{
		playlist:bt.playlist.deflateHeap()
	});
}
bt.playlist.remove = function(video){
	// relink neighbours
	video.next.prev = video.prev;
	video.prev.next = video.next;
	// ensure first/last associations stick.
	if(bt.playlist.last == video) bt.playlist.last = video.prev;
	if(bt.playlist.first == video) bt.playlist.first = video.next;
	// delete from DB
	bt.db.playlist.remove({ _id: video._id }, {}, function (err, numRemoved) {
		// Remove from heap
		delete bt.playlist.heap[video._id];
		console.log(video._id);
		io.sockets.emit('deleteVideo',{id:video._id});
	});
}
bt.playlist.deleteVideoById = function(id){
	var elem = bt.playlist.heap[id];
	bt.playlist.remove(elem);
}
bt.playlist.at = function(index){
	var elem = bt.playlist.first;
	var i = 0;
	do {
		if(i++ == index){
			return elem;
		}
		elem = elem.next;
	} while(elem != bt.playlist.first);
	return bt.playlist.last;
}

bt.connectedUsers = 0;
io.sockets.on('connection', function (socket) {

	bt.connectedUsers++;
	
	io.sockets.emit("userCount",bt.connectedUsers);
	
	socket.on("disconnect",function(){
		bt.connectedUsers--;
		io.sockets.emit("userCount",bt.connectedUsers);
	});
	
	bt.playlist.emitFull(socket);
	
	socket.on('my other event', function (data) {
		console.log(data);
	});
	
	socket.on('deleteVideo', function (data) {
		bt.playlist.deleteVideoById(data.id);
	});
	
	socket.on('moveVideo', function (data) {
		console.log(data);
		var video = bt.playlist.heap[data.fromId];
		var replace = bt.playlist.heap[data.toId];
		var vo = video.order;
		var ro = replace.order;
		if(video == replace) return;
		console.log(vo,"to replace",ro);
		if(video.order > replace.order){ // Moving video UP, so link AFTER.
			// Handle Caps
			if(bt.playlist.first == video) bt.playlist.first = video.next;
			if(bt.playlist.last == video) bt.playlist.last = video.prev;
			// Fix old links.
			video.prev.next = video.next; // Link previous to next
			video.next.prev = video.prev; // Link next toprevious
			// Insert Self [](/fry)
			video.next = replace.next;
			video.prev = replace;
			video.next.prev = video;
			video.prev.next = video;
			if(bt.playlist.first == replace) bt.playlist.first = video;
		} else if(video.order < replace.order){ // Moving video DOWN, so link BEFORE.
			// Handle Caps
			if(bt.playlist.first == video) bt.playlist.first = video.next;
			if(bt.playlist.last == video) bt.playlist.last = video.prev;
			// Fix old links.
			video.prev.next = video.next; // Link previous to next
			video.next.prev = video.prev; // Link next toprevious
			// Insert Self [](/fry)
			video.next = replace.next;
			video.prev = replace;
			video.next.prev = video;
			video.prev.next = video;
			if(bt.playlist.last == replace) bt.playlist.last = video;
		}
		bt.playlist.save();
		io.sockets.emit('moveVideo',{
			fromId:data.fromId,
			toId:data.toId,
			fromOrder:vo,
			toOrder:ro
		});
		
	});
  
});