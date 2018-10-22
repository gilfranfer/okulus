okulusApp.controller('MonitorCntrl', ['$rootScope','$scope','$firebaseArray','$firebaseObject',
					'AuditSvc', 'MigrationSvc','$firebaseAuth','$location','AuthenticationSvc',
	function($rootScope, $scope, $firebaseArray, $firebaseObject,AuditSvc,MigrationSvc,
					$firebaseAuth,$location,AuthenticationSvc){

		let auditRef = undefined;
		let usersRef = undefined;
		let errorsRef = undefined;

		$firebaseAuth().$onAuthStateChanged( function(authUser){
    		if(authUser){
				AuthenticationSvc.loadSessionData(authUser.uid).$loaded().then(function (obj) {
					if($rootScope.currentSession.user.type == 'admin'){
						auditRef = firebase.database().ref().child(rootFolder).child('audit');
						usersRef = firebase.database().ref().child(rootFolder).child('users');
						errorsRef = firebase.database().ref().child(rootFolder).child('errors');
						$scope.userRecords = $firebaseArray( usersRef );
						$scope.errorsRecords = $firebaseArray( errorsRef );
					}else{
						$location.path("/error/norecord");
					}
				});
			}
		});

		getAuditRecords = function(selectObj){
			// get the index of the selected option
			var idx = selectObj.selectedIndex;
			// get the value of the selected option
			var auditOn = selectObj.options[idx].value;
			$scope.auditOn = auditOn;
			$scope.auditRecords = $firebaseArray( auditRef.child(auditOn) );
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

		$scope.migrateNotifications = function () {
			MigrationSvc.migrateNotifications()
		}

	}
]);

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

okulusApp.factory('MigrationSvc', ['$firebaseArray', '$firebaseObject', 'NotificationsSvc',
	function($firebaseArray, $firebaseObject, NotificationsSvc){
		let baseRef = firebase.database().ref().child(rootFolder);

		return {
			migrateNotifications: function(){
				//Get all Users
				$firebaseArray(baseRef.child("users")).$loaded().then(
					function(usersList) {
						/*For each User, Remove the Notifications metadata
						 and use the Notifications List to count the unread*/
						usersList.forEach(function(user){
							console.log(user);
							// $firebaseArray(baseRef.child("notifications/list").child(user.$id).orderByChild("readed").equalTo(false)).$loaded().then(
							// 	function(list){console.log("User: "+user.$id+" Notifications List: "+list.length);}
							// );
							$firebaseArray(baseRef.child("notifications/metadata").child(user.$id)).$loaded().then(
								function(list){
									//Use the length to set the User's notification Counter
									console.log("User: "+user.$id+" Notifications Meta: "+list.length);
									NotificationsSvc.setTotalUnreadNotifications(user.$id,list.length);
								}
							);
						});
					}
				);
			}
		};
	}
]);
