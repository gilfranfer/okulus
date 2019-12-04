okulusApp.controller('MigrationCntrl',
	['$rootScope','$scope','$location','$firebaseArray','$firebaseObject','$firebaseAuth',
		'AuditSvc','AuthenticationSvc','NotificationsSvc', 'ErrorsSvc','WeeksSvc','MigrationSvc', 'ReportsSvc',
	function($rootScope, $scope,$location, $firebaseArray, $firebaseObject,$firebaseAuth,
		AuditSvc,AuthenticationSvc,NotificationsSvc,ErrorsSvc,WeeksSvc,MigrationSvc,ReportsSvc){

		let noAdminErrorMsg = "Área solo para Administradores.";
		let baseRef = firebase.database().ref().child(constants.db.folders.root);
		let errorsRef = baseRef.child('errors');

		/*Executed when accessing to /admin/monitor, to confirm the user still admin*/
		$firebaseAuth().$onAuthStateChanged( function(authUser){
    	if(authUser){
				AuthenticationSvc.loadSessionData(authUser.uid).$loaded().then(function (user) {
					if(user.type == constants.roles.user){
						$rootScope.response = {error:true, showHomeButton: true, message:systemMsgs.error.noPrivileges};
						$location.path(constants.pages.error);
					}else{
						$scope.loadSystemErrors();
					}
				});
			}
		});

		$scope.loadSystemErrors = function(){
			$scope.response = {errorsLoading: true, message: $rootScope.i18n.admin.errors.loading};
			if(!$scope.errorRecords){
				$scope.errorRecords = $firebaseArray( errorsRef );
				$scope.errorRecords.$loaded().then(function(list) {
					$scope.response = {errorsSuccess: true, message: list.length + " " + $rootScope.i18n.admin.errors.loadingSuccess};
				})
				.catch( function(error){
					$scope.response = {errorsError: true, message: $rootScope.i18n.notifications.loadingError};
					console.error(error);
				});
			}
		};

		/*Update the error record's "readed" value. For security, before any update,
		confirm the error's current "readed" value is different than the new one */
		$scope.readErrorRecord = function(markReaded, error){
			if(error.readed != markReaded){
				ErrorsSvc.updateErrorReadedStatus(error.$id, markReaded);
			}
		};

		/* Remove the error from db */
		$scope.deleteErrorRecord = function(error){
			ErrorsSvc.deleteErrorRecord(error);
		};

		/* MIGRATION FUNCTIONS */
		/* The metadata folder under contains the id of all unread Notifications.
		Is better to remove this folder, and keep only the list folder.
		The totals will be maintaint in the global counters */
		$scope.migrateNotifications = function () {
			let baseRef = firebase.database().ref().child(constants.db.folders.root);
			let metaRef = baseRef.child("notifications/metadata");
			let listRef = baseRef.child("notifications/list");

			//Get all System Users
			$firebaseArray(baseRef.child("users")).$loaded().then( function(usersList) {
				usersList.forEach(function(user){
					//Use the notifications/metadata length to set the User's unread Count
					$firebaseArray(metaRef.child(user.$id)).$loaded().then(function(list){
						console.debug("User: "+user.$id+" Unread Notifications: "+list.length);
						NotificationsSvc.setTotalUnreadNotifications(user.$id,list.length);
					});
					//Use the notifications/list length to set the User's total Count
					$firebaseArray(listRef.child(user.$id)).$loaded().then(function(list){
						console.debug("User: "+user.$id+" Total Notifications: "+list.length);
						NotificationsSvc.setTotalNotifications(user.$id,list.length);
					});
				});
			});
		};

		$scope.migrateWeeks = function () {
			console.debug("Init Weeks Migration");
			let weeksListRef = baseRef.child(constants.db.folders.weeksList);
			let weeksDetailsRef = baseRef.child(constants.db.folders.weeksDetails);

			let weeksGlobalCount = WeeksSvc.getGlobalWeeksCounter();
			//Updates in Week Object
			let allWeeks = $firebaseArray(baseRef.child('weeks'));
			allWeeks.$loaded().then(function (weeks) {
				let totalWeeks = 0
				let openWeeks = 0;

				weeks.forEach(function(week){
					if(week.$id != "list" && week.$id != "details"){
						totalWeeks++;
						//Add year and weekNumber to the DB, from the week id
						//let index = $rootScope.allWeeks.$indexFor(week.$id);
						let weekObj = {};
						let idtxt = week.$id + "";
						let yearStr = idtxt.substring(0,4);
						let weekStr = idtxt.substring(4);
						weekObj.year = Number(yearStr);
						weekObj.week = Number(weekStr);
						weekObj.name = week.name;
						//Add isOpen and isVisible from week status
						if(week.status == "open"){
							weekObj.isOpen = true;
							weekObj.isVisible = true;
							openWeeks++;
						}else{
							weekObj.isOpen = false;
							weekObj.isVisible = false;
						}
						//week.status = null;

						//Get Reports for the week to update week's reportsCount
						ReportsSvc.getReportsForWeek(week.$id).$loaded().then(function(reports) {
							weekObj.reportsCount = reports.length;
							console.debug(week.$id+" has "+reports.length+" reports");
							weeksDetailsRef.child(week.$id).child("audit").set(week.audit);
							weeksListRef.child(week.$id).set(weekObj);
						});
					}
				});
				//Update Global System Counters
				weeksGlobalCount.total = totalWeeks;
				weeksGlobalCount.open = openWeeks;
				weeksGlobalCount.visible = openWeeks;
				weeksGlobalCount.$save();
				console.debug("End Weeks Migration", "Total Weeks:"+totalWeeks);
			});
		};

		$scope.migrateMembers = function() {
			console.debug("Initiating Members Migration!!!");
			//Get Groups from Original Strcuture
			MigrationSvc.getAllGroups().$loaded().then(function(groups){
				MigrationSvc.migrateMembers(groups);
			});
		};

		$scope.migrateGroups = function() {
			console.debug("Initiating Groups Migration!!!");
			MigrationSvc.getMembersList().$loaded().then(function(members){
				MigrationSvc.migrateGroups(members);
			});
		};

}]);

okulusApp.factory('MigrationSvc',
['$rootScope', '$firebaseArray', '$firebaseObject', 'GroupsSvc',
	function($rootScope, $firebaseArray, $firebaseObject, GroupsSvc){

		let baseRef = firebase.database().ref().child(constants.db.folders.root);
		let memberListRef = baseRef.child(constants.db.folders.membersList);
		let membersRef = baseRef.child(constants.db.folders.members);
		let groupsRef = baseRef.child(constants.db.folders.groups);

		return {
			migrateMembers: function(groups) {
				let hostCount = 0;
				let leadCount = 0;
				let traineeCount = 0;
				let totalCount = 0;
				let memberFolderCount = 0;
				let activeCount = 0;
				let memberCountersRef = baseRef.child(constants.db.folders.membersCounters);
				let membersListRef = baseRef.child(constants.db.folders.membersList);
				let membersDetailsRef = baseRef.child(constants.db.folders.membersDetails);
				let membersList = $firebaseArray(membersRef.orderByKey());

				membersList.$loaded().then(function(list){
					list.forEach(function(member) {
						if(member.$id != "list" && member.$id != "details"){
							//Move /audit, /access, /attendance, /address into /details
							let detailsRecord = {};
							if(member.access){
								detailsRecord.access = member.access;
							}
							if(member.audit){
								detailsRecord.audit = member.audit;
							}
							if(member.attendance){
								detailsRecord.attendance = member.attendance;
							}
							if(member.address){
								detailsRecord.address = member.address;
							}
							membersDetailsRef.child(member.$id).set(detailsRecord);

							//Merge /user with /member and place in /list
							let basicRecord = member.member;
							if(basicRecord){
								basicRecord.isActive = (basicRecord.status == "active");
								basicRecord.canBeUser = null;
								basicRecord.status = null;
								if(basicRecord.baseGroup){
									basicRecord.baseGroupId = basicRecord.baseGroup;
									basicRecord.baseGroupName = groups.$getRecord(basicRecord.baseGroup).group.name;
									basicRecord.baseGroup = null;
								}
								if(basicRecord.birthdate){
									let dayString = (basicRecord.birthdate.day<10)?"0"+basicRecord.birthdate.day:basicRecord.birthdate.day;
									let monthString = (basicRecord.birthdate.month<10)?"0"+basicRecord.birthdate.month:basicRecord.birthdate.month;
									basicRecord.bday = basicRecord.birthdate.year+"-"+monthString+"-"+dayString;
									basicRecord.birthdate = null;
								}
								if(member.user && member.user.userId){
									basicRecord.isUser = true;
									basicRecord.userId = member.user.userId;
								}
								if(!basicRecord.isActive){
									basicRecord.isHost = false;
									basicRecord.isLeader = false;
									basicRecord.isTrainee = false;
								}else{
									activeCount++;
								}
								if(basicRecord.isHost){
									hostCount++;
								}
								if(basicRecord.isLeader){
									leadCount++;
								}
								if(basicRecord.isTrainee){
									traineeCount++;
								}
								membersListRef.child(member.$id).set(basicRecord);
								memberFolderCount++;
							}else{
								console.error("No member folder",member.$id);
							}
							totalCount++;
						}
					});
					console.debug("List Size:",list.length);
					console.debug("Total Members:",totalCount);
					console.debug("With member folder",memberFolderCount);
					console.debug("Active:",activeCount);
					console.debug("Hosts:",hostCount);
					console.debug("Leads:",leadCount);
					console.debug("Trainees:",traineeCount);
					memberCountersRef.set({active:activeCount,hosts:hostCount,leads:leadCount,total:totalCount, trainees:traineeCount});
				});
			},
			migrateGroups: function(members) {

				let totalCount = 0;
				let activeCount = 0;
				let groupFolderCount = 0;

				let groupsCountersRef = baseRef.child(constants.db.folders.groupsCounters);
				let groupsListRef = baseRef.child(constants.db.folders.groupsList);
				let groupsDetailsRef = baseRef.child(constants.db.folders.groupsDetails);
				let groupsList = $firebaseArray(groupsRef.orderByKey());

				groupsList.$loaded().then(function(list){
					list.forEach(function(group){
						if(group.$id != "list" && group.$id != "details"){
							// /access, /audit, /reports create /roles
							let detailsRecord = {};

							if(group.access){
								detailsRecord.access = group.access;
							}
							if(group.audit){
								detailsRecord.audit = group.audit;
							}
							if(group.reports){
								detailsRecord.reports = group.reports;
							}
							detailsRecord.roles = {};
							if(group.group.leadId){
								detailsRecord.roles.leadId = group.group.leadId;
								detailsRecord.roles.leadName = members.$getRecord(group.group.leadId).shortname;
								group.group.leadId = null;
							}
							if(group.group.hostId){
								detailsRecord.roles.hostId = group.group.hostId;
								detailsRecord.roles.hostName = members.$getRecord(group.group.hostId).shortname;
								group.group.hostId = null;
							}
							groupsDetailsRef.child(group.$id).set(detailsRecord);

							// basicRecord ( /group, /schedule, /address )
							let basicRecord = group.group;
							if(!basicRecord){
								console.error("No group folder",group.$id);
								basicRecord = {};
							}
							if(group.address){
								basicRecord.address = group.address;
							}
							if(group.schedule){
								basicRecord.weekday = group.schedule.weekday;
								let minutesText = (group.schedule.time.MM<10)?("0"+group.schedule.time.MM):group.schedule.time.MM;
								basicRecord.time = group.schedule.time.HH +":"+minutesText;
							}
							basicRecord.isActive = (basicRecord.status == "active");
							basicRecord.status = null;

							groupsListRef.child(group.$id).set(basicRecord);

							if(basicRecord.isActive){
								activeCount++;
							}
							totalCount++;
						}
					});
					console.debug("List Size:",list.length);
					console.debug("Total Groups:",totalCount);
					console.debug("Active:",activeCount);
					groupsCountersRef.set({active:activeCount,total:totalCount});
				});
			},
			getAllGroups: function(){
				return $firebaseArray(groupsRef);
			},
			getMembersList: function(){
				return $firebaseArray(memberListRef.orderByKey());
			}
		};
}]);
