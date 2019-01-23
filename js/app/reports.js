//Controller For reportSelector view
okulusApp.controller('ReportsDashCntrl', ['$rootScope','$scope', 'WeeksSvc','ReportsSvc', 'ChartsSvc', 'GroupsSvc','MembersSvc',
	function ($rootScope, $scope, WeeksSvc, ReportsSvc, ChartsSvc, GroupsSvc,MembersSvc) {
		//Default chart Orientation (portrait or landscape)
		$scope.chartOrientation = 'landscape';

		updateCharts = function(selectedGroupIds,weeksElapsed){
			// console.debug(selectedGroupIds);

			let goodWeekAttendanceIndicator = 8;
			let excelentWeekAttendanceIndicator = 14;
			/* weeksElapsed is used to modify the reference values "goodWeekAttendanceIndicator" and "excelentWeekAttendanceIndicator"
			Those values are week-based, so they need to be multiplied by the number of weeks selected in the Reports Search.
			When only ONE Specefic group was selected, then we do not need to modify those values because we will be displaying the
			data with the Weeks as Category, that means, in this case we are not accumulating the totals across weeks. */
			if(selectedGroupIds.length > 1){
				goodWeekAttendanceIndicator *= weeksElapsed;
				excelentWeekAttendanceIndicator *= weeksElapsed;
			}
			ChartsSvc.buildCharts($scope.reportsForSelectedWeek, selectedGroupIds, $scope.chartOrientation, goodWeekAttendanceIndicator,excelentWeekAttendanceIndicator);
			$scope.reunionSummary = ChartsSvc.getReunionTotals();
		};

		/* if a group was selected on the search view, we need to filter the $scope.reportsArray.
		   because at this point, it contains all reports for all groups for the selected weeks period */
		filterReportsForGroup = function(selectedGroupIds){
			if(selectedGroupIds.length == $scope.groupsList.length){
				//All groups option selected
				$scope.reportsForSelectedWeek = $scope.reportsArray;
				// console.debug("All Groups Selected");
			}else{
				//One or more groups selected
				// console.debug("Some groups selected");
				let reportsList = [];
				$scope.reportsArray.forEach( function(report){
					let found = false;
					for (i = 0; i < selectedGroupIds.length; i++) {
					    if(selectedGroupIds[i] == report.reunion.groupId){
					    	found = true;
					        break;
					    }
					}
					if(found){
						reportsList.push(report);
					}
				});
				$scope.reportsForSelectedWeek = reportsList;
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

		/* Filter reports according to member access list, so he can only see
		reports linked to the groups he has access to.
		groupdId will have a value if the user selected at least one group on the view
		isAdminDashView is to identify if the Reports Search is comming from Admins Dashboard or User My Groups
		weeksElapsed will give us the number of weeks selected (weekTo - WeekFrom) */
		filterReportsAndUpdateCharts = function (selectedGroupIds, isAdminDashView, weeksElapsed) {
			filterReportsForGroup(selectedGroupIds);
			let memberId = $rootScope.currentSession.user.memberId;
			if(!memberId && $rootScope.currentSession.user.isRoot){
				/* A root user doesnt have a member associated in the system, but has Admin privileges
				 	 so we can go ahead and show all information. */
				updateCharts(selectedGroupIds,weeksElapsed);
			}else{
				let accessRules = MembersSvc.getMemberAccessRules($rootScope.currentSession.user.memberId);
				let accessGroups = new Map();
				accessRules.$loaded().then(function(rules) {
					rules.forEach( function(rule){
						accessGroups.set(rule.groupId,rule);
					});
					if($rootScope.currentSession.user.type == 'admin' && isAdminDashView){
						//Reports should not be filtered for the Admi when comming from "Admin Dashboard"
						//Even an Admin will get his Reports Filtered when using "My Groups" view (isAdminDashView = false)
					}else{
						$scope.reportsForSelectedWeek = filterReportsForUser(accessGroups);
					}
					updateCharts(selectedGroupIds,weeksElapsed);
				});
			}
		};

		$scope.getReportsForSelectedWeeks = function (isAdminDashView) {
			$scope.response = null;
			$scope.propertyName = 'reunion.groupname';
			$scope.reverse = true;
			$scope.loadingReports = true;

			/* Get User Input */
			let fromWeek = $scope.weekfrom;
			let toWeek = (!$scope.weekto || $scope.weekto==="0")?fromWeek:$scope.weekto;
			let selectedGroups = $scope.specificGroups;
			$rootScope.weekfrom = fromWeek;
			$rootScope.weekto = toWeek;
			$rootScope.specificGroups = selectedGroups;

			/* If user didnt select a group, but only has access to 1 groups
				 then we better select that group for him
			if(!selectedGroups && $scope.groupsList.length == 1){
				selectedGroups = [$scope.groupsList[0].$id];
				$scope.specificGroups = selectedGroups;
			}*/

			let reportsArray = ReportsSvc.getReportsforWeeksPeriod(fromWeek, toWeek);
			$scope.reportsArray = reportsArray;

			/* reportsArray has all reports for the week period,  even for groups where
				the member doesnt have access, so we need to apply some filters before
			 */
			reportsArray.$loaded().then( function( reports ) {
				//console.debug("Start to filter Reports");
				let weeksElapsed = ($rootScope.weekto -  $rootScope.weekfrom)+1;
				filterReportsAndUpdateCharts(selectedGroups,isAdminDashView,weeksElapsed);
				reportsArray.$watch(function(event){ notifyReportAdded(event); });
				$scope.loadingReports = false;
			});

		};

		$scope.sortBy = function(propertyName) {
			$scope.reverse = ($scope.propertyName === propertyName) ? !$scope.reverse : false;
			$scope.propertyName = propertyName;
		};

		$scope.selectAllGroups = function() {
			selectObj = document.getElementById("specificGroupSelect");
			let allgroups = [];
			for(var i = 0; i < selectObj.length; i++) {
				allgroups.push(selectObj.options[i].value);
			}
			$scope.specificGroups = allgroups;
		};

		notifyReportAdded = function(event){
			let reportId = event.key;
			ReportsSvc.getReportObj(reportId).$loaded().then(function (report) {
				if( report.reunion.weekId >= $rootScope.weekfrom && report.reunion.weekId <= $rootScope.weekto ){
					let message = "";
					if(event.event == "child_added"){
						message = "Se ha creado un nuevo Reporte para la semana "+report.reunion.weekId
																								+ " del grupo "+report.reunion.groupname;
					}else if(event.event == "child_changed"){
						message = "Se ha modificado un Reporte para la semana "+report.reunion.weekId
																								+ " del grupo "+report.reunion.groupname;;
					}
					$scope.response = { reportAddedMsg:message };
					// console.debug(event);
				}else{
					// console.debug("Update on other week");
				}
			});
		};

}]);

okulusApp.controller('ReportFormCntrl', ['$scope','$rootScope','$routeParams','$location','GroupsSvc', 'MembersSvc', 'WeeksSvc', 'UtilsSvc', 'AuditSvc','ReportsSvc',
	function($scope, $rootScope, $routeParams, $location,GroupsSvc, MembersSvc, WeeksSvc, UtilsSvc, AuditSvc, ReportsSvc){

		/* Approve or Reject Report, according to the boolean passed as parameter */
		$scope.approveReport = function (approved){
			if ($scope.reportId){
				$scope.working = true;

				repRef = ReportsSvc.getReportReference($scope.reportId);
				let response = undefined;
				let action = undefined;

				if(approved){
					response = { reportMsgOk: "Reporte Aprobado"};
					action = "approved";
				}else{
					response = { reportMsgError: "Reporte Rechazado"};
					action = "rejected";
				}

				repRef.child("audit").update({reportStatus:action}, function(error) {
					if(error){
						$scope.response = { reportMsgError: error};
					}else{
						$scope.audit.reportStatus = action;
						$scope.response = response;
						AuditSvc.recordAudit(repRef.key, action, "reports");
						$scope.audit.reportStatus = action;
						$scope.working = false;
						/*For some reason the message is not displayed until you interact with any form element*/
					}
				});

			}
		};

		/*TODO: Before saving check if updatingHost, updatingTrainee, updatingLead, updatingWeek.
		If any is true, is because they didnt save the change, but still needs to be applied, so
		we need to update the hostName, traineeName or leadName, or week accordingly*/
		$scope.saveOrUpdateReport = function(){
			if($scope.audit && $scope.audit.reportStatus == "approved"){
				$scope.response = { reportMsgError: "No se puede modificar el reporte porque ya ha sido aprobado"};
			}
			else{
				$scope.working = true;

				if($scope.reunion.status == "canceled"){
					$scope.objectDetails.attendance = { total: 0, guests:{total:0}, members:{total:0} };
					$scope.reunion.duration = 0;
					$scope.reunion.money = 0;
				}

				let membersAttendanceList = $scope.objectDetails.attendance.members;
				let guestsAttendanceList = $scope.objectDetails.attendance.guests;
				let record = {reunion: $scope.reunion, attendance: $scope.objectDetails.attendance};
				record.reunion.date = UtilsSvc.buildDateJson(record.reunion.dateObj);

				record.attendance.members = null;
				record.attendance.guests = null;
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
					record.audit = {reportStatus:"pending"};
		    	}

				repRef.update(record, function(error) {
					if(error){
						$scope.working = false;
						$scope.response = { reportMsgError: error};
					}else{
						if(membersAttendanceList){
							membersAttendanceList.forEach(function(element) {
								repRef.child("attendance/members/list").child(element.memberId).set({memberId:element.memberId,memberName:element.memberName});
								//console.debug(repRef.key);
								MembersSvc.addReportReference(element.memberId,repRef.key,record);
							});
						}
						if(guestsAttendanceList){
							guestsAttendanceList.forEach(function(element) {
								repRef.child("attendance/guests/list").push({guestName:element.guestName});
							});
						}
						if($scope.removedMembersMap){
							$scope.removedMembersMap.forEach(function(value, key) {
								MembersSvc.removeMemberReferenceToReport(value,repRef.key);
							});
						}
						/*For some reason the message is not displayed until you interact with any form element*/
					}
				});

				//adding trick below to ensure message is displayed
				let obj = ReportsSvc.getReportObj(repRef.key);
				obj.$loaded().then(function() {
					if(membersAttendanceList){
						$scope.objectDetails.attendance.members = Object.values(membersAttendanceList);
					}
					if(guestsAttendanceList){
						$scope.objectDetails.attendance.guests = Object.values(guestsAttendanceList);
					}

					$scope.reportId = repRef.key;
					$scope.working = false;
					$scope.response = { reportMsgOk: successMessage};
					AuditSvc.recordAudit(repRef.key, action, "reports");
					if($scope.audit){
						$scope.audit.reportStatus = "pending";
					}
					if(action == "create"){
						GroupsSvc.addReportReference(obj);
						ReportsSvc.increasePendingReportCounter();
						$rootScope.response = $scope.response
						$location.path("reports/edit/"+repRef.key);
					}

				});
			}

		};

		/* A Report can be deleted by Admin
		 When deleting a Report:
			1. Decrease the Report Status counter
			2. Remove report reference from group/reports
			3. Remove report reference from member/reports
		*/
		$scope.delete = function(){
			if($rootScope.currentSession.user.type == 'user'){
				$scope.response = { reportMsgError: "Para eliminar este reporte, contacta al administrador"};
			}else if($scope.audit && $scope.audit.reportStatus == "approved"){
				$scope.response = { reportMsgError: "No se puede eliminar el reporte porque ya ha sido aprobado"};
			}else{
				if($scope.reportId){
					$scope.working = true;

					ReportsSvc.getReportObj($scope.reportId).$loaded().then( function (reportObj) {
							let reportId = reportObj.$id;
							let groupId = reportObj.reunion.groupId;
							let membersAttendanceList = reportObj.attendance.members;
							//if report is not approved
							reportObj.$remove().then(function(ref) {
								$rootScope.response = { reportMsgOk: "Reporte Eliminado"};
								AuditSvc.recordAudit(ref.key, "delete", "reports");
								ReportsSvc.decreasePendingReportCounter();
								//remove the report reference from the group
								GroupsSvc.removeReportReference(reportId,groupId);
								MembersSvc.removeReferenceToReport(reportId,membersAttendanceList);
								$scope.working = true;
								$location.path( "/admin/dashboard");
							}, function(error) {
								$scope.working = false;
								$rootScope.response = { reportMsgError: err};
								// console.debug("Error:", error);
							});
					});
				}
			}
		};

		// $scope.addGuests = function () {
		// 	let guestNumber = Number($scope.reportParams.addGuestName);
		// 	let guestName = "Invitado ";
		// 	if(!$scope.objectDetails.attendance.guests){
		// 		$scope.objectDetails.attendance.guests = [];
		// 	}
		// 	while(guestNumber>0){
		// 		let name = guestName + guestNumber;
		// 		$scope.objectDetails.attendance.guests.push({guestName:name});
		// 		guestNumber --;
		// 	}
		// 	$scope.response = { guestsListOk: guestNumber + " agregados a la lista"};
		// 	$scope.reportParams.addGuestName = "";
		// };

	}
]);

/* Controller linked to '/reports/new/:groupId' /reports/view/:reportId and /reports/edit/:reportId
 * It will load the Report for the id passed */
okulusApp.controller('ReportDetailsCntrl',
['$rootScope','$scope','$routeParams', '$location','$firebaseAuth',
 'ReportsSvc', 'GroupsSvc', 'WeeksSvc','MembersSvc','AuditSvc','AuthenticationSvc',
	function($rootScope, $scope, $routeParams, $location, $firebaseAuth,
		ReportsSvc, GroupsSvc, WeeksSvc, MembersSvc,AuditSvc,AuthenticationSvc){


		$firebaseAuth().$onAuthStateChanged(function(authUser){ if(authUser){
			$scope.response = {loading: true, message: systemMsgs.inProgress.loadingReport };
			$scope.objectDetails = {};
			AuthenticationSvc.loadSessionData(authUser.uid).$loaded().then(function (user) {
				/* Only Valid Users (with an associated MemberId) can see the content */
				if(!user.isValid){
					$rootScope.response = {error: true, message: systemMsgs.error.noMemberAssociated};
					$location.path(constants.pages.error);
					return;
				}

				let whichReport = $routeParams.reportId;
				let whichGroup = $routeParams.groupId;
				// console.log(whichReport,whichGroup);

				/* When Group Id available, we are comming from /reports/new/:groupId */
				if(whichGroup){
					$scope.prepareViewForNew(whichGroup);
				}
				/* Prepare for Edit or View Details of Existing Report */
				else{
					$scope.prepareViewForEdit(whichReport,whichGroup);
				}
			});
		}});

		$scope.prepareViewForNew = function (whichGroup) {
			$scope.objectDetails.basicInfo = { dateObj: new Date(), reviewStatus:undefined};
			$scope.objectDetails.study = {};
			$scope.objectDetails.audit = undefined;
			$scope.objectDetails.attendance = { guests:[], members:[] };
			$scope.reportParams = { actionLbl: $rootScope.i18n.reports.newLbl,
															isEdit: false, reportId: undefined,
															//For member attendance
															groupMembersList: new Array() };

			//Get the most recent (by Id) week, with Status Open
			WeeksSvc.getGreatestOpenWeekArray().$loaded().then(function(weekList) {
				if(weekList.length == 1){
					let week = weekList[0];
					$scope.objectDetails.basicInfo.weekId = week.$id;
					$scope.objectDetails.basicInfo.weekName = week.name;
				}
			});

			//Get Group Basic Object to Pre-populate some report fields
			GroupsSvc.getGroupBasicDataObject(whichGroup).$loaded().then(function(groupObj) {
				$scope.objectDetails.basicInfo.groupId = groupObj.$id;
				$scope.objectDetails.basicInfo.groupname = groupObj.name;
				$scope.objectDetails.basicInfo.status = constants.status.completed;

				if(groupObj.roles){
					if(groupObj.roles.leadId){
						$scope.objectDetails.basicInfo.leadId = groupObj.roles.leadId;
						$scope.objectDetails.basicInfo.leadName = groupObj.roles.leadName;
						/*Push the Lead in the groupMembersList, because sometimes the lead
						doesnt have the same baseGroupId */
						$scope.reportParams.groupMembersList.push({name:groupObj.roles.leadName,id:groupObj.roles.leadId});
					}
					if(groupObj.roles.traineeId){
						$scope.objectDetails.basicInfo.traineeId = groupObj.roles.traineeId;
						$scope.objectDetails.basicInfo.traineeName = groupObj.roles.traineeName;
						/*Push the trainee in the groupMembersList, because sometimes the trainee
						doesnt have the same baseGroupId */
						$scope.reportParams.groupMembersList.push({name:groupObj.roles.traineeName,id:groupObj.roles.traineeId});
					}
					if(groupObj.roles.hostId){
						$scope.objectDetails.basicInfo.hostId = groupObj.roles.hostId;
						$scope.objectDetails.basicInfo.hostName = groupObj.roles.hostName;
						/*Push the host in the groupMembersList, because sometimes the host
						doesnt have the same baseGroupId */
						$scope.reportParams.groupMembersList.push({name:groupObj.roles.hostName,id:groupObj.roles.hostId});
					}
				}

				/* Get List of Members with this group as baseGroup, and add them to the
				attendance list (including inactive members).*/
				MembersSvc.getMembersForBaseGroup(whichGroup).$loaded().then(function(list){
					let leadId =
					list.forEach(function(member){
						//Avoid duplicated Elements in Member attendance List (lead, host, and trainee where added previously)
						if(member.$id != groupObj.roles.leadId
								&& member.$id != groupObj.roles.traineeId
								&& member.$id != groupObj.roles.hostId){
							$scope.reportParams.groupMembersList.push({name:member.shortname,id:member.$id});
						}
					});
				});

				$scope.response = undefined;
			}).catch(function(error) {
				$rootScope.response = { error: true, message: error };
				$location.path(constants.pages.error);
			});

		};

		$scope.prepareViewForEdit = function (whichReport,whichGroup) {
			$scope.reportParams = {};
			$scope.reportParams.actionLbl = $rootScope.i18n.reports.modifyLbl;
			$scope.reportParams.isEdit = true;
			$scope.reportParams.reportId = reportObject.$id;
			$scope.response = undefined;
		};

		/* Called from view */
		$scope.addSelectedMemberToAttendancelist = function () {
			let memberId = $scope.reportParams.addMemberId;
			let memberName = document.getElementById('memberSelect').options[document.getElementById('memberSelect').selectedIndex].text;
			addMemberAttendance(memberId,memberName);
		};

		/* Add a member to the attendace list
		1. Create a new Member attendace List, if doesnt exist
		2. When a list is already present, iterate to find if the member is already there
		3. Push the member to the attendace list
		4. Remove member from  "removedMembersMap", if there */
		addMemberAttendance = function(memberId,memberName){
			let memberExist = false;
			$scope.objectDetails.attendance.members.forEach(function(member){
				if(member.memberId == memberId){
					memberExist = true;
				}
			});

			if(memberExist){
				$scope.response = { membersListError: memberName + " "+ systemMsgs.error.duplicatedAttendance};
			}else{
				$scope.objectDetails.attendance.members.push({memberId:memberId,memberName:memberName});
				$scope.response = { membersListOk: memberName + " "+ systemMsgs.success.attendanceAdded};
				/* The removedMembersMap is used to track the members that must be removed from the report,
				and the report should be removed from /member/details/:memberId/attendance
				This is useful when editing an existing report, because an user could:
				1. remove a member from the attendace list (this will add the member Id in removedMembersMap),
				2. and then add the member again. In this case we must delete the member from removedMembersMap */
				if($scope.removedMembersMap){
					$scope.removedMembersMap.delete(memberId);
				}
			}
		}

		/* Remove a Member from the attendace list */
		$scope.removeMemberAttendance = function (whichMember) {
			let memberName = whichMember.memberName;
			let memberId = whichMember.memberId;
			$scope.objectDetails.attendance.members.forEach(function(member,idx) {
				if(member.memberId == memberId){
  				$scope.objectDetails.attendance.members.splice(idx, 1);
					$scope.response = { membersListOk: memberName + " "+ systemMsgs.success.attendanceRemoved};

					if(!$scope.removedMembersMap){
						$scope.removedMembersMap = new Map();
					}
					/*The removedMembersMap will be used when saving the report to identify
					 Members to be removed from the attendance list. Useful when editing an existing report */
					if(!$scope.removedMembersMap.get(memberId) ){
						$scope.removedMembersMap.set(memberId,memberId);
					}
				}
			});
		};

		/* Called from view */
		$scope.addGuestToAttendanceList = function () {
			let guestName = $scope.reportParams.addGuestName;
			addGuestAttendance(guestName);
			$scope.reportParams.addGuestName = "";
		};

		addGuestAttendance = function(guestName){
			let guestExist = false;
			$scope.objectDetails.attendance.guests.forEach(function(member) {
					if(member.guestName == guestName){
						guestExist = true;
					}
			});
			if(guestExist){
				$scope.response = { guestsListError: guestName + " " + systemMsgs.error.duplicatedAttendance};
			}else{
				$scope.objectDetails.attendance.guests.push({guestName:guestName});
				$scope.response = { guestsListOk: guestName + " "+ systemMsgs.success.attendanceAdded};
			}
		};

		$scope.removeGuestAttendance = function (whichGuest) {
			let guestName = whichGuest.guestName;
			$scope.objectDetails.attendance.guests.forEach(function(member,idx) {
					if(member.guestName == guestName){
    				$scope.objectDetails.attendance.guests.splice(idx, 1);
						$scope.response = { guestsListOk: guestName + " "+ systemMsgs.success.attendanceRemoved};
					}
			});
		};

		/*Called to preare the Select with the Host members*/
		$scope.prepareForHostUpdate = function(){
			$scope.response = {working:true, message: systemMsgs.inProgress.loading};

			if(!$scope.reportParams.hostsList){
				$scope.reportParams.hostsList = MembersSvc.getHostMembers();
			}
			$scope.reportParams.hostsList.$loaded().then(function(){
				clearResponse();
				$scope.reportParams.updatingHost = true;
			});
		};

		/*Update the Report hostId according to Host Selection */
		$scope.updateHost = function(){
			clearResponse();
			let hostId = $scope.objectDetails.basicInfo.hostId;
			if(hostId){
				let member = $scope.reportParams.hostsList.$getRecord(hostId);
				$scope.objectDetails.basicInfo.hostName = member.shortname;
			}else{
				$scope.objectDetails.basicInfo.hostId = null;
				$scope.objectDetails.basicInfo.hostName = null;
			}
			$scope.reportParams.updatingHost = false;
		};

		/*Called to preare the Select with the Lead members*/
		$scope.prepareForLeadUpdate = function(){
			$scope.response = {working:true, message: systemMsgs.inProgress.loading};

			if(!$scope.reportParams.leadsList){
				$scope.reportParams.leadsList = MembersSvc.getLeadMembers();
			}
			$scope.reportParams.leadsList.$loaded().then(function(){
				clearResponse();
				$scope.reportParams.updatingLead = true;
			});
		};

		/*Update the Report leadId according to Lead Selection */
		$scope.updateLead = function(){
			clearResponse();
			let leadId = $scope.objectDetails.basicInfo.leadId;
			if(leadId){
				let member = $scope.reportParams.leadsList.$getRecord(leadId);
				$scope.objectDetails.basicInfo.leadName = member.shortname;
			}else{
				$scope.objectDetails.basicInfo.leadId = null;
				$scope.objectDetails.basicInfo.leadName = null;
			}
			$scope.reportParams.updatingLead = false;
		};

		/*Called to preare the Select with the Lead members*/
		$scope.prepareForTraineeUpdate = function(){
			$scope.response = {working:true, message: systemMsgs.inProgress.loading};

			if(!$scope.reportParams.traineesList){
				$scope.reportParams.traineesList = MembersSvc.getTraineeMembers();
			}
			$scope.reportParams.traineesList.$loaded().then(function(){
				clearResponse();
				$scope.reportParams.updatingTrainee = true;
			});
		};

		/*Update the Report traineeId according to Trainee Selection */
		$scope.updateTrainee = function(){
			clearResponse();
			let traineeId = $scope.objectDetails.basicInfo.traineeId;
			if(traineeId){
				let member = $scope.reportParams.traineesList.$getRecord(traineeId);
				$scope.objectDetails.basicInfo.traineeName = member.shortname;
			}else{
				$scope.objectDetails.basicInfo.traineeId = null;
				$scope.objectDetails.basicInfo.traineeName = null;
			}
			$scope.reportParams.updatingTrainee = false;
		};

		/*Called to preare the Select with the Lead members*/
		$scope.prepareForWeekUpdate = function(){
			$scope.response = {working:true, message: systemMsgs.inProgress.loading};

			if(!$scope.reportParams.weeksList){
				$scope.reportParams.weeksList = WeeksSvc.getOpenWeeks();
			}
			$scope.reportParams.weeksList.$loaded().then(function(){
				clearResponse();
				$scope.reportParams.updatingWeek = true;
			});
		};

		/*Update the Report weekId according to Week Selection */
		$scope.updateWeek = function(){
			clearResponse();
			let weekId = $scope.objectDetails.basicInfo.weekId;
			if(weekId){
				let week = $scope.reportParams.weeksList.$getRecord(weekId);
				$scope.objectDetails.basicInfo.weekName = week.name;
			}else{
				$scope.objectDetails.basicInfo.weekId = null;
				$scope.objectDetails.basicInfo.weekName = null;
			}
			$scope.reportParams.updatingWeek = false;
			console.log($scope.objectDetails.basicInfo);
		};

		clearResponse = function() {
			$rootScope.reportResponse = null;
			$scope.response = null;
		};

		return;

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
				$scope.audit = record.audit;
				$scope.reunion = record.reunion;
				if(record.reunion.date){
					$scope.reunion.dateObj = new Date(record.reunion.date.year, record.reunion.date.month-1, record.reunion.date.day);
				}

				$scope.objectDetails.attendance = record.attendance;
				if($scope.objectDetails.attendance.members){
					$scope.objectDetails.attendance.members = Object.values(record.attendance.members);
				}
				if($scope.objectDetails.attendance.guests){
					$scope.objectDetails.attendance.guests = Object.values(record.attendance.guests);
				}
				$scope.reportWeek = WeeksSvc.getWeekObject( record.reunion.weekId );
				$scope.groupMembersList = MembersSvc.getMembersForBaseGroup(record.reunion.groupId);

			}else{
				$location.path( "/error/norecord" );
			}
		}

		// Load all Members for the attendace select
		// $scope.showAllMembers = function(){
		// 	$scope.loadingAllMembers =  true;
		// 	$scope.groupOnlyMembersList = $scope.groupMembersList;
		// 	$scope.groupMembersList = MembersSvc.getAllMembers();
		// 	$scope.groupMembersList.$loaded().then(function() {
		// 		$scope.loadingAllMembers =  false;
		// 	});
		// 	$scope.showingAllMembers = true;
		// };
		//
		// $scope.showGroupMembers = function(){
		// 	$scope.loadingAllMembers =  true;
		// 	$scope.groupMembersList = $scope.groupOnlyMembersList;
		// 	$scope.groupMembersList.$loaded().then(function() {
		// 		$scope.loadingAllMembers =  false;
		// 	});
		// 	$scope.showingAllMembers = false;
		// };

	}
]);

okulusApp.factory('ReportsSvc', ['$rootScope', '$firebaseArray', '$firebaseObject',
	function($rootScope, $firebaseArray, $firebaseObject){

		let reportsRef = firebase.database().ref().child(rootFolder).child('reports');
		let counterRef = firebase.database().ref().child(rootFolder).child('counters/reports');

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
			/*Returns firebaseArray with the Reports for the given week, but limited to a specified amount */
			getReportsForWeekWithLimit: function(weekId, limit){
				let ref = reportsRef.orderByChild("reunion/weekId").equalTo(weekId).limitToLast(limit);
				return $firebaseArray(ref);
			},
			getReportsforWeeksPeriod: function(fromWeek, toWeek){
				let query = reportsRef.orderByChild("reunion/weekId").startAt(fromWeek).endAt(toWeek);
				/*if(groupId){
					Not possible to combien more than one orderByChild
					console.debug("Try second query for group "+groupId)
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
			},
			decreasePendingReportCounter: function() {
				$firebaseObject(counterRef).$loaded().then(
					function( counter ){
						counter.pending = counter.pending-1;
						counter.$save();
					});
			}
		};
	}
]);
