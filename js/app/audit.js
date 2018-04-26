
okulusApp.factory('AuditSvc', ['$rootScope', 'ErrorsSvc', 'NotificationsSvc',
	function($rootScope, ErrorsSvc, NotificationsSvc){
		let baseRef = firebase.database().ref().child(rootFolder);
		let auditRef = firebase.database().ref().child(rootFolder).child("audit");

		return {
			/**
			 * This method will receive the reference of the created/updated Db record and will
			 * use its Id to create a couple of Audit records:
			 * 1. Record in the object itself (actions: creation,update)
			 * 2. Record in the App Global Audit Folder. (actions: creation,update, delete)
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
				let audit = {action: action, by: user, byId: userId, referenceId:objectId, date: firebase.database.ServerValue.TIMESTAMP};
		    auditRef.child(on).push().set(audit);

				//update Audit on the object
				if(action == 'create'){
					baseRef.child(on).child(objectId).child("audit").update(
						{createdById:userId, createdBy:user, createdOn:firebase.database.ServerValue.TIMESTAMP});
				}else if(action != 'delete'){
					//important to keep the if-else
					baseRef.child(on).child(objectId).child("audit").update(
						{lastUpdateById:userId, lastUpdateBy:user, lastUpdateOn:firebase.database.ServerValue.TIMESTAMP});
				}
				//For Reports
				if(on =="reports" ){
					if(action == 'approved'){
						baseRef.child(on).child(objectId).child("audit").update(
							{approvedById:userId, approvedBy:user, approvedOn:firebase.database.ServerValue.TIMESTAMP,
								rejectedById: null, rejectedBy: null, rejectedOn: null
							});
					}else if( action == 'rejected'){
						baseRef.child(on).child(objectId).child("audit").update(
							{rejectedById:userId, rejectedBy:user, rejectedOn:firebase.database.ServerValue.TIMESTAMP,
								approvedById: null, approvedBy: null, approvedOn: null
							});
					}
				}

				//Notifications get Triggered from same places as audit
        NotificationsSvc.sendNotification(action, on, objectId, user, userId);
				return baseRef.child(on).child(objectId).child("audit");
			}
		};
	}
]);
