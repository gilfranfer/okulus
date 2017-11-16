var okulusApp = angular.module('okulusApp',['ngRoute','firebase']);

okulusApp.config(['$routeProvider',
	function($routeProvider){
		$routeProvider
			.when('/admin/org', {
				templateUrl: 'views/admin/orgProfile.html'
			})
			.when('/admin/launchpad', {
				templateUrl: 'views/admin/launchpad.html'
			})
			.when('/admin/newgroup', {
				templateUrl: 'views/admin/newgroup.html',
				controller: 'GroupsCntrl'
			})
			.when('/admin/newmember', {
				templateUrl: 'views/admin/newmember.html'
			})
			.when('/admin/newreport', {
				templateUrl: 'views/admin/newreport.html'
			})
			.otherwise({
				redirectTo: '/admin/launchpad'
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
