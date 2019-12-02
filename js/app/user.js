/* Controller linked to /mycontacts
 * It will load all the Members that are part of the Groups the Current Member has Access to */
okulusApp.controller('UserMyContactsCntrl',
	['$rootScope','$scope','$location','$firebaseAuth','MembersSvc', 'GroupsSvc', 'AuthenticationSvc',
	function($rootScope,$scope,$location,$firebaseAuth, MembersSvc, GroupsSvc, AuthenticationSvc){

		/* Executed everytime we enter to /mycontacts
		  This function is used to confirm the user has an associated Member */
		$firebaseAuth().$onAuthStateChanged( function(authUser){if(authUser){
				$scope.response = {loading: true, message: systemMsgs.inProgress.loading };
				AuthenticationSvc.loadSessionData(authUser.uid).$loaded().then(function (user){
					if(!user.memberId){
						$rootScope.response = {error: true, message: systemMsgs.error.noMemberAssociated};
						$location.path(constants.pages.error);
						return;
					}

					/* Get the Member Rules*/
					$scope.membersList = [];
					$rootScope.currentSession.accessRules = MembersSvc.getMemberAccessRules(user.memberId);
					$rootScope.currentSession.accessRules.$loaded().then(function(rules){
						//Get members from each group
						rules.forEach(function(rule){
							let groupMembers = MembersSvc.getMembersForBaseGroup(rule.groupId);
							groupMembers.$loaded().then(function(members){
								members.forEach(function(member){$scope.membersList.push(member)});
							});
						});
						$scope.response = null;
					});

				});
		}});

		/* Sorting */
		$scope.selectedSortBy="firstname";
		$scope.reverseSort=false;
		$scope.sortOptions=[{text:$scope.i18n.members.fnameLbl, value:"firstname",active:"active"},
												{text:$scope.i18n.members.lnameLbl, value:"lastname",active:""},
												{text:$scope.i18n.members.aliasLbl, value:"shortname",active:""}];

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

}]);

//Mapping: /users
okulusApp.controller('UsersListCntrl',
	['$rootScope','$scope','$firebaseAuth','$location','CountersSvc','UsersSvc','AuthenticationSvc',
	function($rootScope,$scope,$firebaseAuth,$location, CountersSvc, UsersSvc, AuthenticationSvc){

		let unwatch = undefined;
		/*Executed everytime we enter to /users*/
		$scope.response = {loading: true, message: systemMsgs.inProgress.loading };
		$firebaseAuth().$onAuthStateChanged(function(authUser){ if(authUser){
			AuthenticationSvc.loadSessionData(authUser.uid).$loaded().then(function(user){
				if(user.type == constants.roles.user){
					$rootScope.response = {error:true, showHomeButton: true, message:systemMsgs.error.noPrivileges};
					$location.path(constants.pages.error);
				}else{
					$scope.usersCounters = CountersSvc.getUsersGlobalCounters();
					$scope.usersCounters.$loaded().then(function(counters){
						$scope.response = undefined;
						/* Adding a Watch to detect changes. It'll help to update the maxPossible value in params */
						if(unwatch){ unwatch(); }
						unwatch = $scope.usersCounters.$watch(function(data){
							if($rootScope.adminUsersParams){
								let loader = $rootScope.adminUsersParams.activeUsersLoader;
								$rootScope.adminUsersParams = getParamsByLoader(loader);
								$scope.response = undefined;
							}
						});
					});
				}
			});
		}});

		/* Sorting */
		$scope.selectedSortBy="shortname";
		$scope.reverseSort=false;
		$scope.sortOptions=[{text:$scope.i18n.members.aliasLbl, value:"shortname",active:"active"},
												{text:$scope.i18n.contact.emailLbl, value:"email",active:""}];

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
		 They will create a adminUsersParams object containing the name of the loader
		 used, and determining the max possible records to display. */
		$scope.loadAllUsersList = function () {
 			$scope.response = { loading:true, message: systemMsgs.inProgress.loadingRecords };
			$rootScope.adminUsersList = UsersSvc.getAllUsers($rootScope.config.maxQueryListResults);
 			$rootScope.adminUsersParams = getParamsByLoader("AllUsersLoader");
 			whenRecordsRetrieved();
		};

		$scope.loadActiveUsersList = function () {
 			$scope.response = {loading:true, message:systemMsgs.inProgress.loadingRecords};
			$rootScope.adminUsersList = UsersSvc.getActiveUsers($rootScope.config.maxQueryListResults);
 			$rootScope.adminUsersParams = getParamsByLoader("ActiveUsersLoader");
 			whenRecordsRetrieved();
		};

		$scope.loadInactiveUsersList = function () {
 			$scope.response = {loading:true, message:systemMsgs.inProgress.loadingRecords};
			$rootScope.adminUsersList = UsersSvc.getInactiveUsers($rootScope.config.maxQueryListResults);
 			$rootScope.adminUsersParams = getParamsByLoader("InactiveUsersLoader");
 			whenRecordsRetrieved();
		};

		$scope.loadRootUsersList = function () {
 			$scope.response = {loading:true, message:systemMsgs.inProgress.loadingRecords};
			$rootScope.adminUsersList = UsersSvc.getRootUsers($rootScope.config.maxQueryListResults);
 			$rootScope.adminUsersParams = getParamsByLoader("RootUsersLoader");
 			whenRecordsRetrieved();
		};

		$scope.loadNormalUsersList = function () {
 			$scope.response = {loading:true, message:systemMsgs.inProgress.loadingRecords};
			$rootScope.adminUsersList = UsersSvc.getNormalUsers($rootScope.config.maxQueryListResults);
 			$rootScope.adminUsersParams = getParamsByLoader("NormalUsersLoader");
 			whenRecordsRetrieved();
		};

		$scope.loadAdminUsersList = function () {
 			$scope.response = {loading:true, message:systemMsgs.inProgress.loadingRecords};
			$rootScope.adminUsersList = UsersSvc.getAdminUsers($rootScope.config.maxQueryListResults);
 			$rootScope.adminUsersParams = getParamsByLoader("AdminUsersLoader");
 			whenRecordsRetrieved();
		};

		/* Load ALL pending members. Use the adminUsersParams.activeUsersLoader
		to determine what type of members should be loaded, and how. */
		$scope.loadPendingUsers = function () {
			$scope.response = {loading: true, message: systemMsgs.inProgress.loadingRecords };
			let loaderName = $rootScope.adminUsersParams.activeUsersLoader;
			if(loaderName=="AllUsersLoader"){
				$rootScope.adminUsersList = UsersSvc.getAllUsers();
			} else if(loaderName=="ActiveUsersLoader"){
				$rootScope.adminUsersList = UsersSvc.getActiveUsers();
			} else if(loaderName=="InactiveUsersLoader"){
				$rootScope.adminUsersList = UsersSvc.getInactiveUsers();
			} else if(loaderName=="NormalUsersLoader"){
				$rootScope.adminUsersList = UsersSvc.getNormalUsers();
			} else if(loaderName=="AdminUsersLoader"){
				$rootScope.adminUsersList = UsersSvc.getAdminUsers();
			} else if(loaderName=="RootUsersLoader"){
				$rootScope.adminUsersList = UsersSvc.getRootUsers();
			}
			whenRecordsRetrieved();
		};

		/*Build object with Params used in the view.
		 activeUsersLoader: Will help to identify what type of members we want to load.
		 searchFilter: Container for the view filter
		 title: Title of the Users List will change according to the loader in use
		 maxPossible: Used to inform the user how many elements are pending to load */
		getParamsByLoader = function (loaderName) {
			let params = {activeUsersLoader:loaderName, searchFilter:undefined};
			if(loaderName == "AllUsersLoader"){
				params.title= systemMsgs.success.allUsersTitle;
				params.maxPossible = $scope.usersCounters.total;
			}
			else if(loaderName == "ActiveUsersLoader"){
				params.title= systemMsgs.success.activeUsersTitle;
				params.maxPossible = $scope.usersCounters.active;
			}
			else if(loaderName == "InactiveUsersLoader"){
				params.title= systemMsgs.success.inactiveUsersTitle;
				params.maxPossible = $scope.usersCounters.total - $scope.usersCounters.active;
			}
			else if(loaderName == "NormalUsersLoader"){
				params.title= systemMsgs.success.normalUsersTitle;
				params.maxPossible = $scope.usersCounters.user;
			}
			else if(loaderName == "AdminUsersLoader"){
				params.title= systemMsgs.success.adminUsersTitle;
				params.maxPossible = $scope.usersCounters.admin;
			}
			else if(loaderName == "RootUsersLoader"){
				params.title= systemMsgs.success.rootUsersTitle;
				params.maxPossible = $scope.usersCounters.root;
			}
			return params;
		};

		/*Prepares the response after the members list is loaded */
		whenRecordsRetrieved = function () {
			$rootScope.adminUsersList.$loaded().then(function(users) {
				$scope.response = undefined;
				$rootScope.userResponse = null;
				if(!users.length){
					$scope.response = { error: true, message: systemMsgs.error.noRecords };
				}
			}).catch( function(error){
				$scope.response = { error: true, message: systemMsgs.error.loadingRecords };
				console.error(error);
			});
		};

}]);

//To redirect from Audit Table
okulusApp.controller('UserEditCntrl',
	['$scope','$rootScope','$routeParams','$location','$firebaseAuth',
		'AuthenticationSvc', 'UsersSvc','AuditSvc','CountersSvc',
	function($scope, $rootScope, $routeParams, $location, $firebaseAuth,
					AuthenticationSvc, UsersSvc, AuditSvc, CountersSvc){

		$firebaseAuth().$onAuthStateChanged( function(authUser){ if(authUser){
			$scope.response = {loading: true, message: systemMsgs.inProgress.loading };
			$scope.objectDetails = {};
			AuthenticationSvc.loadSessionData(authUser.uid).$loaded().then(function (user) {
				if($rootScope.currentSession.user.type != constants.roles.root && !user.memberId){
					$rootScope.response = { error:true, message: systemMsgs.error.noMemberAssociated};
					$location.path(constants.pages.error);
					return;
				}

				if(!$routeParams.userId){return;}
				$scope.objectDetails.basicInfo = UsersSvc.getUserBasicDataObject($routeParams.userId);
				$scope.objectDetails.basicInfo.$loaded().then(function(user){
					if(user.$value === null){
						$rootScope.response = { error:true, message:systemMsgs.error.inexistingUser};
						$location.path(constants.pages.error);
						return;
					}

					$scope.objectDetails.audit = UsersSvc.getUserAuditObject(user.$id);
					if(!user.memberId && !user.shortname){
						//it might be root, or a brand new user that didnt find a member
						$scope.objectDetails.basicInfo.shortname = (user.type == constants.roles.root)?constants.roles.rootName:constants.roles.userDefaultName;
					}
					$scope.response = null;
				});

			});
		}});

		$scope.basicInfoExpanded = true;
		$scope.auditInfoExpanded = false;
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

		$scope.setUserStatusActive = function(isActive) {
			$scope.response = { working: true, message: systemMsgs.inProgress.working };
			let description = undefined;
			if(isActive){
				description = systemMsgs.notifications.userSetActive + $scope.objectDetails.basicInfo.shortname;
				CountersSvc.increaseActiveUsers();
			}else{
				description = systemMsgs.notifications.userSetInactive + $scope.objectDetails.basicInfo.shortname;
				CountersSvc.decreaseActiveUsers();
				$scope.objectDetails.basicInfo.memberId = null;
			}

			$scope.objectDetails.basicInfo.isActive = isActive;
			$scope.objectDetails.basicInfo.$save().then(function(user) {
				AuditSvc.saveAuditAndNotify(constants.actions.update, constants.db.folders.users, user.key, description);
				$scope.response = undefined;
			});
		};

		$scope.setAdminRole = function(setAsAdmin) {
			$scope.response = { working: true, message: systemMsgs.inProgress.working };
			let description = undefined;
			if(setAsAdmin){
				$scope.objectDetails.basicInfo.type = constants.roles.admin;
				description = systemMsgs.notifications.userSetAdminRole + $scope.objectDetails.basicInfo.shortname;
				CountersSvc.increaseAdminUsers();
				CountersSvc.decreaseNormalUsers();
			}else{
				$scope.objectDetails.basicInfo.type = constants.roles.user;
				description = systemMsgs.notifications.userRemoveAdminRole + $scope.objectDetails.basicInfo.shortname;
				CountersSvc.decreaseAdminUsers();
				CountersSvc.increaseNormalUsers();
			}

			$scope.objectDetails.basicInfo.$save().then(function(user) {
				AuditSvc.saveAuditAndNotify(constants.actions.update, constants.db.folders.users, user.key, description);
				$scope.response = undefined;
			});
		};

}]);

okulusApp.factory('UsersSvc',
	['$rootScope', '$firebaseArray', '$firebaseObject','CountersSvc',
	function($rootScope, $firebaseArray, $firebaseObject, CountersSvc){
		let baseRef = firebase.database().ref().child(constants.db.folders.root);
		let usersRef = baseRef.child(constants.db.folders.usersList);

		let allUsersRef = usersRef.orderByKey();
		let activeUsersRef = usersRef.orderByChild(constants.db.fields.isActive).equalTo(true);
		let inactiveUsersRef = usersRef.orderByChild(constants.db.fields.isActive).equalTo(false);
		let normalUsersRef = usersRef.orderByChild(constants.db.fields.type).equalTo(constants.roles.user);
		let adminUsersRef = usersRef.orderByChild(constants.db.fields.type).equalTo(constants.roles.admin);
		let rootUsersRef = usersRef.orderByChild(constants.db.fields.type).equalTo(constants.roles.root);
		let usersDetailsRef = baseRef.child(constants.db.folders.usersDetails);

		let getUsers = function(reference, limit){
			if(limit){
				return $firebaseArray(reference.limitToLast(limit));
			}else{
				return $firebaseArray(reference);
			}
		};

		return {
			/* Return users order by the most recently created first */
			getAllUsers: function(limit){
				return getUsers(allUsersRef,limit);
			},
			getActiveUsers: function(limit){
				return getUsers(activeUsersRef,limit);
			},
			getInactiveUsers: function(limit){
				return getUsers(inactiveUsersRef,limit);
			},
			getNormalUsers: function(limit){
				return getUsers(normalUsersRef,limit);
			},
			getAdminUsers: function(limit){
				return getUsers(adminUsersRef,limit);
			},
			getRootUsers: function(limit){
				return getUsers(rootUsersRef,limit);
			},
			/* Get basic info from firebase and return as object */
			getUserBasicDataObject: function(whichUserId){
				return $firebaseObject(usersRef.child(whichUserId));
			},
			/* Get audit from firebase and return as object */
			getUserAuditObject: function(whichUserId){
				return $firebaseObject(usersDetailsRef.child(whichUserId).child(constants.db.folders.audit));
			},
			/* Set the member Id and Member name in the User, to link them */
			updateMemberReferenceInUserObject: function(memberId, memberShortname, userObj){
				userObj.memberId = memberId;
				userObj.shortname = memberShortname;
				/* When a loggedUser loses the reference to a member ID, the user type has
					to be forced to "user"*/
				if(!memberId && userObj.type==constants.roles.admin){
					//Force User role, in case it was admin
					userObj.type = constants.roles.user;
					CountersSvc.decreaseAdminUsers();
					CountersSvc.increaseNormalUsers();
				}
				userObj.$save();
			},
			createUser: function(userId, userEmail, userType){
				let timestamp = firebase.database.ServerValue.TIMESTAMP;
				let record = {
					email: userEmail, type: userType, isActive:true,
					lastLoginOn: timestamp, lastActivityOn: timestamp,
					sessionStatus: constants.status.online,
					counters:{
						notifications:{total:0},
						reports:{approved:0, pending:0, rejected:0, total:0},
						requests:{members:{approved:0, pending:0, rejected:0, total:0}}
					}
				};
				if(userType == constants.roles.root){
					record.shortname = constants.roles.rootName;
				}
				usersRef.child(userId).set(record);
				CountersSvc.increaseTotalUsers(userType);
			}
		};
	}
]);
