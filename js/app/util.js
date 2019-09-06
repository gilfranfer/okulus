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
		let globalCountersRef = baseRef.child(constants.db.folders.counters);
		let usersCountersRef = baseRef.child(constants.db.folders.userCounters);

		return {
			setInitialCounters: function(){
				let counters = {
					errors:{systemErrors:0},
					groups:{active:0, total:0},
					members:{active:0, total:0, hosts:0, leads:0, trainees:0},
					reports:{approved:0, pending:0, rejected:0, total:0},
					requests:{members:{approved:0, pending:0, rejected:0, total:0}},
					users:{active:1, total:1, roots:1, admins:0, users:0},
					weeks:{open:0, visible:0, total:0}
				};
				globalCountersRef.set(counters);
			},
			getGlobalCounters: function(){
				return $firebaseObject(globalCountersRef);
			},
			getUsersGlobalCounters: function(){
				return $firebaseObject(usersCountersRef);
			}
		};

}]);

okulusApp.factory('AuditSvc', ['$rootScope', 'ErrorsSvc', 'NotificationsSvc',
	function($rootScope, ErrorsSvc, NotificationsSvc){
		let baseRef = firebase.database().ref().child(constants.db.folders.root);

		/* Get's the user id and email from the current session, taking in consideration
		 sometimes the user can be root or even the system itself */
		let getUserDetails = function() {
			let user = {};
			let session = $rootScope.currentSession;
			if(!session || !session.user){
				user.id = null;
				user.email = null;
				user.name = constants.roles.systemName;
			} else if (session && session.user.type == constants.roles.root){
				user.id = session.user.$id;
				user.email = null;
				user.name = constants.roles.rootName;
			} else {
				user.id = session.user.$id;
				user.email = session.user.email;
				user.name = session.user.shortname;
			}
			return user;
		};

		return {
			/**
			 * action: Action performed by the user (create, delete, update, etc)
			 * objectFolder: The folder where the action was performed (members, users, groups, reports, etc)
			 * objectId: The id of the object where the action was performed
			 * description: Description of the action performed. It will be saved in the audit, and used for the notification
			 * sendNotification: Optional true or false do determine wheter a notification will be triggered for this action
			 * Returns a reference to the audit folder created in the object
			 */
			saveAuditAndNotify: function(action, objectFolder, objectId, description, avoidNotification){
				let user = getUserDetails();
				let timestamp = firebase.database.ServerValue.TIMESTAMP;
				let objectAuditRef = baseRef.child(objectFolder).child(constants.db.folders.details).child(objectId).child(constants.db.folders.audit);

				if(action == constants.actions.delete){
					//no need to save the audit in the object, because it was already removed from DB
				}else if(action == constants.actions.create){
					objectAuditRef.set( {createdById:user.id, createdByName:user.name, createdByEmail:user.email, createdOn:timestamp, description: description} );
				}else{
					objectAuditRef.update( {lastUpdateById:user.id, lastUpdateByName:user.name, lastUpdateByEmail:user.email, lastUpdateOn:timestamp, description: description} );
				}

				//Additional Audit fields only For Reports
				if(objectFolder == constants.db.folders.reports){
					if(action == constants.actions.create || action == constants.actions.update){
						objectAuditRef.update(
							{ approvedById: null, approvedByName: null, approvedByEmail: null, approvedOn: null,
								rejectedById: null, rejectedByName: null, rejectedByEmail: null, rejectedOn: null
							});
					}else if(action == constants.actions.approve){
						objectAuditRef.update(
							{approvedById:user.id, approvedByName:user.name, approvedByEmail: user.email, approvedOn: timestamp,
								rejectedById: null, rejectedByName: null, rejectedByEmail: null, rejectedOn: null
							});
					}else if( action == constants.actions.reject){
						objectAuditRef.update(
							{approvedById: null, approvedByName:null, approvedByEmail: null, approvedOn: null,
								rejectedById: user.id, rejectedByName:user.name, rejectedByEmail: user.email, rejectedOn: timestamp
							});
					}
				}

				if(!avoidNotification){
					NotificationsSvc.notifyInvolvedParties(action, objectFolder, objectId, user, description);
				}
				return objectAuditRef;
			}
		};
	}
]);
