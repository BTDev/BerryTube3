/**
	Chat Module. Handles chatting, polls, and so on.
*/
var bt = (function (bt,module_name) {

	const DOMID_PLITEMS = "plitems";
	const DOMID_PLCONTROLS = "playlistcontrols";
	const DOMID_PLQUEUETB = "queuetb";
	const DOMID_PLQUEUEPANE = "queuepane";
	const DOMID_PLVEDITPANE = "videoeditor";
	
	const DOMID_EPB_TOGGLEV = "toggle-volatile";
	const DOMID_EPB_SKIP = "play-next";

	var playlist = bt.playlist = { e:bt.register(module_name) }; 
	
	playlist.list = document.getElementById(DOMID_PLITEMS);
	playlist.map = {};
	
	// Anything that modifies the dom should use the event queue. This will severely lessen dom explosions
	playlist.evqueue = new EventQueue();
	
	BTScroller.init(playlist.list);
	
	var nodeIndex = function(element){
		if(!element) return false;
		return Array.prototype.indexOf.call(element.parentNode.children, element);
	}
	
	playlist.getEditPaneControls = function(){
		return new Q.Promise(function(resolve,reject){
			(function looper(){
			
				var again = function(){ setTimeout(looper,1000); }
				var innerButton = function(elemid){ 
					var wrapper = document.getElementById(elemid);
					if(!wrapper) return false;
					return wrapper.getElementsByTagName('button')[0]; 
				}

				var toggleVolatile = innerButton(DOMID_EPB_TOGGLEV);
				if(!toggleVolatile) return again();
				
				var skip = innerButton(DOMID_EPB_SKIP);
				if(!skip) return again();
				
				resolve({
					toggleVolatile:toggleVolatile,
					skip:skip,
				});
								
			})()
		}); 
	}
	
	playlist.e.fulllist = function(data){
		console.log("fulllist got",data); 
		playlist.evqueue.run(function(done){
			playlist.clear();
			for(var i=0;i<data.length;i++){
				playlist.addItem(data[i]);
			}
			var resp = bt.rawEmit(module_name,"getactive","pls");
			resp.then(function(active){ 
				playlist.e.active(active); // perfect use case of this stuff
			}).then(function(){
				bt.rawEmit(module_name,"getpointer","pls").then(function(pointer){
					playlist.setPointer(playlist.map[pointer.id]);
					done();
				});
			});
			//done();
		});
	}
	
	playlist.clear = function(){
		playlist.list.innerHTML = ""; //clean, effective, brutal. Berrytube.
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
			target = false;
			if(!elem) return;
			target = elem;
			target.classList.add("target");
			target.classList.add(side);
		}
		
		// attach item
		elem.item = item;
		playlist.map[elem.item.id] = elem;
		
		// Add any video flegs
		if(elem.item.data.volat) elem.classList.add("volatile");
		
		// create drag handle
		elem.handle =  document.createElement("div");
		elem.handle.classList.add("handle");
		elem.handle.innerHTML = '<i class="fa fa-bars"></i>';
		elem.appendChild(elem.handle);
		
		// Add quick controls
		elem.quick = document.createElement("div");
		elem.quick.classList.add("quickactions");
		elem.appendChild(elem.quick);
		
		// Add del to quick
		elem.del = document.createElement("div");
		elem.del.classList.add("del");
		elem.quick.appendChild(elem.del);
		elem.killself = function(){
			// hate self
			bt.rawEmit(module_name,"remove",elem.item.id);
		}
		elem.del.addEventListener("click",elem.killself);
		
		// Add content
		elem.content = document.createElement("div");
		elem.content.classList.add("content");
		elem.content.innerHTML = item.data.title;
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
			
			elem.dragging = false;
			pauseEvent(ev);
			
			var fromindex = nodeIndex(elem);
			var toindex = nodeIndex(target);
			if(fromindex !== false && toindex !== false) playlist.move(elem,target,toindex-fromindex);
			
			setAsTarget();
			return false;
		}
		
		document.body.addEventListener("mousedown",function(ev){
			return startScrubbing(ev);
		},false);
		
		document.body.addEventListener("mouseup",function(ev){
			return stopScrubbing(ev);
		},false);

		// Open pane on rclick
		elem.addEventListener("contextmenu",function(ev){
			ev.preventDefault();
			
			playlist.showPane();
			playlist.setEditTarget(elem);
			playlist.showPane(playlist.editpane);
			
			return false;
		},false);
		
		playlist.list.appendChild(elem);
		return elem;
	
	}
	
	playlist.editpane = document.getElementById(DOMID_PLVEDITPANE);
	playlist.editTarget = false;
	playlist.setEditTarget = function(video){
		playlist.editTarget = video;
		
		var elems = playlist.editpane.getElementsByTagName("*");
		var dName = false;
		for(var i=0;i<elems.length;i++){
			var elem = elems[i];
			if(elem.name == 'title'){ dName = elem; continue; }
		}
		
		if(dName){
			dName.value = playlist.editTarget.item.data.title;
		}
		
	}
	
	playlist.move = function(from,to,side){
		if(side == 0) return;
		if(side < 0) side = -1;
		if(side > 0) side = 1;
		var pak = {
			from:from.item.id,
			to:to.item.id,
			side:side
		};
		bt.rawEmit(module_name,"move",pak);
	}
	
	playlist.vslidespeed = 175;
	playlist.e.move = function(data){
		playlist.evqueue.run(function(done){
			var from = false;
			
			if(playlist.map[data.from.id]){
				// move item on playlist
				from = playlist.map[data.from.id];
			} else {
				// new item to be made 
				from = playlist.addItem(data.from);
			}
			
			if(data.after){
				var aft = playlist.map[data.after.id];
				if(!aft) return;
				
				// save height
				var temp = from.clientHeight;
				tween(from,"height","0px",temp+"px",playlist.vslidespeed).then(function(){
					playlist.list.insertBefore(from,aft.nextSibling);
				}).then(function(){
					return tween(from,"height",temp+"px","0px",playlist.vslidespeed);
				}).then(function(){
					done();		
				})
				
				
			}
			if(data.before){
				var aft = playlist.map[data.before.id];
				if(!aft) return;
				
				var temp = from.clientHeight;
				tween(from,"height","0px",temp+"px",playlist.vslidespeed).then(function(){
					playlist.list.insertBefore(from,aft);
				}).then(function(){
					return tween(from,"height",temp+"px","0px",playlist.vslidespeed);
				}).then(function(){
					done();		
				})
			}		
			
		});
	}
	
	
	playlist.e.remove = function(data){
		playlist.evqueue.run(function(done){
		
			var el = playlist.map[data.id];
			
			var temp = el.clientHeight;
			tween(el,"height","0px",el.clientHeight+"px",playlist.vslidespeed).then(function(){
				el.parentNode.removeChild(el);	
				done();
			});
			
		});
	}
	
	// TODO: This can race the creation of the element on the client.
	playlist.e.pointer = function(data){
		playlist.evqueue.run(function(done){
			if(data) { 
				var el = playlist.map[data.id];
				playlist.setPointer(el);
			}
			else playlist.setPointer(false);
			
			done();
		});
	}
	
	playlist.setPointer = function(video){
		if(playlist.pointer) playlist.pointer.classList.remove("pointer");
		playlist.pointer = video;
		if(playlist.pointer) playlist.pointer.classList.add("pointer");
	}
	
	playlist.queueVideo = function(url,other){
		var data = { url:url };
		if(other && other == 'volat') data.volat = 'volat';  
		bt.rawEmit(module_name,"queue",data);
	} 
	
	playlist.e.active = function(data){
		console.log("active = ",data);
		
		if(!data || !data.video) return;
		if(!playlist.map[data.video.id]) return;
		
		if(playlist.activeTrack) playlist.activeTrack.classList.remove("active");
		playlist.activeTrack = playlist.map[data.video.id];
		if(playlist.activeTrack) playlist.activeTrack.classList.add("active");		
		bt.player.play(data.video.data.source,data.video.data.key,data.at);
	}
	
	playlist.e.update = function(data){
		var elem = playlist.map[data.id];
		if(!elem) return;
		elem.item = data;
		playlist.regenerateEntry(elem);
	}
	
	playlist.regenerateEntry = function(elem){
		console.log(elem);
		
		// Check volatility.
		if(elem.item.data.volat) elem.classList.add("volatile");
		else elem.classList.remove("volatile");
		
	}
	
	// Getting into some of the playlist controls.
	//const DOMID_PLCONTROLS = "playlistcontrols"; 
	playlist.activeControlBtn = false;
	playlist.activePane = false;
	playlist.showPaneButton = function(elem){
		elem.clickFn = function(){
		
			// Toggle Button
			if(playlist.activeControlBtn){
				playlist.activeControlBtn.classList.remove("active");
			}
			if(playlist.activeControlBtn != this){
				playlist.activeControlBtn = this;
				playlist.activeControlBtn.classList.add("active");
			} else {
				playlist.activeControlBtn = false;
			}
			
			// Toggle Pane
			var pane = false;
			if(playlist.activeControlBtn){
				var paneId = playlist.activeControlBtn.getAttribute("pane");
				pane = document.getElementById(paneId);
			}
			playlist.showPane(pane);
			
		}
		elem.addEventListener("click",elem.clickFn);
	}
	
	playlist.showPane = function(pane){
		if(playlist.activePane){
			playlist.activePane.classList.remove("active");
			playlist.list.classList.remove("pane-open");
		}
		if(pane && playlist.activePane != pane){
			playlist.activePane = pane;
			playlist.activePane.classList.add("active");
			playlist.list.classList.add("pane-open");
			
			var childOf = function(elem,parent){
				var ancestor = elem;
				while(ancestor && ancestor != document){
					if(ancestor == parent) return true;
					ancestor = ancestor.parentNode;
				}
				return false;
			}
			
			var dismiss = function(ev){
				if(childOf(ev.target,playlist.activePane)) return;
				playlist.showPane();
				document.body.removeEventListener("mousedown",dismiss,false);
			}
			
			document.body.addEventListener("mousedown",dismiss,false);
			
		} else {
			playlist.activePane = false;
		} 
	}
	
	playlist.controlgroup = document.getElementById(DOMID_PLCONTROLS);
	var buttons = bt.playlist.controlgroup.childNodes;
	for(var i=0;i<buttons.length;i++){
		playlist.showPaneButton(buttons[i]);
	}
	
	// configure the queue tb and buttons
	playlist.queuetb = document.getElementById(DOMID_PLQUEUETB);
	playlist.queuetb.addEventListener("keyup",function(e){
		if(e && e.keyCode != 13) return false;
		playlist.queueVideo(this.value);
		this.value="";
		playlist.activeControlBtn.clickFn();
	});
	
	// configure the queue buttons
	playlist.queuepane = document.getElementById(DOMID_PLQUEUEPANE);
	var btns = playlist.queuepane.getElementsByClassName("queuebtn");
	var qFromBtn = function(){
		playlist.queueVideo(playlist.queuetb.value,this.getAttribute("type"));
		playlist.queuetb.value="";
		playlist.activeControlBtn.clickFn();
	}
	for(var i=0;i<btns.length;i++)  btns[i].addEventListener("click",qFromBtn);
	
	// configure the edit controls.
	playlist.getEditPaneControls().then(function(controls){
	
		controls.toggleVolatile.addEventListener('click',function(){
			var video = playlist.editTarget.item;
			bt.rawEmit(module_name,"modify",{
				id: video.id,
				data: { volat: !video.data.volat }
			});
			playlist.showPane();
		});
		
		controls.skip.addEventListener('click',function(){
			var video = playlist.editTarget.item;
			bt.rawEmit(module_name,'next','pls');
			playlist.showPane();
		});
		
	})
	
	return bt;
}(bt,"playlist"));
