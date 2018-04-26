/* Controller linked to /myreports
 * It will load the lists (weeks, groups, member rules) required for the view to work */
okulusApp.controller('UserMyReportsCntrl', ['MembersSvc', 'GroupsSvc', 'WeeksSvc', '$location', '$rootScope','$scope','$firebaseAuth','AuthenticationSvc',
	function(MembersSvc, GroupsSvc, WeeksSvc,$location, $rootScope,$scope,$firebaseAuth,AuthenticationSvc){
		$firebaseAuth().$onAuthStateChanged( function(authUser){
    	if(authUser){
				AuthenticationSvc.loadSessionData(authUser.uid).$loaded().then(function (user) {
					if(!user.memberId){
						$location.path("/error/nomember");
						return;
					}
					$scope.weeksList = WeeksSvc.loadAllWeeks();
					//Get the Groups the user has access to
					GroupsSvc.loadAllGroupsList().$loaded().then( function(allGroups){
						return MembersSvc.getMemberAccessRules(user.memberId).$loaded();
					}).then(function (memberRules) {
						let filteredGroups = MembersSvc.filterMemberGroupsFromRules(memberRules, $rootScope.allGroups);
						$scope.groupsList = filteredGroups;
					});
					// MembersSvc.getMemberGroups(user.memberId);
				});
			}
		});
	}
]);

/* Controller linked to /mygroups
 * It will load the Groups the Current Member has Access to */
okulusApp.controller('UserMyGroupsCntrl', ['MembersSvc','GroupsSvc', '$rootScope','$scope', '$location','$firebaseAuth','AuthenticationSvc',
	function(MembersSvc, GroupsSvc, $rootScope,$scope,$location,$firebaseAuth,AuthenticationSvc){
		$firebaseAuth().$onAuthStateChanged( function(authUser){
    	if(authUser){
				$scope.loadingGroups = true;
				AuthenticationSvc.loadSessionData(authUser.uid).$loaded().then(function (user) {
					if(!user.memberId){
						$location.path("/error/nomember");
						return;
					}

					//Get the Groups the user has access to
					GroupsSvc.loadAllGroupsList().$loaded().then( function(allGroups){
						return MembersSvc.getMemberAccessRules(user.memberId).$loaded();
					}).then(function (memberRules) {
						let filteredGroups = MembersSvc.filterMemberGroupsFromRules(memberRules, $rootScope.allGroups);
						$scope.groupsList = filteredGroups;
						$scope.loadingGroups = false;
						if(!filteredGroups.length){
							$scope.response = {noGroupsFound:true};
						}
					});

				});
			}
		});
	}
]);

okulusApp.controller('UserMyContactsCntrl', ['MembersSvc', 'GroupsSvc', '$rootScope','$scope','$location','$firebaseAuth','AuthenticationSvc',
	function(MembersSvc, GroupsSvc, $rootScope,$scope,$location,$firebaseAuth,AuthenticationSvc){
		$firebaseAuth().$onAuthStateChanged( function(authUser){
    	if(authUser){
				AuthenticationSvc.loadSessionData(authUser.uid).$loaded().then(function (user) {
					if(!user.memberId){
						$location.path("/error/nomember");
						return;
					}
					//Get the Members that are in the same group the user has access to
					GroupsSvc.loadAllGroupsList().$loaded().then( function(allGroups){
						return MembersSvc.getMemberAccessRules(user.memberId).$loaded();
					}).then(function (memberRules) {
						let filteredGroups = MembersSvc.filterMemberGroupsFromRules(memberRules, $rootScope.allGroups);
						return MembersSvc.getMembersInGroups(filteredGroups)
					}).then(function(contacts){
						$scope.membersList = contacts;
					});

					// MembersSvc.getMemberGroups(user.memberId).then(function(groups){
					// 	return MembersSvc.getMembersInGroups(groups)
					// }).then(function(contacts){
					// 	$scope.membersList = contacts;
					// });
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
					$location.path("/error/nomember");
					return;
				}
				let usersFolder = firebase.database().ref().child(rootFolder).child('users');
				$scope.userDetails = $firebaseObject(usersFolder.child($routeParams.userId));
				$scope.userDetails.$loaded().then(function (user){
					if(user && user.memberId){
						$scope.audit = user.audit;
						$scope.userMemberDetails =  MembersSvc.getMember(user.memberId);
					}else{
						if(user && !user.memberId){
							$scope.userMemberDetails =  {member:{shortname:"Super Admin"}};
						}
					}
				});
			});
		}});
}]);
