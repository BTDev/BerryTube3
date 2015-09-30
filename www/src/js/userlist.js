/**
	Chat Module. Handles chatting, polls, and so on.
*/
var bt = (function (bt,module_name) {

	const DOMID_USERLIST = "userlist";
	
	var userlist = bt.userlist = { e:bt.register(module_name) }; 
	
	var connectedUsers = [];
	
	userlist.getUserlistControls = Q.Promise(function(resolve,reject){
	
		var find = function(){
			// define list
			var list = document.getElementById(DOMID_USERLIST);
			if(!list) return false;
			var lists = list.getElementsByClassName("list");
			
			return { 
				lists:lists,
			}
			
		};
		
		var interv = setInterval(function(){
			var controls = find();
			if(controls) {
				clearInterval(interv);
				resolve(controls);
			}
		},100);
		
	});
	
	userlist.updateUserCount = function(amt){
		console.log("updateUserCount",amt);
	};
	
	userlist.reloadWith = function(users){
		console.log("refreshing",users);
		userlist.getUserlistControls.done(function(controls){
			controls.lists[0].innerHTML = "";
			userlist.add(users); 
		});
	}
	
	userlist.getUsers = function(){
		return connectedUsers;
	}
	
	userlist.add = function(users){
		console.log("adding",users);
		userlist.getUserlistControls.done(function(controls){
			for(var i in users){ (function(user){
				
				console.log(user);
				
				if(connectedUsers.indexOf(user) == -1)connectedUsers.push(user);
				var x = document.createElement("div");
				
				// Assign object to the dom.
				x.user = user;
				
				// Add Classes
				x.classList.add("user");
				for(var i=0;i<user.classes.length;i++) x.classList.add(user.classes[i]);

				// Set Some attrs.
				for(var attr in user){
					// Skip 
					if(attr == "classes") continue;
					x.setAttribute("data-bt-"+attr,user[attr]);
				}
				
				var list = controls.lists[0];
				x.appendChild(document.createTextNode(user.username));
				list.appendChild(x);
				
			})(users[i]) }
		});
	}
	
	userlist.rem = function(users){
		userlist.getUserlistControls.done(function(controls){
			var elems = controls.lists[0].getElementsByTagName("*")
			for(var i in users){ (function(user){
				for(var i=0;i<elems.length;i++){
					if(elems[i].user && elems[i].user.username == user.username){
						// Match. remove entry.
						if(connectedUsers.indexOf(user) != -1) 
							connectedUsers.splice(connectedUsers.indexOf(user),1);
						elems[i].parentNode.removeChild(elems[i]);
					}
				}
			})(users[i]) }
		});
	}
	
	userlist.e.fulldump = function(data){
		userlist.updateUserCount(data.connections);
		userlist.reloadWith(data.users);
	}
	
	userlist.e.delta = function(data){
		userlist.updateUserCount(data.connections);
		if(data.add) userlist.add(data.add);
		if(data.rem) userlist.rem(data.rem);
	}
	
	return bt;
}(bt,"userlist"));
