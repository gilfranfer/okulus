okulusApp.controller('MyGroupsListCntrl', ['GroupsSvc', '$rootScope',
	function(GroupsSvc, $rootScope){
		$rootScope.groupsList = GroupsSvc.loadAllGroupsList();
	}
]);

okulusApp.controller('GroupsAdminListCntrl', ['GroupsSvc', '$rootScope',
	function(GroupsSvc, $rootScope){
		$rootScope.groupsList = GroupsSvc.loadAllGroupsList();
	}
]);

okulusApp.controller('GroupFormCntrl', ['$rootScope', '$scope', '$location', 'GroupsSvc', 'AuditSvc', 'UtilsSvc',
	function($rootScope, $scope, $location, GroupsSvc, AuditSvc, UtilsSvc){
	   	//$rootScope.response = null;

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
						gRef.update(record, function(error) {
							if(error){
								$scope.response = { messageError: error};
							}else{
								$scope.response = { messageOk: "Grupo Actualizado"};
								AuditSvc.recordAudit(gRef, "update", "groups");
							}
						});
		    	}
				/* Otherwise, when groupId is not present in the scope,
					we perform a SET to create a new record */
				else{
	    		var newgroupRef = GroupsSvc.getNewGroupReference();
					newgroupRef.set(record, function(error) {
						if(error){
							$scope.response = { messageError: error};
						}else{
					    $scope.groupId = newgroupRef.key;
					    $scope.response = { messageOk: "Grupo Creado"};
					    AuditSvc.recordAudit(newgroupRef, "create", "groups");
						}
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
						    $rootScope.response = { messageOk: "Grupo Eliminado"};
						    AuditSvc.recordAudit(ref, "delete", "groups");
								$location.path( "/groups");
							}).catch(function(err) {
								$rootScope.response = { messageError: err};
							});
				  });
		    }
	    };

  	}
]);

okulusApp.controller('GroupDetailsCntrl', ['$scope','$routeParams', '$location', 'GroupsSvc',
	function($scope, $routeParams, $location, GroupsSvc){
		let whichGroup = $routeParams.groupId;

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

		return {
			allGroupsLoaded: function() {
				return $rootScope.allGroups != null;
			},
			//Use this when $rootScope.allGroups is already loaded
			getGroupFromArray: function(groupId){
				return $rootScope.allGroups.$getRecord(groupId);
			},
			//Use this when $rootScope.allGroups is NOT loaded
			getGroupObj: function(groupId){
				return $firebaseObject(groupsRef.child(groupId));
			},
			loadAllGroupsList: function(){
				if(!$rootScope.allGroups){
					console.debug("Creating firebaseArray for Groups");
					$rootScope.allGroups = $firebaseArray(groupsRef);
				}
				return $rootScope.allGroups;
			},
			loadActiveGroups: function(){
				if(!$rootScope.allActiveGroups){
					$rootScope.allActiveGroups = $firebaseArray(activeGroupsRef);
				}
			},
			getGroupReference: function(groupId){
				return groupsRef.child(groupId);
			},
			getNewGroupReference: function(){
				return groupsRef.push();
			},
			addReportReference: function(reportId, report){
				//Save the report Id in the Group/reports
				let record = { report:reportId, date:firebase.database.ServerValue.TIMESTAMP };
				let ref = groupsRef.child(report.reunion.groupId).child("reports").push();
				ref.set(record);
			},
			getAccessRulesForGroup: function (groupId) {
				let reference = groupsRef.child(groupId).child("access");
				return $firebaseArray(reference);
			}
		};
	}
]);

okulusApp.controller('AccessRulesCntrl', ['GroupsSvc', 'MembersSvc', 'AuditSvc','$rootScope', '$scope','$routeParams', '$location',
	function(GroupsSvc, MembersSvc, AuditSvc, $rootScope, $scope,$routeParams, $location){

		MembersSvc.loadActiveMembers();
		let whichGroup = $routeParams.groupId;
		$scope.acessList = GroupsSvc.getAccessRulesForGroup(whichGroup);
		GroupsSvc.getGroupObj(whichGroup).$loaded().then(
			function(obj){
				$scope.group = obj;
			}
		);

		$scope.addRule = function(){
			let whichMember = $scope.access.memberId;
			let memberName = document.getElementById('memberSelect').options[document.getElementById('memberSelect').selectedIndex].text;
			let groupName = $scope.group.group.name;
			let record = { memberName: memberName, memberId: whichMember, date:firebase.database.ServerValue.TIMESTAMP };

			//Use the Group´s access list to add a new record
			$scope.acessList.$add(record).then(function(ref) {
				AuditSvc.recordAudit(GroupsSvc.getGroupReference(whichGroup), "access granted", "groups");
				//update record. Now to point to the Group
				var id = ref.key; //use the same push key for the record on member/access folder
				record = { groupName: groupName, groupId: whichGroup, date:firebase.database.ServerValue.TIMESTAMP };
				MembersSvc.getMemberReference(whichMember).child("access").child(id).set(record, function(error) {
					if(error){
						console.error(error);
					}else{
						AuditSvc.recordAudit(MembersSvc.getMemberReference(whichMember), "access granted", "members");
					}
				});
			});
		};

		$scope.deleteRule = function(ruleId){
			var rec = $scope.acessList.$getRecord(ruleId);
			let whichMember = rec.memberId;
			$scope.acessList.$remove(rec).then(function(ref) {
				//rule removed from Groups access folder
				//now removed the same rule from Member access folder
			  AuditSvc.recordAudit(GroupsSvc.getGroupReference(whichGroup), "access deleted", "groups");
				MembersSvc.getMemberReference(whichMember).child("access").child(ref.key).set(null, function(error) {
					if(error){
						console.error(error);
					}else{
						AuditSvc.recordAudit(MembersSvc.getMemberReference(whichMember), "access deleted", "members");
					}
				});
			});
		};
	}
]);
