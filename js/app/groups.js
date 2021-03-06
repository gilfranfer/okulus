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
				if(user.type == constants.roles.user){
					$rootScope.response = {error:true, showHomeButton: true, message:systemMsgs.error.noPrivileges};
					$location.path(constants.pages.error);
				}else{
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
									let loader = $rootScope.adminGroupsParams.activeLoader;
									$rootScope.adminGroupsParams = getParamsByLoader(loader);
									$scope.response = undefined;
								}
							});
					});
				}
			});
		}});

		/* Sorting */
		$scope.selectedSortBy="number";
		$scope.reverseSort=false;
		$scope.sortOptions=[{text:$scope.i18n.groups.numberLbl, value:"number",active:"active"},
												{text:$scope.i18n.groups.nameLbl, value:"name",active:""},
												{text:$scope.i18n.groups.typeLbl, value:"type",active:""}];

		$scope.setSortBy = function(option) {
			$scope.sortOptions.forEach(function(option){
				option.active="";
			});
			option.active = "active";
			$scope.selectedSortBy = option.value;
		};

		$scope.setSortOrder = function(reverse) {
			$scope.reverseSort = reverse;
		};

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
				$rootScope.groupResponse = null;
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

					$rootScope.myGroupsList = new Array();
					//Get the Groups the user has access to
					MembersSvc.getAccessRulesList(user.memberId).$loaded().then(function(rules){
						rules.forEach(function(rule) {
							$rootScope.myGroupsList.push( GroupsSvc.getGroupBasicDataObject(rule.groupId) );
						});
					});

				});
			}
		});

		/* Sorting */
		$scope.selectedSortBy="number";
		$scope.reverseSort=false;
		$scope.sortOptions=[{text:$scope.i18n.groups.numberLbl, value:"number",active:"active"},
												{text:$scope.i18n.groups.nameLbl, value:"name",active:""},
												{text:$scope.i18n.groups.typeLbl, value:"type",active:""}];

		$scope.setSortBy = function(option) {
			$scope.sortOptions.forEach(function(option){
				option.active="";
			});
			option.active = "active";
			$scope.selectedSortBy = option.value;
		};

		$scope.setSortOrder = function(reverse) {
			$scope.reverseSort = reverse;
		};

	}
]);

/* Controller linked to /groups/view/:groupId and /groups/edit/:groupId
 * It will load the Group for the id passed */
okulusApp.controller('GroupDetailsCntrl',
['$rootScope','$scope','$routeParams','$location','$firebaseAuth',
 'GroupsSvc','MembersSvc','ConfigSvc','NotificationsSvc','AuditSvc','AuthenticationSvc',
	function($rootScope, $scope, $routeParams, $location, $firebaseAuth,
		GroupsSvc, MembersSvc, ConfigSvc, NotificationsSvc, AuditSvc, AuthenticationSvc){

		/* Init. Executed everytime we enter to /gorups/new, /groups/view/:groupId or /groups/edit/:groupId */
		$firebaseAuth().$onAuthStateChanged(function(authUser){ if(authUser){
			$scope.response = {loading: true, message: systemMsgs.inProgress.loadingGroup };
			$scope.objectDetails = {};
			AuthenticationSvc.loadSessionData(authUser.uid).$loaded().then(function (user) {
				/* Only Root and Valid Users (with an associated MemberId) can see the content */
				if($rootScope.currentSession.user.type != constants.roles.root && !user.memberId){
					$rootScope.response = {error: true, showHomeButton:true, message: systemMsgs.error.noMemberAssociated};
					$location.path(constants.pages.error);
					return;
				}

				$scope.countriesList = ConfigSvc.getCountriesList();
				$scope.grouptypesList = ConfigSvc.getGroupTypesArray();
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

						$scope.statesList = ConfigSvc.getStatesForCountry(group.address.country);
						$scope.objectDetails.audit = GroupsSvc.getGroupAuditObject(groupId);
						$scope.objectDetails.roles = GroupsSvc.getGroupRolesObject(groupId);
						/*Address is already part of objectDetails.basicInfo.address (same date)
						But it is needed in this other object for the reusable address html fragments */
						$scope.objectDetails.address = GroupsSvc.getGroupAddressObject(groupId);
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

		$scope.basicInfoExpanded = true;
		$scope.viewContactInfoExpanded = true;
		$scope.addressInfoExpanded = true;
		$scope.rolesInfoExpanded = true;
		$scope.membersInfoExpanded = false;
		$scope.auditInfoExpanded = false;
		$scope.accessInfoExpanded = false;
		$scope.expandSection = function(section, value) {
			switch (section) {
				case 'basicInfo':
					$scope.basicInfoExpanded = value;
					break;
				case 'viewContactInfo':
					$scope.viewContactInfoExpanded = value;
					break;
				case 'addressInfo':
					$scope.addressInfoExpanded = value;
					break;
				case 'rolesInfo':
					$scope.rolesInfoExpanded = value;
					break;
				case 'membersInfo':
					$scope.membersInfoExpanded = value;
					break;
				case 'accessInfo':
					$scope.accessInfoExpanded = value;
					break;
				case 'auditInfo':
					$scope.auditInfoExpanded = value;
					break;
				default:
			}
		};

		$scope.chageSort = function(sortByProperty) {
			if($scope.sortBy == sortByProperty){
				//When clicking in the same porperty, invert sort order
				$scope.descSort = !$scope.descSort;
			}else{
				//start new sort always in asc order
				$scope.descSort = false;
				$scope.sortBy = sortByProperty;
			}
		};

		$scope.getMembership = function(){
			if(!$scope.groupEditParams.membership){
				$scope.groupEditParams.membership = MembersSvc.getMembersForBaseGroup($scope.objectDetails.basicInfo.$id);
				$scope.groupEditParams.membership.$loaded().then(function(members){
					//Adding a watch on the membership, but only after initial load
					$scope.groupEditParams.membership.$watch( function(data){
						prepareMembershipForCharts($scope.groupEditParams.membership);
					});
				});
			}
			prepareMembershipForCharts($scope.groupEditParams.membership);
		};

		prepareMembershipForCharts = function(membershipList){
			let membershipMetrics = {
				active:0, inactive:0,
				male:0, female:0,
				lead:0, host:0, trainee:0,
				total:0
			};

			/* Traverse the members returned to build some metrics */
			membershipList.$loaded().then(function(members){
				members.forEach(function(member){
					membershipMetrics.total++;
					if(member.isActive){
						membershipMetrics.active++;
					}else{
						membershipMetrics.inactive++;
					}

					if(member.sex=="M"){
						membershipMetrics.male++;
					}else if(member.sex=="F"){
						membershipMetrics.female++;
					}

					if(member.isLeader){
						membershipMetrics.lead++;
					}
					if(member.isHost){
						membershipMetrics.host++;
					}
					if(member.isTrainee){
						membershipMetrics.trainee++;
					}
				});
				$scope.groupEditParams.membershipMetrics = membershipMetrics;
				if(membershipMetrics.total>0){
					buildMembershipCharts(membershipMetrics);
				}
			});
		};

		buildMembershipCharts = function(membershipMetrics){
			let colors = $rootScope.config.charts.colors.members;
			var pieOptions = {
					chart: { type: 'pie', plotBackgroundColor: null, plotBorderWidth: 0, plotShadow: false },
					title: { text: ""},
				  credits: { enabled: false },
					tooltip: {  pointFormat: '<b>{point.y} ({point.percentage:.1f}%)</b>' },
					plotOptions: { pie: { dataLabels: { enabled: false }, showInLegend: true }}
			};

			//Active and Inactive pie
			pieOptions.series = [{ type: 'pie', innerSize: '20%', name: "",
							data: [
								{ name: $rootScope.i18n.charts.activeSerieLbl, y:membershipMetrics.active, color:colors.active},
								{ name: $rootScope.i18n.charts.inactiveSerieLbl, y:membershipMetrics.inactive, color:colors.inactive} ]
					}];
			Highcharts.chart('activePie', pieOptions);

			//Sex pie
			pieOptions.series = [{ type: 'pie', innerSize: '20%', name: "",
							data: [
								{ name:$rootScope.i18n.members.malesLbl, y:membershipMetrics.male, color: colors.male},
								{ name:$rootScope.i18n.members.femalesLbl, y:membershipMetrics.female, color: colors.female} ]
					}];
			Highcharts.chart('sexPie', pieOptions);

			//Roles pie
			// pieOptions.title.text = "Roles";
			pieOptions.series = [{ type: 'pie', innerSize: '20%', name: "",
							data: [
								{name:$rootScope.i18n.members.leadsLbl, y:membershipMetrics.lead, color: colors.lead},
								{name:$rootScope.i18n.members.hostsLbl, y:membershipMetrics.host, color: colors.host},
								{name:$rootScope.i18n.members.traineesLbl, y:membershipMetrics.trainee, color: colors.trainee} ]
					}];
			Highcharts.chart('rolesPie', pieOptions);
		};

		clearResponse = function() {
			$rootScope.groupResponse = null;
			$scope.response = null;
		};

		$scope.updateStatesList = function() {
			$scope.statesList = ConfigSvc.getStatesForCountry($scope.objectDetails.address.country);
		};

		/*Called when change detected on time input*/
		$scope.updateTimeModel = function(){
			$scope.groupEditParams.timeUpdated = true;
			let schdTime = document.getElementById("schdTime").value;
			$scope.objectDetails.basicInfo.time = schdTime;
		};

		$scope.prepareViewForEdit = function (groupObject) {
			$scope.groupEditParams = {};
			$scope.groupEditParams.actionLbl = $rootScope.i18n.groups.modifyLbl;
			$scope.groupEditParams.isEdit = true;
			$scope.groupEditParams.groupId = groupObject.$id;
			$scope.response = undefined;
			if (!groupObject.membersMode){
				groupObject.membersMode="auto";
			}
		};

		$scope.prepareViewForNew = function () {
			$scope.groupEditParams = {};
			$scope.objectDetails.basicInfo = { membersMode:"auto"};
			$scope.groupEditParams.actionLbl = $rootScope.i18n.groups.newLbl;
			$scope.groupEditParams.isEdit = false;
			$scope.groupEditParams.groupId = undefined;
			$scope.response = undefined;

			//Use config.location to set initial address details
			$scope.statesList = ConfigSvc.getStatesForCountry($scope.config.location.country);
			$scope.objectDetails.address = $scope.config.location;
		};

		/* Save a new Group, or update existing one */
		$scope.saveGroup = function() {
			clearResponse();
			if($rootScope.currentSession.user.type != constants.roles.user){
				$scope.response = {working:true, message: systemMsgs.inProgress.savingGroupInfo};
				let groupId = $scope.groupEditParams.groupId;

				/*UPDATE Current Group */
				if($scope.objectDetails.basicInfo.$id){
					$scope.objectDetails.basicInfo.address = $scope.objectDetails.address;
					$scope.objectDetails.basicInfo.$save().then(function() {
						let description = systemMsgs.notifications.groupUpdated + $scope.objectDetails.basicInfo.name;
						AuditSvc.saveAuditAndNotify(constants.actions.update, constants.db.folders.groups, groupId, description);
						$scope.response = {success:true, message: systemMsgs.success.groupInfoSaved};
					});
				}
				/*CREATE A NEW GROUP, and redirect to /groups/edit/ */
				else{
					$scope.objectDetails.basicInfo.isActive = true;
					$scope.objectDetails.basicInfo.address = $scope.objectDetails.address;
					let newgroupRef = GroupsSvc.persistGroup($scope.objectDetails.basicInfo);
					GroupsSvc.getGroupBasicDataObject(newgroupRef.key).$loaded().then(function() {
						let description = systemMsgs.notifications.groupCreated + $scope.objectDetails.basicInfo.name;
						AuditSvc.saveAuditAndNotify(constants.actions.create, constants.db.folders.groups, newgroupRef.key, description );
						GroupsSvc.increaseTotalGroupsCount();
						GroupsSvc.increaseActiveGroupsCount();
						$rootScope.groupResponse = {created:true, message:systemMsgs.success.groupCreated };
						$location.path(constants.pages.groupEdit+newgroupRef.key);
					});
				}
			}
		};

		/* A group can be deleted by Admin , if not active, and if there are no
		reports associated to it. When deleting a Group:
		  1. Delete from /groups/list
		  2. Delete from /groups/details
			3. Decrease the Groups total count
			4. Delete all references to this group from member/access */
		$scope.deleteGroup = function() {
			clearResponse();
			let groupId = $scope.objectDetails.basicInfo.$id;
			let groupInfo = $scope.objectDetails.basicInfo;

			if(!groupInfo || $rootScope.currentSession.user.type == constants.roles.user){
				$scope.response = {deleteError:true, message: systemMsgs.error.noPrivileges};
			}
			if(groupInfo.isActive){
				$scope.response = {deleteError:true, message: systemMsgs.error.deletingActiveGroup};
				return;
			}
			if(groupInfo.reports>0){
				$scope.response = {deleteError:true, message: systemMsgs.error.groupHasReports};
				return;
			}

			let deletedGroupName = groupInfo.name;
			$scope.response = {working:true, message: systemMsgs.inProgress.deletingGroup};
			//Delete from /groups/list
			let deletedGroupId = undefined;
			//Removing Group Basic Info
			groupInfo.$remove().then(function(deletedGroupRef){
				deletedGroupId = deletedGroupRef.key;
				let description = systemMsgs.notifications.groupDeleted + deletedGroupName;
				AuditSvc.saveAuditAndNotify(constants.actions.delete, constants.db.folders.groups, deletedGroupId, description);
				GroupsSvc.decreaseTotalGroupsCount();
				//No need to decrease ActiveGroups counter because at this point it was already inactive
				return GroupsSvc.getAccessRulesList(deletedGroupId).$loaded();
			}).then(function(accessList){
				/* After loading Group access rules: Delete all references to this group from member/access */
				MembersSvc.removeAccessRules(accessList);
				GroupsSvc.deleteGroupDetails(deletedGroupId);
				$rootScope.groupResponse = {deleted:true, message: systemMsgs.success.groupRemoved};
				$location.path(constants.pages.adminGroups);
			});
		};

		/* Toogle the Group status.*/
		$scope.setGroupStatus = function(setGroupActive){
			clearResponse();
			if($rootScope.currentSession.user.type != constants.roles.user){
				let groupInfo = $scope.objectDetails.basicInfo;
				groupInfo.isActive = setGroupActive;
				let notificationDesc = undefined;
				if(setGroupActive){
					notificationDesc = systemMsgs.notifications.groupSetActive + groupInfo.name;
					GroupsSvc.increaseActiveGroupsCount();
				}else{
					notificationDesc = systemMsgs.notifications.groupSetInactive + groupInfo.name;
					GroupsSvc.decreaseActiveGroupsCount();
				}
				groupInfo.$save();
				AuditSvc.saveAuditAndNotify(constants.actions.update, constants.db.folders.groups, groupInfo.$id, notificationDesc );
				$scope.response = {groupStatusUpdate: true, message: systemMsgs.success.groupStatusUpdated};
			}
		};

		/* Role Update related functions */
		$scope.prepareForGroupLeadUpdate = function(){
			$scope.response = {loadingRole:true, message: systemMsgs.inProgress.loading};

			if(!$scope.groupEditParams.leadsList){
				$scope.groupEditParams.leadsList = MembersSvc.getLeadMembers();
			}
			$scope.groupEditParams.leadsList.$loaded().then(function(){
				clearResponse();
				$scope.groupEditParams.updatingGroupLead = true;
				$scope.groupEditParams.currentLeadId= $scope.objectDetails.roles.leadId;
			});
		};
		$scope.updateGroupLead = function(){
			clearResponse();
			if($rootScope.currentSession.user.type != constants.roles.user){
				let newLeadRole = $scope.objectDetails.roles;
				if($scope.groupEditParams.currentLeadId == newLeadRole.leadId){
					$scope.groupEditParams.updatingGroupLead = false;
					return;
				}

				$scope.response = { updatingRole: true, message: systemMsgs.inProgress.updating };
				if(newLeadRole.leadId){
					let member = $scope.groupEditParams.leadsList.$getRecord(newLeadRole.leadId);
					newLeadRole.leadName = member.shortname;
				}else{
					newLeadRole.leadId = null;
					newLeadRole.leadName = null;
				}
				newLeadRole.$save().then(function() {
					let description = systemMsgs.notifications.groupLeadUpdated + " " + $scope.objectDetails.basicInfo.name;
					AuditSvc.saveAuditAndNotify(constants.actions.update, constants.db.folders.groups, $scope.objectDetails.basicInfo.$id, description );
					$scope.groupEditParams.updatingGroupLead = false;
					$scope.response = {roleUpdated:true, message: systemMsgs.success.groupLeadUpdated};
				});
			}
		};

		$scope.prepareForGroupHostUpdate = function(){
			$scope.response = {loadingRole:true, message: systemMsgs.inProgress.loading};

			if(!$scope.groupEditParams.hostsList){
				$scope.groupEditParams.hostsList = MembersSvc.getHostMembers();
			}
			$scope.groupEditParams.hostsList.$loaded().then(function(){
				clearResponse();
				$scope.groupEditParams.updatingGroupHost = true;
				$scope.groupEditParams.currentHostId= $scope.objectDetails.roles.hostId;
			});
		};
		$scope.updateGroupHost = function(){
			clearResponse();
			if($rootScope.currentSession.user.type != constants.roles.user){
				let groupRoles = $scope.objectDetails.roles;
				if($scope.groupEditParams.currentHostId == groupRoles.hostId){
					$scope.groupEditParams.updatingGroupHost = false;
					return;
				}
				
				$scope.response = { updatingRole: true, message: systemMsgs.inProgress.updating };
				if(groupRoles.hostId){
					let member = $scope.groupEditParams.hostsList.$getRecord(groupRoles.hostId);
					groupRoles.hostName = member.shortname;
				}else{
					groupRoles.hostId = null;
					groupRoles.hostName = null;
				}
				groupRoles.$save().then(function() {
					let description = systemMsgs.notifications.groupHostUpdated + " " + $scope.objectDetails.basicInfo.name;
					AuditSvc.saveAuditAndNotify(constants.actions.update, constants.db.folders.groups, $scope.objectDetails.basicInfo.$id, description);
					$scope.groupEditParams.updatingGroupHost = false;
					$scope.response = { roleUpdated:true, message: systemMsgs.success.groupHostUpdated};
				});
			}
		};

		$scope.prepareForGroupTraineeUpdate = function(){
			$scope.response = {loadingRole:true, message: systemMsgs.inProgress.loading};

			if(!$scope.groupEditParams.traineesList){
				$scope.groupEditParams.traineesList = MembersSvc.getTraineeMembers();
			}
			$scope.groupEditParams.traineesList.$loaded().then(function(){
				clearResponse();
				$scope.groupEditParams.updatingGroupTrainee = true;
				$scope.groupEditParams.currentTraineeId= $scope.objectDetails.roles.traineeId;
			});
		};
		$scope.updateGroupTrainee = function(){
			clearResponse();
			if($rootScope.currentSession.user.type != constants.roles.user){
				let groupRoles = $scope.objectDetails.roles;
				if($scope.groupEditParams.currentTraineeId == groupRoles.traineeId){
					$scope.groupEditParams.updatingGroupTrainee = false;
					return;
				}
				
				$scope.response = { updatingRole: true, message: systemMsgs.inProgress.updating};
				if(groupRoles.traineeId){
					let member = $scope.groupEditParams.traineesList.$getRecord(groupRoles.traineeId);
					groupRoles.traineeName = member.shortname;
				}else{
					groupRoles.traineeId = null;
					groupRoles.traineeName = null;
				}
				groupRoles.$save().then(function() {
					let description = systemMsgs.notifications.groupTraineeUpdated + " " + $scope.objectDetails.basicInfo.name;
					AuditSvc.saveAuditAndNotify(constants.actions.update, constants.db.folders.groups, $scope.objectDetails.basicInfo.$id, description);
					$scope.groupEditParams.updatingGroupTrainee = false;
					$scope.response = { roleUpdated:true, message: systemMsgs.success.groupTraineeUpdated};
				});
			}
		};

		/* Access Rules */
		$scope.getGroupRules = function(group){
			console.log("Getting Rules");
			let whichGroup = $routeParams.groupId;
			$scope.group = GroupsSvc.getGroupBasicDataObject(whichGroup);
			$scope.objectDetails.basicInfo.$loaded().then(function(group){
				//Retrieve List of Members that have a User associated
				$scope.membersList = MembersSvc.getMembersWithUser();
				//Retrieve List of Users already having access (Some could be invalid Users)
				$scope.acessRulesList = GroupsSvc.getAccessRulesList(whichGroup);
				$scope.newRule = {};
				$scope.rulesResponse = null;
			});
		};

		/* Rules are assigned to Members (/members/details/{memberId}/access)
		 and to groups (/groups/details/{groupId}/access)*/
		$scope.addRule = function(){
			$scope.rulesResponse = {working: true, message: systemMsgs.inProgress.creatingRule };
			let memberObj = $scope.membersList.$getRecord($scope.newRule.memberId);
			let whichMember = memberObj.$id;

			let existingRuleId = $scope.getExistingRuleId(whichMember);
			if(existingRuleId){
				$scope.rulesResponse = {error: true, message: systemMsgs.error.duplicatedRule};
				//Ensure the access rule (in the Group Folder) has the updated Member shortname and email
				let index = $scope.acessRulesList.$indexFor(existingRuleId);
				let ruleObj = $scope.acessRulesList.$getRecord(existingRuleId);
				ruleObj.memberName = memberObj.shortname;
				ruleObj.memberEmail = memberObj.email;
				ruleObj.userId = memberObj.userId;
				$scope.acessRulesList.$save(index);
				return;
			}

			let creationDate = firebase.database.ServerValue.TIMESTAMP;
			let ruleForGroup = { memberName: memberObj.shortname, memberId: memberObj.$id, memberEmail: memberObj.email,
														userId:memberObj.userId, date:creationDate};
			let ruleForMember = { groupName: $scope.group.name, groupId: $scope.group.$id, date:creationDate};

			//Use the Group's access list to create the new rule
			$scope.acessRulesList.$add(ruleForGroup).then(function(ref) {
				//Create cross Reference. The Member must have similar rule, with same rule Id.
				MembersSvc.addAccessRuleToMember(whichMember, ref.key, ruleForMember);
				let description = memberObj.shortname + " " + systemMsgs.notifications.gotAccessToGroup + $scope.group.name;
				let notification = { description: description,
					action: constants.actions.update,
					onFolder: constants.db.folders.groups,
					onObject: $scope.group.$id,	url:null };
				//Notify the Group's Creator, Updator, and ADmins about the rule creation
				NotificationsSvc.notifyInvolvedParties(notification.action, notification.onFolder, notification.onObject, notification.description);
				//Notify the User who got the access about the rule creation
				NotificationsSvc.notifyUser(memberObj.userId, notification);
				$scope.rulesResponse = { success: true, message: systemMsgs.success.ruleCreated};
			}).catch( function(error){
				$scope.rulesResponse = { error: true, message: systemMsgs.error.creatingRuleError };
				console.error(error);
			});
		};

		$scope.getExistingRuleId = function(whichMember) {
			let ruleId = undefined;
			//Review in the current Lists, if a similar rule already exist
			$scope.acessRulesList.forEach(function(rule) {
				if(rule.memberId == whichMember){
					ruleId = rule.$id;
				};
			});
			return ruleId;
		};

		$scope.deleteRule = function(ruleId, memberName, memberId, userId){
			$scope.rulesResponse = {working: true, message: systemMsgs.inProgress.deletingRule};
			var ruleRecord = $scope.acessRulesList.$getRecord(ruleId);
			let whichGroup = $scope.objectDetails.basicInfo.$id;
			let groupName = $scope.objectDetails.basicInfo.name;

			$scope.acessRulesList.$remove(ruleRecord).then(function() {
				//Remove the same rule from the Member's access folder
				MembersSvc.addAccessRuleToMember(memberId, ruleId, null);
				let description = memberName + " " + systemMsgs.notifications.lostAccessToGroup + groupName;
				let notification = { description: description, action: constants.actions.update,
									onFolder: constants.db.folders.groups, onObject: whichGroup,	url:null };
				//Notify the Group's Creator, Updator, and Admins about the rule removal
				NotificationsSvc.notifyInvolvedParties(notification.action, notification.onFolder, notification.onObject, notification.description);
				//Notify the User who lost the access
				NotificationsSvc.notifyUser(userId, notification);
				$scope.rulesResponse = { success: true, message: systemMsgs.success.ruleRemoved};
			}).catch( function(error){
				$scope.rulesResponse = { error: true, message: systemMsgs.error.deletingRuleError };
				console.error(error);
			});
		};

}]);

okulusApp.factory('GroupsSvc',
['$rootScope', '$firebaseArray', '$firebaseObject',
	function($rootScope, $firebaseArray, $firebaseObject){

		let baseRef = firebase.database().ref().child(constants.db.folders.root);
		let groupListRef = baseRef.child(constants.db.folders.groupsList);
		let groupDetailsRef = baseRef.child(constants.db.folders.groupsDetails);
		let isActiveGroupRef = groupListRef.orderByChild(constants.status.isActive);
		//Deprecated
		let groupsRef = baseRef.child(constants.db.folders.groups);

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
				return $firebaseObject(baseRef.child(constants.db.folders.groupsCounters));
			},
			/* Return all Groups, using a limit for the query, if specified*/
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
				return $firebaseObject(groupListRef.child(whichGroupId).child(constants.db.folders.address));
			},
			/* Get group audit from firebase and return as object */
			getGroupAuditObject: function(whichGroupId){
				return $firebaseObject(groupDetailsRef.child(whichGroupId).child(constants.db.folders.audit));
			},
			/* Get group roles from firebase and return as object */
			getGroupRolesObject: function(whichGroupId){
				return $firebaseObject(groupDetailsRef.child(whichGroupId).child(constants.db.folders.roles));
			},
			/* Get the list of Access Rules that indicate the members with access to the group */
			getAccessRulesList: function(whichGroupId) {
				return $firebaseArray(groupDetailsRef.child(whichGroupId).child(constants.db.folders.accessRules));
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
				let conunterRef = baseRef.child(constants.db.folders.totalGroupsCount);
				increaseCounter(conunterRef);
			},
			/* Used when deleting a Member */
			decreaseTotalGroupsCount: function () {
				let conunterRef = baseRef.child(constants.db.folders.totalGroupsCount);
				decreaseCounter(conunterRef);
			},
			/* Called after setting the membership status "isActive" to True  */
			increaseActiveGroupsCount: function() {
				let conunterRef = baseRef.child(constants.db.folders.activeGroupsCount);
				increaseCounter(conunterRef);
			},
			/* Called after setting the membership status "isActive" to False  */
			decreaseActiveGroupsCount: function() {
				let conunterRef = baseRef.child(constants.db.folders.activeGroupsCount);
				decreaseCounter(conunterRef);
			},
			/* Called after Report Creation */
			increaseReportsCount: function(groupId){
				let conunterRef = groupListRef.child(groupId).child(constants.db.folders.reports);
				increaseCounter(conunterRef);
			},
			/* Called when deleting Report  */
			decreaseReportsCount: function(groupId){
				let conunterRef = groupListRef.child(groupId).child(constants.db.folders.reports);
				decreaseCounter(conunterRef);
			},
			//Deprecated
			removeReportReference: function(reportId,groupId){
				let ref = groupsRef.child(groupId).child("reports").child(reportId);
				ref.set(null);
			},
			/*Save Access Rule in member folder (/members/details/:whichMember/access/:ruleId)*/
			addAccessRule: function(groupId, ruleId, ruleRecord){
				groupDetailsRef.child(groupId).child(constants.db.folders.accessRules).child(ruleId).set(ruleRecord);
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
		};//return end
	}
]);
