//Mapping: /admin/summary
//Load all the elements for the Admin Summary
okulusApp.controller('AdminSummaryCntrl',
	['$rootScope','$scope','$location','$firebaseAuth',
		'GroupsSvc','AuthenticationSvc',
	function($rootScope, $scope, $location, $firebaseAuth,
		GroupsSvc, AuthenticationSvc){

		$scope.response = {loading:true, message:systemMsgs.inProgress.loadingSummary};
		$firebaseAuth().$onAuthStateChanged( function(authUser){ if(authUser){
			AuthenticationSvc.loadSessionData(authUser.uid).$loaded().then(function(user) {
				if(user.type == constants.roles.user){
					$rootScope.response = {error:true, showHomeButton: true, message:systemMsgs.error.noPrivileges};
					$location.path(constants.pages.error);
				}else{
					/* Get All Groups List, because Admin has access to all of them.
					This is useful for the groupSelectModal triggered from Create Report Button*/
					$rootScope.currentSession.accessGroups = GroupsSvc.getAllGroups();
					//Counters to build the Summary cards.
					$scope.globalCount.$loaded().then(function(counter){
						$scope.response = null;
					});
				}
			});
		}});
}]);
