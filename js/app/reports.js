okulusApp.controller('ReportCntrl', ['$rootScope', 'GroupsSvc', 'MembersSvc',
	function($rootScope, GroupsSvc, MembersSvc){
		
		GroupsSvc.loadActiveGroups();
		MembersSvc.loadActiveMembers();

	}
]);
