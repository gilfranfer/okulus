okulusApp.controller('GroupsAdminListCntrl', ['GroupsSvc', '$rootScope',
	function(GroupsSvc, $rootScope){
		$rootScope.groupsList = GroupsSvc.loadAllGroupsList();
	}
]);

okulusApp.controller('GroupFormCntrl', ['$rootScope', '$scope', '$location', 'GroupsSvc', 'AuditSvc', 'UtilsSvc',
	function($rootScope, $scope, $location, GroupsSvc, AuditSvc, UtilsSvc){
	   	$rootScope.response = null;
			$scope.provideAddress = true;

			cleanScope = function(){
	    	$scope.groupId = null;
	    	$scope.group = null;
	    	$scope.address = null;
	    	$scope.schedule = null;
	    	$scope.response = null;
				$rootScope.response = null;
	    };

	    $scope.saveOrUpdateGroup = function() {
				//$scope.response = null;
				let record = { group: $scope.group, address: $scope.address, schedule: $scope.schedule };
				record.schedule.time = UtilsSvc.buildTimeJson($scope.schedule.timestamp);

				/* When a value for groupId is present in the scope, the user is on Edit
					mode and we have to perform an UPDATE.*/
		    	if( $scope.groupId ){
						let gRef = GroupsSvc.getGroupReference($scope.groupId);
						let orgiStatus = undefined;
						gRef.child("group/status").once('value').then(
							function(snapshot) {
								orgiStatus = snapshot.val();
							});

						gRef.update(record, function(error) {
							if(error){
								$scope.response = { groupMsgError: error};
							}else{
								$scope.response = { groupMsgOk: "Grupo Actualizado"};
								AuditSvc.recordAudit(gRef.key, "update", "groups");

								if(orgiStatus != record.group.status){
									GroupsSvc.updateGroupsStatusCounter(record.group.status);
								}
							}
						});
		    	}
				/* Otherwise, when groupId is not present in the scope,
					we perform a SET to create a new record */
				else{
	    		var newgroupRef = GroupsSvc.getNewGroupReference();
					newgroupRef.set(record, function(error) {
						if(error){
							$scope.response = { groupMsgError: error};
						}else{
							//For some reason the message is not displayed until
							//you interact with any form element
						}
					});

					//adding trick below to ensure message is displayed
					let obj = GroupsSvc.getGroupObj(newgroupRef.key);
					obj.$loaded().then(function(data) {
						$scope.groupId = newgroupRef.key;
						$scope.response = { groupMsgOk: "Grupo Creado"};
						AuditSvc.recordAudit(newgroupRef.key, "create", "groups");
						GroupsSvc.updateGroupsStatusCounter(data.group.status);
					});
	    	}
	    };

	    $scope.deleteGroup = function() {
	    	if( $scope.groupId ){
					GroupsSvc.loadAllGroupsList().$loaded().then(
						function(list) {
							let record = GroupsSvc.getGroupFromArray($scope.groupId);
							list.$remove(record).then(function(ref) {
								cleanScope();
						    $rootScope.response = { groupMsgOk: "Grupo Eliminado"};
						    AuditSvc.recordAudit(ref.key, "delete", "groups");
								$location.path( "/groups");
							}).catch(function(err) {
								$rootScope.response = { groupMsgError: err};
							});
				  });
		    }
	    };
  	}
]);

okulusApp.controller('GroupDetailsCntrl', ['$scope','$routeParams', '$location', 'GroupsSvc',
	function($scope, $routeParams, $location, GroupsSvc){
		let whichGroup = $routeParams.groupId;
		$scope.provideAddress = true;

		/* When opening "Edit" page from the Groups List, we can use the
		"allGroups" firebaseArray from rootScope to get the specific Group data */
		if( GroupsSvc.allGroupsLoaded() ){
			let record = GroupsSvc.getGroupFromArray(whichGroup);
			putRecordOnScope(record);
		}
		/* But, when using a direct link to an "Edit" page, or when refresing (f5),
		we will not have the "allGroups" firebaseArray Loaded in the rootScope.
		Instead of loading all the Groups, what could be innecessary,
		we can use firebaseObject to get only the required group data */
		else{
			let obj = GroupsSvc.getGroupObj(whichGroup);
			obj.$loaded().then(function() {
				putRecordOnScope(obj);
			}).catch(function(error) {
		    $location.path( "/error/norecord" );
		  });
		}

		function putRecordOnScope(record){
			if(record && record.group){
				$scope.groupId = record.$id;
				$scope.group = record.group;
				$scope.address = record.address;
				$scope.schedule = record.schedule;
				if(record.schedule.time){
					console.log("Setting Time")
					$scope.schedule.timestamp = new Date();
					$scope.schedule.timestamp.setHours(record.schedule.time.HH);
					$scope.schedule.timestamp.setMinutes(record.schedule.time.MM);
					$scope.schedule.timestamp.setSeconds(0);
					$scope.schedule.timestamp.setMilliseconds(0);
				}
			}else{
				$location.path( "/error/norecord" );
			}
		}

	}
]);

okulusApp.factory('GroupsSvc', ['$rootScope', '$firebaseArray', '$firebaseObject',
	function($rootScope, $firebaseArray, $firebaseObject){

		let groupsRef = firebase.database().ref().child('pibxalapa/groups');
		let activeGroupsRef = groupsRef.orderByChild("group/status").equalTo("active");

		let counterRef = firebase.database().ref().child('pibxalapa/counters/groups');

		return {
			getGroupReference: function(groupId){
				return groupsRef.child(groupId);
			},
			getNewGroupReference: function(){
				return groupsRef.push();
			},

			//Use this when $rootScope.allGroups is NOT loaded
			getGroupObj: function(groupId){
				return $firebaseObject(groupsRef.child(groupId));
			},
			//Use this when $rootScope.allGroups is already loaded
			getGroupFromArray: function(groupId){
				return $rootScope.allGroups.$getRecord(groupId);
			},
			loadAllGroupsList: function(){
				if(!$rootScope.allGroups){
					console.debug("Creating firebaseArray for Groups");
					$rootScope.allGroups = $firebaseArray(groupsRef);
				}
				return $rootScope.allGroups;
			},
			allGroupsLoaded: function() {
				return $rootScope.allGroups != null;
			},

			loadActiveGroups: function(){
				if(!$rootScope.allActiveGroups){
					$rootScope.allActiveGroups = $firebaseArray(activeGroupsRef);
				}
				return $rootScope.allActiveGroups;
			},
			// getActiveGroupFromArray: function(groupId){
			// 	return $rootScope.allGroups.$getRecord(groupId);
			// },
			addReportReference: function(reportId, report){
				//Save the report Id in the Group/reports
				let record = { report:reportId, date:firebase.database.ServerValue.TIMESTAMP };
				let ref = groupsRef.child(report.reunion.groupId).child("reports").push();
				ref.set(record);
			},
			getAccessRulesForGroup: function (groupId) {
				let reference = groupsRef.child(groupId).child("access");
				return $firebaseArray(reference);
			},
			updateGroupsStatusCounter(status){
				$firebaseObject(counterRef).$loaded().then(
					function( groupStatusCounter ){
						if(status == 'active'){
							groupStatusCounter.active = groupStatusCounter.active+1;
						}else{
							groupStatusCounter.inactive = groupStatusCounter.inactive+1;
						}
						groupStatusCounter.$save();
					}
				);
			}
		};
	}
]);
