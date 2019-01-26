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

/* Controller linked to '/reports/new/:groupId' /reports/view/:reportId and /reports/edit/:reportId
 * It will load the Report for the id passed */
okulusApp.controller('ReportDetailsCntrl',
['$rootScope','$scope','$routeParams', '$location','$firebaseAuth',
 'ReportsSvc', 'GroupsSvc', 'WeeksSvc','MembersSvc', 'UtilsSvc','AuditSvc','AuthenticationSvc',
	function($rootScope, $scope, $routeParams, $location, $firebaseAuth,
		ReportsSvc, GroupsSvc, WeeksSvc, MembersSvc,UtilsSvc,AuditSvc,AuthenticationSvc){

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
					$scope.prepareViewForEdit(whichReport);
				}
			});
		}});

		$scope.prepareViewForNew = function (whichGroup) {
			$scope.reportParams = { actionLbl: $rootScope.i18n.reports.newLbl,
															isEdit: false, reportId: undefined, dateObj: new Date() };
			//To Control list of available members for attendance
			$scope.reportParams.groupMembersList = new Array()
			// /reports/list
			$scope.objectDetails.basicInfo = { reviewStatus:null};
			// reports/details
			$scope.objectDetails.study = {};
			$scope.objectDetails.audit = undefined;
			$scope.objectDetails.attendance = { guests:[], members:[] };
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
				return GroupsSvc.getGroupRolesObject(whichGroup).$loaded();
			}).then(function(groupRoles) {
				//Pre-populate roles
				if(groupRoles){
					if(groupRoles.leadId){
						$scope.objectDetails.basicInfo.leadId = groupRoles.leadId;
						$scope.objectDetails.basicInfo.leadName = groupRoles.leadName;
					}
					if(groupRoles.traineeId){
						$scope.objectDetails.basicInfo.traineeId = groupRoles.traineeId;
						$scope.objectDetails.basicInfo.traineeName = groupRoles.traineeName;
					}
					if(groupRoles.hostId){
						$scope.objectDetails.basicInfo.hostId = groupRoles.hostId;
						$scope.objectDetails.basicInfo.hostName = groupRoles.hostName;
					}
				}else{
					//To avoid problems when calling prepareMembersForAttendaceListSelect
					groupRoles = {};
				}
				prepareMembersForAttendaceListSelect(whichGroup, groupRoles);
				$scope.response = undefined;
			}).catch(function(error) {
				console.error(error);
				$rootScope.response = { error: true, message: error };
				$location.path(constants.pages.error);
			});
		};

		/* Create a one "normal" Array list to hold all the members (include inactive) with baseGroup = thisGroup
		 plus, the Group's Lead, Host, Trainee (because sometimes those roles have a different baseGroup)*/
		prepareMembersForAttendaceListSelect = function (whichGroup,roles) {
			if(roles.leadId){
				$scope.reportParams.groupMembersList.push({name:roles.leadName,id:roles.leadId});
			}
			if(roles.hostId){
				$scope.reportParams.groupMembersList.push({name:roles.hostName,id:roles.hostId});
			}
			if(roles.traineeId){
				$scope.reportParams.groupMembersList.push({name:roles.traineeName,id:roles.traineeId});
			}
			MembersSvc.getMembersForBaseGroup(whichGroup).$loaded().then(function(list){
				list.forEach(function(member){
					//Avoid duplicated Elements in Member attendance List (lead, host, and trainee where added previously)
					if(member.$id != undefined && member.$id != roles.leadId  && member.$id != roles.traineeId && member.$id != roles.hostId){
						$scope.reportParams.groupMembersList.push({name:member.shortname,id:member.$id});
					}
				});
			});
		};

		/*Used when updating the Lead, Host, or Trainee; to add it in the list for attendance,
		beacuse maybe the selected member has a different basegGroup. Do not add duplicated
		members in the list, to avoid angular duplicity error while painting the select options*/
		pushMemberToAttendanceSelectList = function (memberObj) {
			let memberExist = false;
			$scope.reportParams.groupMembersList.forEach(function(member){
				if(member.id == memberObj.id){
					memberExist = true;
				}
			});
			if(!memberExist){
				$scope.reportParams.groupMembersList.push({name:memberObj.name, id:memberObj.id});
			}
		};

		$scope.prepareViewForEdit = function (whichReport) {
			$scope.reportParams = { actionLbl: $rootScope.i18n.reports.modifyLbl,
															isEdit: true, reportId: whichReport };
			//To Control list of available members for attendance
			$scope.reportParams.groupMembersList = new Array()

			$scope.objectDetails.basicInfo = ReportsSvc.getReportBasicObj(whichReport);
			$scope.objectDetails.basicInfo.$loaded().then(function(report){
				if(report.$value === null){
					$rootScope.response = {error: true, message: systemMsgs.error.recordDoesntExist };
					$location.path(constants.pages.error);
					return;
				}

				$scope.objectDetails.study = ReportsSvc.getReportStudyObject(report.$id);
				$scope.objectDetails.audit = ReportsSvc.getReportAuditObject(report.$id);
				$scope.objectDetails.atten = ReportsSvc.getReportAttendanceObject(report.$id);
				$scope.objectDetails.atten.$loaded().then(function(attendanceObj){
					$scope.objectDetails.attendance = { guests:[], members:[] };
					if(attendanceObj.members){
						$scope.objectDetails.attendance.members = Object.values(attendanceObj.members);
					}
					if(attendanceObj.guests){
						$scope.objectDetails.attendance.guests = Object.values(attendanceObj.guests);
					}
				});
				//Prepare dateObj to populate the date input field
				if(report.date){
					$scope.reportParams.dateObj = new Date(report.date.year, report.date.month-1, report.date.day);
				}

				let roles = {leadId:report.leadId, leadName: report.leadName,
							traineeId: report.traineeId, traineeName: report.traineeName,
							hostId: report.hostId, hostName: report.hostName,}
				prepareMembersForAttendaceListSelect(report.groupId, roles);
				$scope.response = undefined;
			}).catch( function(error){
				console.error(error);
				$rootScope.response = { error: true, message: error };
				$location.path(constants.pages.error);
			});
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
				// $scope.response = { membersListOk: memberName + " "+ systemMsgs.success.attendanceAdded};
				$scope.response = null;
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
			clearResponse();
			let memberName = whichMember.memberName;
			let memberId = whichMember.memberId;
			$scope.objectDetails.attendance.members.forEach(function(member,idx) {
				if(member.memberId == memberId){
  				$scope.objectDetails.attendance.members.splice(idx, 1);
					// $scope.response = { membersListOk: memberName + " "+ systemMsgs.success.attendanceRemoved};
					$scope.reportParams.forceSaveBtnShow = true;
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
				$scope.response = null;
				// $scope.response = { guestsListOk: guestName + " "+ systemMsgs.success.attendanceAdded};
			}
		};

		$scope.removeGuestAttendance = function (whichGuest) {
			clearResponse();
			let guestName = whichGuest.guestName;
			$scope.objectDetails.attendance.guests.forEach(function(member,idx) {
					if(member.guestName == guestName){
    				$scope.objectDetails.attendance.guests.splice(idx, 1);
						$scope.reportParams.forceSaveBtnShow = true;
						// $scope.response = { guestsListOk: guestName + " "+ systemMsgs.success.attendanceRemoved};
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
				pushMemberToAttendanceSelectList({id:hostId, name: member.shortname})
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
				pushMemberToAttendanceSelectList({id:leadId, name: member.shortname})
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
				pushMemberToAttendanceSelectList({id:traineeId, name: member.shortname})
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

		/* Create or Save Changes in a Report */
		$scope.saveReport = function(){
			clearResponse();
			//Validating Report
			$scope.response = { working:true, message: systemMsgs.inProgress.validatingReport };

			//Reports in Approved Status cannot be modified
			if( $scope.objectDetails.basicInfo.reviewStatus  == constants.status.approved){
				$scope.response = { error:true, message: systemMsgs.error.savingApprovedReport };
				return;
			}

			/* Before saving check if updatingHost, updatingTrainee, updatingLead, updatingWeek.
			Any of those values could be true because the user didnt click the save button,
			so, we must update the hostName, traineeName, leadName, or weekName accordingly
			to avoid mismatch in the id and name.*/
			if($scope.reportParams.updatingHost){
				$scope.updateHost();
			}
			if($scope.reportParams.updatingLead){
				$scope.updateLead();
			}
			if($scope.reportParams.updatingTrainee){
				$scope.updateTrainee();
			}
			if($scope.reportParams.updatingWeek){
				$scope.updateWeek();
			}

			//Preparing Report
			$scope.response = { working:true, message: systemMsgs.inProgress.preparingReport };
			$scope.objectDetails.basicInfo.date = UtilsSvc.buildDateJson($scope.reportParams.dateObj);
			let membersAttendanceList = $scope.objectDetails.attendance.members;
			let guestsAttendanceList = $scope.objectDetails.attendance.guests;

			/* When a Report is marked as "Canceled Reunion", some data must be
			 set to default values (Important when editing existing report)*/
			if($scope.objectDetails.basicInfo.status == constants.status.canceled){

				//All Members in Attendance list, if any, need to be moved to "removedMembersMap"
				//so we can delete the report reference in the Member
				if($scope.objectDetails.attendance.members){
					if(!$scope.removedMembersMap){
						$scope.removedMembersMap = new Map();
					}
					$scope.objectDetails.attendance.members.forEach(function(member,idx) {
						$scope.removedMembersMap.set(member.memberId,member.memberId);
					});
				}

				$scope.objectDetails.study = null;
				$scope.objectDetails.attendance = { guests:[], members:[] };
				$scope.objectDetails.basicInfo.duration = 0;
				$scope.objectDetails.basicInfo.money = 0;
				$scope.objectDetails.basicInfo.membersAttendance = 0;
				$scope.objectDetails.basicInfo.guestsAttendance = 0;
				$scope.objectDetails.basicInfo.totalAttendance = 0;
			}else{
				$scope.objectDetails.basicInfo.membersAttendance = membersAttendanceList?membersAttendanceList.length:0;
				$scope.objectDetails.basicInfo.guestsAttendance = guestsAttendanceList?guestsAttendanceList.length:0;
				$scope.objectDetails.basicInfo.totalAttendance = $scope.objectDetails.basicInfo.membersAttendance + $scope.objectDetails.basicInfo.guestsAttendance;
			}

			$scope.response = { working:true, message: systemMsgs.inProgress.savingReport };

			//Save Updates: Only valid for reports in "pending" or "rejected" review status
			if($scope.reportParams.isEdit){
				if($scope.objectDetails.basicInfo.reviewStatus == constants.status.rejected){
					//decrease Rejected Reports Count
					ReportsSvc.decreaseRejectedReportsCount();
					//Change this report to Pendind status
					$scope.objectDetails.basicInfo.reviewStatus = constants.status.pendingReview;
					//Increase Pending Reports Count
					ReportsSvc.increasePendingReportsCount();
				}
				//else: reviewStatus will be "pending", because "approved" reports cannot be modified
				//Save changes in the $firebaseObject itself
				$scope.objectDetails.basicInfo.$save().then(function(ref){
					let report = $scope.objectDetails.basicInfo;
					if($scope.objectDetails.study){
						$scope.objectDetails.study.$save();
					}else{
						ReportsSvc.setReportStudyInfo(null,report.$id);
					}

					/* If the reports comes with canceled status, we should consider the possibility
					 where the same report was "completed" before and had a members attendance list.
					 In this case we should remove the reference to this report from all members. */
					if($scope.objectDetails.basicInfo.status == constants.status.canceled){
						if(!$scope.removedMembersMap){
							$scope.removedMembersMap = new Map();
						}
						//iterate over the members attendance list and push records to removedMembersMap
						let membersList = Object.values($scope.objectDetails.atten.members);
						membersList.forEach(function(elem){
							$scope.removedMembersMap.set(elem.memberId, elem.memberId);
						});
						membersAttendanceList = [];
						guestsAttendanceList = [];
					}
					/* When editing a report, some members from the original list could have been removed,
					so we need to remove the reference to the Report from the Member */
					ReportsSvc.removeReportRefereceFromMembers($scope.removedMembersMap, report.$id );

					//Always clean the Report's attendace folders, and set again
					$scope.objectDetails.atten.members = null;
					$scope.objectDetails.atten.guests = null;
					$scope.objectDetails.atten.$save();
					ReportsSvc.setMembersAttendaceList(membersAttendanceList,report);
					ReportsSvc.setGuestAttendaceList(guestsAttendanceList,report);

					AuditSvc.recordAudit(report.$id, constants.actions.update, constants.folders.reports);
					$scope.response = { success:true, message: systemMsgs.success.reportUpdated };
				});
			}
			//Create new Report
			else{
				let reportRef = ReportsSvc.getNewReportBasicRef();
				let reportBasicInfo = $scope.objectDetails.basicInfo;
				let reportStudyInfo = $scope.objectDetails.study;
				//New Reports get created with reviewStatus = pending
				reportBasicInfo.reviewStatus = constants.status.pendingReview;
				//Persisit objecto to DB
				reportRef.set(reportBasicInfo);

				//Get Object after creation, and perform the rest of pendind tasks
				let reportObj = ReportsSvc.getReportBasicObj(reportRef.key);
				reportObj.$loaded().then(function(report){
					ReportsSvc.increaseTotalReportsCount();
					ReportsSvc.increasePendingReportsCount();
					ReportsSvc.setReportStudyInfo(reportStudyInfo,report.$id);
					//Members ans Guests attendace list is added separately from the report basic info
					ReportsSvc.setMembersAttendaceList(membersAttendanceList,report);
					ReportsSvc.setGuestAttendaceList(guestsAttendanceList,report);
					//No need to removeReportRefereceFromMembers when creating a new report
					//ReportsSvc.removeReportRefereceFromMembers($scope.removedMembersMap,report.$id);

					//Save a reference to this Report in the /group/details/reports folder
					GroupsSvc.addReportReferenceToGroup(report);
					AuditSvc.recordAudit(report.$id, constants.actions.create, constants.folders.reports);
					$rootScope.reportResponse = { created:true, message: systemMsgs.success.reportCreated };
					$location.path(constants.pages.reportEdit+report.$id);
				});
			}
			$scope.reportParams.forceSaveBtnShow = false;
		};

		/* When deleting a Report:
			- Remove the Report from /report/list and /report/details
			- Decrease the Report Status (approved, rejected, pendidng) count, and total count
			- Create Audit for Report Removed
			- Remove the Report reference from the Group
			- Remove the Report reference from all Members in Attendance List
		*/
		$scope.removeReport = function(){
			clearResponse();
			$scope.response = { working:true, message: systemMsgs.inProgress.removingReport };
			//Normal Users only can remove reports pending to approve
			if($rootScope.currentSession.user.type != 'admin' && $scope.objectDetails.basicInfo.reviewStatus != 'pending' ){
				$scope.response = { error:true, message: systemMsgs.error.userRemovingReport };
			}
			//Even admins cannot remove a report if it is already approved
			else if( $scope.objectDetails.basicInfo.reviewStatus == constants.status.approved){
				$scope.response = { error:true, message: systemMsgs.error.cantRemoveApprovedReport };
			}else{
				//Admin removing a Pending or Rejected report or User removing a Pending Report
				let reportId = $scope.objectDetails.basicInfo.$id;
				let groupId = $scope.objectDetails.basicInfo.groupId;
				let reviewStatus = $scope.objectDetails.basicInfo.reviewStatus;
				//Remove /report/list
				$scope.objectDetails.basicInfo.$remove().then(function(ref){
					//Audit on Report Delete
					AuditSvc.recordAudit(reportId, constants.actions.delete, constants.folders.reports);
					//Decrease total reports count
					ReportsSvc.decreaseTotalReportsCount();
					//Decrease pending or rejected count
					if(reviewStatus == constants.status.pendingReview){
						ReportsSvc.decreasePendingReportsCount();
					}else if(reviewStatus == constants.status.rejected){
						ReportsSvc.decreaseRejectedReportsCount();
					}
					//Remove the Report reference from the Group
					GroupsSvc.removeReportReferenceFromGroup(groupId,reportId);
					//Remove the Report reference from all Members in Attendance List
					let membersList = Object.values($scope.objectDetails.atten.members);
					membersList.forEach(function(record){
							MembersSvc.removeReportReferenceFromMember(record.memberId, reportId);
					});
					//Remove /report/list and /report/details
					ReportsSvc.removeReportDetails(reportId);
					//Redirect
					$rootScope.reportResponse = { deleted:true, message: systemMsgs.success.reportDeleted };
					$location.path( constants.pages.reportNew + groupId );
				});

			}
		};

		$scope.approveReport = function(){
			clearResponse();
			$scope.response = { working:true, message: systemMsgs.inProgress.approvingReport };

			let originalStatus = $scope.objectDetails.basicInfo.reviewStatus;
			$scope.objectDetails.basicInfo.reviewStatus = constants.status.approved;
			$scope.objectDetails.basicInfo.$save().then(function(ref){
				//increase approved count
				ReportsSvc.increaseApprovedReportsCount();
				//decrease pending or rejected count
				if(originalStatus == constants.status.pendingReview){
					ReportsSvc.decreasePendingReportsCount();
				}else if(originalStatus == constants.status.rejected){
					ReportsSvc.decreaseRejectedReportsCount();
				}
				AuditSvc.recordAudit(ref.key, constants.actions.approve, constants.folders.reports);
				$scope.response = { success:true, message: systemMsgs.success.reportApproved };
				$scope.reportParams.forceSaveBtnShow = false;
			});
		};

		$scope.rejectReport = function(){
			clearResponse();
			$scope.response = { working:true, message: systemMsgs.inProgress.rejectingReport };

			let originalStatus = $scope.objectDetails.basicInfo.reviewStatus;
			$scope.objectDetails.basicInfo.reviewStatus = constants.status.rejected;
			$scope.objectDetails.basicInfo.$save().then(function(ref){
				//increase rejected count
				ReportsSvc.increaseRejectedReportsCount();
				//decrease pending or approved count
				if(originalStatus == constants.status.pendingReview){
					ReportsSvc.decreasePendingReportsCount();
				}else if(originalStatus == constants.status.approved){
					ReportsSvc.decreaseApprovedReportsCount();
				}
				AuditSvc.recordAudit(ref.key, constants.actions.reject, constants.folders.reports);
				$scope.response = { success:true, message: systemMsgs.success.reportRejected };
				$scope.reportParams.forceSaveBtnShow = false;
			});
		};

		clearResponse = function() {
			$rootScope.reportResponse = null;
			$scope.response = null;
		};

}]);

okulusApp.factory('ReportsSvc',
	['$firebaseArray', '$firebaseObject', 'MembersSvc',
	function($firebaseArray, $firebaseObject, MembersSvc){

		let baseRef = firebase.database().ref().child(rootFolder);
		let reportsListRef = baseRef.child(constants.folders.reportsList);
		let reportsDetailsRef = baseRef.child(constants.folders.reportsDetails);
		let reportsRef = baseRef.child('reports');
		let counterRef = baseRef.child('counters/reports');

		/*Using a Transaction with an update function to reduce the counter by 1 */
		let decreaseCounter = function(counterRef){
			counterRef.transaction(function(currentCount) {
				if(currentCount>0)
					return currentCount - 1;
				return currentCount;
			});
		};

		/*Using a Transaction with an update function to increase the counter by 1 */
		let increaseCounter = function(counterRef){
			counterRef.transaction(function(currentCount) {
				return currentCount + 1;
			});
		};

		return {
			/*Return the reference to an exisitng Report's Basic Info */
			//Deprecated
			getReportBasicRef: function(reportId){
				return reportsListRef.child(reportId);
			},
			/*Create a new Key in reports/list and return it */
			getNewReportBasicRef: function(){
				return reportsListRef.push();
			},
			/* Return a $firebaseObject from reports/list s*/
			getReportBasicObj: function(reportId){
				return $firebaseObject(reportsListRef.child(reportId));
			},
			/* Get report audit from firebase and return as object */
			getReportAuditObject: function(whichReportId){
				return $firebaseObject(reportsDetailsRef.child(whichReportId).child(constants.folders.audit));
			},
			/* Get report attendace list from firebase and return as object */
			getReportAttendanceObject: function(whichReportId){
				return $firebaseObject(reportsDetailsRef.child(whichReportId).child(constants.folders.attendance));
			},
			/* Get report study from firebase and return as object */
			getReportStudyObject: function(whichReportId){
				return $firebaseObject(reportsDetailsRef.child(whichReportId).child(constants.folders.study));
			},
			removeReportDetails: function(whichReportId){
				return reportsDetailsRef.child(whichReportId).set(null);
			},
			/* Increment the number of Reports with reviewStatus = "approved"  */
			increaseApprovedReportsCount: function() {
				let conunterRef = baseRef.child(constants.folders.approvedReportsCount);
				increaseCounter(conunterRef);
			},
			/* Reduce the number of Reports with reviewStatus = "approved"  */
			decreaseApprovedReportsCount: function() {
				let conunterRef = baseRef.child(constants.folders.approvedReportsCount);
				decreaseCounter(conunterRef);
			},
			/* Increment the number of Reports with reviewStatus = "rejected"  */
			increaseRejectedReportsCount: function() {
				let conunterRef = baseRef.child(constants.folders.rejectedReportsCount);
				increaseCounter(conunterRef);
			},
			/* Reduce the number of Reports with reviewStatus = "rejected"  */
			decreaseRejectedReportsCount: function() {
				let conunterRef = baseRef.child(constants.folders.rejectedReportsCount);
				decreaseCounter(conunterRef);
			},
			/* Increment the number of Reports with reviewStatus = "pending"  */
			increasePendingReportsCount: function() {
				let conunterRef = baseRef.child(constants.folders.pendingReportsCount);
				increaseCounter(conunterRef);
			},
			/* Reduce the number of Reports with reviewStatus = "pending"  */
			decreasePendingReportsCount: function() {
				let conunterRef = baseRef.child(constants.folders.pendingReportsCount);
				decreaseCounter(conunterRef);
			},
			/* Increment the number of total Reports */
			increaseTotalReportsCount: function() {
				let conunterRef = baseRef.child(constants.folders.totalReportsCount);
				increaseCounter(conunterRef);
			},
			/* Reduce the number of total Reports */
			decreaseTotalReportsCount: function() {
				let conunterRef = baseRef.child(constants.folders.totalReportsCount);
				decreaseCounter(conunterRef);
			},
			/* Set the members attendance list in the /reports/details/:reportId/attendance/members folder */
			setMembersAttendaceList: function(attendanceList, report) {
				if(attendanceList){
					attendanceList.forEach(function(member) {
						reportsDetailsRef.child(report.$id).child(constants.folders.membersAttendance).child(member.memberId).set(
							{memberId:member.memberId, memberName:member.memberName}
						);
						MembersSvc.addReportReferenceToMember(member.memberId, report);
					});
				}
			},
			/* Set the guests attendance list in the /reports/details/:reportId/attendance/guests folder */
			setGuestAttendaceList: function(attendanceList, report) {
				if(attendanceList){
					attendanceList.forEach(function(guest) {
						reportsDetailsRef.child(report.$id).child(constants.folders.guestsAttendance).push({guestName:guest.guestName});
					});
				}
			},
			/* Save the Report Study info in /reports/details/:reportId/study/ */
			setReportStudyInfo: function(reportStudyInfo, reportId) {
				reportsDetailsRef.child(reportId).child(constants.folders.study).set(reportStudyInfo);
			},
			/* Set the guests attendance list in the /reports/details/:reportId/attendance/guests folder */
			removeReportRefereceFromMembers: function(membersMap, reportId) {
				if(membersMap){
					membersMap.forEach(function(value, key) {
						//both value and key are = memberId
						MembersSvc.removeReportReferenceFromMember(value, reportId);
					});
				}
			},

			//Deprecated
			getReportObj: function(reportId){
				return $firebaseObject(reportsListRef.child(reportId));
			},
			getReportsForWeek: function(weekId){
				let ref = reportsListRef.orderByChild("weekId").equalTo(weekId);
				return $firebaseArray(ref);
			},
			/*Returns firebaseArray with the Reports for the given week, but limited to a specified amount */
			getReportsForWeekWithLimit: function(weekId, limit){
				let ref = reportsListRef.orderByChild("weekId").equalTo(weekId).limitToLast(limit);
				return $firebaseArray(ref);
			},
			getReportsforWeeksPeriod: function(fromWeek, toWeek){
				let query = reportsListRef.orderByChild("weekId").startAt(fromWeek).endAt(toWeek);
				/*if(groupId){
					Not possible to combien more than one orderByChild
					console.debug("Try second query for group "+groupId)
					let query2 = query.orderByChild("reunion/groupId").equalTo(groupId);
					return $firebaseArray(query2);
				}*/
				return $firebaseArray(query);
			}
		};
	}
]);
