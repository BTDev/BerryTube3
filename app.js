var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
server.listen(63447);

// Configs
app.webroot = __dirname + '/www';

// Handle index.
app.get('/', function (req, res) { res.sendfile(app.webroot + '/index.html'); });
app.use(express.static(app.webroot));

io.sockets.on('connection', function (socket) {
  socket.emit('news', { hello: 'world' });
  socket.on('my other event', function (data) {
    console.log(data);
  });
});