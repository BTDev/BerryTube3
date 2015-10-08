const ObjectId = require('mongodb').ObjectID;
const Promise = require('promise');

module.exports = function(bt){

	var module_name = "playlist";
	var mod = { e:bt.register(module_name) };

	// CONVENTION: e.function refers to a common entrypoint, a method that may fail.
	// the e function calls its main counterpart in the event of a "success"
	
	var lnFirst = false;
	var lnLast = false;
	var lnIndex = 0; 
	var lnMap = {};
	
	var loadPlaylist = function(name){
		// RIP.
		lnFirst = false;
		lnLast = false;
		return new Promise(function(resolve,reject){
			bt.dbPlaylist.done(function(playlist){
				var previous = false;
				playlist.findOne({name:name},function(err,playlist){
					if(!playlist){
						reject(new Error("Empty Playlist"));
						return;
					} 
					
					var videos = playlist.videos;
					for(var i=0;i<videos.length;i++){
						if(!lnLast) new LinkedNode({data:videos[i]});
						else lnLast.append(new LinkedNode({data:videos[i]}));
					} 
					resolve();
				});
			});
		});
	}; 
	
	var savePlaylist = function(name){
		return new Promise(function(resolve,reject){ 
			var videos = [];
			var elem = lnFirst;
			do {
				videos.push(elem.data);
				elem = elem.next;
			} while (elem != lnFirst);
						
			// find pre-exisiting
			bt.dbPlaylist.then(function(playlist){
				return new Promise(function(res,rej){ 
					playlist.findOne({name:name},function(err,pl){
						if(pl) res(playlist,ObjectId(pl._id));
						else {
							playlist.insertOne({name:name},function(err,inserted){
								res(playlist,ObjectId(inserted.insertedId));
							}); 
						}
					});
				})
			}).then(function(playlist,_id){
				playlist.update({name:name},{$set:{videos:videos}},function(err,results){
					resolve(results);
				});
			},function(e){
				console.error(e);
			});
			
		});
	}
	
	var LinkedNode = function(init){
	
		var self = this;
		init = init || {};
		self.data = init.data || {};
		self.next = init.next || self;
		self.prev = init.prev || self;
		if(!lnFirst) lnFirst = self;
		if(!lnLast) lnLast = self;
		
		// Assign self ID.
		// So i did the math here, JS's max int size is about 9007199254740991, safely speaking.
		// at 1 node created per second, it would take 2.845x10^8 years ( roughly 1/16th the age of earth)
		// to reach that number. And thats assuming one unbroken process, since these ID's are lost on reboot anyway 
		self.id = (lnIndex++).toString(36);
				
		self.append = function(otherLN){
			
			if(!otherLN) return;
			
			// first handle other's relatives.
			if(otherLN.prev) otherLN.prev.next = otherLN.next;
			if(otherLN.next) otherLN.next.prev = otherLN.prev;
			if(lnFirst == otherLN) lnFirst = otherLN.next; // if we just moved the first one after me, the one after him is now first.
			if(lnLast == otherLN) lnLast = otherLN.prev; // if we just moved the last one after me, the one before him is now first.
			
			// Line up others next and prev to mine
			otherLN.next = self.next;
			otherLN.prev = self;
			
			// attach neighbors
			otherLN.next.prev = otherLN;
			self.next = otherLN;
			
			// transfer titles if necessary
			if(lnLast == self) lnLast = otherLN;
			
			// Broadcast
			bt.io.emit(module_name,{
				ev:"move",
				data: {
					from:mod.simplePlItem(otherLN),
					after:mod.simplePlItem(self)
				}
			});
			
			//debugging
			//mod.flatList().done(function(list){
			//	for(var i=0;i<list.length;i++) console.log(list[i].data.title);
			//});
			
			// return self for chaining.
			return self;
			
		}
		
		self.prepend = function(otherLN){
		
			if(!otherLN) return;
			
			// first handle other's relatives.
			if(otherLN.prev) otherLN.prev.next = otherLN.next;
			if(otherLN.next) otherLN.next.prev = otherLN.prev;
			if(lnFirst == otherLN) lnFirst = otherLN.next; // if we just moved the first one after me, the one after him is now first.
			if(lnLast == otherLN) lnLast = otherLN.prev; // if we just moved the last one after me, the one before him is now first.

			// Line up others next and prev to mine
			otherLN.next = self;
			otherLN.prev = self.prev;
			
			// attach neighbors
			otherLN.prev.next = otherLN;
			self.prev = otherLN;
			
			// transfer titles if necessary
			if(lnFirst == self) lnFirst = otherLN;
			
			// Broadcast
			bt.io.emit(module_name,{
				ev:"move",
				data: {
					from:mod.simplePlItem(otherLN),
					before:mod.simplePlItem(self)
				}
			});
			
			//debugging
			//mod.flatList().done(function(list){
			//	for(var i=0;i<list.length;i++) console.log(list[i].data.title);
			//});
			
			// return self for chaining.
			return self;
		}
		
		return self;
		
	}
	
	// abstract because jerick wont get off my back about dictionaries. this will let us restructure it later.
	mod.getVideoOfId = function(id){
		return new Promise(function(resolve,reject){
			var elem = lnFirst;
			if(elem) {
				do {
					if(elem.id == id) break;
					elem = elem.next;
				} while (elem != lnFirst);
				resolve(elem);
			} else {
				reject();
			}
		});
	}
	 
	mod.e.move = function(data,socket){
		return bt.security.soft(socket,"playlist-sort").then(function(){
		
			if(!data) throw new Error("pls");
			if(!data.from) throw new Error("Missing 'from'");
			if(!data.to) throw new Error("Missing 'to'");
			if(!data.side) throw new Error("Missing 'side'");
		
			Promise.all([
				mod.getVideoOfId(data.from),
				mod.getVideoOfId(data.to)
			]).then(function(vals){
				var from = vals[0];
				var to = vals[1];
				if(data.side == 1) to.append(from);
				if(data.side == -1) to.prepend(from);
			});
			return "OK";
			
		});
	}
	
	loadPlaylist("main").then(function(){},function(e){
		new LinkedNode(); 
		savePlaylist("main");
	});
	
	mod.simplePlItem = function(elem){
		return {data:elem.data,id:elem.id}
	}
	
	mod.flatList = function(){ 
		return new Promise(function(resolve){
			var list = [];
			var elem = lnFirst;
			if(elem) {
				do {
					list.push(mod.simplePlItem(elem));
					elem = elem.next;
				} while (elem != lnFirst);
			}
			resolve(list);
		});
	}
		
	bt.io.on("connection",function(socket){
		mod.flatList().done(function(list){
			socket.emit(module_name,{
				ev:"fulllist",
				data: list
			});
		});
	});
	
	return mod;

}