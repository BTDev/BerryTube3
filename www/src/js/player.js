/**
	Chat Module. Handles chatting, polls, and so on.
*/
var bt = (function (bt,module_name) {

	//var util = bt.util = { e:bt.register(module_name) }; 
	var player = bt.player = {};
	var individualPlayers = {};
	
	player.register = function(ip){
		if(!ip.name) return false;
		if(!ip.play) return false;
		individualPlayers[ip.name] = ip;
	}
	
	player.play = function(playername,key,time){
		return new Q.Promise(function(resolve,reject){
			if(!individualPlayers[playername]) 
				throw new Error("No such player registered "+playername);
			return individualPlayers[playername].play(key,time);
		});
	}
	
	return bt;
}(bt,"player"));
