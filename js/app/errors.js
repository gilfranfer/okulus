okulusApp.factory('ErrorsSvc', ['$rootScope',
	function($rootScope){
		let baseRef = firebase.database().ref().child("pibxalapa/errors");

		return {
			logError: function( error ){
				console.error(error);
				let record = {error: error, userImpacted: $rootScope.currentSession.user.email,
					 						date: firebase.database.ServerValue.TIMESTAMP};
		    baseRef.push().set(record);
			}
		};
	}
]);
