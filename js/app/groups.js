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
									$rootScope.adminGroupsParams = getParamsByLoader(loader);
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
		$scope.response = {loading: true, message: systemMsgs.inProgress.loading};

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

/* Controller linked to /groups/view/:groupId and /groups/edit/:groupId
 * It will load the Group for the id passed */
okulusApp.controller('GroupDetailsCntrl',
['$rootScope','$scope','$routeParams','$location','$firebaseAuth',
 'GroupsSvc','MembersSvc','AuditSvc','AuthenticationSvc',
	function($rootScope, $scope, $routeParams, $location, $firebaseAuth,
		GroupsSvc, MembersSvc, AuditSvc, AuthenticationSvc){

		/* Init. Executed everytime we enter to /gorups/new, /groups/view/:groupId or /groups/edit/:groupId */
		$firebaseAuth().$onAuthStateChanged(function(authUser){ if(authUser){
			$scope.response = {loading: true, message: systemMsgs.inProgress.loadingGroup };
			$scope.objectDetails = {};
			AuthenticationSvc.loadSessionData(authUser.uid).$loaded().then(function (user) {
				/* Only Valid Users (with an associated MemberId) can see the content */
				if(!user.isValid){
					$rootScope.response = {error: true, message: systemMsgs.error.noMemberAssociated};
					$location.path(constants.pages.error);
					return;
				}

				let groupId = $routeParams.groupId;
				/* Prepare for Edit or View Details of Existing Group */
				if(groupId){
					$scope.objectDetails.basicInfo = GroupsSvc.getGroupBasicDataObject(groupId);
					$scope.objectDetails.basicInfo.$loaded().then(function(group){
						//If group from DB hasn't name, is because no group was found
						if(!group.name){
							$rootScope.response = {error: true, message: systemMsgs.error.recordDoesntExist };
							$location.path(constants.pages.error);
							return;
						}
						$scope.objectDetails.address = GroupsSvc.getGroupAddressObject(groupId);
						$scope.objectDetails.audit = GroupsSvc.getGroupAuditObject(groupId);
						$scope.objectDetails.roles = GroupsSvc.getGroupRolesObject(groupId);
						$scope.prepareViewForEdit(group);
					}).catch( function(error){
						$rootScope.response = { error: true, message: error };
						$location.path(constants.pages.error);
					});
				}
				/* Prepare for Group Creation */
				else{
					$scope.prepareViewForNew();
				}
			});
		}});

		$scope.prepareViewForEdit = function (groupObject) {
			$scope.groupEditParams = {};
			$scope.groupEditParams.actionLbl = $rootScope.i18n.groups.modifyLbl;
			$scope.groupEditParams.isEdit = true;
			$scope.groupEditParams.groupId = groupObject.$id;
			$scope.response = undefined;
		};

		$scope.prepareViewForNew = function () {
			$scope.groupEditParams = {};
			$scope.objectDetails.basicInfo = {};
			$scope.groupEditParams.actionLbl = $rootScope.i18n.groups.newLbl;
			$scope.groupEditParams.isEdit = false;
			$scope.groupEditParams.groupId = undefined;
			$scope.response = undefined;
		};

		$scope.saveGroup = function() {
			clearResponse();
			if($rootScope.currentSession.user.type == constants.roles.admin){
				$scope.response = {working:true, message: systemMsgs.inProgress.savingGroupInfo};
				let groupId = $scope.groupEditParams.groupId;

				/*UPDATE Current Group */
				if($scope.objectDetails.basicInfo.$id){
					$scope.objectDetails.basicInfo.address = $scope.objectDetails.address;
					$scope.objectDetails.basicInfo.$save().then(function() {
						AuditSvc.recordAudit(groupId, constants.actions.update, constants.folders.groups);
						$scope.response = {success:true, message: systemMsgs.success.groupInfoSaved};
					});
				}
				/*CREATE A NEW GROUP, and redirect to /groups/edit/ */
				else{
					$scope.objectDetails.basicInfo.isActive = true;
					$scope.objectDetails.basicInfo.address = $scope.objectDetails.address;
					let newgroupRef = GroupsSvc.persistGroup($scope.objectDetails.basicInfo);
					GroupsSvc.getGroupBasicDataObject(newgroupRef.key).$loaded().then(function() {
						AuditSvc.recordAudit(newgroupRef.key, constants.actions.create, constants.folders.groups);
						GroupsSvc.increaseTotalGroupsCount();
						GroupsSvc.increaseActiveGroupsCount();
						$rootScope.groupResponse = {created:true, message:systemMsgs.success.groupCreated };
						$location.path(constants.pages.groupEdit+newgroupRef.key);
					});
				}
			}
		};

		/* A group can be deleted by Admin , if not active, and if there are no reports associated to it.
		 When deleting a Group:
		  1. Delete from /groups/list
		  2. Delete from /groups/details
			3. Decrease the Groups total count
			4. Delete all references to this group from member/access
		*/
		$scope.deleteGroup = function() {
			clearResponse();
			let groupId = $scope.objectDetails.basicInfo.$id;
			let groupInfo = $scope.objectDetails.basicInfo;
			//A group cannot be deleted if isActive
			if(groupInfo.isActive){
				$scope.response = {deleteError:true, message: systemMsgs.error.deletingActiveGroup};
				return;
			}

			if(groupInfo && $rootScope.currentSession.user.type == constants.roles.admin){
				$scope.response = {working:true, message: systemMsgs.inProgress.deletingGroup};
				//Remove Group from groups/list
				let deletedGroupId = undefined;
				GroupsSvc.getGroupReportsList(groupId).$loaded().then(function(reports){
					if(reports.length){
						$scope.response = {deleteError:true, message: systemMsgs.error.groupHasReports};
					}else{
						return groupInfo.$remove();
					}
				})
				//After removing Group Basic Info
				.then(function(deletedGroupRef){
					deletedGroupId = deletedGroupRef.key;
					AuditSvc.recordAudit(deletedGroupId, constants.actions.delete, constants.folders.groups);
					GroupsSvc.decreaseTotalGroupsCount();
					return GroupsSvc.getAccessRulesList(deletedGroupId).$loaded();
				})
				//After loading Group access rules
				.then(function(accessList){
					MembersSvc.removeAccessRules(accessList);
					GroupsSvc.deleteGroupDetails(deletedGroupId);
					$rootScope.groupResponse = {deleted:true, message: systemMsgs.success.groupRemoved};
					$location.path(constants.pages.adminGroups);
				});
			}
		};

		/* Toogle the Group status.*/
		$scope.setGroupStatus = function(setGroupActive){
			clearResponse();
			if($rootScope.currentSession.user.type == constants.roles.admin){
				let groupInfo = $scope.objectDetails.basicInfo;
				groupInfo.isActive = setGroupActive;
				if(setGroupActive){
					GroupsSvc.increaseActiveGroupsCount();
				}else{
					GroupsSvc.decreaseActiveGroupsCount();
				}
				groupInfo.$save();
				AuditSvc.recordAudit(groupInfo.$id, constants.actions.update, constants.folders.groups);
				$scope.response = {success:true, message: systemMsgs.success.groupStatusUpdated};
			}
		};

		clearResponse = function() {
			$rootScope.groupResponse = null;
			$scope.response = null;
		};

		/*Called when change detected on time input*/
		$scope.updateTimeModel = function(){
			$scope.groupEditParams.timeUpdated = true;
			let schdTime = document.getElementById("schdTime").value;
			$scope.objectDetails.basicInfo.time = schdTime;
		};

		$scope.prepareForGroupLeadUpdate = function(){
			$scope.response = {working:true, message: systemMsgs.inProgress.loading};

			if(!$scope.groupEditParams.leadsList){
				$scope.groupEditParams.leadsList = MembersSvc.getLeadMembers();
			}
			$scope.groupEditParams.leadsList.$loaded().then(function(){
				clearResponse();
				$scope.groupEditParams.updatingGroupLead = true;
			});
		};

		/*Persist the Groups's Host Selection */
		$scope.updateGroupLead = function(){
			clearResponse();
			if($rootScope.currentSession.user.type == constants.roles.admin){
				let groupRoles = $scope.objectDetails.roles;
				if(groupRoles.leadId){
					let member = $scope.groupEditParams.leadsList.$getRecord(groupRoles.leadId);
					groupRoles.leadName = member.shortname;
				}else{
					groupRoles.leadId = null;
					groupRoles.leadName = null;
				}
				groupRoles.$save().then(function() {
					AuditSvc.recordAudit($scope.objectDetails.basicInfo.$id, constants.actions.update, constants.folders.groups);
					$scope.groupEditParams.updatingGroupLead = false;
					$scope.response = {success:true, message: systemMsgs.success.groupLeadUpdated};
				});
			}
		};

		$scope.prepareForGroupHostUpdate = function(){
			$scope.response = {working:true, message: systemMsgs.inProgress.loading};

			if(!$scope.groupEditParams.hostsList){
				$scope.groupEditParams.hostsList = MembersSvc.getHostMembers();
			}
			$scope.groupEditParams.hostsList.$loaded().then(function(){
				clearResponse();
				$scope.groupEditParams.updatingGroupHost = true;
			});
		};

		/*Persist the Groups's Host Selection */
		$scope.updateGroupHost = function(){
			clearResponse();
			if($rootScope.currentSession.user.type == constants.roles.admin){
				let groupRoles = $scope.objectDetails.roles;
				if(groupRoles.hostId){
					let member = $scope.groupEditParams.hostsList.$getRecord(groupRoles.hostId);
					groupRoles.hostName = member.shortname;
				}else{
					groupRoles.hostId = null;
					groupRoles.hostName = null;
				}
				groupRoles.$save().then(function() {
					AuditSvc.recordAudit($scope.objectDetails.basicInfo.$id, constants.actions.update, constants.folders.groups);
					$scope.groupEditParams.updatingGroupHost = false;
					$scope.response = {success:true, message: systemMsgs.success.groupHostUpdated};
				});
			}
		};

	}
]);

okulusApp.factory('GroupsSvc',
['$rootScope', '$firebaseArray', '$firebaseObject',
	function($rootScope, $firebaseArray, $firebaseObject){

		let baseRef = firebase.database().ref().child(rootFolder);
		let groupListRef = baseRef.child(constants.folders.groupsList);
		let groupDetailsRef = baseRef.child(constants.folders.groupsDetails);
		let isActiveGroupRef = groupListRef.orderByChild(constants.status.isActive);
		//Deprecated
		let groupsRef = baseRef.child(constants.folders.groups);

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
			getGroupObj: function(groupId){
				return $firebaseObject(groupListRef.child(groupId));
			},
			/* Return all Members, using a limit for the query, if specified*/
			getAllGroups: function(limit) {
					if(limit){
						return $firebaseArray(groupListRef.orderByKey().limitToLast(limit));
					}else{
						return $firebaseArray(groupListRef.orderByKey());
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
			/* Get group basic info from firebase and return as object */
			getGroupBasicDataObject: function(whichGroupId){
				return $firebaseObject(groupListRef.child(whichGroupId));
			},
			/* Get group address from firebase and return as object */
			getGroupAddressObject: function(whichGroupId){
				return $firebaseObject(groupListRef.child(whichGroupId).child(constants.folders.address));
			},
			/* Get group audit from firebase and return as object */
			getGroupAuditObject: function(whichGroupId){
				return $firebaseObject(groupDetailsRef.child(whichGroupId).child(constants.folders.audit));
			},
			/* Get group roles from firebase and return as object */
			getGroupRolesObject: function(whichGroupId){
				return $firebaseObject(groupDetailsRef.child(whichGroupId).child(constants.folders.roles));
			},
			/* Get group roles from firebase and return as object */
			getGroupReportsList: function(whichGroupId){
				return $firebaseArray(groupDetailsRef.child(whichGroupId).child(constants.folders.reports));
			},
			/* Get the list of Access Rules that indicate the members with access to the group */
			getAccessRulesList: function(whichGroupId) {
				return $firebaseArray(groupDetailsRef.child(whichGroupId).child(constants.folders.accessRules));
			},
			/* Push Member Basic Details Object to Firebase*/
			persistGroup: function(groupObj){
				let ref = groupListRef.push();
				ref.set(groupObj);
				return ref;
			},
			/* Remove all Member details (Address, Audit, Access Rules, attendance, etc.)*/
			deleteGroupDetails:function(whichGroupId){
				groupDetailsRef.child(whichGroupId).set({});
			},
			/* Used when creating a Member */
			increaseTotalGroupsCount: function () {
				let conunterRef = baseRef.child(constants.folders.totalGroupsCount);
				increaseCounter(conunterRef);
			},
			/* Used when deleting a Member */
			decreaseTotalGroupsCount: function () {
				let conunterRef = baseRef.child(constants.folders.totalGroupsCount);
				decreaseCounter(conunterRef);
			},
			/* Called after setting the membership status "isActive" to True  */
			increaseActiveGroupsCount: function() {
				let conunterRef = baseRef.child(constants.folders.activeGroupsCount);
				increaseCounter(conunterRef);
			},
			/* Called after setting the membership status "isActive" to False  */
			decreaseActiveGroupsCount: function() {
				let conunterRef = baseRef.child(constants.folders.activeGroupsCount);
				decreaseCounter(conunterRef);
			},
			//Deprecated
			loadAllGroupsList: function(){
				if(!$rootScope.allGroups){
					console.debug("Creating firebaseArray for Groups");
					$rootScope.allGroups = $firebaseArray(groupsRef);
				}
				return $rootScope.allGroups;
			},
			//Deprecated
			addReportReference: function(report){
				//Save the report Id in the Group/reports
				let ref = groupsRef.child(report.reunion.groupId).child("reports").child(report.$id);
				ref.set({
					reportId:report.$id,
					weekId:report.reunion.weekId,
					date:report.reunion.dateObj
				});
			},
			//Deprecated
			removeReportReference: function(reportId,groupId){
				let ref = groupsRef.child(groupId).child("reports").child(reportId);
				ref.set(null);
			},
			//Deprecated
			getAccessRulesForGroup: function (groupId) {
				let reference = groupsRef.child(groupId).child("access");
				return $firebaseArray(reference);
			},
			/* Receives the member's access rules ( { accessRuleId: {groupId,groupName,date} , ...} ),
			and use them to delete the member's access to each of those groups.
			The accessRuleId is the same on groups/:gropuId/access/:accessRuleId
			and members/:memberId/access/:accessRuleId */
			removeAccessRules: function(accessList){
				if(accessList){
					accessList.forEach(function(accessRule) {
						groupDetailsRef.child(accessRule.groupId).child("access").child(accessRule.$id).set(null);
					});
				}
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
