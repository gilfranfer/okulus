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

		weekListLoaded = function () {
			$rootScope.weeksList.$loaded().then(function(weeks) {
				$rootScope.weekResponse = null;
				$scope.response = {success:true, message: weeks.length+" "+$rootScope.i18n.weeks.loadingSuccess };
			}).catch( function(error){
				$scope.response = { error: true, message: $rootScope.i18n.weeks.loadingError };
				console.error(error);
			});
		};

		/* On demand load of all Weeks in the system */
		$scope.loadWeeksList = function () {
			$scope.response = {loading: true, message: $rootScope.i18n.weeks.loading };
			$rootScope.weeksList = WeeksSvc.getWeeksLimitToLast($rootScope.config.maxQueryResults);
			weekListLoaded();
		};

		$scope.loadOpenWeeks = function () {
			$scope.response = {loading: true, message: $rootScope.i18n.alerts.loading };
			$rootScope.weeksList = WeeksSvc.getOpenWeeks();
			weekListLoaded();
		};

		$scope.loadClosedWeeks = function () {
			$scope.response = {loading: true, message: $rootScope.i18n.alerts.loading };
			$rootScope.weeksList = WeeksSvc.getClosedWeeks();
			weekListLoaded();
		};

		$scope.loadVisibleWeeks = function () {
			$scope.response = {loading: true, message: $rootScope.i18n.alerts.loading };
			$rootScope.weeksList = WeeksSvc.getVisibleWeeks();
			weekListLoaded();
		};

		$scope.loadHiddenWeeks = function () {
			$scope.response = {loading: true, message: $rootScope.i18n.alerts.loading };
			$rootScope.weeksList = WeeksSvc.getHiddenWeeks();
			weekListLoaded();
		};

		/*Toogle the Week Status (isOpen=true/false) */
		$scope.setWeekOpenStatus = function (weekId, setOpen) {
			WeeksSvc.updateWeekStatusInArray(weekId, setOpen);
			$scope.response = {success:true, message: $rootScope.i18n.weeks.weekUpdated+" "+weekId };
		};

		/*Toogle the Week visibility (isVisible=true/false) */
		$scope.setWeekVisibility = function (weekId, setVisible) {
			WeeksSvc.updateWeekVisibilityInArray(weekId, setVisible);
			$scope.response = {success:true, message: $rootScope.i18n.weeks.weekUpdated+" "+weekId };
		};

	}
]);

okulusApp.factory('WeeksSvc', ['$rootScope', '$firebaseArray', '$firebaseObject','AuditSvc',
	function($rootScope, $firebaseArray, $firebaseObject, AuditSvc){
		// let openStatus = constants.status.open;
		// let closedSatus = constants.status.closed;
		let baseRef = firebase.database().ref().child(rootFolder);
		let weeksRef = baseRef.child('weeks');
		let isOpenWeekRef = weeksRef.orderByChild("isOpen");
		let isVisibleWeekRef = weeksRef.orderByChild("isVisible");
		let openWeeksCounterRef = baseRef.child('counters/weeks/open');
		let visibleWeeksCounterRef = baseRef.child('counters/weeks/visible');
		let totalWeeksCounterRef = baseRef.child('counters/weeks/total');

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
			//Remove
			loadActiveWeeks: function(){
				if(!$rootScope.allActiveWeeks){
					$rootScope.allActiveWeeks = $firebaseArray(isOpenWeekRef.equalTo(true));
				}
			},
			//Remove
			loadAllWeeks: function(){
				if(!$rootScope.allWeeks){
					$rootScope.allWeeks = $firebaseArray(weeksRef);
				}
				return $rootScope.allWeeks;
			},
			getOpenWeeks: function(){
				return $firebaseArray(isOpenWeekRef.equalTo(true));
			},
			getClosedWeeks: function(){
				return $firebaseArray(isOpenWeekRef.equalTo(false));
			},
			getVisibleWeeks: function(){
				return $firebaseArray(isVisibleWeekRef.equalTo(true));
			},
			getHiddenWeeks: function(){
				return $firebaseArray(isVisibleWeekRef.equalTo(false));
			},
			getWeeksLimitToLast: function(limit){
				return $firebaseArray(weeksRef.orderByKey().limitToLast(limit));
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
				let weekRecord = $rootScope.weeksList.$getRecord(weekId);
				weekRecord.isOpen = isOpen;
				$rootScope.weeksList.$save(weekRecord).then(function(){
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
				let weekRecord = $rootScope.weeksList.$getRecord(weekId);
				weekRecord.isVisible = isVisible;
				$rootScope.weeksList.$save(weekRecord).then(function(){
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
			},
			/*Used when creating a Week*/
			increaseTotalWeeksCounter: function () {
				increaseCounter(totalWeeksCounterRef);
			},
			/*Used when deleting a Week*/
			decreaseTotalWeeksCounter: function () {
				decreaseCounter(totalWeeksCounterRef);
			},
			/*Used when deleting a Week with Open Status*/
			decreaseOpenWeeksCounter: function () {
				decreaseCounter(openWeeksCounterRef);
			},
			/*Used when deleting a Week with Visible Status*/
			decreaseVisibleWeeksCounter: function () {
				decreaseCounter(visibleWeeksCounterRef);
			}
		};//return end
	}
]);

/* Controller linked to /weeks/details/:weekId and /weeks/edit/:weekId
 * It will load the Week for the id passed */
okulusApp.controller('WeekDetailsCntrl',
	['$rootScope','$routeParams','$scope','$location','$firebaseAuth',
		'AuthenticationSvc','WeeksSvc', 'ReportsSvc', 'AuditSvc',
	function($rootScope, $routeParams, $scope, $location, $firebaseAuth,
		AuthenticationSvc, WeeksSvc, ReportsSvc, AuditSvc){

		/* Init. Executed everytime we enter to /weeks/details/:weekId or /weeks/edit/:weekId */
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
						$scope.objectDetails = WeeksSvc.getWeekObject($routeParams.weekId);
						$scope.objectDetails.$loaded().then(function(week){
							if(!week.name){ //If week from DB hasnt name, is because no week was found
								$rootScope.response = {error: true, message: $rootScope.i18n.error.recordDoesntExist };
								$location.path(constants.pages.error); return;
							}
							prepareViewForEdit(week);
						}).catch( function(error){
							$rootScope.response = { error: true, message: error };
							$location.path(constants.pages.error);
						});
					}
					/* New Week Creation */
					else{
						$scope.weekParams.actionLbl = $rootScope.i18n.weeks.newLbl;
						$scope.weekParams.date = new Date();
						$scope.weekParams.dateRequired = true;
						$scope.weekParams.showBadges = false;
						$scope.response = undefined;
					}
				});
		}});

 		prepareViewForEdit = function (weekObject) {
			$scope.weekParams.actionLbl = $rootScope.i18n.weeks.modifyLbl;
			$scope.weekParams.dateRequired = false;
			$scope.weekParams.showBadges = true;
			//$scope.audit = weekObject.audit;

			let weekInput = document.querySelector("#weekDate")
			if(weekInput){
				let weekCode = weekObject.year + "-W" + weekObject.weekNumber;
				/* Disable the week selector because date shouldn't be modified
				after week is created (beacuse the weekNumber is the week $id), and
				populate the week selector with the Week Object date. */
				weekInput.disabled = true;
				weekInput.value = weekCode;
			}
			$scope.response = undefined;
		}

		/* Toogle the Week Status (isOpen=true/false) */
		$scope.setWeekOpenStatus = function (setOpen) {
			$rootScope.weekResponse = null;
			WeeksSvc.updateWeekStatusInObject($scope.objectDetails,setOpen);
			$scope.response = {success:true, message: $rootScope.i18n.weeks.statusUpdated };
		};

		/* Toogle the Week visibility (isVisible=true/false) */
		$scope.setWeekVisibility = function (setVisible) {
			$rootScope.weekResponse = null;
			WeeksSvc.updateWeekVisibilityInObject($scope.objectDetails, setVisible);
			$scope.response = {success:true, message: $rootScope.i18n.weeks.visibilityUpdated };
		};

		/* Save or Update Week data (Name and Description) */
		$scope.save = function() {
			$rootScope.weekResponse = null;
			if(!$scope.objectDetails){ return; }

			$scope.response = {working:true, message:$rootScope.i18n.alerts.working};
			//Build week Id from the selected Week in the input
			let code = document.querySelector("#weekDate").value;
			let codeSplit = code.split("-W");
			let weekId = (codeSplit[0]+codeSplit[1]);

			//Update existing Week
			if($scope.objectDetails.$id){
				$scope.objectDetails.$save().then(function(ref) {
					AuditSvc.recordAudit(weekId, "update", "weeks");
					$scope.response = {success:true, message: $rootScope.i18n.weeks.weekUpdated+" "+weekId };
				},function(error){
					console.log("Error:", error);
					$scope.response = { error:true, message: error };
				});
			}
			//Create New Week, only if a Week with the same id doesn't exists
			else{
				WeeksSvc.getWeekObject(weekId).$loaded().then(function(week) {
					if(week.name){
						$scope.response = {error:true, message: $rootScope.i18n.weeks.weekExists+" "+weekId };
					}else{
						week.name = $scope.objectDetails.name;
						week.year = codeSplit[0];
						week.weekNumber = codeSplit[1];
						week.isOpen = false;
						week.isVisible = false;

						week.$save().then(function(ref) {
							WeeksSvc.increaseTotalWeeksCounter();
							AuditSvc.recordAudit(weekId, "create", "weeks");
							$rootScope.weekResponse = { created:true, message: $rootScope.i18n.weeks.weekCreated+" "+weekId };
							$location.path("/weeks/edit/"+weekId);
						},function(error){
						  console.log("Error:", error);
							$scope.response = { error:true, message: error };
						});
					}

				});
			}
		};

		/* Delete Week, only when no report is associated to this week */
		$scope.delete = function() {
			$rootScope.weekResponse = null;
			$scope.response = {working:true, message:$rootScope.i18n.alerts.working};
			let weekId = $scope.objectDetails.$id;
			/*In future all weeks should have a counter with the number of Existing
			reports associated to this week */
			if($scope.objectDetails.reportsCount >= 0){ //Remove "if" once all weeks have reportsCount
				if($scope.objectDetails.reportsCount > 0){
					$scope.response = {error:true, message: $rootScope.i18n.weeks.deleteError};
				}else{
					let isWeekOpen = $scope.objectDetails.isOpen;
					let isWeekVisible = $scope.objectDetails.isVisible;
					//proceed with delete
					$scope.objectDetails.$remove().then(function(ref) {
						if(isWeekOpen){
							WeeksSvc.decreaseOpenWeeksCounter();
						}
						if(isWeekVisible){
							WeeksSvc.decreaseVisibleWeeksCounter();
						}
						WeeksSvc.decreaseTotalWeeksCounter();
						AuditSvc.recordAudit(weekId, "delete", "weeks");
						$rootScope.weekResponse = {deleted:true, message: $rootScope.i18n.weeks.weekDeleted+" "+weekId};
						$location.path("/weeks");
					}, function(error) {
						console.log("Error:", error);
					});
				}
			}
			//This will be removed once all weeks have reportsCount
			else{
				let weekReports = ReportsSvc.getReportsForWeekWithLimit(weekId, 1);
				weekReports.$loaded().then(function (reportsList) {
					if(reportsList.length>0){
						$scope.response = {error:true, message: $rootScope.i18n.weeks.deleteError};
					}else{
						let isWeekOpen = $scope.objectDetails.isOpen;
						let isWeekVisible = $scope.objectDetails.isVisible;
						//proceed with delete
						$scope.objectDetails.$remove().then(function(ref) {
							if(isWeekOpen){
								WeeksSvc.decreaseOpenWeeksCounter();
							}
							if(isWeekVisible){
								WeeksSvc.decreaseVisibleWeeksCounter();
							}
							WeeksSvc.decreaseTotalWeeksCounter();
							AuditSvc.recordAudit(weekId, "delete", "weeks");
							$rootScope.weekResponse = {deleted:true, message:$rootScope.i18n.weeks.weekDeleted+" "+weekId};
							$location.path("/weeks");
						}, function(error) {
							console.log("Error:", error);
						});
					}
				});
			}
		};

}]);
