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
		let whichMember = $rootScope.currentUser.member.id;
		$rootScope.groupsList = MembersSvc.getMemberGroups(whichMember);
	}
]);


okulusApp.controller('UserCntrl', ['MembersSvc','GroupsSvc', '$rootScope', '$scope','$location',
	function(MembersSvc, GroupsSvc, $rootScope, $scope, $location){
			$rootScope.currentUser =  { type: 'admin', member:{ id:'-L3aCrod02U-clEuK8g1' }};
			MembersSvc.loadActiveMembers();

			//Get logged Member Info
			let whichMember = $rootScope.currentUser.member.id;
			MembersSvc.getMemberInfo(whichMember).$loaded().then(
				function(data) {
					$rootScope.currentUser.member.data = data;
				}
			);

			updateWatchAs = function () {
				let watchAs = document.querySelector("#watchAsSelect").value;
				if(watchAs == 'admin'){
					console.log("watchAs admin");
					$rootScope.currentUser.type = 'admin';
				}else{
					console.log("watchAs user: "+watchAs);
					$rootScope.currentUser.type = 'user';
					$rootScope.currentUser.member.id = watchAs;
				}
				$location.path("/home");
			};
	}
]);
