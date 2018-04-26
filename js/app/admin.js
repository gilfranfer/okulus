okulusApp.controller('MonitorCntrl', ['$rootScope','$scope','$firebaseArray','$firebaseObject','AuditSvc', 'MigrationSvc','$firebaseAuth','$location','AuthenticationSvc',
	function($rootScope, $scope, $firebaseArray, $firebaseObject,AuditSvc,MigrationSvc,$firebaseAuth,$location,AuthenticationSvc){

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

		$scope.migrateAudit = function () {
			MigrationSvc.migrateAudit()
		}
	}
]);

okulusApp.controller('AdminDashCntrl', ['$rootScope','$scope','$firebaseObject','WeeksSvc','GroupsSvc','$firebaseAuth','$location','AuthenticationSvc',
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

okulusApp.factory('MigrationSvc', ['$firebaseArray', '$firebaseObject',
	function( $firebaseArray, $firebaseObject){
		let baseRef = firebase.database().ref().child(rootFolder);

		let updateAudit = function(usersMap, record, folder){
			let audit = record.audit;
			if(audit){
				if(audit.createdBy){
					audit.createdById = usersMap.get(audit.createdBy);
				}else if(record.createdBy){
					audit.createdOn = record.createdOn;
					record.createdOn = null;
					audit.createdBy = record.createdBy;
					record.createdBy = null;
					audit.createdById = usersMap.get(audit.createdBy);
				}
				if (audit.lastUpdateBy) {
					audit.lastUpdateById = usersMap.get(audit.lastUpdateBy);
				}else if(record.lastUpdateBy){
					audit.lastUpdateOn = record.lastUpdateOn;
					record.lastUpdateOn = null;
					audit.lastUpdateBy = record.lastUpdateBy;
					record.lastUpdateBy = null;
					audit.lastUpdateById = usersMap.get(audit.lastUpdateBy);
				}
				if (audit.rejectedBy) {
					audit.rejectedById = usersMap.get(audit.rejectedBy);
				}
				if (audit.approvedBy) {
					audit.approvedById = usersMap.get(audit.approvedBy);
				}
			}else {
				console.error("No Audit Folder on ", folder,record.$id);
			}
		}

		return {
			migrateAudit: function(){
				let allusers = $firebaseArray(baseRef.child("users"));
				console.debug("Initiating Migration");
				allusers.$loaded().then(function(users){
					console.debug("loading Email - User ID map");
					var userMap = new Map();
					userMap.set("Root", null);
					userMap.set("System", null);
					allusers.forEach(function(user) {
						userMap.set(user.email, user.$id);
					});

					console.debug("Migrating Folders");
					let allweeks = $firebaseArray(baseRef.child("weeks"));
					let allgroups = $firebaseArray(baseRef.child("groups"));
					let allmembers = $firebaseArray(baseRef.child("members"));
					let allreports = $firebaseArray(baseRef.child("reports"));

					console.debug("Migrating Groups");
					allgroups.$loaded().then(function(){
						allgroups.forEach(function(element){
							let record = allgroups.$getRecord(element.$id);
							updateAudit(userMap, record, "groups");
							allgroups.$save(record);
						});
					});
					console.debug("Migrating Weeks");
					allweeks.$loaded().then(function(){
						allweeks.forEach(function(element){
							let record = allweeks.$getRecord(element.$id);
							updateAudit(userMap, record, "weeks");
							allweeks.$save(record);
						});
					});
					console.debug("Migrating Members");
					allmembers.$loaded().then(function(){
						allmembers.forEach(function(element){
							let record = allmembers.$getRecord(element.$id);
							updateAudit(userMap, record, "members");
							allmembers.$save(record);
						});
					});
					console.debug("Migrating Reports");
					allreports.$loaded().then(function(){
						allreports.forEach(function(element){
							let record = allreports.$getRecord(element.$id);
							updateAudit(userMap, record, "reports");
							allreports.$save(record);
						});
					});
					console.debug("Migrating Users");
					allusers.$loaded().then(function(){
						allusers.forEach(function(element){
							let record = allusers.$getRecord(element.$id);
							updateAudit(userMap, record, "users");
							allusers.$save(record);
						});
					});
				});

			}
		};
	}
]);
