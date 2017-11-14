okulusApp.controller('GroupsCntrl', ['$routeParams', '$rootScope', '$scope', 'GroupsSvc',
	function($routeParams, $rootScope, $scope, GroupsSvc){
		
		$scope.createGroup = function(){
			newgroup = $scope.group;
			newgroup.address = $scope.address;			
			GroupsSvc.createGroup(newgroup);
		};

		$scope.deleteGroup = function(){
			console.log("on GroupsCntrl");
		};

	}
]);

okulusApp.factory('GroupsSvc', ['$rootScope',  
	function($rootScope){
		return {
			createGroup: function(group){
				console.log("on createGroup");
				console.log(group);		
			}
		};
	}

]);