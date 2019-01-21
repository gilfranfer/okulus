/** Application entry point. In this is the configuration file we:
1. Create the Angular module
2. Prepare the URL routing in the config function
3. Create a constants $firebaseObject
4. Set the System Editable Configurations
**/
var okulusApp = angular.module('okulusApp',['ngRoute','firebase']);

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
			.when('/reports/new/:groupId', {
				resolve: {
					currentAuth: function(AuthenticationSvc){
						return AuthenticationSvc.isUserLoggedIn();
					}
				},
				controller: 'NewReportCntrl',
				templateUrl: 'views/reports/newreport.html'
			})
			.when('/reports/edit/:reportId', {
				resolve: {
					currentAuth: function(AuthenticationSvc){
						return AuthenticationSvc.isUserLoggedIn();
					}
				},
				templateUrl: 'views/reports/newreport.html',
				controller: 'ReportDetailsCntrl'
			})
			.when('/reports/view/:reportId', {
				resolve: {
					currentAuth: function(AuthenticationSvc){
						return AuthenticationSvc.isUserLoggedIn();
					}
				},
				templateUrl: 'views/reports/newreport.html',
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

//Db Root Folder
const rootFolder = "okulusTest";
const constants = {
	roles: {
		user:"user", admin: "admin", type:"type", system: "System",
		isLead:"isLeader", isTrainee:"isTrainee", isHost: "isHost",
		isUser:"isUser"
	},
	status: {
		online:"online", offline:"offline",
		active:"active", inactive:"inactive",
		open:"open", closed:"closed",
		visible:"show", hidden:"hide",
		readed:"readed",
		isActive:"isActive",
		isOpen:"isOpen", isVisible:"isVisible"
	},
	pages: {
		login:"/login", home:"/home",
		error: "/error",
		adminWeeks:"/weeks", adminMembers:"/members",
		adminGroups:"/groups",
		adminMonitor:"/admin/monitor",
		memberEdit:"/members/edit/",
		groupEdit:"/groups/edit/",
		weekEdit:"/weeks/edit/"
	},
	folders:{
		root:"okulusTest", counters:"counters", details:"details",
		audit:"audit", users:"users", weeks:"weeks", roles:"roles",
		groups:"groups", members:"members", reports:"reports",
		chats:"chats", chatList:"chatRooms",chatMessages:"messages",
		metadata:"metadata", address:"address", accessRules:"access",
		unreadChats:"unreadChats",unreadCount:"unreadCount",
		weeksList:"weeks/list", weeksDetails:"weeks/details",
		groupsList:"groups/list", groupsDetails:"groups/details",
		membersList:"members/list", membersDetails:"members/details",
		notificationsList:"notifications/list",
		/**Counters*/
		weeksCounters:"counters/weeks",
		membersCounters:"counters/members",
		groupsCounters:"counters/groups",
		totalWeeksCount:"counters/weeks/total",
		openWeeksCount:"counters/weeks/open",
		visibleWeeksCount:"counters/weeks/visible",
		totalMembersCount:"counters/members/total",
		activeMembersCount:"counters/members/active",
		hostMembersCount:"counters/members/hosts",
		leadMembersCount:"counters/members/leads",
		traineeMembersCount:"counters/members/trainees",
		totalGroupsCount:"counters/groups/total",
		activeGroupsCount:"counters/groups/active",
		unredNotifCount:"counters/notifications/unreaded",
		totalNotifCount:"counters/notifications/total"
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

/* Configurations that, in future versions, can be modified by System Admin*/
okulusApp.run(function($rootScope) {
		$rootScope.config ={
			/*The Max lenght a firebaseArray should have in the initial request*/
			maxQueryListResults: 20,
			/*After this number of records, the Filter box will be visible*/
			minResultsToshowFilter: 3,
			/*Date range limits*/
			bday:{maxDate:"2019-12-31",minDate:"1900-01-01"},
			week:{maxDate:"2019-12-31",minDate:"2018-01-01"},
			reports:{
						maxDate:"2019-12-31",minDate:"2018-01-01",
						minDuration:"0", maxDuration:"300"
					}
		};
});
