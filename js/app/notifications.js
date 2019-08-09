/* Controller used only in the app config for the Notification Center (/notifications) */
okulusApp.controller('NotificationCenterCntrl',
	['$rootScope','$scope','$firebaseAuth', '$location','AuthenticationSvc', 'NotificationsSvc',
	function($rootScope, $scope, $firebaseAuth, $location, AuthenticationSvc, NotificationsSvc){

		/*Executed everytime we enter to Notification Center*/
		$firebaseAuth().$onAuthStateChanged( function(authUser){
			if(!authUser) return;
			$scope.response = { loading:true, message: $rootScope.i18n.notifications.loading};
			AuthenticationSvc.loadSessionData(authUser.uid).$loaded().then(function (user) {
				if(!user.isValid){
					$rootScope.response = { error:true, message: systemMsgs.error.noMemberAssociated};
					$location.path(constants.pages.error);
					return;
				}
				/*Show notifications only when the user has a member assigned*/
				if(!$rootScope.allNotifications){
					$rootScope.allNotifications = NotificationsSvc.getFirstNotificationsForUser(authUser.uid, $rootScope.config.maxQueryListResults);
				}
				$rootScope.allNotifications.$loaded().then(function(notifications) {
					$scope.response = null;
				})
				.catch( function(error){
					$scope.response = { error: true, message: $rootScope.i18n.notifications.loadingError };
					console.error(error);
				});

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

okulusApp.factory('NotificationsSvc',
	['$rootScope', '$firebaseArray', '$firebaseObject',
	function($rootScope, $firebaseArray, $firebaseObject){
		let baseRef = firebase.database().ref().child(constants.db.folders.root);
		let usersRef = baseRef.child( constants.db.folders.usersList );
		let notificationsRef = baseRef.child(constants.db.folders.notificationsList);
		let adminUsersRef = usersRef.orderByChild(constants.roles.type).equalTo(constants.roles.admin);

		/* Prepare the notification description using the Actions and elements maps*/
		let getNotificationDescription = function (action, onFolder, elementDesc) {
				let description = null;
				let element = notifiableElements.get(onFolder) + " ";;

				//Add the week Id
				if(elementDesc && onFolder== constants.db.folders.weeks){
					element += elementDesc + " ";
				}

				let actions = constants.actions;
				//Some messages have a different order in the description components
				if(action == actions.create || action == actions.update || action == actions.delete ||
						action == actions.approve || action == actions.reject ||
						action == actions.open || action == actions.close ||
						action == actions.show || action == actions.hide){
					//Ej. Grupo creado., Reporte Aprobado., Semana abierta.
					description = element + actionsDescMap.get(action)+".";
				}
				else if(action == actions.grantAccess || action == actions.revokeAccess){
					//Ej. Acceso Concedido a Grupo.
					description = actionsDescMap.get(action) + " " + element + ".";
				}
				else if(action == actions.updateRole){
					description = actionsDescMap.get(action);
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
			if(constants.config.isProdEnv && userIdToNotify == notificationRecord.fromId) return;
			let notKey = notificationsRef.child(userIdToNotify).push();
			notKey.set(notificationRecord);
			increaseUnreadNotificationCounter(userIdToNotify);
			increaseTotalNotificationCounter(userIdToNotify);
		};

		/*returns the notification object to be persisted in DB*/
		let buildNotificationRecord = function(actionPerformed, onFolder, objectId, actionByUser, actionByUserId, description) {
			if(!description){
				description = getNotificationDescription(actionPerformed, onFolder, objectId);
			}
			let notification = { action: actionPerformed, onFolder: onFolder, onObject: objectId,
												from: actionByUser, fromId: actionByUserId, readed: false,
												description: description, time: firebase.database.ServerValue.TIMESTAMP }
			return notification;
		};

		/*Using a Transaction with an update function to reduce the counter by 1 */
		let decreaseUnreadNotificationCounter = function(userid){
			let notifCounterRef = usersRef.child(userid).child(constants.db.folders.unredNotifCount);
			notifCounterRef.transaction(function(currentUnread) {
				if(currentUnread>0)
					return currentUnread - 1;
				return currentUnread;
			});
		};

		/*Using a Transaction with an update function to increase the counter by 1 */
		let increaseUnreadNotificationCounter = function(userid){
			let unreadNotifCounterRef = usersRef.child(userid).child(constants.db.folders.unredNotifCount);
			unreadNotifCounterRef.transaction(function(currentUnread) {
				// If counters/notifications has never been set, currentUnread will be null.
			  return currentUnread + 1;
			});
		};

		/*Using a Transaction with an update function to reduce the counter by 1 */
		let decreaseTotalNotificationCounter = function(userid){
			let totalNotifCounterRef = usersRef.child(userid).child(constants.db.folders.totalNotifCount);
			totalNotifCounterRef.transaction(function(currentTotal) {
				if(currentTotal>0)
					return currentTotal - 1;
				return currentTotal;
			});
		};

		let increaseTotalNotificationCounter = function(userid){
			let totalNotifCounterRef = usersRef.child(userid).child(constants.db.folders.totalNotifCount);
			totalNotifCounterRef.transaction(function(currentTotal) {
			  return currentTotal + 1;
			});
		};

		/* Get's the sender details (id and email) from the current session */
		let getNotificationSender = function() {
			let sender = {};
			let session = $rootScope.currentSession;
			if(!session || !session.user){
				sender.from = "System";
				sender.id=null;
			} else if (session && session.user.isRoot){
				sender.from = "Root";
				sender.id = session.user.$id;
			} else {
				sender.from = session.user.email;
				sender.id = session.user.$id;
			}
			return sender;
		};

		return {
			/* Main method used to send notifications. Currently is called only from Audit Service.
			This notification is sent to all admins and to all parties with some interest
			in the element modified (creator, updator, approver, etc).

			actionPerformed: create, update, delete, approved, rejected
			onFolder: groups, members, reports, weeks, users, etc.
			objectId: DB Refernce Id */
			notifyInterestedUsers: function(actionPerformed, onFolder, objectId, actionByUser, actionByUserId, description){
				let notifiableElement = notifiableElements.has(onFolder);
				if( notifiableElement ){
					let notification = buildNotificationRecord(actionPerformed, onFolder, objectId, actionByUser, actionByUserId,description);

					/* Send the notification only after the audit record is created/updated in the elment itself
						This is because the audit folder will help us to identify the parties we need to notify
						TODO: add child(onFolder).child("details")*/
					$firebaseObject(baseRef.child(onFolder).child(objectId).child(constants.db.folders.audit)).$loaded().then(function(audit) {
						/*array to control already notified users*/
						let notifiedUsers = new Array();
						/*Notify the User who created the element*/
						if(audit.createdById && audit.createdById != constants.roles.system){
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
			/*Used when we want to notify someone that is not part of the audit folder of an element
			For Example, when granting a user access to a gorup, we want to notify the user.*/
			notifySpecificUser: function(receiver, actionPerformed, onFolder, objectId){
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
				let notification = buildNotificationRecord(actionPerformed, onFolder, objectId, user, userId);
				pushNotification(receiver, notification);
			},
			/* Send notification to all valid system adminis
			 notification = { description: description, action: actionPerformed, onFolder: onFolder, onObject: objectId } */
			notifyAdmins: function( notification ){
			  let sender = getNotificationSender();
				notification.readed = false;
				notification.time = firebase.database.ServerValue.TIMESTAMP;
				notification.from = sender.from;
				notification.fromId = sender.id;
				getAdminUsers().$loaded().then(function(admins){
					admins.forEach(function(adminUser){
						if(adminUser.isValid){
							pushNotification(adminUser.$id, notification);
						}
					});
				});
			},
			/*Return the list of notifications for specific user*/
			getAllNotificationsForUser: function(userid) {
				return $firebaseArray(notificationsRef.child(userid));
			},
			/*Return only the first notifications for specific user. The number is determined by count param*/
			getFirstNotificationsForUser: function(userid,count) {
				//console.log(userid);
				let reference = notificationsRef.child(userid).orderByKey().limitToLast(count);
				return $firebaseArray(reference);
			},
			/*Update the notification's "readed" value, and the User´s unreaded notifications counter */
			updateNotificationReadedStatus: function(userid, notificationId, isReaded){
				notificationsRef.child(userid).child(notificationId).update({readed:isReaded});
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
				notificationsRef.child(userid).child(notification.$id).set({});
			},
			/*Delete all notifications, and set the User's unreaded
				notifications counter to 0.*/
			deleteAllNotifications: function(userid){
				notificationsRef.child(userid).set({});
				let notifUnreadRef = usersRef.child(userid).child(constants.db.folders.unredNotifCount);
				notifUnreadRef.transaction(function(currentUnread){ return 0; });
				let notifTotalRef = usersRef.child(userid).child(constants.db.folders.totalNotifCount);
				notifTotalRef.transaction(function(currentTotal){ return 0; });
			},
			/*Set all notifications' "readed" value as true, and set the User's unreaded
				notifications counter to 0.*/
			readAllNotifications: function(userid){
				//get only the notifications that are not readed
				let ref = notificationsRef.child(userid).orderByChild(constants.status.readed).equalTo(false);
				let list = $firebaseArray(ref);
				list.$loaded().then(function(){
					list.forEach(function(notification) {
						notification.readed = true;
						list.$save(notification);
					});
				});

				let notifCounterRef = usersRef.child(userid).child(constants.db.folders.unredNotifCount);
				notifCounterRef.transaction(function(currentUnread){ return 0; });
			},
			/*TODO: Remove after migration. Assign specific number to the notification counter and
			Removing the metadata folder.*/
			setTotalUnreadNotifications: function(userid, total){
				//notificationsRef.child("metadata").child(userid).set({});
				let notifCounterRef = usersRef.child(userid).child(constants.db.folders.unredNotifCount);
				notifCounterRef.transaction(function(currentUnread){ return total; });
			},
			setTotalNotifications: function(userid, total){
				let notifTotalRef = usersRef.child(userid).child(constants.db.folders.totalNotifCount);
				notifTotalRef.transaction(function(currentTotal){ return total; });
			}
		};
	}
]);
