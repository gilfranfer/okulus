okulusApp.controller('GroupsCntrl', ['$rootScope', '$scope', '$firebaseArray', 'GroupsSvc', 'AuditSvc',
	function($rootScope, $scope, $firebaseArray, GroupsSvc, AuditSvc){
	   
	   	console.log("on Groups Controller: "+ $rootScope.allGroups);

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

				console.log("Creating new group");
	    		let record = {group: $scope.group, address: $scope.address, schedule: $scope.schedule};
		    	
		    	$scope.allGroups.$add( record ).then(function(ref) {
				    $scope.response = { messageOk: "Grupo creado"};
				    $scope.groupId = ref.key;
				    AuditSvc.recordAudit(ref, "create", "groups");
				}).catch(function(err) {
					$scope.response = { messageErr: err};
				});
	    	}else{
				//GroupsSvc.updateGroup();
	    		console.log("Updating group "+$scope.groupId);
				let record = $scope.allGroups.$getRecord($scope.groupId);
				record.group = $scope.group;
				record.address = $scope.address;
		    	record.schedule = $scope.schedule; 

		    	$scope.allGroups.$save(record).then(function(ref) {
				    $scope.response = { messageOk: "Grupo Actualizado"};
				    AuditSvc.recordAudit(ref, "update", "groups");
				})
				.catch(function(err) {
					$scope.response = { messageErr: err};
				});
	    	}
	    };
  	}
]);

okulusApp.controller('GroupListCntrl', ['GroupsSvc',
	function(GroupsSvc){

		GroupsSvc.loadAllGroupsList();

	}
]);

okulusApp.controller('GroupDetailsCntrl', ['$rootScope', '$routeParams', '$firebaseArray', 'GroupsSvc', 'AuditSvc',
	function($rootScope, $routeParams, $firebaseArray, GroupsSvc, AuditSvc){
		
		//Load Group
		let whichGroup = $routeParams.groupId;
	    let groupsRef = firebase.database().ref().child('pibxalapa').child('groups');
		console.log(whichGroup);

	}
]);

okulusApp.factory('GroupsSvc', ['$rootScope', '$firebaseArray',
	function($rootScope, $firebaseArray){
		let groupsRef = firebase.database().ref().child('pibxalapa').child('groups');
		
		

		return {
			loadAllGroupsList: function(){

				if(!$rootScope.allGroups){
					console.log("Creating firebaseArray for Groups");
					$rootScope.allGroups = $firebaseArray(groupsRef);

					//TODO: Comment loade function
					$rootScope.allGroups.$loaded(function() {
				    	if ($rootScope.allGroups.length === 0) {
				    		GroupsSvc.getTestGroups().forEach( function (item){ $rootScope.allGroups.$add( item ); } );
						}
				    });
				}
			    

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