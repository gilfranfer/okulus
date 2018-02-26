okulusApp.controller('MembersListCntrl', ['MembersSvc', '$rootScope',
	function(MembersSvc, $rootScope){
		MembersSvc.loadAllMembersList();
	}
]);

okulusApp.controller('MemberFormCntrl', ['$rootScope', '$scope', '$location','MembersSvc', 'AuditSvc', 'UtilsSvc', 'GroupsSvc',
	function($rootScope, $scope, $location, MembersSvc, AuditSvc, UtilsSvc, GroupsSvc){
		$rootScope.response = null;
		$scope.provideAddress = true;
		$scope.groupsList = GroupsSvc.loadActiveGroups();

		$scope.saveOrUpdateMember = function() {
			$scope.response = null;
			let record = undefined;
			if($scope.provideAddress){
				record = { member: $scope.member, address: $scope.address };
			}else{
				record = { member: $scope.member };
			}
			record.member.birthdate = UtilsSvc.buildDateJson($scope.member.bday);


			/* When a value for memberId is present in the scope, the user is on Edit
				mode and we have to perform an UPDATE.*/
			if( $scope.memberId ){
	    		let mRef = MembersSvc.getMemberReference($scope.memberId);
				let orgiStatus = undefined;
				mRef.child("member/status").once('value').then(
					function(snapshot) {
						orgiStatus = snapshot.val();
					});

			    mRef.update(record, function(error) {
					if(error){
						$scope.response = { memberMsgError: error};
					}else{
						$scope.response = { memberMsgOk: "Miembro Actualizado"};
					  AuditSvc.recordAudit(mRef.key, "update", "members");

					  if(orgiStatus != record.member.status){
							MembersSvc.updateStatusCounter(record.member.status);
						}
					}
				});
			}
			/* Otherwise, when groupId is not present in the scope,
				we perform a SET to create a new record */
			else{
				var newmemberRef = MembersSvc.getNewMemberReference();
				newmemberRef.set(record, function(error) {
					if(error){
						$scope.response = { memberMsgError: error};
					}else{
						//For some reason the message is not displayed until
						//you interact with any form element
					}
				});

				//adding trick below to ensure message is displayed
				let obj = MembersSvc.getMember(newmemberRef.key);
				obj.$loaded().then(function(data) {
					$scope.memberId = newmemberRef.key;
					$rootScope.response = { memberMsgOk: "Miembro Creado"};
					AuditSvc.recordAudit(newmemberRef.key, "create", "members");
					//console.log("update counter")
					MembersSvc.increaseStatusCounter(data.member.status);
					$location.path( "/members");
				});
			}
		};

	  $scope.deleteMember = function() {
			if($rootScope.currentSession.user.type == 'user'){
				$scope.response = { memberMsgError: "Para eliminar este miembro, contacta al administrador"};
			}else{
				if( $scope.memberId ){
					MembersSvc.getMember($scope.memberId).$loaded().then( function(memberObj){
						if( memberObj.access ){
							$scope.response = { memberMsgError: "No se puede elminar el Mimebro porque tiene Accesos asociados"};
						}else if( memberObj.reports ){
							$scope.response = { memberMsgError: "No se puede elminar el Mimebro porque tiene Reportes asociados"};
						}else{
							let status = memberObj.member.status;
							//let accessList = memberObj.access;
							memberObj.$remove().then(function(ref) {
								$rootScope.response = { memberMsgOk: "Miembro Eliminado"};
						    	AuditSvc.recordAudit(ref.key, "delete", "members");
								MembersSvc.decreaseStatusCounter(status);
								$location.path( "/members");
								//GroupSvc.deleteAccessToGroups(accessList);
							}, function(error) {
								$rootScope.response = { memberMsgError: err};
								// console.log("Error:", error);
							});
						}
					});
				}
			}
		};

		$scope.isHost = function(value){
			validateMemberObj();
			$scope.member.isHost = value;
			//console.log($scope.member);
		};
		$scope.isLeader = function(value){
			validateMemberObj();
			$scope.member.isLeader = value;
			//console.log($scope.member);
		};
		$scope.isTrainee = function(value){
			validateMemberObj();
			$scope.member.isTrainee = value;
			//console.log($scope.member);
		};
		$scope.canBeUser = function(value){
			validateMemberObj();
			$scope.member.canBeUser = value;
			//console.log($scope.member);
		};

		validateMemberObj = function () {
			if(!$scope.member){
				$scope.member = {}
			}
		}
  }
]);

okulusApp.controller('MemberDetailsCntrl', ['$scope','$routeParams', '$location', 'MembersSvc',
	function($scope, $routeParams, $location, MembersSvc){
		let whichMember = $routeParams.memberId;
		$scope.provideAddress = true;

		/* When opening "Edit" page from the Members List, we can use the
		"allMemberss" firebaseArray from rootScope to get the specific Member data */
		if( MembersSvc.allMembersLoaded() ){
			let record = MembersSvc.getMemberFromArray(whichMember);
			putRecordOnScope(record);
		}
		/* But, when using a direct link to an "Edit" page, or when refresing (f5),
		we will not have the "allMemberss" firebaseArray Loaded in the rootScope.
		Instead of loading all the Members, what could be innecessary,
		we can use firebaseObject to get only the required member data */
		else{
			let obj = MembersSvc.getMember(whichMember);
			obj.$loaded().then(function() {
				putRecordOnScope(obj);
			}).catch(function(error) {
		    $location.path( "/error/norecord" );
		  });
		}

		function putRecordOnScope(record){
			if(record && record.member){
				$scope.memberId = record.$id;
				$scope.member = record.member;
				$scope.address = record.address;

				if(record.member.birthdate){
					$scope.member.bday = new Date(record.member.birthdate.year,
												  record.member.birthdate.month-1,
												  record.member.birthdate.day);
				}
			}else{
				$location.path( "/error/norecord" );
			}
		}

	}
]);

okulusApp.factory('MembersSvc', ['$rootScope', '$firebaseArray', '$firebaseObject', 'GroupsSvc',
	function($rootScope, $firebaseArray, $firebaseObject, GroupsSvc){

		let membersRef = firebase.database().ref().child('pibxalapa/members');
		let activeMembersRef = membersRef.orderByChild("member/status").equalTo("active");
		let counterRef = firebase.database().ref().child('pibxalapa/counters/members');

		return {
			allMembersLoaded: function() {
				return $rootScope.allMembers != null;
			},
			getMemberFromArray: function(memberId){
				return $rootScope.allMembers.$getRecord(memberId);
			},
			getMember: function(memberId){
				return $firebaseObject(membersRef.child(memberId));
			},
			getMemberInfo: function(memberId){
				return $firebaseObject(membersRef.child(memberId).child("member"));
			},
			getMemberAccessRules: function(whichMember) {
				return $firebaseArray(membersRef.child(whichMember).child("access"));
			},
			loadAllMembersList: function(){
				if(!$rootScope.allMembers){
					console.log("Creating firebaseArray for allMembers");
					$rootScope.allMembers = $firebaseArray(membersRef);
				}
				return $rootScope.allMembers;
			},
			loadActiveMembers: function(){
				if(!$rootScope.allActiveMembers){
					$rootScope.allActiveMembers = $firebaseArray(activeMembersRef);
				}
				return $rootScope.allActiveMembers;
			},
			filterActiveHosts: function(activeMembers){
				let activeHosts = [];
				activeMembers.forEach(function(host) {
						if(host.member.isHost){
							activeHosts.push( host );
						}
				});
				return activeHosts;
			},
			filterActiveLeads: function(activeMembers){
				let activeLeads = [];
				activeMembers.forEach(function(lead) {
						if(lead.member.isLeader){
							activeLeads.push( lead );
						}
				});
				return activeLeads;
			},
			filterActiveTrainees: function(activeMembers){
				let activeTrainees = [];
				activeMembers.forEach(function(lead) {
						if(lead.member.isTrainee){
							activeTrainees.push( lead );
						}
				});
				return activeTrainees;
			},
			getMemberReference: function(memberId){
				return membersRef.child(memberId);
			},
			getNewMemberReference: function(){
				return membersRef.push();
			},
			getMembersForBaseGroup: function(gropId){
				let ref = membersRef.orderByChild("member/baseGroup").equalTo(gropId);
				return $firebaseArray(ref);
			},
			//Receives the access list from a Group = { accessRuleId: {memberId,mamberName,date} , ...}
			//The accessRuleId is the same on groups/:gropuId/access and members/:memberId/access
			//Use accessRuleId.memberId and accessRuleId tu delete the reference from each member to the group
			deleteMembersAccess: function(accessObj){
				if(accessObj){
					for (const accessRuleId in accessObj) {
						let memberId = accessObj[accessRuleId].memberId;
						membersRef.child(memberId).child("access").child(accessRuleId).set(null);
					}
				}
			},
			/* Returns a list of Group records (from $firebaseArray) that are
			 * present in the Member's acess rules folder. */
			getMemberGroups: function(whichMember) {
				return new Promise((resolve, reject) => {

					GroupsSvc.loadAllGroupsList().$loaded().then( function(allGroups){
						return $firebaseArray(membersRef.child(whichMember).child("access")).$loaded();
					}).then( function(memberRules) {
						let myGroups = [];
						memberRules.forEach(function(rule) {
							let group = $rootScope.allGroups.$getRecord(rule.groupId);
							if( group != null){
								myGroups.push( group );
							}
						});
						$rootScope.groupsList = myGroups;
						resolve(myGroups);
					});

				});
			},
			findMemberByEmail: function(email){
				let ref = membersRef.orderByChild("member/email").equalTo(email);
				return $firebaseArray(ref);
			},
			increaseStatusCounter(status){
				$firebaseObject(counterRef).$loaded().then(
					function( statusCounter ){
						if(status == 'active'){
							statusCounter.active = statusCounter.active+1;
						}else{
							statusCounter.inactive = statusCounter.inactive+1;
						}
						statusCounter.$save();
					});
			},
			decreaseStatusCounter(status){
				$firebaseObject(counterRef).$loaded().then(
					function( statusCounter ){
						if(status == 'active'){
							statusCounter.active = statusCounter.active-1;
						}else{
							statusCounter.inactive = statusCounter.inactive-1;
						}
						statusCounter.$save();
					});
			},
			updateStatusCounter(status){
				$firebaseObject(counterRef).$loaded().then(
					function( statusCounter ){
						if(status == 'active'){
							statusCounter.active = statusCounter.active+1;
							statusCounter.inactive = statusCounter.inactive-1;
						}else{
							statusCounter.inactive = statusCounter.inactive+1;
							statusCounter.active = statusCounter.active-1;
						}
						statusCounter.$save();
					});
			}
		};
	}
]);
