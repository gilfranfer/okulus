okulusApp.controller('ReportsDashCntrl', ['$rootScope','$scope', 'WeeksSvc','ReportsSvc', 'ChartsSvc', 'GroupsSvc','MembersSvc',
	function ($rootScope, $scope, WeeksSvc, ReportsSvc, ChartsSvc, GroupsSvc,MembersSvc) {
		updateCharts = function(groupId){
			ChartsSvc.buildCharts($scope.reportsForSelectedWeek, groupId);
			$scope.reunionStatusSummary = ChartsSvc.getReunionStatusTotals();
		};

		/* if a group was selected on the search view, we need to filter the $scope.reportsArray.
		   because at this point, it contains all reports for all groups for the slected weeks period */
		filterReportsForGroup = function(groupId){
			if(groupId){
				let reportsList = [];
				$scope.reportsArray.forEach( function(report){
					if(report.reunion.groupId == groupId){
						reportsList.push(report);
					}
				});
				$scope.reportsForSelectedWeek = reportsList;
			}else{
				$scope.reportsForSelectedWeek = $scope.reportsArray;
			}
		};

		/* Use $scope.reportsForSelectedWeek and remove reports for groups where
			 the currentSession.member doesnt have access*/
		filterReportsForUser = function(accessGroups){
			let reportsList = [];
			$scope.reportsForSelectedWeek.forEach( function(report){
				if(accessGroups.has(report.reunion.groupId)){
					reportsList.push(report);
				}
			});
			return reportsList;
		};

		filterReportsAndUpdateCharts = function (groupId, isAdminDashView) {
			filterReportsForGroup(groupId);
			/*Now filter reports according to member access list, so he can only see
			reports linked to the groups he has access to */
			let memberId = $rootScope.currentSession.user.memberId;
			if(!memberId && $rootScope.currentSession.user.isRoot){
				updateCharts(groupId);
			}else{
				let accessRules = MembersSvc.getMemberAccessRules($rootScope.currentSession.user.memberId);
				let accessGroups = new Map();
				accessRules.$loaded().then(function(rules) {
					rules.forEach( function(rule){
						accessGroups.set(rule.groupId,rule);
					});
					if($rootScope.currentSession.user.type == 'admin' && isAdminDashView){
						//Even an Admin user will get his Reports Filtered when using My Groups view (isAdminDashView = false)
						//Reports should not be filtered for the Admi only when comming from Admin Dashboard
					}else{
						$scope.reportsForSelectedWeek = filterReportsForUser(accessGroups);
					}
					updateCharts(groupId);
				});
			}
		};

		$scope.sortBy = function(propertyName) {
			$scope.reverse = ($scope.propertyName === propertyName) ? !$scope.reverse : false;
			$scope.propertyName = propertyName;
		};

		$scope.getReportsForSelectedWeeks = function (isAdminDashView) {
			$scope.propertyName = 'reunion.groupname';
			$scope.reverse = true;

			let fromWeek = $scope.weekfrom;
			let toWeek = (!$scope.weekto || $scope.weekto==="0")?fromWeek:$scope.weekto;
			let groupId = $scope.specificGroup;

			/* If user didnt select a group, but only has access to 1 groups
			   then we better select that group for him*/
			if(!groupId && $scope.groupsList.length == 1){
				groupId = ($scope.groupsList[0].$id);
			}

			let reportsArray = ReportsSvc.getReportsforWeeksPeriod(fromWeek, toWeek);
			$scope.reportsArray = reportsArray;

			/* reportsArray has all reports for the week period, even for groups where the member doesnt have access */
			reportsArray.$loaded().then( function( reports ) {
				filterReportsAndUpdateCharts(groupId,isAdminDashView);
				reportsArray.$watch(function(event){
					filterReportsAndUpdateCharts(groupId,isAdminDashView);
				});
			});

			$rootScope.weekfrom = fromWeek;
			$rootScope.weekto = toWeek;
			$rootScope.specificGroup = groupId;
			//$rootScope.specificGroup = groupId;
		};
}]);

okulusApp.controller('ReportFormCntrl', ['$scope','$rootScope','$routeParams','$location','GroupsSvc', 'MembersSvc', 'WeeksSvc', 'UtilsSvc', 'AuditSvc','ReportsSvc',
	function($scope, $rootScope, $routeParams, $location,GroupsSvc, MembersSvc, WeeksSvc, UtilsSvc, AuditSvc, ReportsSvc){
		//Data Required to populate some Form Selects
		WeeksSvc.loadActiveWeeks();
		MembersSvc.loadActiveMembers().$loaded().then(function(activeMembers){
			$scope.hostsList = MembersSvc.filterActiveHosts(activeMembers);
			$scope.leadsList = MembersSvc.filterActiveLeads(activeMembers);
			$scope.traineesList = MembersSvc.filterActiveTrainees(activeMembers);
		});

		cleanScope = function(){
			$scope.reportId = null;
			$scope.reunion = null;
			$scope.attendance = null
			$scope.response = null;
		};

		getTotalAttendance = function (att) {
			let total = att.guests.female.adult + att.guests.female.young +
				att.guests.female.kid + att.guests.male.adult +
				att.guests.male.young + att.guests.male.kid +
				att.members.female.adult + att.members.female.young +
				att.members.female.kid + att.members.male.adult +
				att.members.male.young + att.members.male.kid;
			return total;
		};

		// cleanAttendance = function() {
			// let attendance = {
			// 	total: 0,
			// 	guests:{
			// 		male:{kid:0, young:0, adult:0},
			// 		female:{kid:0, young:0, adult:0}
			// 	},
			// 	members:{
			// 		male:{kid:0, young:0, adult:0},
			// 		female:{kid:0, young:0, adult:0}
			// 	}
			// };
		// 	return attendance;
		// }

		$scope.saveOrUpdateReport = function(){
			if($scope.reunion.status == "canceled"){
				$scope.attendance = { total: 0, guests:{total:0}, members:{total:0} };
				$scope.reunion.duration = 0;
				$scope.reunion.money = 0;
			}

			let membersAttendanceList = $scope.attendance.members.list;
			let guestsAttendanceList = $scope.attendance.guests.list;
			let record = {reunion: $scope.reunion, attendance: $scope.attendance};
			record.reunion.date = UtilsSvc.buildDateJson(record.reunion.dateObj);

			record.attendance.members.list = null;
			record.attendance.guests.list = null;
			record.attendance.members.total = membersAttendanceList?membersAttendanceList.length:0;
			record.attendance.guests.total = guestsAttendanceList?guestsAttendanceList.length:0;
			record.attendance.total = record.attendance.guests.total + 	record.attendance.members.total ;

			let reportRef = undefined;
			let successMessage = undefined;
			let action = undefined;
			if( $scope.reportId ){
				/* When a value for reportId is present in the scope, the user is on Edit mode*/
				repRef = ReportsSvc.getReportReference($scope.reportId);
				successMessage = "Reporte Actualizado";
				action = "update";
			}else{
				/* Otherwise we are going to create a NEW record */
				repRef = ReportsSvc.getNewReportReference();
				successMessage = "Reporte Creado";
				action = "create";
	    }

			repRef.update(record, function(error) {
				if(error){
					$scope.response = { reportMsgError: error};
				}else{
					if(membersAttendanceList){
						membersAttendanceList.forEach(function(element) {
							repRef.child("attendance/members/list").push({memberId:element.memberId,memberName:element.memberName});
						});
					}
					if(guestsAttendanceList){
						guestsAttendanceList.forEach(function(element) {
							repRef.child("attendance/guests/list").push({guestName:element.guestName});
						});
					}
					/*For some reason the message is not displayed until you interact with any form element*/
				}
			});

			//adding trick below to ensure message is displayed
			let obj = ReportsSvc.getReportObj(repRef.key);
			obj.$loaded().then(function() {
				if(membersAttendanceList){
					$scope.attendance.members.list = Object.values(membersAttendanceList);
				}
				if(guestsAttendanceList){
					$scope.attendance.guests.list = Object.values(guestsAttendanceList);
				}

				$scope.reportId = repRef.key;
				$scope.response = { reportMsgOk: successMessage};
				AuditSvc.recordAudit(repRef.key, action, "reports");
				if(action == "create"){
					GroupsSvc.addReportReference(obj);
					ReportsSvc.increasePendingReportCounter();
					$rootScope.response = $scope.response
					$location.path("reports/edit/"+repRef.key);
				}

			});
		};

		$scope.delete = function(){
			if($rootScope.currentSession.user.type == 'user'){
				$scope.response = { reportMsgError: "Para eliminar este reporte, contacta al administrador"};
			}else{
				if($scope.reportId){
					let reportId;
					let groupId;
					ReportsSvc.getReportObj($scope.reportId).$loaded().then( function (reportObj) {
							reportId = reportObj.$id;
							groupId = reportObj.reunion.groupId;

							reportObj.$remove().then(function(ref) {
								cleanScope();
								$rootScope.response = { reportMsgOk: "Reporte Eliminado"};
								AuditSvc.recordAudit(ref.key, "delete", "reports");
								//remove the report reference from the group
								GroupsSvc.removeReportReference(reportId,groupId);
							}, function(error) {
								$rootScope.response = { reportMsgError: err};
								console.log("Error:", error);
							});
							$location.path( "/admin/dashboard");
						} );
				}
			}
		};

		$scope.addMemberAttendance = function () {
			let whichMember = $scope.addmemberId;
			let memberName = document.getElementById('memberSelect').options[document.getElementById('memberSelect').selectedIndex].text;

			if(!$scope.attendance.members.list){
				$scope.attendance.members.list = [];
			}
			let memberExist = false;
			$scope.attendance.members.list.forEach(function(member) {
					if(member.memberId == whichMember){
						memberExist = true;
					}
			});
			if(memberExist){
				$scope.response = { membersListError: memberName + " ya está en la lista"};
			}else{
				$scope.attendance.members.list.push({memberId:whichMember,memberName:memberName});
				$scope.response = { membersListOk: memberName + " agregado a la lista"};
			}
		};

		$scope.addGuestAttendance = function () {
			let guestName = $scope.addGuestName;
			if(!$scope.attendance.guests.list){
				$scope.attendance.guests.list = [];
			}
			let guestExist = false;
			$scope.attendance.guests.list.forEach(function(member) {
					if(member.guestName == guestName){
						guestExist = true;
					}
			});
			if(guestExist){
				$scope.response = { guestsListError: guestName + " ya está en la lista"};
			}else{
				$scope.attendance.guests.list.push({guestName:guestName});
				$scope.response = { guestsListOk: guestName + " agregado a la lista"};
			}
		};

		$scope.removeMemberAttendance = function (whichMember) {
			let memberName = whichMember.memberName;
			let memberId = whichMember.memberId;
			$scope.attendance.members.list.forEach(function(member,idx) {
					if(member.memberId == memberId){
    				$scope.attendance.members.list.splice(idx, 1);
						$scope.response = { membersListOk: memberName + " fue removido de la lista"};
					}
			});
		}

		$scope.removeGuestAttendance = function (whichMember) {
			let guestName = whichMember.guestName;
			$scope.attendance.guests.list.forEach(function(member,idx) {
					if(member.guestName == guestName){
    				$scope.attendance.guests.list.splice(idx, 1);
						$scope.response = { guestsListOk: guestName + " fue removido de la lista"};
					}
			});
		}
	}
]);

okulusApp.controller('NewReportCntrl', ['$rootScope', '$scope','$routeParams', '$location','GroupsSvc','MembersSvc',
	function($rootScope, $scope, $routeParams, $location, GroupsSvc, MembersSvc){
		$rootScope.response = null;
		let whichGroup = $routeParams.groupId;
		$scope.reunion = { dateObj: new Date(), groupId: whichGroup, status:"completed"};
		$scope.attendance = { total: 0, guests:{total:0}, members:{total:0} };

		$scope.groupMembersList = MembersSvc.getMembersForBaseGroup(whichGroup);
		GroupsSvc.getGroupObj(whichGroup).$loaded().then(function(groupObj) {
			$scope.reunion.groupname = groupObj.group.name;
			$scope.reunion.hostId = groupObj.group.hostId;
			$scope.reunion.leadId = groupObj.group.leadId;
		}).catch(function(error) {
			$location.path("/error/norecord");
			$scope.reunion.groupname = "Group Not Available";
		});
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
				putRecordOnScope(obj);
			}).catch(function(error) {
		    $location.path( "/error/norecord" );
		  });
		}

		function putRecordOnScope(record){
			if(record && record.reunion){
				$scope.reportId = record.$id;
				$scope.reunion = record.reunion;
				if(record.reunion.date){
					$scope.reunion.dateObj = new Date(record.reunion.date.year, record.reunion.date.month-1, record.reunion.date.day);
				}

				$scope.attendance = record.attendance;
				if($scope.attendance.members.list){
					$scope.attendance.members.list = Object.values(record.attendance.members.list);}
				if($scope.attendance.guests.list){
					$scope.attendance.guests.list = Object.values(record.attendance.guests.list);}
				$scope.groupMembersList = MembersSvc.getMembersForBaseGroup(record.reunion.groupId);
			}else{
				$location.path( "/error/norecord" );
			}
		}

	}
]);

okulusApp.factory('ReportsSvc', ['$rootScope', '$firebaseArray', '$firebaseObject',
	function($rootScope, $firebaseArray, $firebaseObject){

		let reportsRef = firebase.database().ref().child('pibxalapa/reports');
		let counterRef = firebase.database().ref().child('pibxalapa/counters/reports');

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
			},
			getMembersAttendaceListForReport: function (whichReport) {
				let attendanceListRef = reportsRef.child(whichReport).child("attendance/memberss/list");
				return $firebaseArray(attendanceListRef);
			},
			increasePendingReportCounter: function() {
				$firebaseObject(counterRef).$loaded().then(
					function( counter ){
						counter.pending = counter.pending+1;
						counter.$save();
					});
			}
		};
	}
]);
