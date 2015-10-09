const ObjectId = require('mongodb').ObjectID;
const Promise = require('promise');
const querystring = require('querystring');
const fs = require('fs');
var https = require('https');

module.exports = function(bt){

	var imp = {};	
	var ytapikey = 'AIzaSyBBM2fo32Pzrcf0GHO5LnEHxjYd1T1li-Q';
	
	// REQUIRED
	imp.matches = [
		/https?:\/\/www.youtube.com\/.+v=([^&\s:\/]+)/,
		/https?:\/\/youtu.be\/([^&\s:\/]+)/,
		/^([^&\s:\/]+)$/
	];
	
	// REQUIRED
	imp.get = function(url){
		return new Promise(function(resolve,reject){
			
			imp.extract(url).then(function(matches){

				var httpopts = imp.genUrl({
					id:matches[1],
					key:ytapikey,
					part:'snippet,contentDetails'
				});
				
				imp.pull(httpopts).then(function(data){
					// Title, Length, Key, and Source are all required, but anything extra is recorded for future use.
					var babyvideo = {};
					babyvideo.title = data.snippet.title || "No Title Found";
					babyvideo.length = imp.parseDuration(data.contentDetails.duration) || 0;
					babyvideo.key = data.id;
					babyvideo.source = "youtube";
					resolve(babyvideo);					
				});
				
			});
			
		
		});
	}

	// Everything after this line is for "internal use" and is not called upon externally.
	
	imp.extract = function(url){
		return new Promise(function(resolve,reject){
			for(var i=0;i<imp.matches.length;i++){
				var r = imp.matches[i];
				var matches = url.match(r);
				if(matches){
					resolve(matches);
					break;
				}
			}
		});
	}
	
	// API stuff
	imp.baseUrl = {
		hostname:'www.googleapis.com',
		port:443,
		path:'/youtube/v3/videos',
		method: 'GET'
	};
	
	imp.genUrl = function(data){
		var ret = {
			hostname:imp.baseUrl.hostname,
			port:imp.baseUrl.port,
			path:imp.baseUrl.path + "?" + querystring.stringify(data), //  Thanks Cyzon!
			method:imp.baseUrl.method,
		}
		return ret;
	}
	
	imp.pull = function(url){
		return new Promise(function(resolve,reject){
			var req = https.request(url, function(res) {

				res.setEncoding('utf8');

				var buffer = '';

				res.on('data', function (chunk) {
					buffer += chunk;
				});
				
				res.on('end', function (chunk) {
					//console.log(buffer);
					var returned = JSON.parse(buffer);
					if(!returned.items) throw new Error(buffer);
					if(!returned.items[0]) throw new Error(buffer);
					resolve(returned.items[0]);
				});

			});
			req.end();
		});
	}
	
	imp.parseDuration = function(duration){
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
	
	return imp;

};
 