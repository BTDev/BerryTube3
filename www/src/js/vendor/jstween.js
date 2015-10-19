function tween(el,prop,to,from,duration) {
	return new Q.Promise(function(resolve,reject){
		
		var tobits = (""+to).match(/([0-9]+)(.*)/);
		if(!tobits) return reject();
		to = parseFloat(tobits[1]);
		var tosuf = tobits[2];
		
		var frombits = (""+from).match(/([0-9]+)(.*)/);
		if(!frombits) return reject();
		from = parseFloat(frombits[1]);
		var fromsuf = frombits[2];
		
		from = from || parseFloat(el.style[prop],10) || 0 ;
		duration = duration || 1000;
		
		// estimate duration
		// T = time the operation will take
		// d = change in value "delta"
		// s = speed of operation
		// T = d*s
		// therefore, T/d = s
		
		var speed = duration / Math.abs(to-from);
		var last = +new Date();
		var ttimeout = false;
		var abort = false;
		
		var abortfunc = function(){
			console.log("animation hanging, skipping.");
			abort = true;
			el.style[prop] = to+tosuf;
			resolve();
		}
		
		var tick = function() {
		
			if(abort) return;
			if(ttimeout){
				console.log("clearing tick timeout");
				clearTimeout(ttimeout);
			}
		
			if(to > from){
				from = from + (new Date() - last) / speed;
				if(from >= to){
					from = to;
				} else {
					(window.requestAnimationFrame && requestAnimationFrame(tick)) || setTimeout(tick, 16)
				}
			}
			if(to < from){
				from = from - (new Date() - last) / speed;
				if(from <= to){
					from = to;
				} else {
					(window.requestAnimationFrame && requestAnimationFrame(tick)) || setTimeout(tick, 16)
				}
			}
			
			// update value 
			last = +new Date();
			el.style[prop] = from+tosuf;
			if(from == to){
				if(ttimeout) clearTimeout(ttimeout);
				resolve();
			} else {
				// If a single tick takes longer than 100ms, we can assume
				// that the browser isnt sending animation frames, or in
				// other words, the tab isnt focused. in this event, skip to the end.
				ttimeout = setTimeout(abortfunc,100);
			}
			
		};
		tick();
	})
}