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

//var injector = angular.injector(['btApp', 'ng']);
//var socket = injector.get('socket');

/*
btApp.factory("moarPones",function($rootScope){
	console.log($rootScope);
    return {};
})
var injector = angular.injector(['btApp', 'ng']);
var socket = injector.get('moarPones');
*/

btApp.controller('userList',function($scope, socket) {
	
	socket.on('init', function (data) {
		$scope.users = data.users;
		$scope.timer = -1;
	});
	socket.on('userCount', function (data) {
		$scope.userCount = data;
	});
	
	$scope.go = function() {
		console.log(this);
	}
	
});

btApp.controller('playlistController', function($scope, $element, socket, $timeout){

	var pz = function(x){
		if(x<10) return "0"+x;
		return x;
	}
	
	$scope.debug = function(o){
		console.log("got dbg",o);
	}
	
	$scope.showVideoMenu = function(video){
		var pu = $("<div/>").addClass("popup").appendTo("body");
		var ul = $("<ul/>").appendTo(pu);
		var li = $("<li/>").appendTo(ul);
		var a = $("<a/>").text(video.videoTitle).appendTo(li);
		ul.menu();
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
		} else if(seconds > 0 || minutes > 0) { // Skip to seconds because seeing a "30" by a video looks weirder than a 00:30
			out.push(pz(minutes));
			out.push(pz(seconds));
		} else {
			out.push("--");
		}
		//console.log(out.join(" : "));
		return out.join(":");
		
	}	

	$scope.refreshPlaylist = function(){
		$timeout(function(){ // I have a feeling i'm going to get used to this.
			if(typeof $($element).data("plugin_tinyscrollbar") == "undefined"){
				$($element).tinyscrollbar({ thumbSize: 15 });
			} else {
				$($element).data("plugin_tinyscrollbar").update();
			}
		}, 0);
	}

	socket.on('recvPlaylist', function (data) {
		$scope.playlist = data.playlist;
		$scope.refreshPlaylist();
	});
});
btApp.directive('btPlaylistVideo', function() {
	var elems = []
	elems.push('<video-title>{{video.videoTitle}}</video-title>');
	elems.push('<video-length data-raw-length="{{video.videoLength}}">{{ formatLength(video.videoLength) }}</video-length>');
	return {
		restrict: 'E',
		template: elems.join("")
	};
});

function timer($scope, socket){
	$scope.timer = 0;
	
	socket.on('tick', function (data) {
		$scope.timer = data;
	});
}