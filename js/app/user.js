/* Controller linked to /statistics
 * It will load the lists (weeks, groups, member rules) required for the view to work */
okulusApp.controller('UserStatisticsCntrl',
	['$location', '$rootScope','$scope','$firebaseAuth', 'MembersSvc', 'GroupsSvc', 'WeeksSvc', 'AuthenticationSvc',
	function($location, $rootScope,$scope,$firebaseAuth, MembersSvc, GroupsSvc, WeeksSvc, AuthenticationSvc){

		$scope.response = {loading:true, message:systemMsgs.inProgress.loadingAdminDash};
		$firebaseAuth().$onAuthStateChanged( function(authUser){if(authUser){
			AuthenticationSvc.loadSessionData(authUser.uid).$loaded().then(function (user) {
				if(!user.isValid){
					$rootScope.response = { error:true, message: systemMsgs.error.noMemberAssociated};
					$location.path(constants.pages.error);
					return;
				}

				$scope.selectedWeeks = [];
				$scope.selectedGroups = [];

				//Show only weeks allowed for report finder (Visible Weeks)
				$scope.weeksList = WeeksSvc.getVisibleWeeks();
				$scope.weeksList.$loaded().then(function(weeks){
					//To preselect the latest week in the view
					$scope.selectedWeeks.push(weeks.$keyAt(weeks.length-1));
				});
				//Show only groups the user have access to
				$scope.groupsList = [];
				$rootScope.currentSession.accessRules = MembersSvc.getMemberAccessRules(user.memberId);
				$rootScope.currentSession.accessRules.$loaded().then(function(rules){
					rules.forEach(function(rule){
						$scope.groupsList.push(GroupsSvc.getGroupBasicDataObject(rule.groupId));
						$scope.selectedGroups.push(rule.groupId);
					});
					$scope.response = null;
				});
			});
		}});
	}
]);

/* Controller linked to /mycontacts
 * It will load all the Members that are part of the Groups the Current Member has Access to */
okulusApp.controller('UserMyContactsCntrl',
	['$rootScope','$scope','$location','$firebaseAuth','MembersSvc', 'GroupsSvc', 'AuthenticationSvc',
	function($rootScope,$scope,$location,$firebaseAuth, MembersSvc, GroupsSvc, AuthenticationSvc){

		/* Executed everytime we enter to /mycontacts
		  This function is used to confirm the user has an associated Member */
		$firebaseAuth().$onAuthStateChanged( function(authUser){if(authUser){
				$scope.response = {loading: true, message: systemMsgs.inProgress.loading };
				AuthenticationSvc.loadSessionData(authUser.uid).$loaded().then(function (user){
					if(!user.isValid){
						$rootScope.response = {error: true, message: systemMsgs.error.noMemberAssociated};
						$location.path(constants.pages.error);
						return;
					}

					/* Get the Member Rules*/
					$scope.membersList = [];
					$rootScope.currentSession.accessRules = MembersSvc.getMemberAccessRules(user.memberId);
					$rootScope.currentSession.accessRules.$loaded().then(function(rules){
						//Get members from each group
						rules.forEach(function(rule){
							let groupMembers = MembersSvc.getMembersForBaseGroup(rule.groupId);
							groupMembers.$loaded().then(function(members){
								members.forEach(function(member){$scope.membersList.push(member)});
							});
						});
						$scope.response = null;
					});

				});
		}});

}]);

//To redirect from Audit Table
okulusApp.controller('UserEditCntrl',
	['$rootScope','$routeParams','$scope','$location','$firebaseObject','$firebaseAuth',
		'AuthenticationSvc','MembersSvc', 'UsersSvc',
	function($rootScope,$routeParams,$scope,$location,$firebaseObject,$firebaseAuth,
					AuthenticationSvc,MembersSvc,UsersSvc){

		$firebaseAuth().$onAuthStateChanged( function(authUser){ if(authUser){
			$scope.response = {loading: true, message: systemMsgs.inProgress.loadingGroup };
			$scope.objectDetails = {};
			AuthenticationSvc.loadSessionData(authUser.uid).$loaded().then(function (user) {
				if(!user.isValid){
					$rootScope.response = { error:true, message: systemMsgs.error.noMemberAssociated};
					$location.path(constants.pages.error);
					return;
				}

				$scope.objectDetails.basicInfo = UsersSvc.getUserBasicDataObject($routeParams.userId);
				$scope.objectDetails.basicInfo.$loaded().then(function (user){
					if(!user || !user.email){
						$rootScope.response = {error: true, message: systemMsgs.error.recordDoesntExist };
						return;
					}

					$scope.objectDetails.audit = UsersSvc.getUserAuditObject(user.$id);
					if(user.memberId){
						console.log(user.memberId);
						$scope.objectDetails.member = MembersSvc.getMemberBasicDataObject(user.memberId);
					}else{
						//it might be root, or a brand new user that didnt find a member
						$scope.objectDetails.member = (user.isRoot)?{shortname: constants.roles.rootName }:{shortname: constants.roles.userDefaultName};
					}
				});

			});
		}});

}]);

okulusApp.factory('UsersSvc',
	['$rootScope', '$firebaseArray', '$firebaseObject','AuditSvc',
	function($rootScope, $firebaseArray, $firebaseObject, AuditSvc){
		let usersRef = firebase.database().ref().child(constants.db.folders.root).child(constants.db.folders.usersList);
		let usersDetailsRef = firebase.database().ref().child(constants.db.folders.root).child(constants.db.folders.usersDetails);
		let validUsersRef = usersRef.orderByChild("isValid").equalTo(true);

		return {
			/* Valid Users are the ones with a MemberId associated. Currently used to initiate a chat */
			loadValidUsersList: function(){
				if(!$rootScope.allValidUsersList){
					$rootScope.allValidUsersList = $firebaseArray(validUsersRef);
				}
				return $rootScope.allValidUsersList;
			},
			/* Get basic info from firebase and return as object */
			getUserBasicDataObject: function(whichUserId){
				return $firebaseObject(usersRef.child(whichUserId));
			},
			/* Get audit from firebase and return as object */
			getUserAuditObject: function(whichUserId){
				return $firebaseObject(usersDetailsRef.child(whichUserId).child(constants.db.folders.audit));
			},
			/* Set the member Id and Member name in the User, to link them */
			updateMemberReferenceInUserObject: function(memberId, memberShortname, userObj){
				userObj.memberId = memberId;
				userObj.shortname = memberShortname;
				userObj.isValid = true; //A valid User is the one with a MemberId
				if(!memberId){
					userObj.isValid = false;
					//Force User role, in case it was admin
					userObj.type = constants.roles.user;
				}
				userObj.$save();
			},
			createUser: function(userId, userEmail, userType){
				let timestamp = firebase.database.ServerValue.TIMESTAMP;
				let record = {
					email: userEmail, type: userType,
					lastLoginOn: timestamp, lastActivityOn: timestamp,
					sessionStatus: constants.status.online
				};
				usersRef.child(userId).set(record);
			}
		};
	}
]);

okulusApp.controller('UserRequestsCntrl',
	['$rootScope','$scope','$location','$firebaseObject','$firebaseAuth',
		'AuthenticationSvc','MemberRequestsSvc', 'UsersSvc',
	function($rootScope,$scope,$location,$firebaseObject,$firebaseAuth,
					AuthenticationSvc,MemberRequestsSvc,UsersSvc){

		$firebaseAuth().$onAuthStateChanged( function(authUser){ if(authUser){
			$scope.response = {loading: true, message: systemMsgs.inProgress.loadingRequests };

			AuthenticationSvc.loadSessionData(authUser.uid).$loaded().then(function(user){
				if(!user.isValid){
					$rootScope.response = { error:true, message: systemMsgs.error.noMemberAssociated};
					$location.path(constants.pages.error);
					return;
				}
				$scope.requestsCounter = MemberRequestsSvc.getRequestCountsForUser(user.$id);
				$scope.requestsCounter.$loaded().then(function(){
					$scope.response = null;
				});
				let userid = $rootScope.currentSession.user.$id;
				$scope.requestsList = MemberRequestsSvc.getRequestsForUser(userid);
				$scope.requestsList.$loaded().then(function(list) {
					$scope.filteredRequestsList = list;
				});
			});

		}});

		$scope.filterRequestsByStauts = function(status){
			$scope.requestsList.$loaded().then(function(requestList){
				$scope.filteredRequestsList = new Array();
				requestList.forEach(function(request){
					if(request.status == status){
						$scope.filteredRequestsList.push(request);
					}
				});
			});
		};

}]);

okulusApp.factory('MemberRequestsSvc',
	['$rootScope', '$firebaseArray', '$firebaseObject',
	function($rootScope, $firebaseArray, $firebaseObject){
		let baseRef = firebase.database().ref().child(constants.db.folders.root);
		let memberRequestListRef = baseRef.child(constants.db.folders.memberRequestList);
		let globalRequestsCountsRef = baseRef.child(constants.db.folders.requestsCount);
		let usersListRef = baseRef.child(constants.db.folders.usersList);

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
			/** Methods for Member Request **/
			persistRequest: function(request){
				let ref = memberRequestListRef.push(request);
				return ref;
			},
			/* Get member basic info from firebase and return as object */
			getRequest: function(whichRequest){
				return $firebaseObject(memberRequestListRef.child(whichRequest));
			},
			/* Used when creating or updating a Member Request */
			increaseRequestsCount: function (userId) {
				let conunterRef = usersListRef.child(userId).child(constants.db.folders.requestedMembersCount);
				increaseCounter(conunterRef);
				let globalCountRef = baseRef.child(constants.db.folders.requestedMembersCount);
				increaseCounter(globalCountRef);
			},
			/* used after approving, rejecting, or canceling a request */
			decreaseRequestsCount: function (userId) {
				let conunterRef = usersListRef.child(userId).child(constants.db.folders.requestedMembersCount);
				decreaseCounter(conunterRef);
				let globalCountRef = baseRef.child(constants.db.folders.requestedMembersCount);
				decreaseCounter(globalCountRef);
			},
			/* Used when approving a Member Request */
			increaseApprovedRequestsCount: function (userId) {
				let conunterRef = usersListRef.child(userId).child(constants.db.folders.approvedMembersCount);
				increaseCounter(conunterRef);
				let globalCountRef = baseRef.child(constants.db.folders.approvedMembersCount);
				increaseCounter(globalCountRef);
			},
			/* Used when approving, updating or canceling a Member Request that was in rejected status.
			Decrease the number of Rejected Member Request in the Requestor's (User) counters */
			decreaseRejectedRequestsCount: function (userId) {
				let conunterRef = usersListRef.child(userId).child(constants.db.folders.rejectedMembersCount);
				decreaseCounter(conunterRef);
				let globalCountRef = baseRef.child(constants.db.folders.rejectedMembersCount);
				decreaseCounter(globalCountRef);
			},
			/* Used when rejecting a Member Request */
			increaseRejectedRequestsCount: function (userId) {
				let conunterRef = usersListRef.child(userId).child(constants.db.folders.rejectedMembersCount);
				increaseCounter(conunterRef);
				let globalCountRef = baseRef.child(constants.db.folders.rejectedMembersCount);
				increaseCounter(globalCountRef);
			},
			/* Used when canceling a Member Request */
			increaseCanceledRequestsCount: function (userId) {
				let conunterRef = usersListRef.child(userId).child(constants.db.folders.canceledMembersCount);
				increaseCounter(conunterRef);
				let globalCountRef = baseRef.child(constants.db.folders.canceledMembersCount);
				increaseCounter(globalCountRef);
			},
			getRequestCountsForUser: function (userId) {
				return $firebaseObject(usersListRef.child(userId).child(constants.db.folders.requestsCount));
			},
			getRequestsForUser: function (userId) {
				return $firebaseArray(memberRequestListRef.orderByChild(constants.db.fields.auditCreatedById).equalTo(userId));
			}
		};

}]);
