
okulusApp.factory('CountersSvc',
['$rootScope', '$firebaseArray', '$firebaseObject',
	function($rootScope, $firebaseArray, $firebaseObject){
		let baseRef = firebase.database().ref().child(constants.db.folders.root);
		let globalCountersRef = baseRef.child(constants.db.folders.counters);
		let usersCountersRef = baseRef.child(constants.db.folders.userCounters);

		/*Using a Transaction with an update function to reduce the counter by 1 */
		let decreaseCounter = function(counterRef){
			counterRef.transaction(function(currentCount) {
				if(currentCount>0)
					return currentCount - 1;
				return currentCount;
			});
		};

		/*Using a Transaction with an update function to increase the counter by 1 */
		let increaseCounter = function(counterRef){
			counterRef.transaction(function(currentCount) {
				return currentCount + 1;
			});
		};

		return {
			setInitialCounters: function(){
				let counters = {
					errors:{systemErrors:0},
					groups:{active:0, total:0},
					members:{active:0, total:0, hosts:0, leads:0, trainees:0},
					reports:{approved:0, pending:0, rejected:0, total:0},
					requests:{members:{approved:0, pending:0, rejected:0, total:0}},
					users:{active:1, total:1, root:1, admin:0, user:0},
					weeks:{open:0, visible:0, total:0}
				};
				globalCountersRef.set(counters);
			},
			getGlobalCounters: function(){
				return $firebaseObject(globalCountersRef);
			},
			getUsersGlobalCounters: function(){
				return $firebaseObject(usersCountersRef);
			},
			/*** Users ***/
			/* increaseTotalUsers: Called After User Creation. Increase the count of:
			 - Total Users, - Active users, - User type  */
			increaseTotalUsers: function(userType){
				increaseCounter(usersCountersRef.child(constants.db.fields.total));
				increaseCounter(usersCountersRef.child(constants.db.fields.active));
				if(userType){
					increaseCounter(usersCountersRef.child(userType));
				}
			},
			increaseActiveUsers: function(){
				increaseCounter(usersCountersRef.child(constants.db.fields.active));
			},
			decreaseActiveUsers: function(){
				decreaseCounter(usersCountersRef.child(constants.db.fields.active));
			},
			increaseAdminUsers: function(){
				increaseCounter(usersCountersRef.child(constants.db.fields.admin));
			},
			decreaseAdminUsers: function(){
				decreaseCounter(usersCountersRef.child(constants.db.fields.admin));
			},
			increaseNormalUsers: function(){
				increaseCounter(usersCountersRef.child(constants.db.fields.user));
			},
			decreaseNormalUsers: function(){
				decreaseCounter(usersCountersRef.child(constants.db.fields.user));
			}
		};

}]);

okulusApp.factory('AuditSvc',
	['$rootScope', 'ErrorsSvc', 'NotificationsSvc',
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
					NotificationsSvc.notifyInvolvedParties(action, objectFolder, objectId, description, null);
				}
				return objectAuditRef;
			}
		};
	}
]);
