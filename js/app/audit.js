
okulusApp.factory('AuditSvc', ['$rootScope',
	function($rootScope){
		let baseRef = firebase.database().ref().child('pibxalapa').child("audit");

		return {
			/**
			 * This method will receive the reference of the created/updated Db record and will
			 * use its Id to create a couple of Audit records:
			 * 1. Record in the object itself (actions: creation,update)
			 * 2. Record in the App Global Audit Folder. (actions: creation,update, delete)
			 */
			recordAudit: function( ref, action, on){
				let audit = {action: action, by: "admin", date: firebase.database.ServerValue.TIMESTAMP};

				if(action === 'delete'){
					//On delete there is no need to create an Audit in the object, because it will be removed
				}else{
				    //Audit in the object itself
				    ref.child("audit").push().set(audit);
				}
			    //app global audit
			    audit.referenceId = ref.key;
			    baseRef.child(on).push().set(audit);
			}
		};
	}
]);
