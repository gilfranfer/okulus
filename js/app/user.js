/* Controller linked to /myreports
 * It will load the lists (weeks, groups, member rules) required for the view to work */
okulusApp.controller('UserMyReportsCntrl', ['MembersSvc', 'GroupsSvc', 'WeeksSvc', '$location', '$rootScope','$scope','$firebaseAuth','AuthenticationSvc',
	function(MembersSvc, GroupsSvc, WeeksSvc,$location, $rootScope,$scope,$firebaseAuth,AuthenticationSvc){
		$scope.loadingReportSelector = true;
		$firebaseAuth().$onAuthStateChanged( function(authUser){
    	if(authUser){
				AuthenticationSvc.loadSessionData(authUser.uid).$loaded().then(function (user) {
					if(!user.memberId){
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
					if(!user.memberId){
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
okulusApp.controller('UserEditCntrl', ['$rootScope','$routeParams','$scope','$location','$firebaseObject','$firebaseAuth',
																				'AuthenticationSvc','MembersSvc',
	function($rootScope,$routeParams,$scope,$location,$firebaseObject, $firebaseAuth,AuthenticationSvc,MembersSvc){
		$firebaseAuth().$onAuthStateChanged( function(authUser){ if(authUser){
			AuthenticationSvc.loadSessionData(authUser.uid).$loaded().then(function (user) {
				if(!user.memberId){
					$rootScope.response = { error:true, message: systemMsgs.error.noMemberAssociated};
					$location.path(constants.pages.error);
					return;
				}

				$scope.objectDetails = {};
				
				let usersFolder = firebase.database().ref().child(rootFolder).child('users');
				$scope.userDetails = $firebaseObject(usersFolder.child($routeParams.userId));
				$scope.userDetails.$loaded().then(function (user){
					if(user && user.memberId){
						$scope.objectDetails.audit = user.audit;
						$scope.userMemberDetails =  MembersSvc.getMemberBasicDataObject(user.memberId);
					}else{
						if(user && user.isRoot){
							$scope.userMemberDetails =  {shortname:"Super Admin"};
						}
					}
				});
			});
		}});
}]);

okulusApp.factory('UsersSvc',
	['$rootScope', '$firebaseArray', '$firebaseObject','AuditSvc',
	function($rootScope, $firebaseArray, $firebaseObject, AuditSvc){
		let usersRef = firebase.database().ref().child(rootFolder).child(constants.folders.users);
		let validUsersRef = usersRef.orderByChild("isValid").equalTo(true);

		return {
			/*Valid Users are the ones with a MemberId associated*/
			loadValidUsersList: function(){
				if(!$rootScope.allValidUsersList){
					$rootScope.allValidUsersList = $firebaseArray(validUsersRef);
				}
				return $rootScope.allValidUsersList;
			},
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
				let record = {
					email: userEmail, type: userType,
					lastLoginOn: firebase.database.ServerValue.TIMESTAMP,
					lastActivityOn: firebase.database.ServerValue.TIMESTAMP,
					sessionStatus: "online"
				};
				usersRef.child(userId).set(record);
			}
		};
	}
]);
