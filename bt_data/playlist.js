module.exports = function(bt){

	var module_name = "playlist";
	var mod = { e:bt.register(module_name) };

	// CONVENTION: e.function refers to a common entrypoint, a method that may fail.
	// the e function calls its main counterpart in the event of a "success"
	
	var list = [];
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