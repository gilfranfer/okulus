okulusApp.controller('ReportCntrl', ['$rootScope','$scope', 'GroupsSvc', 'MembersSvc', 'WeeksSvc', 'UtilsSvc', 'AuditSvc','ReportsSvc',
	function($rootScope, $scope, GroupsSvc, MembersSvc,WeeksSvc, UtilsSvc, AuditSvc,ReportsSvc){
		
		GroupsSvc.loadActiveGroups();
		MembersSvc.loadActiveMembers();
		WeeksSvc.loadActiveWeeks();
		ReportsSvc.loadAllReports();

		//To put default Values on Attendance
		$scope.attendance = {
				guests:{
					male:{kid:0, young:0, adult:0},
					female:{kid:0, young:0, adult:0}
				},
				members:{
					male:{kid:0, young:0, adult:0},
					female:{kid:0, young:0, adult:0}
				}
			};


		$scope.saveReport = function(){
			console.log($scope.reunion);
			console.log($scope.attendance);
	    	if( !$scope.reportId ){
				console.log("Creating new Report");
				let record = {reunion: $scope.reunion, attendance: $scope.attendance};
	    		record.reunion.date = UtilsSvc.buildDateJson(record.reunion.dateObj);

		    	//Move to Svc
		    	$rootScope.allReports.$add( record ).then(function(ref) {
				    $scope.reportId = ref.key;
				    $scope.response = { messageOk: "Reporte Creado"};
				    AuditSvc.recordAudit(ref, "create", "reports");
				}).catch(function(err) {
					$scope.response = { messageErr: err};
				});
	    	}else{
	    		console.log("Updating report: "+$scope.reportId);
				let record = RecordsSvc.getRecord($scope.reportId);
				record.attendance = $scope.attendance;
				record.reunion = $scope.reunion;
	    		record.reunion.date = UtilsSvc.buildDateJson(record.reunion.dateObj);

			    //Move to Svc
		    	$rootScope.allReports.$save(record).then(function(ref) {
				    $scope.response = { messageOk: "Reporte Actualizado"};
				    AuditSvc.recordAudit(ref, "update", "reports");
					}).catch(function(err) {
						$scope.response = { messageErr: err};
					});
	    	}
		};

	}
]);

okulusApp.factory('ReportsSvc', ['$rootScope', '$firebaseArray', '$firebaseObject',
	function($rootScope, $firebaseArray, $firebaseObject){

		let reportsRef = firebase.database().ref().child('pibxalapa').child('reports');

		return {
			loadAllReports: function(){
				if(!$rootScope.allReports){
					$rootScope.allReports = $firebaseArray(reportsRef);
				}
			}
		};
	}
]);

okulusApp.factory('WeeksSvc', ['$rootScope', '$firebaseArray', '$firebaseObject',
	function($rootScope, $firebaseArray, $firebaseObject){

		let weeksRef = firebase.database().ref().child('pibxalapa').child('weeks').orderByChild("status").equalTo("open");

		return {
			loadActiveWeeks: function(){
				if(!$rootScope.allActiveWeeks){
					$rootScope.allActiveWeeks = $firebaseArray(weeksRef);
				}
			}
		};
	}
]);