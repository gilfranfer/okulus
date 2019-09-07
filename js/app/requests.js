okulusApp.controller('MyRequestsCntrl',
	['$rootScope','$scope','$location','$firebaseAuth',
		'AuthenticationSvc','MemberRequestsSvc',
	function($rootScope,$scope,$location,$firebaseAuth,
					AuthenticationSvc, MemberRequestsSvc){

		$scope.response = {loading: true, message: systemMsgs.inProgress.loading };
		$firebaseAuth().$onAuthStateChanged(function(authUser){if(authUser){
			AuthenticationSvc.loadSessionData(authUser.uid).$loaded().then(function(user){
				if(!user.memberId){
					$rootScope.response = { error:true, message: systemMsgs.error.noMemberAssociated};
					$location.path(constants.pages.error);
					return;
				}
				/*Pre-load all the User's Requests*/
				$scope.myRequestsList = MemberRequestsSvc.getRequestsForUser(user.$id);
				$scope.myRequestsList.$loaded().then(function(requests) {
					$scope.filteredRequestsList = requests;
					$scope.response = undefined;
				});
			});

		}});

		$scope.filterRequestsByStatus = function(status){
			$scope.myRequestsList.$loaded().then(function(requestList){
				$scope.filteredRequestsList = new Array();
				if(!status){
					$scope.filteredRequestsList = $scope.myRequestsList;
				}
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
			$scope.response = {loading: true, message: systemMsgs.inProgress.loading };

			AuthenticationSvc.loadSessionData(authUser.uid).$loaded().then(function(user){
				if(user.type == constants.roles.user){
					$rootScope.response = { error:true, message: systemMsgs.error.noPrivileges};
					$location.path(constants.pages.error);
					return;
				}else{
					$scope.getRequests(constants.status.pending);
				}
			});

		}});

    $scope.getRequests = function(status){
			$scope.response = {loading: true, message: systemMsgs.inProgress.loading };
      $scope.filteredRequestsList = undefined;
      $scope.filteredRequestsList = MemberRequestsSvc.getRequestsInSatus(status);
      $scope.filteredRequestsList.$loaded().then(function(list){
        if(!list.length){
					$scope.response = { error: true, message: systemMsgs.error.noMemberRequestsFound };
				}
      });
		};

}]);

okulusApp.factory('MemberRequestsSvc',
	['$rootScope', '$firebaseArray', '$firebaseObject',
	function($rootScope, $firebaseArray, $firebaseObject){
		let baseRef = firebase.database().ref().child(constants.db.folders.root);
		let memberRequestListRef = baseRef.child(constants.db.folders.memberRequestList);
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
			/* Used when creating a Member Request */
			increaseTotalRequestsCount: function (userId) {
				let counterRef = usersListRef.child(userId).child(constants.db.folders.totalMemberRequestsCount);
				increaseCounter(counterRef);
				let globalCountRef = baseRef.child(constants.db.folders.totalMemberRequestsCount);
				increaseCounter(globalCountRef);
			},
			/* Used when creating or updating a Member Request */
			increasePendingRequestsCount: function (userId) {
				let counterRef = usersListRef.child(userId).child(constants.db.folders.pendingMemberRequestsCount);
				increaseCounter(counterRef);
				let globalCountRef = baseRef.child(constants.db.folders.pendingMemberRequestsCount);
				increaseCounter(globalCountRef);
			},
			/* used after approving, rejecting, or canceling a request */
			decreasePendingRequestsCount: function (userId) {
				let counterRef = usersListRef.child(userId).child(constants.db.folders.pendingMemberRequestsCount);
				decreaseCounter(counterRef);
				let globalCountRef = baseRef.child(constants.db.folders.pendingMemberRequestsCount);
				decreaseCounter(globalCountRef);
			},
			/* Used when approving a Member Request */
			increaseApprovedRequestsCount: function (userId) {
				let counterRef = usersListRef.child(userId).child(constants.db.folders.approvedMemberRequestsCount);
				increaseCounter(counterRef);
				let globalCountRef = baseRef.child(constants.db.folders.approvedMemberRequestsCount);
				increaseCounter(globalCountRef);
			},
			/* Used when approving, updating or canceling a Member Request that was in rejected status.
			Decrease the number of Rejected Member Request in the Requestor's (User) counters */
			decreaseRejectedRequestsCount: function (userId) {
				let counterRef = usersListRef.child(userId).child(constants.db.folders.rejectedMemberRequestsCount);
				decreaseCounter(counterRef);
				let globalCountRef = baseRef.child(constants.db.folders.rejectedMemberRequestsCount);
				decreaseCounter(globalCountRef);
			},
			/* Used when rejecting a Member Request */
			increaseRejectedRequestsCount: function (userId) {
				let counterRef = usersListRef.child(userId).child(constants.db.folders.rejectedMemberRequestsCount);
				increaseCounter(counterRef);
				let globalCountRef = baseRef.child(constants.db.folders.rejectedMemberRequestsCount);
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
