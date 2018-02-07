okulusApp.controller('WeeksCntrl', ['WeeksSvc', '$rootScope', '$scope',
	function(WeeksSvc, $rootScope, $scope){
		$rootScope.response = null;
		WeeksSvc.loadAllWeeks();

		$scope.addWeek = function () {
			$rootScope.response = null;
			let weekId = document.querySelector("#weekId").value;
			let weekName = document.querySelector("#weekName").value;
			// if(weekId){
			if(!WeeksSvc.getWeekRecord(weekId)){
				WeeksSvc.persistWeek(weekId,weekName);
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
			persistWeek: function(weekId,weekName){
				let record = {status:"open", name:weekName};

				weeksRef.child(weekId).set(record, function(error) {
					console.log("set donde");
					if(error){
						console.error(error);
						$rootScope.response = {weekMsgError: error };
					}else{
						AuditSvc.recordAudit(weekId, "create", "weeks");
						$rootScope.response = {weekMsgOk: "Semana "+weekId+" Creada" };
					}
				});
			},
			updateWeekStatus: function (weekId,status) {
				$rootScope.response = null;
				let record = $rootScope.allWeeks.$getRecord(weekId);
				record.status = status;
				$rootScope.allWeeks.$save(record).then(function(){
					AuditSvc.recordAudit(weekId, status, "weeks");
					$rootScope.response = {weekMsgOk: "Semana "+weekId+" Actualizada" };
				});
			}
		};
	}
]);
