bt.eventEmitter = function(){

	// Cades' Supah-slim(tm) Event emitter.

	this._events = {};
	this._maxListeners = 10;

	this.on = function(type,callback,once){
		if(!once) once = false;
		if(!this._events[type]) this._events[type] = [];
		this._events[type].push([callback,once])
		if(this._events[type].length > this._maxListeners){
			console.error("More than "+this._maxListeners+" Listeners hooked onto "+type+". This may be a memory leak / accidental hook loop")
		}
	}
	this.once = function(type,callback){
		this.on(type,callback,true);
	}
	this.emit = function(type){
		 
		// This is apperantly ok to do, but it still scares me.
		var args = Array.prototype.slice.call(arguments); args.shift();

		if(!this._events[type]) return; // No hooked events!
		var toSplice = [];
		for(var i in this._events[type]){
			this._events[type][i][0].apply(this,args);
			if(this._events[type][i][1]){  // If its a once
				toSplice.push(this._events[type][i]); // Queue it for removal
			}
		}

		for(var i in toSplice){
			this._events[type].splice(this._events[type].indexOf(toSplice[i]),1); // remove after callback.
		}

	}

}