/*

	Importer Object

*/

events = require('events');

module.exports = function(bt,Video){

	var config = bt.config

	var importer = new events.EventEmitter;
	importer.processors = [];

	// We need to now import all video processors
	require("fs").readdirSync("./bt_data/importers").forEach(function(file) {
		if(file.substring(file.length-3) == ".js"){
			importer.processors.push(require("./importers/" + file)(config,Video));
		}
	});

	importer.getVideo = function(url, callback){
		for(var i in importer.processors){
			var luckyBastard = importer.processors[i];
			for(var j in luckyBastard.matches){
				var m = new RegExp(luckyBastard.matches[j],'i');
				if(m.test(url)){
					luckyBastard.getVideo(url,function(err,video){
						if(callback)callback(video);
					});
					return;
				}
			}
		}
		if(callback)callback(null);
	}

	

	//playlist.load(db);
	//console.log(importer);
	return importer;

};
