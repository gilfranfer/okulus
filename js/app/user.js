/* Controller linked to /myreports
 * It will load the lists (weeks, groups, member rules) required for the view to work */
okulusApp.controller('UserMyReportsCntrl', ['MembersSvc','GroupsSvc', 'WeeksSvc', '$rootScope','$firebaseAuth','AuthenticationSvc',
	function(MembersSvc, GroupsSvc, WeeksSvc, $rootScope,$firebaseAuth,AuthenticationSvc){
		$firebaseAuth().$onAuthStateChanged( function(authUser){
    	if(authUser){
				AuthenticationSvc.loadSessionData(authUser.uid).$loaded().then(function (obj) {
					let whichMember = $rootScope.currentSession.user.memberId;
					$rootScope.weeksList = WeeksSvc.loadAllWeeks();
					$rootScope.groupsList = MembersSvc.getMemberGroups(whichMember);
				});
			}
		});
	}
]);

/* Controller linked to /mygroups
 * It will load the Groups the Current Member has Access to */
okulusApp.controller('UserMyGroupsCntrl', ['MembersSvc', 'WeeksSvc', '$rootScope','$firebaseAuth','AuthenticationSvc',
	function(MembersSvc, WeeksSvc, $rootScope,$firebaseAuth,AuthenticationSvc){
		$firebaseAuth().$onAuthStateChanged( function(authUser){
    	if(authUser){
				AuthenticationSvc.loadSessionData(authUser.uid).$loaded().then(function (obj) {
					let whichMember = $rootScope.currentSession.user.memberId;
					$rootScope.groupsList = MembersSvc.getMemberGroups(whichMember);
				});
			}
		});
	}
]);
