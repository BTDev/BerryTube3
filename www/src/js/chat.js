/**
	Chat Module. Handles chatting, polls, and so on.
*/
var bt = (function (bt,module_name) {

	const DOMID_CHAT_BUFFERS = "chatbuffers";
	const DOMID_CHAT_INPUT = "chatinput";
	const DOMID_CHAT_LOGIN_USERNAME = "loginusername";
	const DOMID_CHAT_LOGIN_PASSWORD = "loginpassword";
	const DOMID_CHAT_LOGIN_BUTTON = "loginbutton";
	const DOMID_CHAT_LOGIN_REMEMBER = "remember-me";
	const DOMID_CHAT_REGISTER_BUTTON = "registerbutton";
	const BUFFER_SIZE = 100;
	const HISTORY_SIZE = 100; //cause why not.

	var chat = bt.chat = { e:bt.register(module_name) }; 
	var history = [];
	var tempHistory = ""; // placeholder for accidential ups

	chat.error = function(msg){
		chat.recvMessage({ username: "**System**", message:msg, classes:["error"] });
	}
	
	// making this a promise to avoid race nonsense
	chat.getChatControls = Q.Promise(function(resolve,reject){
				
		var find = function(){
			
			// define buffers
			var buffers = document.getElementById(DOMID_CHAT_BUFFERS);
			if(!buffers) return false;
			
			// define input
			var input = document.getElementById(DOMID_CHAT_INPUT); 
			if(!input) return false;
			
			// define input
			var username = document.getElementById(DOMID_CHAT_LOGIN_USERNAME); 
			if(!username) return false;
			
			// define input
			var password = document.getElementById(DOMID_CHAT_LOGIN_PASSWORD); 
			if(!password) return false;
			
			// define input
			var loginbtn = document.getElementById(DOMID_CHAT_LOGIN_BUTTON); 
			if(!loginbtn) return false;
			
			// define input
			var loginremember = document.getElementById(DOMID_CHAT_LOGIN_REMEMBER); 
			if(!loginremember) return false;
			
			// define input
			var regbtn = document.getElementById(DOMID_CHAT_REGISTER_BUTTON); 
			if(!regbtn) return false;
			
			return { 
				buffers:buffers,
				input:input,
				username:username,
				password:password,
				loginbtn:loginbtn,
				loginremember:loginremember,
				regbtn:regbtn,
			}
			
		};
		
		var interv = setInterval(function(){
			var controls = find();
			if(controls) {
				clearInterval(interv);
				resolve(controls);
			}
		},100);
		
	});

	
	// attach some events
	chat.e.message = function(data){
		chat.recvMessage(data);
	}
	// attach some events
	chat.e.scrollback = function(data){
		for(var i=0;i<data.length;i++) chat.recvMessage(data[i]);
	}
	
	// attach some events
	chat.e.curate = function(data){
		console.log(data);
		chat.bufferMap = chat.bufferMap || {};
		for(var i=0;i<data.rm.length;i++){
			if(chat.bufferMap[data.rm[i]]) {
				var dmw = chat.bufferMap[data.rm[i]];
				dmw.previousSibling.classList.remove("addendum");
				dmw.parentNode.removeChild(dmw); 
			}
		}
	} 
	
	chat.recvMessage = function(data){
		 
		chat.getChatControls.done(function(controls){
		
			// Grab correct buffer
			var channel = data.channel || "root";
			for(var i=0;i<controls.buffers.children.length;i++){
				var elem = controls.buffers.children[i];
				if(elem.getAttribute('data-channel-id') == channel){
					var newMsg = chat.newMsg(data,elem);
					break;
				}
			};
			
		});
	}
	
	chat.sendMessage = function(str){
				
		chat.addHistory(str);
		var p = bt.rawEmit(module_name,"message",{
			message:str
		});
		
		p.catch(function(e){
			chat.error(e);
			console.error("Failed to post message:",e);
		});
		
		return p;
	}
	
	chat.newMsgElement = function(name,elem){
		var x = document.createElement("span");
		x.classList.add(name);
		elem.appendChild(x);
		return x;
	}
	
	// Setup a collection of renderers, presumably someone could override these for whatever they want.
	chat.renderers = {};
	chat.renderers.timestamp = function(data){
		
		var padZeros = function(digits,num){
			num = ""+num;
			while(num.length < Math.abs(digits)){
				if(digits > 1) num = "0" + num;
				else num = num + "0"; 
			} 
			return num;
		}
		
		var date = new Date(data);
		if(!(date instanceof Date && !isNaN(date.valueOf()))){
			var date = new Date();
		}
		
		var d = padZeros(2,date.getHours()) + ":" + padZeros(2,date.getMinutes()) + ":" + padZeros(2,date.getSeconds());
		
		return d;
		
	}
	
	chat.fieldRender = function(fname,data){
		if(chat.renderers[fname]) return chat.renderers[fname](data);
		return data;
	}
	
	chat.newMsg = function(data,channel){
		
		// Before anything else, let's remember if we're docked to the bottom
		var scroll = false;
		console.log(channel.scrollTop + channel.clientHeight,channel.scrollHeight)
		if(channel.scrollHeight - (channel.scrollTop + channel.clientHeight) < 10 ){ scroll = true; }
		
		// Grab an old message element if we're at our buffer size.
		var msg = false;
		if(channel.children.length >= BUFFER_SIZE){
			msg = channel.children[0];
		} else {
			msg = document.createElement("div"); 
		}
		
		// set classes
		msg.className = "";
		msg.classList.add("chatline");
		if(data.classes) data.classes.forEach(function(cl){
			msg.classList.add(cl);
		});
		if(data.id) msg.setAttribute("chatid",data.id);
		
		// assign to buffer
		chat.bufferMap = chat.bufferMap || {};
		chat.bufferMap[data.id] = msg; 
		 
		// set values
		msg.domvals = msg.domvals || {};
		msg.domvals.timestamp = data.timestamp || new Date();
		msg.domvals.username = data.username || "";
		msg.domvals.message = data.message || "";
		
		// ensure
		msg.domlist = msg.domlist || {};
		msg.domlist.timestamp = msg.domlist.timestamp || chat.newMsgElement("timestamp",msg)
		msg.domlist.username = msg.domlist.username || chat.newMsgElement("username",msg)
		msg.domlist.message = msg.domlist.message || chat.newMsgElement("message",msg)
		
		// render
		msg.domlist.timestamp.innerHTML = chat.fieldRender("timestamp",msg.domvals.timestamp);
		msg.domlist.username.innerHTML = chat.fieldRender("username",msg.domvals.username);
		msg.domlist.message.innerHTML = chat.fieldRender("message",msg.domvals.message);
		
		// Handle addendums
		if(chat.lastSpeaker && chat.lastSpeaker == msg.domvals.username){
			msg.classList.add("addendum");
		}
		chat.lastSpeaker = msg.domvals.username;
		
		// Add to the bottom of the chat.
		channel.appendChild(msg);
		
		chat.lastSpeaker = msg.domvals.username;
		
		// if we previously determined we should scroll, then do it.
		if(scroll) channel.scrollTop = channel.scrollHeight;
		
		return msg;
		
	};
	
	chat.sendFromDom = function(e){
		if(e && e.keyCode != 13) return false;
		var message = this.value;
		this.value = "";
		chat.sendMessage(message);
		return false;
	}
	
	chat.loginFromDom = function(e){
		if(e && e.keyCode != 13) return false;
		chat.getChatControls.done(function(controls){
			bt.user.login(controls.username.value,controls.password.value,!!controls.loginremember.checked).then(function(){
				controls.username.value = "";
				controls.password.value = "";
			},function(e){
				bt.log(e);
			});
		});
		return false;
	}
	
	chat.registerFromDom = function(e){
		if(e && e.keyCode != 13) return; 
		chat.getChatControls.done(function(controls){
			bt.user.register(controls.username.value,controls.password.value).then(function(){
				chat.loginFromDom();
			},function(e){
				bt.log(e);
			});
		});
	}
	
	chat.seekHistoryFromDom = function(e){
		if(e && e.keyCode == 38) { // Up
			chat.getChatControls.done(function(controls){
				controls.input.value = chat.loadHistory(controls.input.value,1);
			});
		}
		if(e && e.keyCode == 40) { // Down
			chat.getChatControls.done(function(controls){
				controls.input.value = chat.loadHistory(controls.input.value,-1);
			});
		}
	}
	
	chat.addHistory = function(str){
		chat.historyCursor = -1;
		history.unshift(str);
		console.log(history);
	}
	
	chat.loadHistory = function(current,skip){
		if(typeof chat.historyCursor == "undefined") chat.historyCursor = -1; // -1 being now
		if(chat.historyCursor == -1) tempHistory = current;
		chat.historyCursor = Math.max(Math.min(history.length-1,chat.historyCursor + skip),-1);
		if(chat.historyCursor == -1) return tempHistory;
		return history[chat.historyCursor];
	}
	
	function getWordAtPos(str,pos){
	  
		if(pos >= str.length) pos--;
		var start = end = pos;
		//whitespace is considered part of the previous word

		if(!str[start]) return false;
		
		if(str[start].match(/\s/)) start = Math.max(start-1,0);
		while(start > 0 && (str[start].match(/\w/))){
			start--;
		}
		if(str[start].match(/\s/)) start++;

		while(end < str.length && (str[end].match(/\w/))){
			end++;
		}

		return {
			str:str,
			word:str.slice(start,end),
			start:start,
			end:end
		}
		
	}

	function spliceSlice(str, index, count, add) {
	  return str.slice(0, index) + (add || "") + str.slice(index + count);
	}
	
	function setCaretPosition(elem, caretPos) {
		if(elem != null) {
			if(elem.createTextRange) {
				var range = elem.createTextRange();
				range.move('character', caretPos);
				range.select();
			}
			else {
				if(elem.selectionStart) {
					elem.focus();
					elem.setSelectionRange(caretPos, caretPos);
				}
				else
					elem.focus();
			}
		}
	}
	
	chat.tabCompleteUsername = function(e){
		
		if(!e || e.keyCode != 9) {
			chat.tabIndex = 0;
			chat.tabCandidates = [];
			return;  
		}
		e.preventDefault();
		chat.tabCandidates = chat.tabCandidates || [];
		chat.tabIndex = chat.tabIndex || 0;
				
		if(chat.tabCandidates.length == 0){
			
			chat.tabCursorInfo = getWordAtPos(this.value,this.selectionStart);
			if(!chat.tabCursorInfo || chat.tabCursorInfo.word == "") return;

			// returns a list of user objects. 
			var response = bt.userlist.getUsers();
			
			var candidates = []
			for(var i=0;i<response.length;i++){
				if(new RegExp("^"+chat.tabCursorInfo.word,"i").exec(response[i].username)){
					// TODO: if response[i].username is our username, we shouldnt add it. Self squees are dumb.
					candidates.push(response[i].username);
				}
			}
			
			chat.tabIndex = 0;
			chat.tabCandidates = candidates;
			
		}
		
		if(chat.tabCandidates.length == 0) return;
		
		var name = chat.tabCandidates[chat.tabIndex++];
		if(chat.tabIndex >= chat.tabCandidates.length ) chat.tabIndex = 0;
		
		// handle start
		if(chat.tabCursorInfo.start == 0) name+=":";
		
		// DO IT
		this.value = spliceSlice(chat.tabCursorInfo.str,chat.tabCursorInfo.start,chat.tabCursorInfo.end-chat.tabCursorInfo.start,name+" ");
		setCaretPosition(this,chat.tabCursorInfo.start + name.length+1);
		
	}
	
	// We need to do a few things with ourselves before we go. Notably setting up events on dom.
	chat.getChatControls.done(function(controls){
		
		// Assign listeners
		controls.input.addEventListener("keydown",chat.sendFromDom);
		controls.input.addEventListener("keydown",chat.seekHistoryFromDom);
		controls.input.addEventListener("keydown",chat.tabCompleteUsername);
		 
		controls.password.addEventListener("keydown",chat.loginFromDom);
		
		controls.loginbtn.addEventListener("click",function(){
			chat.loginFromDom();
		});
		
		controls.regbtn.addEventListener("click",function(){
			chat.registerFromDom();
		});
		
		controls.username.addEventListener("keydown",function(e){
			if(e.keyCode == 13) controls.password.focus();
		});
		
	})
	
	return bt;
}(bt,"chat"));
