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

function timer($scope, socket){
	$scope.timer = 0;
	
	socket.on('tick', function (data) {
		$scope.timer = data;
	});
}