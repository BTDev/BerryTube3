//USEFUL
// http://jsfiddle.net/icoxfog417/nj7Lw/

var btApp = angular.module('btApp', ['ngAnimate']);

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
	
	$scope.delVideo = function(video){
		$scope.playlist.splice($scope.playlist.indexOf(video),1);
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
btApp.directive('btPlaylistVideo', function($compile, $interval) {
	return {
		restrict: 'E',
		link:function(scope, element, attrs){
		
			// Setup Cleaning
			element.on('$destroy', function() {
				console.log(element,"Deleted");
			});
						
			$compile($("<video-title/>").appendTo($(element[0])))(scope);
			$compile($("<video-length/>").appendTo($(element[0])))(scope);
			$compile($("<input/>").attr("ng-model","video.videoTitle").appendTo($(element[0])))(scope);
			var delbtn = $("<button/>").text("kill").attr("ng-click","delVideo(video)").appendTo($(element[0]));
			$compile(delbtn)(scope);
			
		}
	};
});
btApp.directive('videoTitle', function($compile, $interval) {
	return {
		restrict: 'E',
		template:"{{video.videoTitle}}"
	};
});
btApp.directive('videoLength', function($compile, $interval) {
	return {
		restrict: 'E',
		template:"{{ formatLength(video.videoLength) }}"
	};
});

function timer($scope, socket){
	$scope.timer = 0;
	
	socket.on('tick', function (data) {
		$scope.timer = data;
	});
}