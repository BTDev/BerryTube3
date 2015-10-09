const ObjectId = require('mongodb').ObjectID;
const Promise = require('promise');
const fs = require('fs');

module.exports = function(bt){

	var module_name = "importer";
	var mod = { e:bt.register(module_name) };

	var ready = new Promise(function(resolve){
		var p = __dirname+'/importers';
		var importers = [];
		fs.readdir(p, function(err,files){
			for(var i=0;i<files.length;i++){
				importers.push(require(p+"/"+files[i])(bt));
			}
			resolve(importers);
		});
	});
	
	mod.get = function(url){
		return new Promise(function(resolve, reject){
			ready.done(function(importers){
			
				// Loop through all importers and see if anyone can handle this url
				for(var i=0;i<importers.length;i++){
					var imp = importers[i];
					for(var ri=0;ri<imp.matches.length;ri++){
						var r = imp.matches[ri];
						var matches = url.match(r);
						if(matches){
							resolve(imp.get(url));
							i=importers.length;
							break;
						}
					}
				}		
				// This won't fire if we've already resolved so no worries.
				reject();
				
			});
		});
	}
	
	// Load importers asap.
	
	
	return mod;

};
 