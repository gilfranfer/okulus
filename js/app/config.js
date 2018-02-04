var okulusApp = angular.module('okulusApp',['ngRoute','firebase']);

okulusApp.config(['$routeProvider',
	function($routeProvider){
		$routeProvider
			.when('/about', {
				templateUrl: 'views/about.html'
			})
			.when('/home', {
				templateUrl: 'views/home.html',
				controller: 'GroupListCntrl'
			})
			.when('/admin/dashboard', {
				// resolve: {
				// 	currentAuth: function(AuthenticationSvc){
				// 		return AuthenticationSvc.isUserLoggedIn() && isAdmin();
				// 	}
				// },
				templateUrl: 'views/admin/dashboard.html'
			})
			.when('/admin/monitor', {
				// resolve: {
				// 	currentAuth: function(AuthenticationSvc){
				// 		return AuthenticationSvc.isUserLoggedIn() && isAdmin();
				// 	}
				// },
				templateUrl: 'views/admin/monitor.html',
				controller: 'MonitorCntrl'
			})

			.when('/groups', {
				// resolve: {
				// 	currentAuth: function(AuthenticationSvc){
				// 		return AuthenticationSvc.isUserLoggedIn();
				// 	}
				// },
				templateUrl: 'views/groups/groups.html',
				controller: 'GroupsAdminListCntrl'
			})
			.when('/groups/new', {
				// resolve: {
				// 	currentAuth: function(AuthenticationSvc){
				// 		return AuthenticationSvc.isUserLoggedIn() && isAdmin();
				// 	}
				// },
				templateUrl: 'views/groups/newgroup.html'
			})
			.when('/groups/edit/:groupId', {
				// resolve: {
				// 	currentAuth: function(AuthenticationSvc){
				// 		return AuthenticationSvc.isUserLoggedIn() && isAdmin();
				// 	}
				// },
				templateUrl: 'views/groups/newgroup.html',
				controller: 'GroupDetailsCntrl'
			})
			.when('/groups/access/:groupId', {
				// resolve: {
				// 	currentAuth: function(AuthenticationSvc){
				// 		return AuthenticationSvc.isUserLoggedIn() && isAdmin();
				// 	}
				// },
				templateUrl: 'views/groups/accessRules.html',
				controller: 'AccessRulesCntrl'
			})
			.when('/members', {
				// resolve: {
				// 	currentAuth: function(AuthenticationSvc){
				// 		return AuthenticationSvc.isUserLoggedIn();
				// 	}
				// },
				templateUrl: 'views/members/members.html',
				controller: 'MembersListCntrl'
			})
			.when('/members/new', {
				// resolve: {
				// 	currentAuth: function(AuthenticationSvc){
				// 		return AuthenticationSvc.isUserLoggedIn() && isAdmin();
				// 	}
				// },
				templateUrl: 'views/members/newmember.html'
			})
			.when('/members/edit/:memberId', {
				// resolve: {
				// 	currentAuth: function(AuthenticationSvc){
				// 		return AuthenticationSvc.isUserLoggedIn() && isAdmin();
				// 	}
				// },
				templateUrl: 'views/members/newmember.html',
				controller: 'MemberDetailsCntrl'
			})
			.when('/reports', {
				// resolve: {
				// 	currentAuth: function(AuthenticationSvc){
				// 		return AuthenticationSvc.isUserLoggedIn() && isAdmin();
				// 	}
				// },
				templateUrl: 'views/reports/reports.html',
				controller: 'ReportsListCntrl'
			})
			.when('/reports/new/:groupId', {
				// resolve: {
				// 	currentAuth: function(AuthenticationSvc){
				// 		return AuthenticationSvc.isUserLoggedIn() && isAdmin();
				// 	}
				// },
				templateUrl: 'views/reports/newreport.html'
			})
			.when('/reports/edit/:reportId', {
				// resolve: {
				// 	currentAuth: function(AuthenticationSvc){
				// 		return AuthenticationSvc.isUserLoggedIn() && isAdmin();
				// 	}
				// },
				templateUrl: 'views/reports/newreport.html',
				controller: 'ReportDetailsCntrl'
			})
			.when('/weeks', {
				// resolve: {
				// 	currentAuth: function(AuthenticationSvc){
				// 		return AuthenticationSvc.isUserLoggedIn() && isAdmin();
				// 	}
				// },
				templateUrl: 'views/admin/weeks.html',
				controller: "WeeksCntrl"
			})
			.when('/result/delete', {
				templateUrl: 'views/responses/delete-result.html'
			})
			.when('/error/norecord', {
				templateUrl: 'views/responses/error-norecord.html'
			})
			.when('/organization', {
				templateUrl: 'views/admin/orgProfile.html'
			})
			.otherwise({
				redirectTo: '/about'
			});
	}
]);
