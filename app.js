var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
server.listen(63447);

bt = {};

// Configs
app.webroot = __dirname + '/www';

// Handle index.
app.get('/', function (req, res) { res.sendfile(app.webroot + '/index.html'); });
app.use(express.static(app.webroot));

bt.connectedUsers = 0;
io.sockets.on('connection', function (socket) {
	bt.connectedUsers++;
	io.sockets.emit("userCount",bt.connectedUsers);
	socket.on("disconnect",function(){
		bt.connectedUsers--;
		io.sockets.emit("userCount",bt.connectedUsers);
	});
	socket.emit('init', { 
		users: [
			{name:"One"},
			{name:"Two"},
			{name:"Cades"}
		]
	});
	socket.on('my other event', function (data) {
		console.log(data);
	});
	var tick = 0;
	setInterval(function(){
		socket.emit('tick',tick++);
	},1000);
  
});