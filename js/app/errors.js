okulusApp.controller('ErrorsMonitorCntrl',
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

okulusApp.factory('ErrorsSvc',
  ['$rootScope','$firebaseObject',
	function($rootScope,$firebaseObject){
		let baseRef = firebase.database().ref().child(constants.db.folders.root);
		let errorsRef = baseRef.child(constants.db.folders.errors);
		let counterRef = baseRef.child(constants.db.folders.errorsCount).child(constants.db.fields.systemErrors);

		/*Using a Transaction with an update function to reduce the counter by 1 */
		let decreaseUnreadErrorsCounter = function(){
			counterRef.transaction(function(systemErrors) {
				if(systemErrors>0)
					return systemErrors - 1;
				return systemErrors;
			});
		};

		/*Using a Transaction with an update function to increase the counter by 1 */
		let increaseUnreadErrorsCounter = function(){
			counterRef.transaction(function(systemErrors) {
				return systemErrors + 1;
			});
		};

		return {
			/*Add an error ecord in the DB, and increase the global error counter*/
			logError: function(errorMessage){
				console.error(errorMessage);
				let record = { error: errorMessage, date: firebase.database.ServerValue.TIMESTAMP,
											impactedUserId: $rootScope.currentSession.user.$id,
											impactedUserEmail: $rootScope.currentSession.user.email
										 };
		    errorsRef.push().set(record);
				increaseUnreadErrorsCounter();
			},
			updateErrorReadedStatus: function(errorId, isReaded){
				errorsRef.child(errorId).update({readed:isReaded});
				if(isReaded){
					decreaseUnreadErrorsCounter();
				}else{
					increaseUnreadErrorsCounter();
				}
			},
			/*Delete the error element, and reduce the counter */
			deleteErrorRecord: function(error){
				if(!error.readed){
					decreaseUnreadErrorsCounter();
				}
				errorsRef.child(error.$id).set({});
			},
			getGlobalErrorCounter: function(){
				return $firebaseObject(baseRef.child(constants.db.folders.errorsCount));
			},
		};
	}
]);
