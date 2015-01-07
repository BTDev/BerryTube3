 require(['#chatpane','socket','eventEmitter'],function(){

	// Inherit from eventEmitter
	var chat = new bt.eventEmitter();
	chat.maxbuffer = 15;
	
	chat.dom = $("#chatpane");
	chat.buffer = $("#chatbuffer");
	chat.input = $("#chatinput input");

	// Define Methods	
	chat.bufferMessage = function(message){
		if(!message) return;
		if(!message.from) return;
		if(!message.words) return;
		
		console.log("bufferMessage",message);
		this.emit("bufferMessage",message);
		
		var newMessage = $("<div/>").addClass("message");
		var from = $("<span/>").addClass("from").text(message.from+": ").appendTo(newMessage);
		var words = $("<span/>").addClass("words").text(message.words).appendTo(newMessage);
		
		chat.buffer.append(newMessage);
		
		while(chat.buffer.children().length > chat.maxbuffer) {
			chat.buffer.children().first().remove();
		}
	}
	
	chat.sendMessage = function(message){
		bt.socket.emit('ch:send', message);
	}

	/// Hook Socket events
	bt.socket.on('ch:send', function (data) { chat.bufferMessage(data);	} );

	
	/// Attach DOM events
	chat.input.keydown(function (e){ if(e.keyCode == 13){ chat.input.trigger("send"); } });
	chat.input.on("send",function(){
		if(chat.input.val().length <= 0) return;
		var msg = chat.input.val();
		chat.input.val("");
		chat.sendMessage({
			words:msg
		});
	});

	// Any initial events


	// "return" playlist.
	bt.chat = chat;

});