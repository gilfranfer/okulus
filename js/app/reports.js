okulusApp.controller('ReportCntrl', ['$rootScope','$scope', 'GroupsSvc', 'MembersSvc',
	function($rootScope, $scope, GroupsSvc, MembersSvc){
		
		GroupsSvc.loadActiveGroups();
		MembersSvc.loadActiveMembers();

		//To put default Values on Attendance
		$scope.report = {
			attendance:{
				guests:{
					male:{kid:0, young:0, adult:0},
					female:{kid:0, young:0, adult:0}
				},
				members:{
					male:{kid:0, young:0, adult:0},
					female:{kid:0, young:0, adult:0}
				}
			}
		};

	}
]);
