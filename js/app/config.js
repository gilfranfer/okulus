var okulusApp = angular.module('okulusApp',['ngRoute','firebase']);

okulusApp.config(['$routeProvider',
	function($routeProvider){
		$routeProvider
			.when('/home', {
				templateUrl: 'views/home.html'
			})
			.when('/admin/launchpad', {
				// resolve: {
				// 	currentAuth: function(AuthenticationSvc){
				// 		return AuthenticationSvc.isUserLoggedIn() && isAdmin();
				// 	}
				// },
				templateUrl: 'views/admin/launchpad.html'
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
				templateUrl: 'views/admin/monitor.html'
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
			.when('/group/new', {
				// resolve: {
				// 	currentAuth: function(AuthenticationSvc){
				// 		return AuthenticationSvc.isUserLoggedIn() && isAdmin();
				// 	}
				// },
				templateUrl: 'views/groups/newgroup.html'
			})
			.when('/group/view/:groupId', {
				// resolve: {
				// 	currentAuth: function(AuthenticationSvc){
				// 		return AuthenticationSvc.isUserLoggedIn() && isAdmin();
				// 	}
				// },
				templateUrl: 'views/groups/newgroup.html',
				controller: 'GroupDetailsCntrl'
			})
			
			.when('/admin/org', {
				templateUrl: 'views/admin/orgProfile.html'
			})
			.when('/admin/newmember', {
				templateUrl: 'views/admin/newmember.html'
			})
			.when('/admin/newreport', {
				templateUrl: 'views/admin/newreport.html'
			})
			.otherwise({
				redirectTo: '/home'
			});
	}
]);
