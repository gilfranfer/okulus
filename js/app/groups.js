okulusApp.controller('GroupListCntrl', ['GroupsSvc', '$rootScope',
	function(GroupsSvc, $rootScope){
		GroupsSvc.loadAllGroupsList();
	}
]);

okulusApp.controller('GroupFormCntrl', ['$rootScope', '$scope', '$location','$firebaseArray', 'GroupsSvc', 'AuditSvc',
	function($rootScope, $scope, $location,$firebaseArray, GroupsSvc, AuditSvc){
		//$rootScope.isAdmin = true;
	   	console.log("on Groups Controller");
			$rootScope.response = null;
	   	GroupsSvc.loadAllGroupsList();

	    cleanScope = function(){
	    	$scope.groupId = null;
	    	$scope.group = null;
	    	$scope.address = null;
	    	$scope.schedule = null;
	    	$scope.response = null;
				$rootScope.response = null;
	    };

	    /*
	    This method will be used to Create a new Group, or update the changes made to the recently created one.
	    Note: Schedule Time is not getting persisted now because firebase cannot store Date Objects
		$scope.groupId, $scope.group, $scope.address, $scope.schedule
	    */
	    $scope.saveGroup = function() {
	    	let groupsRef = firebase.database().ref().child('pibxalapa').child('groups');
	    	let record = { group: $scope.group, address: $scope.address, schedule: $scope.schedule };

	    	if( !$scope.groupId ){
					//console.log("Creating new group");
	    		var newgroupRef = groupsRef.push();
					newgroupRef.set(record, function(error) {
						if(error){
							$scope.response = { messageErr: error};
						}else{
						    $scope.groupId = newgroupRef.key;
						    $scope.response = { messageOk: "Grupo Creado"};
						    AuditSvc.recordAudit(newgroupRef, "create", "groups");
						}
					});
	    	}else{
	    		//console.log("Updating group: "+$scope.groupId);
	    		let gRef = groupsRef.child($scope.groupId);
			    gRef.update(record, function(error) {
						if(error){
							$scope.response = { messageErr: error};
						}else{
							$scope.response = { messageOk: "Grupo Actualizado"};
					    	AuditSvc.recordAudit(gRef, "update", "groups");
						}
					});
	    	}
	    };

	    $scope.deleteGroup = function() {
	    	if( $scope.groupId ){
	    		//console.log("Deleting group: "+$scope.groupId);
					let groupsRef = firebase.database().ref().child('pibxalapa').child('groups');
					let gRef = groupsRef.child($scope.groupId);
					let record = null;

					gRef.set(record, function(error) {
						if(error){
							$scope.response = { messageErr: error};
						}else{
							cleanScope();
					    $scope.response = { messageOk: "Grupo Eliminado"};
					    AuditSvc.recordAudit(gRef, "delete", "groups");
							$location.path( "/success/deleted");
						}
					});
					// $rootScope.allGroups.$remove(record).then(function(ref) {
					// 		cleanScope();
					//     $scope.response = { messageOk: "Grupo Eliminado"};
					//     AuditSvc.recordAudit(ref, "delete", "groups");
					// 		$location.path( "/success/deleted");
					// }).catch(function(err) {
					// 	$scope.response = { messageErr: err};
					// });
	    	}
	    };

  	}
]);

okulusApp.controller('GroupDetailsCntrl', ['$rootScope', '$scope','$routeParams', '$location','$firebaseArray', '$firebaseObject', 'GroupsSvc',
	function($rootScope, $scope, $routeParams, $location, $firebaseArray, $firebaseObject, GroupsSvc){
		console.log("On GroupDetailsCntrl");

		//$rootScope.isAdmin = true; //Remove this is we are not going to use the form as a view for members
		let whichGroup = $routeParams.groupId;


		GroupsSvc.loadAllGroupsList(); //This is in case of a Refresh in the view
		$rootScope.allGroups.$loaded(function() {
			//Load Specific Group
			let record = GroupsSvc.getGroup(whichGroup);
			if(record){
				$scope.groupId = record.$id;
				$scope.group = record.group;
			  $scope.address = record.address;
			  $scope.schedule = record.schedule;
			}else{
				$rootScope.response = { messageErr: "El Grupo '"+whichGroup+ "' no existe"};
				$location.path( "/error" );
			}
		});

	}
]);

okulusApp.factory('GroupsSvc', ['$rootScope', '$firebaseArray', '$firebaseObject',
	function($rootScope, $firebaseArray, $firebaseObject){

		let groupsRef = firebase.database().ref().child('pibxalapa').child('groups');
		//Get only Active Status groups
		let activeGroupsRef = firebase.database().ref().child('pibxalapa').child('groups').orderByChild("group/status").equalTo("active");

		return {
			getGroup: function(groupId){
				return $rootScope.allGroups.$getRecord(groupId);
			},
			loadAllGroupsList: function(){
				if(!$rootScope.allGroups){
					console.log("Creating firebaseArray for Groups");
					$rootScope.allGroups = $firebaseArray(groupsRef);
				}
			},
			loadActiveGroups: function(){
				if(!$rootScope.allActiveGroups){
					$rootScope.allActiveGroups = $firebaseArray(activeGroupsRef);
				}
			}
		};
	}
]);
