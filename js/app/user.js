/* Controller linked to /myreports
 * It will load the lists (weeks, groups, member rules) required for the view to work */
okulusApp.controller('UserMyReportsCntrl', ['MembersSvc', 'WeeksSvc', '$location', '$rootScope','$scope','$firebaseAuth','AuthenticationSvc',
	function(MembersSvc, WeeksSvc,$location, $rootScope,$scope,$firebaseAuth,AuthenticationSvc){
		$firebaseAuth().$onAuthStateChanged( function(authUser){
    	if(authUser){
				AuthenticationSvc.loadSessionData(authUser.uid).$loaded().then(function (user) {
					if(!user.memberId){
						$location.path("/error/nomember");
						return;
					}
					$scope.weeksList = WeeksSvc.loadAllWeeks();
					MembersSvc.getMemberGroups(user.memberId);
				});
			}
		});
	}
]);

/* Controller linked to /mygroups
 * It will load the Groups the Current Member has Access to */
okulusApp.controller('UserMyGroupsCntrl', ['MembersSvc', '$rootScope','$scope', '$location','$firebaseAuth','AuthenticationSvc',
	function(MembersSvc, $rootScope,$scope,$location,$firebaseAuth,AuthenticationSvc){
		$firebaseAuth().$onAuthStateChanged( function(authUser){
    	if(authUser){
				AuthenticationSvc.loadSessionData(authUser.uid).$loaded().then(function (user) {
					if(!user.memberId){
						$location.path("/error/nomember");
						return;
					}
					MembersSvc.getMemberGroups(user.memberId);
				});
			}
		});
	}
]);

okulusApp.controller('UserMyContactsCntrl', ['MembersSvc', '$rootScope','$scope','$location','$firebaseAuth','AuthenticationSvc',
	function(MembersSvc, $rootScope,$scope,$location,$firebaseAuth,AuthenticationSvc){
		$firebaseAuth().$onAuthStateChanged( function(authUser){
    	if(authUser){
				AuthenticationSvc.loadSessionData(authUser.uid).$loaded().then(function (user) {
					if(!user.memberId){
						$location.path("/error/nomember");
						return;
					}
					MembersSvc.getMemberGroups(user.memberId).then(function(groups){
						return MembersSvc.getMembersInGroups(groups)
					}).then(function(contacts){
						$scope.membersList = contacts;
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
