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
	
	function average(data){
		var sum = data.reduce(function(sum, value){
			return sum + value;
		}, 0);

		var avg = sum / data.length;
		return avg;
	}
	
	var pings = [];
	var offset = 0;
	var stdDev = 0;
	var doPing = function(){
		var then = +new Date();
		bt.rawEmit("util","ping",{}).then(function(serverTime){
		
			// Track ping
			var now = +new Date();
			pings.push(now - then);
			while(pings.length > 10) pings.shift();
			
			// Recalculate offset
			offset = then - now + (util.getPing() / 2);
		
			// Determine Standard deviation in pings for "health" of connection
			var avg = util.getPing();
			var squareDiffs = pings.map(function(value){
				var diff = value - avg;
				var sqr = diff * diff;
				return sqr;
			});
			var avgSquareDiff = average(squareDiffs);
			stdDev = Math.sqrt(avgSquareDiff);
			
			// 100 is pretty irregular, ping again in 5 seconds.
			if(stdDev > 100){setTimeout(doPing,5000);}
			
		});
	}
	util.getPing = function(){
		return average(pings);
	}
	util.getTimeOffset = function(){
		return offset;
	}
	util.getPingStdDev = function(){
		return stdDev;
	}
	for(var i=0;i<10;i++) doPing();
	util.pingInterval = setInterval(doPing,30000);
	
	window.pings = pings;
	
	
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
