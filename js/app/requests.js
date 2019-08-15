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

				let userid = $rootScope.currentSession.user.$id;
				$scope.requestsList = MemberRequestsSvc.getRequestsForUser(userid);
				$scope.requestsList.$loaded().then(function(list) {
					$scope.filteredRequestsList = list;
					$scope.response = null;
				});
			});

		}});

		$scope.filterRequestsByStatus = function(status){
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

/* Controlling the view where the admin can see the requests raised by the users.*/
okulusApp.controller('AdminRequestsCntrl',
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
        if(user.type == constants.roles.admin){
					/* Get All Pending Requests */
          $scope.getRequests(constants.status.requested);
				}else{
					$rootScope.response = {error:true, showHomeButton: true,
																	message:systemMsgs.error.noPrivileges};
					$location.path(constants.pages.error);
				}
			});

		}});

    $scope.getRequests = function(status){
      $scope.filteredRequestsList = undefined;
      $scope.filteredRequestsList = MemberRequestsSvc.getRequestsInSatus(status);
      $scope.filteredRequestsList.$loaded().then(function(){
        $scope.response = null;
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
			},
			getRequestsInSatus: function (status) {
				return $firebaseArray(memberRequestListRef.orderByChild(constants.db.fields.status).equalTo(status));
			}
		};

}]);
