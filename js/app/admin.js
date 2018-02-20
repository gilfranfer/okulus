okulusApp.controller('MonitorCntrl', ['$rootScope','$scope','$firebaseArray','$firebaseObject','AuditSvc',
	function($rootScope, $scope, $firebaseArray, $firebaseObject,AuditSvc){
		$scope.auditRecords = null;
		let auditRef = firebase.database().ref().child('pibxalapa/audit');

		let usersRef = firebase.database().ref().child('pibxalapa/users');
		$scope.userRecords = $firebaseArray( usersRef );

		let errorsRef = firebase.database().ref().child('pibxalapa/errors');
		$scope.errorsRecords = $firebaseArray( errorsRef );



		getAuditRecords = function(selectObj){
			// get the index of the selected option
			var idx = selectObj.selectedIndex;
			// get the value of the selected option
			var auditOn = selectObj.options[idx].value;
			$scope.auditOn = auditOn;
			$scope.auditRecords = $firebaseArray( auditRef.child(auditOn) );
		};

		$scope.updateUserType = function (userId, type) {
			if(userId == $rootScope.currentSession.user.$id){
				$scope.response = { userErrorMsg: "No puedes modificar a tu usuario"};
			}else{
				let obj = $firebaseObject( usersRef.child(userId) );
				obj.$loaded().then(function (){
					obj.type = type;
					return obj.$save();
				}).then(function (ref) {
					AuditSvc.recordAudit(userId, "type update", "users");
					$scope.response = { userOkMsg: "Usuario "+obj.email+" Actualizado"};
				}, function(error) {
					$scope.response = { userErrorMsg: error};
				});
			}
		}

	}
]);

okulusApp.controller('AdminDashCntrl', ['$rootScope','$scope','$firebaseObject','WeeksSvc','GroupsSvc',
	function($rootScope, $scope, $firebaseObject, WeeksSvc, GroupsSvc){
		$scope.adminViewActive = true;
		WeeksSvc.loadAllWeeks();
		$scope.groupsList = GroupsSvc.loadAllGroupsList();

		let countersRef = firebase.database().ref().child('pibxalapa').child('counters');
		$scope.globalCounter = $firebaseObject(countersRef);
		$scope.globalCounter.$loaded().then(
			function (counter) {
				// console.log(counter);
				if(!counter || !counter.members){
					counter.members = {active:0,inactive:0};
					counter.groups = {active:0,inactive:0};
					$scope.globalCounter.$save();
				}
			}
		);
	}
]);
