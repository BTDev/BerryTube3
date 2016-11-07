const Promise = require('promise');
const events  = require('events');
module.exports = function(bt){

	var module_name = "userlist";
	var mod = { e:bt.register(module_name), events: new events.EventEmitter()  };

	// CONVENTION: e.function refers to a common entrypoint, a method that may fail.
	// the e function calls its main counterpart in the event of a "success"
	
	var SocketCollection = [];
	var UserBreakdown = {
		RegisteredUsers: 0,
		AnonymousUsers: 0,
		Lurkers: 0
	}
	
	// This uses the users module for cleaning.
	mod.packUsers = function(users){
		var r = [];
		for(var i in users){
			var user = users[i];
			if(!user.profile) continue;
			r.push(bt.users.clean(user.profile));
		}
		return r;
	};
	
	mod.getUsersInformation = function(){
		return new Promise(function(resolve,reject){
			
			var userCount = 0;
			var userList = [];
			for(var i=0;i<SocketCollection.length;i++){
				var socket = SocketCollection[i];
				if(socket.connected){
					userCount++;
					userList.push(socket);
				} else {
					mod.discardSocket(SocketCollection[i]);
				}
			}

			resolve({
				userCount:userCount,
				userList:userList,
			});
			
		});
	}
		
	mod.emitFullDump = function(socket){
		mod.getUsersInformation().done(function(info){
			socket.emit("userlist",{
				ev:"fulldump",
				data: {
					connections: info.userCount,
					users: mod.packUsers(info.userList)
				}
			});
		});
	}
		
	mod.watchSocket = function(socket){
		if(SocketCollection.indexOf(socket) == -1 ) SocketCollection.push(socket);
		mod.getUsersInformation().done(function(info){
			var pak = {	connections: info.userCount };
			if(socket.profile && socket.profile.username) pak.add = mod.packUsers([socket]);
			bt.io.emit("userlist",{
				ev:"delta",
				data: pak
			});
		});
	}
	
	mod.discardSocket = function(socket){
		if( ( ind = SocketCollection.indexOf(socket) ) >= 0 ) SocketCollection.splice(ind,1);
		mod.getUsersInformation().done(function(info){
			var pak = {	connections: info.userCount };
			if(socket.profile && socket.profile.username) pak.rem = mod.packUsers([socket]);
			bt.io.emit("userlist",{
				ev:"delta",
				data: pak
			});
		});
	}
	
	// watch user events for logins
	bt.users.events.on("login",function(socket){
		mod.watchSocket(socket);
	});
	
	bt.io.on("connection",function(socket){
	
		socket.on("disconnect",function(){
			mod.discardSocket(socket);
		});
	
		mod.watchSocket(socket);
		
		mod.emitFullDump(socket);
		
	});

	
	return mod;

}