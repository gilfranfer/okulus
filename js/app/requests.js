/* Controlling the view where the admin can see the requests raised by the users.*/
okulusApp.controller('RequestsListCntrl',
	['$rootScope','$scope','$location','$firebaseObject','$firebaseAuth',
		'AuthenticationSvc','MemberRequestsSvc', 'UsersSvc',
	function($rootScope,$scope,$location,$firebaseObject,$firebaseAuth,
					AuthenticationSvc,MemberRequestsSvc,UsersSvc){

		$scope.response = {loading: true, message: systemMsgs.inProgress.loading };
		$firebaseAuth().$onAuthStateChanged( function(authUser){ if(authUser){
			AuthenticationSvc.loadSessionData(authUser.uid).$loaded().then(function(user){
				if(user.type != constants.roles.root && !user.memberId){
					$rootScope.response = {error: true, message: systemMsgs.error.noMemberAssociated};
					$location.path(constants.pages.error);
					return;
				}
				$scope.response = null;
			});

		}});

		/* ADMIN */
    $scope.loadPendingRequests = function(){
			$scope.getRequests($scope.adminRequestsParams.activeRequestsLoader, true);
		};

    $scope.getRequests = function(status, loadAll){
			$scope.response = {loading: true, message: systemMsgs.inProgress.loading };
      $scope.filteredRequestsList = undefined;

			let params = {activeRequestsLoader:status, searchFilter:undefined};
			if(status == constants.status.pending){
				params.title= systemMsgs.success.pendingRequestsTitle;
				params.maxPossible = $rootScope.globalCount.requests.members.pending;
			}else if(status == constants.status.approved){
				params.title= systemMsgs.success.approvedRequestsTitle;
				params.maxPossible = $rootScope.globalCount.requests.members.approved;
			}else if(status == constants.status.rejected){
				params.title= systemMsgs.success.rejectedRequestsTitle;
				params.maxPossible = $rootScope.globalCount.requests.members.rejected;
			}
			$scope.adminRequestsParams = params;

			if(loadAll){
				$scope.filteredRequestsList = MemberRequestsSvc.getRequestsInSatus(status);
			}else{
				$scope.filteredRequestsList = MemberRequestsSvc.getRequestsInSatus(status, $rootScope.config.maxQueryListResults);
			}

      $scope.filteredRequestsList.$loaded().then(function(list){
        if(!list.length){
					$scope.response = { error: true, message: systemMsgs.error.noMemberRequestsFound };
				}
				$scope.response = null;
      });

		};

		/* USER */
		$scope.loadPendingUserRequests = function(){
			$scope.getUserRequests($scope.myRequestsParams.activeRequestsLoader, true);
		};

		$scope.getUserRequests = function(status, loadAll){
			$scope.response = {loading: true, message: systemMsgs.inProgress.loading };
      $scope.filteredRequestsList = undefined;

			/* Request by status must be filtered from the whole User's requests */
			if(!$scope.allUserRequests){
				$scope.allUserRequests = MemberRequestsSvc.getRequestsForUser($rootScope.currentSession.user.$id);
			}

			/* Build params used in the view */
			let params = {activeRequestsLoader:status, searchFilter:undefined};
			if(status == constants.status.pending){
				params.title= systemMsgs.success.pendingRequestsTitle;
				params.maxPossible = $rootScope.currentSession.user.counters.requests.members.pending;
			}else if(status == constants.status.approved){
				params.title= systemMsgs.success.approvedRequestsTitle;
				params.maxPossible = $rootScope.currentSession.user.counters.requests.members.approved;
			}else if(status == constants.status.rejected){
				params.title= systemMsgs.success.rejectedRequestsTitle;
				params.maxPossible = $rootScope.currentSession.user.counters.requests.members.rejected;
			}else{
				params.title= systemMsgs.success.allRequestsTitle;
				params.maxPossible = $rootScope.currentSession.user.counters.requests.members.total;
			}
			$scope.myRequestsParams = params;

			/* Proceed to filter the User's requests by the passed status. If no status
			was passed is because the user want to see all requests, but we still need
			to filter, to controll the amoun of requests to return. */
			let maxResults = $rootScope.config.maxQueryListResults;
			$scope.allUserRequests.$loaded().then(function(requestList) {
				$scope.filteredRequestsList = new Array();
				requestList.forEach(function(request){
					if(request.status == status || !status){
						maxResults --;
						/* Limit the number of requests pushed to the Array */
						if(!loadAll && maxResults<0){return}
						$scope.filteredRequestsList.push(request);
					}
				});

				if(!$scope.filteredRequestsList.length){
					$scope.response = { error: true, message: systemMsgs.error.noMemberRequestsFound };
				}else{
					$scope.response = null;
				}
			});

		};

}]);

okulusApp.controller('RequestDetailsCntrl',
	['$rootScope', '$scope','$routeParams', '$location','$firebaseAuth',
		'MembersSvc','MemberRequestsSvc','GroupsSvc','ConfigSvc','AuditSvc','NotificationsSvc','AuthenticationSvc',
	function($rootScope, $scope, $routeParams, $location,$firebaseAuth,
		MembersSvc, MemberRequestsSvc, GroupsSvc, ConfigSvc, AuditSvc, NotificationsSvc, AuthenticationSvc){

		/* Init. Executed everytime we enter to /members/new,
		/members/view/:memberId or /members/edit/:memberId */
		$firebaseAuth().$onAuthStateChanged(function(authUser){ if(authUser){
			$scope.response = {loading: true, message: systemMsgs.inProgress.loading };
			AuthenticationSvc.loadSessionData(authUser.uid).$loaded().then(function (user) {
				/* Only Valid Users (with an associated MemberId) can see the content */
				if($rootScope.currentSession.user.type != constants.roles.root && !user.memberId){
					$rootScope.response = {error: true, showHomeButton:true, message: systemMsgs.error.noMemberAssociated};
					$location.path(constants.pages.error);
					return;
				}

				$scope.objectDetails = {};
				/* Edit Member Request */
				if($routeParams.requestId){
					$scope.objectDetails = MemberRequestsSvc.getRequest($routeParams.requestId);
					$scope.objectDetails.$loaded().then(function(request){
						if(request.$value === null){
							$rootScope.response = { error:true, message:systemMsgs.error.inexistingRequest};
							$location.path(constants.pages.error);
						}else{
							$scope.prepareRequestEditView(request);
						}
					});
				}
				/* New Member Request */
				else{
					$scope.prepareforNewRequest();
				}

				$scope.groupsList = new Array();
				//Get the Groups the user has access to
				MembersSvc.getAccessRulesList(user.memberId).$loaded().then(function(rules){
					rules.forEach(function(rule) {
						$scope.groupsList.push( GroupsSvc.getGroupBasicDataObject(rule.groupId) );
					});
				});

			});
		}});

		/* Called from Address fragment */
		$scope.updateStatesList = function() {
			$scope.statesList = ConfigSvc.getStatesForCountry($scope.objectDetails.address.country);
		};

		$scope.prepareforNewRequest = function (request) {
			$scope.requestParams = { isEdit: false };
			$scope.countriesList = ConfigSvc.getCountriesList();
			$scope.statesList = ConfigSvc.getStatesForCountry($rootScope.config.location.country);
			$scope.objectDetails.address = { city:$rootScope.config.location.city, state: $rootScope.config.location.state, country: $rootScope.config.location.country};
			$scope.objectDetails.basicInfo = {};
			$scope.response = null;
		};

		$scope.prepareRequestEditView = function (request) {
			$scope.requestParams = { isEdit: true, requestId: request.$id	};
			$scope.countriesList = ConfigSvc.getCountriesList();
			$scope.objectDetails.audit = request.audit;

			if(!request.address){
				/* Set Default location from config.location */
				$scope.statesList = ConfigSvc.getStatesForCountry($rootScope.config.location.country);
				$scope.objectDetails.address = { city:$rootScope.config.location.city, state: $rootScope.config.location.state, country: $rootScope.config.location.country};
			}else{
				$scope.statesList = ConfigSvc.getStatesForCountry(request.address.country);
			}
			$scope.response = null;
		};

		/* Create a new address Object in scope so we can populate it's values from view */
		$scope.addAdressInRequest = function(){
			$scope.statesList = ConfigSvc.getStatesForCountry($rootScope.config.location.country);
			$scope.objectDetails.address = { city:$rootScope.config.location.city, state: $rootScope.config.location.state, country: $rootScope.config.location.country};
		};

		/*Remove the address Object from scope, and from DB*/
		$scope.removeAdressInRequest = function(){
			$scope.objectDetails.address = null;
		};

		/* Called when change detected on bday input*/
		updateBdayValue = function(){
			let birthdate = document.getElementById("bday").value;
			$scope.objectDetails.basicInfo.bday = birthdate;
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
				audit: {
					createdById:$rootScope.currentSession.user.$id,
					createdByEmail:$rootScope.currentSession.user.email,
					createdByName:$rootScope.currentSession.user.shortname,
					createdOn: firebase.database.ServerValue.TIMESTAMP }
			};

			if($scope.objectDetails.address){
					request.address = $scope.objectDetails.address;
			}

			let createdById = $rootScope.currentSession.user.$id;
			let requestRef = MemberRequestsSvc.persistRequest(request);
			$scope.response = { success:true, message: systemMsgs.success.requestCreated };
			MemberRequestsSvc.getRequest(requestRef.key).$loaded().then(function(){
				MemberRequestsSvc.increaseTotalRequestsCount(createdById);
				MemberRequestsSvc.increasePendingRequestsCount(createdById);
				let description = systemMsgs.notifications.memberRequested;
				AuditSvc.saveAuditAndNotify(constants.actions.create, constants.db.folders.memberRequest, requestRef.key, description);
				$location.path(constants.pages.editMemberRequest+requestRef.key);
			});
		};

		/* A request can be updated by the creator, if not approved. After an update,
		the request status always goes to "Pending", even if it was "Rejected". */
		$scope.updateRequest = function(){
			$scope.response = { working:true, message: systemMsgs.inProgress.updatingRequest };
			let isApproved = ($scope.objectDetails.status == constants.status.approved);
			let isRejected = ($scope.objectDetails.status == constants.status.rejected);
			if(isApproved){
				$scope.response = { error:true, message: systemMsgs.error.updateReqFailed };
				return;
			}

			$scope.objectDetails.status = constants.status.pending;
			$scope.objectDetails.audit.lastUpdateByName = $rootScope.currentSession.user.shortname;
			$scope.objectDetails.audit.lastUpdateByEmail = $rootScope.currentSession.user.email;
			$scope.objectDetails.audit.lastUpdateById = $rootScope.currentSession.user.$id;
			$scope.objectDetails.audit.lastUpdateOn = firebase.database.ServerValue.TIMESTAMP;
			$scope.objectDetails.$save().then(function(data) {
				if(isRejected){
					MemberRequestsSvc.decreaseRejectedRequestsCount($scope.objectDetails.audit.createdById);
					MemberRequestsSvc.increasePendingRequestsCount($scope.objectDetails.audit.createdById);
				}
				let description = systemMsgs.notifications.memberRequestedUpdated;
				AuditSvc.saveAuditAndNotify(constants.actions.update, constants.db.folders.memberRequest, data.key, description);
				$scope.response = { success:true, message: systemMsgs.success.requestUpdated };
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
			if(!isPending){
				$scope.response = { error:true, message: systemMsgs.error.approvedReqFailed };
				return;
			}

			GroupsSvc.getGroupBasicDataObject($scope.objectDetails.basicInfo.baseGroupId).$loaded().then(
				function(group) {
					$scope.objectDetails.basicInfo.baseGroupName = group.name;
					let newmemberRef = MembersSvc.persistMember($scope.objectDetails.basicInfo);
					$scope.objectDetails.status = constants.status.approved;
					$scope.objectDetails.audit.lastUpdateByName = $rootScope.currentSession.user.shortname;
					$scope.objectDetails.audit.lastUpdateByEmail = $rootScope.currentSession.user.email;
					$scope.objectDetails.audit.lastUpdateById = $rootScope.currentSession.user.$id;
					$scope.objectDetails.audit.lastUpdateOn = firebase.database.ServerValue.TIMESTAMP;
					$scope.objectDetails.$save().then(function(){
						MemberRequestsSvc.increaseApprovedRequestsCount($scope.objectDetails.audit.createdById);
						MemberRequestsSvc.decreasePendingRequestsCount($scope.objectDetails.audit.createdById);
					});

					//Get the recently created Member
					MembersSvc.getMemberBasicDataObject(newmemberRef.key).$loaded().then(function(memberData) {
						MembersSvc.increaseTotalMembersCount();
						MembersSvc.increaseActiveMembersCount();
						MembersSvc.persistMemberAudit(memberData.$id,$scope.objectDetails.audit);
						if($scope.objectDetails.address){
							MembersSvc.persistMemberAddress(memberData.$id,$scope.objectDetails.address);
						}

						let description = systemMsgs.notifications.memberRequestApproved;
						AuditSvc.saveAuditAndNotify(constants.actions.approve, constants.db.folders.memberRequest, $scope.objectDetails.$id, description);
						$rootScope.memberResponse = { created:true, message: systemMsgs.success.memberCreatedFromRequest };
						//Redirect to the created member
						$location.path(constants.pages.memberEdit+newmemberRef.key);
					});
				}
			);

		};

		/* Rejection can be given only to requests on 'pending' status.
		When rejecting the request, change the status to "rejected", set the Approver's
		data as the last one updating the request. Additionally increase the number of rejected
		requests for the Creator. */
		$scope.rejectRequest = function(){
			$scope.response = { working:true, message: systemMsgs.inProgress.rejectingRequest };
			let isPending = ($scope.objectDetails.status == constants.status.pending);
			if(!isPending){
				$scope.response = { error:true, message: systemMsgs.error.rejectReqFailed };
				return;
			}

			$scope.objectDetails.status = constants.status.rejected;
			$scope.objectDetails.audit.lastUpdateByName = $rootScope.currentSession.user.shortname;
			$scope.objectDetails.audit.lastUpdateByEmail = $rootScope.currentSession.user.email;
			$scope.objectDetails.audit.lastUpdateById = $rootScope.currentSession.user.$id;
			$scope.objectDetails.audit.lastUpdateOn = firebase.database.ServerValue.TIMESTAMP;
			$scope.objectDetails.$save().then(function(){
				MemberRequestsSvc.decreasePendingRequestsCount($scope.objectDetails.audit.createdById);
				MemberRequestsSvc.increaseRejectedRequestsCount($scope.objectDetails.audit.createdById);
				let description = systemMsgs.notifications.memberRequestRejected;
				AuditSvc.saveAuditAndNotify(constants.actions.reject, constants.db.folders.memberRequest, $scope.objectDetails.$id, description);
				$scope.response = { error:true, message: systemMsgs.success.requestRejected };
			});
		};

		/* Cancelation can happen only when request is on 'pending' or 'rejected' status.
		Request with status different that Approved, can be cancelled by the the requestor.
		Update the status to "canceled", set the Requestor's data as the last one updating the request.
		Additionally increase the number of canceled requests, and reduce rejected (if applicable). */
		$scope.deleteRequest = function(){
			$scope.response = { working:true, message: systemMsgs.inProgress.cancellingRequest };
			let isRejected = ($scope.objectDetails.status == constants.status.rejected);
			let isPending = ($scope.objectDetails.status == constants.status.pending);
			let isApproved = ($scope.objectDetails.status == constants.status.approved);
			if(isApproved){
				$scope.response = { error:true, message: systemMsgs.error.deleteReqFailed };
				return;
			}

			let description = systemMsgs.notifications.memberRequestDeleted;
			let auditObj = $scope.objectDetails.audit;
			NotificationsSvc.notifyInvolvedParties(constants.actions.delete, constants.db.folders.memberRequest, $scope.objectDetails.$id, description, auditObj);
			MemberRequestsSvc.decreaseTotalRequestsCount(auditObj.createdById);
			if(isRejected){
				MemberRequestsSvc.decreaseRejectedRequestsCount(auditObj.createdById);
			}else if(isPending){
				MemberRequestsSvc.decreasePendingRequestsCount(auditObj.createdById);
			}

			$scope.objectDetails.$remove().then(function(ref){
				MemberRequestsSvc.removeRequestDetails(ref.key)
				$rootScope.requestResponse = { error:true, message: systemMsgs.success.requestDeleted };
				$location.path(constants.pages.myRequests);
			});
		};

}]);

okulusApp.factory('MemberRequestsSvc',
	['$rootScope', '$firebaseArray', '$firebaseObject',
	function($rootScope, $firebaseArray, $firebaseObject){
		let baseRef = firebase.database().ref().child(constants.db.folders.root);
		let memberRequestListRef = baseRef.child(constants.db.folders.memberRequestList);
		let memberRequestDetailsRef = baseRef.child(constants.db.folders.memberRequestDetails);
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
			removeRequestDetails: function(whichRequest){
				return memberRequestDetailsRef.child(whichRequest).set(null);
			},
			/* Used when creating a Member Request */
			increaseTotalRequestsCount: function (userId) {
				let counterRef = usersListRef.child(userId).child(constants.db.folders.totalMemberRequestsCount);
				increaseCounter(counterRef);
				let globalCountRef = baseRef.child(constants.db.folders.totalMemberRequestsCount);
				increaseCounter(globalCountRef);
			},
			decreaseTotalRequestsCount: function (userId) {
				let counterRef = usersListRef.child(userId).child(constants.db.folders.totalMemberRequestsCount);
				decreaseCounter(counterRef);
				let globalCountRef = baseRef.child(constants.db.folders.totalMemberRequestsCount);
				decreaseCounter(globalCountRef);
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
			getRequestsInSatus: function (status, limit) {
				let reference = memberRequestListRef.orderByChild(constants.db.fields.status).equalTo(status);
				if(limit){
					return $firebaseArray(reference.limitToLast(limit));
				}else{
					return $firebaseArray(reference);
				}
			}
		};

}]);
