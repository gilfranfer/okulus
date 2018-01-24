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
	    	if( !$scope.memberId ){
				console.log("Creating new member");
	    		let record = {member: $scope.member, address: $scope.address};

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

okulusApp.factory('MembersSvc', ['$rootScope', '$firebaseArray', '$firebaseObject',
	function($rootScope, $firebaseArray, $firebaseObject){

		let membersRef = firebase.database().ref().child('pibxalapa').child('members');

		return {
			getMember: function(memberId){
				return $rootScope.allMembers.$getRecord(memberId);
			},
			loadAllMembersList: function(){
				//if(!$rootScope.allGroups){
					console.log("Creating firebaseArray for allMembers");
					$rootScope.allMembers = $firebaseArray(membersRef);
				//}
			}
		};
	}
]);
