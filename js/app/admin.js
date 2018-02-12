okulusApp.controller('MonitorCntrl', ['$rootScope','$scope','$firebaseArray',
	function($rootScope, $scope, $firebaseArray){
		console.log("Audit controller");
		$rootScope.auditRecords = null;
		let auditRef = firebase.database().ref().child('pibxalapa').child('audit');

		getAuditRecords = function(selectObj){
			// get the index of the selected option
			var idx = selectObj.selectedIndex;
			// get the value of the selected option
			var auditOn = selectObj.options[idx].value;
			$scope.auditOn = auditOn;
			$rootScope.auditRecords = $firebaseArray( auditRef.child(auditOn) );
	    };

	}
]);

okulusApp.controller('AdminDashCntrl', ['$rootScope','$scope','$firebaseObject','WeeksSvc','GroupsSvc',
	function($rootScope, $scope, $firebaseObject, WeeksSvc, GroupsSvc){
		$scope.adminViewActive = true;
		WeeksSvc.loadAllWeeks();
		$rootScope.groupsList = GroupsSvc.loadAllGroupsList();

		let countersRef = firebase.database().ref().child('pibxalapa').child('counters');
		$scope.globalCounter = $firebaseObject(countersRef);
		$scope.globalCounter.$loaded().then(
			function (counter) {
				console.log(counter);
				if(!counter || !counter.members){
					counter.members = {active:0,inactive:0};
					counter.groups = {active:0,inactive:0};
					$scope.globalCounter.$save();
				}
			}
		);
	}
]);
