/* Controller linked to /myreports
 * It will load the lists (weeks, groups, member rules) required for the view to work */
okulusApp.controller('UserMyReportsCntrl', ['MembersSvc','GroupsSvc', 'WeeksSvc', '$rootScope','$scope','$firebaseAuth','AuthenticationSvc',
	function(MembersSvc, GroupsSvc, WeeksSvc, $rootScope,$scope,$firebaseAuth,AuthenticationSvc){
		$firebaseAuth().$onAuthStateChanged( function(authUser){
    	if(authUser){
				AuthenticationSvc.loadSessionData(authUser.uid).$loaded().then(function (obj) {
					let whichMember = $rootScope.currentSession.user.memberId;
					$scope.weeksList = WeeksSvc.loadAllWeeks();
					MembersSvc.getMemberGroups(whichMember);
				});
			}
		});
	}
]);

/* Controller linked to /mygroups
 * It will load the Groups the Current Member has Access to */
okulusApp.controller('UserMyGroupsCntrl', ['MembersSvc', 'WeeksSvc', '$rootScope','$scope','$firebaseAuth','AuthenticationSvc',
	function(MembersSvc, WeeksSvc, $rootScope,$scope,$firebaseAuth,AuthenticationSvc){
		$firebaseAuth().$onAuthStateChanged( function(authUser){
    	if(authUser){
				AuthenticationSvc.loadSessionData(authUser.uid).$loaded().then(function (obj) {
					let whichMember = $rootScope.currentSession.user.memberId;
					MembersSvc.getMemberGroups(whichMember);
				});
			}
		});
	}
]);

okulusApp.controller('UserMyContactsCntrl', ['MembersSvc', '$rootScope','$scope','$firebaseAuth','AuthenticationSvc',
	function(MembersSvc, $rootScope,$scope,$firebaseAuth,AuthenticationSvc){
		$firebaseAuth().$onAuthStateChanged( function(authUser){
    	if(authUser){
				AuthenticationSvc.loadSessionData(authUser.uid).$loaded().then(function (obj) {
					let whichMember = $rootScope.currentSession.user.memberId;
					MembersSvc.getMemberContacts(whichMember);
				});
			}
		});
	}
]);

//To redirect from Audit Table
okulusApp.controller('UserEditCntrl', ['$rootScope','$routeParams','$location','$firebaseObject',
	function($rootScope,$routeParams,$location,$firebaseObject){
		let usersFolder = firebase.database().ref().child('pibxalapa/users');
		$firebaseObject(usersFolder.child($routeParams.userId)).$loaded().then(function (data) {
			$location.path("/members/edit/"+data.memberId);
		});
	}
]);
