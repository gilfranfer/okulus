/* Controller linked to /myreports
 * It will load the lists (weeks, groups, member rules) required for the view to work */
okulusApp.controller('UserMyReportsCntrl', ['MembersSvc','GroupsSvc', 'WeeksSvc', '$rootScope',
	function(MembersSvc, GroupsSvc, WeeksSvc, $rootScope){
		let whichMember = $rootScope.currentUser.member.id;
		$rootScope.weeksList = WeeksSvc.loadAllWeeks();
		$rootScope.groupsList = MembersSvc.getMemberGroups(whichMember);
	}
]);

/* Controller linked to /mygroups
 * It will load the Groups the Current Member has Access to */
okulusApp.controller('UserMyGroupsCntrl', ['MembersSvc', 'WeeksSvc', '$rootScope',
	function(MembersSvc, WeeksSvc, $rootScope){
		let whichMember = $rootScope.currentUser.memberId;
		if()
		$rootScope.groupsList = MembersSvc.getMemberGroups(whichMember);
	}
]);


okulusApp.controller('UserCntrl', ['MembersSvc','GroupsSvc', '$rootScope', '$scope','$location',
	function(MembersSvc, GroupsSvc, $rootScope, $scope, $location){
			MembersSvc.loadActiveMembers();

			updateWatchAs = function () {
				let watchAs = document.querySelector("#watchAsSelect").value;
				if(watchAs == 'admin'){
					console.log("watchAs admin");
					$rootScope.currentUser.type = 'admin';
				}else{
					console.log("watchAs user: "+watchAs);
					$rootScope.currentUser.type = 'user';
					$rootScope.currentUser.memberId = watchAs;
				}
				$location.path("/home");
			};
	}
]);
