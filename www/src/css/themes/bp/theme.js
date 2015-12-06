(function (bt) {
	
	/**
		This file should serve as a template for other people to write themes.
		There are a few definitions near the top that are required, notably:
		
		name : a string representing the name
		css : an array of links to css style sheets to include. these are managed
			by the core and are loaded/unloaded automatically.
		
	*/
	
	var theme = {};
	
	// Required Fields
	theme.name = "Season 1";
	theme.css = [
		'/css/themes/bp/main.css'
	]
	
	// Optional Fields
	/*
	theme.load = function(){
		console.log("Dear Princess Celestia");
	}
	theme.unload = function(replacer){
		console.log("Oh I see, you like",replacer,"more :(");
	}
	*/
	
	// You can also do whatever you want in here. its JS, it runs as you expect.
	//console.log("FREEDOM");
	
	// Finally, register the theme.
	bt.registerTheme(theme);
	
})(bt)