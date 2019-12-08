okulusApp.controller('MigrationCntrl',
	['$rootScope','$scope','$location','$firebaseArray','$firebaseObject','$firebaseAuth',
		'AuditSvc','AuthenticationSvc','MembersSvc', 'CountersSvc', 'GroupsSvc', 'WeeksSvc', 'ReportsSvc',
	function($rootScope, $scope,$location, $firebaseArray, $firebaseObject,$firebaseAuth,
		AuditSvc,AuthenticationSvc,MembersSvc,CountersSvc,GroupsSvc,WeeksSvc,ReportsSvc){

		/*Executed when accessing to /admin/monitor, to confirm the user still admin*/
		$firebaseAuth().$onAuthStateChanged( function(authUser){
    	if(authUser){
				AuthenticationSvc.loadSessionData(authUser.uid).$loaded().then(function (user) {
					if(user.type == constants.roles.user){
						$rootScope.response = {error:true, showHomeButton: true, message:systemMsgs.error.noPrivileges};
						$location.path(constants.pages.error);
					}
				});
			}
		});

    let okulusDataRef = firebase.database().ref().child("okulus");
    let oldDataRef = firebase.database().ref().child("pibxalapa");
    let newDataRef = firebase.database().ref().child("okulus/data");
    let allowedEmailsRef = firebase.database().ref().child("okulus/allowedEmails");

    $scope.loadOldData = function(){
      $scope.existingReports = $firebaseArray(oldDataRef.child("reports"));
      $scope.existingUsers = $firebaseArray(oldDataRef.child("users"));
      $scope.existingWeeks = $firebaseArray(oldDataRef.child("weeks"));
      $scope.existingMembers = $firebaseArray(oldDataRef.child("members"));
      $scope.existingGroups = $firebaseArray(oldDataRef.child("groups"));

      $scope.existingReports.$loaded().then(function(reports){
        console.log(reports.length," Reports Loaded");
      });
      $scope.existingUsers.$loaded().then(function(userd){
        console.log(userd.length," Users Loaded");
      });
      $scope.existingWeeks.$loaded().then(function(weeks){
        console.log(weeks.length," Weeks Loaded");
      });
      $scope.existingMembers.$loaded().then(function(members){
        console.log(members.length," Members Loaded");
      });
      $scope.existingGroups.$loaded().then(function(groups){
        console.log(groups.length," Groups Loaded");
      });
    };

    /* USER MIGRATION FUNCTIONS (Execute First)*/
		$scope.migrateUsers = function () {
      console.debug("Init Users Migration");
      let userListRef = newDataRef.child("users").child("list");
      let userDetailRef = newDataRef.child("users").child("details");

      $scope.existingUsers.$loaded().then(function(users) {
        console.log(users.length,"Users Loaded");
        let timestamp = firebase.database.ServerValue.TIMESTAMP;
        users.forEach(function(user){
          //Create record in /users/list/>memberId>
          let newUser = buildUser(user);
          userListRef.child(user.$id).set(newUser);
          CountersSvc.increaseTotalUsers(newUser.type);
          if(!newUser.isActive){
            CountersSvc.decreaseActiveUsers();
          }
          //Create record in /users/details/>memberId>/audit
          let audit = buildUserAudit(user.audit, timestamp);
          userDetailRef.child(user.$id).child("audit").set(audit);
          //Update Allowed allowedEmails
          if(newUser.memberId){
            allowedEmailsRef.child(newUser.memberId).set({email:newUser.email});
          }
        });
        console.log("Users Migration Completed");
      });

    };

    buildUser = function(oldUser){
      // let timestamp = firebase.database.ServerValue.TIMESTAMP;
      let record = {
        email: oldUser.email, //isActive
        lastActivityOn: oldUser.lastActivityOn,
        lastLoginOn: oldUser.lastLogin,
        //memberId: oldUser.memberId, shortname
        sessionStatus: oldUser.sessionStatus,
        type: oldUser.type,
        counters:{
          notifications:{total:0},
          reports:{approved:0, pending:0, rejected:0, total:0},
          requests:{members:{approved:0, pending:0, rejected:0, total:0}}
        }
      };

      //Get Updated Member shortname
      if(oldUser.isRoot){
        //record.memberId = null;
        record.shortname = constants.roles.rootName;
        record.isActive = true;
        record.type = constants.roles.root;
      }else if(oldUser.memberId){
        let memberObj = $scope.existingMembers.$getRecord(oldUser.memberId);
        record.memberId = oldUser.memberId;
        record.shortname = memberObj.member.shortname;
        record.isActive = true;
      }else{
        //record.memberId = null;
        //record.shortname = null;
        record.isActive = false;
      }
      return record;
    };

    buildUserAudit = function(oldAudit, timestamp){
      let user = $rootScope.currentSession.user;
      return {createdByName:oldAudit.createdBy, createdOn: oldAudit.createdOn,
        description: systemMsgs.notifications.userMigrated,
        lastUpdateByEmail: user.email, lastUpdateById: user.$id,
        lastUpdateByName: user.shortname, lastUpdateOn: timestamp};
    };

    /* GROUPS MIGRATION FUNCTION (Execute Second)*/
    $scope.migrateGroups = function() {
			console.debug("Init Groups Migration!");
      let listRef = newDataRef.child(constants.db.folders.groupsList);
			let detailsRef = newDataRef.child(constants.db.folders.groupsDetails);

      $scope.existingGroups.$loaded().then(function(groups){
        console.log(groups.length,"Groups Loaded");
        groups.forEach(function(group){
          let groupObj = {};
          let detailsRecord = {};
          let auditObj = {};

          groupObj.name = group.group.name;
          groupObj.number = group.group.number;
          if(group.group.phone){
            groupObj.phone = group.group.phone;
          }
          if(group.group.email){
            groupObj.email = group.group.email;
          }
          if(group.group.status == "active"){
            groupObj.isActive = true;
            GroupsSvc.increaseActiveGroupsCount();
          }else{
            groupObj.isActive = false;
          }

          if(group.schedule.time.MM == 0){
            groupObj.time = group.schedule.time.HH+":00";
          }else{
            groupObj.time = group.schedule.time.HH+":"+group.schedule.time.MM;
          }
          groupObj.type = group.group.type;
          groupObj.weekDay = group.schedule.weekday;
          groupObj.address = group.address;

          //Reports
          if(group.reports){
            groupObj.reports = Object.keys(group.reports).length;
            // detailsRef.child(group.$id).child("reports").set(group.reports);
          }

          listRef.child(group.$id).set(groupObj);
          GroupsSvc.increaseTotalGroupsCount();

          //Group details
          //Audit
          let user = $rootScope.currentSession.user;
          let timestamp = firebase.database.ServerValue.TIMESTAMP;
          auditObj.createdById = group.audit.createdById;
          auditObj.createdByName = group.audit.createdBy;
          auditObj.createdByEmail = group.audit.createdBy;
          auditObj.createdOn =  group.audit.createdOn;
          auditObj.description =  systemMsgs.notifications.groupMigrated;
          auditObj.lastUpdateByEmail =  user.email;
          auditObj.lastUpdateById =  user.$id;
          auditObj.lastUpdateByName = user.shortname;
          auditObj.lastUpdateOn =  timestamp;
          detailsRef.child(group.$id).child("audit").set(auditObj);

          //Roles
          let rolesObj = {};
          if(group.group.leadId){
            let member = $scope.existingMembers.$getRecord(group.group.leadId);
            if(member){
              rolesObj.leadId = group.group.leadId;
              rolesObj.leadName = member.member.shortname;
            }
          }
          if(group.group.hostId){
            let member = $scope.existingMembers.$getRecord(group.group.hostId);
            if(member){
              rolesObj.hostId = group.group.hostId;
              rolesObj.hostName = member.member.shortname;
            }
          }
          detailsRef.child(group.$id).child("roles").set(rolesObj);

          //Access
          if(group.access){
            let rules = Object.values(group.access);
            let ruleIds = Object.keys(group.access);

            rules.forEach(function(rule,index){
              // console.log(index,ruleIds[index],rule);
              let member = $scope.existingMembers.$getRecord(rule.memberId);

              //Get the User Id from users, using the email in the rule
              let userSearch = $firebaseObject(oldDataRef.child("users").orderByChild("email").equalTo(member.member.email).limitToLast(1));
              userSearch.$loaded().then(function(u){
                let keys = Object.keys(u);
                let userIdFromUser = keys[4];

                // console.log(user);
                if(!member.user){
                  console.log("No User in the member", member);
                  return;
                  //Ignore this rules
                }

                if(userIdFromUser != member.user.userId){
                  console.log("Member ",rule.memberId," is linked to user:",member.user.userId,"But should be:",userIdFromUser);
                  //Fix the userId in the member
                }

                let record = {
                  date: rule.date,
                  memberId: member.$id,
                  memberEmail: member.member.email,
                  memberName: member.member.shortname,
                  userId: userIdFromUser
                };
                detailsRef.child(group.$id).child("access").child(ruleIds[index]).set(record);

              });

            });

          }

        });
        console.log("Groups Migration Completed");
      });
		};

    /* WEEKS MIGRATION FUNCTION (Execute after Reports)*/
		$scope.migrateWeeks = function () {
			console.debug("Init Weeks Migration");
      let weeksListRef = newDataRef.child(constants.db.folders.weeksList);
			let weeksDetailsRef = newDataRef.child(constants.db.folders.weeksDetails);

			//Updates in Week Object
			$scope.existingWeeks.$loaded().then(function (weeks,index) {
        console.log(weeks.length,"Weeks Loaded");
        weeks.forEach(function(week){
					let weekObj = {};
					let auditObj = {};

          WeeksSvc.increaseTotalWeeksCounter();
					if(week.status == "open"){
						weekObj.isOpen = true;
						weekObj.isVisible = true;
            WeeksSvc.increaseOpenWeeksCounter();
            WeeksSvc.increaseVisibleWeeksCounter();
					}else{
						weekObj.isOpen = false;
						weekObj.isVisible = false;
					}

          // weekObj.duedate = null;
          // weekObj.series = null;
          // weekObj.study = null;
          weekObj.name = week.name;
					let idtxt = week.$id + "";
					let yearStr = idtxt.substring(0,4);
					let weekStr = idtxt.substring(4);
					weekObj.year = Number(yearStr);
					weekObj.week = Number(weekStr);

          //Audit
          let user = $rootScope.currentSession.user;
          let timestamp = firebase.database.ServerValue.TIMESTAMP;
          auditObj.createdById = week.audit.createdById;
          auditObj.createdByName = week.audit.createdBy;
          auditObj.createdByEmail = week.audit.createdBy;
          auditObj.createdOn =  week.audit.createdOn;
          auditObj.description =  systemMsgs.notifications.weekMigrated;
          auditObj.lastUpdateByEmail =  user.email;
          auditObj.lastUpdateById =  user.$id;
          auditObj.lastUpdateByName = user.shortname;
          auditObj.lastUpdateOn =  timestamp;

          //Get Reports for the week to update week's reports
					ReportsSvc.getReportsForWeek(week.$id).$loaded().then(function(reports) {
						weekObj.reports = reports.length;
						console.debug(week.$id+" ("+index+") has "+reports.length+" reports");
						weeksDetailsRef.child(week.$id).child("audit").set(auditObj);
						weeksListRef.child(week.$id).set(weekObj);
					});
				});
			});
		};

    /* MEMBERS MIGRATION FUNCTION (Execute Third)*/
		$scope.migrateMembers = function() {
			console.debug("Init Members Migration!");
      let listRef = newDataRef.child(constants.db.folders.membersList);
			let detailsRef = newDataRef.child(constants.db.folders.membersDetails);

      $scope.existingMembers.$loaded().then(function(members){
        console.log(members.length,"Members Loaded");
        members.forEach(function(member){
          let memberObj = {};

          MembersSvc.increaseTotalMembersCount();
          if(member.member.status == "active"){
            memberObj.isActive = true;
						MembersSvc.increaseActiveMembersCount();
          }else{
            memberObj.isActive = false;
          }

          if(member.member.baseGroup){
            let group = $scope.existingGroups.$getRecord(member.member.baseGroup);
            if(group){
              memberObj.baseGroupId = group.$id;
              memberObj.baseGroupName = group.group.name;
            }
          }
          if(member.member.bday){
            memberObj.bday = member.member.bday.substring(0,10);
          }
          if(member.member.email){
            memberObj.email = member.member.email;
          }
          if(member.member.phone){
            memberObj.phone = member.member.phone;
          }
          memberObj.firstname = member.member.firstname;
          memberObj.lastname = member.member.lastname;
          memberObj.shortname = member.member.shortname;
          if(member.member.isHost){
            memberObj.isHost = true;
            MembersSvc.increaseHostMembersCount();
          }
          if(member.member.isLeader){
            memberObj.isLeader = true;
            MembersSvc.increaseLeadMembersCount();
          }
          if(member.member.isTrainee){
            memberObj.isTrainee = true;
            MembersSvc.increaseTraineeMembersCount();
          }
          memberObj.sex = 'F'; //Set all as female first

          if(member.user){
            memberObj.allowUser = true;
            memberObj.isUser = true;
            //Get the User Id from users, using the email
            let userSearch = $firebaseObject(oldDataRef.child("users").orderByChild("email").equalTo(member.member.email).limitToLast(1));
            userSearch.$loaded().then(function(u){
              let keys = Object.keys(u);
              memberObj.userId = keys[4];
              listRef.child(member.$id).set(memberObj);
            });
          }else{
            listRef.child(member.$id).set(memberObj);
          }

          //Access
          if(member.access){
            detailsRef.child(member.$id).child("access").set(member.access);
          }
          //Address
          if(member.address){
            detailsRef.child(member.$id).child("address").set(member.address);
          }
          //Attendance
          if(member.attendance){
            detailsRef.child(member.$id).child("attendance").set(member.attendance);
          }

          //Audit
          let auditObj = {};
          let loggdUser = $rootScope.currentSession.user;
          let timestamp = firebase.database.ServerValue.TIMESTAMP;
          auditObj.createdById = member.audit.createdById;
          auditObj.createdByName = member.audit.createdBy;
          auditObj.createdByEmail = member.audit.createdBy;
          auditObj.createdOn =  member.audit.createdOn;
          auditObj.description =  systemMsgs.notifications.memberMigrated;
          auditObj.lastUpdateByEmail =  loggdUser.email;
          auditObj.lastUpdateById =  loggdUser.$id;
          auditObj.lastUpdateByName = loggdUser.shortname;
          auditObj.lastUpdateOn =  timestamp;
          detailsRef.child(member.$id).child("audit").set(auditObj);

        });
        console.log("Members Migration Completed");
      });
		};

    /* REPORTS MIGRATION FUNCTION (Execute Third)*/
		$scope.migrateReports = function() {
			console.debug("Init Reports Migration!");
      let listRef = newDataRef.child(constants.db.folders.reportsList);
			let detailsRef = newDataRef.child(constants.db.folders.reportsDetails);
      let counters = {approved:0, pending:0, rejected:0, total:0};

      $scope.existingReports.$loaded().then(function(reports){
        console.log(reports.length,"Reports Loaded");
        reports.forEach(function(report,index){
          let reportObj = {};
          let reunionDate = new Date(report.reunion.date.year, report.reunion.date.month-1, report.reunion.date.day);

          if(report.audit.createdById){
            reportObj.createdById = report.audit.createdById;
            reportObj.createdOn = report.audit.createdOn;
          }else if(report.audit.lastUpdateBy){
            reportObj.createdById = report.audit.lastUpdateBy;
            reportObj.createdOn = report.audit.lastUpdateOn;
          } else{
            console.error("No CreatedBy for this report",report.$id);
          }

          reportObj.dateMilis = reunionDate.getTime();
          reportObj.duration = report.reunion.duration;
          reportObj.money = report.reunion.money;
          reportObj.groupId = report.reunion.groupId;
          reportObj.groupname = report.reunion.groupname;
          reportObj.notes = (report.reunion.notes)?report.reunion.notes:null;
          reportObj.status = report.reunion.status;
          reportObj.reviewStatus = report.audit.reportStatus;
          reportObj.weekId = report.reunion.weekId;

          let weekRec = $scope.existingWeeks.$getRecord(report.reunion.weekId);
          if(!weekRec){
            console.log("Report Discarded",report.$id);
            return;
          }
          reportObj.weekName = weekRec.name;

          if(report.reunion.hostId){
            //Get Hostname from existing Members
            let memberObj = $scope.existingMembers.$getRecord(report.reunion.hostId);
            if(memberObj){
              reportObj.hostId = report.reunion.hostId;
              reportObj.hostName = memberObj.member.shortname;
            }
          }
          if(report.reunion.leadId){
            //Get Hostname from existing Members
            let memberObj = $scope.existingMembers.$getRecord(report.reunion.leadId);
            if(memberObj){
              reportObj.leadId = report.reunion.leadId;
              reportObj.leadName = memberObj.member.shortname;
            }
          }
          if(report.reunion.coLeadId){
            //Get Hostname from existing Members
            let memberObj = $scope.existingMembers.$getRecord(report.reunion.coLeadId);
            if(memberObj){
              reportObj.traineeId = report.reunion.coLeadId;
              reportObj.traineeName = memberObj.member.shortname;
            }
          }

          reportObj.femaleGuests = 0;
          reportObj.femaleMembers = 0;
          reportObj.totalFemale = 0;
          reportObj.totalMale = 0;
          reportObj.maleGuests = 0;
          reportObj.maleMembers = 0;

          if(report.attendance){
            reportObj.guestsAttendance = (report.attendance.guests)?report.attendance.guests.total:0;
            reportObj.membersAttendance = (report.attendance.members)?report.attendance.members.total:0;
            reportObj.totalAttendance = reportObj.guestsAttendance + reportObj.membersAttendance;
          }

          counters.total++;
          // ReportsSvc.increaseTotalReportsCount(report.audit.createdById);
          if(reportObj.reviewStatus == "approved"){
            counters.approved++;
            // ReportsSvc.increaseApprovedReportsCount(report.audit.createdById);
          }
          if(reportObj.reviewStatus == "pending"){
            counters.pending++;
            // ReportsSvc.increasePendingReportsCount(report.audit.createdById);
          }
          if(reportObj.reviewStatus == "rejected"){
            counters.rejected++;
            // ReportsSvc.increaseRejectedReportsCount(report.audit.createdById);
          }
          listRef.child(report.$id).set(reportObj);

          //Study
          if(report.reunion.series){
            detailsRef.child(report.$id).child("study").set({series:report.reunion.series , study:report.reunion.study});
          }

          //Audit
          let auditObj = {};
          let loggdUser = $rootScope.currentSession.user;
          let timestamp = firebase.database.ServerValue.TIMESTAMP;
          if(report.audit.createdById){
            auditObj.createdById = report.audit.createdById;
            auditObj.createdByName = report.audit.createdBy;
            auditObj.createdByEmail = report.audit.createdBy;
            auditObj.createdOn =  report.audit.createdOn;
          }
          auditObj.description =  systemMsgs.notifications.reportMigrated;
          auditObj.lastUpdateByEmail =  loggdUser.email;
          auditObj.lastUpdateById =  loggdUser.$id;
          auditObj.lastUpdateByName = loggdUser.shortname;
          auditObj.lastUpdateOn =  timestamp;
          if(report.audit.approvedBy){
            auditObj.approvedById = report.audit.approvedById;
            auditObj.approvedByName = report.audit.approvedBy;
            auditObj.approvedByEmail = report.audit.approvedBy;
            auditObj.approvedOn =  report.audit.approvedOn;
          }
          if(report.audit.rejectedBy){
            auditObj.rejectedById = report.audit.rejectedById;
            auditObj.rejectedByName = report.audit.rejectedBy;
            auditObj.rejectedByEmail = report.audit.rejectedBy;
            auditObj.rejectedOn =  report.audit.rejectedOn;
          }
          detailsRef.child(report.$id).child("audit").set(auditObj);

          //Attendance
          if(report.attendance){
            let attnObj = {};
            if(report.attendance.guests.list){
              attnObj.guests = report.attendance.guests.list;
            }
            if(report.attendance.members.list){
              attnObj.members = report.attendance.members.list;
            }
            detailsRef.child(report.$id).child("attendance").set(attnObj);
          }
        });
        console.log("Reports Migration Completed");
        console.log(counters);
        let repCount = ReportsSvc.getGlobalReportsCounter();
        repCount.$loaded().then(function(count) {
          console.log(count);
          repCount.approved += counters.approved;
          repCount.pending += counters.pending;
          repCount.rejected += counters.rejected;
          repCount.total += counters.total;
          repCount.$save();
        });
      });
		};

		$scope.reportCountByUser = function(){
			let totals = {pending:0, approved:0, rejected:0, total:0};
			$scope.newUsers = $firebaseArray(newDataRef.child("users/list"));
			$scope.newUsers.$loaded().then(function(users) {
				users.forEach(function(user,index) {
					ReportsSvc.getReportsCreatedByUser(user.$id).$loaded().then(function(reports) {
						let userTotals = {pending:0, approved:0, rejected:0, total:0};
						reports.forEach(function(report) {
							userTotals.total ++;
							totals.total ++;
							if(report.reviewStatus == "pending"){
								userTotals.pending ++;
								totals.pending ++;
							}else if(report.reviewStatus == "approved"){
								userTotals.approved ++;
								totals.approved ++;
							}else if(report.reviewStatus == "rejected"){
								userTotals.rejected ++;
								totals.rejected ++;
							}
						});
						newDataRef.child("users/list").child(user.$id).child("counters/reports").set(userTotals);
						console.log("User:",user.$id,"Rerports:",userTotals);
					});
				});
				console.log(totals);
			});
		};

    /* PURGE */
    $scope.purgeOldData = function(){
      newDataRef.set(null);
    };

		$scope.purgeOkulusData = function(){
      okulusDataRef.child("config").set(null);
      okulusDataRef.child("allowedEmails").set(null);
      okulusDataRef.child("data").set(null);
    };

}]);
