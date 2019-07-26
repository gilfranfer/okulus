/** Application entry point. In this is the configuration file we:
1. Create the Angular module
2. Prepare the URL routing in the config function
3. Create constants used in the app
4. Load App Editable Configurations from firebase
**/

//1. Angular Moduel
var okulusApp = angular.module('okulusApp',['ngRoute','firebase']);

//2. URL Routing
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
				templateUrl: 'views/auth/pwdReset.html'
			})
			.when('/home', {
				resolve: {
					currentAuth: function(AuthenticationSvc){
						return AuthenticationSvc.isUserLoggedIn();
					}
				},
				controller: 'HomeCntrl',
				templateUrl: 'views/home.html'
			})
			.when('/mygroups', {
				resolve: {
					currentAuth: function(AuthenticationSvc){
						return AuthenticationSvc.isUserLoggedIn();
					}
				},
				templateUrl: 'views/groups/groups-user.html',
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
				controller: 'UserMyReportsCntrl'
			})
			.when('/admin/dashboard', {
				resolve: {
					currentAuth: function(AuthenticationSvc){
						return AuthenticationSvc.isUserLoggedIn();
					}
				},
				controller: 'AdminDashCntrl',
				templateUrl: 'views/admin/dashboard.html'
			})
			.when('/admin/monitor', {
				resolve: {
					currentAuth: function(AuthenticationSvc){
						return AuthenticationSvc.isUserLoggedIn();
					}
				},
				templateUrl: 'views/admin/monitor.html',
				controller: 'MonitorCntrl'
			})
			.when('/admin/config', {
				resolve: {
					currentAuth: function(AuthenticationSvc){
						return AuthenticationSvc.isUserLoggedIn();
					}
				},
				controller: 'ConfigCntrl',
				templateUrl: 'views/admin/configs.html'
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
			.when('/groups/access/:groupId', {
				resolve: {
					currentAuth: function(AuthenticationSvc){
						return AuthenticationSvc.isUserLoggedIn();
					}
				},
				templateUrl: 'views/groups/accessRules.html',
				controller: 'GroupAccessRulesCntrl'
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
			.when('/users/edit/:userId', {
				templateUrl: 'views/user/userDetails.html',
				controller: 'UserEditCntrl'
			})
			.when('/users/view/:userId', {
				templateUrl: 'views/user/userDetails.html',
				controller: 'UserEditCntrl'
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
			.otherwise({
				redirectTo: '/home'
			});
	}
]);

//3. Constants
const constants = {
	db: {
		folders:{
			root:"okulusTest",
			config:"config", counters:"counters", details:"details",
			audit:"audit", users:"users", weeks:"weeks", roles:"roles",
			groups:"groups", members:"members", reports:"reports",
			chats:"chats", chatList:"chatRooms",chatMessages:"messages",
			metadata:"metadata", address:"address", accessRules:"access",
			attendance:"attendance", study:"study",
			unreadChats:"unreadChats",unreadCount:"unreadCount",
			usersList:"users/list", usersDetails:"users/details",
			weeksList:"weeks/list", weeksDetails:"weeks/details",
			groupsList:"groups/list", groupsDetails:"groups/details",
			membersList:"members/list", membersDetails:"members/details",
			reportsList:"reports/list", reportsDetails:"reports/details",
			messagesList:"messages/list",
			membersAttendance:"attendance/members",	guestsAttendance:"attendance/guests",
			notificationsList:"notifications/list",
			/**Counters*/
			weeksCounters:"counters/weeks",
			totalWeeksCount:"counters/weeks/total",
			openWeeksCount:"counters/weeks/open",
			visibleWeeksCount:"counters/weeks/visible",
			membersCounters:"counters/members",
			totalMembersCount:"counters/members/total",
			activeMembersCount:"counters/members/active",
			hostMembersCount:"counters/members/hosts",
			leadMembersCount:"counters/members/leads",
			traineeMembersCount:"counters/members/trainees",
			groupsCounters:"counters/groups",
			totalGroupsCount:"counters/groups/total",
			activeGroupsCount:"counters/groups/active",
			unredNotifCount:"counters/notifications/unreaded",
			totalNotifCount:"counters/notifications/total",
			reportsCounters:"counters/reports",
			totalReportsCount:"counters/reports/total",
			pendingReportsCount:"counters/reports/pending",
			approvedReportsCount:"counters/reports/approved",
			rejectedReportsCount:"counters/reports/rejected"
		},
		fields:{
			baseGroup:"baseGroupId",
			email:"email",
			reviewStatus:"reviewStatus",
			weekId:"weekId"
		}
	},
	roles: {
		user:"user", admin: "admin", type:"type", system:"System",
		isLead:"isLeader", isTrainee:"isTrainee", isHost:"isHost",
		isUser:"isUser",
		userDefaultName:"Usuario sin miembro asociado",
		rootName:"Super Administrador"
	},
	status: {
		online:"online", offline:"offline",
		active:"active", inactive:"inactive",
		approved:"approved", rejected:"rejected", pendingReview:"pending",
		open:"open", closed:"closed",
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
		weekEdit:"/weeks/edit/"
	},
	actions:{
		create:"create",update:"update",delete:"delete",
		approve:"approved",reject:"rejected",
		open:"open",close:"closed",show:"show",hide:"hide",
		grantAccess:"access-granted", revokeAccess:"access-deleted",
		updateRole:"type-update"
	},
	config:{isProdEnv: false}
};

//4. Editable Configurations
okulusApp.run(function($rootScope) {
	/* Set Default App Editable Configurations*/
	$rootScope.config ={
		appName:"Okulus App",
		/*The Max lenght a firebaseArray should have in the initial request*/
		maxQueryListResults: 50,
		/*After this number of records, the Filter box will be visible*/
		minResultsToshowFilter: 3,
		/*Date range limits*/
		members:{ minBDate:"1900-01-01" },
		reports:{
			minDate:"2018-01-01",
			goodAttendanceNumber:5,
			excelentAttendanceNumber:10,
			minDuration:"30", //minutes
			maxDuration:"300",//minutes
			showMoneyField: true
		}
	};
	/* Load  App Editable Configurations from Firebase */
	console.debug("Getting configurations from DB");
	let confReference = firebase.database().ref().child(constants.db.folders.root).child(constants.db.folders.config);
	confReference.once('value').then( function(snapshot){
		$rootScope.config = (snapshot.val());
		//Add todays date that will be used to limit some date selectors
		$rootScope.config.todayDate = new Date().toISOString().slice(0,10);
	});
});

/* Controller linked to the Editable Configurations View */
okulusApp.controller('ConfigCntrl',
	['$rootScope', '$scope', '$firebaseAuth', '$location', 'ConfigSvc','AuthenticationSvc',
	function($rootScope, $scope, $firebaseAuth, $location, ConfigSvc, AuthenticationSvc){
		/* Executed everytime we enter to /config
		  This function is used to confirm the user is Admin and prepare some initial values */
		$scope.response = {loading: true, message: systemMsgs.inProgress.loading };
		$firebaseAuth().$onAuthStateChanged(function(authUser){ if(authUser){
				AuthenticationSvc.loadSessionData(authUser.uid).$loaded().then(function(user){
					if(user.type == constants.roles.admin){
						$scope.configObj = ConfigSvc.getConfigurationsObj();
						$scope.configObj.$loaded().then(function(configDb){
							/* This is the format of the date in the DB: YYYY-MM-DD
							JS Date works with months starting from 0 (0-11), so we need to
							decrease the month from DB by one, to display it properly */
							$scope.temporal = [];
							//Report's Min Date
							let dateSplit = configDb.reports.minDate.split("-");
							let month = (Number(dateSplit[1])-1);
							$scope.temporal.minDateTemp = new Date(dateSplit[0],month,dateSplit[2]);

							//Member's Min Birthdate
							dateSplit = configDb.members.minBirthdate.split("-");
							month = (Number(dateSplit[1])-1);
							$scope.temporal.minBDateTemp = new Date(dateSplit[0],month,dateSplit[2]);

							$scope.response = null;
						});
					}else{
						$rootScope.response = {error:true, showHomeButton: true,
																	message:systemMsgs.error.noPrivileges};
						$location.path(constants.pages.error);
					}
				});
		}});

		$scope.saveConfigs = function(){
			$scope.response = {working: true, message: systemMsgs.inProgress.savingConfig };

			/* Use the Temp dates to build the actual date that will be persisted to the DB*/
			let minDate = $scope.temporal.minDateTemp;
			let year = minDate.getFullYear();
			let month = (minDate.getMonth()<9)?"0"+(minDate.getMonth()+1):minDate.getMonth()+1;
			let day = (minDate.getDate()<10)?"0"+(minDate.getDate()):minDate.getDate();
			$scope.configObj.reports.minDate = year + "-" + month + "-" + day;

			minDate = $scope.temporal.minBDateTemp;
			year = minDate.getFullYear();
			month = (minDate.getMonth()<9)?"0"+(minDate.getMonth()+1):minDate.getMonth()+1;
			day = (minDate.getDate()<10)?"0"+(minDate.getDate()):minDate.getDate();
			$scope.configObj.members.minBirthdate = year + "-" + month + "-" + day;

			$scope.configObj.$save().then(function(){
				$scope.response = {success:true, message:systemMsgs.success.configSaved};
			});
		};

}
]);

/* Service for the Editable Configurations*/
okulusApp.factory('ConfigSvc',
['$rootScope', '$firebaseArray', '$firebaseObject','AuditSvc',
	function($rootScope, $firebaseArray, $firebaseObject, AuditSvc){
		let configRef = firebase.database().ref().child(constants.db.folders.root).child(constants.db.folders.config);

		return {
			getConfigurationsObj: function(){
				return $firebaseObject(configRef);
			}
		};//return end

	}
]);
