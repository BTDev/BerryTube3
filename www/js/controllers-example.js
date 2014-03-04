//USEFUL
// http://jsfiddle.net/icoxfog417/nj7Lw/

var btApp = angular.module('btApp', ['ngAnimate']);

btApp.controller("exampleController",function($scope){

	$scope.playlist = [
		{
			videoTitle:"one"
		},
		{
			videoTitle:"two"
		}
	];

    $scope.addStone = function(video){
        $scope.playlist.push({
			videoTitle:"x"
		})    
    }
    $scope.delStone = function(video){
		$scope.playlist.splice($scope.playlist.indexOf(video),1);
    }
	
	$scope.getVideo = function(video){
		return video;
	}
	
	setInterval(function(){
		console.log($scope.playlist);
	},2000);
	
})

btApp.directive('btList', function($compile, $interval) {
	return {
		restrict: 'E',
		link:function(scope, element, attrs){
		
			// Setup Cleaning
			element.on('$destroy', function() {
				console.log(scope.playlist);
			});
			$(element[0]).draggable();
			
			var name = $("<p/>").text("{{video.videoTitle}}").insertAfter($(element[0]));
			$compile(name)(scope);
			
			var name = $("<input/>").attr("ng-model","video.videoTitle").insertAfter($(element[0]));
			$compile(name)(scope);
			
			var delbtn = $("<button/>").text("kill").attr("ng-click","delStone(video)").insertAfter($(element[0]));
			$compile(delbtn)(scope);
			
		}
	};
});
