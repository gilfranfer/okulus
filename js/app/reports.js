/* Mapping: /reports
	List of Reports for the Admin user */
okulusApp.controller('ReportsListCntrl',
	['$rootScope','$scope','$firebaseAuth','$location','ReportsSvc','GroupsSvc','AuthenticationSvc',
	function($rootScope,$scope,$firebaseAuth,$location,ReportsSvc,GroupsSvc,AuthenticationSvc){

		let unwatch = undefined;
		/* Executed everytime we enter to /groups
		  This function is used to confirm the user is Admin */
		$scope.response = {loading: true, message: systemMsgs.inProgress.loading };
		$firebaseAuth().$onAuthStateChanged(function(authUser){ if(authUser){
			AuthenticationSvc.loadSessionData(authUser.uid).$loaded().then( function(user){
				if(user.type == constants.roles.user){
					$rootScope.response = {error:true, showHomeButton: true, message:systemMsgs.error.noPrivileges};
					$location.path(constants.pages.error);
				}else{
					/* Get All Groups List, because Admin has access to all of them.
					This is useful for the groupSelectModal triggered from Create Report Button*/
					$rootScope.currentSession.accessGroups = GroupsSvc.getAllGroups();
					/*Load Report Counters and Set Watch*/
					$rootScope.reportsGlobalCount = ReportsSvc.getGlobalReportsCounter();
					$rootScope.reportsGlobalCount.$loaded().then(
						function(reportsCount) {
							$scope.response = undefined;
							/* Adding a Watch to the reportsGlobalCount to detect changes.
							The idea is to update the maxPossible value from adminReportsParams.*/
							if(unwatch){ unwatch(); }
							unwatch = $rootScope.reportsGlobalCount.$watch( function(data){
								if($rootScope.adminReportsParams){
									let loader = $rootScope.adminReportsParams.activeLoader;
									$rootScope.adminReportsParams = getParamsByLoader(loader);
									$scope.response = undefined;
								}
							});
					});
				}
			});
		}});

		/* Sorting */
		$scope.selectedSortBy="$id";
		$scope.reverseSort=false;
		$scope.sortOptions=[{text:$scope.i18n.reports.reportLbl, value:"$id",active:"active"},
												{text:$scope.i18n.groups.groupLbl, value:"groupname",active:""},
												{text:$scope.i18n.weeks.weekLbl, value:"weekName",active:""}];

		$scope.setSortBy = function(option) {
			$scope.sortOptions.forEach(function(option){
				option.active="";
			});
			option.active = "active";
			$scope.selectedSortBy = option.value;
		};

		$scope.setSortOrder = function(reverse) {
			$scope.reverseSort = reverse;
		};

		/* All the following on-demand loaders (called from html view) will limit the
		 initial result list to the maxQueryListResults value (from $rootScope.config).
		 They will create a params object containing the name of the loader used,
		 and determining the max possible records to display. */
		$scope.loadAllReportsList = function () {
			$scope.response = {loading:true, message:systemMsgs.inProgress.loadingAllReports};
			$rootScope.adminReportsParams = getParamsByLoader("AllReportsLoader");
			$rootScope.adminReportsList = ReportsSvc.getAllReports();
			whenReportsRetrieved();
		};

		$scope.loadApprovedReportsList = function () {
 			$scope.response = {loading:true, message:systemMsgs.inProgress.loadingApprovedReports};
 			$rootScope.adminReportsParams = getParamsByLoader("ApprovedReportsLoader");
 			$rootScope.adminReportsList = ReportsSvc.getApprovedReports($rootScope.config.maxQueryListResults);
 			whenReportsRetrieved();
		};

		$scope.loadRejectedReportsList = function () {
 			$scope.response = {loading:true, message:systemMsgs.inProgress.loadingRejectedReports};
 			$rootScope.adminReportsParams = getParamsByLoader("RejectedReportsLoader");
 			$rootScope.adminReportsList = ReportsSvc.getRejectedReports($rootScope.config.maxQueryListResults);
 			whenReportsRetrieved();
		};

		$scope.loadPendingReportsList = function () {
 			$scope.response = {loading:true, message:systemMsgs.inProgress.loadingPendingReports};
 			$rootScope.adminReportsParams = getParamsByLoader("PendingReportsLoader");
 			$rootScope.adminReportsList = ReportsSvc.getPendingReports($rootScope.config.maxQueryListResults);
 			whenReportsRetrieved();
		};

		/* Load ALL pending reports. Use the adminReportsParams.activeLoader
		to determine what type of reports should be loaded, and how. */
		$scope.loadPendingReports = function () {
			let loaderName = $rootScope.adminReportsParams.activeLoader;
			$scope.response = {loading: true, message: systemMsgs.inProgress.loading };
			if(loaderName=="AllReportsLoader"){
				$rootScope.adminReportsList = ReportsSvc.getAllReports();
			} else if(loaderName=="ApprovedReportsLoader"){
				$rootScope.adminReportsList = ReportsSvc.getApprovedReports();
			} else if(loaderName=="RejectedReportsLoader"){
				$rootScope.adminReportsList = ReportsSvc.getRejectedReports();
			} else if(loaderName=="PendingReportsLoader"){
				$rootScope.adminReportsList = ReportsSvc.getPendingReports();
			}
			whenReportsRetrieved();
		};

		/*Build object with Params used in the view.
		 activeLoader: Will help to identify what type of reports we want to load.
		 searchFilter: Container for the view filter
		 title: Title of the Reports List will change according to the loader in use
		 maxPossible: Used to inform the user how many elements are pending to load */
		getParamsByLoader = function (loaderName) {
			let params = {activeLoader:loaderName, searchFilter:undefined};
			if(loaderName == "AllReportsLoader"){
				params.title= systemMsgs.success.allReportsTitle;
				params.maxPossible = $rootScope.reportsGlobalCount.total;
			}
			else if(loaderName == "ApprovedReportsLoader"){
				params.title= systemMsgs.success.approvedReportsTitle;
				params.maxPossible = $rootScope.reportsGlobalCount.approved;
			}
			else if(loaderName == "RejectedReportsLoader"){
				params.title= systemMsgs.success.rejectedReportsTitle;
				params.maxPossible = $rootScope.reportsGlobalCount.rejected;
			}
			else if(loaderName == "PendingReportsLoader"){
				params.title= systemMsgs.success.pendingReportsTitle;
				params.maxPossible = $rootScope.reportsGlobalCount.pending;
			}
			return params;
		};

		/*Prepares the response after the reports list is loaded */
		whenReportsRetrieved = function () {
			$rootScope.adminReportsList.$loaded().then(function(reports) {
				$scope.response = undefined;
				$rootScope.reportResponse = null;
				if(!reports.length){
					$scope.response = { error: true, message: systemMsgs.error.noReportsError };
				}
			}).catch( function(error){
				$scope.response = { error: true, message: systemMsgs.error.loadingReportsError };
				console.error(error);
			});
		};

	}
]);

/* Mapping: /myreports
	List of Reports for the normal user */
okulusApp.controller('MyReportsCntrl',
	['$rootScope','$scope','$location','$firebaseAuth',
	'AuthenticationSvc','MembersSvc','ReportsSvc','GroupsSvc',
	function($rootScope,$scope,$location,$firebaseAuth,
		AuthenticationSvc, MembersSvc, ReportsSvc, GroupsSvc){

		/* Executed everytime we enter to /myreports
		  This function is used to confirm the user is Admin */
		$scope.response = {loading: true, message: systemMsgs.inProgress.loading };
		$firebaseAuth().$onAuthStateChanged(function(authUser){ if(authUser){
			AuthenticationSvc.loadSessionData(authUser.uid).$loaded().then(function(user){
				/* Only Valid Users (with an associated MemberId) can see the content */
				if($rootScope.currentSession.user.type != constants.roles.root && !user.memberId){
					$rootScope.response = {error: true, showHomeButton:true, message: systemMsgs.error.noMemberAssociated};
					$location.path(constants.pages.error);
					return;
				}

				/* Get Access Rules for a valid existing user, and use them to load the groups
				it has access to. This is useful for the groupSelectModal triggered from Quick Actions*/
				$rootScope.currentSession.accessGroups = [];
				$rootScope.currentSession.accessRules = MembersSvc.getMemberAccessRules(user.memberId);
				$rootScope.currentSession.accessRules.$loaded().then(function(rules){
					rules.forEach(function(rule){
						$rootScope.currentSession.accessGroups.push(GroupsSvc.getGroupBasicDataObject(rule.groupId));
					});
					$scope.response = undefined;
				});

			});

		}});

		/* Sorting */
		$scope.selectedSortBy="$id";
		$scope.reverseSort=false;
		$scope.sortOptions=[{text:$scope.i18n.reports.reportLbl, value:"$id",active:"active"},
												{text:$scope.i18n.groups.groupLbl, value:"groupname",active:""},
												{text:$scope.i18n.weeks.weekLbl, value:"weekName",active:""}];

		$scope.setSortBy = function(option) {
			$scope.sortOptions.forEach(function(option){
				option.active="";
			});
			option.active = "active";
			$scope.selectedSortBy = option.value;
		};

		$scope.setSortOrder = function(reverse) {
			$scope.reverseSort = reverse;
		};

		$scope.loadPendingReports = function(){
			$scope.getUserReports($scope.myReportsParams.activeLoader, true);
		};

		$scope.getUserReports = function(status, loadAll){
			$scope.response = {loading: true, message: systemMsgs.inProgress.loading };
      $scope.filteredReportsList = undefined;

			/* Reports by status must be filtered from the whole User's reports */
			if(!$scope.allUserReports){
				$scope.allUserReports = ReportsSvc.getReportsCreatedByUser($rootScope.currentSession.user.$id);
			}

			/* Build params used in the view */
			let params = {activeLoader:status, searchFilter:undefined};
			if(status == constants.status.pending){
				params.title= systemMsgs.success.pendingReportsTitle;
				params.maxPossible = $rootScope.currentSession.user.counters.reports.pending;
			}else if(status == constants.status.approved){
				params.title= systemMsgs.success.approvedReportsTitle;
				params.maxPossible = $rootScope.currentSession.user.counters.reports.approved;
			}else if(status == constants.status.rejected){
				params.title= systemMsgs.success.rejectedReportsTitle;
				params.maxPossible = $rootScope.currentSession.user.counters.reports.rejected;
			}else{
				params.title= systemMsgs.success.allReportsTitle;
				params.maxPossible = $rootScope.currentSession.user.counters.reports.total;
			}
			$scope.myReportsParams = params;

			/* Proceed to filter the User's reports by the passed status. If no status
			was passed is because the user want to see all reports, but we still need
			to filter, to controll the amount of reports to return. */
			let maxResults = $rootScope.config.maxQueryListResults;
			$scope.allUserReports.$loaded().then(function(reportsList) {
				$scope.filteredReportsList = new Array();
				reportsList.forEach(function(report){
					if(report.reviewStatus == status || !status){
						maxResults --;
						/* Limit the number of reports pushed to the Array */
						if(!loadAll && maxResults<0){return}
						$scope.filteredReportsList.push(report);
					}
				});

				if(!$scope.filteredReportsList.length){
					$scope.response = { error: true, message: systemMsgs.error.noMemberReportsFound };
				}else{
					$scope.response = null;
				}
			});

		};

	}
]);

/* Controller linked to '/reports/new/:groupId' /reports/view/:reportId and /reports/edit/:reportId
 * It will load the Report for the id passed, and prepare everything for Edit
 * All methods to update the Report elements are here: save, delete, update */
okulusApp.controller('ReportDetailsCntrl',
['$rootScope','$scope','$routeParams', '$location','$firebaseAuth',
 'ReportsSvc', 'GroupsSvc', 'WeeksSvc','MembersSvc','AuditSvc','NotificationsSvc','AuthenticationSvc',
	function($rootScope, $scope, $routeParams, $location, $firebaseAuth,
		ReportsSvc, GroupsSvc, WeeksSvc, MembersSvc, AuditSvc, NotificationsSvc, AuthenticationSvc){

		$firebaseAuth().$onAuthStateChanged(function(authUser){ if(authUser){
			$scope.response = {loading: true, message: systemMsgs.inProgress.loadingReport };
			$scope.objectDetails = {};
			AuthenticationSvc.loadSessionData(authUser.uid).$loaded().then(function (user) {
				/* Only Valid Users (with an associated MemberId) can see the content */
				if($rootScope.currentSession.user.type != constants.roles.root && !user.memberId){
					$rootScope.response = {error: true, message: systemMsgs.error.noMemberAssociated};
					$location.path(constants.pages.error);
					return;
				}

				let whichGroup = $routeParams.groupId;
				let whichReport = $routeParams.reportId;
				/* When groupId is available, we are comming from /reports/new/:groupId
				and trying to create a new report for the provided group*/
				if(whichGroup){
					$scope.prepareViewForNew(whichGroup);
				}
				/* When reportId is available, we are comming from /reports/edit/:reportId
				or  /reports/view/:reportId and trying to retrieve an existing report */
				else if(whichReport){
					$scope.prepareViewForEdit(whichReport);
				}
			});
		}});

		$scope.basicInfoExpanded = true;
		$scope.rolesInfoExpanded = true;
		$scope.studyInfoExpanded = true;
		$scope.notesInfoExpanded = true;
		$scope.feedbackInfoExpanded = true;
		$scope.attendanceInfoExpanded = true;
		$scope.auditInfoExpanded = false;
		$scope.expandSection = function(section, value) {
			switch (section) {
				case 'basicInfo':
					$scope.basicInfoExpanded = value;
					break;
				case 'rolesInfo':
					$scope.rolesInfoExpanded = value;
					break;
				case 'studyInfo':
					$scope.studyInfoExpanded = value;
					break;
				case 'attendanceInfo':
					$scope.attendanceInfoExpanded = value;
					break;
				case 'notesInfo':
					$scope.notesInfoExpanded = value;
					break;
				case 'feedbackInfo':
					$scope.feedbackInfoExpanded = value;
					break;
				case 'auditInfo':
					$scope.auditInfoExpanded = value;
					break;
				default:
			}
		};

		$scope.prepareViewForNew = function (whichGroup) {
			$scope.reportParams = { actionLbl: $rootScope.i18n.reports.newLbl,
															isEdit: false, reportId: undefined, dateObj: new Date() };
			//To Control list of available members for attendance
			$scope.reportParams.groupMembersList = new Array()
			// /reports/list
			$scope.objectDetails.basicInfo = { reviewStatus:null, onTime:true, duration: $rootScope.config.reports.minDuration};
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
					$scope.objectDetails.study.study = week.study;
					$scope.objectDetails.study.series = week.series;
					$scope.reportParams.selectedWeek = week;
				}
			});
			//Get Group Basic Object to Pre-populate some report fields
			GroupsSvc.getGroupBasicDataObject(whichGroup).$loaded().then(function(groupObj) {
				if(groupObj.$value === null){
					$rootScope.response = { error: true, message: systemMsgs.error.inexistingGroup };
					$location.path(constants.pages.error);
					return;
				}
				else if(!groupObj.isActive){
					$rootScope.response = { error: true, message: systemMsgs.error.inactiveGroup };
					$location.path(constants.pages.error);
					return;
				}

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
			MembersSvc.getMembersForBaseGroup(whichGroup).$loaded().then(function(list){
				list.forEach(function(member){
					if(member.$id != undefined){
						$scope.reportParams.groupMembersList.push({id:member.$id,name:member.shortname,sex:member.sex});
					}
				});
				//Proceed to add Roles to the Members list
				if(roles.leadId){
					MembersSvc.getMemberSex(roles.leadId).$loaded().then(function(sex) {
						pushMemberToAttendanceSelectList({id:roles.leadId, name: roles.leadName, sex:sex.$value})
					});
				}
				if(roles.hostId){
					MembersSvc.getMemberSex(roles.leadId).$loaded().then(function(sex) {
						pushMemberToAttendanceSelectList({id:roles.hostId, name: roles.hostName, sex:sex.$value})
					});
				}
				if(roles.traineeId){
					MembersSvc.getMemberSex(roles.leadId).$loaded().then(function(sex) {
						pushMemberToAttendanceSelectList({id:roles.traineeId, name: roles.traineeName, sex:sex.$value})
					});
				}
			});
		};

		/*Used when updating the Lead, Host, or Trainee; to add it in the list for attendance,
		because maybe the selected member has a different basegGroup. Do not add duplicated
		members in the list, to avoid angular duplicity error while painting the select options*/
		pushMemberToAttendanceSelectList = function (memberObj) {
			let memberExist = false;
			$scope.reportParams.groupMembersList.forEach(function(member){
				if(member.id == memberObj.id){
					memberExist = true;
				}
			});

			if(!memberExist){
				$scope.reportParams.groupMembersList.push({id:memberObj.id, name:memberObj.name, sex:memberObj.sex})
			}
		};

		$scope.prepareViewForEdit = function (whichReport) {
			$scope.reportParams = { actionLbl: null, isEdit: true, reportId: whichReport };
			//To Control list of available members for attendance
			$scope.reportParams.groupMembersList = new Array();

			$scope.objectDetails.basicInfo = ReportsSvc.getReportBasicObj(whichReport);
			$scope.objectDetails.basicInfo.$loaded().then(function(report){
				if(report.$value === null){
					$rootScope.response = {error: true, message: systemMsgs.error.recordDoesntExist };
					$location.path(constants.pages.error);
					return;
				}

				$scope.objectDetails.feedback = ReportsSvc.getReportFeedback(report.$id);
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
					let date = new Date();
					date.setTime(report.dateMilis);
					$scope.reportParams.dateObj = date;
				}

				let roles = {leadId:report.leadId, leadName: report.leadName,
							traineeId: report.traineeId, traineeName: report.traineeName,
							hostId: report.hostId, hostName: report.hostName}
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
			let selectedMemberId = $scope.reportParams.addMemberId;
			$scope.reportParams.groupMembersList.some(function(member) {
				if(member.id == selectedMemberId){
					memberObj = member;
					addMemberAttendance(member);
				}
				//short-circuit. Stop the loop when the member was found
				return member.id == selectedMemberId;
			});
		};

		$scope.addAllMembersToAteendace = function () {
			$scope.reportParams.groupMembersList.forEach(function(member){
				addMemberAttendance(member);
			});
		};

		/* Add a member to the attendace list
		1. Create a new Member attendace List, if doesnt exist
		2. When a list is already present, iterate to find if the member is already there
		3. Push the member to the attendace list
		4. Remove member from  "removedMembersMap", if there */
		addMemberAttendance = function(memberObj){
			let memberExist = false;
			$scope.objectDetails.attendance.members.some(function(member){
				if(member.memberId == memberObj.id){
					memberExist = true;
				}
				return member.memberId == memberObj.id;
			});

			if(memberExist){
				$scope.response = { membersListError: memberObj.name + " "+ systemMsgs.error.duplicatedAttendance};
			}else{
				$scope.objectDetails.attendance.members.push({memberId:memberObj.id, memberName:memberObj.name, sex:memberObj.sex});
				$scope.response = null;
				/* The removedMembersMap is used to track the members that must be removed from the report,
				and the report should be removed from /member/details/:memberId/attendance
				This is useful when editing an existing report, because an user could:
				1. remove a member from the attendace list (this will add the member Id in removedMembersMap),
				2. and then add the member again. In this case we must delete the member from removedMembersMap */
				if($scope.removedMembersMap){
					$scope.removedMembersMap.delete(memberObj.id);
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
			let guestSex = $scope.reportParams.addGuestSex;
			let addGuestNameQty = $scope.reportParams.addGuestNameQty;
			if($scope.multipleGuestActive && addGuestNameQty > 1){
				//Adding more than 1 guest will create: <Guest name> - <#>
				while(addGuestNameQty>0){
					addGuestAttendance(guestName + " "+addGuestNameQty, guestSex);
					addGuestNameQty--;
				}
			}else{
				addGuestAttendance(guestName, guestSex);
			}
			$scope.reportParams.addGuestName = "";
			$scope.reportParams.addGuestNameQty = 1;
		};

		addGuestAttendance = function(guestName, guestSex){
			let guestExist = false;
			$scope.objectDetails.attendance.guests.forEach(function(member) {
					if(member.guestName == guestName){
						guestExist = true;
					}
			});
			if(guestExist){
				$scope.response = { guestsListError: guestName + " " + systemMsgs.error.duplicatedAttendance};
			}else{
				$scope.objectDetails.attendance.guests.push({guestName:guestName, sex:guestSex});
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
				pushMemberToAttendanceSelectList({id:hostId, name:member.shortname, sex:member.sex})
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
				pushMemberToAttendanceSelectList({id:leadId, name: member.shortname, sex:member.sex})
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
				pushMemberToAttendanceSelectList({id:traineeId, name: member.shortname, sex:member.sex})
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
			let selectedWeek = null;
			let weekId = $scope.objectDetails.basicInfo.weekId;
			if(weekId){
				selectedWeek = $scope.reportParams.weeksList.$getRecord(weekId);
				$scope.objectDetails.basicInfo.weekName = selectedWeek.name;
				$scope.objectDetails.study.study = selectedWeek.study;
				$scope.objectDetails.study.series = selectedWeek.series;
			}else{
				$scope.objectDetails.basicInfo.weekId = null;
				$scope.objectDetails.basicInfo.weekName = null;
			}
			$scope.reportParams.selectedWeek = selectedWeek;
			$scope.reportParams.updatingWeek = false;
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
			//$scope.objectDetails.basicInfo.date = ReportsSvc.buildDateJson($scope.reportParams.dateObj);
			$scope.objectDetails.basicInfo.dateMilis = $scope.reportParams.dateObj.getTime();
			let membersAttndList = $scope.objectDetails.attendance.members;
			let guestsAttndList = $scope.objectDetails.attendance.guests;

			/* When a Report is marked as "Canceled Reunion", some data must be
			 set to default values (Important when editing existing report) */
			 /*Attendance Values*/
			 $scope.objectDetails.basicInfo.membersAttendance = 0;
			 $scope.objectDetails.basicInfo.femaleMembers = 0;
			 $scope.objectDetails.basicInfo.maleMembers = 0;
			 $scope.objectDetails.basicInfo.guestsAttendance = 0;
			 $scope.objectDetails.basicInfo.femaleGuests = 0;
			 $scope.objectDetails.basicInfo.maleGuests = 0;
			 $scope.objectDetails.basicInfo.totalAttendance = 0;
			 $scope.objectDetails.basicInfo.totalFemale = 0;
			 $scope.objectDetails.basicInfo.totalMale = 0;
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

				$scope.objectDetails.study.study = null;
				$scope.objectDetails.study.series = null;
				$scope.objectDetails.study.studyNotes = null;
				$scope.objectDetails.attendance = { guests:[], members:[] };
				$scope.objectDetails.basicInfo.duration = 0;
				$scope.objectDetails.basicInfo.money = 0;
			}else{
				/* Iterate over the members attendance list to identify number of males and females */
				$scope.objectDetails.attendance.members.forEach(function(record) {
					$scope.objectDetails.basicInfo.membersAttendance ++;
					if(record.sex == 'F'){
						$scope.objectDetails.basicInfo.femaleMembers ++;
					}else if(record.sex == 'M'){
						$scope.objectDetails.basicInfo.maleMembers ++;
					}
				});

				/* Iterate over the guests attendance list to identify number of males and females */
				$scope.objectDetails.attendance.guests.forEach(function(record) {
					$scope.objectDetails.basicInfo.guestsAttendance ++;
					if(record.sex == 'F'){
						$scope.objectDetails.basicInfo.femaleGuests ++;
					}else if(record.sex == 'M'){
						$scope.objectDetails.basicInfo.maleGuests ++;
					}
				});

				$scope.objectDetails.basicInfo.totalAttendance = $scope.objectDetails.basicInfo.membersAttendance + $scope.objectDetails.basicInfo.guestsAttendance;
				$scope.objectDetails.basicInfo.totalFemale = $scope.objectDetails.basicInfo.femaleMembers + $scope.objectDetails.basicInfo.femaleGuests;
				$scope.objectDetails.basicInfo.totalMale = $scope.objectDetails.basicInfo.maleMembers + $scope.objectDetails.basicInfo.maleGuests;
			}

			//Saving Report
			$scope.response = { working:true, message: systemMsgs.inProgress.savingReport };

			//Save Updates: Only valid for reports in "pending" or "rejected" review status
			if($scope.reportParams.isEdit){
				if($scope.objectDetails.basicInfo.reviewStatus == constants.status.rejected){
					ReportsSvc.decreaseRejectedReportsCount($scope.objectDetails.basicInfo.createdById);
					ReportsSvc.increasePendingReportsCount($scope.objectDetails.basicInfo.createdById);
					$scope.objectDetails.basicInfo.reviewStatus = constants.status.pending;
				}

				/* Persist changes in basicInfo first (reports/list/{{reportId}}) */
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
						if($scope.objectDetails.atten.members){
							let membersList = Object.values($scope.objectDetails.atten.members);
							membersList.forEach(function(elem){
								$scope.removedMembersMap.set(elem.memberId, elem.memberId);
							});
						}
						membersAttndList = [];
						guestsAttndList = [];
					}

					/* When editing a report, some members from the original attendance list could have
					been removed, or all (in the case the reunion was moved from canceled to completed),
					so we need to remove Member's folder reference to the Report */
					ReportsSvc.removeReportRefereceFromMembers($scope.removedMembersMap, report.$id );

					//Always clean the Report's attendace folders, and set again
					$scope.objectDetails.atten.members = null;
					$scope.objectDetails.atten.guests = null;
					$scope.objectDetails.atten.$save();
					ReportsSvc.setMembersAttendaceList(membersAttndList,report);
					ReportsSvc.setGuestAttendaceList(guestsAttndList,report);

					let description = systemMsgs.notifications.reportUpdated;
					AuditSvc.saveAuditAndNotify(constants.actions.update, constants.db.folders.reports, report.$id, description);
					$scope.response = { success:true, message: systemMsgs.success.reportUpdated };
				});
			}
			//Create new Report
			else{
				let reportRef = ReportsSvc.getNewReportBasicRef();
				let reportBasicInfo = $scope.objectDetails.basicInfo;
				let reportStudyInfo = $scope.objectDetails.study;
				//New Reports get created with reviewStatus = pending
				reportBasicInfo.reviewStatus = constants.status.pending;
				//Used for an easy way to get all the reports created by one user
				reportBasicInfo.createdById = $rootScope.currentSession.user.$id;

				/* Check if the report was created on time */
				let createdDate = new Date();
				reportBasicInfo.createdOn = createdDate.getTime();
				if($scope.reportParams.selectedWeek){
					let weekDuedate = $scope.reportParams.selectedWeek.duedate;
					let reportDate = reportBasicInfo.createdOn;
					reportBasicInfo.onTime = (weekDuedate >= reportDate);
				}
				//Persist object to DB
				reportRef.set(reportBasicInfo);

				//Get Object after creation, and perform the rest of pendind tasks
				let reportObj = ReportsSvc.getReportBasicObj(reportRef.key);
				reportObj.$loaded().then(function(report){
					WeeksSvc.increaseReportsCountForWeek(reportBasicInfo.weekId);
					ReportsSvc.increaseTotalReportsCount($rootScope.currentSession.user.$id);
					ReportsSvc.increasePendingReportsCount($rootScope.currentSession.user.$id);
					ReportsSvc.setReportStudyInfo(reportStudyInfo,report.$id);
					//Members and Guests attendace list is added separately from the report basic info
					ReportsSvc.setMembersAttendaceList(membersAttndList,report);
					ReportsSvc.setGuestAttendaceList(guestsAttndList,report);
					//No need to removeReportRefereceFromMembers when creating a new report
					//ReportsSvc.removeReportRefereceFromMembers($scope.removedMembersMap,report.$id);

					//Save a reference to this Report in the /group/details/reports and /users/details/folders
					GroupsSvc.increaseReportsCount(reportBasicInfo.groupId);
					let description = systemMsgs.notifications.reportCreated;
					AuditSvc.saveAuditAndNotify(constants.actions.create, constants.db.folders.reports, report.$id, description);
					$rootScope.reportResponse = { created:true, message: systemMsgs.success.reportCreated };
					$location.path(constants.pages.reportEdit+report.$id);
				});
			}
			$scope.reportParams.forceSaveBtnShow = false;
		};

		/* Reports not approved can be removed. When deleting a Report:
			- Remove the Report from /report/list and /report/details
			- Decrease the Report Status (approved, rejected, pendidng) count, and total count
			- Create Audit for Report Removed
			- Remove the Report reference from the Group
			- Remove the Report reference from all Members in Attendance List */
		$scope.removeReport = function(){
			clearResponse();
			$scope.response = { deletingReport:true, message: systemMsgs.inProgress.removingReport };
			let currentStatus = $scope.objectDetails.basicInfo.reviewStatus;
			if( currentStatus == constants.status.approved){
				$scope.response = { deleteError:true, message: systemMsgs.error.cantRemoveApprovedReport };
			}
			else if( currentStatus == constants.status.pending || currentStatus == constants.status.rejected ){
				let reportId = $scope.objectDetails.basicInfo.$id;
				let groupId = $scope.objectDetails.basicInfo.groupId;

				WeeksSvc.getWeekObject($scope.objectDetails.basicInfo.weekId).$loaded().then(function(week) {
					if(!week.isOpen){
						$scope.response = { deleteError:true, message: systemMsgs.error.cantRemoveClosedWeekReport };
						return;
					}
					//Remove the reference to this Report from the Group folder
					GroupsSvc.decreaseReportsCount(groupId);

					//Reduce the counters
					WeeksSvc.decreaseReportsCountForWeek($scope.objectDetails.basicInfo.weekId);
					ReportsSvc.decreaseTotalReportsCount($scope.objectDetails.basicInfo.createdById);
					if(currentStatus == constants.status.pending){
						ReportsSvc.decreasePendingReportsCount($scope.objectDetails.basicInfo.createdById);
					}else if(currentStatus == constants.status.rejected){
						ReportsSvc.decreaseRejectedReportsCount($scope.objectDetails.basicInfo.createdById);
					}

					//Remove the reference to this Report from all Members in Attendance List
					if($scope.objectDetails.atten.members){
						let membersList = Object.values($scope.objectDetails.atten.members);
						membersList.forEach(function(record){
							MembersSvc.removeReportReferenceFromMember(record.memberId, reportId);
						});
					}

					//Send Delete Notification
					let auditObj = $scope.objectDetails.audit;
					let description = systemMsgs.notifications.reportDeleted;
					NotificationsSvc.notifyInvolvedParties(constants.actions.delete, constants.db.folders.reports, reportId, description, auditObj);

					//Remove all data inside folder /report/details
					ReportsSvc.removeReportDetails(reportId);
					//Remove all data inside folder /report/list
					return $scope.objectDetails.basicInfo.$remove()
				})
				.then(function(ref){
					if(!ref) return;
					$rootScope.reportResponse = { deleted:true, message: systemMsgs.success.reportDeleted };
					$location.path( constants.pages.reportNew + groupId );
				});
				return;
			}
		};

		$scope.approveReport = function(){
			$scope.addCommentToFeedback()
			clearResponse();
			$scope.response = { approving:true, message: systemMsgs.inProgress.approvingReport };

			let originalStatus = $scope.objectDetails.basicInfo.reviewStatus;
			$scope.objectDetails.basicInfo.reviewStatus = constants.status.approved;
			$scope.objectDetails.basicInfo.$save().then(function(ref){
				//increase approved count
				ReportsSvc.increaseApprovedReportsCount($scope.objectDetails.basicInfo.createdById);
				//decrease pending or rejected count
				if(originalStatus == constants.status.pending){
					ReportsSvc.decreasePendingReportsCount($scope.objectDetails.basicInfo.createdById);
				}else if(originalStatus == constants.status.rejected){
					ReportsSvc.decreaseRejectedReportsCount($scope.objectDetails.basicInfo.createdById);
				}
				let description = systemMsgs.notifications.reportApproved;
				AuditSvc.saveAuditAndNotify(constants.actions.approve, constants.db.folders.reports, ref.key, description);
				$scope.response = { approved:true, message: systemMsgs.success.reportApproved };
				$scope.reportParams.forceSaveBtnShow = false;
			});
		};

		$scope.rejectReport = function(){
			$scope.addCommentToFeedback()
			clearResponse();
			$scope.response = { rejecting:true, message: systemMsgs.inProgress.rejectingReport };

			let originalStatus = $scope.objectDetails.basicInfo.reviewStatus;
			$scope.objectDetails.basicInfo.reviewStatus = constants.status.rejected;
			$scope.objectDetails.basicInfo.$save().then(function(ref){
				ReportsSvc.increaseRejectedReportsCount($scope.objectDetails.basicInfo.createdById);
				if(originalStatus == constants.status.pending){
					ReportsSvc.decreasePendingReportsCount($scope.objectDetails.basicInfo.createdById);
				}else if(originalStatus == constants.status.approved){
					ReportsSvc.decreaseApprovedReportsCount($scope.objectDetails.basicInfo.createdById);
				}
				let description = systemMsgs.notifications.reportRejected;
				AuditSvc.saveAuditAndNotify(constants.actions.reject, constants.db.folders.reports, ref.key, description);
				$scope.response = { rejected:true, message: systemMsgs.success.reportRejected };
				$scope.reportParams.forceSaveBtnShow = false;
			});
		};

		clearResponse = function() {
			$rootScope.reportResponse = null;
			$scope.response = null;
		};

		$scope.addCommentToFeedback = function() {
			if($scope.reportParams.feedbackComment){
				let post = {
					time:firebase.database.ServerValue.TIMESTAMP,
					fromId:$rootScope.currentSession.user.$id,
					from:$rootScope.currentSession.user.email,
					message:$scope.reportParams.feedbackComment
				}
				$scope.objectDetails.feedback.$add(post).then(function(record){
					$scope.reportParams.feedbackComment="";
				});
			}
		};

		$scope.findExternalMembers = function() {
			if($rootScope.currentSession.allMembersList){return;}
			$rootScope.currentSession.allMembersList = MembersSvc.getAllMembers();
		};

		$scope.closeMemberSelectModal = function(member){
			addMemberAttendance({id:member.$id, name: member.shortname, sex:member.sex});
		};

}]);

/*Controls the Quick "Create Report Button". */
okulusApp.controller('CreateReportCntrl',
	['$scope','$rootScope','$location','$firebaseAuth',
	function($scope, $rootScope, $location, $firebaseAuth){

		/* When the member has only 1 access rule */
		$scope.quickReportLauncher = function(){
			let groupId = $rootScope.currentSession.accessGroups[0].$id;
			$location.path(constants.pages.reportNew + groupId);
		};

		$scope.closeGroupSelectModal = function(group){
			let groupId = group.$id;
			$location.path(constants.pages.reportNew + groupId);
		};

	}]
);

okulusApp.factory('ReportsSvc',
	['$firebaseArray', '$firebaseObject', 'MembersSvc',
	function($firebaseArray, $firebaseObject, MembersSvc){

		let baseRef = firebase.database().ref().child(constants.db.folders.root);
		let reportsListRef = baseRef.child(constants.db.folders.reportsList);
		let reportsDetailsRef = baseRef.child(constants.db.folders.reportsDetails);
		let reportReviewStatus = baseRef.child(constants.db.folders.reportsList).orderByChild(constants.db.fields.reviewStatus);
		let usersListRef = baseRef.child(constants.db.folders.usersList);

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
			getGlobalReportsCounter: function(){
				return $firebaseObject(baseRef.child(constants.db.folders.reportsCounters));
			},
			/* Return all Reports, using a limit for the query, if specified*/
			getAllReports: function(limit) {
				if(limit){
					return $firebaseArray(reportsListRef.orderByKey().limitToLast(limit));
				}else{
					return $firebaseArray(reportsListRef.orderByKey());
				}
			},
			/* Return all Reports with reviewStatus:'approved', using a limit for the query, if specified*/
			getApprovedReports: function(limit) {
				if(limit){
					return $firebaseArray(reportReviewStatus.equalTo(constants.status.approved).limitToLast(limit));
				}else{
					return $firebaseArray(reportReviewStatus.equalTo(constants.status.approved));
				}
			},
			/* Return all Reports with reviewStatus:'pending', using a limit for the query, if specified*/
			getPendingReports: function(limit) {
				if(limit){
					return $firebaseArray(reportReviewStatus.equalTo(constants.status.pending).limitToLast(limit));
				}else{
					return $firebaseArray(reportReviewStatus.equalTo(constants.status.pending));
				}
			},
			/* Return all Reports with reviewStatus:'rejected', using a limit for the query, if specified*/
			getRejectedReports: function(limit) {
				if(limit){
					return $firebaseArray(reportReviewStatus.equalTo(constants.status.rejected).limitToLast(limit));
				}else{
					return $firebaseArray(reportReviewStatus.equalTo(constants.status.rejected));
				}
			},
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
				return $firebaseObject(reportsDetailsRef.child(whichReportId).child(constants.db.folders.audit));
			},
			/* Get report attendace list from firebase and return as object */
			getReportAttendanceObject: function(whichReportId){
				return $firebaseObject(reportsDetailsRef.child(whichReportId).child(constants.db.folders.attendance));
			},
			/* Get report study from firebase and return as object */
			getReportStudyObject: function(whichReportId){
				return $firebaseObject(reportsDetailsRef.child(whichReportId).child(constants.db.folders.study));
			},
			/* Get report feedback from firebase and return as object */
			getReportFeedback: function(whichReportId){
				return $firebaseArray(reportsDetailsRef.child(whichReportId).child(constants.db.folders.feedback));
			},
			removeReportDetails: function(whichReportId){
				return reportsDetailsRef.child(whichReportId).set(null);
			},
			getReportsCreatedByUser: function(userId) {
				return $firebaseArray(reportsListRef.orderByChild(constants.db.fields.createdById).equalTo(userId));
			},
			/* Increment the number of Reports with reviewStatus = "approved"  */
			increaseApprovedReportsCount: function(creatorId) {
				let userCountRef = usersListRef.child(creatorId).child(constants.db.folders.approvedReportsCount);
				increaseCounter(userCountRef);
				let conunterRef = baseRef.child(constants.db.folders.approvedReportsCount);
				increaseCounter(conunterRef);
			},
			/* Reduce the number of Reports with reviewStatus = "approved"  */
			decreaseApprovedReportsCount: function(creatorId) {
				let userCountRef = usersListRef.child(creatorId).child(constants.db.folders.approvedReportsCount);
				decreaseCounter(userCountRef);
				let conunterRef = baseRef.child(constants.db.folders.approvedReportsCount);
				decreaseCounter(conunterRef);
			},
			/* Increment the number of Reports with reviewStatus = "rejected"  */
			increaseRejectedReportsCount: function(creatorId) {
				let userCountRef = usersListRef.child(creatorId).child(constants.db.folders.rejectedReportsCount);
				increaseCounter(userCountRef);
				let conunterRef = baseRef.child(constants.db.folders.rejectedReportsCount);
				increaseCounter(conunterRef);
			},
			/* Reduce the number of Reports with reviewStatus = "rejected"  */
			decreaseRejectedReportsCount: function(creatorId) {
				let userCountRef = usersListRef.child(creatorId).child(constants.db.folders.rejectedReportsCount);
				decreaseCounter(userCountRef);
				let conunterRef = baseRef.child(constants.db.folders.rejectedReportsCount);
				decreaseCounter(conunterRef);
			},
			/* Increment the number of Reports with reviewStatus = "pending"  */
			increasePendingReportsCount: function(creatorId) {
				let userCountRef = usersListRef.child(creatorId).child(constants.db.folders.pendingReportsCount);
				increaseCounter(userCountRef);
				let conunterRef = baseRef.child(constants.db.folders.pendingReportsCount);
				increaseCounter(conunterRef);
			},
			/* Reduce the number of Reports with reviewStatus = "pending"  */
			decreasePendingReportsCount: function(creatorId) {
				let userCountRef = usersListRef.child(creatorId).child(constants.db.folders.pendingReportsCount);
				decreaseCounter(userCountRef);
				let conunterRef = baseRef.child(constants.db.folders.pendingReportsCount);
				decreaseCounter(conunterRef);
			},
			/* Increment the number of total Reports */
			increaseTotalReportsCount: function(creatorId) {
				let userCountRef = usersListRef.child(creatorId).child(constants.db.folders.totalReportsCount);
				increaseCounter(userCountRef);
				let conunterRef = baseRef.child(constants.db.folders.totalReportsCount);
				increaseCounter(conunterRef);
			},
			/* Reduce the number of total Reports */
			decreaseTotalReportsCount: function(creatorId) {
				let userCountRef = usersListRef.child(creatorId).child(constants.db.folders.totalReportsCount);
				decreaseCounter(userCountRef);
				let conunterRef = baseRef.child(constants.db.folders.totalReportsCount);
				decreaseCounter(conunterRef);
			},
			/* Set the members attendance list in the /reports/details/:reportId/attendance/members folder */
			setMembersAttendaceList: function(attendanceList, report) {
				if(attendanceList){
					attendanceList.forEach(function(member) {
						reportsDetailsRef.child(report.$id).child(constants.db.folders.membersAttendance).child(member.memberId).set(
							{memberId:member.memberId, memberName:member.memberName, sex:member.sex}
						);
						MembersSvc.addReportReferenceToMember(member.memberId, report);
					});
				}
			},
			/* Set the guests attendance list in the /reports/details/:reportId/attendance/guests folder */
			setGuestAttendaceList: function(attendanceList, report) {
				if(attendanceList){
					attendanceList.forEach(function(guest) {
						reportsDetailsRef.child(report.$id).child(constants.db.folders.guestsAttendance).push({guestName:guest.guestName, sex:guest.sex});
					});
				}
			},
			/* Save the Report Study info in /reports/details/:reportId/study/ */
			setReportStudyInfo: function(reportStudyInfo, reportId) {
				reportsDetailsRef.child(reportId).child(constants.db.folders.study).set(reportStudyInfo);
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
			/* Return all reports with WeedId in the provided period (both sides inclusive)*/
			getReportsforWeeksPeriod: function(fromWeek, toWeek){
				let query = reportsListRef.orderByChild(constants.db.fields.weekId).startAt(fromWeek).endAt(toWeek);
				return $firebaseArray(query);
			},
			/*Returns firebaseArray with the Reports for the given week, but limited to a specified amount */
			getReportsForWeek: function(weekId, limit){
				let reference = reportsListRef.orderByChild(constants.db.fields.weekId).equalTo(weekId);
				if(limit){
					return $firebaseArray(reference.limitToLast(limit));
				}else{
					return $firebaseArray(reference);
				}
			},
			//Deprecated
			getReportObj: function(reportId){
				return $firebaseObject(reportsListRef.child(reportId));
			},
			getReportsForWeek: function(weekId){
				let ref = reportsListRef.orderByChild(constants.db.fields.weekId).equalTo(weekId);
				return $firebaseArray(ref);
			},
			buildDateJson: function(dateObject){
		    	let dateJson = null;
		    	if(dateObject){
		    		dateJson = { day:dateObject.getDate(),
							 month: dateObject.getMonth()+1,
							 year:dateObject.getFullYear() };
				}
				return dateJson;
			}
		};
	}
]);
