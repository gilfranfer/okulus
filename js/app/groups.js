//Mapping: /groups
okulusApp.controller('GroupsListCntrl',
	['$rootScope','$scope','$firebaseAuth','$location','GroupsSvc', 'AuthenticationSvc',
	function($rootScope,$scope,$firebaseAuth,$location,GroupsSvc,AuthenticationSvc){

		let unwatch = undefined;
		/* Executed everytime we enter to /groups
		  This function is used to confirm the user is Admin */
		$scope.response = {loading: true, message: systemMsgs.inProgress.loading };
		$firebaseAuth().$onAuthStateChanged(function(authUser){ if(authUser){
			AuthenticationSvc.loadSessionData(authUser.uid).$loaded().then( function(user){
				if(user.type == constants.roles.admin){
					/*Load Group Counters and Set Watch*/
					$rootScope.groupsGlobalCount = GroupsSvc.getGlobalGroupsCounter();
					$rootScope.groupsGlobalCount.$loaded().then(
						function(groupsCount) {
							$scope.response = undefined;
							/* Adding a Watch to the groupsGlobalCount to detect changes.
							The idea is to update the maxPossible value from adminGroupsParams.*/
							if(unwatch){ unwatch(); }
							unwatch = $rootScope.groupsGlobalCount.$watch( function(data){
								if($rootScope.adminGroupsParams){
									let loader = $rootScope.adminGroupsParams.activeGroupsLoader;
									$rootScope.adminGroupsParams = getAdminGroupsParams(loader);
									$scope.response = undefined;
								}
							});
					});
				}else{
					$rootScope.response = {error:true, showHomeButton: true,
																	message:systemMsgs.error.noPrivileges};
					$location.path(constants.pages.error);
				}
			});
		}});

		/* All the following on-demand loaders (called from html view) will limit the
		 initial result list to the maxQueryListResults value (from $rootScope.config).
		 They will create a params object containing the name of the loader used,
		 and determining the max possible records to display. */
		$scope.loadAllGroupsList = function () {
			$scope.response = {loading:true, message:systemMsgs.inProgress.loadingAllGroups};
			$rootScope.adminGroupsParams = getParamsByLoader("AllGroupsLoader");
			$rootScope.adminGroupsList = GroupsSvc.getAllGroups($rootScope.config.maxQueryListResults);
			whenGroupsRetrieved();
		};

		$scope.loadActiveGroupsList = function () {
 			$scope.response = {loading:true, message:systemMsgs.inProgress.loadingActiveGroups};
 			$rootScope.adminGroupsParams = getParamsByLoader("ActiveGroupsLoader");
 			$rootScope.adminGroupsList = GroupsSvc.getActiveGroups($rootScope.config.maxQueryListResults);
 			whenGroupsRetrieved();
		};

		$scope.loadInactiveGroupsList = function () {
 			$scope.response = {loading:true, message:systemMsgs.inProgress.loadingInactiveGroups};
 			$rootScope.adminGroupsParams = getParamsByLoader("InactiveGroupsLoader");
 			$rootScope.adminGroupsList = GroupsSvc.getInactiveGroups($rootScope.config.maxQueryListResults);
 			whenGroupsRetrieved();
		};

		/* Load ALL pending groups. Use the adminGroupsParams.activeLoader
		to determine what type of groups should be loaded, and how. */
		$scope.loadPendingGroups = function () {
			let loaderName = $rootScope.adminGroupsParams.activeLoader;
			$scope.response = {loading: true, message: systemMsgs.inProgress.loading };
			if(loaderName=="AllGroupsLoader"){
				$rootScope.adminGroupsList = GroupsSvc.getAllGroups();
			} else if(loaderName=="ActiveGroupsLoader"){
				$rootScope.adminGroupsList = GroupsSvc.getActiveGroups();
			} else if(loaderName=="InactiveGroupsLoader"){
				$rootScope.adminGroupsList = GroupsSvc.getInactiveGroups();
			}
			whenGroupsRetrieved();
		};

		/*Build object with Params used in the view.
		 activeLoader: Will help to identify what type of groups we want to load.
		 searchFilter: Container for the view filter
		 title: Title of the Groups List will change according to the loader in use
		 maxPossible: Used to inform the user how many elements are pending to load */
		getParamsByLoader = function (loaderName) {
			let params = {activeLoader:loaderName, searchFilter:undefined};
			if(loaderName == "AllGroupsLoader"){
				params.title= systemMsgs.success.allGroupsTitle;
				params.maxPossible = $rootScope.groupsGlobalCount.total;
			}
			else if(loaderName == "ActiveGroupsLoader"){
				params.title= systemMsgs.success.activeGroupsTitle;
				params.maxPossible = $rootScope.groupsGlobalCount.active;
			}
			else if(loaderName == "InactiveGroupsLoader"){
				params.title= systemMsgs.success.inactiveGroupsTitle;
				params.maxPossible = $rootScope.groupsGlobalCount.total - $rootScope.groupsGlobalCount.active;
			}
			return params;
		};

		/*Prepares the response after the groups list is loaded */
		whenGroupsRetrieved = function () {
			$rootScope.adminGroupsList.$loaded().then(function(groups) {
				$scope.response = undefined;
				$rootScope.groupsResponse = null;
				if(!groups.length){
					$scope.response = { error: true, message: systemMsgs.error.noGroupsError };
				}
			}).catch( function(error){
				$scope.response = { error: true, message: systemMsgs.error.loadingGroupsError };
				console.error(error);
			});
		};

	}
]);

/* Controller linked to /mygroups
 * It will load the Groups the Current Member has Access to */
okulusApp.controller('GroupsUserCntrl',
	['$rootScope','$scope', '$location','$firebaseAuth','AuthenticationSvc', 'MembersSvc','GroupsSvc',
	function($rootScope,$scope,$location,$firebaseAuth,AuthenticationSvc,MembersSvc, GroupsSvc){
		$scope.response = {loading: true, message: $rootScope.i18n.alerts.loading };

		/* Executed everytime we enter to /mygroups
		  This function is used to confirm the user has an associated Member */
		$firebaseAuth().$onAuthStateChanged(function(authUser){
    	if(authUser){
				AuthenticationSvc.loadSessionData(authUser.uid).$loaded().then(function (user) {
					if(!user.memberId){
						$rootScope.response = {error: true, message: systemMsgs.error.noMemberAssociated};
						$location.path(constants.pages.error);
						return;
					}

					//TODO: Get groups from new db folder to reduce data load
					//Get the Groups the user has access to
					GroupsSvc.loadAllGroupsList().$loaded().then( function(allGroups){
						return MembersSvc.getMemberAccessRules(user.memberId).$loaded();
					}).then(function (memberRules) {
						let filteredGroups = MembersSvc.filterMemberGroupsFromRules(memberRules, $rootScope.allGroups);
						$rootScope.myGroupsList = filteredGroups;
						$scope.loadingGroups = false;
						if(!filteredGroups.length){
							$scope.response = {noGroupsFound:true};
						}
					});

				});
			}
		});
	}
]);

okulusApp.controller('GroupFormCntrl', ['$rootScope', '$scope', '$location', '$firebaseAuth', 'GroupsSvc', 'MembersSvc', 'AuditSvc', 'UtilsSvc', 'AuthenticationSvc',
	function($rootScope, $scope, $location, $firebaseAuth, GroupsSvc, MembersSvc, AuditSvc, UtilsSvc,AuthenticationSvc){

		$firebaseAuth().$onAuthStateChanged( function(authUser){
    		if(authUser){
				AuthenticationSvc.loadSessionData(authUser.uid).$loaded().then(function (user) {
					if(!user.memberId){
						$rootScope.response = { error:true, message: systemMsgs.error.noMemberAssociated};
						$location.path(constants.pages.error);
						return;
					}
					$rootScope.response = null;
					$scope.provideAddress = true;
					$scope.membersList = MembersSvc.getActiveMembers();
					$scope.membersList.$loaded().then(function(activeMembers){
						//$scope.hostsList = MembersSvc.filterActiveHosts(activeMembers);
						//$scope.leadsList = MembersSvc.filterActiveLeads(activeMembers);
					});
				});
			}
		});

	    $scope.saveOrUpdateGroup = function() {
				$scope.response = null;
				$scope.working = true;
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
							$scope.working = false;
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
							$scope.working = false;
							$scope.response = { groupMsgError: error};
						}else{
							//For some reason the message is not displayed until
							//you interact with any form element
						}
					});

					//adding trick below to ensure message is displayed
					let obj = GroupsSvc.getGroupObj(newgroupRef.key);
					obj.$loaded().then(function(data) {
						//$scope.groupId = newgroupRef.key;
						AuditSvc.recordAudit(newgroupRef.key, "create", "groups");
						GroupsSvc.increaseGroupsStatusCounter(data.group.status);
						$rootScope.response = { groupMsgOk: "Grupo Creado"};
						$scope.working = false;
						$location.path( "/groups");
					});
	    	}
	    };

			/* A group can be deleted by Admin if there are no reports associated to it.
			 When deleting a Group:
				1. Decrease the Group Status counter
				2. Delete all references to this group from member/access
			*/
	    $scope.deleteGroup = function() {
				if($rootScope.currentSession.user.type == 'user'){
					$scope.response = { groupMsgError: "Para eliminar este grupo, contacta al administrador"};
				}else{
					$scope.working = true;
		    	if( $scope.groupId ){
						GroupsSvc.getGroupObj($scope.groupId).$loaded().then( function (groupObj) {
							let status = groupObj.group.status;
							let accessList = groupObj.access;
							if( !groupObj.reports ){
								groupObj.$remove().then(function(ref) {
									$rootScope.response = { groupMsgOk: "Grupo Eliminado"};
									AuditSvc.recordAudit(ref.key, "delete", "groups");
									GroupsSvc.decreaseGroupsStatusCounter(status);
									MembersSvc.deleteMembersAccess(accessList);
									$scope.working = false;
									$location.path( "/groups");
								}, function(error) {
									$scope.working = false;
									$rootScope.response = { groupMsgError: err};
									// console.debug("Error:", error);
								});
							}else{
								$scope.working = false;
								$scope.response = { groupMsgError: "No se puede elminar el Grupo porque tiene Reportes asociados"};
							}
						});
			    }
				}
	    };

}]);

okulusApp.controller('GroupDetailsCntrl', ['$scope','$routeParams', '$location', 'GroupsSvc','MembersSvc',
	function($scope, $routeParams, $location, GroupsSvc,MembersSvc){
		let whichGroup = $routeParams.groupId;
		$scope.provideAddress = true;
		$scope.membersList = MembersSvc.getActiveMembers();

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
				$scope.audit = record.audit;
				if(record.schedule.time){
					//console.debug("Setting Time")
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

okulusApp.factory('GroupsSvc',
['$rootScope', '$firebaseArray', '$firebaseObject',
	function($rootScope, $firebaseArray, $firebaseObject){

		let baseRef = firebase.database().ref().child(rootFolder);
		let groupsListRef = baseRef.child(constants.folders.groupsList);
		let isActiveGroupRef = groupsListRef.orderByChild(constants.status.isActive);

		//TODO: Update to groups/details
		let groupDetailsRef = firebase.database().ref().child(rootFolder).child('groups');
		let groupsRef = firebase.database().ref().child(rootFolder).child('groups');
		let activeGroupsRef = groupsRef.orderByChild("group/status").equalTo("active");

		let counterRef = firebase.database().ref().child(rootFolder).child('counters/groups');

		/*Using a Transaction with an update function to reduce the counter by 1 */
		let decreaseCounter = function(counterRef){
			counterRef.transaction(function(currentCount) {
				if(currentCount>0)
					return currentCount - 1;
				return currentCount;
			});
		};

		/*Using a Transaction with an update function to increase the counter by 1 */
		let increaseCounter = function(counterRef){
			counterRef.transaction(function(currentCount) {
				return currentCount + 1;
			});
		};

		return {
			getGlobalGroupsCounter: function(){
				return $firebaseObject(baseRef.child(constants.folders.groupsCounters));
			},
			/* Return all Members, using a limit for the query, if specified*/
			getAllGroups: function(limit) {
					if(limit){
						return $firebaseArray(groupsListRef.orderByKey().limitToLast(limit));
					}else{
						return $firebaseArray(groupsListRef.orderByKey());
					}
			},
			/* Return all Groups with isActive:true, using a limit for the query, if specified*/
			getActiveGroups: function(limit) {
				if(limit){
					return $firebaseArray(isActiveGroupRef.equalTo(true).limitToLast(limit));
				}else{
					return $firebaseArray(isActiveGroupRef.equalTo(true));
				}
			},
			/* Return all Groups with isActive:false, using a limit for the query, if specified*/
			getInactiveGroups: function(limit) {
				if(limit){
					return $firebaseArray(isActiveGroupRef.equalTo(false).limitToLast(limit));
				}else{
					return $firebaseArray(isActiveGroupRef.equalTo(false));
				}
			},

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
			addReportReference: function(report){
				//Save the report Id in the Group/reports
				let ref = groupsRef.child(report.reunion.groupId).child("reports").child(report.$id);
				ref.set({
					reportId:report.$id,
					weekId:report.reunion.weekId,
					date:report.reunion.dateObj
				});
			},
			removeReportReference: function(reportId,groupId){
				let ref = groupsRef.child(groupId).child("reports").child(reportId);
				ref.set(null);
			},
			getAccessRulesForGroup: function (groupId) {
				let reference = groupsRef.child(groupId).child("access");
				return $firebaseArray(reference);
			},
			/* Receives the member's access rules ( { accessRuleId: {groupId,groupName,date} , ...} ),
			and uses it to delete the member's access to each group.
			The accessRuleId is the same on groups/:gropuId/access/:accessRuleId
			and members/:memberId/access/:accessRuleId */
			removeAllGroupAccess: function(accessList){
				if(accessList){
					accessList.forEach(function(accessRule) {
						let accessRuleId = accessRule.$id;
						groupDetailsRef.child(accessRule.groupId).child("access").child(accessRuleId).set(null);
					});
				}
			},
			deleteAccessToGroups: function(accessObj){
				if(accessObj){
					for (const accessRuleId in accessObj) {
						let groupId = accessObj[accessRuleId].groupId;
						groupsRef.child(groupId).child("access").child(accessRuleId).set(null);
					}
				}
			},
			increaseGroupsStatusCounter(status){
				$firebaseObject(counterRef).$loaded().then(
					function( groupStatusCounter ){
						if(status == 'active'){
							groupStatusCounter.active = groupStatusCounter.active+1;
						}else{
							groupStatusCounter.inactive = groupStatusCounter.inactive+1;
						}
						groupStatusCounter.$save();
					});
			},
			decreaseGroupsStatusCounter(status){
				$firebaseObject(counterRef).$loaded().then(
					function( groupStatusCounter ){
						if(status == 'active'){
							groupStatusCounter.active = groupStatusCounter.active-1;
						}else{
							groupStatusCounter.inactive = groupStatusCounter.inactive-1;
						}
						groupStatusCounter.$save();
					});
			},
			updateGroupsStatusCounter(status){
				$firebaseObject(counterRef).$loaded().then(
					function( groupStatusCounter ){
						if(status == 'active'){
							groupStatusCounter.active = groupStatusCounter.active+1;
							groupStatusCounter.inactive = groupStatusCounter.inactive-1;
						}else{
							groupStatusCounter.inactive = groupStatusCounter.inactive+1;
							groupStatusCounter.active = groupStatusCounter.active-1;
						}
						groupStatusCounter.$save();
					});
			}
		};
	}
]);

okulusApp.controller('GroupAccessRulesCntrl',
	['GroupsSvc', 'MembersSvc', 'AuditSvc','NotificationsSvc','$rootScope', '$scope','$routeParams', '$location','$firebaseAuth','AuthenticationSvc',
	function(GroupsSvc, MembersSvc, AuditSvc, NotificationsSvc, $rootScope, $scope,$routeParams, $location, $firebaseAuth,AuthenticationSvc){

		$scope.response = null;
		let whichGroup = $routeParams.groupId;

		$firebaseAuth().$onAuthStateChanged( function(authUser){
    		if(authUser){
				AuthenticationSvc.loadSessionData(authUser.uid).$loaded().then(function (obj) {
					if($rootScope.currentSession.user.type == 'admin'){
						//$scope.membersAccess = MembersSvc.getMembersThatCanBeUser();
						$scope.acessList = GroupsSvc.getAccessRulesForGroup(whichGroup);
						$scope.group = GroupsSvc.getGroupObj(whichGroup);
					}else{
						$location.path("/error/norecord");
					}
				});
			}
		});

		$scope.addRule = function(){
			let whichMember = $scope.access.memberId;
			let memberName = document.getElementById('memberSelect').options[document.getElementById('memberSelect').selectedIndex].text;
			let groupName = $scope.group.group.name;
			let record = { memberName: memberName, memberId: whichMember, date:firebase.database.ServerValue.TIMESTAMP };

			let ruleExists = false;
			$scope.acessList.forEach(function(rule) {
					if(rule.memberId == whichMember){
						ruleExists = true;
					}
			});

			if(!ruleExists){
				//Use the Group´s access list to add a new record
				$scope.acessList.$add(record).then(function(ref) {
					AuditSvc.recordAudit(whichGroup, "access-granted", "groups");
					//notify the member that got the access
					MembersSvc.getMember(whichMember).$loaded().then(function(member){
						console.debug(member);
						NotificationsSvc.notifySpecificUser(member.user.userId,"access-granted", "groups", whichGroup,null,null);
					});
					$scope.response = { accessMsgOk: "Acceso Concedido a " + memberName };
					//update record. Now to point to the Group
					var id = ref.key; //use the same push key for the record on member/access folder
					record = { groupName: groupName, groupId: whichGroup, date:firebase.database.ServerValue.TIMESTAMP };
					MembersSvc.getMemberReference(whichMember).child("access").child(id).set(record, function(error) {
						if(error){
							$scope.response = { accessMsgError: error };
						}else{
							AuditSvc.recordAudit(whichMember, "access-granted", "members");
						}
					});
				});
			}else{
				$scope.response = { accessMsgError: memberName + " ya tiene acceso al grupo"};
			}

		};

		$scope.deleteRule = function(ruleId){
			var rec = $scope.acessList.$getRecord(ruleId);
			let whichMember = rec.memberId;
			$scope.acessList.$remove(rec).then(function(ref) {
				//rule removed from Groups access folder
				$scope.response = { accessMsgOk: "Acceso Revocado" };
				//now removed the same rule from Member access folder
			  AuditSvc.recordAudit(whichGroup, "access-deleted", "groups");
				//notify the member that got the access
				MembersSvc.getMember(whichMember).$loaded().then(function(member){
					NotificationsSvc.notifySpecificUser(member.user.userId,"access-deleted", "groups", whichGroup,null,null);
				});
				MembersSvc.getMemberReference(whichMember).child("access").child(ref.key).set(null, function(error) {
					if(error){
						$scope.response = { accessMsgError: error };
					}else{
						AuditSvc.recordAudit(whichMember, "access-deleted", "members");
					}
				});
			});
		};


	}
]);
