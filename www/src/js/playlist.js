/**
	Chat Module. Handles chatting, polls, and so on.
*/
var bt = (function (bt,module_name) {

	const DOMID_PLITEMS = "plitems";

	var playlist = bt.playlist = { e:bt.register(module_name) }; 
	
	playlist.list = document.getElementById(DOMID_PLITEMS);
	BTScroller.init(playlist.list);
	
	var nodeIndex = function(element){
		return Array.prototype.indexOf.call(element.parentNode.children, element);
	}
	
	playlist.e.fulllist = function(data){
		console.log(data);
	}
	
	playlist.addItem = function(item){
		
		var elem = document.createElement("div");
		elem.classList.add("playlistitem");
		var ghost = false;
		var target = false;
		
		var setAsTarget = function(elem,side){
			if(elem == target) return;
			if(target) {
				target.classList.remove("above");
				target.classList.remove("target");
				target.classList.remove("below");
			}
			if(!elem) return;
			target = elem;
			target.classList.add("target");
			target.classList.add(side);
		}
		
		// attach item
		elem.item = item;
		
		// create drag handle
		elem.handle =  document.createElement("div");
		elem.handle.classList.add("handle");
		elem.handle.innerHTML = '<i class="fa fa-bars"></i>';
		elem.appendChild(elem.handle);
		elem.content = document.createElement("div");
		elem.content.classList.add("content");
		
		elem.content.innerHTML = JSON.stringify(item);
		
		elem.appendChild(elem.content);
		
		var move = function(ev){
			
			pauseEvent(ev);
			
			if(ghost){
				ghost.style.left = ev.clientX+10+"px";
				ghost.style.top = ev.clientY-30+"px";
			} 
			
			// If dragged up, it needs to go before.
			// down, after.
			
			var valid = false; var cursor = ev.target;
			while(cursor != document.body){
				if(cursor.parentNode == elem.parentNode){
					valid = true;
					break;
				}
				cursor = cursor.parentNode;
			}
			if(valid && cursor != elem){
			
				var side = "above";
				if(nodeIndex(cursor) > nodeIndex(elem)) side = "below";
				setAsTarget(cursor,side);
				
			} else {
				setAsTarget();
			}
		}
		
		var pauseEvent = function(e){
			if(e.stopPropagation) e.stopPropagation();
			if(e.preventDefault) e.preventDefault();
			e.cancelBubble=true;
			e.returnValue=false;
			return false;
		}
		
		var startScrubbing = function(ev){
			if(ev.target != elem.handle) return;
			ghost = elem.cloneNode(true);
			ghost.style.position = "fixed";
			ghost.classList.add("ghost");
			
			ghost.style.left = ev.clientX+10+"px";
			ghost.style.top = ev.clientY-30+"px";
			ghost.style.width = elem.clientWidth+"px";
			ghost.style.height = elem.clientheight+"px";
			
			document.body.appendChild(ghost);
			document.body.addEventListener("mousemove",move);
			elem.dragging = true;
			
			pauseEvent(ev);
			
			return false;
		}
		
		var stopScrubbing = function(ev){
			if(!elem.dragging) return;
			document.body.removeEventListener("mousemove",move);
			ghost.parentNode.removeChild(ghost);
			setAsTarget();
			elem.dragging = false;
			pauseEvent(ev);
			
			var fromindex = nodeIndex(elem);
			var toindex = nodeIndex(target);
			playlist.move(elem,target,toindex-fromindex);
			
			return false;
		}
		
		document.body.addEventListener("mousedown",function(ev){
			return startScrubbing(ev);
		},false);
		
		document.body.addEventListener("mouseup",function(ev){
			return stopScrubbing(ev);
		},false);

		playlist.list.appendChild(elem);
		return elem;
	
	}
	
	playlist.move = function(from,to,side){
		if(side == 0) return;
		if(side < 0) side = -1;
		if(side > 0) side = 1;
		var pak = {
			from:from.item,
			to:to.item,
			side:side
		};
		console.log(pak);
		//word = "above"; if(side == 1) word = "below";
		//console.log("move",id,word,position);
	}
	
	var test = function(){
		var datasize = 100;

		for(var i=0;i<datasize;i++){
			var text = "";
			text = i
			if(i % 20 == 0)	text = i + "#playlist { height:300px; width:400px; overflow:hidden; }#playlist { height:300px; width:400px; overflow:hidden; }#playlist { height:300px; width:400px; overflow:hidden; }";
			playlist.addItem(text);
		}
	
	};
	test();
	
	return bt;
}(bt,"playlist"));
