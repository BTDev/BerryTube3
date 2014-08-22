var https = require('https');
var querystring = require('querystring');

module.exports = function(config,Video){

	var processor = {};
	// REQUIRED
	processor.name = "Youtube";
	processor.handle = "youtube";
	processor.matches = ['http[s]{0,1}.*youtube.com\\\/watch\\\?v=.+','http[s]{0,1}.*youtu.be\\\/.+'];
	processor.getVideo = function(url, callback){
		var videoid = '';
		var pattern = new RegExp('http[s]{0,1}.*youtu(?:.be\\\/|be.com\\\/watch\\\?v=)([^\\\?\\\&]*)','i');
		var match = pattern.exec(url);
		console.log("match",match);
		if(!match){
			if(callback)callback("This Invalid URL parsing regex!",null);
			return;
		}

		var httpopts = processor.genUrl({
			id:match[1],
			key:'AIzaSyBBM2fo32Pzrcf0GHO5LnEHxjYd1T1li-Q', // Hey GITHUB people, dont be shitty and steal this id plz. 
			part:'snippet,contentDetails'
		});
		processor.get(httpopts,function(data){
			var newvid = new Video();
			newvid.data.tit = data.snippet.title;
			newvid.data.vid = data.id;
			newvid.data.pro = processor.handle;
			newvid.data.len = processor.parseDuration(data.contentDetails.duration);
			if(callback)callback(null,newvid);
		});

	}


	// Internals
	processor.baseUrl = {
		hostname:'www.googleapis.com',
		port:443,
		path:'/youtube/v3/videos',
		method: 'GET'
	};

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