okulusApp.factory('AuditSvc', ['$rootScope', 'ErrorsSvc', 'NotificationsSvc',
	function($rootScope, ErrorsSvc, NotificationsSvc){
		let baseRef = firebase.database().ref().child(rootFolder);
		let auditRef = baseRef.child(constants.folders.audit);

		return {
			/**
			 * This method will receive the reference of the created/updated Db record and will
			 * use its Id to create a couple of Audit records:
			 * 1. Record in the object itself (actions: creation,update)
			 * 2. Record in the App Global Audit Folder. (actions: creation,update, delete)
			 * Returns a reference to the audit folder created in the object
			 */
			recordAudit: function( objectId, action, on){
				//Determine who is doing the action
				let user = undefined;
				let userId = null;

				let session = $rootScope.currentSession;
				if(!session || !session.user){
					user = "System";
				} else if (session.user.isRoot){
					user = "Root";
					userId = session.user.$id;
				} else {
					user = session.user.email;
					userId = session.user.$id;
				}

				//Proceed to log the Global Audit Record
				let timestamp = firebase.database.ServerValue.TIMESTAMP;
		    auditRef.child(on).push().set(
					{action: action, by: user, byId: userId, referenceId:objectId, date: timestamp}
				);

				let objectAuditRef = baseRef.child(on).child(constants.folders.details).child(objectId).child(constants.folders.audit);
				//update Audit on the object
				if(action == 'create'){
					objectAuditRef.update(
						{createdById:userId, createdBy:user, createdOn: timestamp});
				}else if(action != 'delete'){
					//important to keep the if-else
					objectAuditRef.update(
						{lastUpdateById:userId, lastUpdateBy:user, lastUpdateOn: timestamp});
				}
				//For Reports
				if(on =="reports" ){
					if(action == 'create' || action == 'update' ){
						objectAuditRef.update(
							{ approvedById: null, approvedBy: null, approvedOn: null,
								rejectedById: null, rejectedBy: null, rejectedOn: null
							});
					}else if(action == 'approved'){
						objectAuditRef.update(
							{approvedById:userId, approvedBy:user, approvedOn: timestamp,
								rejectedById: null, rejectedBy: null, rejectedOn: null
							});
					}else if( action == 'rejected'){
						objectAuditRef.update(
							{rejectedById:userId, rejectedBy:user, rejectedOn: timestamp,
								approvedById: null, approvedBy: null, approvedOn: null
							});
					}
				}

				//Notifications get Triggered from same places as audit
        NotificationsSvc.notifyInterestedUsers(action, on, objectId, user, userId);
				return objectAuditRef;
			}
		};
	}
]);
