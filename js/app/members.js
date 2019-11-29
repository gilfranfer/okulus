//Mapping: /members
okulusApp.controller('MembersListCntrl',
	['$rootScope','$scope','$firebaseAuth','$location','MembersSvc','AuthenticationSvc',
	function($rootScope,$scope,$firebaseAuth,$location,MembersSvc,AuthenticationSvc){

		let unwatch = undefined;
		/*Executed everytime we enter to /members
		  This function is used to confirm the user is Admin */
		$scope.response = {loading: true, message: systemMsgs.inProgress.loading };
		$firebaseAuth().$onAuthStateChanged(function(authUser){ if(authUser){
			AuthenticationSvc.loadSessionData(authUser.uid).$loaded().then( function(user){
				if(user.type == constants.roles.user){
					$rootScope.response = {error:true, showHomeButton: true, message:systemMsgs.error.noPrivileges};
					$location.path(constants.pages.error);
				}else{
					$rootScope.membersGlobalCount = MembersSvc.getGlobalMembersCounter();
					$rootScope.membersGlobalCount.$loaded().then(
						function(membersCount) {
							$scope.response = undefined;
							/* Adding a Watch to the membersGlobalCount to detect changes.
							The idea is to update the maxPossible value from adminMembersParams.*/
							if(unwatch){ unwatch(); }
							unwatch = $rootScope.membersGlobalCount.$watch( function(data){
								if($rootScope.adminMembersParams){
									let loader = $rootScope.adminMembersParams.activeMembersLoader;
									$rootScope.adminMembersParams = getParamsByLoader(loader);
									$scope.response = undefined;
								}
							});
					});
				}
			});
		}});

		/* Sorting */
		$scope.selectedSortBy="firstname";
		$scope.reverseSort=false;
		$scope.sortOptions=[{text:$scope.i18n.members.fnameLbl, value:"firstname",active:"active"},
												{text:$scope.i18n.members.lnameLbl, value:"lastname",active:""},
												{text:$scope.i18n.members.aliasLbl, value:"shortname",active:""}];

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
		 They will create a adminMembersParams object containing the name of the loader
		 used, and determining the max possible records to display. */
		$scope.loadAllMembersList = function () {
 			$scope.response = {loading:true, message:systemMsgs.inProgress.loadingAllMembers};
 			$rootScope.adminMembersParams = getParamsByLoader("AllMembersLoader");
 			$rootScope.adminMembersList = MembersSvc.getAllMembers();
 			whenMembersRetrieved();
		};

		$scope.loadActiveMembersList = function () {
 			$scope.response = {loading:true, message:systemMsgs.inProgress.loadingActiveMembers};
 			$rootScope.adminMembersParams = getParamsByLoader("ActiveMembersLoader");
 			$rootScope.adminMembersList = MembersSvc.getActiveMembers($rootScope.config.maxQueryListResults);
 			whenMembersRetrieved();
		};

		$scope.loadInactiveMembersList = function () {
 			$scope.response = {loading:true, message:systemMsgs.inProgress.loadingInactiveMembers};
 			$rootScope.adminMembersParams = getParamsByLoader("InactiveMembersLoader");
 			$rootScope.adminMembersList = MembersSvc.getInactiveMembers($rootScope.config.maxQueryListResults);
 			whenMembersRetrieved();
		};

		$scope.loadLeadMembersList = function () {
 			$scope.response = {loading:true, message:systemMsgs.inProgress.loadingLeadMembers};
 			$rootScope.adminMembersParams = getParamsByLoader("LeadMembersLoader");
 			$rootScope.adminMembersList = MembersSvc.getLeadMembers($rootScope.config.maxQueryListResults);
 			whenMembersRetrieved();
		};

		$scope.loadHostMembersList = function () {
 			$scope.response = {loading:true, message:systemMsgs.inProgress.loadingHostMembers};
 			$rootScope.adminMembersParams = getParamsByLoader("HostMembersLoader");
 			$rootScope.adminMembersList = MembersSvc.getHostMembers($rootScope.config.maxQueryListResults);
 			whenMembersRetrieved();
		};

		$scope.loadTraineeMembersList = function () {
 			$scope.response = {loading:true, message:systemMsgs.inProgress.loadingTraineeMembers};
 			$rootScope.adminMembersParams = getParamsByLoader("TraineeMembersLoader");
 			$rootScope.adminMembersList = MembersSvc.getTraineeMembers($rootScope.config.maxQueryListResults);
 			whenMembersRetrieved();
		};

		/* Load ALL pending members. Use the adminMembersParams.activeMembersLoader
		to determine what type of members should be loaded, and how. */
		$scope.loadPendingMembers = function () {
			let loaderName = $rootScope.adminMembersParams.activeMembersLoader;
			$scope.response = {loading: true, message: systemMsgs.inProgress.loading };
			if(loaderName=="AllMembersLoader"){
				$rootScope.adminMembersList = MembersSvc.getAllMembers();
			} else if(loaderName=="ActiveMembersLoader"){
				$rootScope.adminMembersList = MembersSvc.getActiveMembers();
			} else if(loaderName=="InactiveMembersLoader"){
				$rootScope.adminMembersList = MembersSvc.getInactiveMembers();
			} else if(loaderName=="LeadMembersLoader"){
				$rootScope.adminMembersList = MembersSvc.getLeadMembers();
			} else if(loaderName=="TraineeMembersLoader"){
				$rootScope.adminMembersList = MembersSvc.getTraineeMembers();
			} else if(loaderName=="HostMembersLoader"){
				$rootScope.adminMembersList = MembersSvc.getHostMembers();
			}
			whenMembersRetrieved();
		};

		/*Build object with Params used in the view.
		 activeMembersLoader: Will help to identify what type of members we want to load.
		 searchFilter: Container for the view filter
		 title: Title of the Members List will change according to the loader in use
		 maxPossible: Used to inform the user how many elements are pending to load */
		getParamsByLoader = function (loaderName) {
			let params = {activeMembersLoader:loaderName, searchFilter:undefined};
			if(loaderName == "AllMembersLoader"){
				params.title= systemMsgs.success.allMembersTitle;
				params.maxPossible = $rootScope.membersGlobalCount.total;
			}
			else if(loaderName == "ActiveMembersLoader"){
				params.title= systemMsgs.success.activeMembersTitle;
				params.maxPossible = $rootScope.membersGlobalCount.active;
			}
			else if(loaderName == "InactiveMembersLoader"){
				params.title= systemMsgs.success.inactiveMembersTitle;
				params.maxPossible = $rootScope.membersGlobalCount.total - $rootScope.membersGlobalCount.active;
			}
			else if(loaderName == "LeadMembersLoader"){
				params.title= systemMsgs.success.leadMembersTitle;
				params.maxPossible = $rootScope.membersGlobalCount.leads;
			}
			else if(loaderName == "TraineeMembersLoader"){
				params.title= systemMsgs.success.traineeMembersTitle;
				params.maxPossible = $rootScope.membersGlobalCount.trainees;
			}
			else if(loaderName == "HostMembersLoader"){
				params.title= systemMsgs.success.hostMembersTitle;
				params.maxPossible = $rootScope.membersGlobalCount.hosts;
			}
			return params;
		};

		/*Prepares the response after the members list is loaded */
		whenMembersRetrieved = function () {
			$rootScope.adminMembersList.$loaded().then(function(members) {
				$scope.response = undefined;
				$rootScope.memberResponse = null;
				if(!members.length){
					$scope.response = { error: true, message: systemMsgs.error.noMembersError };
				}
			}).catch( function(error){
				$scope.response = { error: true, message: systemMsgs.error.loadingMembersError };
				console.error(error);
			});
		};

}]);

/* Controller linked to /members/view/:memberId and /members/edit/:memberId
 * It will load the Member for the id passed */
okulusApp.controller('MemberDetailsCntrl',
	['$rootScope', '$scope','$routeParams', '$location','$firebaseAuth',
		'MembersSvc','MemberRequestsSvc','ReportsSvc','UsersSvc','GroupsSvc','ConfigSvc','AuditSvc','NotificationsSvc','AuthenticationSvc',
	function($rootScope, $scope, $routeParams, $location,$firebaseAuth,
		MembersSvc, MemberRequestsSvc, ReportsSvc, UsersSvc, GroupsSvc, ConfigSvc, AuditSvc, NotificationsSvc, AuthenticationSvc){

		/* Init. Executed everytime we enter to /members/new,
		/members/view/:memberId or /members/edit/:memberId */
		$firebaseAuth().$onAuthStateChanged(function(authUser){ if(authUser){
			$scope.response = {loading: true, message: systemMsgs.inProgress.loadingMember };
			$scope.objectDetails = {};
			AuthenticationSvc.loadSessionData(authUser.uid).$loaded().then(function (user) {
				/* Only Valid Users (with an associated MemberId) can see the content */
				if($rootScope.currentSession.user.type != constants.roles.root && !user.memberId){
					$rootScope.response = {error: true, showHomeButton:true, message: systemMsgs.error.noMemberAssociated};
					$location.path(constants.pages.error);
					return;
				}

				let memberId = $routeParams.memberId;
				$scope.countriesList = ConfigSvc.getCountriesList();
				/* Prepare for Edit or View Details of Existing Member */
				if(memberId){
					// console.log(memberId);
					$scope.objectDetails.basicInfo = MembersSvc.getMemberBasicDataObject(memberId);
					$scope.objectDetails.basicInfo.$loaded().then(function(member){
						//If member from DB hasn't shortname, is because no member was found
						if(!member.shortname){
							$rootScope.response = {error: true, message: systemMsgs.error.recordDoesntExist };
							$location.path(constants.pages.error);
							return;
						}

						$scope.objectDetails.audit = MembersSvc.getMemberAuditObject(memberId);
						$scope.objectDetails.address = MembersSvc.getMemberAddressObject(memberId);
						$scope.objectDetails.address.$loaded().then(function(address){
							if(address.$value===null){
								/* Set Default location from config.location, if no address exisiting */
								$scope.statesList = ConfigSvc.getStatesForCountry($rootScope.config.location.country);
								$scope.objectDetails.address = { city:$rootScope.config.location.city, state: $rootScope.config.location.state, country: $rootScope.config.location.country};
								$scope.objectDetails.address.isNew = true;
							}else{
								$scope.statesList = ConfigSvc.getStatesForCountry(address.country);
							}
						});
						$scope.objectDetails.attendance = MembersSvc.getMemberAttendance(memberId);
						// $scope.objectDetails.groups = MembersSvc.getMemberGroups(memberId);
						$scope.prepareViewForEdit(member);
					}).catch( function(error){
						$rootScope.response = { error: true, message: error };
						$location.path(constants.pages.error);
					});
				}
				/* Prepare for new Member */
				else{
					$scope.prepareViewForNew();
				}
			});
		}});

		$scope.basicInfoExpanded = true;
		$scope.addressInfoExpanded = true;
		$scope.membershipInfoExpanded = true;
		$scope.userInfoExpanded = false;
		$scope.accessInfoExpanded = false;
		$scope.reunionInfoExpanded = false;
		$scope.auditInfoExpanded = false;
		$scope.expandSection = function(section, value) {
			switch (section) {
				case 'basicInfo':
					$scope.basicInfoExpanded = value;
					break;
				case 'addressInfo':
					$scope.addressInfoExpanded = value;
					break;
				case 'accessInfo':
					$scope.accessInfoExpanded = value;
					break;
				case 'userInfo':
					$scope.userInfoExpanded = value;
					break;
				case 'membershipInfo':
					$scope.membershipInfoExpanded = value;
					break;
				case 'reunionInfo':
					$scope.reunionInfoExpanded = value;
					break;
				case 'auditInfo':
					$scope.auditInfoExpanded = value;
					break;
				default:
			}
		};

		$scope.getUserInfo = function() {
			let userID = $scope.objectDetails.basicInfo.userId;
			if(!userID) return;
			$scope.objectDetails.userInfo = UsersSvc.getUserBasicDataObject(userID);
		};

		$scope.getReunionDetails = function() {
			let reportObjsPromises = [];
			$scope.objectDetails.attendance.$loaded().then(function(attnList) {
				/* Load each report from the member´s attendance list */
				attnList.forEach(function(attn){
					reportObjsPromises.push( ReportsSvc.getReportBasicObj(attn.reportId).$loaded() );
				});
				let colors = $rootScope.config.charts.colors.members;

				/* Wait for all reports to be loaded */
				Promise.all(reportObjsPromises).then(function(reports){
					$scope.$apply(function(){
						$scope.memberEditParams.reportsList = reports;

						let series = [];
						let dataMap = new Map();
						reports.forEach(function(report){
							let mapElement = undefined;
							if(!dataMap.has(report.groupname)){
								dataMap.set(report.groupname, { group:"", reunions:0 } );
							}
							mapElement = dataMap.get(report.groupname);
							mapElement.group = report.groupname;
							mapElement.reunions ++;
						});

						dataMap.forEach(function(data){
							series.push({name: data.group, data:[data.reunions]});
						});

						var pie = { chart: { type: 'bar' }, title: { text: '' }, credits: { enabled: false },
    						xAxis: { categories: [''] },
    						yAxis: { min: 0, title: {  text: $rootScope.i18n.members.attendedGroups } },
								tooltip: {  pointFormat: '<b>{point.y}</b> - ({point.percentage:.1f}%)' },
    						legend: { reversed: true },
    						plotOptions: { series: { stacking: 'normal'} },
						    colors:[colors.lead, colors.host, colors.trainee, colors.member, colors.guest],
								series: series
						};
						Highcharts.chart('groupDistributionContainer', pie);

						// console.log(reports);
					});
				});
			});
		};

		$scope.updateStatesList = function() {
			$scope.statesList = ConfigSvc.getStatesForCountry($scope.objectDetails.address.country);
		};

		$scope.prepareViewForEdit = function (memberObject) {
			$scope.memberEditParams = {};
			$scope.memberEditParams.actionLbl = $rootScope.i18n.members.modifyLbl;
			$scope.memberEditParams.isEdit = true;
			$scope.memberEditParams.memberId = memberObject.$id;
			$scope.response = undefined;
		};

		$scope.prepareViewForNew = function () {
			$scope.objectDetails.basicInfo = {};
			$scope.memberEditParams = {};
			$scope.memberEditParams.actionLbl = $rootScope.i18n.members.newLbl;
			$scope.memberEditParams.isEdit = false;
			$scope.memberEditParams.memberId = undefined;
			$scope.response = undefined;
		};

		/*Create address Object in scope so we can populate it's values from view*/
		$scope.addAdress = function(){
			clearResponse();
			$scope.objectDetails.address = { city:$rootScope.config.location.city, state: $rootScope.config.location.state, country: $rootScope.config.location.country};
			$scope.objectDetails.address.isNew = true;
		};

		/*Remove the address Object from scope, and from DB*/
		$scope.removeAdress = function(){
			clearResponse();
			if($rootScope.currentSession.user.type != constants.roles.user){
				if(!$scope.objectDetails.address.isNew ){
					$scope.response = {working:true, message: systemMsgs.inProgress.deletingMemberAddress};
					let memberId = $scope.memberEditParams.memberId;
					$scope.objectDetails.address.$remove().then(function(ref) {
						let description = systemMsgs.notifications.memberAddressRemoved + $scope.objectDetails.basicInfo.shortname;
						AuditSvc.saveAuditAndNotify(constants.actions.update, constants.db.folders.members, memberId, description);
						$scope.response = {success:true, message: systemMsgs.success.memberAddressRemoved};
					}, function(error) {
					  console.debug("Error:", error);
					});
				}
				$scope.objectDetails.address = null;
			}
		};

		/*Save functions available only for Admin User*/
		$scope.saveBasicInfoAndAddress = function(){
			$scope.saveBasicInfo();
			$scope.saveAddress();
		};

		/*Save the changes to the Member´s Address */
		$scope.saveAddress = function(){
			clearResponse();
			if($rootScope.currentSession.user.type != constants.roles.user){
				$scope.response = {working:true, message: systemMsgs.inProgress.savingMemberAddress};
				let memberId = $scope.memberEditParams.memberId;
				$scope.objectDetails.address.isNew = null;

				//Update using the existing address firebaseObject
				if($scope.objectDetails.address.$id){
					let description = systemMsgs.notifications.memberAddressUpdated + $scope.objectDetails.basicInfo.shortname;
					$scope.objectDetails.address.$save().then(function(){
						AuditSvc.saveAuditAndNotify(constants.actions.update, constants.db.folders.members, memberId, description);
						$scope.response = {success:true, message: systemMsgs.success.memberInfoSAved};
					});
				}
				//Save address for the first time, and keep the address firebaseObject in scope
				else{
					let description = systemMsgs.notifications.memberAddressAdded + $scope.objectDetails.basicInfo.shortname;
					MembersSvc.persistMemberAddress(memberId,$scope.objectDetails.address);
					$scope.objectDetails.address = MembersSvc.getMemberAddressObject(memberId);
					$scope.objectDetails.address.$loaded().then(function() {
						AuditSvc.saveAuditAndNotify(constants.actions.update, constants.db.folders.members, memberId, description);
						$scope.response = {success:true, message: systemMsgs.success.memberInfoSAved};
					});
				}
			}
		};

		$scope.saveBasicInfo = function(){
			clearResponse();
			if($rootScope.currentSession.user.type != constants.roles.user){
				$scope.response = {working:true, message: systemMsgs.inProgress.savingMemberInfo};
				let memberId = $scope.memberEditParams.memberId;

				/*UPDATE Current Member*/
				if($scope.objectDetails.basicInfo.$id){
					$scope.objectDetails.basicInfo.$save().then(function() {
						let description = systemMsgs.notifications.memberUpdated + $scope.objectDetails.basicInfo.shortname;
						AuditSvc.saveAuditAndNotify(constants.actions.update, constants.db.folders.members, memberId, description);

						/* After any update in a member with allowUser flag, update the email in allowedEmails folder */
						if($scope.objectDetails.basicInfo.allowUser){
							if(!$scope.objectDetails.basicInfo.email){
								AuthenticationSvc.updateEmailInAllowedList(memberId, null);
							}else{
								AuthenticationSvc.updateEmailInAllowedList(memberId, $scope.objectDetails.basicInfo.email);
							}
						}
						$scope.response = {success:true, message: systemMsgs.success.memberInfoSAved};
					});
				}
				/*CREATE A NEW MEMBER, and redirect to /members/edit/ */
				else{
					$scope.objectDetails.basicInfo.isActive = true;
					let newmemberRef = MembersSvc.persistMember($scope.objectDetails.basicInfo);
					MembersSvc.getMemberBasicDataObject(newmemberRef.key).$loaded().then(function() {
						let description = systemMsgs.notifications.memberCreated + $scope.objectDetails.basicInfo.shortname;
						AuditSvc.saveAuditAndNotify(constants.actions.create, constants.db.folders.members, newmemberRef.key, description);
						MembersSvc.increaseTotalMembersCount();
						MembersSvc.increaseActiveMembersCount();
						$rootScope.memberResponse = { created:true, message: systemMsgs.success.memberCreated };
						$location.path(constants.pages.memberEdit+newmemberRef.key);
					});
				}
			}
		};

		/* A member can be deleted by Admin, if not active, but his attendance records
		 to reunions will remain on Reports. When deleting a Member:
			1. Delete from /members/list
			2. Delete from /members/details
			3. Decrease the Members total count
			2. Delete all references to this member from groups/access */
	  $scope.deleteMember = function() {
			clearResponse();
			let memberInfo = $scope.objectDetails.basicInfo;
			//A member cannot be deleted if isActive
			if(memberInfo.isActive){
				$scope.response = {deleteError:true, message: systemMsgs.error.deletingActiveMember};
				return;
			}

			if(memberInfo && $rootScope.currentSession.user.type != constants.roles.user){
				$scope.response = {working:true, message: systemMsgs.inProgress.deletingMember};
				//Remove Member from members/list
				let memberName = memberInfo.shortname;
				let deletedMemberId = undefined;
				memberInfo.$remove().then(function(deletedMemberRef){
					deletedMemberId = deletedMemberRef.key;
					let description = systemMsgs.notifications.memberDeleted + memberName;
					AuthenticationSvc.updateEmailInAllowedList(deletedMemberId, null);
					AuditSvc.saveAuditAndNotify(constants.actions.delete, constants.db.folders.members, deletedMemberId, description);
					MembersSvc.decreaseTotalMembersCount();
					return MembersSvc.getAccessRulesList(deletedMemberId).$loaded();
				}).then(function(accessList){
					GroupsSvc.removeAccessRules(accessList);
					MembersSvc.deleteMemberDetails(deletedMemberId);
					$rootScope.memberResponse = {deleted:true, message: systemMsgs.success.memberRemoved};
					$location.path(constants.pages.adminMembers);
				});
				return;
			}
		};

		/* Toogle the Membership status.*/
		$scope.setMembershipStatus = function(setMembershipActive){
			clearResponse();
			if($rootScope.currentSession.user.type != constants.roles.user){
				let memberInfo = $scope.objectDetails.basicInfo;
				let description = undefined;
				memberInfo.isActive = setMembershipActive;
				if(setMembershipActive){
					description = systemMsgs.notifications.memberSetActive + memberInfo.shortname;
					MembersSvc.increaseActiveMembersCount();
				}else{
					description = systemMsgs.notifications.memberSetInactive + memberInfo.shortname;
					MembersSvc.decreaseActiveMembersCount();
					/*When setting Membership to Inactive, we must update ALL ROLES to false*/
					if(memberInfo.isHost){
						memberInfo.isHost = false;
						MembersSvc.decreaseHostMembersCount();
					}
					if(memberInfo.isLeader){
						memberInfo.isLeader = false;
						MembersSvc.decreaseLeadMembersCount();
					}
					if(memberInfo.isTrainee){
						memberInfo.isTrainee = false;
						MembersSvc.decreaseTraineeMembersCount();
					}
				}
				memberInfo.$save();
				AuditSvc.saveAuditAndNotify(constants.actions.update, constants.db.folders.members, memberInfo.$id, description);
				$scope.response = {success:true, message: systemMsgs.success.membershipStatusUpdated};
			}
		};

		$scope.isLeader = function(isLeader) {
			clearResponse();
			let memberInfo = $scope.objectDetails.basicInfo;
			if(memberInfo.isActive  && $rootScope.currentSession.user.type != constants.roles.user){
				memberInfo.isLeader = isLeader;
				let description = undefined;
				memberInfo.$save().then(function() {
					if(isLeader){
						MembersSvc.increaseLeadMembersCount();
						description = systemMsgs.notifications.memberSetLead + memberInfo.shortname;
					}else{
						MembersSvc.decreaseLeadMembersCount();
						description = systemMsgs.notifications.memberRemovedLead + memberInfo.shortname;
					}
					AuditSvc.saveAuditAndNotify(constants.actions.update, constants.db.folders.members, memberInfo.$id, description);
					$scope.response = {success:true, message: systemMsgs.success.memberRoleUpdated};
				});
			}
		};

		$scope.isTrainee = function(isTrainee) {
			clearResponse();
			let memberInfo = $scope.objectDetails.basicInfo;
			if(memberInfo.isActive && $rootScope.currentSession.user.type != constants.roles.user){
				memberInfo.isTrainee = isTrainee;
				let description = undefined;
				memberInfo.$save().then(function() {
					if(isTrainee){
						MembersSvc.increaseTraineeMembersCount();
						description = systemMsgs.notifications.memberSetTrainee + memberInfo.shortname;
					}else{
						MembersSvc.decreaseTraineeMembersCount();
						description = systemMsgs.notifications.memberRemovedTrainee + memberInfo.shortname;
					}
					AuditSvc.saveAuditAndNotify(constants.actions.update, constants.db.folders.members, memberInfo.$id, description);
					$scope.response = {success:true, message: systemMsgs.success.memberRoleUpdated};
				});
			}
		};

		$scope.isHost = function(isHost) {
			clearResponse();
			let memberInfo = $scope.objectDetails.basicInfo;
			if(memberInfo.isActive && $rootScope.currentSession.user.type != constants.roles.user){
				memberInfo.isHost = isHost;
				let description = undefined;
				memberInfo.$save().then(function() {
					if(isHost){
						MembersSvc.increaseHostMembersCount();
						description = systemMsgs.notifications.memberSetHost + memberInfo.shortname;
					}else{
						MembersSvc.decreaseHostMembersCount();
						description = systemMsgs.notifications.memberRemovedHost + memberInfo.shortname;
					}
					AuditSvc.saveAuditAndNotify(constants.actions.update, constants.db.folders.members, memberInfo.$id, description);
					$scope.response = {success:true, message: systemMsgs.success.memberRoleUpdated};
				});
			}
		};

		clearResponse = function() {
			$rootScope.memberResponse = null;
			$scope.response = null;
		};

		/*Called when change detected on bday input*/
		updateBdayValue = function(){
			let birthdate = document.getElementById("bday").value;
			$scope.objectDetails.basicInfo.bday = birthdate;
		};

		/*Load the list of Active Groups */
		$scope.prepareForBaseGroupUpdate = function(){
			$scope.response = {working:true, message: systemMsgs.inProgress.loading};
			if(!$scope.memberEditParams.groupsList){
				$scope.memberEditParams.groupsList = GroupsSvc.getActiveGroups();
			}
			$scope.memberEditParams.groupsList.$loaded().then(function(){
				clearResponse();
				$scope.memberEditParams.updatingBaseGroup = true;
			});
		};

		/*Persist the Member's Base Group Selection */
		$scope.updateBaseGroup = function(){
			clearResponse();
			let memberInfo = $scope.objectDetails.basicInfo;
			if($rootScope.currentSession.user.type != constants.roles.user){
					if(memberInfo.baseGroupId){
						let group = $scope.memberEditParams.groupsList.$getRecord(memberInfo.baseGroupId);
						memberInfo.baseGroupName = group.name;
					}else{
						memberInfo.baseGroupName = null;
						memberInfo.baseGroupId = null;
					}
					memberInfo.$save().then(function() {
						let description = systemMsgs.notifications.baseGroupUpdated + memberInfo.shortname;
						AuditSvc.saveAuditAndNotify(constants.actions.update, constants.db.folders.members, memberInfo.$id, description);
						$scope.memberEditParams.updatingBaseGroup = false;
						$scope.response = {success:true, message: systemMsgs.success.baseGroupUpdated};
					});
			}
		};

		$scope.allowUser = function(allow){
			let memberInfo = $scope.objectDetails.basicInfo;
			memberInfo.allowUser = allow;
			let description = undefined;

			memberInfo.$save().then(function() {
				if(allow){
					description = memberInfo.shortname + systemMsgs.notifications.memberCanBeUser;
					AuthenticationSvc.updateEmailInAllowedList(memberInfo.$id, memberInfo.email);
				}else{
					description = memberInfo.shortname + systemMsgs.notifications.memberCannotBeUser;
					AuthenticationSvc.updateEmailInAllowedList(memberInfo.$id, null);
				}

				//Add the email to list of allowed emails
				AuditSvc.saveAuditAndNotify(constants.actions.update, constants.db.folders.members, memberInfo.$id, description);
				// $scope.response = {success:true, message: systemMsgs.success.baseGroupUpdated};
			});
		};

		$scope.getMemberRules = function() {
			let whichMember = $routeParams.memberId;
			$scope.acessRulesList = MembersSvc.getAccessRulesList(whichMember);
			if(!$scope.memberEditParams.groupsList){
				$scope.memberEditParams.groupsList = GroupsSvc.getActiveGroups();
			}
			$scope.newRule = {};
			$scope.rulesResponse = null;
		};

		/* Rules are assigned to Members (/members/details/{memberId}/access)
		 and to groups (/groups/details/{groupId}/access)*/
		$scope.addRule = function(){
			$scope.rulesResponse = { working: true, message: systemMsgs.inProgress.creatingRule };
			let whichGroup = $scope.newRule.groupId;
			let memberObj = $scope.objectDetails.basicInfo;
			let groupObj = $scope.memberEditParams.groupsList.$getRecord(whichGroup);
			let existingRuleId = $scope.getExistingRuleId(whichGroup);

			if(existingRuleId){
				$scope.rulesResponse = {error: true, message: systemMsgs.error.duplicatedRule};
				//Ensure the access rule (in the Member Folder) has the updated Group name
				let index = $scope.acessRulesList.$indexFor(existingRuleId);
				let ruleObj = $scope.acessRulesList.$getRecord(existingRuleId);
				ruleObj.groupName = groupObj.name;
				$scope.acessRulesList.$save(index);
				return;
			}

			let creationDate = firebase.database.ServerValue.TIMESTAMP;
			let ruleForMember = { groupName: groupObj.name, groupId: groupObj.$id, date:creationDate};
			let ruleForGroup = { memberName: memberObj.shortname, memberId: memberObj.$id, memberEmail: memberObj.email,
														userId: memberObj.userId, date:creationDate};

			//Use the Group's access list to create the new rule
			$scope.acessRulesList.$add(ruleForMember).then(function(ref) {
				//Create cross Reference. The Member must have similar rule, with same rule Id.
				GroupsSvc.addAccessRule(whichGroup, ref.key, ruleForGroup);
				let description = memberObj.shortname + " " + systemMsgs.notifications.gotAccessToGroup + groupObj.name;
				let notification = { description: description,
					action: constants.actions.update,
					onFolder: constants.db.folders.groups,
					onObject: groupObj.$id,	url:null };
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

		$scope.getExistingRuleId = function(groupId) {
			let ruleId = undefined;
			//Review in the current Lists, if a similar rule already exist
			$scope.acessRulesList.forEach(function(rule) {
				if(rule.groupId == groupId){
					ruleId = rule.$id;
				};
			});
			return ruleId;
		};

		$scope.deleteRule = function(rule){
			$scope.rulesResponse = {working: true, message: systemMsgs.inProgress.deletingRule};
			// var ruleRecord = $scope.acessRulesList.$getRecord(ruleId);
			let ruleId = rule.$id;
			let groupId = rule.groupId;
			let groupName = rule.groupName;
			let userId = $scope.objectDetails.basicInfo.userId;
			let memberName = $scope.objectDetails.basicInfo.shortname;

			console.log(ruleId, groupId, groupName, userId, memberName);

			$scope.acessRulesList.$remove(rule).then(function(ref) {
				//Remove the same rule from the Member's access folder
				GroupsSvc.addAccessRule(groupId, ruleId, null);
				let description = memberName + " " + systemMsgs.notifications.lostAccessToGroup + groupName;
				let notification = { description: description, action: constants.actions.update,
									onFolder: constants.db.folders.groups, onObject: groupId,	url:null };
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

okulusApp.factory('MembersSvc',
['$rootScope', '$firebaseArray', '$firebaseObject',
	function($rootScope, $firebaseArray, $firebaseObject){

		let baseRef = firebase.database().ref().child(constants.db.folders.root);
		let memberListRef = baseRef.child(constants.db.folders.membersList);
		let memberDetailsRef = baseRef.child(constants.db.folders.membersDetails);
		let isActiveMemberRef = memberListRef.orderByChild(constants.status.isActive);
		let isLeadMemberRef = memberListRef.orderByChild(constants.roles.isLead);
		let isTraineeMemberRef = memberListRef.orderByChild(constants.roles.isTrainee);
		let isHostMemberRef = memberListRef.orderByChild(constants.roles.isHost);

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
			getGlobalMembersCounter: function(){
				return $firebaseObject(baseRef.child(constants.db.folders.membersCounters));
			},
			/* Return all Members, using a limit for the query, if specified*/
			getAllMembers: function(limit) {
					if(limit){
						return $firebaseArray(memberListRef.orderByKey().limitToLast(limit));
					}else{
						return $firebaseArray(memberListRef.orderByKey());
					}
			},
			/* Return all Members with isActive:true, using a limit for the query, if specified*/
			getActiveMembers: function(limit) {
				if(limit){
					return $firebaseArray(isActiveMemberRef.equalTo(true).limitToLast(limit));
				}else{
					return $firebaseArray(isActiveMemberRef.equalTo(true));
				}
			},
			/* Return all Members with isActive:false, using a limit for the query, if specified*/
			getInactiveMembers: function(limit) {
				if(limit){
					return $firebaseArray(isActiveMemberRef.equalTo(false).limitToLast(limit));
				}else{
					return $firebaseArray(isActiveMemberRef.equalTo(false));
				}
			},
			/* Return all Members with isLeader:true, using a limit for the query, if specified*/
			getLeadMembers: function(limit) {
				if(limit){
					return $firebaseArray(isLeadMemberRef.equalTo(true).limitToLast(limit));
				}else{
					return $firebaseArray(isLeadMemberRef.equalTo(true));
				}
			},
			/* Return all Members with isTrainee:true, using a limit for the query, if specified*/
			getTraineeMembers: function(limit) {
				if(limit){
					return $firebaseArray(isTraineeMemberRef.equalTo(true).limitToLast(limit));
				}else{
					return $firebaseArray(isTraineeMemberRef.equalTo(true));
				}
			},
			/* Return all Members with isHost:true, using a limit for the query, if specified*/
			getHostMembers: function(limit) {
				if(limit){
					return $firebaseArray(isHostMemberRef.equalTo(true).limitToLast(limit));
				}else{
					return $firebaseArray(isHostMemberRef.equalTo(true));
				}
			},
			/* Return all Members with isUser:true, using a limit for the query, if specified*/
			getMembersWithUser: function(limit) {
				let reference = memberListRef.orderByChild(constants.roles.isUser);
				if(limit){
					return $firebaseArray(reference.equalTo(true).limitToLast(limit));
				}else{
					return $firebaseArray(reference.equalTo(true));
				}
			},
			/* Get member's sex value'*/
			getMemberSex: function(whichMemberId){
				return $firebaseObject(memberListRef.child(whichMemberId).child(constants.db.fields.sex));
			},
			/* Get member basic info from firebase and return as object */
			getMemberBasicDataObject: function(whichMemberId){
				return $firebaseObject(memberListRef.child(whichMemberId));
			},
			/* Get member address from firebase and return as object */
			getMemberAddressObject: function(whichMemberId){
				return $firebaseObject(memberDetailsRef.child(whichMemberId).child(constants.db.folders.address));
			},
			/* Get member audit from firebase and return as object */
			getMemberAuditObject: function(whichMemberId){
				return $firebaseObject(memberDetailsRef.child(whichMemberId).child(constants.db.folders.audit));
			},
			/* Get the list of Access Rules that indicate the groups the member has access to */
			getAccessRulesList: function(whichMemberId) {
				return $firebaseArray(memberDetailsRef.child(whichMemberId).child(constants.db.folders.accessRules));
			},
			/* Returns the member/list containing members with baseGroupId = gropId */
			getMembersForBaseGroup: function(gropId){
				let ref = memberListRef.orderByChild(constants.db.fields.baseGroup).equalTo(gropId);
				return $firebaseArray(ref);
			},
			/* Push Member Basic Details Object to Firebase*/
			persistMember: function(memberObj){
				let ref = memberListRef.push();
				ref.set(memberObj);
				return ref;
			},
			/* Push Address Object to Firebase, in the folder members/details/:memberId */
			persistMemberAddress: function(memberId, addressObj){
				if(!addressObj) return null;
				let ref = memberDetailsRef.child(memberId).child(constants.db.folders.address);
				ref.set(addressObj);
				return ref;
			},
			/* Push Audit Object to Firebase, in the folder members/details/:memberId */
			persistMemberAudit: function(memberId, auditObj){
				let ref = memberDetailsRef.child(memberId).child(constants.db.folders.audit);
				ref.set(auditObj);
				return ref;
			},
			/* Remove all Member details (Address, Audit, Access Rules, attendance, etc.)*/
			deleteMemberDetails:function(whichMemberId){
				memberDetailsRef.child(whichMemberId).set({});
			},
			/* Used when creating a Member */
			increaseTotalMembersCount: function () {
				let conunterRef = baseRef.child(constants.db.folders.totalMembersCount);
				increaseCounter(conunterRef);
			},
			/* Used when deleting a Member */
			decreaseTotalMembersCount: function () {
				let conunterRef = baseRef.child(constants.db.folders.totalMembersCount);
				decreaseCounter(conunterRef);
			},
			/* Called after setting the membership status "isActive" to True  */
			increaseActiveMembersCount: function() {
				let conunterRef = baseRef.child(constants.db.folders.activeMembersCount);
				increaseCounter(conunterRef);
			},
			/* Called after setting the membership status "isActive" to False  */
			decreaseActiveMembersCount: function() {
				let conunterRef = baseRef.child(constants.db.folders.activeMembersCount);
				decreaseCounter(conunterRef);
			},
			/* Called after setting the member to isHost true*/
			increaseHostMembersCount: function() {
				let conunterRef = baseRef.child(constants.db.folders.hostMembersCount);
				increaseCounter(conunterRef);
			},
			/* Called after setting the member to isHost false*/
			decreaseHostMembersCount: function() {
				let conunterRef = baseRef.child(constants.db.folders.hostMembersCount);
				decreaseCounter(conunterRef);
			},
			/* Called after setting the member to isLead true*/
			increaseLeadMembersCount: function() {
				let conunterRef = baseRef.child(constants.db.folders.leadMembersCount);
				increaseCounter(conunterRef);
			},
			/* Called after setting the member to isLead false*/
			decreaseLeadMembersCount: function() {
				let conunterRef = baseRef.child(constants.db.folders.leadMembersCount);
				decreaseCounter(conunterRef);
			},
			/* Called after setting the member to isTrainee true*/
			increaseTraineeMembersCount: function() {
				let conunterRef = baseRef.child(constants.db.folders.traineeMembersCount);
				increaseCounter(conunterRef);
			},
			/* Called after setting the member to isTrainee false*/
			decreaseTraineeMembersCount: function() {
				let conunterRef = baseRef.child(constants.db.folders.traineeMembersCount);
				decreaseCounter(conunterRef);
			},
			/* Called From Authetication Service:
			Return a list with all members having the email passed */
			getMembersByEmail: function(email){
				return $firebaseArray(memberListRef.orderByChild(constants.db.fields.email).equalTo(email));
			},
			/*  Called From Authetication Service:
			Update the User reference in the Member Object*/
			updateUserReferenceInMemberObject: function(userId, memberBasicInfoObj){
				memberBasicInfoObj.userId = userId;
				memberBasicInfoObj.isUser = false;
				if(userId){
					memberBasicInfoObj.isUser = true;
				}
				memberBasicInfoObj.$save();
			},
			/* Called From Authetication Service:
			Same method than above, but using different aproach.*/
			updateUserReferenceInMember: function(userId, memberId){
				let isUser = false;
				if(userId){
					isUser = true;
				}
				memberListRef.child(memberId).update({isUser:isUser, userId:userId});
			},
			/* returns $firebaseArray with all access rules in /members/details/:whichMember/access folder*/
			getMemberAccessRules: function(whichMember) {
				if(!whichMember) return;
				return $firebaseArray(memberDetailsRef.child(whichMember).child(constants.db.folders.accessRules));
			},
			/* returns $firebaseArray with all access rules in /members/details/:whichMember/access folder*/
			getMemberAttendance: function(whichMember) {
				if(!whichMember) return;
				return $firebaseArray(memberDetailsRef.child(whichMember).child(constants.db.folders.attendance));
			},
			/*Save Access Rule in member folder (/members/details/:whichMember/access/:ruleId)*/
			addAccessRuleToMember: function(whichMemberId, ruleId, ruleRecord){
				memberDetailsRef.child(whichMemberId).child(constants.db.folders.accessRules).child(ruleId).set(ruleRecord);
			},
			/* Receives the access list from a Group = ( { accessRuleId: {groupId,groupName,date} , ...} ),
			and use them to delete the groups access from each member in the list.
			The accessRuleId is the same on groups/:groupId/access/:accessRuleId
			and members/:memberId/access/:accessRuleId */
			removeAccessRules: function(accessList){
				if(accessList){
					accessList.forEach(function(accessRule) {
						memberDetailsRef.child(accessRule.memberId).child(constants.db.folders.accessRules).child(accessRule.$id).set(null);
					});
				}
			},
			/* Called when settign the Report's Members attendance List.
			 It will set information about a reunion (report) to the Member */
			addReportReferenceToMember: function(memberId,report){
				let ref = memberDetailsRef.child(memberId).child(constants.db.folders.attendance).child(report.$id);
				ref.set({
					reportId: report.$id
					// weekId:report.weekId,
					// dateMilis: report.dateMilis,
					// groupId:report.groupId,
					// groupName:report.groupname
				});
			},
			/*  */
			removeReportReferenceFromMember: function(memberId, reportId){
				memberDetailsRef.child(memberId).child(constants.db.folders.attendance).child(reportId).set(null);
			},

			//Deprecated
			removeMemberReferenceToReport: function(memberId,reportId){
				memberDetailsRef.child(memberId).child(constants.db.folders.attendance).child(reportId).set(null);
			},
			//Deprecated
			removeReferenceToReport: function(reportId,membersAttendanceList){
				if(membersAttendanceList){
					for (const attKey in membersAttendanceList) {
						// console.debug(attKey);
						let memberId = membersAttendanceList[attKey].memberId;
						memberDetailsRef.child(memberId).child(constants.db.folders.attendance).child(reportId).set(null);
					}
				}
			}
		};
	}
]);
