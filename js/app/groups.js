okulusApp.controller('GroupsCntrl', ['$rootScope', '$scope', '$firebaseArray', 'GroupsSvc',
	function($rootScope, $scope, $firebaseArray, GroupsSvc){
		
	    var ref = firebase.database().ref().child('pibxalapa').child('groups');
		$scope.allGroups = $firebaseArray(ref);

	    $scope.allGroups.$loaded(function() {
	    	if ($scope.allGroups.length === 0) {
	    		GroupsSvc.getTestGroups().forEach( function (item){ $scope.allGroups.$add( item ); } );
			}
	    });

	    // a method to create new groups; called by ng-submit
	    $scope.createGroup = function(group) {
	    	newgroup = $scope.group;
			newgroup.address = $scope.address;
	    	$scope.allGroups.$add(newgroup).then(function() {
			    $scope.response = { messageOk: "Grupo creado"};
			})
			.catch(function(err) {
				$scope.response = { messageErr: err};
			});
	    };

  	}
]);

okulusApp.factory('GroupsSvc', ['$rootScope',  
	function($rootScope){
		return {
		    //Return test groups for prepopulation
	    	getTestGroups: function(){
		    	return [
		    		{name:"Grupo Centro",type:"mix",status:"active",
		    		 address:{street:"Avila Camavho",extNumber:"111", intNumber:"2"}},

		    		{name:"Grupo Azueta",type:"mix",status:"active",
		    		 address:{street:"Azueta",extNumber:"222", intNumber:""}}
		    	];
		    };
		};
	}]);