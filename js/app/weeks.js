/* Controller linked to the Admin view of Weeks (/weeks) */
okulusApp.controller('WeeksCntrl',
	['$rootScope', '$scope', '$firebaseAuth', '$location', 'WeeksSvc','AuthenticationSvc',
	function($rootScope, $scope, $firebaseAuth, $location, WeeksSvc, AuthenticationSvc){

		let unwatch = undefined;
		/* Executed everytime we enter to /weeks
		  This function is used to confirm the user is Admin and prepare some initial values */
		$scope.response = {loading: true, message: systemMsgs.inProgress.loading };
		$firebaseAuth().$onAuthStateChanged( function(authUser){ if(authUser){
				AuthenticationSvc.loadSessionData(authUser.uid).$loaded().then(function (user) {
					if(user.type == constants.roles.user){
						$rootScope.response = {error:true, showHomeButton: true, message:systemMsgs.error.noPrivileges};
						$location.path(constants.pages.error);
					}else{
						$rootScope.weeksGlobalCounter = WeeksSvc.getGlobalWeeksCounter();
						$rootScope.weeksGlobalCounter.$loaded().then(function(weekCounters){
							$scope.response = undefined;
							/* Adding a Watch to the weeksGlobalCounter to detect changes.
							The idea is to update the maxPossible value from weekListParams.*/
							if(unwatch){ unwatch(); }
							unwatch = $rootScope.weeksGlobalCounter.$watch( function(data){
								if($rootScope.weekListParams){
									let loader = $rootScope.weekListParams.activeWeekLoader;
									$rootScope.weekListParams = getweekListParams(loader);
									$scope.response = undefined;
								}
							} );
						});
					}
				});
		}});

		/* Sorting */
		$scope.selectedSortBy="$id";
		$scope.reverseSort=false;
		$scope.sortOptions=[{text:$scope.i18n.weeks.weekLbl, value:"$id",active:"active"},
												{text:$scope.i18n.weeks.nameLbl, value:"name",active:""}];

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
		 They will create a weekListParams object containing the name of the loader
		 used, and determining the max possible records to display. */
		$scope.loadAllWeeksList = function () {
			$scope.response = {loading: true, message: systemMsgs.inProgress.loadingAllWeeks};
			$rootScope.weekListParams = getweekListParams("loadAllWeeksList");
			$rootScope.weeksList = WeeksSvc.getWeeks();
			weekListLoaded();
		};

		$scope.loadOpenWeeksList = function () {
			$scope.response = {loading: true, message: systemMsgs.inProgress.loadingOpenWeeks };
			$rootScope.weekListParams = getweekListParams("loadOpenWeeksList");
			$rootScope.weeksList = WeeksSvc.getOpenWeeks($rootScope.config.maxQueryListResults);
			weekListLoaded();
		};

		$scope.loadClosedWeeksList = function () {
			$scope.response = {loading: true, message: systemMsgs.inProgress.loadingClosedWeeks };
			$rootScope.weekListParams = getweekListParams("loadClosedWeeksList");
			$rootScope.weeksList = WeeksSvc.getClosedWeeks($rootScope.config.maxQueryListResults);
			weekListLoaded();
		};

		$scope.loadVisibleWeeksList = function () {
			$scope.response = {loading: true, message: systemMsgs.inProgress.loadingVisibleWeeks  };
			$rootScope.weekListParams = getweekListParams("loadVisibleWeeksList");
			$rootScope.weeksList = WeeksSvc.getVisibleWeeks($rootScope.config.maxQueryListResults);
			weekListLoaded();
		};

		$scope.loadHiddenWeeksList = function () {
			$scope.response = {loading: true, message: systemMsgs.inProgress.loadingHiddenWeeks  };
			$rootScope.weekListParams = getweekListParams("loadHiddenWeeksList");
			$rootScope.weeksList = WeeksSvc.getHiddenWeeks($rootScope.config.maxQueryListResults);
			weekListLoaded();
		};

		/* Load ALL the pending weeks. Use the weekListParams.activeWeekLoader to
		determine what type of weeks should be loaded, and how. */
		$scope.loadPendingWeeks = function () {
			let weekLoaderName = $rootScope.weekListParams.activeWeekLoader;
			$scope.response = {loading: true, message: systemMsgs.inProgress.loading  };
			if(weekLoaderName=="loadAllWeeksList"){
				$rootScope.weeksList = WeeksSvc.getWeeks();
			} else if(weekLoaderName=="loadOpenWeeksList"){
				$rootScope.weeksList = WeeksSvc.getOpenWeeks();
			} else if(weekLoaderName=="loadClosedWeeksList"){
				$rootScope.weeksList = WeeksSvc.getClosedWeeks();
			} else if(weekLoaderName=="loadVisibleWeeksList"){
				$rootScope.weeksList = WeeksSvc.getVisibleWeeks();
			} else if(weekLoaderName=="loadHiddenWeeksList"){
				$rootScope.weeksList = WeeksSvc.getHiddenWeeks();
			}
			weekListLoaded();
		};

		/*Build object with Params used in the view.
		 activeWeekLoader: Will help to identify what type of weeks we want to load (open,closed,visible,hidden,all)
		 searchFilter: Container for the view filter
		 title: Title of the Week List will change according to the loader in use
		 maxPossible: Used to inform the user how many weeks are pending to load */
		getweekListParams = function (weekLoader) {
			let weekListParams = {activeWeekLoader:weekLoader, searchFilter:undefined};
			if(weekLoader == "loadAllWeeksList"){
				weekListParams.title= $rootScope.i18n.weeks.totalWeeksLbl;
				weekListParams.maxPossible = $rootScope.weeksGlobalCounter.total;
			} else if(weekLoader == "loadOpenWeeksList"){
				weekListParams.title= $rootScope.i18n.weeks.openWeeksLbl;
				weekListParams.maxPossible = $rootScope.weeksGlobalCounter.open;
			} else if(weekLoader == "loadClosedWeeksList"){
				weekListParams.title= $rootScope.i18n.weeks.closedWeeksLbl;
				weekListParams.maxPossible = ($rootScope.weeksGlobalCounter.total - $rootScope.weeksGlobalCounter.open);
			} else if(weekLoader == "loadVisibleWeeksList"){
				weekListParams.title= $rootScope.i18n.weeks.visibleWeeksLbl;
				weekListParams.maxPossible = $rootScope.weeksGlobalCounter.visible;
			} else if(weekLoader == "loadHiddenWeeksList"){
				weekListParams.title= $rootScope.i18n.weeks.hiddenWeeksLbl;
				weekListParams.maxPossible = ($rootScope.weeksGlobalCounter.total - $rootScope.weeksGlobalCounter.visible);
			}
			return weekListParams;
		};

		/*Prepares the response after the weeksList is loaded */
		weekListLoaded = function () {
			$rootScope.weeksList.$loaded().then(function(weeks) {
				$scope.response = undefined;
				$rootScope.weekResponse = null;
				if(!weeks.length){
					$scope.response = { error: true, message: $rootScope.i18n.weeks.noWeeksError };
				}
			}).catch( function(error){
				$scope.response = { error: true, message: $rootScope.i18n.weeks.loadingError };
				console.error(error);
			});
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

okulusApp.factory('WeeksSvc',
['$rootScope', '$firebaseArray', '$firebaseObject','AuditSvc',
	function($rootScope, $firebaseArray, $firebaseObject, AuditSvc){
		let baseRef = firebase.database().ref().child(constants.db.folders.root);
		let weeksDetailsRef = baseRef.child(constants.db.folders.weeksDetails);
		let weeksListRef = baseRef.child(constants.db.folders.weeksList);
		let isOpenWeekRef = weeksListRef.orderByChild(constants.status.isOpen);
		let isVisibleWeekRef = weeksListRef.orderByChild(constants.status.isVisible);
		let openWeeksCounterRef = baseRef.child(constants.db.folders.openWeeksCount);
		let visibleWeeksCounterRef = baseRef.child(constants.db.folders.visibleWeeksCount);
		let totalWeeksCounterRef = baseRef.child(constants.db.folders.totalWeeksCount);

		let updateOpenStatusCounterAndAudit = function (isWeekOpen, weekId) {
			if(isWeekOpen){
				let description = systemMsgs.notifications.weekOpened + weekId;
				AuditSvc.saveAuditAndNotify(constants.actions.open, constants.db.folders.weeks, weekId, description);
				increaseCounter(openWeeksCounterRef);
			}else{
				let description = systemMsgs.notifications.weekClosed + weekId;
				AuditSvc.saveAuditAndNotify(constants.actions.close, constants.db.folders.weeks, weekId, description);
				decreaseCounter(openWeeksCounterRef);
			}
		};

		let updateVisibilityCounterAndAudit = function (isWeekVisible, weekId) {
			if(isWeekVisible){
				let description = systemMsgs.notifications.weekVisible + weekId;
				AuditSvc.saveAuditAndNotify(constants.actions.show, constants.db.folders.weeks, weekId, description);
				increaseCounter(visibleWeeksCounterRef);
			}else{
				let description = systemMsgs.notifications.weekHiden + weekId;
				AuditSvc.saveAuditAndNotify(constants.actions.hide, constants.db.folders.weeks, weekId, description);
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
			getAllWeeks: function(limit){
				if(limit){
					return $firebaseArray(weeksListRef.limitToLast(limit));
				}else{
					return $firebaseArray(weeksListRef);
				}
			},
			getOpenWeeks: function(limit){
				if(limit){
					return $firebaseArray(isOpenWeekRef.equalTo(true).limitToLast(limit));
				}else{
					return $firebaseArray(isOpenWeekRef.equalTo(true));
				}
			},
			getClosedWeeks: function(limit){
				if(limit){
					return $firebaseArray(isOpenWeekRef.equalTo(false).limitToLast(limit));
				}else{
					return $firebaseArray(isOpenWeekRef.equalTo(false));
				}
			},
			getVisibleWeeks: function(limit){
				if(limit){
					return $firebaseArray(isVisibleWeekRef.equalTo(true).limitToLast(limit));
				}else{
					return $firebaseArray(isVisibleWeekRef.equalTo(true));
				}
			},
			getHiddenWeeks: function(limit){
				if(limit){
					return $firebaseArray(isVisibleWeekRef.equalTo(false).limitToLast(limit));
				}else{
					return $firebaseArray(isVisibleWeekRef.equalTo(false));
				}
			},
			getWeeks: function(limit){
				if(limit){
					return $firebaseArray(weeksListRef.orderByKey().limitToLast(limit));
				}else{
					return $firebaseArray(weeksListRef.orderByKey());
				}
			},
			/*Return the Open Week with the highest Id as a Firebase Object*/
			getGreatestOpenWeekArray: function(weekId){
				return $firebaseArray(isOpenWeekRef.limitToLast(1));
			},
			/*Return Week Firebase Object*/
			getWeekObject: function(weekId){
				return $firebaseObject(weeksListRef.child(weekId));
			},
			getWeekAuditObject: function(weekId){
				return $firebaseObject(weeksDetailsRef.child(weekId).child(constants.db.folders.audit));
			},
			/* Get the Week Object from the firebaseArray in the rootScope
			(when updating status from Weeks List), update the isOpen value (boolean),
			update global counters,	update the Week's Audit details,
			and generate the notification (triggered from saveAuditAndNotify).*/
			updateWeekStatusInArray: function (weekId, isOpen){
				let weekRecord = $rootScope.weeksList.$getRecord(weekId);
				weekRecord.isOpen = isOpen;
				$rootScope.weeksList.$save(weekRecord).then(function(){
					updateOpenStatusCounterAndAudit(isOpen,weekId);
				});
			},
			/* When updating status from Week-Edit, we receive the Week Object,
		  update the isOpen value (boolean), update global counters,
			update the Week's Audit details, and generate the notification (triggered from saveAuditAndNotify).*/
			updateWeekStatusInObject: function (weekObject, isOpen) {
				weekObject.isOpen = isOpen;
				weekObject.$save().then(function(ref) {
					updateOpenStatusCounterAndAudit(isOpen, weekObject.$id);
				}, function(error) {
					console.debug("Error:", error);
				});
			},
			/* Get the Week Object from the firebaseArray in the rootScope
			(when updating visibility from Weeks List), update the isVisible value (boolean),
			update global counters,	update the Week's Audit details,
			and generate the notification (triggered from saveAuditAndNotify).*/
			updateWeekVisibilityInArray: function (weekId, isVisible) {
				let weekRecord = $rootScope.weeksList.$getRecord(weekId);
				weekRecord.isVisible = isVisible;
				$rootScope.weeksList.$save(weekRecord).then(function(){
					updateVisibilityCounterAndAudit(isVisible, weekId);
				});
			},
			/* When updating visibility from Week-Edit, we receive the Week Object,
		  update the isVisible value (boolean), update global counters,
			update the Week's Audit details, and generate the notification (triggered from saveAuditAndNotify). */
			updateWeekVisibilityInObject: function (weekObject, isVisible) {
				weekObject.isVisible = isVisible;
				weekObject.$save().then(function(ref) {
					updateVisibilityCounterAndAudit(isVisible, weekObject.$id);
				}, function(error) {
					console.debug("Error:", error);
				});
			},
			/*Used when creating a Week*/
			increaseTotalWeeksCounter: function () {
				increaseCounter(totalWeeksCounterRef);
			},
			increaseVisibleWeeksCounter: function () {
				increaseCounter(visibleWeeksCounterRef);
			},
			increaseOpenWeeksCounter: function () {
				increaseCounter(openWeeksCounterRef);
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
			},
			getGlobalWeeksCounter: function(){
				return $firebaseObject(baseRef.child(constants.db.folders.weeksCounters));
			},
			decreaseReportsCountForWeek: function(weekId) {
				let conunterRef = weeksListRef.child(weekId).child(constants.db.fields.weekReportsCount);
				decreaseCounter(conunterRef);
			},
			increaseReportsCountForWeek: function(weekId) {
				let conunterRef = weeksListRef.child(weekId).child(constants.db.fields.weekReportsCount);
				increaseCounter(conunterRef);
			}
		};//return end
	}
]);

/* Controller linked to /weeks/view/:weekId and /weeks/edit/:weekId
 * It will load the Week for the id passed */
okulusApp.controller('WeekDetailsCntrl',
	['$rootScope','$routeParams','$scope','$location','$firebaseAuth',
		'AuthenticationSvc','WeeksSvc', 'ReportsSvc', 'AuditSvc', 'NotificationsSvc',
	function($rootScope, $routeParams, $scope, $location, $firebaseAuth,
		AuthenticationSvc, WeeksSvc, ReportsSvc, AuditSvc, NotificationsSvc){

		/* Init. Executed everytime we enter to /weeks/view/:weekId or /weeks/edit/:weekId */
		$firebaseAuth().$onAuthStateChanged(function(authUser){ if(authUser){
				$scope.response = {loading: true, message: systemMsgs.inProgress.loadingWeek };
				$scope.objectDetails = {};
				AuthenticationSvc.loadSessionData(authUser.uid).$loaded().then(function (user) {
					/* Only Root and Valid Users (with an associated MemberId) can see the content */
					if($rootScope.currentSession.user.type != constants.roles.root && !user.memberId){
						$rootScope.response = {error: true, showHomeButton:true, message: systemMsgs.error.noMemberAssociated};
						$location.path(constants.pages.error);
						return;
					}

					let weekId = $routeParams.weekId;
					/* Edit or View Details of Existing Week */
					if(weekId){
						$scope.objectDetails.basicInfo = WeeksSvc.getWeekObject(weekId);
						$scope.objectDetails.basicInfo.$loaded().then(function(week){
							if(!week.name){ //If week from DB hasnt name, is because no week was found
								$rootScope.response = {error: true, message: systemMsgs.error.recordDoesntExist };
								$location.path(constants.pages.error);
								return;
							}
							$scope.objectDetails.audit = WeeksSvc.getWeekAuditObject(weekId);
							$scope.prepareViewForEdit(week);
						}).catch( function(error){
							$rootScope.response = { error: true, message: error };
							$location.path(constants.pages.error);
						});
					}
					/* New Week Creation */
					else{
						$scope.prepareViewForNew();
					}
				});
		}});

		$scope.basicInfoExpanded = true;
		$scope.expandSection = function(section, value) {
			switch (section) {
				case 'basicInfo':
					$scope.basicInfoExpanded = value;
					break;
				case 'auditInfo':
					$scope.auditInfoExpanded = value;
					break;
				default:
			}
		};

 		$scope.prepareViewForEdit = function (weekObject) {
			$scope.weekEditParams = {};
			$scope.weekEditParams.actionLbl = $rootScope.i18n.weeks.modifyLbl;
			$scope.weekEditParams.isEdit = true;
			$scope.weekEditParams.weekId = weekObject.$id;
			$scope.weekEditParams.dateRequired = false;
			$scope.response = undefined;

			/* Disable the week selector because date shouldn't be modified
			after week is created (beacuse the weekNumber is the week $id), and
			populate the week selector with the Week Object date. */
			let weekInput = document.querySelector("#weekDate")
			if(weekInput){
				let weekCode = weekObject.year + "-W" + weekObject.week;
				weekInput.disabled = true;
				weekInput.value = weekCode;
			}
			/* Set value for the Due date input, from database value*/
			let dueDate = new Date();
			dueDate.setTime(weekObject.duedate);
			$scope.weekEditParams.duedate = dueDate;
			$scope.response = undefined;
		}

		$scope.prepareViewForNew = function () {
			$scope.weekEditParams = {};
			$scope.weekEditParams.actionLbl = $rootScope.i18n.weeks.newLbl;
			$scope.weekEditParams.isEdit = false;
			$scope.weekEditParams.dateRequired = true;
			$scope.weekEditParams.date = new Date();

			let dueDate = new Date();
			dueDate.setHours(0);
			dueDate.setMinutes(0);
			dueDate.setSeconds(0);
			dueDate.setMilliseconds(0);
			$scope.weekEditParams.duedate = dueDate;
			$scope.response = undefined;
		};

		/* Toogle the Week Status (isOpen=true/false) */
		$scope.setWeekOpenStatus = function (setOpen) {
			clearResponse();
			if($rootScope.currentSession.user.type != constants.roles.user){
				WeeksSvc.updateWeekStatusInObject($scope.objectDetails.basicInfo, setOpen);
				$scope.response = {success:true, message: systemMsgs.success.statusUpdated };
			}
		};

		/* Toogle the Week visibility (isVisible=true/false) */
		$scope.setWeekVisibility = function (setVisible) {
			clearResponse();
			if($rootScope.currentSession.user.type != constants.roles.user){
				WeeksSvc.updateWeekVisibilityInObject($scope.objectDetails.basicInfo, setVisible);
				$scope.response = {success:true, message: systemMsgs.success.visibilityUpdated };
			}
		};

		/* Save or Update Week data (Name and Description) */
		$scope.saveWeek = function() {
			clearResponse();
			if($rootScope.currentSession.user.type == constants.roles.user || !$scope.objectDetails.basicInfo){ return; }

			$scope.response = {working:true, message:systemMsgs.inProgress.savingWeekInfo};
			//Build week Id from the selected Week in the input
			let code = document.querySelector("#weekDate").value;
			let codeSplit = code.split("-W");
			let weekId = (codeSplit[0]+codeSplit[1]);
			//Save the duedate as milis
			let duedateStr = document.querySelector("#weekDueDate").value;
			var dudateMilis = Date.parse(duedateStr);

			//Update existing Week
			if($scope.objectDetails.basicInfo.$id){
				$scope.objectDetails.basicInfo.duedate = dudateMilis;
				$scope.objectDetails.basicInfo.$save().then(function(ref) {
					let description = systemMsgs.notifications.weekUpdated + weekId;
					AuditSvc.saveAuditAndNotify(constants.actions.update, constants.db.folders.weeks, weekId, description);
					$scope.response = {success:true, message: systemMsgs.success.weekInfoUpdated};
				},function(error){
					console.debug("Error:", error);
					$scope.response = { error:true, message: error };
				});
			}
			//Create New Week, only if a Week with the same id doesn't exists
			else{
				WeeksSvc.getWeekObject(weekId).$loaded().then(function(week) {
					if(week.name){
						$scope.response = {error:true, message: systemMsgs.error.weekExists+" "+weekId };
					}else{
						week.name = $scope.objectDetails.basicInfo.name;
						week.year = codeSplit[0];
						week.week = codeSplit[1];
						week.duedate = dudateMilis;
						week.study = ($scope.objectDetails.basicInfo.study)?$scope.objectDetails.basicInfo.study:null;;
						week.series = ($scope.objectDetails.basicInfo.series)?$scope.objectDetails.basicInfo.series:null;;
						week.notes = ($scope.objectDetails.basicInfo.notes)?$scope.objectDetails.basicInfo.notes:null;
						week.isOpen = false;
						week.isVisible = false;
						week.reports = 0;

						week.$save().then(function(ref) {
							WeeksSvc.increaseTotalWeeksCounter();
							let description = systemMsgs.notifications.weekCreated + weekId;
							AuditSvc.saveAuditAndNotify(constants.actions.create, constants.db.folders.weeks, weekId, description);
							$rootScope.weekResponse = { created:true, message: $rootScope.i18n.weeks.weekCreated+" "+weekId };
							$location.path(constants.pages.weekEdit+weekId);
						},function(error){
						  console.debug("Error:", error);
							$scope.response = { error:true, message: error };
						});
					}

				});
			}
		};

		/* Delete Week, only when no report is associated to this week */
		$scope.deleteWeek = function() {
			clearResponse();
			let weekInfo = $scope.objectDetails.basicInfo;
			if(weekInfo && $rootScope.currentSession.user.type != constants.roles.user){
				$scope.response = {working:true, message: systemMsgs.inProgress.deletingWeek};
				if(weekInfo.reports > 0){
					$scope.response = {deleteError:true, message: systemMsgs.error.deleteWeekError};
				}else{
					let isWeekOpen = weekInfo.isOpen;
					let isWeekVisible = weekInfo.isVisible;
					//proceed with delete
					weekInfo.$remove().then(function(deletedWeekRef) {
						let deletedWeekId = deletedWeekRef.key;
						let description = systemMsgs.notifications.weekDeleted + deletedWeekId;
						let auditObj = $scope.objectDetails.audit;
						// AuditSvc.saveAuditAndNotify(constants.actions.delete, constants.db.folders.weeks, deletedWeekId, description);
						NotificationsSvc.notifyInvolvedParties(constants.actions.delete, constants.db.folders.weeks, deletedWeekId, description, auditObj);

						WeeksSvc.decreaseTotalWeeksCounter();
						if(isWeekOpen){
							WeeksSvc.decreaseOpenWeeksCounter();
						}
						if(isWeekVisible){
							WeeksSvc.decreaseVisibleWeeksCounter();
						}

						$rootScope.weekResponse = {deleted:true, message: systemMsgs.success.weekDeleted+" "+deletedWeekId};
						$scope.objectDetails.audit.$remove();
						$location.path(constants.pages.adminWeeks);

					}, function(error) {
						console.debug("Error:", error);
					});
				}
			}
		};

		clearResponse = function() {
			$rootScope.weekResponse = null;
			$scope.response = null;
		};
}]);
