var crypto = require('crypto');
var ObjectId = require('mongodb').ObjectID;
const Promise = require('promise');
const events  = require('events');

module.exports = function(bt){

	var module_name = "user";
	var mod = { e:bt.register(module_name), events: new events.EventEmitter()  };

	// CONVENTION: e.function refers to a common entrypoint, a method that may fail.
	// the e function calls its main counterpart in the event of a "success"
	
	// Conditional
	mod.e.register = function(data,socket){
		// send secret message		
		var p = new Promise(function(resolve,reject){
			bt.dbUsers.done(function(users){
				var set = users.find({username:data.username});
				set.count().then(function(count){
					
					if(count > 0){ reject(new Error("That username is taken.")); return; }
					resolve(mod.newUser(data));
										
				});
			});
		});
		
		// hook events
		p.then(function(user){
			mod.events.emit("register",socket,user);
		});
		
		return p;
	}
	// Imperative
	mod.register = function(data){
		return "Imperative "+data;
	}
	
	// This function is designed to provide fields to users who somehow lack them. 
	// AKA, a defaulteriser. Good for making sure new features get assigned on users.
	mod.getDressed = function(user){
		
		return new Promise(function(resolve,reject){
			if(!user) return user; // wat.
			var clean = true;
			
			// Check for birthday
			if(!user.joinedon) { user.joinedon = new Date(); clean = false; }
			
			// Check for defined sort order
			if(typeof user.ulsort == "undefined") { user.ulsort = 0; clean = false; }
			
			// Check for classes
			if(typeof user.classes == "undefined") { user.classes = []; clean = false; }
			
			// Check for classes
			if(typeof user.perms == "undefined") { user.perms = []; clean = false; }
			
			//all done. If unclean, save back to DB and return him.
			if(!clean){
				bt.dbUsers.done(function(users){
					var duder = {_id:ObjectId(user._id)};
					users.update(duder,user,function(err, changed){
						if(err) throw err;
						users.findOne(duder,function(err,dressed){
							if(err) throw err;
							resolve(dressed);
						});
					});
				});
			} else {
				resolve(user);
			}
			
		});
		
	}

	mod.e.login = function(data,socket){
		if(!socket) throw new Error("Who the hell are you?"); // Login is meaningless without a socket context.
		var p = new Promise(function(resolve,reject){
			if(!(data.username && data.password)) throw new Error("You need to supply a username and password.");
			
			// Check if valid user
			bt.dbUsers.done(function(users){
				var s = {username:data.username};
				console.log(s);
				users.findOne(s,function(err,undressed){
					if(err) throw err;				
					if(undressed){
						
						// Now we need to check the password. Take the salt from the user we found,
						// and append it to the password provided. Hash it, the compare to the password
						// hash.
						
						var salt = undressed.salt || ""; // If we dont have a salt that isnt an "error" really, its just bad.
						// No salt here should probably generate a new one and click everything together, since we have the 
						// plaintext password in memory for a moment. TODO for later maybe?
						
						var saltedPass = data.password + salt;
						var hashed = mod.hashPassword(saltedPass);
												
						if(undressed.password != hashed) {
							reject(new Error("Invalid password"));
						} else {				
							mod.getDressed(undressed).done(function(dressed){
								socket.profile = dressed; // track the socket
								var cleaned = mod.clean(socket.profile); // Clean it, but...
								cleaned.perms = socket.profile.perms; // we need our own perms at least.
								resolve(cleaned); // tell the sucker
							});
						}
					} else {
						reject(new Error("No such user "+data.username));
					}
				});
				
			});
			
			
		});
		
		// hook events
		p.then(function(user){
			mod.events.emit("login",socket,user);
		});
		
		p.catch(function(e){ socket.profile = false; })
		
		return p;
	}
	
	mod.e.check = function(data,socket){
		return "Dong! You are "+socket.username;
	}
	
	mod.hashPassword = function(password){
		return crypto.createHash('sha512').update(password).digest('hex');
	}
	
	mod.newUser = function(data){
	
		return new Promise(function(resolve,reject){
	
			bt.dbUsers.done(function(users){
				var hashedpw = mod.hashPassword(data.password);
				
				var newbie = {};
				
				newbie.username = data.username || "Shithead";
				newbie.password = hashedpw || "password";
				 
				var salt = mod.hashPassword((Math.random() * 100000000)+"");
				var saltedPass = data.password + salt;
				newbie.password = mod.hashPassword(saltedPass);
				newbie.salt = salt;
				
				newbie.joinedon = new Date();
				
				users.insertOne(newbie, function(err, result) {
					if(err) throw new Error(err);
					resolve(result);
				});
			});
			
		});
	}
	
	// This function is a whitelist of all "public" properties
	mod.clean = function(data){
		return {
			_id: data._id || -1,
			username: data.username || null,
			classes: data.classes || [],
			sortorder: data.sortorder || 0
		};
	}
	
	return mod;

}