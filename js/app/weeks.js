okulusApp.controller('WeeksCntrl', ['WeeksSvc', 'AuditSvc', '$rootScope', '$scope',
	function(WeeksSvc, AuditSvc, $rootScope, $scope){
		$rootScope.response = null;
		WeeksSvc.loadAllWeeks();

		$scope.addWeek = function () {
			$rootScope.response = null;
			let weekId = document.querySelector("#weekId").value;
			let weekName = document.querySelector("#weekName").value;
			// if(weekId){
			if(!WeeksSvc.getWeekRecord(weekId)){
				weeksRef = WeeksSvc.getWeeksFolderRef();
				let record = {status:"open", name:weekName};

				weeksRef.child(weekId).set(record, function(error) {
					if(error){
						$rootScope.response = {weekMsgError: error };
					}else{
						//For some reason the message is not displayed until
						//you interact with any form element
					}
				});
				//adding trick below to ensure message is displayed
				let obj = WeeksSvc.getWeekObj(weekId);
				obj.$loaded().then(function() {
					AuditSvc.recordAudit(weekId, "create", "weeks");
					$rootScope.response = {weekMsgOk: "Semana "+weekId+" Creada" };
				});

			}else{
				$rootScope.response = {weekMsgError: "La Semana "+weekId+" ya existe" };
			}
		};

		$scope.openWeek = function (weekId) {
			WeeksSvc.updateWeekStatus(weekId,"open");
		};

		$scope.closeWeek = function (weekId) {
			WeeksSvc.updateWeekStatus(weekId,"closed");
		};
	}
]);

okulusApp.factory('WeeksSvc', ['$rootScope', '$firebaseArray', '$firebaseObject','AuditSvc',
	function($rootScope, $firebaseArray, $firebaseObject, AuditSvc){

		let weeksRef = firebase.database().ref().child('pibxalapa').child('weeks');
		let activeWeeksRef = weeksRef.orderByChild("status").equalTo("open");

		return {
			loadActiveWeeks: function(){
				if(!$rootScope.allActiveWeeks){
					$rootScope.allActiveWeeks = $firebaseArray(activeWeeksRef);
				}
			},
			loadAllWeeks: function(){
				if(!$rootScope.allWeeks){
					$rootScope.allWeeks = $firebaseArray(weeksRef);
				}
			},
			getWeekRecord: function(weekId){
				return $rootScope.allWeeks.$getRecord(weekId);
			},
			getWeekObj: function(weekId){
				return $firebaseObject(weeksRef.child(weekId));
			},
			getWeeksFolderRef: function(){
				return firebase.database().ref().child('pibxalapa').child('weeks');
			},
			updateWeekStatus: function (weekId,status) {
				$rootScope.response = null;
				let record = $rootScope.allWeeks.$getRecord(weekId);
				record.status = status;
				$rootScope.allWeeks.$save(record).then(function(){
					AuditSvc.recordAudit(weekId, status, "weeks");
					if(status == 'open'){
						$rootScope.response = {weekMsgOk: "Semana "+weekId+" Abierta" };
					}else{
						$rootScope.response = {weekMsgOk: "Semana "+weekId+" Cerrada" };
					}
				});
			}
		};
	}
]);
