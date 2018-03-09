
okulusApp.factory('AuditSvc', ['$rootScope', 'ErrorsSvc',
	function($rootScope,ErrorsSvc){
		let baseRef = firebase.database().ref().child('pibxalapa');
		let auditRef = firebase.database().ref().child('pibxalapa').child("audit");

		return {
			/**
			 * This method will receive the reference of the created/updated Db record and will
			 * use its Id to create a couple of Audit records:
			 * 1. Record in the object itself (actions: creation,update)
			 * 2. Record in the App Global Audit Folder. (actions: creation,update, delete)
			 */
			recordAudit: function( id, action, on){
				//Determine who is doing the action
				let member = undefined;
				let session = $rootScope.currentSession;
				if(!session || !session.user){
					member = "System";
				} else if(session.user.isRoot){
					member = "Root";
				} else {
					member = "Admin";
				}
				if(session && session.user){
					member = session.user.email;
				}
				if (!member){
					member = "?"
					ErrorsSvc.logError("Audit generado sin información del creador");
				}
				//Proceed to log the Global Audit Record
				let audit = {action: action, by: member, date: firebase.database.ServerValue.TIMESTAMP, referenceId:id };
		    auditRef.child(on).push().set(audit);
				//update Audit on the object
				if(action == 'create'){
					baseRef.child(on).child(id).child("audit").update({createdOn:firebase.database.ServerValue.TIMESTAMP,createdBy:member});
				}else if(action != 'delete'){
					//important to keep the if-else
					baseRef.child(on).child(id).child("audit").update({lastUpdateOn:firebase.database.ServerValue.TIMESTAMP,lastUpdateBy:member});
				}
			}
		};
	}
]);

okulusApp.factory('ErrorsSvc', ['$rootScope',
	function($rootScope){
		let baseRef = firebase.database().ref().child("pibxalapa/errors");

		return {
			logError: function( error ){
				let record = {error: error, userImpacted: $rootScope.currentSession.user.email,
					 						date: firebase.database.ServerValue.TIMESTAMP};
		    baseRef.push().set(record);
			}
		};
	}
]);

okulusApp.factory('UtilsSvc', ['$firebaseArray', '$firebaseObject',
	function( $firebaseArray, $firebaseObject){

		return {
			buildDateJson: function(dateObject){
		    	let dateJson = null;
		    	if(dateObject){
		    		dateJson = { day:dateObject.getDate(),
							 month: dateObject.getMonth()+1,
							 year:dateObject.getFullYear() };
				}
				return dateJson;
			},
			buildTimeJson: function(dateObject){
		    	let timeJson = null;
		    	if(dateObject){
		    		timeJson = { HH:dateObject.getHours(),
							 	 MM:dateObject.getMinutes() };
				}
				return timeJson;
			}
		};
	}
]);
