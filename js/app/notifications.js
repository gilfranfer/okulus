/* Controller used only in the app config for the Notification Center (/notifications) */
okulusApp.controller('NotificationCenterCntrl', ['$rootScope','$scope','$firebaseAuth', '$location','AuthenticationSvc', 'NotificationsSvc',
	function($rootScope, $scope, $firebaseAuth, $location, AuthenticationSvc, NotificationsSvc){

		let noMemberPath = "/error/nomember"

		/*Executed everytime we enter to Notification Center*/
		$firebaseAuth().$onAuthStateChanged( function(authUser){
			if(!authUser) return;
			$scope.response = { loading:true, message: $rootScope.i18n.notifications.loading};
			AuthenticationSvc.loadSessionData(authUser.uid).$loaded().then(function (user) {
				if(user.memberId){
					/*Show notifications only when the user has a member assigned*/
					if(!$rootScope.allNotifications){
						$rootScope.allNotifications = NotificationsSvc.getFirstNotificationsForUser(authUser.uid, $rootScope.config.maxInitialNotifications);
					}
					$rootScope.allNotifications.$loaded().then(function(notifications) {
						$scope.response = null;
					})
					.catch( function(error){
						$scope.response = { error: true, message: $rootScope.i18n.notifications.loadingError };
						console.error(error);
					});
				}else{
					$location.path(noMemberPath);
				}
			});
		});

		/*Update the notification's "readed" value. For security, before any update,
		confirm the notification current "readed" value is different than the new one */
		$scope.readNotification = function(markReaded, notification){
			if(notification.readed != markReaded){
				let loggedUserId = $rootScope.currentSession.user.$id;
				NotificationsSvc.updateNotificationReadedStatus(loggedUserId,notification.$id,markReaded);
			}
		};

		/* Redirect the user to the correct location, according to the notification.
		  Update the notification's "readed" status to true*/
		$scope.openNotification = function(notification){
			$scope.readNotification(true,notification);
			$location.path("/"+notification.onFolder+"/details/"+notification.onObject);
		};

		/* Remove the notification from db */
		$scope.deleteNotification = function(notification){
			let loggedUserId = $rootScope.currentSession.user.$id;
			NotificationsSvc.deleteNotification(loggedUserId, notification);
		};

		$scope.deleteAllNotifications = function() {
			let loggedUserId = $rootScope.currentSession.user.$id;
			NotificationsSvc.deleteAllNotifications(loggedUserId);
		}

		$scope.readAllNotifications = function() {
			let loggedUserId = $rootScope.currentSession.user.$id;
			NotificationsSvc.readAllNotifications(loggedUserId);
		}

		$scope.loadAllNotifications = function() {
			$scope.response = { loading:true, message: $rootScope.i18n.notifications.loading};
			let loggedUserId = $rootScope.currentSession.user.$id;
			$rootScope.allNotifications = NotificationsSvc.getAllNotificationsForUser(loggedUserId);
			$rootScope.allNotifications.$loaded().then(function(notifications) {
				$scope.response = null;
				$rootScope.allNotificationsLoaded = true;
			})
			.catch( function(error){
				$scope.response = { error: true, message: $rootScope.i18n.notifications.loadingError };
				console.error(error);
			});
		}

}]);

okulusApp.factory('NotificationsSvc', ['$rootScope', '$firebaseArray', '$firebaseObject',
	function($rootScope, $firebaseArray, $firebaseObject){
		let baseRef = firebase.database().ref().child(rootFolder);
		let notificationsRef = firebase.database().ref().child(rootFolder).child('notifications');
		let usersRef = firebase.database().ref().child(rootFolder).child('users');
		let adminUsersRef = usersRef.orderByChild("type").equalTo("admin");
		let unreadNotificationsCounter = "counters/notifications/unreaded";
		let totalNotificationsCounter = "counters/notifications/total";

		/* Map with valida actions */
		let actionsDescMap = new Map([
						["create","creado"], ["update","actualizado"], ["delete","eliminado"],
						["approved","aprobado"], ["rejected","rechazado"],
						["access-granted","Acceso Concedido a"], ["access-deleted","Acceso Removido a"],
						["type-update","Tipo de Usuario Modificado"],
						["open","aberta"], ["closed","cerrada"], ["show","visible"], ["hide","oculta"],
					]);
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
						action == "approved" || action == "rejected" ||
						action == "open" || action == "closed" || action == "show" || action == "hide"){
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
			//In Prod, Avoid sending notification to the user performing the action
			if($rootScope.config.isProdEnv && userIdToNotify == notificationRecord.fromId) return;
			let notKey = notificationsRef.child("list").child(userIdToNotify).push();
			notKey.set(notificationRecord);
			increaseUnreadNotificationCounter(userIdToNotify);
			increaseTotalNotificationCounter(userIdToNotify);
		};

		/*returns the notification object to be persisted in DB*/
		let buildNotificationRecord = function(actionPerformed, onFolder, objectId, actionByUser, actionByUserId) {
			let desc = getNotificationDescription(actionPerformed, onFolder, objectId);
			let notification = { action: actionPerformed, onFolder: onFolder, onObject: objectId,
												from: actionByUser, fromId: actionByUserId, readed: false,
												description: desc, time: firebase.database.ServerValue.TIMESTAMP }
			return notification;
		};

		/*Using a Transaction with an update function to reduce the counter by 1 */
		let decreaseUnreadNotificationCounter = function(userid){
			let notifCounterRef = usersRef.child(userid).child(unreadNotificationsCounter);
			notifCounterRef.transaction(function(currentUnread) {
				if(currentUnread>0)
					return currentUnread - 1;
				return currentUnread;
			});
		};

		/*Using a Transaction with an update function to increase the counter by 1 */
		let increaseUnreadNotificationCounter = function(userid){
			let unreadNotifCounterRef = usersRef.child(userid).child(unreadNotificationsCounter);
			unreadNotifCounterRef.transaction(function(currentUnread) {
				// If counters/notifications has never been set, currentUnread will be null.
			  return currentUnread + 1;
			});
		};

		/*Using a Transaction with an update function to reduce the counter by 1 */
		let decreaseTotalNotificationCounter = function(userid){
			let totalNotifCounterRef = usersRef.child(userid).child(totalNotificationsCounter);
			totalNotifCounterRef.transaction(function(currentTotal) {
				if(currentTotal>0)
					return currentTotal - 1;
				return currentTotal;
			});
		};

		let increaseTotalNotificationCounter = function(userid){
			let totalNotifCounterRef = usersRef.child(userid).child(totalNotificationsCounter);
			totalNotifCounterRef.transaction(function(currentTotal) {
			  return currentTotal + 1;
			});
		};

		return {
			/* Main method used to send notifications. Currently is called only from Audit Service.
			This notification is sent to all admins and to all parties with some interest
			in the element modified (creator, updator, approver, etc).

			actionPerformed: create, update, delete, approved, rejected
			onFolder: groups, members, reports, weeks, users, etc.
			objectId: DB Refernce Id */
			notifyInterestedUsers: function(actionPerformed, onFolder, objectId, actionByUser, actionByUserId){
				var notifiableElement = notifiableElements.has(onFolder);
				if( notifiableElement ){
					let notification = buildNotificationRecord(actionPerformed, onFolder, objectId, actionByUser, actionByUserId);

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
								// console.log("notifying admins");
								if(admin.memberId && notifiedUsers.indexOf(admin.$id) < 0){
									pushNotification(admin.$id, notification);
								}
							});
						});

					});

				}
			},
			/*Used when we want to notify someone that is not part of the audit folder of an element
			For Example, when granting a user access to a gorup, we want to notify the user.*/
			notifySpecificUser: function(receiver, actionPerformed, onFolder, objectId, actionByUser, actionByUserId){
				let notification = buildNotificationRecord(actionPerformed, onFolder, objectId, actionByUser, actionByUserId);
				pushNotification(receiver, notification);
			},
			/*Return the list of notifications for specific user*/
			getAllNotificationsForUser: function(userid) {
				return $firebaseArray(notificationsRef.child("list").child(userid));
			},
			/*Return only the first notifications for specific user. The number is determined by count param*/
			getFirstNotificationsForUser: function(userid,count) {
				//console.log(userid);
				let reference = notificationsRef.child("list").child(userid).orderByKey().limitToLast(count);
				return $firebaseArray(reference);
			},
			/*Update the notification's "readed" value, and the User´s unreaded notifications counter */
			updateNotificationReadedStatus: function(userid, notificationId, isReaded){
				notificationsRef.child("list").child(userid).child(notificationId).update({readed:isReaded});
				if(isReaded){
					decreaseUnreadNotificationCounter(userid);
				}else{
					increaseUnreadNotificationCounter(userid);
				}
			},
			/*Delete the notification element, and reduce the counter*/
			deleteNotification: function(userid,notification){
				if(!notification.readed){
					decreaseUnreadNotificationCounter(userid);
				}
				decreaseTotalNotificationCounter(userid);
				notificationsRef.child("list").child(userid).child(notification.$id).set({});
			},
			/*Delete all notifications, and set the User's unreaded
				notifications counter to 0.*/
			deleteAllNotifications: function(userid){
				notificationsRef.child("list").child(userid).set({});
				let notifUnreadRef = usersRef.child(userid).child(unreadNotificationsCounter);
				notifUnreadRef.transaction(function(currentUnread){ return 0; });
				let notifTotalRef = usersRef.child(userid).child("counters/notifications/total");
				notifTotalRef.transaction(function(currentTotal){ return 0; });
			},
			/*Set all notifications' "readed" value as true, and set the User's unreaded
				notifications counter to 0.*/
			readAllNotifications: function(userid){
				//get only the notifications that are not readed
				let ref = notificationsRef.child("list").child(userid).orderByChild("readed").equalTo(false);
				let list = $firebaseArray(ref);
				list.$loaded().then(function(){
					list.forEach(function(notification) {
						notification.readed = true;
						list.$save(notification);
					});
				});

				let notifCounterRef = usersRef.child(userid).child(unreadNotificationsCounter);
				notifCounterRef.transaction(function(currentUnread){ return 0; });
			},
			/*TODO: Remove after migration. Assign specific number to the notification counter and
			Removing the metadata folder.*/
			setTotalUnreadNotifications: function(userid, total){
				notificationsRef.child("metadata").child(userid).set({});
				let notifCounterRef = usersRef.child(userid).child(unreadNotificationsCounter);
				notifCounterRef.transaction(function(currentUnread){ return total; });
			},
			setTotalNotifications: function(userid, total){
				let notifTotalRef = usersRef.child(userid).child(totalNotificationsCounter);
				notifTotalRef.transaction(function(currentTotal){ return total; });
			}
		};
	}
]);
