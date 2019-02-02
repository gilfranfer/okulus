/* Controller linked to /myreports
 * It will load the lists (weeks, groups, member rules) required for the view to work */
okulusApp.controller('UserMyReportsCntrl', ['MembersSvc', 'GroupsSvc', 'WeeksSvc', '$location', '$rootScope','$scope','$firebaseAuth','AuthenticationSvc',
	function(MembersSvc, GroupsSvc, WeeksSvc,$location, $rootScope,$scope,$firebaseAuth,AuthenticationSvc){
		$scope.loadingReportSelector = true;
		$firebaseAuth().$onAuthStateChanged( function(authUser){
    	if(authUser){
				AuthenticationSvc.loadSessionData(authUser.uid).$loaded().then(function (user) {
					if(!user.isValid){
						$rootScope.response = { error:true, message: systemMsgs.error.noMemberAssociated};
						$location.path(constants.pages.error);
						return;
					}
					$scope.weeksList = WeeksSvc.loadVisibleWeeks();
					//Get the Groups the user has access to
					GroupsSvc.getAllGroups().$loaded().then( function(allGroups){
						return MembersSvc.getMemberAccessRules(user.memberId).$loaded();
					}).then(function (memberRules) {
						let filteredGroups = MembersSvc.filterMemberGroupsFromRules(memberRules, $rootScope.allGroups);
						$scope.groupsList = filteredGroups;
						$scope.loadingReportSelector = false;
					});
					// MembersSvc.getMemberGroups(user.memberId);
				});
			}
		});
	}
]);

/* Controller linked to /mycontacts
 * It will load all the Members that are part of the Groups the Current Member has Access to */
okulusApp.controller('UserMyContactsCntrl',
	['$rootScope','$scope','$location','$firebaseAuth','MembersSvc', 'GroupsSvc', 'AuthenticationSvc',
	function($rootScope,$scope,$location,$firebaseAuth, MembersSvc, GroupsSvc, AuthenticationSvc){
		$scope.response = {loading: true, message: systemMsgs.inProgress.loading };

		/* Executed everytime we enter to /mycontacts
		  This function is used to confirm the user has an associated Member */
		$firebaseAuth().$onAuthStateChanged( function(authUser){
    	if(authUser){
				AuthenticationSvc.loadSessionData(authUser.uid).$loaded().then(function (user){
					if(!user.isValid){
						$rootScope.response = {error: true, message: systemMsgs.error.noMemberAssociated};
						$location.path(constants.pages.error);
						return;
					}

					//TODO: Update this to a less data consuming approach
					//Get the Members that are in the same group the user has access to
					GroupsSvc.getAllGroups().$loaded().then( function(allGroups){
						return MembersSvc.getMemberAccessRules(user.memberId).$loaded();
					}).then(function (memberRules) {
						let filteredGroups = MembersSvc.filterMemberGroupsFromRules(memberRules, $rootScope.allGroups);
						return MembersSvc.getMembersInGroups(filteredGroups)
					}).then(function(contacts){
						$scope.membersList = contacts;
						$scope.loadingMembers = false;
						if(!$scope.membersList.length){
							$scope.response = {noMembersFound:true};
						}
					});

				});
			}
		});
	}
]);

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
		let usersRef = firebase.database().ref().child(rootFolder).child(constants.folders.usersList);
		let usersDetailsRef = firebase.database().ref().child(rootFolder).child(constants.folders.usersDetails);
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
				return $firebaseObject(usersDetailsRef.child(whichUserId).child(constants.folders.audit));
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
