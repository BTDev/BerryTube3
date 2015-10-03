module.exports = function(bt){

	var module_name = "playlist";
	var mod = { e:bt.register(module_name) };

	// CONVENTION: e.function refers to a common entrypoint, a method that may fail.
	// the e function calls its main counterpart in the event of a "success"
	
	var lnFirst = false;
	var lnLast = false;
	
	var LinkedNode = function(data){
	
		var self = this;
		self.data = data || {};
		self.next = self;
		self.prev = self;
		if(!lnFirst) lnFirst = self;
		if(!lnLast) lnLast = self;
		
		self.append = function(otherLN){
			
			if(!otherLN) return;
			
			// first handle other's relatives.
			if(otherLN.prev) otherLN.prev.next = otherLN.next;
			if(otherLN.next) otherLN.next.prev = otherLN.prev;
			if(lnFirst == otherLN) lnFirst = otherLN.next; // if we just moved the first one after me, the one after him is now first.
			if(lnLast == otherLN) lnFirst = otherLN.prev; // if we just moved the last one after me, the one before him is now first.
			
			// Line up others next and prev to mine
			otherLN.next = self.next;
			otherLN.prev = self;
			
			// attach neighbors
			otherLN.next.prev = otherLN;
			self.next = otherLN;
			
			// transfer titles if necessary
			if(lnLast == self) lnLast = otherLN;
			
		}
		
		self.prepend = function(otherLN){
		
			if(!otherLN) return;
			
			// first handle other's relatives.
			if(otherLN.prev) otherLN.prev.next = otherLN.next;
			if(otherLN.next) otherLN.next.prev = otherLN.prev;
			if(lnFirst == otherLN) lnFirst = otherLN.next; // if we just moved the first one after me, the one after him is now first.
			if(lnLast == otherLN) lnFirst = otherLN.prev; // if we just moved the last one after me, the one before him is now first.

			// Line up others next and prev to mine
			otherLN.next = self;
			otherLN.prev = self.prev;
			
			// attach neighbors
			otherLN.prev.next = otherLN;
			self.prev = otherLN;
			
			// transfer titles if necessary
			if(lnFirst == self) lnFirst = otherLN;
			
		}
		
		return self;
		
	}
	
	/*
	var x = new LinkedNode("x");
	var a = new LinkedNode("a");
	var y = new LinkedNode("y");
	var z = new LinkedNode("z");
	
	x.append(y);
	y.prepend(z); 
	z.append(x); 
	y.append(z);
	y.append(a);
	
	// loop
	var elem = lnFirst;
	console.log("First",lnFirst.data);
	do {
		console.log(elem.data);
		elem = elem.next;
	} while (elem != lnFirst);
	console.log("Last",lnLast.data);
	//mod.newVideo = 
	*/
		
	var list = [];
	list.push({
		title:"Invader Zim Computer Processing",
		length: 100,
		key: "DO82msI1QbY",
		source: "youtube"
	});
	list.push({
		title:"DVNO [PMV]",
		length: 100,
		key: "YAfl0oRqcK0",
		source: "youtube"
	});
	list.push({
		title:"A Final Twilight [AND ANNOUNCEMENT]",
		length: 100,
		key: "mG4Ug7EWUbA",
		source: "youtube"
	});
	list.push({
		title:"Alive (PMV)",
		length: 100,
		key: "lN1lwvVn-zE",
		source: "youtube"
	});
	
	mod.getFullList = function(){
		return list;
	}
	
	bt.io.on("connection",function(socket){
		socket.emit(module_name,{
			ev:"fulllist",
			data: mod.getFullList()
		});
	});
	
	return mod;

}