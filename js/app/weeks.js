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
				let idSplit = weekId.split("-W");
				let code = (idSplit[0]+idSplit[1]);

				weeksRef = WeeksSvc.getWeeksFolderRef();
				let record = {status:"open", name:weekName};

				weeksRef.child(code).set(record, function(error) {
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

okulusApp.controller('WeeksTestCntrl', ['WeeksSvc', 'AuditSvc', '$rootScope', '$scope',
	function(WeeksSvc, AuditSvc, $rootScope, $scope){

		$scope.testData = function () {
			let weeksRef = WeeksSvc.getWeeksFolderRef();
			var data = [
					{id: '2018-W01', status:'open', name:"Semana 1/2018"},
					{id: '2018-W02', status:'open', name:"Semana 2/2018"},
					{id: '2018-W03', status:'open', name:"Semana 3/2018"},
					{id: '2018-W04', status:'open', name:"Semana 4/2018"},
					{id: '2018-W05', status:'open', name:"Semana 5/2018"},
					{id: '2018-W06', status:'open', name:"Semana 6/2018"},
					{id: '2018-W07', status:'open', name:"Semana 7/2018"},
					{id: '2018-W08', status:'open', name:"Semana 8/2018"},
					{id: '2018-W09', status:'open', name:"Semana 9/2018"},
					{id: '2018-W10', status:'open', name:"Semana 10/2018"},
					{id: '2018-W11', status:'open', name:"Semana 11/2018"},
					{id: '2018-W12', status:'open', name:"Semana 12/2018"},
					{id: '2018-W13', status:'open', name:"Semana 13/2018"}
				];
			data.forEach( function(record){
				let idSplit = record.id.split("-W");
				let code = (idSplit[0]+idSplit[1]);
				let week = {status:record.status, code:code,name:record.name};
				weeksRef.child(code).set(week);
			} );
		};

		$scope.deleteTestData = function(){
			let weeksRef = WeeksSvc.getWeeksFolderRef();
			weeksRef.set(null);
		};

		$scope.testSelect = function(){
			let weeksRef = WeeksSvc.getWeeksFolderRef();
			weeksRef.orderByChild("code").startAt("201810").endAt("201810").on("child_added", function(snapshot) {
			  console.log(snapshot.key)
			});
		};
	}
]);
