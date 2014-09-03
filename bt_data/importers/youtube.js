var https = require('https');
var querystring = require('querystring');
var Datastore = require('nedb');

module.exports = function(bt,Video){

	var processor = {};
	// REQUIRED
	processor.name = "Youtube";
	processor.handle = "youtube";
	processor.matches = ['https?.*youtube.com\\\/watch\\\?v=.+','https?.*youtu.be\\\/.+'];
	processor.getVideo = function(url, callback){
		var videoid = '';
		var pattern = new RegExp('https?.*youtu(?:.be\\\/|be.com\\\/watch\\\?v=)([^\\\?\\\&]*)','i');
		var match = pattern.exec(url);
		if(!match){
			if(callback)callback("This Invalid URL parsing regex!",null);
			return;
		}

		// take out id
		var videoid = match[1];

		// check cache
		processor.db.findOne({ id:videoid }, function (err, doc) {
			if(doc){
				// Yay a cached version.
				processor.add(doc,callback);
			} else {
				var httpopts = processor.genUrl({
					id:videoid,
					key:'AIzaSyBBM2fo32Pzrcf0GHO5LnEHxjYd1T1li-Q', // Hey GITHUB people, dont be shitty and steal this id plz. 
					part:'snippet,contentDetails'
				});
				processor.get(httpopts,function(data){
					// Add to cache
					processor.db.insert(data)
					processor.add(data,callback);
				});
			}
		});

		

	}


	// Internals
	processor.db = new Datastore({ filename: bt.config.dbinfo._dir+"ytcache.db", autoload: true });
	processor.db.persistence.setAutocompactionInterval(1000*60*60);
	processor.baseUrl = {
		hostname:'www.googleapis.com',
		port:443,
		path:'/youtube/v3/videos',
		method: 'GET'
	};

	processor.add = function(data,callback){
		var newvid = new Video();
		newvid.data.tit = data.snippet.title;
		newvid.data.vid = data.id;
		newvid.data.pro = processor.handle;
		newvid.data.len = processor.parseDuration(data.contentDetails.duration);
		if(callback)callback(null,newvid);
	}

	processor.genUrl = function(data){
		var ret = {
			hostname:processor.baseUrl.hostname,
			port:processor.baseUrl.port,
			path:processor.baseUrl.path + "?" + querystring.stringify(data), //  Thanks Cyzon!
			method:processor.baseUrl.method,
		}
		return ret;
	}

	processor.get = function(url,callback){
		var req = https.request(url, function(res) {

			//console.log('STATUS: ' + res.statusCode);
			//console.log('HEADERS: ' + JSON.stringify(res.headers));

			res.setEncoding('utf8');

			var buffer = '';

			res.on('data', function (chunk) {
				buffer += chunk;
			});
			res.on('end', function (chunk) {
				//console.log(buffer);
				var returned = JSON.parse(buffer);
				if(!returned.items) return;
				if(!returned.items[0]) return;
				if(callback)callback(returned.items[0]);
			});

		});
		req.end();
	}

	processor.parseDuration = function(duration){
		var matches = duration.match(/[0-9]+[DHMS]/g);

		var seconds = 0;

		matches.forEach(function (part) {
			var unit = part.charAt(part.length-1);
			var amount = parseInt(part.slice(0,-1));
			switch (unit) {
				case 'D':
					seconds += amount*60*60*12;
					break;
				case 'H':
					seconds += amount*60*60;
					break;
				case 'M':
					seconds += amount*60;
					break;
				case 'S':
					seconds += amount;
					break;
				default:
					// noop
			}
		});

		return seconds;
	}

	
	/*
	processor.get(url,function(o){
		var duration = processor.parseDuration(o.items[0].contentDetails.duration);
		console.log(duration,o.items[0].contentDetails.duration);
	});
	*/
	// Generate full url.

	return processor;
}

//https://www.googleapis.com/youtube/v3/videos?id=7lCDEYXw3mM&key=AIzaSyBBM2fo32Pzrcf0GHO5LnEHxjYd1T1li-Q&part=snippet,player
