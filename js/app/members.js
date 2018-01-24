okulusApp.controller('MembersListCntrl', ['MembersSvc', '$rootScope',
	function(MembersSvc, $rootScope){
		MembersSvc.loadAllMembersList();
	}
]);

okulusApp.controller('MemberFormCntrl', ['$rootScope', '$scope', '$location','$firebaseArray', 'MembersSvc', 'AuditSvc',
	function($rootScope, $scope, $location,$firebaseArray, MembersSvc, AuditSvc){
		console.log("on Memeber Form Controller");
		$rootScope.response = null;
	   	MembersSvc.loadAllMembersList();

	    cleanScope = function(){
	    	$scope.memberId = null;
	    	$scope.member = null;
	    	$scope.address = null;
	    	$scope.response = null;
	    };

	    $scope.saveMember = function() {
	    	//Resolve birthday
	    	let birthday = $scope.member.birthday;
	    	let bday = null;
	    	if(birthday){
	    		bday = { day:birthday.getDate(),
						 month: birthday.getMonth()+1,
						 year:birthday.getFullYear() };
			}

	    	if( !$scope.memberId ){
				console.log("Creating new member");
				let record = {member: $scope.member, address: $scope.address};
	    		record.member.bday = bday;

		    	//Move to Svc
		    	$rootScope.allMembers.$add( record ).then(function(ref) {
				    $scope.memberId = ref.key;
				    $scope.response = { messageOk: "Miembro Creado"};
				    AuditSvc.recordAudit(ref, "create", "members");
				}).catch(function(err) {
					$scope.response = { messageErr: err};
				});
	    	}else{
	    		console.log("Updating member: "+$scope.memberId);
				let record = MembersSvc.getMember($scope.memberId);
				record.member = $scope.member;
				record.address = $scope.address;
				record.member.bday = bday;

			    //Move to Svc
		    	$rootScope.allMembers.$save(record).then(function(ref) {
				    $scope.response = { messageOk: "Miembro Actualizado"};
				    AuditSvc.recordAudit(ref, "update", "members");
					}).catch(function(err) {
						$scope.response = { messageErr: err};
					});
	    	}
	    };

	    $scope.deleteMember = function() {
	    	if( $scope.memberId ){
	    		console.log("Deleting member: "+$scope.memberId);
					let record = MembersSvc.getMember($scope.memberId);

					//Move to Svc
					$rootScope.allGroups.$remove(record).then(function(ref) {
						cleanScope();
					    $scope.response = { messageOk: "Miembro Eliminado"};
					    AuditSvc.recordAudit(ref, "delete", "members");
						$location.path( "/success/deleted");
					}).catch(function(err) {
						$scope.response = { messageErr: err};
					});
	    	}
	    };

  	}
]);

okulusApp.controller('MemberDetailsCntrl', ['$rootScope', '$scope','$routeParams', '$location','$firebaseArray', '$firebaseObject', 'MembersSvc',
	function($rootScope, $scope, $routeParams, $location, $firebaseArray, $firebaseObject, MembersSvc){
		
		let whichMember = $routeParams.memberId;

		MembersSvc.loadAllMembersList(); //This is in case of a Refresh in the view
		$rootScope.allMembers.$loaded(function() {
			//Load Specific Member
			let record = MembersSvc.getMember(whichMember);
			if(record){
				$scope.memberId = record.$id;
				$scope.member = record.member;
				$scope.address = record.address;

				if(record.member.bday){
					$scope.member.birthday = new Date(record.member.bday.year, 
												  record.member.bday.month-1,
												  record.member.bday.day);
				}
			}else{
				$rootScope.response = { messageErr: "El Miembro '"+whichMember+ "' no existe"};
				$location.path( "/error" );
			}
		});

	}
]);


okulusApp.factory('MembersSvc', ['$rootScope', '$firebaseArray', '$firebaseObject',
	function($rootScope, $firebaseArray, $firebaseObject){

		let membersRef = firebase.database().ref().child('pibxalapa').child('members');

		return {
			getMember: function(memberId){
				return $rootScope.allMembers.$getRecord(memberId);
			},
			loadAllMembersList: function(){
				//if(!$rootScope.allMembers){
					console.log("Creating firebaseArray for allMembers");
					$rootScope.allMembers = $firebaseArray(membersRef);
				//}
			}
		};
	}
]);
