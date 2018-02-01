okulusApp.controller('ReportCntrl', ['$rootScope','$scope','$routeParams','GroupsSvc', 'MembersSvc', 'WeeksSvc', 'UtilsSvc', 'AuditSvc','ReportsSvc',
	function($rootScope, $scope, $routeParams, GroupsSvc, MembersSvc, WeeksSvc, UtilsSvc, AuditSvc, ReportsSvc){
		MembersSvc.loadActiveMembers();
		WeeksSvc.loadActiveWeeks();
		let whichGroup = $routeParams.groupId;
		//When comming from /new we will get the groupId as Param
		if(whichGroup){
			console.log("group");
			initScopeObjects();
			$scope.reunion.groupId = whichGroup;
			let groupObj = GroupsSvc.getGroupObj(whichGroup);
			groupObj.$loaded().then(function() {
				$scope.reunion.groupname = groupObj.group.name;
			}).catch(function(error) {
				$scope.reunion.groupname = "Group Not Available";
			});
		}
		//This is when calling the ReportCntrl from /edit
		else {
		}

		function initScopeObjects() {
			$scope.reunion = { dateObj: new Date() };
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
		}

		$scope.saveOrUpdateReport = function(){
			console.log("on save");
			//$scope.response = null;
			let record = {reunion: $scope.reunion, attendance: $scope.attendance};
			record.reunion.date = UtilsSvc.buildDateJson(record.reunion.dateObj);

			/* When a value for reportId is present in the scope, the user is on Edit
				mode and we have to perform an UPDATE.*/
			if( $scope.reportId ){
				console.log("here");
				let repRef = ReportsSvc.getReportReference($scope.reportId);
				repRef.update(record, function(error) {
					if(error){
						$scope.response = { messageError: error};
					}else{
						$scope.response = { messageOk: "Report Actualizado"};
						AuditSvc.recordAudit(repRef, "update", "reports");
					}
				});
			/* Otherwise, when reportId is not present in the scope,
				we perform a SET to create a new record */
			}else{
				console.log("else");
				var newreportRef = ReportsSvc.getNewReportReference();
				newreportRef.set(record, function(error) {
					if(error){
						$rootScope.response = { messageError: error};
					}else{
						$scope.reportId = newreportRef.key;
						$scope.response = { messageOk: "Reporte Creado"};
						console.log($scope.response);
						AuditSvc.recordAudit(newreportRef, "create", "reports");
					}
				});
	    }
		};

	}
]);

okulusApp.controller('ReportDetailsCntrl', ['$scope','$routeParams', '$location', 'GroupsSvc', 'ReportsSvc','WeeksSvc','MembersSvc',
	function($scope, $routeParams, $location, GroupsSvc, ReportsSvc, WeeksSvc, MembersSvc){
		let whichReport = $routeParams.reportId;

		/* When opening "Edit" page from the Reports List, we can use the
		"allReports" firebaseArray from rootScope to get the specific Group data */
		if( ReportsSvc.allReportsLoaded() ){
			let record = ReportsSvc.getReportFromArray(whichReport);
			putRecordOnScope(record);
		}
		/* But, when using a direct link to an "Edit" page, or when refresing (f5),
		we will not have the "allReports" firebaseArray Loaded in the rootScope.
		Instead of loading all the Report, what could be innecessary,
		we can use firebaseObject to get only the required group data */
		else{
			let obj = ReportsSvc.getReportObj(whichReport);
			obj.$loaded().then(function() {
				console.log(obj);
				putRecordOnScope(obj);
			}).catch(function(error) {
				console.log(error);
		    $location.path( "/error/norecord" );
		  });
		}

		function putRecordOnScope(record){
			if(record && record.reunion){
				$scope.reportId = record.$id;
				$scope.reunion = record.reunion;
				$scope.attendance = record.attendance;

				if(record.reunion.date){
					$scope.reunion.dateObj = new Date(record.reunion.date.year,
												  record.reunion.date.month-1,
												  record.reunion.date.day);
				}
			}else{
				$location.path( "/error/norecord" );
			}
		}

	}
]);

okulusApp.factory('ReportsSvc', ['$rootScope', '$firebaseArray', '$firebaseObject',
	function($rootScope, $firebaseArray, $firebaseObject){

		let reportsRef = firebase.database().ref().child('pibxalapa/reports');

		return {
			allReportsLoaded: function() {
				return $rootScope.allReports != null;
			},
			getReportFromArray: function(reportId){
				return $rootScope.allReports.$getRecord(reportId);
			},
			getReportObj: function(reportId){
				return $firebaseObject(reportsRef.child(reportId));
			},
			loadAllReports: function(){
				if(!$rootScope.allReports){
					$rootScope.allReports = $firebaseArray(reportsRef);
				}
			},
			getReportReference: function(reportId){
				return reportsRef.child(reportId);
			},
			getNewReportReference: function(){
				return reportsRef.push();
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
