var okulusApp = angular.module('okulusApp',['ngRoute']);

okulusApp.config(['$routeProvider',
	function($routeProvider){
		$routeProvider
			.when('/org/profile', {
				templateUrl: 'views/orgProfile.html',
				controller:  'OrgProfilenCntrl'
			})

			.when('/entrar', {
				templateUrl: 'views/login.html'
			})
			.when('/salir', {
				templateUrl: 'views/login.html'
			})
			.when('/acerca', {
				templateUrl: 'views/about.html'
			})
			.when('admin/inicio', {
				//A cards view with links to dashboard, control, reports, etc 
				templateUrl: 'views/about.html'
			})
			.when('/miembros', {
				templateUrl: 'views/login.html'
			})
			.when('/miembro/:mid', {
				templateUrl: 'views/login.html'
			})
			.when('/grupos', {
				templateUrl: 'views/login.html'
			})
			.when('/grupo/:gid', {
				templateUrl: 'views/login.html'
			})
			.when('/reuniones/horarios', {
				templateUrl: 'views/login.html'
			})
			.when('/reportes/nuevo', {
				templateUrl: 'views/login.html'
			})
			.when('/admin/reportes', {
				templateUrl: 'views/login.html'
			})
			.when('/admin/inicio', {
				templateUrl: 'views/login.html'
			})
			.otherwise({
				redirectTo: 'acerca'
			});
	}
]);


okulusApp.factory( 'I18nSvc', ['$rootScope',

	function($rootScope){
		var currentAppVersion = "0.1.1"

		var putTasksOnDefaultList = function(userData){
			if (userData.tasks === undefined ){
				console.log("No Tasks to Update");
			}else{
				var count = 0;
				Object.keys(userData.tasks).map(
					function (key) {
						if( userData.tasks[key].inList === undefined){
							userData.tasks[key].inList = "Default";
						}
						return userData.tasks[key];
					});
				console.log(count + " Tasks updated");
			}
		};

		return{
			upgradeUserConfig: function( user ){

				user.$loaded().then( function(data) {
				    if ( user.config === undefined
				    		|| user.config.appVersion !== currentAppVersion ){
						console.log("User needs some updates");
						//Update App Version on Conf Folder
						user.config = {appVersion:currentAppVersion};
						//Create Default Task List (Consider to check if lists folder is empty )
						user.lists = { "default": {name:"Default", date:firebase.database.ServerValue.TIMESTAMP} };
						putTasksOnDefaultList(user);
						user.$save();
					}else{
						console.log("User is up to date "+ currentAppVersion );
					}
				}).catch(function(error) {
					console.error("Error:", error);
				});

				return "";
			},
			getAppVersion: function(){
				return currentAppVersion;
			}
		};
	}
]);

