okulusApp.controller('GroupListCntrl', ['GroupsSvc', '$rootScope',
	function(GroupsSvc, $rootScope){
		GroupsSvc.loadAllGroupsList();
		$rootScope.allGroups.$loaded(function() {
			console.log("List of All Groups Loaded");
	    });
	}
]);

okulusApp.controller('GroupFormCntrl', ['$rootScope', '$scope', '$firebaseArray', 'GroupsSvc', 'AuditSvc',
	function($rootScope, $scope, $firebaseArray, GroupsSvc, AuditSvc){
		$rootScope.isAdmin = true;
	   	console.log("on Groups Controller");
	   	GroupsSvc.loadAllGroupsList();

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
	   
	    /* 
	    This method will be used to Create a new Group, or update the changes made to the recently created one.
	    Note: Schedule Time is not getting persisted now because firebase cannot store Date Objects
		$scope.groupId, $scope.group, $scope.address, $scope.schedule
	    */
	    $scope.saveGroup = function() {
	    	console.log("saveGroup");
	    	if( !$scope.groupId ){
				console.log("Creating new group");
	    		let record = {group: $scope.group, address: $scope.address, schedule: $scope.schedule};
		    	
		    	//Move to Svc
		    	$rootScope.allGroups.$add( record ).then(function(ref) {
				    $scope.groupId = ref.key;
				    $scope.response = { messageOk: "Grupo creado"};
				    AuditSvc.recordAudit(ref, "create", "groups");
				}).catch(function(err) {
					$scope.response = { messageErr: err};
				});
	    	}else{
	    		console.log("Updating group: "+$scope.groupId);
				let record = GroupsSvc.getGroup($scope.groupId);
				record.group = $scope.group;
				record.address = $scope.address;
		    	record.schedule = $scope.schedule; 

		    	//Move to Svc
		    	$rootScope.allGroups.$save(record).then(function(ref) {
				    $scope.response = { messageOk: "Grupo Actualizado"};
				    AuditSvc.recordAudit(ref, "update", "groups");
				})
				.catch(function(err) {
					$scope.response = { messageErr: err};
				});
	    	}
	    };

	    $scope.deleteGroup = function() {
	    	console.log("deleteGroup");
	    	if( $scope.groupId ){
	    		console.log("Deleting group: "+$scope.groupId);
				let record = GroupsSvc.getGroup($scope.groupId);
				
				//Move to Svc
				$rootScope.allGroups.$remove(record).then(function(ref) {
					cleanScope();
				    $scope.response = { messageOk: "Grupo Eliminado"};
				    AuditSvc.recordAudit(ref, "delete", "groups");
				})
				.catch(function(err) {
					$scope.response = { messageErr: err};
				});
	    	}else{
	    		cleanScope();
	    	}    	
	    };

  	}
]);

okulusApp.controller('GroupDetailsCntrl', ['$rootScope', '$scope','$routeParams', '$firebaseArray', '$firebaseObject', 'GroupsSvc', 'AuditSvc',
	function($rootScope, $scope, $routeParams, $firebaseArray, $firebaseObject, GroupsSvc, AuditSvc){
		console.log("On GroupDetailsCntrl");
		$rootScope.isAdmin = true;

		GroupsSvc.loadAllGroupsList();
		
		//Load Specific Group
		let whichGroup = $routeParams.groupId;
		let record = GroupsSvc.getGroup(whichGroup);

		$scope.groupId = record.$id;
		$scope.group = record.group;
	    $scope.address = record.address;
	    $scope.schedule = record.schedule;

		console.log(whichGroup);
		console.log(record);

	}
]);

okulusApp.factory('GroupsSvc', ['$rootScope', '$firebaseArray', '$firebaseObject',
	function($rootScope, $firebaseArray, $firebaseObject){
		
		let groupsRef = firebase.database().ref().child('pibxalapa').child('groups');

		return {
			getGroup: function(groupId){
				return $rootScope.allGroups.$getRecord(groupId);
			},
			loadAllGroupsList: function(){
				if(!$rootScope.allGroups){
					console.log("Creating firebaseArray for Groups");
					$rootScope.allGroups = $firebaseArray(groupsRef);
				}
			}
		};
	}
]);