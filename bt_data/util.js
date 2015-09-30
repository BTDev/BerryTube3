module.exports = function(bt){

	var module_name = "util";
	var mod = { e:bt.register(module_name) };

	// CONVENTION: e.function refers to a common entrypoint, a method that may fail.
	// the e function calls its main counterpart in the event of a "success"
	
	var prefixTitle = "BerryTube :: ";
	var currentTitle = "Lol nothing loaded yet.";
	var overrideTitle = false;
	var titles = [
		"Well, we can update the Empyreal Spit-take counter.",
		"Did you see the pool? They flipped the bitch!",
		"Bring me a beverage, and I'll show you a beverage.",
		"WHO VOTED FOR JIZZ?",
		"If you were just completely covered in butter this wouldn't have happened.",
		"Emotional support is measured in grams.",
		"Just butts.",
		"And that's why I was floor.",
		"I didn't realize being on fire was one of your kinks.",
		"That was only like 2 steps away, so why not.",
	];
	
	mod.setTitleOverride = function(override){
		overrideTitle = override;
		mod.sendNewTitle(bt.io);
	};
	
	mod.getCurrentTitle = function(){
		if(overrideTitle) return prefixTitle+overrideTitle;
		return prefixTitle+currentTitle;
	};
		
	mod.sendNewTitle = function(socket){
		socket.emit("util",{
			ev:"pagetitle",
			data: mod.getCurrentTitle()
		});
	};
	
	mod.randomizeTitle = function(socket){
		currentTitle = titles[Math.floor(Math.random()*titles.length)];
		mod.sendNewTitle(bt.io);
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