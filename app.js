// Tools
const path = require('path');
const Promise = require('promise');
const events  = require('events');
const util = require('util');
const fs = require('fs');

var bt = new events.EventEmitter(); // Let there be light.
bt.config = require('./bt_data/config.js');

// Setup Net Services
bt.express = require('express');
bt.web = bt.express();

// Use HTTPS
bt.server = require("https").Server({
    key: fs.readFileSync( bt.config.ssl.key ),
    cert: fs.readFileSync( bt.config.ssl.cert )
},bt.web);
// Use HTTP
//bt.server = require('http').Server(bt.web);
bt.io = require('socket.io')(bt.server);

// Logger 
bt.log = function(){
	console.log.apply(console,arguments);
}

// Setup Database
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectID;
var assert = require('assert');

bt.dbConnection = new Promise(function(resolve,reject){
	
	var attempt = function(){
		MongoClient.connect(bt.config.dbinfo.uri, function(err, db) {
			if(err){ 
				bt.log(err); 
				bt.log("Retrying in 10 seconds.");
				setTimeout(attempt,10000);
			}
			else {
				bt.log("Mongo Server Connected.");
				resolve(db);
			}
		});
	};
	attempt();
	
});

bt.dbUsers = new Promise(function(resolve,reject){
	bt.dbConnection.done(function(db){
		resolve(db.collection('users'));	
	});
});

// Define event registrar & emitter
bt.register = (function(){

	// This is weird so i have a closured space to define a function that 
	// only this thing ever needs. This way its declared once, but still 
	// only accessible to the returned function. Cleanliness!
	var ifEventValid = function(ev,cb){
		if(ev && ev.ev && ev.data) if(cb)cb();
	}
	
	return function(evname){
		var obj = {};
		
		// While we can assign multiple internal event hooks without problem, we can only assign one
		// external -> internal event proxy, or else everything will fire multiple times depending on how
		// many listeners there are.
		
		bt.log("Assigning Connection CB for",evname);
		bt.io.on("connection",function(socket){
			socket.on(evname,function(ev,reply){
				ifEventValid(ev,function(){
					bt.triggerEvent(evname,ev,reply,socket);
				});
			});
		});
		
		bt.on(evname,function(ev){
			ifEventValid(ev,function(){			
				if(obj && obj[ev.ev]) { 
					// Commenting this for future use since its kind of a brainwave.
					/**
					
						What happens here is a new promise is created for this event's action. since each 
						action sort of happens on its own by way of event hooking this isnt a loop but
						a single event to run, lends itself well to this design. If an exception is thrown
						from the event it will be caught, and handled. this is awesome, because it decouples
						the socket from the event, and no event called in this fasion can cause an uncaught
						exception to trickle up. responses and rejections are automatically passed along 
						to the caller if the caller has a socket. if not, then they are ignored. 
						
						Hopefully this mean that no module working through this system can error out the 
						whole application. and if the event returns a promise the rest of the chain
						begins depending on that to proceed, making async ops also safe, and doable.
						
						What this means is each registered action must return either a success value or a 
						promise (which must follow these same rules) or throw an exception for an error. 
						
						Promises really are cool.
						
					*/
					var p = new Promise(function(resolve,reject){
						resolve(obj[ev.ev](ev.data,ev.socket));
					}).then(function(result){
						console.log(result);
						if(ev.reply) ev.reply({
							ev:"resolve",
							data:result
						});
					}).catch(function(exception){
						console.log("E:",exception.message);
						if(ev.reply) ev.reply({
							ev:"reject",
							data:exception.message
						});
					});
				}
				else { console.warn("(!) No handler for",evname+":"+ev.ev); }
			});
		});
		return obj;
	}
})();

bt.triggerEvent = (function(){
	return function(ns,ev,reply,socket){
		bt.emit(ns,{ ev:ev.ev, data:ev.data, reply:reply, socket:socket });
	};
})(); 

// Load modules
bt.users = require('./bt_data/users.js')(bt);
bt.chat = require('./bt_data/chat.js')(bt);
bt.util = require('./bt_data/util.js')(bt);
bt.userlist = require('./bt_data/userlist.js')(bt);
bt.playlist = require('./bt_data/playlist.js')(bt); 

// Configure Web Provider
bt.web.engine('jade', require('jade').__express);
bt.web.set('views', __dirname + '/www/views')
bt.web.set('view engine', 'jade')
bt.web.use(bt.express.static(__dirname + '/www/dist'));

// ATTACH ROUTES HERE
bt.web.get('/',function(req, res){res.render('index');});
bt.web.get('/about',function(req, res){res.render('about',{something:"else"});});
// and so on

// Start Server
bt.server.listen(3000);

