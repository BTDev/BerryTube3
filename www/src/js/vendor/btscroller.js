(function(parent){
	
	var scroller = {};
	parent.BTScroller = scroller;
	
	var pauseEvent = function(e){
		if(e.stopPropagation) e.stopPropagation();
		if(e.preventDefault) e.preventDefault();
		e.cancelBubble=true;
		e.returnValue=false;
		return false;
	}
	
	var controller = function(list){
		
		list.parentNode.style.overflowY = "hidden";
		list.parentNode.style.overflowX = "wrap";
		list.style.position = "relative";
		//list.style.transition = "0.1s all";
		
		// Wrap the list
		var wrapper = document.createElement("div");
		wrapper.classList.add("scrollwrapper");
		wrapper.style['-moz-user-select'] = "-moz-none";
		wrapper.style['-khtml-user-select'] = "none";
		wrapper.style['-webkit-user-select'] = "none";
		wrapper.style['-ms-user-select'] = "none";
		wrapper.style['-user-select'] = "none";
		list.parentNode.insertBefore(wrapper,list);
		wrapper.appendChild(list);
		
		//add a scrollbar
		var scrolltrack = document.createElement("div");
		scrolltrack.classList.add("scrolltrack");
		wrapper.appendChild(scrolltrack);
		
		// add a scrubber
		var scrubber = document.createElement("div");
		scrubber.style.position = "absolute";
		scrubber.classList.add("scrollscrubber");
		scrolltrack.appendChild(scrubber);
		
		// we cant use native drag events due to FF's spotty support
		//foncifure scrubber
		
		setInterval(function(){
			//scrubber.prescrub();
			//scrubber.scrub({clientY:1});
		},100);
		
		scrubber.prescrub = function(y){
			scrubber.initTop = scrubber.offsetTop
			scrubber.initMouseY = y || 0;
		}
		
		scrubber.mouseWheelHandler = function(e) {
			// cross-browser wheel delta
			var e = window.event || e; // old IE support
			var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));
			
			scrubber.prescrub();
			scrubber.scrub({clientY:-delta*3});
		}
			
		scrubber.scrub = function(ev){
			
			pauseEvent(ev);
			
			var delta = ev.clientY - scrubber.initMouseY;
			var newv = scrubber.initTop + delta;
			var functionalBottom = scrolltrack.clientHeight - scrubber.offsetHeight;
						
			if(newv < 0) newv = 0;
			if(newv > functionalBottom) newv = functionalBottom;
			
			scrubber.style.top = newv+"px";
			
			var scrollPercentage = newv / functionalBottom;
			var functionalListHeight = list.clientHeight - wrapper.clientHeight;
			var v = "-"+(functionalListHeight * scrollPercentage)+"px";
			list.style.top = v;
			
		}
		
		scrubber.startScrubbing = function(ev){
			if(ev.target != scrubber) return;
			scrubber.prescrub(ev.clientY);
			document.body.addEventListener("mousemove",scrubber.scrub);
			scrubber.dragging = true;
			pauseEvent(ev);
			return false;
		}
		
		scrubber.stopScrubbing = function(ev){
			if(!scrubber.dragging) return;
			document.body.removeEventListener("mousemove",scrubber.scrub);
			scrubber.dragging = false;
			pauseEvent(ev);
			return false;
		}
		
		document.body.addEventListener("mousedown",function(ev){
			return scrubber.startScrubbing(ev);
		},false);
		
		document.body.addEventListener("mouseup",function(ev){
			return scrubber.stopScrubbing(ev);
		},false);
		
		/*
		document.body.addEventListener("mouseout",function(ev){
			return scrubber.stopScrubbing(ev);
		},false);
		*/
		
		this.detectScrubberSize = function(){
			var ratio = (wrapper.clientHeight / list.clientHeight);
			var sh = (Math.ceil(wrapper.clientHeight * ratio));
			if(sh < 15) sh = 15;
			scrubber.style.height = sh+"px";
		}
		
		wrapper.addEventListener("mousewheel", scrubber.mouseWheelHandler, false);
		wrapper.addEventListener("DOMMouseScroll", scrubber.mouseWheelHandler, false); // Thanks mr firefox
		
		this.detectScrubberSize();
		
		return this;
	}
	
	scroller.init = function(element){
		element.scroller = element.scroller || new controller(element);
	}
	
})(window)