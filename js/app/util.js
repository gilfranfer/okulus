
okulusApp.factory('CountersSvc',
['$rootScope', '$firebaseArray', '$firebaseObject',
	function($rootScope, $firebaseArray, $firebaseObject){
		let baseRef = firebase.database().ref().child(constants.db.folders.root);
		let globalCountersRef = baseRef.child(constants.db.folders.counters);
		let usersCountersRef = baseRef.child(constants.db.folders.userCounters);

		/*Using a Transaction with an update function to reduce the counter by 1 */
		let decreaseCounter = function(counterRef){
			counterRef.transaction(function(currentCount) {
				if(currentCount>0)
					return currentCount - 1;
				return currentCount;
			});
		};

		/*Using a Transaction with an update function to increase the counter by 1 */
		let increaseCounter = function(counterRef){
			counterRef.transaction(function(currentCount) {
				return currentCount + 1;
			});
		};

		return {
			setInitialCounters: function(){
				let counters = {
					errors:{systemErrors:0},
					groups:{active:0, total:0},
					members:{active:0, total:0, hosts:0, leads:0, trainees:0},
					reports:{approved:0, pending:0, rejected:0, total:0},
					requests:{members:{approved:0, pending:0, rejected:0, total:0}},
					users:{active:1, total:1, root:1, admin:0, user:0},
					weeks:{open:0, visible:0, total:0}
				};
				globalCountersRef.set(counters);
			},
			getGlobalCounters: function(){
				return $firebaseObject(globalCountersRef);
			},
			getUsersGlobalCounters: function(){
				return $firebaseObject(usersCountersRef);
			},
			/*** Users ***/
			/* increaseTotalUsers: Called After User Creation. Increase the count of:
			 - Total Users, - Active users, - User type  */
			increaseTotalUsers: function(userType){
				increaseCounter(usersCountersRef.child(constants.db.fields.total));
				increaseCounter(usersCountersRef.child(constants.db.fields.active));
				if(userType){
					increaseCounter(usersCountersRef.child(userType));
				}
			},
			increaseActiveUsers: function(){
				increaseCounter(usersCountersRef.child(constants.db.fields.active));
			},
			decreaseActiveUsers: function(){
				decreaseCounter(usersCountersRef.child(constants.db.fields.active));
			},
			increaseAdminUsers: function(){
				increaseCounter(usersCountersRef.child(constants.db.fields.admin));
			},
			decreaseAdminUsers: function(){
				decreaseCounter(usersCountersRef.child(constants.db.fields.admin));
			},
			increaseNormalUsers: function(){
				increaseCounter(usersCountersRef.child(constants.db.fields.user));
			},
			decreaseNormalUsers: function(){
				decreaseCounter(usersCountersRef.child(constants.db.fields.user));
			}
		};

}]);

okulusApp.factory('AuditSvc',
	['$rootScope', 'ErrorsSvc', 'NotificationsSvc',
	function($rootScope, ErrorsSvc, NotificationsSvc){
		let baseRef = firebase.database().ref().child(constants.db.folders.root);

		/* Get's the user id and email from the current session, taking in consideration
		 sometimes the user can be root or even the system itself */
		let getUserDetails = function() {
			let user = {};
			let session = $rootScope.currentSession;
			if(!session || !session.user){
				user.id = null;
				user.email = null;
				user.name = constants.roles.systemName;
			} else {
				user.id = session.user.$id;
				user.email = session.user.email;
				user.name = session.user.shortname;
			}
			return user;
		};

		return {
			/**
			 * action: Action performed by the user (create, delete, update, etc)
			 * objectFolder: The folder where the action was performed (members, users, groups, reports, etc)
			 * objectId: The id of the object where the action was performed
			 * description: Description of the action performed. It will be saved in the audit, and used for the notification
			 * sendNotification: Optional true or false do determine wheter a notification will be triggered for this action
			 * Returns a reference to the audit folder created in the object
			 */
			saveAuditAndNotify: function(action, objectFolder, objectId, description, avoidNotification){
				let user = getUserDetails();
				let timestamp = firebase.database.ServerValue.TIMESTAMP;
				let objectAuditRef = baseRef.child(objectFolder).child(constants.db.folders.details).child(objectId).child(constants.db.folders.audit);

				if(action == constants.actions.delete){
					//no need to save the audit in the object, because it was already removed from DB
				}else if(action == constants.actions.create){
					objectAuditRef.set( {createdById:user.id, createdByName:user.name, createdByEmail:user.email, createdOn:timestamp, description: description} );
				}else{
					objectAuditRef.update( {lastUpdateById:user.id, lastUpdateByName:user.name, lastUpdateByEmail:user.email, lastUpdateOn:timestamp, description: description} );
				}

				//Additional Audit fields only For Reports
				if(objectFolder == constants.db.folders.reports){
					if(action == constants.actions.create || action == constants.actions.update){
						objectAuditRef.update(
							{ approvedById: null, approvedByName: null, approvedByEmail: null, approvedOn: null,
								rejectedById: null, rejectedByName: null, rejectedByEmail: null, rejectedOn: null
							});
					}else if(action == constants.actions.approve){
						objectAuditRef.update(
							{approvedById:user.id, approvedByName:user.name, approvedByEmail: user.email, approvedOn: timestamp,
								rejectedById: null, rejectedByName: null, rejectedByEmail: null, rejectedOn: null
							});
					}else if( action == constants.actions.reject){
						objectAuditRef.update(
							{approvedById: null, approvedByName:null, approvedByEmail: null, approvedOn: null,
								rejectedById: user.id, rejectedByName:user.name, rejectedByEmail: user.email, rejectedOn: timestamp
							});
					}
				}

				if(!avoidNotification){
					NotificationsSvc.notifyInvolvedParties(action, objectFolder, objectId, description, null);
				}
				return objectAuditRef;
			}
		};
	}
]);

okulusApp.factory('MigrationSvc',
['$rootScope', '$firebaseArray', '$firebaseObject', 'GroupsSvc',
	function($rootScope, $firebaseArray, $firebaseObject, GroupsSvc){

		let baseRef = firebase.database().ref().child(constants.db.folders.root);
		let memberListRef = baseRef.child(constants.db.folders.membersList);
		let membersRef = baseRef.child(constants.db.folders.members);
		let groupsRef = baseRef.child(constants.db.folders.groups);

		return {
			migrateMembers: function(groups) {
				let hostCount = 0;
				let leadCount = 0;
				let traineeCount = 0;
				let totalCount = 0;
				let memberFolderCount = 0;
				let activeCount = 0;
				let memberCountersRef = baseRef.child(constants.db.folders.membersCounters);
				let membersListRef = baseRef.child(constants.db.folders.membersList);
				let membersDetailsRef = baseRef.child(constants.db.folders.membersDetails);
				let membersList = $firebaseArray(membersRef.orderByKey());

				membersList.$loaded().then(function(list){
					list.forEach(function(member) {
						if(member.$id != "list" && member.$id != "details"){
							//Move /audit, /access, /attendance, /address into /details
							let detailsRecord = {};
							if(member.access){
								detailsRecord.access = member.access;
							}
							if(member.audit){
								detailsRecord.audit = member.audit;
							}
							if(member.attendance){
								detailsRecord.attendance = member.attendance;
							}
							if(member.address){
								detailsRecord.address = member.address;
							}
							membersDetailsRef.child(member.$id).set(detailsRecord);

							//Merge /user with /member and place in /list
							let basicRecord = member.member;
							if(basicRecord){
								basicRecord.isActive = (basicRecord.status == "active");
								basicRecord.canBeUser = null;
								basicRecord.status = null;
								if(basicRecord.baseGroup){
									basicRecord.baseGroupId = basicRecord.baseGroup;
									basicRecord.baseGroupName = groups.$getRecord(basicRecord.baseGroup).group.name;
									basicRecord.baseGroup = null;
								}
								if(basicRecord.birthdate){
									let dayString = (basicRecord.birthdate.day<10)?"0"+basicRecord.birthdate.day:basicRecord.birthdate.day;
									let monthString = (basicRecord.birthdate.month<10)?"0"+basicRecord.birthdate.month:basicRecord.birthdate.month;
									basicRecord.bday = basicRecord.birthdate.year+"-"+monthString+"-"+dayString;
									basicRecord.birthdate = null;
								}
								if(member.user && member.user.userId){
									basicRecord.isUser = true;
									basicRecord.userId = member.user.userId;
								}
								if(!basicRecord.isActive){
									basicRecord.isHost = false;
									basicRecord.isLeader = false;
									basicRecord.isTrainee = false;
								}else{
									activeCount++;
								}
								if(basicRecord.isHost){
									hostCount++;
								}
								if(basicRecord.isLeader){
									leadCount++;
								}
								if(basicRecord.isTrainee){
									traineeCount++;
								}
								membersListRef.child(member.$id).set(basicRecord);
								memberFolderCount++;
							}else{
								console.error("No member folder",member.$id);
							}
							totalCount++;
						}
					});
					console.debug("List Size:",list.length);
					console.debug("Total Members:",totalCount);
					console.debug("With member folder",memberFolderCount);
					console.debug("Active:",activeCount);
					console.debug("Hosts:",hostCount);
					console.debug("Leads:",leadCount);
					console.debug("Trainees:",traineeCount);
					memberCountersRef.set({active:activeCount,hosts:hostCount,leads:leadCount,total:totalCount, trainees:traineeCount});
				});
			},
			migrateGroups: function(members) {

				let totalCount = 0;
				let activeCount = 0;
				let groupFolderCount = 0;

				let groupsCountersRef = baseRef.child(constants.db.folders.groupsCounters);
				let groupsListRef = baseRef.child(constants.db.folders.groupsList);
				let groupsDetailsRef = baseRef.child(constants.db.folders.groupsDetails);
				let groupsList = $firebaseArray(groupsRef.orderByKey());

				groupsList.$loaded().then(function(list){
					list.forEach(function(group){
						if(group.$id != "list" && group.$id != "details"){
							// /access, /audit, /reports create /roles
							let detailsRecord = {};

							if(group.access){
								detailsRecord.access = group.access;
							}
							if(group.audit){
								detailsRecord.audit = group.audit;
							}
							if(group.reports){
								detailsRecord.reports = group.reports;
							}
							detailsRecord.roles = {};
							if(group.group.leadId){
								detailsRecord.roles.leadId = group.group.leadId;
								detailsRecord.roles.leadName = members.$getRecord(group.group.leadId).shortname;
								group.group.leadId = null;
							}
							if(group.group.hostId){
								detailsRecord.roles.hostId = group.group.hostId;
								detailsRecord.roles.hostName = members.$getRecord(group.group.hostId).shortname;
								group.group.hostId = null;
							}
							groupsDetailsRef.child(group.$id).set(detailsRecord);

							// basicRecord ( /group, /schedule, /address )
							let basicRecord = group.group;
							if(!basicRecord){
								console.error("No group folder",group.$id);
								basicRecord = {};
							}
							if(group.address){
								basicRecord.address = group.address;
							}
							if(group.schedule){
								basicRecord.weekday = group.schedule.weekday;
								let minutesText = (group.schedule.time.MM<10)?("0"+group.schedule.time.MM):group.schedule.time.MM;
								basicRecord.time = group.schedule.time.HH +":"+minutesText;
							}
							basicRecord.isActive = (basicRecord.status == "active");
							basicRecord.status = null;

							groupsListRef.child(group.$id).set(basicRecord);

							if(basicRecord.isActive){
								activeCount++;
							}
							totalCount++;
						}
					});
					console.debug("List Size:",list.length);
					console.debug("Total Groups:",totalCount);
					console.debug("Active:",activeCount);
					groupsCountersRef.set({active:activeCount,total:totalCount});
				});
			},
			getAllGroups: function(){
				return $firebaseArray(groupsRef);
			},
			getMembersList: function(){
				return $firebaseArray(memberListRef.orderByKey());
			}
		};
}]);
