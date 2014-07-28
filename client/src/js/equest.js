$(function(){

	// Load and connect to node
	$.getScript("//"+window.location.hostname+":1337/socket.io/socket.io.js", function(data,status,jqxhr){
		console.log(data,status,jqxhr);
		if(jqxhr.status != 200){
			console.error("Could not connect to Node Server",status);
		}
	})

	//$("<div/>").text("eat shit lol").dialog();
	console.log("loaded");
})
