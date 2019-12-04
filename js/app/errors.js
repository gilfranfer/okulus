okulusApp.controller('ErrorsMonitorCntrl',
	['$rootScope','$scope','$location','$firebaseArray','$firebaseObject','$firebaseAuth','AuthenticationSvc', 'ErrorsSvc',
	function($rootScope, $scope,$location, $firebaseArray, $firebaseObject,$firebaseAuth, AuthenticationSvc, ErrorsSvc){

		let noAdminErrorMsg = "Área solo para Administradores.";
		let baseRef = firebase.database().ref().child(constants.db.folders.root);
		let errorsRef = baseRef.child('errors');

		/*Executed when accessing to /admin/monitor, to confirm the user still admin*/
		$firebaseAuth().$onAuthStateChanged( function(authUser){
    	if(authUser){
				AuthenticationSvc.loadSessionData(authUser.uid).$loaded().then(function (user) {
					if(user.type == constants.roles.user){
						$rootScope.response = {error:true, showHomeButton: true, message:systemMsgs.error.noPrivileges};
						$location.path(constants.pages.error);
					}else{
						$scope.loadSystemErrors();
					}
				});
			}
		});

		$scope.loadSystemErrors = function(){
			$scope.response = {errorsLoading: true, message: $rootScope.i18n.admin.errors.loading};
			if(!$scope.errorRecords){
				$scope.errorRecords = $firebaseArray( errorsRef );
				$scope.errorRecords.$loaded().then(function(list) {
					$scope.response = {errorsSuccess: true, message: list.length + " " + $rootScope.i18n.admin.errors.loadingSuccess};
				})
				.catch( function(error){
					$scope.response = {errorsError: true, message: $rootScope.i18n.notifications.loadingError};
					console.error(error);
				});
			}
		};

		/*Update the error record's "readed" value. For security, before any update,
		confirm the error's current "readed" value is different than the new one */
		$scope.readErrorRecord = function(markReaded, error){
			if(error.readed != markReaded){
				ErrorsSvc.updateErrorReadedStatus(error.$id, markReaded);
			}
		};

		/* Remove the error from db */
		$scope.deleteErrorRecord = function(error){
			ErrorsSvc.deleteErrorRecord(error);
		};

}]);

okulusApp.factory('ErrorsSvc',
  ['$rootScope','$firebaseObject',
	function($rootScope,$firebaseObject){
		let baseRef = firebase.database().ref().child(constants.db.folders.root);
		let errorsRef = baseRef.child(constants.db.folders.errors);
		let counterRef = baseRef.child(constants.db.folders.errorsCount).child(constants.db.fields.systemErrors);

		/*Using a Transaction with an update function to reduce the counter by 1 */
		let decreaseUnreadErrorsCounter = function(){
			counterRef.transaction(function(systemErrors) {
				if(systemErrors>0)
					return systemErrors - 1;
				return systemErrors;
			});
		};

		/*Using a Transaction with an update function to increase the counter by 1 */
		let increaseUnreadErrorsCounter = function(){
			counterRef.transaction(function(systemErrors) {
				return systemErrors + 1;
			});
		};

		return {
			/*Add an error ecord in the DB, and increase the global error counter*/
			logError: function(errorMessage){
				console.error(errorMessage);
				let record = { error: errorMessage, date: firebase.database.ServerValue.TIMESTAMP,
											impactedUserId: $rootScope.currentSession.user.$id,
											impactedUserEmail: $rootScope.currentSession.user.email
										 };
		    errorsRef.push().set(record);
				increaseUnreadErrorsCounter();
			},
			updateErrorReadedStatus: function(errorId, isReaded){
				errorsRef.child(errorId).update({readed:isReaded});
				if(isReaded){
					decreaseUnreadErrorsCounter();
				}else{
					increaseUnreadErrorsCounter();
				}
			},
			/*Delete the error element, and reduce the counter */
			deleteErrorRecord: function(error){
				if(!error.readed){
					decreaseUnreadErrorsCounter();
				}
				errorsRef.child(error.$id).set({});
			},
			getGlobalErrorCounter: function(){
				return $firebaseObject(baseRef.child(constants.db.folders.errorsCount));
			},
		};
	}
]);
