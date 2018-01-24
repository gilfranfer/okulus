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
				controller: 'GroupListCntrl'
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
			.when('/reports/new', {
				// resolve: {
				// 	currentAuth: function(AuthenticationSvc){
				// 		return AuthenticationSvc.isUserLoggedIn() && isAdmin();
				// 	}
				// },
				templateUrl: 'views/reports/newreport.html',
				controller: 'ReportCntrl'
			})
			.when('/success/deleted', {
				templateUrl: 'views/success/recordDeleted.html'
			})
			.when('/error', {
				templateUrl: 'views/errors/general.html'
			})

			.when('/organization', {
				templateUrl: 'views/admin/orgProfile.html'
			})
			.otherwise({
				redirectTo: '/about'
			});
	}
]);
