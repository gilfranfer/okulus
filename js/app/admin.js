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

okulusApp.controller('AdminDashCntrl', ['$rootScope','$scope','$firebaseObject',
	function($rootScope, $scope, $firebaseObject){
		let countersRef = firebase.database().ref().child('pibxalapa').child('counters');
		$rootScope.globalCounter = $firebaseObject(countersRef);
	}
]);
