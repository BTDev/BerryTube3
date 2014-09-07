$(function(){

	// Load and connect to node
	$.getScript(window.location.protocol+"//"+window.location.host+"/socket.io/socket.io.js", function(data,status,jqxhr){

		if(jqxhr.status != 200){
			console.error("Could not connect to Node Server",status);
		}
		var socket = io(window.location.protocol+"//"+window.location.host+"/");

		// Build me a pinger, johnson!
		socket.ping = function(callback){
			var start = new Date().getTime();
			socket.once("pong",function(){
				console.log("got a pong");
				var stop = new Date().getTime();
				var delay = stop - start;

				// Create ping list if not already one
				if(!socket.pings) socket.pings = [];

				// Add ping
				socket.pings.push(delay);

				// shift last if over cap
				var cap = 5;
				if(socket.pings.length > cap) socket.pings.shift();

				// avg pings
				var sum = 0;
				for(var i = 0; i < socket.pings.length; i++){
				    sum += parseInt(socket.pings[i], 10); //don't forget to add the base
				}
				socket.avgping = sum/socket.pings.length;

				if(callback)callback(delay);
			});
			socket.emit("ping");
			console.log("pinging");
		}

		bt.socket = socket; // 4 DA MODDERZ


		// Start pings
		setInterval(function(){
			socket.ping(function(delay){
				console.log("ping of",delay,"ms, avg",socket.avgping,"ms");
			});
		},1000 * 60)

	});

	/*
	require(['playlist'],function(){
		bt.playlist.on("load",function(){
			console.log("playlist loaded!");
		})
		bt.playlist.on("add",function(data){
			console.log(data);
		})
	});
	*/

})
