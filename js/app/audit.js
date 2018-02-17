
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
			recordAudit: function( id, action, on){
				let member = "";
				if ($rootScope.currentSession && $rootScope.currentSession.member){
					member = $rootScope.currentSession.member.$id;
				}
				let audit = {action: action, by: member, date: firebase.database.ServerValue.TIMESTAMP,referenceId:id };

				// if(action === 'delete'){
				// 	//On delete there is no need to create an Audit in the object, because it will be removed
				// }else{
				//     //Audit in the object itself
				//     ref.child("audit").push().set(audit);
				// }
		    //app global audit
		    baseRef.child(on).push().set(audit);
			}
		};
	}
]);
