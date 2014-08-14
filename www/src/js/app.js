$(function(){

	// Load and connect to node
	$.getScript(window.location.protocol+"//"+window.location.host+"/socket.io/socket.io.js", function(data,status,jqxhr){

		if(jqxhr.status != 200){
			console.error("Could not connect to Node Server",status);
		}
		var socket = io(window.location.protocol+"//"+window.location.host+"/");
		bt.socket = socket; // 4 DA MODDERZ

	});

	require(['playlist'],function(){
		bt.playlist.on("load",function(){
			console.log("playlist loaded!");
		})
		bt.playlist.on("add",function(data){
			console.log(data);
		})
	});

})
