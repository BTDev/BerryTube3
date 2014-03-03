//USEFUL
// http://jsfiddle.net/icoxfog417/nj7Lw/

var btApp = angular.module('btApp', []);

btApp.factory('socket',function($rootScope){
	var socket = io.connect();
	return {
		on: function (eventName, callback) {
			socket.on(eventName, function () {  
				var args = arguments;
				$rootScope.$apply(function () {
					callback.apply(socket, args);
				});
			});
		},
		emit: function (eventName, data, callback) {
			socket.emit(eventName, data, function () {
				var args = arguments;
				$rootScope.$apply(function () {
					if (callback) {
						callback.apply(socket, args);
					}
				});
			});
		}
	};
});
var injector = angular.injector(['btApp', 'ng']);
var socket = injector.get('socket');

/*
btApp.factory("moarPones",function($rootScope){
	console.log($rootScope);
    return {};
})
var injector = angular.injector(['btApp', 'ng']);
var socket = injector.get('moarPones');
*/

function userList($scope, socket) {
	
	socket.on('init', function (data) {
		$scope.users = data.users;
		$scope.timer = 0;
	});
	socket.on('userCount', function (data) {
		$scope.userCount = data;
	});
	
	$scope.go = function() {
		console.log(this);
	}
	
}

function playlistController($scope, socket){

	var pz = function(x){
		if(x<10) return "0"+x;
		return x;
	}

	$scope.formatLength = function(len){
	
		var seconds = len;
		
		var minutes = Math.floor(seconds / 60);
		seconds = seconds % 60;
		
		var hours = Math.floor(minutes / 60);
		minutes = minutes % 60;
		
		var days = Math.floor(hours / 24);
		hours = hours % 24;
		
		var out = [];
		if(days > 0){
			out.push(pz(days));
			out.push(pz(hours));
			out.push(pz(minutes));
			out.push(pz(seconds));
		} else if(hours > 0) {
			out.push(pz(hours));
			out.push(pz(minutes));
			out.push(pz(seconds));
		} else if(minutes > 0) {
			out.push(pz(minutes));
			out.push(pz(seconds));
		} else if(seconds > 0) {
			out.push(pz(seconds));
		} else {
			out.push("--");
		}
		//console.log(out.join(" : "));
		return out.join(" : ");
		
	}

	socket.on('recvPlaylist', function (data) {
		$scope.playlist = data.playlist;
		//console.log(data.playlist);
	});
}

function timer($scope, socket){
	$scope.timer = 0;
	
	socket.on('tick', function (data) {
		$scope.timer = data;
	});
}