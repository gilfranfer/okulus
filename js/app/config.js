/** Application entry point. In this is the configuration file we:
1. Create constants used in the app
2. Create the Angular module
3. Prepare the URL routing in the config function
4. Load App Editable Configurations from firebase
**/

//1. Constants
const constants = {
	db: {
		folders:{
			root:"okulus/data", allowedEmails:"okulus/allowedEmails",
			currentConfig:"okulus/config/app", systemConfigs:"okulus/config/fixed",
			grouptypes:"grouptypes", errors:"errors",
			config:"config", counters:"counters", details:"details",
			audit:"audit", users:"users", weeks:"weeks", roles:"roles",
			groups:"groups", members:"members", reports:"reports",
			chats:"chats", chatList:"chatRooms",chatMessages:"messages",
			metadata:"metadata", address:"address", accessRules:"access",
			attendance:"attendance", study:"study",feedback:"feedback",
			unreadChats:"unreadChats",unreadCount:"unreadCount",
			usersList:"users/list", usersDetails:"users/details",
			weeksList:"weeks/list", weeksDetails:"weeks/details",
			groupsList:"groups/list", groupsDetails:"groups/details",
			membersList:"members/list", membersDetails:"members/details",
			reportsList:"reports/list", reportsDetails:"reports/details",
			messagesList:"messages/list",
			memberRequest:"requests/members",
			memberRequestList:"requests/members/list",
			memberRequestDetails:"requests/members/details",
			membersAttendance:"attendance/members",	guestsAttendance:"attendance/guests",
			notificationsList:"notifications/list",
			/**Counters*/
			errorsCount:"counters/errors",
			weeksCounters:"counters/weeks",
			totalWeeksCount:"counters/weeks/total",
			openWeeksCount:"counters/weeks/open",
			visibleWeeksCount:"counters/weeks/visible",
			/* Members Counters */
			membersCounters:"counters/members",
			totalMembersCount:"counters/members/total",
			activeMembersCount:"counters/members/active",
			hostMembersCount:"counters/members/hosts",
			leadMembersCount:"counters/members/leads",
			traineeMembersCount:"counters/members/trainees",
			/* Groups Counters */
			groupsCounters:"counters/groups",
			totalGroupsCount:"counters/groups/total",
			activeGroupsCount:"counters/groups/active",
			/* Notifications Counters*/
			unredNotifCount:"counters/notifications/unreaded",
			totalNotifCount:"counters/notifications/total",
			/* Reports Counters */
			reportsCounters:"counters/reports",
			totalReportsCount:"counters/reports/total",
			pendingReportsCount:"counters/reports/pending",
			approvedReportsCount:"counters/reports/approved",
			rejectedReportsCount:"counters/reports/rejected",
			/* Member Requests */
			requestsCount:"counters/requests",
			pendingMemberRequestsCount:"counters/requests/members/pending",
			approvedMemberRequestsCount:"counters/requests/members/approved",
			rejectedMemberRequestsCount:"counters/requests/members/rejected",
			totalMemberRequestsCount:"counters/requests/members/total",
			/* Users Counter */
			userCounters:"counters/users"

		},
		fields:{
			baseGroup:"baseGroupId",
			email:"email",
			reviewStatus:"reviewStatus",
			weekId:"weekId", status:"status",
			auditCreatedById:"audit/createdById",
			createdById:"createdById",
			createdOn:"createdOn",
			systemErrors:"systemErrors",
			isActive:"isActive",
			type:"type", total:"total", active:"active",
			admin:"admin", user:"user", sex: "sex",
			weekReportsCount: "reports"
		}
	},
	roles: {
		user:"user", admin: "admin", system:"system", root:"root", type:"type",
		isLead:"isLeader", isTrainee:"isTrainee", isHost:"isHost", isUser:"isUser",
		userDefaultName:"Usuario sin miembro asociado",
		rootName:"Super Usuario", systemName:"Okulus System"
	},
	status: {
		online:"online", offline:"offline",
		active:"active", inactive:"inactive",
		approved:"approved", rejected:"rejected",
		open:"open", closed:"closed", pending: "pending",
		completed:"completed", canceled:"canceled",
		visible:"show", hidden:"hide",
		readed:"readed",
		isActive:"isActive",
		isOpen:"isOpen", isVisible:"isVisible"
	},
	pages: {
		login:"/login", home:"/home",
		error: "/error",
		adminWeeks:"/weeks",
		adminMembers:"/members",
		adminGroups:"/groups",
		adminMonitor:"/admin/monitor",
		memberEdit:"/members/edit/",
		groupEdit:"/groups/edit/",
		reportEdit:"/reports/edit/",
		reportNew:"/reports/new/",
		weekEdit:"/weeks/edit/",
		myRequests:"/myrequests",
		editMemberRequest:"requests/members/edit/",
		welcome:"/welcome"
	},
	actions:{
		create:"create",update:"update",delete:"delete",
		approve:"approved",reject:"rejected",cancel:"canceled",
		open:"open",close:"closed",show:"show",hide:"hide",
		grantAccess:"access-granted", revokeAccess:"access-deleted",
		updateRole:"type-update"
	}
};

//2. Angular Moduel
var okulusApp = angular.module('okulusApp',['ngRoute','firebase']);

//3. URL Routing
okulusApp.config(['$routeProvider',
	function($routeProvider){
		$routeProvider
			.when('/login',{
				controller: 'LoginCntrl',
				templateUrl: 'views/auth/login.html'
			})
			.when('/register',{
				controller: 'RegistrationCntrl',
				templateUrl: 'views/auth/register.html'
			})
			.when('/pwdreset',{
				controller: 'PwdResetCntrl',
				templateUrl: 'views/auth/pwdReset.html'
			})
			.when('/welcome',{
				currentAuth: function(AuthenticationSvc){
					return AuthenticationSvc.isUserLoggedIn();
				},
				templateUrl: 'views/welcome.html'
			})
			.when('/home', {
				controller: 'HomeCntrl',
				templateUrl: 'views/home.html'
			})
			.when('/chats', {
				resolve: {
					currentAuth: function(AuthenticationSvc){
						return AuthenticationSvc.isUserLoggedIn();
					}
				},
				templateUrl: 'views/chat/chatCenter.html',
				controller: "ChatCenterCntrl"
			})
			.when('/notifications', {
				resolve: {
					currentAuth: function(AuthenticationSvc){
						return AuthenticationSvc.isUserLoggedIn();
					}
				},
				templateUrl: 'views/notifications/notificationCenter.html',
				controller: "NotificationCenterCntrl"
			})
			.when('/error', {
				templateUrl: 'views/errors/error-general.html'
			})
			.when('/mystatistics', {
				resolve: {
					currentAuth: function(AuthenticationSvc){
						return AuthenticationSvc.isUserLoggedIn();
					}
				},
				templateUrl: 'views/user/statistics.html',
				controller: 'UserStatisticsCntrl'
			})
			.when('/mygroups', {
				resolve: {
					currentAuth: function(AuthenticationSvc){
						return AuthenticationSvc.isUserLoggedIn();
					}
				},
				templateUrl: 'views/user/myGroups.html',
				controller: 'GroupsUserCntrl'
			})
			.when('/mycontacts', {
				resolve: {
					currentAuth: function(AuthenticationSvc){
						return AuthenticationSvc.isUserLoggedIn();
					}
				},
				templateUrl: 'views/user/myContacts.html',
				controller: 'UserMyContactsCntrl'
			})
			.when('/myreports', {
				resolve: {
					currentAuth: function(AuthenticationSvc){
						return AuthenticationSvc.isUserLoggedIn();
					}
				},
				templateUrl: 'views/user/myReports.html',
				controller: 'MyReportsCntrl'
			})
			.when('/myrequests', {
				resolve: {
					currentAuth: function(AuthenticationSvc){
						return AuthenticationSvc.isUserLoggedIn();
					}
				},
				templateUrl: 'views/user/myRequests.html',
				controller: "RequestsListCntrl"
			})
			.when('/admin/setRoot',{
				controller: 'RegisterRootCntrl',
				templateUrl: 'views/auth/registerRoot.html'
			})
			.when('/admin/errors', {
				resolve: {
					currentAuth: function(AuthenticationSvc){
						return AuthenticationSvc.isUserLoggedIn();
					}
				},
				templateUrl: 'views/admin/errorsMonitor.html',
				controller: 'ErrorsMonitorCntrl'
			})
			.when('/admin/summary', {
				resolve: {
					currentAuth: function(AuthenticationSvc){
						return AuthenticationSvc.isUserLoggedIn();
					}
				},
				controller: 'AdminSummaryCntrl',
				templateUrl: 'views/admin/summary.html'
			})
			.when('/admin/statistics', {
				resolve: {
					currentAuth: function(AuthenticationSvc){
						return AuthenticationSvc.isUserLoggedIn();
					}
				},
				controller: 'AdminStatisticsCntrl',
				templateUrl: 'views/admin/statistics.html'
			})
			.when('/admin/config', {
				resolve: {
					currentAuth: function(AuthenticationSvc){
						return AuthenticationSvc.isUserLoggedIn();
					}
				},
				controller: 'AppConfigsCntrl',
				templateUrl: 'views/admin/configs.html'
			})
			.when('/users', {
				resolve: {
					currentAuth: function(AuthenticationSvc){
						return AuthenticationSvc.isUserLoggedIn();
					}
				},
				templateUrl: 'views/user/usersAdmin.html',
				controller: 'UsersListCntrl'
			})
			.when('/users/edit/:userId', {
				resolve: {
					currentAuth: function(AuthenticationSvc){
						return AuthenticationSvc.isUserLoggedIn();
					}
				},
				templateUrl: 'views/user/userDetails.html',
				controller: 'UserEditCntrl'
			})
			.when('/users/view/:userId', {
				resolve: {
					currentAuth: function(AuthenticationSvc){
						return AuthenticationSvc.isUserLoggedIn();
					}
				},
				templateUrl: 'views/user/userDetails.html',
				controller: 'UserEditCntrl'
			})
			.when('/groups', {
				resolve: {
					currentAuth: function(AuthenticationSvc){
						return AuthenticationSvc.isUserLoggedIn();
					}
				},
				templateUrl: 'views/groups/groupsAdmin.html',
				controller: 'GroupsListCntrl'
			})
			.when('/groups/new', {
				resolve: {
					currentAuth: function(AuthenticationSvc){
						return AuthenticationSvc.isUserLoggedIn();
					}
				},
				templateUrl: 'views/groups/groupEdit.html',
				controller: 'GroupDetailsCntrl'
			})
			.when('/groups/edit/:groupId', {
				resolve: {
					currentAuth: function(AuthenticationSvc){
						return AuthenticationSvc.isUserLoggedIn();
					}
				},
				templateUrl: 'views/groups/groupEdit.html',
				controller: 'GroupDetailsCntrl'
			})
			.when('/groups/view/:groupId', {
				resolve: {
					currentAuth: function(AuthenticationSvc){
						return AuthenticationSvc.isUserLoggedIn();
					}
				},
				templateUrl: 'views/groups/groupView.html',
				controller: 'GroupDetailsCntrl'
			})
			.when('/members', {
				resolve: {
					currentAuth: function(AuthenticationSvc){
						return AuthenticationSvc.isUserLoggedIn();
					}
				},
				templateUrl: 'views/members/membersAdmin.html',
				controller: 'MembersListCntrl'
			})
			.when('/members/new', {
				resolve: {
					currentAuth: function(AuthenticationSvc){
						return AuthenticationSvc.isUserLoggedIn();
					}
				},
				templateUrl: 'views/members/memberEdit.html',
				controller: 'MemberDetailsCntrl'
			})
			.when('/members/edit/:memberId', {
				resolve: {
					currentAuth: function(AuthenticationSvc){
						return AuthenticationSvc.isUserLoggedIn();
					}
				},
				templateUrl: 'views/members/memberEdit.html',
				controller: 'MemberDetailsCntrl'
			})
			.when('/members/view/:memberId', {
				resolve: {
					currentAuth: function(AuthenticationSvc){
						return AuthenticationSvc.isUserLoggedIn();
					}
				},
				templateUrl: 'views/members/memberView.html',
				controller: 'MemberDetailsCntrl'
			})
			.when('/reports', {
				resolve: {
					currentAuth: function(AuthenticationSvc){
						return AuthenticationSvc.isUserLoggedIn();
					}
				},
				templateUrl: 'views/reports/reportsAdmin.html',
				controller: 'ReportsListCntrl'
			})
			.when('/reports/new/:groupId', {
				resolve: {
					currentAuth: function(AuthenticationSvc){
						return AuthenticationSvc.isUserLoggedIn();
					}
				},
				controller: 'ReportDetailsCntrl',
				templateUrl: 'views/reports/reportEdit.html'
			})
			.when('/reports/edit/:reportId', {
				resolve: {
					currentAuth: function(AuthenticationSvc){
						return AuthenticationSvc.isUserLoggedIn();
					}
				},
				controller: 'ReportDetailsCntrl',
				templateUrl: 'views/reports/reportEdit.html'
			})
			.when('/reports/view/:reportId', {
				resolve: {
					currentAuth: function(AuthenticationSvc){
						return AuthenticationSvc.isUserLoggedIn();
					}
				},
				templateUrl: 'views/reports/reportView.html',
				controller: 'ReportDetailsCntrl'
			})
			.when('/weeks', {
				resolve: {
					currentAuth: function(AuthenticationSvc){
						return AuthenticationSvc.isUserLoggedIn();
					}
				},
				templateUrl: 'views/weeks/weekAdmin.html',
				controller: "WeeksCntrl"
			})
			.when('/weeks/new', {
				templateUrl: 'views/weeks/weekEdit.html',
				controller: 'WeekDetailsCntrl'
			})
			.when('/weeks/edit/:weekId', {
				templateUrl: 'views/weeks/weekEdit.html',
				controller: 'WeekDetailsCntrl'
			})
			.when('/weeks/view/:weekId', {
				templateUrl: 'views/weeks/weekView.html',
				controller: 'WeekDetailsCntrl'
			})
			.when('/requests/members', {
				resolve: {
					currentAuth: function(AuthenticationSvc){
						return AuthenticationSvc.isUserLoggedIn();
					}
				},
				templateUrl: 'views/requests/requestsAdmin.html',
				controller: "RequestsListCntrl"
			})
			.when('/requests/members/new', {
				resolve: {
					currentAuth: function(AuthenticationSvc){
						return AuthenticationSvc.isUserLoggedIn();
					}
				},
				templateUrl: 'views/requests/memberRequest.html',
				controller: 'RequestDetailsCntrl'
			})
			.when('/requests/members/edit/:requestId', {
				resolve: {
					currentAuth: function(AuthenticationSvc){
						return AuthenticationSvc.isUserLoggedIn();
					}
				},
				templateUrl: 'views/requests/memberRequest.html',
				controller: 'RequestDetailsCntrl'
			})
			.when('/requests/members/view/:requestId', {
				resolve: {
					currentAuth: function(AuthenticationSvc){
						return AuthenticationSvc.isUserLoggedIn();
					}
				},
				templateUrl: 'views/requests/memberRequest.html',
				controller: 'RequestDetailsCntrl'
			})
			.when('/migration', {
				resolve: {
					currentAuth: function(AuthenticationSvc){
						return AuthenticationSvc.isUserLoggedIn();
					}
				},
				templateUrl: 'views/admin/migration.html',
				controller: 'MigrationCntrl'
			})
			.otherwise({
				redirectTo: '/home'
			});
	}
]);

//4. Editable Configurations
const defaultConfigs = {
	appName:"Okulus App", isProd:true, rootId:undefined,
	location:{city:"Xalapa", state:"Veracruz", country:"Mexico"},
	/*The Max lenght a firebaseArray should have in the initial request*/
	maxQueryListResults: 50,
	/*After this number of records, the Filter box will be visible*/
	minResultsToshowFilter: 3,
	/*Date range limits*/
	members:{ minBirthdate:"1900-01-01" },
	reports:{
		minDate:"2018-01-01",
		goodAttendanceNumber:5,
		excelentAttendanceNumber:10,
		minDuration:30, //minutes
		maxDuration:300,//minutes
		showMoneyField: true,
		maxMultipleGuests: 10,
		notOnTimeMessage: null
	},
	formats: {
		date:"MMM dd yyyy",
		datetime:"MMM dd yyyy hh:mm a",
		time:"H:mm"},
	grouptypes:{
		default:{name:"Default"}
	},
	charts: {
    colors: {
      members: {
        active: "#3ec266",
        female: "#c23e6c",
        guest: "#3e9ac2",
        host: "#f09669",
        inactive: "#c26a3e",
        lead: "#69bff0",
        male: "#4c614f",
        member: "#6cc23e",
        trainee: "#f0da69"
      },
      reports: {
        aproved: "#3e9ac2",
        due: "#b83e35",
        ontime: "#35b858",
        pending: "#c26a3e",
        rejected: "#c23e6c"
      },
      reunions: {
        cnceled: "#c73b3b",
        completed: "#6cc23e",
        duration: "#3e9ac2",
        durationAvgA: "#6cc23e",
        durationAvgR: "#c23e6c",
        money: "#3e9ac2",
        moneyAvgA: "#6cc23e",
        moneyAvgR: "#c23e6c"
      }
    }
  }
};

okulusApp.run(function($rootScope) {
	$rootScope.config = defaultConfigs;
	/* Load  App Editable Configurations from Firebase */
	firebase.database().ref().child(constants.db.folders.currentConfig).once('value').then(
		function(snapshot){
			if(snapshot.val()){
				console.debug("Got configurations from Firebase");
				$rootScope.$apply(function(){
					$rootScope.config = snapshot.val();
				});
			}else{
				console.error("Configurations not available in Firebase");
			}
			//Add todays date that will be used to limit some date selectors
			var tomorrow = new Date();
			tomorrow.setDate(tomorrow.getDate() + 1);
			$rootScope.config.tomorrowDate = tomorrow.toISOString().slice(0,10);
	});
});

/* Controller linked to the Editable Configurations View */
okulusApp.controller('AppConfigsCntrl',
	['$rootScope', '$scope', '$firebaseAuth', '$location', 'ConfigSvc','AuthenticationSvc',
	function($rootScope, $scope, $firebaseAuth, $location, ConfigSvc, AuthenticationSvc){
		/* Executed everytime we enter to /config
		  This function is used to confirm the user is Admin and prepare some initial values */
		$scope.response = {loading: true, message: systemMsgs.inProgress.loading };
		$scope.groupTypeRegex = "[a-zA-Z0-9\\s]+";

		$firebaseAuth().$onAuthStateChanged(function(authUser){ if(authUser){
			AuthenticationSvc.loadSessionData(authUser.uid).$loaded().then(function(user){
				if(user.type == constants.roles.user){
					$rootScope.response = {error:true, showHomeButton: true, message:systemMsgs.error.noPrivileges};
					$location.path(constants.pages.error);
					return;
				}

				$scope.countriesList = ConfigSvc.getCountriesList();
				//Get the editable configurations (current app configs)
				$scope.currentAppConfigs = ConfigSvc.getCurrentConfigurationsObj();
				$scope.currentAppConfigs.$loaded().then(function(configDb){
					/* This is the format of the date in the DB: YYYY-MM-DD
					JS Date works with months starting from 0 (0-11), so we need to
					decrease the month from DB by one, to display it properly */
					$scope.temporal = {};
					//Report's Min Date
					let dateSplit = configDb.reports.minDate.split("-");
					let month = (Number(dateSplit[1])-1);
					$scope.temporal.minDateTemp = new Date(dateSplit[0],month,dateSplit[2]);
					//Member's Min Birthdate
					dateSplit = configDb.members.minBirthdate.split("-");
					month = (Number(dateSplit[1])-1);
					$scope.temporal.minBDateTemp = new Date(dateSplit[0],month,dateSplit[2]);

					//Load States according to the Country in DB
					$scope.statesList = ConfigSvc.getStatesForCountry(configDb.location.country);

					$scope.response = null;
				});

				//Load the Group types as firebaseArray for an easy manipulation
				$scope.grouptypesList = ConfigSvc.getGroupTypesArray();

				//System Configurations are values set by the Okules and cannot be modified by the user
				$scope.systemConfigs = ConfigSvc.getSystemConfigurations();
				$scope.systemConfigs.$loaded().then(function(options){
					loadOptionsToArrays(options);
				});
				
			});
		}});

		loadOptionsToArrays = function(options){
			$scope.datetimeFormatList = new Array();
			$scope.dateFormatList = new Array();
			$scope.timeFormatList = new Array();
			for( let prop in options.dateTimeFormats ){
				$scope.datetimeFormatList.push( options.dateTimeFormats[prop] );
			}
			for( let prop in options.dateFormats ){
				$scope.dateFormatList.push( options.dateFormats[prop] );
			}
			for( let prop in options.timeFormats ){
				$scope.timeFormatList.push( options.timeFormats[prop] );
			}
		};

		//Save the orginal name, in case the user cancels edition
		$scope.prepareForEditGroupType = function(type) {
			type.originalName = type.name;
			type.onEdit = true;
		};
		
		$scope.cancelEditGroupType = function(type) {
			type.name = type.originalName;
			type.onEdit = null;
			type.originalName = null;
		};
		
		$scope.updateGroupType = function(type) {
			type.onEdit = null;
			type.originalName = null;
			
			let index = $scope.grouptypesList.$indexFor(type.$id);
			$scope.grouptypesList.$save(index).then(function (ref) {
			});

		};

		$scope.addGrouptype = function() {
			let newType = $scope.newGrouptype;
			let typeExists = false;

			$scope.grouptypesList.some(function(type) {
				if (type.name == newType.name) {
					typeExists = true;
				}
				return typeExists;
			});

			if(typeExists){
				$scope.response = {grouptypesListError: systemMsgs.error.groupTypeExist };
				return;
			}

			$scope.grouptypesList.$add({name:newType.name}).then(function(ref) {
				$scope.response = {grouptypesListOk: systemMsgs.success.groupTypeAdded };
			}).catch(function(error) {
				console.error(error);
				$scope.response = {grouptypesListError: systemMsgs.error.groupTypeNotAdded };
			});
			$scope.newGrouptype.name = "";
		};

		$scope.removeGrouptype = function(type) {
			$scope.grouptypesList.$remove(type).then(function(ref) {
				$scope.response = {grouptypesListOk: systemMsgs.success.groupTypeRemoved };
			}).catch(function(error) {
				console.error(error);
				$scope.response = {grouptypesListError: systemMsgs.error.groupTypeNotRemoved };
			});
		};

		$scope.saveConfigs = function(){
			$scope.response = {working: true, message: systemMsgs.inProgress.savingConfig };

			/* Use the Temp dates to build the actual date that will be persisted to the DB*/
			let minDate = $scope.temporal.minDateTemp;
			let year = minDate.getFullYear();
			let month = (minDate.getMonth()<9)?"0"+(minDate.getMonth()+1):minDate.getMonth()+1;
			let day = (minDate.getDate()<10)?"0"+(minDate.getDate()):minDate.getDate();
			$scope.currentAppConfigs.reports.minDate = year + "-" + month + "-" + day;

			minDate = $scope.temporal.minBDateTemp;
			year = minDate.getFullYear();
			month = (minDate.getMonth()<9)?"0"+(minDate.getMonth()+1):minDate.getMonth()+1;
			day = (minDate.getDate()<10)?"0"+(minDate.getDate()):minDate.getDate();
			$scope.currentAppConfigs.members.minBirthdate = year + "-" + month + "-" + day;

			$scope.currentAppConfigs.$save().then(function(){
				//Reload Configs into rootScope
				let confReference = firebase.database().ref().child(constants.db.folders.currentConfig);
				confReference.once('value').then( function(snapshot){
					$rootScope.config = (snapshot.val());
					//Add todays date that will be used to limit some date selectors
					var tomorrow = new Date();
					tomorrow.setDate(tomorrow.getDate() + 1);
					$rootScope.config.tomorrowDate = tomorrow.toISOString().slice(0,10);
				});
				$scope.response = {success:true, message:systemMsgs.success.configSaved};
			});
		};

		$scope.updateStatesList = function() {
			$scope.statesList = ConfigSvc.getStatesForCountry($scope.currentAppConfigs.location.country);
		};
}
]);

/* Service for the Editable Configurations*/
okulusApp.factory('ConfigSvc',
['$rootScope', '$firebaseArray', '$firebaseObject',
	function($rootScope, $firebaseArray, $firebaseObject){
		let appConfigRef = firebase.database().ref().child(constants.db.folders.currentConfig);
		let systemConfigRef = firebase.database().ref().child(constants.db.folders.systemConfigs);

		let appEditableConfigs = $rootScope.config;
		let systemFixedConfigs = {
			dateFormats: {
		    op1: "MMM d, y",
		    op2: "dd/MM/y",
		    op3: "MM/dd/y"
		  },
		  dateTimeFormats : {
		    op1: "MMM d, y h:mm a",
		    op2: "MMM d, y H:mm",
		    op3: "dd/MM/y h:mm a",
		    op4: "dd/MM/y H:mm",
		    op5: "MM/dd/y h:mm a",
		    op6: "MM/dd/y H:mm"
		  },
		  timeFormats : {
		  	op1: "h:mm a",
		  	op2: "h:mm:ss a",
		  	op3: "H:mm",
		  	op4: "H:mm:ss"
		  }
		};

		return {
			setInitialConfigs: function(rootId){
				appEditableConfigs.rootId = rootId;
				appEditableConfigs.tomorrowDate = null;
				appEditableConfigs.isProd = true;
				appConfigRef.set(appEditableConfigs);
				systemConfigRef.set(systemFixedConfigs);
			},
			getCurrentConfigurationsObj: function(){
				return $firebaseObject(appConfigRef);
			},
			getSystemConfigurations: function(){
				return $firebaseObject(systemConfigRef);
			},
			getGroupTypesArray: function(){
				return $firebaseArray(appConfigRef.child(constants.db.folders.grouptypes));
			},
			getCountriesList: function(){
				return countries_array;
			},
			getStatesForCountry: function(country){
				let selectedCountryIndex = countries_array.indexOf(country);
				let statesList = new Array();
				if(selectedCountryIndex>=0){
					statesList = states_array[selectedCountryIndex].split("|");
				}
				return statesList;
			}
		};
	}
]);
