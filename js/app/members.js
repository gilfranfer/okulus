okulusApp.controller('MembersListCntrl', ['MembersSvc', '$rootScope',
	function(MembersSvc, $rootScope){
		MembersSvc.loadAllMembersList();
	}
]);

okulusApp.controller('MemberFormCntrl', ['$rootScope', '$scope', '$location','MembersSvc', 'AuditSvc', 'UtilsSvc',
	function($rootScope, $scope, $location, MembersSvc, AuditSvc, UtilsSvc){
		//$rootScope.response = null;

    cleanScope = function(){
    	$scope.memberId = null;
    	$scope.member = null;
    	$scope.address = null;
    	$scope.response = null;
			//$rootScope.response = null;
    };

		$scope.saveOrUpdateMember = function() {
			$scope.response = null;
			let record = { member: $scope.member, address: $scope.address };
			record.member.birthdate = UtilsSvc.buildDateJson($scope.member.bday);

			/* When a value for memberId is present in the scope, the user is on Edit
				mode and we have to perform an UPDATE.*/
			if( $scope.memberId ){
    		let mRef = MembersSvc.getMemberReference($scope.memberId);
		    mRef.update(record, function(error) {
					if(error){
						$scope.response = { messageErr: error};
					}else{
						$scope.response = { messageOk: "Miembro Actualizado"};
				    AuditSvc.recordAudit(mRef.key, "update", "members");
					}
				});
			}
			/* Otherwise, when groupId is not present in the scope,
				we perform a SET to create a new record */
			else{
				var newmemberRef = MembersSvc.getNewMemberReference();
				newmemberRef.set(record, function(error) {
					if(error){
						$scope.response = { messageErr: error};
					}else{
						$scope.memberId = newmemberRef.key;
						$scope.response = { messageOk: "Miembro Creado"};
						AuditSvc.recordAudit(newmemberRef.key, "create", "members");
					}
				});
			}
		};

	    $scope.deleteMember = function() {
	    	if( $scope.memberId ){
					MembersSvc.loadAllMembersList().$loaded().then(
						function(list) {
							let record = MembersSvc.getMemberFromArray($scope.memberId);
							list.$remove(record).then(function(ref) {
								cleanScope();
						    $rootScope.response = { messageOk: "Miembro Eliminado"};
						    AuditSvc.recordAudit(ref.key, "delete", "members");
								$location.path( "/members");
							}).catch(function(err) {
								$rootScope.response = { messageErr: err};
							});
					  });
	    	}
	    };

  	}
]);

okulusApp.controller('MemberDetailsCntrl', ['$scope','$routeParams', '$location', 'MembersSvc',
	function($scope, $routeParams, $location, MembersSvc){
		let whichMember = $routeParams.memberId;

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

okulusApp.factory('MembersSvc', ['$rootScope', '$firebaseArray', '$firebaseObject',
	function($rootScope, $firebaseArray, $firebaseObject){

		let membersRef = firebase.database().ref().child('pibxalapa/members');
		let activeMembersRef = membersRef.orderByChild("member/status").equalTo("active");

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
			},
			getMemberReference: function(memberId){
				return membersRef.child(memberId);
			},
			getNewMemberReference: function(){
				return membersRef.push();
			}
		};
	}
]);
