var okulusApp = angular.module('okulusApp',['ngRoute']);

okulusApp.config(['$routeProvider',
	function($routeProvider){
		$routeProvider.
			when('/about', {
				templateUrl: 'views/about.html'
			}).
			otherwise({
				redirectTo: 'about'
			});
	}
]);


