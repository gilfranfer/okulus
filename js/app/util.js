okulusApp.factory('ErrorsSvc', ['$rootScope','$firebaseObject',
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

okulusApp.factory('CountersSvc',
['$rootScope', '$firebaseArray', '$firebaseObject',
	function($rootScope, $firebaseArray, $firebaseObject){
		let baseRef = firebase.database().ref().child(constants.db.folders.root);
		let globalCounters = baseRef.child(constants.db.folders.counters);

		return {
			setInitialCounters: function(){
				let counters = {
					errors:{systemErrors:0},
					groups:{active:0, total:0},
					members:{active:0, total:0, hosts:0, leads:0, trainees:0},
					reports:{approved:0, pending:0, rejected:0, total:0},
					requests:{members:{approved:0, pending:0, rejected:0, total:0}},
					weeks:{open:0, visible:0, total:0}
				};
				globalCounters.set(counters);
			},
			getGlobalCounters: function(){
				return $firebaseObject(globalCounters);
			}
		};

}]);
