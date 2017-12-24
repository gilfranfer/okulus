
okulusApp.factory('AuditSvc', ['$rootScope',  
	function($rootScope){
		let baseRef = firebase.database().ref().child('pibxalapa');
	    
		return {
			recordAudit: function( ref, action, on){
				let audit = {action: action, by: "admin", date: firebase.database.ServerValue.TIMESTAMP};
				
				if(action === 'delete'){
					//On delete there is no need to stor this in the deleted object
				}else{					
				    //Audit in the object itself
				    ref.child("audit").push().set(audit);
				}
			    
			    //global audit
			    audit.on = on;
			    audit.id = ref.key;
			    baseRef.child("audit").push().set(audit);
			}
		};
	}
]);