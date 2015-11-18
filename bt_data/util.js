const ObjectId = require('mongodb').ObjectID;
const Promise = require('promise');

module.exports = function(bt){

	var module_name = "util";
	var mod = { e:bt.register(module_name) };

	// CONVENTION: e.function refers to a common entrypoint, a method that may fail.
	// the e function calls its main counterpart in the event of a "success"
	
	var prefixTitle = "BerryTube :: ";
	var currentTitle = "Lol nothing loaded yet.";
	var overrideTitle = false;
	
	var fetchTitles = new Promise(function(resolve,reject){
		bt.dbPlugs.done(function(plugs){
			
			var found = [];
			var cursor = plugs.find();
			cursor.each(function(err, plug) {
				if (plug != null) {
					found.push(plug._);
				} else {
					resolve(found);
				}
			});
 
		});
	});
	
	mod.setTitleOverride = function(override){
		overrideTitle = override;
		mod.sendNewTitle(bt.io);
	};
	
	mod.getCurrentTitle = function(){
		if(overrideTitle) return prefixTitle+overrideTitle;
		return prefixTitle+currentTitle;
	};
		
	mod.sendNewTitle = function(socket){
		socket.emit(module_name,{
			ev:"pagetitle",
			data: mod.getCurrentTitle()
		});
	};
	
	mod.randomizeTitle = function(socket){
		
		fetchTitles.done(function(titles){
			currentTitle = titles[Math.floor(Math.random()*titles.length)];
			mod.sendNewTitle(bt.io);
		});
		
		
	};
	
	bt.io.on("connection",function(socket){
		mod.sendNewTitle(socket);
	});
	
	setInterval(function(){
		mod.randomizeTitle();
	},1000 * 60 * 30); // every 30 minutes;
	mod.randomizeTitle();
	
	return mod;

}