/**
	Chat Module. Handles chatting, polls, and so on.
*/
var bt = (function (bt,module_name) {

	var util = bt.util = { e:bt.register(module_name) }; 

	var currentPt = false;
	
	util.e.pagetitle = function(pt){
		currentPt = pt;
		util.setPageTitle(pt);
	}
	
	util.setPageTitle = function(pt){
		pt = pt || currentPt || "BerryTube";
		document.title = pt;
	}
	
	var soundBank = [];
	util.playSound = function(url){
		if(!soundBank[url]) soundBank[url] = new Audio(url);
		soundBank[url].play();
		return;
	}
	
	util.sfx = {};
	util.sfx.squee = function(){ return util.playSound('http://berrytube.tv/sounds/notify.wav'); };
	
	return bt;
}(bt,"util"));
