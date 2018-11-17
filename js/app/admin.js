okulusApp.controller('MonitorCntrl',
	['$rootScope','$scope','$location','$firebaseArray','$firebaseObject','$firebaseAuth',
		'AuditSvc','AuthenticationSvc','NotificationsSvc', 'ErrorsSvc','WeeksSvc',
	function($rootScope, $scope,$location, $firebaseArray, $firebaseObject,$firebaseAuth,
		AuditSvc,AuthenticationSvc,NotificationsSvc,ErrorsSvc,WeeksSvc){

		let noAdminErrorMsg = "Área solo para Administradores.";
		let auditRef = firebase.database().ref().child(rootFolder).child('audit');
		let usersRef = firebase.database().ref().child(rootFolder).child('users');
		let errorsRef = firebase.database().ref().child(rootFolder).child('errors');

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
			//Updates in Week Object
			WeeksSvc.loadAllWeeks();
			$rootScope.allWeeks.$loaded().then(function (weeks) {
				let total = weeks.length;
				let open = 0;
				weeks.forEach(function(week){
					//Add year and weekNumber to the DB, from the week id
					let index = $rootScope.allWeeks.$indexFor(week.$id);
					let idtxt = week.$id + "";
					let yearStr = idtxt.substring(0,4);
					let weekStr = idtxt.substring(4);
					week.year = Number(yearStr);
					week.weekNumber = Number(weekStr);
					//Add isOpen and isVisible from week status
					if(week.status == "open"){
						week.isOpen = true;
						week.isVisible = true;
						open++;
					}
					week.status = null;
					$rootScope.allWeeks.$save(index);
				});
				$rootScope.systemCounters.weeks = {};
				$rootScope.systemCounters.weeks.total = total;
				$rootScope.systemCounters.weeks.open = open;
				$rootScope.systemCounters.weeks.visible = open;
				$rootScope.systemCounters.$save();
			});
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
						$scope.weeksList = WeeksSvc.loadAllWeeks();
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
