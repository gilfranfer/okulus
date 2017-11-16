
okulusApp.factory('AuditSvc', ['$rootScope',  
	function($rootScope){
		let baseRef = firebase.database().ref().child('pibxalapa');
	    
		return {
			recordAudit: function( ref, action, on){
				let audit = {action: action, by: "admin", date: firebase.database.ServerValue.TIMESTAMP};
			    //Audit in the object itself
			    ref.child("audit").push().set(audit);
			    
			    //global audit
			    audit.on = on;
			    audit.id = ref.key;
			    baseRef.child("audit").push().set(audit);

			}
		};
	}
]);