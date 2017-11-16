okulusApp.controller('GroupsCntrl', ['$rootScope', '$scope', '$firebaseArray', 'GroupsSvc',
	function($rootScope, $scope, $firebaseArray, GroupsSvc){
	    var ref = firebase.database().ref().child('pibxalapa').child('groups');
		$scope.allGroups = $firebaseArray(ref);

	    $scope.allGroups.$loaded(function() {
	    	if ($scope.allGroups.length === 0) {
	    		GroupsSvc.getTestGroups().forEach( function (item){ $scope.allGroups.$add( item ); } );
			}
	    });

	    cleanScope = function(){
	    	$scope.groupId = null;
	    	$scope.group = null;
	    	$scope.address = null;
	    	$scope.schedule = null;
	    	$scope.response = null;
	    };
	    
	    $scope.newGroup = function() {
	    	cleanScope();
	    };

	    $scope.deleteGroup = function() {
	    	if( $scope.groupId ){
	    		console.log("Deleting "+$scope.groupId);
				let record = $scope.allGroups.$getRecord($scope.groupId);
				$scope.allGroups.$remove(record);
	    	}else{
	    		console.log("Nothing to delete");
	    	}
	    	cleanScope();
	    };
	   
	    /* 
	    This method will be used to Create a new Group, or update the changes made to the recently created one.
	    Note: Schedule Time is not getting persisted now because firebase cannot store Date Objects
		$scope.groupId, $scope.group, $scope.address, $scope.schedule
	    */
	    $scope.saveGroup = function() {

	    	if( !$scope.groupId ){
				//GroupsSvc.createGroup();
	    		console.log("Creating new group");
		    	$scope.allGroups.$add( {group: $scope.group, address: $scope.address,
		    		schedule: $scope.schedule } ).then(function(ref) {
				    $scope.response = { messageOk: "Grupo creado"};
				    $scope.groupId = ref.key;
				})
				.catch(function(err) {
					$scope.response = { messageErr: err};
				});
	    	}else{
				//GroupsSvc.updateGroup();
	    		console.log("Updating "+$scope.groupId);
				
				let record = $scope.allGroups.$getRecord($scope.groupId);
				record.group = $scope.group;
				record.address = $scope.address;
		    	record.schedule = $scope.schedule; 
		    	$scope.allGroups.$save(record).then(function(ref) {
				    $scope.response = { messageOk: "Grupo Actualizado"};
				})
				.catch(function(err) {
					$scope.response = { messageErr: err};
				});
	    	}
	    };
  	}
]);

okulusApp.factory('GroupsSvc', ['$rootScope',  
	function($rootScope){
		return {
			createGroup: function(){

			},
		    //Return test groups for prepopulation
	    	getTestGroups: function(){
		    	return [
		    		{name:"Grupo Centro",type:"mix",status:"active",
		    		 address:{street:"Avila Camavho",extNumber:"111", intNumber:"2"}},

		    		{name:"Grupo Azueta",type:"mix",status:"active",
		    		 address:{street:"Azueta",extNumber:"222", intNumber:""}}
		    	];
		    }
		};
	}]);