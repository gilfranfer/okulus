okulusApp.controller('MonitorCntrl',
	['$rootScope','$scope','$location','$firebaseArray','$firebaseObject','$firebaseAuth',
		'AuditSvc','AuthenticationSvc','NotificationsSvc', 'ErrorsSvc','WeeksSvc','MigrationSvc', 'ReportsSvc',
	function($rootScope, $scope,$location, $firebaseArray, $firebaseObject,$firebaseAuth,
		AuditSvc,AuthenticationSvc,NotificationsSvc,ErrorsSvc,WeeksSvc,MigrationSvc,ReportsSvc){

		let noAdminErrorMsg = "Área solo para Administradores.";
		let baseRef = firebase.database().ref().child(rootFolder);
		let auditRef = baseRef.child('audit');
		let usersRef = baseRef.child('users');
		let errorsRef = baseRef.child('errors');

		/*Executed when accessing to /admin/monitor, to confirm the user still admin*/
		$firebaseAuth().$onAuthStateChanged( function(authUser){
    	if(authUser){
				AuthenticationSvc.loadSessionData(authUser.uid).$loaded().then(function (user) {
					if(user.type != 'admin'){
						$rootScope.response = {errorMsg: noAdminErrorMsg};
						$location.path("/error");
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

		$scope.loadSystemUsers = function(){
			$scope.response = {usersLoading: true, message: $rootScope.i18n.admin.users.loading};
			if(!$scope.userRecords){
				$scope.userRecords = $firebaseArray(usersRef);
				$scope.userRecords.$loaded().then(function(list) {
					$scope.response = {usersSuccess: true, message: list.length + " " + $rootScope.i18n.admin.users.loadingSuccess};
				})
				.catch( function(error){
					$scope.response = {usersError: true, message: $rootScope.i18n.notifications.loadingError};
					console.error(error);
				});
			}
		};

		$scope.loadAuditRecords = function(){
			$scope.response = {auditLoading: true, message: $rootScope.i18n.admin.audit.loading};
			$scope.currentAuditOn = $scope.auditInFolder;
			$scope.auditRecords = $firebaseArray( auditRef.child($scope.currentAuditOn) );
			$scope.auditRecords.$loaded().then(function(list) {
				$scope.response = {auditSuccess: true, message: list.length + " " + $rootScope.i18n.admin.audit.loadingSuccess};
			})
			.catch( function(error){
				$scope.response = {auditError: true, message: $rootScope.i18n.notifications.loadingError};
				console.error(error);
			});
		};

		$scope.updateUserType = function (userId, type) {
			$scope.response = undefined;
			// if($rootScope.currentSession.user.isRoot){
			// 	$scope.response = { userErrorMsg: "Root no puede ser modificado"};
			// 	return;
			// }
			if(userId == $rootScope.currentSession.user.$id){
				$scope.response = { userErrorMsg: "No puedes modificar a tu usuario"};
			}else{
				let obj = $firebaseObject( usersRef.child(userId) );
				obj.$loaded().then(function (){
					obj.type = type;
					return obj.$save();
				}).then(function (ref) {
					$scope.response = { userOkMsg: "Usuario "+obj.email+" Actualizado"};
					AuditSvc.recordAudit(userId, "type-update", "users");
				}, function(error) {
					$scope.response = { userErrorMsg: error};
				});
			}
		}

		/* MIGRATION FUNCTIONS */

		/* The metadata folder under contains the id of all unread Notifications.
		Is better to remove this folder, and keep only the list folder.
		The totals will be maintaint in the global counters */
		$scope.migrateNotifications = function () {
			let baseRef = firebase.database().ref().child(rootFolder);
			let metaRef = baseRef.child("notifications/metadata");
			let listRef = baseRef.child("notifications/list");

			//Get all System Users
			$firebaseArray(baseRef.child("users")).$loaded().then( function(usersList) {
				usersList.forEach(function(user){
					//Use the notifications/metadata length to set the User's unread Count
					$firebaseArray(metaRef.child(user.$id)).$loaded().then(function(list){
						console.log("User: "+user.$id+" Unread Notifications: "+list.length);
						NotificationsSvc.setTotalUnreadNotifications(user.$id,list.length);
					});
					//Use the notifications/list length to set the User's total Count
					$firebaseArray(listRef.child(user.$id)).$loaded().then(function(list){
						console.log("User: "+user.$id+" Total Notifications: "+list.length);
						NotificationsSvc.setTotalNotifications(user.$id,list.length);
					});
				});
			});
		};

		$scope.migrateWeeks = function () {
			console.log("Init Weeks Migration");
			let weeksListRef = baseRef.child(constants.folders.weeksList);
			let weeksDetailsRef = baseRef.child(constants.folders.weeksDetails);

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
						weekObj.weekNumber = Number(weekStr);
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
							console.log(week.$id+" has "+reports.length+" reports");
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
				console.log("End Weeks Migration", "Total Weeks:"+totalWeeks);
			});
		};

		$scope.migrateMembers = function() {
			console.log("Initiating Members Migration!!!");
			MigrationSvc.getAllGroups().$loaded().then(function(groups){
				MigrationSvc.migrateMembers(groups);
			});
		};

		$scope.migrateGroups = function() {
			console.log("Initiating Groups Migration!!!");
			MigrationSvc.migrateGroups();
		};

}]);

okulusApp.controller('AdminDashCntrl', ['$rootScope','$scope','$firebaseObject',
							'WeeksSvc','GroupsSvc','$firebaseAuth','$location','AuthenticationSvc',
	function($rootScope, $scope, $firebaseObject, WeeksSvc, GroupsSvc,$firebaseAuth,$location,AuthenticationSvc){
		$scope.loadingReportSelector = true;
		$firebaseAuth().$onAuthStateChanged( function(authUser){
    		if(authUser){
				AuthenticationSvc.loadSessionData(authUser.uid).$loaded().then(function (obj) {
					if($rootScope.currentSession.user.type == 'admin'){

						$scope.adminViewActive = true;
						$scope.weeksList = WeeksSvc.loadVisibleWeeks();
						$scope.groupsList = GroupsSvc.loadAllGroupsList();
						$scope.groupsList.$loaded().then(function () {
							$scope.loadingReportSelector = false;
						});

						let countersRef = firebase.database().ref().child(rootFolder).child('counters');
						$scope.globalCounter = $firebaseObject(countersRef);
						$scope.globalCounter.$loaded().then(
							function (counter) {
								// console.debug(counter);
								if(!counter || !counter.members){
									counter.members = {active:0,inactive:0};
									counter.groups = {active:0,inactive:0};
									counter.reports = {approved:0,pending:0,rejected:0};
									$scope.globalCounter.$save();
								}
							}
						);

					}else{
						$location.path("/error/norecord");
					}
				});
			}
		});

}]);

okulusApp.factory('MigrationSvc',
['$rootScope', '$firebaseArray', '$firebaseObject', 'GroupsSvc',
	function($rootScope, $firebaseArray, $firebaseObject, GroupsSvc){

		let baseRef = firebase.database().ref().child(rootFolder);
		let membersRef = baseRef.child(constants.folders.members);
		let groupsRef = baseRef.child(constants.folders.groups);

		return {
			migrateMembers: function(groups) {
				let hostCount = 0;
				let leadCount = 0;
				let traineeCount = 0;
				let totalCount = 0;
				let memberFolderCount = 0;
				let activeCount = 0;
				let memberCountersRef = baseRef.child(constants.folders.membersCounters);
				let membersListRef = baseRef.child(constants.folders.membersList);
				let membersDetailsRef = baseRef.child(constants.folders.membersDetails);
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
					console.log("List Size:",list.length);
					console.log("Total Members:",totalCount);
					console.log("With member folder",memberFolderCount);
					console.log("Active:",activeCount);
					console.log("Hosts:",hostCount);
					console.log("Leads:",leadCount);
					console.log("Trainees:",traineeCount);
					memberCountersRef.set({active:activeCount,hosts:hostCount,leads:leadCount,total:totalCount, trainees:traineeCount});
				});
			},
			getAllGroups: function(){
				return $firebaseArray(groupsRef);
			}
		};
}]);
