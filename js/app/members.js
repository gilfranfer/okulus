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
		'MembersSvc','MemberRequestsSvc','GroupsSvc','ConfigSvc','AuditSvc','NotificationsSvc','AuthenticationSvc',
	function($rootScope, $scope, $routeParams, $location,$firebaseAuth,
		MembersSvc, MemberRequestsSvc, GroupsSvc, ConfigSvc, AuditSvc, NotificationsSvc, AuthenticationSvc){

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
				let requestId = $routeParams.requestId;
				/* Prepare for Edit or View Details of Existing Member */
				if(memberId){
					$scope.countriesList = ConfigSvc.getCountriesList();
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
								$scope.objectDetails.address = $rootScope.config.location;
								$scope.objectDetails.address.isNew = true;
							}else{
								$scope.statesList = ConfigSvc.getStatesForCountry(address.country);
							}
						});
						// $scope.objectDetails.user = MembersSvc.getMemberUser(memberId);
						// $scope.objectDetails.groups = MembersSvc.getMemberGroups(memberId);
						// $scope.objectDetails.attendance = MembersSvc.getMemberAttendance(memberId);
						$scope.prepareViewForEdit(member);
					}).catch( function(error){
						$rootScope.response = { error: true, message: error };
						$location.path(constants.pages.error);
					});
				}
				/* Prepare for New Member Request Creation */
				else if(requestId){
					$scope.objectDetails = MemberRequestsSvc.getRequest(requestId);
					$scope.objectDetails.$loaded().then(function(request){
						if(request.$value === null){
							$rootScope.response = { error:true, message:systemMsgs.error.inexistingRequest};
							$location.path(constants.pages.error);
							return;
						}
						$scope.prepareRequestEditView(requestId);
					});
				}else{
					$scope.prepareViewForNew();
				}
			});
		}});

		$scope.updateStatesList = function() {
			$scope.statesList = ConfigSvc.getStatesForCountry($scope.objectDetails.address.country);
		};

		$scope.prepareRequestEditView = function (requestId) {
			$scope.requestParams = {};
			// $scope.memberEditParams.actionLbl = $rootScope.i18n.members.modifyLbl;
			$scope.requestParams.isEdit = true;
			$scope.requestParams.requestId = requestId;
			$scope.response = undefined;
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
			$scope.objectDetails.address = $rootScope.config.location;
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

		/* A request can be updated by the creator, if not approved. After an update,
		the request status always goes to "Pending", even if it was "Rejected". */
		$scope.updateRequest = function(){
			$scope.response = { working:true, message: systemMsgs.inProgress.updatingRequest };
			let isPending = ($scope.objectDetails.status == constants.status.pending);
			let isRejected = ($scope.objectDetails.status == constants.status.rejected);
			if(!isPending && !isRejected){return;}


			$scope.objectDetails.status = constants.status.pending;
			$scope.objectDetails.audit.lastUpdateBy = $rootScope.currentSession.user.email;
			$scope.objectDetails.audit.lastUpdateById = $rootScope.currentSession.user.$id;
			$scope.objectDetails.audit.lastUpdateOn = firebase.database.ServerValue.TIMESTAMP;
			$scope.objectDetails.$save().then(function(data) {
				if(isRejected){
					MemberRequestsSvc.decreaseRejectedRequestsCount($scope.objectDetails.audit.createdById);
					MemberRequestsSvc.increasePendingRequestsCount($scope.objectDetails.audit.createdById);
				}
				let notification = { description: systemMsgs.notifications.memberRequestedUpdated,
														action: constants.actions.update,
														onFolder: constants.db.folders.memberRequest,
														onObject: data.key,	url:null };
				//NotificationsSvc.notifyAdmins(notification);
				$scope.response = { success:true, message: systemMsgs.success.requestUpdated };
			});

		};

		/* When requesting a member, increase the number of total requests placed by the
		user, and notify admins about the reuqest.*/
		$scope.requestMember = function(){
			$scope.response = { working:true, message: systemMsgs.inProgress.creatingRequest };

			//All Members are created with initial status isActive = true
			$scope.objectDetails.basicInfo.isActive = true;
			let request = {
				status: constants.status.pending,
				notes: $scope.objectDetails.notes,
				basicInfo: $scope.objectDetails.basicInfo,
				audit: {createdBy:$rootScope.currentSession.user.email,
								createdById:$rootScope.currentSession.user.$id,
								createdOn: firebase.database.ServerValue.TIMESTAMP}
			};
			if($scope.objectDetails.address){
					request.address = $scope.objectDetails.address;
			}

			let requestRef = MemberRequestsSvc.persistRequest(request);
			MemberRequestsSvc.getRequest(requestRef.key).$loaded().then(function(){
				MemberRequestsSvc.increaseTotalRequestsCount(request.audit.createdById);
				MemberRequestsSvc.increasePendingRequestsCount(request.audit.createdById);
				let notification = { description: systemMsgs.notifications.memberRequested,
														action: constants.actions.create,
														onFolder: constants.db.folders.memberRequest,
														onObject: requestRef.key,	url:null };
				// NotificationsSvc.notifyAdmins(notification);
				$scope.response = { success:true, message: systemMsgs.success.requestCreated };
			});
		};

		/* Approval can be given only to requests on 'pending' status.
		When approving the request, change the status to "approved", set the Approver's
		data as the last one updating the request, Create a copy of the request data into
		the members/list folder and members/details/address. Additionally some counters must
		be updated: increase the number of approved requests for the Creator, Increase the
		number of existing and active members*/
		$scope.approveRequest = function(){
			$scope.response = { working:true, message: systemMsgs.inProgress.approvingRequest };
			let isPending = ($scope.objectDetails.status == constants.status.pending);
			if(!isPending){return;}

			$scope.objectDetails.audit.lastUpdateBy = $rootScope.currentSession.user.email;
			$scope.objectDetails.audit.lastUpdateById = $rootScope.currentSession.user.$id;
			$scope.objectDetails.audit.lastUpdateOn = firebase.database.ServerValue.TIMESTAMP;

			let newmemberRef = MembersSvc.persistMember($scope.objectDetails.basicInfo);
			MembersSvc.getMemberBasicDataObject(newmemberRef.key).$loaded().then(function(memberData) {
				MembersSvc.persistMemberAddress(memberData.$id,$scope.objectDetails.address);
				MembersSvc.persistMemberAudit(memberData.$id,$scope.objectDetails.audit);
				//Update request status
				$scope.objectDetails.status = constants.status.approved;
				$scope.objectDetails.$save();
				MemberRequestsSvc.increaseApprovedRequestsCount($scope.objectDetails.audit.createdById);
				MemberRequestsSvc.decreasePendingRequestsCount($scope.objectDetails.audit.createdById);
				MembersSvc.increaseTotalMembersCount();
				MembersSvc.increaseActiveMembersCount();

				let notification = { description: systemMsgs.notifications.memberRequestApproved,
														action: constants.actions.approve,
														onFolder: constants.db.folders.memberRequest,
														onObject: memberData.$id,	url:null };
				//Notify the request's creator about the approval
				NotificationsSvc.notifyUser($scope.objectDetails.audit.createdById,notification);
				$rootScope.memberResponse = { created:true, message: systemMsgs.success.memberCreatedFromRequest };
				//Redirect to the created member
				$location.path(constants.pages.memberEdit+newmemberRef.key);
			});
		};

		/* Rejection can be given only to requests on 'pending' status.
		When rejecting the request, change the status to "rejected", set the Approver's
		data as the last one updating the request. Additionally increase the number of rejected
		requests for the Creator. */
		$scope.rejectRequest = function(){
			$scope.response = { working:true, message: systemMsgs.inProgress.rejectingRequest };
			let isPending = ($scope.objectDetails.status == constants.status.pending);
			if(!isPending){return;}

			$scope.objectDetails.status = constants.status.rejected;
			$scope.objectDetails.audit.lastUpdateBy = $rootScope.currentSession.user.email;
			$scope.objectDetails.audit.lastUpdateById = $rootScope.currentSession.user.$id;
			$scope.objectDetails.audit.lastUpdateOn = firebase.database.ServerValue.TIMESTAMP;

			$scope.objectDetails.$save().then(function(){
				MemberRequestsSvc.decreasePendingRequestsCount($scope.objectDetails.audit.createdById);
				MemberRequestsSvc.increaseRejectedRequestsCount($scope.objectDetails.audit.createdById);
				let notification = { description: systemMsgs.notifications.memberRequestRejected,
														action: constants.actions.reject,
														onFolder: constants.db.folders.memberRequest,
														onObject: $scope.objectDetails.$id,	url:null };
				//Notify the request's creator about the rejection
				NotificationsSvc.notifyUser($scope.objectDetails.audit.createdById,notification);
				$scope.response = { error:true, message: systemMsgs.success.requestRejected };
			});
		};

		/* Cancelation can happen only when request is on 'pending' or 'rejected' status.
		Request with status different that Approved, can be cancelled by the the requestor.
		Update the status to "canceled", set the Requestor's data as the last one updating the request.
		Additionally increase the number of canceled requests, and reduce rejected (if applicable). */
		$scope.deleteRequest = function(){
			// $scope.response = { working:true, message: systemMsgs.inProgress.cancellingRequest };
			// let isRejected = ($scope.objectDetails.status == constants.status.rejected);
			// let isPending = ($scope.objectDetails.status == constants.status.pending);
			// if(!isPending && !isRejected){return;}
			//
			// $scope.objectDetails.status = constants.status.canceled;
			// $scope.objectDetails.audit.lastUpdateBy = $rootScope.currentSession.user.email;
			// $scope.objectDetails.audit.lastUpdateById = $rootScope.currentSession.user.$id;
			// $scope.objectDetails.audit.lastUpdateOn = firebase.database.ServerValue.TIMESTAMP;
			//
			// $scope.objectDetails.$save().then(function(){
			// 	MemberRequestsSvc.increaseCanceledRequestsCount($scope.objectDetails.audit.createdById);
			// 	if(isRejected){
			// 		MemberRequestsSvc.decreaseRejectedRequestsCount($scope.objectDetails.audit.createdById);
			// 	}else if(isPending){
			// 		MemberRequestsSvc.decreasePendingRequestsCount($scope.objectDetails.audit.createdById);
			// 	}
			// 	let notification = { description: systemMsgs.notifications.memberRequestCanceled,
			// 											action: constants.actions.cancel,
			// 											onFolder: constants.db.folders.memberRequest,
			// 											onObject: $scope.objectDetails.$id,	url:null };
			// 	NotificationsSvc.notifyAdmins(notification);
			// 	$scope.response = { error:true, message: systemMsgs.success.requestCanceled };
			// });
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
				console.log(constants.db.folders.totalMembersCount);
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
				return $firebaseArray(memberDetailsRef.child(whichMember).child(constants.db.folders.accessRules));
			},
			/*Save Access Rule in member folder (/members/details/:whichMember/access/:ruleId)*/
			addAccessRuleToMember: function(whichMemberId, ruleId, ruleRecord){
				memberDetailsRef.child(whichMemberId).child(constants.db.folders.accessRules).child(ruleId).set(ruleRecord);
			},
			/* Receives the access list from a Group = ( { accessRuleId: {groupId,groupName,date} , ...} ),
			and use them to delete the groups access from each member in the list.
			The accessRuleId is the same on groups/:gropuId/access/:accessRuleId
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
					reportId: report.$id,
					weekId:report.weekId,
					date:report.date,
					groupId:report.groupId,
					groupName:report.groupname
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
