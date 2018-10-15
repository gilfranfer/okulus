/* Controller used only in the app config for the Notification Center (/notifications) */
okulusApp.controller('NotificationCenterCntrl', ['$rootScope','$scope','$firebaseAuth', '$location','AuthenticationSvc', 'NotificationsSvc',
	function($rootScope, $scope, $firebaseAuth, $location, AuthenticationSvc, NotificationsSvc){

		let noMemberPath = "/error/nomember"
		//Executed everytime whe enter to Notification Center
		$firebaseAuth().$onAuthStateChanged( function(authUser){
			if(!authUser) return;
			$scope.response = { loading:true, message: $rootScope.i18n.notifications.loading};
			AuthenticationSvc.loadSessionData(authUser.uid).$loaded().then(function (user) {
				if(!user.memberId){
					$location.path(noMemberPath);
				}else{
					//Show notifications only when the user has a member assigned
					$scope.allNotifications = NotificationsSvc.getNotificationsForUser(authUser.uid);
					$scope.allNotifications.$loaded().then(function(notifications) {
						let message = notifications.length + " " + $rootScope.i18n.notifications.loadingSuccess;
						$scope.response = { success:true, message: message};
					})
					.catch( function(error){
						$scope.response = { error: true, message: $rootScope.i18n.notifications.loadingError };
						console.error(error);
					});
				}
			});
		});

		$scope.markNotificacionReaded = function(notification){
			if(!notification.readed){
				let loggedUserId = $rootScope.currentSession.user.$id;
				NotificationsSvc.markNotificacionReaded(loggedUserId,notification.$id);
			}
		};

		$scope.openNotification = function(notification){
			$scope.markNotificacionReaded(notification);
			if(notification.onFolder == "weeks"){
				$location.path("/weeks");
			}else{
				$location.path("/"+notification.onFolder+"/edit/"+notification.onObject);
			}
		};

		$scope.openMemberByUserId = function(notification){
			$scope.markNotificacionReaded(notification);
			$location.path("/users/edit/"+notification.fromId);
		};

		$scope.deleteNotification = function(notificationId){
			let loggedUserId = $rootScope.currentSession.user.$id;
			NotificationsSvc.deleteNotification(loggedUserId, notificationId);
		};

		$scope.deleteAllNotifications = function() {
			let loggedUserId = $rootScope.currentSession.user.$id;
			NotificationsSvc.deleteAllNotifications(loggedUserId);
		}

		$scope.markReadedAllNotifications = function() {
			let loggedUserId = $rootScope.currentSession.user.$id;
			NotificationsSvc.markReadedAllNotifications(loggedUserId);
		}

}]);

okulusApp.factory('NotificationsSvc', ['$rootScope', '$firebaseArray', '$firebaseObject',
	function($rootScope, $firebaseArray, $firebaseObject){
		let baseRef = firebase.database().ref().child(rootFolder);
		let notificationsRef = firebase.database().ref().child(rootFolder).child('notifications');
		let adminUsersRef = firebase.database().ref().child(rootFolder).child('users').orderByChild("type").equalTo("admin");

		/* Map with valida actions */
		let actionsDescMap = new Map([ ["create","creado"], ["update","actualizado"],	["delete","eliminado"],
															["approved","aprobado"], ["rejected","rechazado"],
															["access-granted","Acceso Concedido a"], ["access-deleted","Acceso Removido a"],
															["type-update","Tipo de Usuario Modificado"],
															["open","aberta"], ["closed","cerrada"] ]);
		/*Actions performed on the following elements can trigger notificaions
		 Key: is used to validate an element can trigger a notificaciones
		 Value: will be used to build the Notification description*/
		let notifiableElements = new Map([ ["groups","Grupo"], ["members","Miembro"],
												 ["reports","Reporte"], ["weeks" ,"Semana"], ["users" ,"Usuario"] ]);

		/* Prepare the notification description using the Actions and elements maps*/
		let getNotificationDescription = function (action, onFolder, elementDesc) {
				let description = null;
				let element = null;
				if(elementDesc){
					element = notifiableElements.get(onFolder) + " " + elementDesc + " ";
				}else{
					element = notifiableElements.get(onFolder) + " ";
				}

				//Some messages have a different order in the description components
				if(action == "create" || action == "update" || action == "delete" ||
						action == "approved" || action == "rejected" || action == "open" || action == "closed"){
					//Ej. Grupo creado., Reporte Aprobado., Semana abierta.
					description = element + actionsDescMap.get(action)+".";
				}
				else if(action == "access-granted" || action == "access-deleted"){
					//Ej. Acceso Concedido a Grupo.
					description = actionsDescMap.get(action) + " " + element + ".";
				}
				else if(action == "type-update"){
					description = actionsDescMap.get(action);
				}
				else {
					description = element + "modificado.";
				}
				return description;
		};

		let getAdminUsers = function() {
			if(!$rootScope.allAdmins){
				$rootScope.allAdmins = $firebaseArray(adminUsersRef);
			}
			return $rootScope.allAdmins;
		};

		/*This is for the actual notification creation in the DB*/
		let pushNotification = function (userIdToNotify, notificationRecord){
			//Avoid sending notification to the user performing the action
			if(userIdToNotify != notificationRecord.fromId){
				let notKey = notificationsRef.child("list").child(userIdToNotify).push();
				notKey.set(notification);
				//TODO: Replace to Update Counter
				notificationsRef.child("metadata").child(userIdToNotify).child(notKey.key).set({readed:false});
			}
		};

		return {
			/* Main method used to send notifications. Currently is called only from Audit Service
			This notification is sent to all admins and to all parties with some interest
			in the element modified (creator, updator, approver, etc)
			actionPerformed: create, update, delete, approved, rejected
			onFolder: groups, members, reports, weeks, users, etc. */
			sendNotification: function(actionPerformed, onFolder, objectId, actionByUser, actionByUserId){
				var notifiableElement = notifiableElements.has(onFolder);
				if( notifiableElement ){
					let desc = getNotificationDescription(actionPerformed, onFolder, objectId);
					let notification = { action: actionPerformed, onFolder: onFolder, onObject: objectId,
														from: actionByUser, fromId: actionByUserId, readed: false,
														description: desc, time: firebase.database.ServerValue.TIMESTAMP }

					/* Send the notification only after the audit record is created/updated in the elment itself
						This is because the audit folder will help us to identify the parties we need to notify*/
					$firebaseObject(baseRef.child(onFolder).child(objectId).child("audit")).$loaded().then(function(audit) {
						/*array to control already notified users*/
						let notifiedUsers = new Array();
						/*Notify the User who created the element*/
						if(audit.createdById && audit.createdById != "System"){
							notifiedUsers.push(audit.createdById);
							pushNotification(audit.createdById, notification);
						}
						/*Notify the User who did the last update in the element, only if has not been notified already*/
						if(audit.lastUpdateById && notifiedUsers.indexOf(audit.lastUpdateById) < 0 ){
							notifiedUsers.push(audit.lastUpdateById);
							pushNotification(audit.lastUpdateById, notification);
						}
						/*Notify the User who approved the element (reports), only if has not been notified already*/
						if(audit.approvedById && notifiedUsers.indexOf(audit.approvedById) < 0 ){
							notifiedUsers.push(audit.approvedById);
							pushNotification(audit.approvedById, notification);
						}
						/*Notify the User who rejected the element (reports), only if has not been notified already*/
						if(audit.rejectedById && notifiedUsers.indexOf(audit.rejectedById) < 0 ){
							notifiedUsers.push(audit.rejectedById);
							pushNotification(audit.rejectedById, notification);
						}
						/*Notify all Admins with MemberId mapped, only if has not been notified already
						  TODO:Add notification according to their Preferences */
						getAdminUsers().$loaded().then(function(admins){
							admins.forEach(function(admin) {
								if(admin.memberId && notifiedUsers.indexOf(admin.$id) < 0){
									pushNotification(admin.$id, notification);
								}
							});
						});

					});

				}
			},
			//Sends notification to the specific receiver
			sendNotificationTo: function(receiver, action, onFolder, objectId, actionByUser, actionByUserId){
					let desc = getNotificationDescription(action,onFolder,objectId);
					let notification = { action: action, onFolder: onFolder, onObject: objectId,
														from: actionByUser, fromId: actionByUserId, readed: false,
														description: desc, time: firebase.database.ServerValue.TIMESTAMP }

					pushNotification(receiver, notification);
			},
			getNotificationsMetadata: function(userid) {
				return $firebaseArray(notificationsRef.child("metadata").child(userid));
			},
			getNotificationsForUser: function(userid) {
				return $firebaseArray(notificationsRef.child("list").child(userid));
			},
			markNotificacionReaded: function(userid,notificationId){
				notificationsRef.child("list").child(userid).child(notificationId).update({readed:true});
				notificationsRef.child("metadata").child(userid).child(notificationId).set({});
			},
			deleteNotification: function(userid,notificationId){
				notificationsRef.child("list").child(userid).child(notificationId).set({});
				notificationsRef.child("metadata").child(userid).child(notificationId).set({});
			},
			markReadedAllNotifications: function(userid,notificationId){
				let ref = notificationsRef.child("list").child(userid).orderByChild("readed").equalTo(false);
				let list = $firebaseArray(ref);
				list.$loaded().then(function(){
					list.forEach(function(notification) {
						notification.readed = true;
						list.$save(notification);
					});
				});
				notificationsRef.child("metadata").child(userid).set({});
			},
			deleteAllNotifications: function(userid,notificationId){
				notificationsRef.child("list").child(userid).set({});
				notificationsRef.child("metadata").child(userid).set({});
			}

		};
	}
]);
