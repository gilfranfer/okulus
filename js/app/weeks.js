/* Controller linked to the Admin view of Weeks (/weeks) */
okulusApp.controller('WeeksCntrl',
	['$rootScope', '$scope', '$firebaseAuth', '$location', 'WeeksSvc', 'AuditSvc', 'UtilsSvc','AuthenticationSvc',
	function($rootScope, $scope, $firebaseAuth, $location, WeeksSvc, AuditSvc, UtilsSvc, AuthenticationSvc){

		/* Executed everytime we enter to /weeks
		  This function is used to confirm the user is Admin and prepare some initial values */
		$scope.response = {loading: true, message: $rootScope.i18n.alerts.loading };
		$firebaseAuth().$onAuthStateChanged( function(authUser){ if(authUser){
				AuthenticationSvc.loadSessionData(authUser.uid).$loaded().then(function (user) {
					if(user.type == constants.roles.admin){
						UtilsSvc.loadSystemCounter();
						$rootScope.systemCounters.$loaded().then(function(counters) {
							$scope.response = undefined;
						});
					}else{
						$rootScope.response = {error:true, showHomeButton: true,
																	message:$rootScope.i18n.error.noAdmin};
						$location.path(constants.pages.error);
					}
				});
		}});

		/*On demand load of all Weeks in the system*/
		$scope.loadWeeksList = function () {
			$scope.response = {loading: true, message: $rootScope.i18n.weeks.loading };
			$rootScope.weeksList = WeeksSvc.loadAllWeeks();
			$rootScope.weeksList.$loaded().then(function(weeks) {
				$scope.response = {success:true, message: weeks.length+" "+$rootScope.i18n.weeks.loadingSuccess };
			})
			.catch( function(error){
				$scope.response = { error: true, message: $rootScope.i18n.weeks.loadingError };
				console.error(error);
			});
		};

		/*Toogle the Week Status (isOpen=true/false) */
		$scope.setWeekOpenStatus = function (weekId, setOpen) {
			WeeksSvc.updateWeekStatusInArray(weekId, setOpen);
		};

		/*Toogle the Week visibility (isVisible=true/false) */
		$scope.setWeekVisibility = function (weekId, setVisible) {
			WeeksSvc.updateWeekVisibilityInArray(weekId, setVisible);
		};

	}
]);

okulusApp.factory('WeeksSvc', ['$rootScope', '$firebaseArray', '$firebaseObject','AuditSvc',
	function($rootScope, $firebaseArray, $firebaseObject, AuditSvc){
		// let openStatus = constants.status.open;
		// let closedSatus = constants.status.closed;

		let weeksRef = firebase.database().ref().child(rootFolder).child('weeks');
		let openWeeksRef = weeksRef.orderByChild("isOpen").equalTo(true);
		let openWeeksCounterRef = firebase.database().ref().child(rootFolder).child('counters/weeks/open');
		let visibleWeeksCounterRef = firebase.database().ref().child(rootFolder).child('counters/weeks/visible');

		let updateOpenStatusCounterAndAudit = function (isWeekOpen, weekId) {
			if(isWeekOpen){
				AuditSvc.recordAudit(weekId, "open", "weeks");
				increaseCounter(openWeeksCounterRef);
			}else{
				AuditSvc.recordAudit(weekId, "closed", "weeks");
				decreaseCounter(openWeeksCounterRef);
			}
		};

		let updateVisibilityCounterAndAudit = function (isWeekVisible, weekId) {
			if(isWeekVisible){
				AuditSvc.recordAudit(weekId, "show", "weeks");
				increaseCounter(visibleWeeksCounterRef);
			}else{
				AuditSvc.recordAudit(weekId, "hide", "weeks");
				decreaseCounter(visibleWeeksCounterRef);
			}
		};

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
			loadActiveWeeks: function(){
				if(!$rootScope.allActiveWeeks){
					$rootScope.allActiveWeeks = $firebaseArray(openWeeksRef);
				}
			},
			loadAllWeeks: function(){
				if(!$rootScope.allWeeks){
					$rootScope.allWeeks = $firebaseArray(weeksRef);
				}
				return $rootScope.allWeeks;
			},
			//REMOVE?
			getWeeksFolderRef: function(){
				return firebase.database().ref().child(rootFolder).child('weeks');
			},
			/*Return Week Firebase Object*/
			getWeekObject: function(weekId){
				return $firebaseObject(weeksRef.child(weekId));
			},
			/* Get the Week Object from the firebaseArray in the rootScope
			(when updating status from Weeks List), update the isOpen value (boolean),
			update global counters,	update the Week's Audit details,
			and generate the notification (triggered from recordAudit).*/
			updateWeekStatusInArray: function (weekId, isOpen){
				let weekRecord = $rootScope.allWeeks.$getRecord(weekId);
				weekRecord.isOpen = isOpen;
				$rootScope.allWeeks.$save(weekRecord).then(function(){
					updateOpenStatusCounterAndAudit(isOpen,weekId);
				});
			},
			/* When updating status from Week-Edit, we receive the Week Object,
		  update the isOpen value (boolean), update global counters,
			update the Week's Audit details, and generate the notification (triggered from recordAudit).*/
			updateWeekStatusInObject: function (weekObject, isOpen) {
				weekObject.isOpen = isOpen;
				weekObject.$save().then(function(ref) {
					updateOpenStatusCounterAndAudit(isOpen, weekObject.$id);
				}, function(error) {
					console.log("Error:", error);
				});
			},
			/* Get the Week Object from the firebaseArray in the rootScope
			(when updating visibility from Weeks List), update the isVisible value (boolean),
			update global counters,	update the Week's Audit details,
			and generate the notification (triggered from recordAudit).*/
			updateWeekVisibilityInArray: function (weekId, isVisible) {
				let weekRecord = $rootScope.allWeeks.$getRecord(weekId);
				weekRecord.isVisible = isVisible;
				$rootScope.allWeeks.$save(weekRecord).then(function(){
					updateVisibilityCounterAndAudit(isVisible, weekId);
				});
			},
			/* When updating visibility from Week-Edit, we receive the Week Object,
		  update the isVisible value (boolean), update global counters,
			update the Week's Audit details, and generate the notification (triggered from recordAudit). */
			updateWeekVisibilityInObject: function (weekObject, isVisible) {
				weekObject.isVisible = isVisible;
				weekObject.$save().then(function(ref) {
					updateVisibilityCounterAndAudit(isVisible, weekObject.$id);
				}, function(error) {
					console.log("Error:", error);
				});
			}

		};//return end
	}
]);

/* Controller linked to /weeks/details/:weekId and /weeks/edit/:weekId
 * It will load the Week for the id passed */
okulusApp.controller('WeekDetailsCntrl',
	['$rootScope','$routeParams','$scope','$location','$firebaseAuth','AuthenticationSvc','WeeksSvc', 'ReportsSvc',
	function($rootScope, $routeParams, $scope, $location, $firebaseAuth, AuthenticationSvc, WeeksSvc, ReportsSvc){
		$scope.response = {loading: true, message: $rootScope.i18n.alerts.loading };

		/* Iniit. Executed everytime we enter to /weeks/details/:weekId or /weeks/edit/:weekId */
		$firebaseAuth().$onAuthStateChanged(function(authUser){ if(authUser){
				$scope.response = {loading: true, message: $rootScope.i18n.alerts.loading };
				//Container for Aditional Parameters, used when building the view
				$scope.weekParams = {};

				AuthenticationSvc.loadSessionData(authUser.uid).$loaded().then(function (user) {
					/* Confirm the user has an associated Member */
					if(!user.memberId){
						$rootScope.response = {error: true, message: $rootScope.i18n.error.noMemberAssociated };
						$location.path(constants.pages.error);
						return;
					}
					/* Edit or View Details of Existing Week */
					if($routeParams.weekId){
						$scope.weekDetails = WeeksSvc.getWeekObject($routeParams.weekId);
						$scope.weekDetails.$loaded().then(function(week){
							if(!week.name){
								$rootScope.response = {error: true, message: $rootScope.i18n.error.recordDoesntExist };
								$location.path(constants.pages.error);
							}
							let weekInput = document.querySelector("#weekDate")
							if(weekInput){
								/*On Edit view, disable the week selector because date shouldn't be modified
								after week is created (beacuse the weekNumber is the week $id), and
								populate the week selector with the Week Object date. */
								weekInput.disabled = true;
								let weekCode = week.year + "-W" + week.weekNumber;
								document.querySelector("#weekDate").value = weekCode;
							}
							$scope.audit = week.audit;//Set audit object for Reusable Audit View
							$scope.weekParams.actionLbl = $rootScope.i18n.weeks.modifyLbl;
							$scope.weekParams.showBadges = true;
							$scope.response = undefined;
						}).catch( function(error){
							$rootScope.response = { error: true, message: error };
							$location.path(constants.pages.error);
						});
					}
					/* New Week Creation */
					else{
						$scope.weekParams.actionLbl = $rootScope.i18n.weeks.newLbl;
						$scope.weekParams.date = new Date();
						$scope.response = undefined;
					}
				});
		}});

		/* Toogle the Week Status (isOpen=true/false) */
		$scope.setWeekOpenStatus = function (setOpen) {
			WeeksSvc.updateWeekStatusInObject($scope.weekDetails,setOpen);
			$scope.audit = $scope.weekDetails.audit;
		};

		/* Toogle the Week visibility (isVisible=true/false) */
		$scope.setWeekVisibility = function (setVisible) {
			WeeksSvc.updateWeekVisibilityInObject($scope.weekDetails, setVisible);
			$scope.audit = $scope.weekDetails.audit;
		};

		$scope.addWeek = function () {
			$scope.response = null;
			let weekId = document.querySelector("#weekId").value;
			let weekName = document.querySelector("#weekName").value;
			//if(!WeeksSvc.getWeekRecord(weekId)){
				let idSplit = weekId.split("-W");
				let code = (idSplit[0]+idSplit[1]);

				weeksRef = WeeksSvc.getWeeksFolderRef();
				let record = {status:"open", name:weekName};

				weeksRef.child(code).set(record, function(error) {
					if(error){
						$scope.response = {weekMsgError: error };
					}else{
						//For some reason the message is not displayed until
						//you interact with any form element
					}
				});
				//adding trick below to ensure message is displayed
				let obj = WeeksSvc.getWeekObject(weekId);
				obj.$loaded().then(function() {
					AuditSvc.recordAudit(code, "create", "weeks");
					$scope.response = {weekMsgOk: "Semana "+weekId+" Creada" };
				});

			/*}else{
				$scope.response = {weekMsgError: "La Semana "+weekId+" ya existe" };
			}*/
		};

		/* Save or Update Week */
		$scope.save = function() {
			let weekId = document.querySelector("#weekDate").value;
			console.log("Save week:",$scope.weekDetails);
		};

		/* Delete Week, only when no report is associated to this week */
		$scope.delete = function() {
			$scope.response = {working:true, message:$rootScope.i18n.alerts.working};
			let weekReports = ReportsSvc.getReportsForWeekWithLimit($scope.weekDetails.$id, 1);
			weekReports.$loaded().then(function (reportsList) {
				if(reportsList.length>0){
					$scope.response = {error:true, message: $rootScope.i18n.weeks.deleteError};
				}else{
					$scope.weekDetails.$remove().then(function(ref) {
						$location.path(constants.pages.adminWeeks);
					}, function(error) {
					  console.log("Error:", error);
					});
				}
			});
		};

}]);
