okulusApp.controller('ReportsDashCntrl', ['$rootScope','$scope', 'WeeksSvc','ReportsSvc', 'ChartsSvc', 'GroupsSvc','MembersSvc',
	function ($rootScope, $scope, WeeksSvc, ReportsSvc, ChartsSvc, GroupsSvc,MembersSvc) {
		updateCharts = function(groupId){
			ChartsSvc.buildAttendanceCharts($scope.reportsForSelectedWeek, groupId);
			$scope.reunionStatusSummary = ChartsSvc.getReunionStatusTotals();
		};

		filterReportsForGroup = function(groupId){
			if(groupId){
				let reportsList = [];
				$scope.reportsArray.forEach( function(report){
					//console.log(report);
					if(report.reunion.groupId == groupId){
						reportsList.push(report);
					}
				});
				$scope.reportsForSelectedWeek = reportsList;
			}else{
				$scope.reportsForSelectedWeek = $scope.reportsArray;
			}
		};

		filterReportsForUser = function(accessGroups){
			let reportsList = [];
			$scope.reportsForSelectedWeek.forEach( function(report){
				//console.log(report);
				if(accessGroups.has(report.reunion.groupId)){
					reportsList.push(report);
				}
			});
			return reportsList;
		};

		filterReportsAndUpdateCharts = function (groupId, adminViewActive) {
			filterReportsForGroup(groupId);
			let accessRules = MembersSvc.getMemberAccessRules($rootScope.currentUser.member.id);
			let accessGroups = new Map();
			accessRules.$loaded().then(function(rules) {
				rules.forEach( function(rule){
					accessGroups.set(rule.groupId,rule);
				});
				if($rootScope.currentUser.type == 'admin' && adminViewActive){
					//Even an Admin user can get his Reports Filetered when using My GRoups view
					//Reports should not be filtered for the Admin, only when comming from Admin Dashboard
				}else{
					$scope.reportsForSelectedWeek = filterReportsForUser(accessGroups);
				}
				updateCharts(groupId);
			});
		};

		$scope.sortBy = function(propertyName) {
			$scope.reverse = ($scope.propertyName === propertyName) ? !$scope.reverse : false;
			$scope.propertyName = propertyName;
		};

		$scope.getReportsForSelectedWeeks = function (adminViewActive) {
			$scope.propertyName = 'reunion.groupname';
			$scope.reverse = true;

			let fromWeek = $scope.weekfrom;
			let toWeek = (!$scope.weekto || $scope.weekto==="0")?fromWeek:$scope.weekto;
			let groupId = $scope.specificGroup;

			let reportsArray = ReportsSvc.getReportsforWeeksPeriod(fromWeek, toWeek);
			$scope.reportsArray = reportsArray;

			reportsArray.$loaded().then( function( reports ) {
				filterReportsAndUpdateCharts(groupId,adminViewActive);
				//Add a Watch to rebuild charts when changes on reports
				reportsArray.$watch(function(event){
					filterReportsAndUpdateCharts(groupId,adminViewActive);
				});
			});
		};
}]);

okulusApp.controller('ReportCntrl', ['$scope','$routeParams','$location','GroupsSvc', 'MembersSvc', 'WeeksSvc', 'UtilsSvc', 'AuditSvc','ReportsSvc',
	function($scope, $routeParams, $location,GroupsSvc, MembersSvc, WeeksSvc, UtilsSvc, AuditSvc, ReportsSvc){
		MembersSvc.loadActiveMembers();
		WeeksSvc.loadActiveWeeks();

		cleanScope = function(){
			$scope.reportId = null;
			$scope.reunion = null;
			$scope.attendance = null
			$scope.response = null;
		};

		initScopeObjects = function() {
			$scope.reunion = { dateObj: new Date() };
			$scope.attendance = {
														total:0,
														guests:{
															male:{kid:0, young:0, adult:0},
															female:{kid:0, young:0, adult:0}
														},
														members:{
															male:{kid:0, young:0, adult:0},
															female:{kid:0, young:0, adult:0}
														}
													};
		};

		let whichGroup = $routeParams.groupId;
		//When comming from /new we will get the groupId as Param
		if(whichGroup){
			initScopeObjects();
			$scope.reunion.groupId = whichGroup;
			let groupObj = GroupsSvc.getGroupObj(whichGroup);
			groupObj.$loaded().then(function() {
				$scope.reunion.groupname = groupObj.group.name;
			}).catch(function(error) {
				$scope.reunion.groupname = "Group Not Available";
			});
		}

		$scope.saveOrUpdateReport = function(){
			if($scope.reunion.status == "canceled"){
				$scope.attendance = {
					total: 0,
					guests:{
						male:{kid:0, young:0, adult:0},
						female:{kid:0, young:0, adult:0}
					},
					members:{
						male:{kid:0, young:0, adult:0},
						female:{kid:0, young:0, adult:0}
					}
				};
				$scope.reunion.duration = 0;
				$scope.reunion.money = 0;
			}


			let record = {reunion: $scope.reunion, attendance: $scope.attendance};
			record.reunion.date = UtilsSvc.buildDateJson(record.reunion.dateObj);
			record.attendance.total =
				record.attendance.guests.female.adult + record.attendance.guests.female.young +
				record.attendance.guests.female.kid + record.attendance.guests.male.adult +
				record.attendance.guests.male.young + record.attendance.guests.male.kid +
				record.attendance.members.female.adult + record.attendance.members.female.young +
				record.attendance.members.female.kid + record.attendance.members.male.adult +
				record.attendance.members.male.young + record.attendance.members.male.kid;

			/* When a value for reportId is present in the scope, the user is on Edit
				mode and we have to perform an UPDATE.*/
			if( $scope.reportId ){
				console.log($scope.reunion.status);
				let repRef = ReportsSvc.getReportReference($scope.reportId);
				repRef.update(record, function(error) {
					if(error){
						$scope.response = { reportMsgError: error};
					}else{
						$scope.response = { reportMsgOk: "Report Actualizado"};
						AuditSvc.recordAudit(repRef.key, "update", "reports");
					}
			});
			/* Otherwise, when reportId is not present in the scope,
				we perform a SET to create a NEW record */
			}else{
				record.createdOn = firebase.database.ServerValue.TIMESTAMP;
				var newreportRef = ReportsSvc.getNewReportReference();
				newreportRef.set(record, function(error) {
					if(error){
						$scope.response = { reportMsgError: error};
					}else{
						//For some reason the message is not displayed until
						//you interact with any form element
					}
				});
				//adding trick below to ensure message is displayed
				let obj = ReportsSvc.getReportObj(newreportRef.key);
				obj.$loaded().then(function() {
					$scope.reportId = newreportRef.key;
					$scope.response = {reportMsgOk: "Reporte Creado"};
					GroupsSvc.addReportReference(newreportRef.key,obj);
					AuditSvc.recordAudit(newreportRef.key, "create", "reports");
				});

	    }

		};

		$scope.delete = function(){
			if($scope.reportId){
				let obj = ReportsSvc.getReportObj($scope.reportId);
				obj.$remove().then(function(ref) {
					cleanScope();
					$rootScope.response = { reportMsgOk: "Reporte Eliminado"};
					AuditSvc.recordAudit(ref.key, "delete", "reports");
					//$location.path( "/groups");
				}, function(error) {
					$scope.response = { reportMsgError: err};
				  console.log("Error:", error);
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
				// console.log(obj);
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
			},
			getReportsForWeek: function(weekId){
				let ref = reportsRef.orderByChild("reunion/weekId").equalTo(weekId);
				return $firebaseArray(ref);
			},
			getReportsforWeeksPeriod: function(fromWeek, toWeek){
				let query = reportsRef.orderByChild("reunion/weekId").startAt(fromWeek).endAt(toWeek);
				/*if(groupId){
					Not possible to combien more than one orderByChild
					console.log("Try second query for group "+groupId)
					let query2 = query.orderByChild("reunion/groupId").equalTo(groupId);
					return $firebaseArray(query2);
				}*/
				return $firebaseArray(query);
			}
		};
	}
]);
