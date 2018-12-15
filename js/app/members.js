//Mapping: /members
okulusApp.controller('MembersListCntrl',
	['$rootScope','$scope','$firebaseAuth','$location','MembersSvc','AuthenticationSvc','UtilsSvc',
	function($rootScope,$scope,$firebaseAuth,$location,MembersSvc,AuthenticationSvc,UtilsSvc){

		let unwatch = undefined;
		/*Executed everytime we enter to /members
		  This function is used to confirm the user is Admin */
		$scope.response = {loading: true, message: $rootScope.i18n.alerts.loading };
		$firebaseAuth().$onAuthStateChanged(function(authUser){ if(authUser){
			AuthenticationSvc.loadSessionData(authUser.uid).$loaded().then( function(user){
				if(user.type == constants.roles.admin){
					$rootScope.membersGlobalCount = UtilsSvc.getGlobalCounter(constants.folders.members);
					$rootScope.membersGlobalCount.$loaded().then(
						function(membersCount) {
							$scope.response = undefined;
							/* Adding a Watch to the membersGlobalCount to detect changes.
							The idea is to update the maxPossible value from membersListParams.*/
							if(unwatch){ unwatch(); }
							unwatch = $rootScope.membersGlobalCount.$watch( function(data){
								if($rootScope.membersListParams){
									let loader = $rootScope.membersListParams.activeMembersLoader;
									$rootScope.membersListParams = getmembersListParams(loader);
									$scope.response = undefined;
								}
							});
					});
				}else{
					$rootScope.response = {error:true, showHomeButton: true,
																	message:$rootScope.i18n.error.noAdmin};
					$location.path(constants.pages.error);
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
 			$rootScope.adminMembersList = MembersSvc.getAllMembers($rootScope.config.maxQueryListResults);
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
				$rootScope.membersResponse = null;
				if(!members.length){
					$scope.response = { error: true, message: systemMsgs.error.noMembersError };
				}
			}).catch( function(error){
				$scope.response = { error: true, message: systemMsgs.error.loadingMembersError };
				console.error(error);
			});
		};

	}
]);

/* Controller linked to /members/details/:memberId and /members/edit/:memberId
 * It will load the Member for the id passed */
okulusApp.controller('MemberDetailsCntrl',
	['$rootScope', '$scope','$routeParams', '$location','$firebaseAuth', 'MembersSvc', 'AuditSvc','AuthenticationSvc',
	function($rootScope, $scope, $routeParams, $location,$firebaseAuth, MembersSvc, AuditSvc, AuthenticationSvc){

		/* Init. Executed everytime we enter to /members/new,
		/members/details/:memberId or /members/edit/:memberId */
		$firebaseAuth().$onAuthStateChanged(function(authUser){ if(authUser){
			$scope.response = {loading: true, message: systemMsgs.inProgress.loadingMember };

			$scope.objectDetails = {};
			AuthenticationSvc.loadSessionData(authUser.uid).$loaded().then(function (user) {
				/* Only Users with an associated Member can see the content */
				if(!user.memberId){
					$rootScope.response = {error: true, message: systemMsgs.error.noMemberAssociated};
					$location.path(constants.pages.error);
					return;
				}

				let memberId = $routeParams.memberId;
				/* Prepare for Edit or View Details of Existing Member */
				if(memberId){
					$scope.objectDetails.basicInfo = MembersSvc.getMemberBasicDataObject(memberId);
					$scope.objectDetails.basicInfo.$loaded().then(function(member){
						//If member from DB hasn't shortname, is because no member was found
						if(!member.shortname){
							$rootScope.response = {error: true, message: systemMsgs.error.recordDoesntExist };
							$location.path(constants.pages.error);
							return;
						}

						$scope.objectDetails.address = MembersSvc.getMemberAddressObject(memberId);
						$scope.objectDetails.audit = MembersSvc.getMemberAuditObject(memberId);
						// $scope.objectDetails.user = MembersSvc.getMemberUser(memberId);
						// $scope.objectDetails.groups = MembersSvc.getMemberGroups(memberId);
						// $scope.objectDetails.attendance = MembersSvc.getMemberAttendance(memberId);
						$scope.prepareViewForEdit(member);
					}).catch( function(error){
						$rootScope.response = { error: true, message: error };
						$location.path(constants.pages.error);
					});
				}
				/* Prepare for New Member Creation */
				else{
					$scope.prepareViewForNew();
				}
			});
		}});

		$scope.prepareViewForEdit = function (memberObject) {
			$scope.memberEditParams = {};
			$scope.memberEditParams.actionLbl = $rootScope.i18n.members.modifyLbl;
			$scope.memberEditParams.showBadges = true;
			$scope.memberEditParams.isEdit = true;
			$scope.memberEditParams.memberId = memberObject.$id;
			$scope.response = undefined;
		}

		$scope.prepareViewForNew = function () {
			$scope.memberEditParams = {};
			$scope.memberEditParams.actionLbl = $rootScope.i18n.members.newLbl;
			$scope.memberEditParams.showBadges = false;
			$scope.memberEditParams.isEdit = false;
			$scope.memberEditParams.memberId = undefined;
			$scope.response = undefined;
		}

		/*Create address Object in scope so we can populate it's values from view*/
		$scope.addAdress = function(){
			$scope.response = null;
			$rootScope.memberResponse = null;
			$scope.objectDetails.address = {};
		};

		/*Remove the address Object from scope, and from DB*/
		$scope.removeAdress = function(){
			$rootScope.memberResponse = null;
			if($rootScope.currentSession.user.type == constants.roles.admin){
				if($scope.objectDetails.address.$id){
					$scope.response = {working:true, message: systemMsgs.inProgress.deletingMemberAddress};
					let memberId = $scope.memberEditParams.memberId;

					$scope.objectDetails.address.$remove().then(function(ref) {
						AuditSvc.recordAudit(memberId, constants.actions.update, constants.folders.members);
						$scope.response = {success:true, message: systemMsgs.success.memberAddressRemoved};
					}, function(error) {
					  console.log("Error:", error);
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
			$rootScope.memberResponse = null;
			if($rootScope.currentSession.user.type == constants.roles.admin){
				$scope.response = {working:true, message: systemMsgs.inProgress.savingMemberAddress};
				let memberId = $scope.memberEditParams.memberId;

				//Update using the existing address firebaseObject
				if($scope.objectDetails.address.$id){
					$scope.objectDetails.address.$save().then(function(){
						AuditSvc.recordAudit(memberId, constants.actions.update, constants.folders.members);
						$scope.response = {success:true, message: systemMsgs.success.memberInfoSAved};
					});
				}
				//Save address for the first time, and keep the address firebaseObject in scope
				else{
					MembersSvc.persistMemberAddress(memberId,$scope.objectDetails.address);
					$scope.objectDetails.address = MembersSvc.getMemberAddressObject(memberId);
					$scope.objectDetails.address.$loaded().then(function() {
						AuditSvc.recordAudit(memberId, constants.actions.update, constants.folders.members);
						$scope.response = {success:true, message: systemMsgs.success.memberInfoSAved};
					});
				}
			}
		};

		$scope.saveBasicInfo = function(){
			$rootScope.memberResponse = null;
			if($rootScope.currentSession.user.type == constants.roles.admin){
				$scope.response = {working:true, message: systemMsgs.inProgress.savingMemberInfo};
				let memberId = $scope.memberEditParams.memberId;

				/*UPDATE Current Member*/
				if($scope.objectDetails.basicInfo.$id){
					$scope.objectDetails.basicInfo.$save().then(function() {
						AuditSvc.recordAudit(memberId, constants.actions.update, constants.folders.members);
						$scope.response = {success:true, message: systemMsgs.success.memberInfoSAved};
					});
				}
				/*CREATE A NEW MEMBER, and redirect to /members/edit/ */
				else{
					$scope.objectDetails.basicInfo.isActive = true;
					let newmemberRef = MembersSvc.persistMember($scope.objectDetails.basicInfo);
					MembersSvc.getMemberBasicDataObject(newmemberRef.key).$loaded().then(function() {
						AuditSvc.recordAudit(newmemberRef.key, constants.actions.create, constants.folders.members);
						//TODO:increase member counter (total and active)
						// MembersSvc.
						$rootScope.memberResponse = { created:true, message: systemMsgs.success.memberCreated };
						$location.path(constants.pages.memberEdit+newmemberRef.key);
					});
				}
			}
		};

		/* A member can be deleted by Admin.
			If a memeber is deleted, his attendance to reunions still recorded on every Reunion Report
			When deleting a Member:
			1. Decrease the Member Status counter
			2. Delete all references to this member from group/access*/
	  $scope.deleteMember = function() {
			console.log("deleteMember");
			return;

			if($rootScope.currentSession.user.type == 'user'){
				$scope.response = { memberMsgError: "Para eliminar este miembro, contacta al administrador"};
			}else{
				$scope.working = true;
				if( $scope.memberId ){
					MembersSvc.getMember($scope.memberId).$loaded().then( function(memberObj){
						let status = memberObj.member.status;
						let accessList = memberObj.access;
						memberObj.$remove().then(function(ref) {
							$rootScope.response = { memberMsgOk: "Miembro Eliminado"};
					    AuditSvc.recordAudit(ref.key, "delete", "members");
							MembersSvc.decreaseStatusCounter(status);
							GroupsSvc.deleteAccessToGroups(accessList);
							$scope.working = false;
							$location.path( "/members");
						}, function(error) {
							$scope.working = false;
							$rootScope.response = { memberMsgError: err};
						});
					});
				}
			}
		};

		/*Called when change detected on bday input*/
		updateBdayValue = function(){
			let birthdate = document.getElementById("bday").value;
			$scope.objectDetails.basicInfo.bday = birthdate;
		};

		/* Toogle the Membership status.*/
		$scope.setMembershipStatus = function(setMembershipActive){
			$rootScope.memberResponse = null;
			if($rootScope.currentSession.user.type == constants.roles.admin
				&& $scope.memberEditParams.isEdit){

			 let memberInfo = $scope.objectDetails.basicInfo;
			 memberInfo.isActive = setMembershipActive;
				/*When setting Membership to Active, we must update the global counters */
				if(setMembershipActive){
					console.log("Increase Active Members Count");
					console.log("Reduce Inactive Members Count");
				}else{
					/*When setting Membership to Inactive, we must update the global counters
					and set the assigned roles to false*/
					console.log("Reduce Active Members Count");
					console.log("Increase Inactive Members Count");
					if(memberInfo.isHost){
						memberInfo.isHost = false;
						console.log("Reduce Host Members Count");
					}
					if(memberInfo.isLeader){
						memberInfo.isLeader = false;
						console.log("Reduce Lead Members Count");
					}
					if(memberInfo.isTrainee){
						memberInfo.isTrainee = false;
						console.log("Reduce Trainee Members Count");
					}
				}
				memberInfo.$save();
			}
		};

		$scope.isLeader = function(isLeader) {
			$rootScope.memberResponse = null;
			let memberInfo = $scope.objectDetails.basicInfo;
			if($rootScope.currentSession.user.type == constants.roles.admin
				&& $scope.memberEditParams.isEdit && memberInfo.isActive){

				memberInfo.isLeader = isLeader;
				memberInfo.$save().then(function() {
					if(isLeader){
						console.log("Increase Lead Members Counter");
					}else{
						console.log("Reduce Lead Members Counter");
					}
				});
			}
		}

		$scope.isTrainee = function(isTrainee) {
			$rootScope.memberResponse = null;
			let memberInfo = $scope.objectDetails.basicInfo;
			if($rootScope.currentSession.user.type == constants.roles.admin
				&& $scope.memberEditParams.isEdit && memberInfo.isActive){

				memberInfo.isTrainee = isTrainee;
				memberInfo.$save().then(function() {
					if(isTrainee){
						console.log("Increase Treinee Members Counter");
					}else{
						console.log("Reduce Treinee Members Counter");
					}
				});
			}
		}

		$scope.isHost = function(isHost) {
			$rootScope.memberResponse = null;
			let memberInfo = $scope.objectDetails.basicInfo;
			if($rootScope.currentSession.user.type == constants.roles.admin
				&& $scope.memberEditParams.isEdit && memberInfo.isActive){

				memberInfo.isHost = isHost;
				memberInfo.$save().then(function() {
					if(isHost){
						console.log("Increase Host Members Counter");
					}else{
						console.log("Reduce Host Members Counter");
					}
				});
			}
		}

	}
]);

okulusApp.factory('MembersSvc',
['$rootScope', '$firebaseArray', '$firebaseObject', 'GroupsSvc',
	function($rootScope, $firebaseArray, $firebaseObject, GroupsSvc){

		let baseRef = firebase.database().ref().child(rootFolder);
		let memberListRef = baseRef.child(constants.folders.membersList);
		let memberDetailsRef = baseRef.child(constants.folders.membersDetails);
		let isActiveMemberRef = memberListRef.orderByChild(constants.status.isActive);
		let isLeadMemberRef = memberListRef.orderByChild(constants.roles.isLead);
		let isTraineeMemberRef = memberListRef.orderByChild(constants.roles.isTrainee);
		let isHostMemberRef = memberListRef.orderByChild(constants.roles.isHost);

		let membersRef = firebase.database().ref().child(rootFolder).child(constants.folders.members);
		let activeMembersRef = membersRef.orderByChild("member/status").equalTo("active");
		let counterRef = firebase.database().ref().child(rootFolder).child('counters/members');

		return {
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
			/* Get member from firebase and return as object */
			getMemberBasicDataObject: function(memberId){
				return $firebaseObject(memberListRef.child(memberId));
			},
			/* Get member from firebase and return as object */
			getMemberAddressObject: function(memberId){
				return $firebaseObject(memberDetailsRef.child(memberId).child(constants.folders.address));
			},
			/* Get member from firebase and return as object */
			getMemberAuditObject: function(memberId){
				return $firebaseObject(memberDetailsRef.child(memberId).child(constants.folders.audit));
			},
			/* Push Member Basic Details Object to Firebase*/
			persistMember: function(memberObj){
				let ref = memberListRef.push();
				ref.set(memberObj);
				return ref;
			},
			/* Push Address Object to Firebase, in the folder members/details/:memberId */
			persistMemberAddress: function(memberId, addressObj){
				let ref = memberDetailsRef.child(memberId).child(constants.folders.address);
				ref.set(addressObj);
				return ref;
			},

			allMembersLoaded: function() {
				return $rootScope.allMembers != null;
			},
			getMemberFromArray: function(memberId){
				return $rootScope.allMembers.$getRecord(memberId);
			},
			/* Get member Personal data from firebase and return as object */
			getMemberDataObject: function(memberId){
				return $firebaseObject(membersRef.child(memberId).child("member"));
			},
			/* Get member from firebase and return as object */
			getMemberObject: function(memberId){
				return $firebaseObject(membersRef.child(memberId));
			},
			//Deprecated
			getMember: function(memberId){
				return $firebaseObject(membersRef.child(memberId));
			},
			getMemberInfo: function(memberId){
				return $firebaseObject(membersRef.child(memberId).child("member"));
			},
			getMemberAccessRules: function(whichMember) {
				return $firebaseArray(membersRef.child(whichMember).child("access"));
			},
			loadAllMembersList: function(){
				if(!$rootScope.allMembers){
					// console.debug("Creating firebaseArray for allMembers");
					$rootScope.allMembers = $firebaseArray(membersRef);
				}
				return $rootScope.allMembers;
			},
			loadActiveMembers: function(){
				if(!$rootScope.allActiveMembers){
					$rootScope.allActiveMembers = $firebaseArray(activeMembersRef);
				}
				return $rootScope.allActiveMembers;
			},
			getMembersThatCanBeUser: function(){
				return  $firebaseArray(membersRef.orderByChild("member/canBeUser").equalTo(true));
			},
			getMembersWithUser: function(){
				return  $firebaseArray(membersRef.orderByChild("user/isUser").equalTo(true));
			},
			filterActiveHosts: function(activeMembers){
				let activeHosts = [];
				activeMembers.forEach(function(host) {
						if(host.member.isHost){
							activeHosts.push( host );
						}
				});
				return activeHosts;
			},
			filterActiveLeads: function(activeMembers){
				let activeLeads = [];
				activeMembers.forEach(function(lead) {
						if(lead.member.isLeader){
							activeLeads.push( lead );
						}
				});
				return activeLeads;
			},
			filterActiveTrainees: function(activeMembers){
				let activeTrainees = [];
				activeMembers.forEach(function(lead) {
						if(lead.member.isTrainee){
							activeTrainees.push( lead );
						}
				});
				return activeTrainees;
			},
			getMemberReference: function(memberId){
				return membersRef.child(memberId);
			},
			getNewMemberReference: function(){
				return membersRef.push();
			},
			getMembersForBaseGroup: function(gropId){
				let ref = membersRef.orderByChild("member/baseGroup").equalTo(gropId);
				return $firebaseArray(ref);
			},
			//Receives the access list from a Group = { accessRuleId: {memberId,mamberName,date} , ...}
			//The accessRuleId is the same on groups/:gropuId/access and members/:memberId/access
			//Use accessRuleId.memberId and accessRuleId tu delete the reference from each member to the group
			deleteMembersAccess: function(accessObj){
				if(accessObj){
					for (const accessRuleId in accessObj) {
						let memberId = accessObj[accessRuleId].memberId;
						membersRef.child(memberId).child("access").child(accessRuleId).set(null);
					}
				}
			},
			removeMemberReferenceToReport: function(memberId,reportId){
				membersRef.child(memberId).child("attendance").child(reportId).set(null);
			},
			removeReferenceToReport: function(reportId,membersAttendanceList){
				if(membersAttendanceList){
					for (const attKey in membersAttendanceList) {
						// console.debug(attKey);
						let memberId = membersAttendanceList[attKey].memberId;
						membersRef.child(memberId).child("attendance").child(reportId).set(null);
					}
				}
			},
			/* Returns a list of Group records (from $firebaseArray) that are
			 * present in the Member's acess rules folder.
			getMemberGroups: function(whichMember) {
				return new Promise((resolve, reject) => {
					GroupsSvc.loadAllGroupsList().$loaded().then( function(allGroups){
						return $firebaseArray(membersRef.child(whichMember).child("access")).$loaded();
					}).then( function(memberRules) {
						let myGroups = [];
						memberRules.forEach(function(rule) {
							let group = $rootScope.allGroups.$getRecord(rule.groupId);
							if( group != null){
								myGroups.push( group );
							}
						});
						//$rootScope.groupsList = myGroups;
						resolve(myGroups);
					});

				});
			},*/
			filterMemberGroupsFromRules: function(memberRules, allGroups) {
				let myGroups = [];
				memberRules.forEach(function(rule) {
					let group = allGroups.$getRecord(rule.groupId);
					if( group != null){
						myGroups.push( group );
					}
				});
				return myGroups;
			},
			/*Use the passed Groups List to get all members with those groups as BaseGroup*/
			getMembersInGroups: function(groups) {
				return new Promise((resolve, reject) => {
					let contacts = [];
					groups.forEach(function(group) {
						//get from members folder order by member.baseGroup equals to group.$id
						let ref = membersRef.orderByChild("member/baseGroup").equalTo(group.$id);
						$firebaseArray(ref).$loaded().then(function(members){
							members.forEach(function(member) {
								contacts.push( member );
							});
						});
					});
					resolve(contacts);
				});
			},
			/* Return a list with all members having the email passed */
			getMembersByEmail: function(email){
				let ref = membersRef.orderByChild("member/email").equalTo(email);
				return $firebaseArray(ref);
			},
			/* Called from AuthenticationSvc to update the User reference in the Member Object*/
			updateUserReferenceInMemberObject: function(userId, memberDataObj){
				memberDataObj.userId = userId;
				memberDataObj.isUser = false;
				if(userId){
					memberDataObj.isUser = true;
				}
				memberDataObj.$save();
			},
			/* Same method than above, but using different aproach.*/
			updateUserReferenceInMember: function(userId, memberId){
				let isUser = false;
				if(userId){
					isUser = true;
				}
				membersRef.child(memberId).child("member").update({isUser:isUser, userId:userId});
			},
			increaseStatusCounter(status){
				$firebaseObject(counterRef).$loaded().then(
					function( statusCounter ){
						if(status == 'active'){
							statusCounter.active = statusCounter.active+1;
						}else{
							statusCounter.inactive = statusCounter.inactive+1;
						}
						statusCounter.$save();
					});
			},
			decreaseStatusCounter(status){
				$firebaseObject(counterRef).$loaded().then(
					function( statusCounter ){
						if(status == 'active'){
							statusCounter.active = statusCounter.active-1;
						}else{
							statusCounter.inactive = statusCounter.inactive-1;
						}
						statusCounter.$save();
					});
			},
			updateStatusCounter(status){
				$firebaseObject(counterRef).$loaded().then(
					function( statusCounter ){
						if(status == 'active'){
							statusCounter.active = statusCounter.active+1;
							statusCounter.inactive = statusCounter.inactive-1;
						}else{
							statusCounter.inactive = statusCounter.inactive+1;
							statusCounter.active = statusCounter.active-1;
						}
						statusCounter.$save();
					});
			},
			addReportReference: function(memberId,reportId, report){
				// console.debug(memberId,reportId, report);
				//Save the report Id in the Group/reports
				let ref = membersRef.child(memberId).child("attendance").child(reportId);
				ref.set({
					reportId: reportId,
					weekId:report.reunion.weekId,
					date:report.reunion.dateObj,
					groupId:report.reunion.groupId,
					groupName:report.reunion.groupname
				});
			}
		};
	}
]);
