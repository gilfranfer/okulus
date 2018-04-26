/* Controller linked to /chats */
okulusApp.controller('NotificationCntrl', ['$rootScope','$scope','$firebaseAuth', '$location','AuthenticationSvc', 'NotificationsSvc',
	function($rootScope, $scope, $firebaseAuth, $location, AuthenticationSvc, NotificationsSvc){

		$firebaseAuth().$onAuthStateChanged( function(authUser){ if(authUser){
			AuthenticationSvc.loadSessionData(authUser.uid).$loaded().then(function (user) {
				if(!user.memberId){
					$location.path("/error/nomember");
					return;
				}
				$scope.loading = true;
				$scope.allNotifications = NotificationsSvc.getNotificationsForUser(authUser.uid);
				$scope.allNotifications.$loaded().then(function(notifications) {
					$scope.loading = false;
				});
			});

		}});

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

		let getNotificationDescription = function (action,onFolder,objectId) {
				let description = "";

				if(onFolder == "groups"){
					description = "Grupo ";
				}else if(onFolder == "members"){
					description = "Miembro ";
				}else if(onFolder == "reports"){
					description = "Reporte ";
				}else if(onFolder == "weeks"){
					description = "Semana "+objectId+" ";
				}else if(onFolder == "users"){
					description = "Usuario ";
				}

				if(action == "create"){
					description += "creado";
				}else if(action == "update"){
					description += "actualizado";
				}else if(action == "delete"){
					description += "eliminado";
				}
				//report
				else if(action == "approved"){
					description += "aprobado";
				}else if(action == "rejected"){
					description += "rechazado";
				}
				//groups access
				else if(action == "access-granted"){
					description = "Acceso Concedido a " + description;
				}else if(action == "access-deleted"){
					description = "Acceso Removido a " + description;
				}
				//user type
				else if(action == "type-update"){
					description = "Tipo de Usuario Modificado";
				}
				//weeks
				else if(action == "open"){
					description += "abierta";
				}else if(action == "closed"){
					description += "cerrada";
				}
				else {
					description += "modificado";
				}
				return description;
		};

		let getAdminUsers = function() {
			if(!$rootScope.allAdmins){
				$rootScope.allAdmins = $firebaseArray(adminUsersRef);
			}
			return $rootScope.allAdmins;
		};

		let createNotification = function (notificationFor, notification){
			// console.debug("Creating notification for",notificationFor, notification.fromId);
			if(notificationFor != notification.fromId){
				//Do not send notification to the user performing the action
				let notKey = notificationsRef.child("list").child(notificationFor).push();
				notKey.set(notification);
				notificationsRef.child("metadata").child(notificationFor).child(notKey.key).set({readed:false});
			}

		};

		return {
			//This notification is sent to all admins and involved parties (creator, updator, apprver, etc)
			sendNotification: function(action, onFolder, objectId, actionByUser, actionByUserId){
				if( onFolder == "groups" || onFolder == "members" || onFolder == "reports"
						|| onFolder == "weeks" || onFolder == "users" ){

					let desc = getNotificationDescription(action,onFolder,objectId);
					let notification = { action: action, onFolder: onFolder, onObject: objectId,
														from: actionByUser, fromId: actionByUserId, readed: false,
														description: desc, time: firebase.database.ServerValue.TIMESTAMP }

					$firebaseObject(baseRef.child(onFolder).child(objectId).child("audit")).$loaded().then(function(audit) {

						if(audit.createdById && audit.createdById != "System"){
							createNotification(audit.createdById, notification);
						}
						if(audit.lastUpdateById && audit.lastUpdateById != audit.createdById){
							createNotification(audit.lastUpdateById, notification);
						}
						if(audit.approvedById && audit.approvedById != audit.createdById && audit.approvedById != audit.lastUpdateById){
							createNotification(audit.approvedById, notification);
						}
						if(audit.rejectedById && audit.rejectedById != audit.createdById
									&& audit.rejectedById != audit.lastUpdateById && audit.rejectedById != audit.approvedById){
							createNotification(audit.rejectedById, notification);
						}

						/* Notify all Admins with MemberId mapped. Avoid duplication of notification.
						  Add notification according to their Preferences */
						getAdminUsers().$loaded().then(function(admins){
							admins.forEach(function(admin) { if(admin.memberId){
									let notifyAdmin = admin.$id != audit.createdById && admin.$id != audit.lastUpdateById && admin.$id != audit.approvedById && admin.$id != audit.rejectedById;
									//let notifyAdmin = ; //TO-DO: check in user notification preferences
									if(notifyAdmin){
										createNotification(admin.$id, notification);
									}
							}});
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

					createNotification(receiver, notification);
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
