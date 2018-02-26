okulusApp.controller('WeeksCntrl', ['WeeksSvc', 'AuditSvc', '$rootScope', '$scope',
	function(WeeksSvc, AuditSvc, $rootScope, $scope){
		$scope.weekid = new Date();
		WeeksSvc.loadAllWeeks();

		$scope.addWeek = function () {
			$scope.response = null;
			let weekId = document.querySelector("#weekId").value;
			let weekName = document.querySelector("#weekName").value;
			// if(weekId){
			if(!WeeksSvc.getWeekRecord(weekId)){
				let idSplit = weekId.split("-W");
				let code = (idSplit[0]+idSplit[1]);

				weeksRef = WeeksSvc.getWeeksFolderRef();
				let record = {status:"open", name:weekName};

				weeksRef.child(code).set(record, function(error) {
					if(error){
						$scope.response = {weekMsgError: error };
					}else{
						//For some reason the message is not displayed until
						//you interact with any form element
					}
				});
				//adding trick below to ensure message is displayed
				let obj = WeeksSvc.getWeekObj(weekId);
				obj.$loaded().then(function() {
					AuditSvc.recordAudit(code, "create", "weeks");
					$scope.response = {weekMsgOk: "Semana "+weekId+" Creada" };
				});

			}else{
				$scope.response = {weekMsgError: "La Semana "+weekId+" ya existe" };
			}
		};

		$scope.openWeek = function (weekId) {
			WeeksSvc.updateWeekStatus(weekId,"open").then(function(){
				AuditSvc.recordAudit(weekId, "open", "weeks");
				$scope.response = {weekMsgOk: "Semana "+weekId+" Abierta" };
			});
		};

		$scope.closeWeek = function (weekId) {
			WeeksSvc.updateWeekStatus(weekId,"closed").then(function(){
				AuditSvc.recordAudit(weekId, "closed", "weeks");
				$scope.response = {weekMsgOk: "Semana "+weekId+" Cerrada" };
			});
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
				return $rootScope.allWeeks;
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
				let record = $rootScope.allWeeks.$getRecord(weekId);
				record.status = status;
				return $rootScope.allWeeks.$save(record);
			}
		};
	}
]);
