$(function(){

	// Load and connect to node
	$.getScript("http://127.0.0.1:3000/socket.io/socket.io.js", function(data,status,jqxhr){

		if(jqxhr.status != 200){
			console.error("Could not connect to Node Server",status);
		}
		var socket = io('http://127.0.0.1:3000/');
		window.socket = socket; // 4 DA MODDERZ

		// Rough, Thrown together as proof of concept.

		socket.on('pl:add', function (data) {
			console.log(data);
		});
		
		socket.on('bt:err', function (data) {
			console.log(data);
		});
		
		socket.on('pl:getall', function (data) {
			console.log(data);
		});

		//socket.emit('pl:add', { url: 'http://www.youtube.com/watch?v=woyqYP8b3Aw' });
		socket.emit('pl:getall');

	});

})
