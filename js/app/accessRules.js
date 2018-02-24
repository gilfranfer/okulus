okulusApp.controller('AccessRulesCntrl', ['GroupsSvc', 'MembersSvc', 'AuditSvc','$rootScope', '$scope','$routeParams', '$location',
	function(GroupsSvc, MembersSvc, AuditSvc, $rootScope, $scope,$routeParams, $location){
		let whichGroup = $routeParams.groupId;
		$rootScope.response = null;
			MembersSvc.loadActiveMembers();
			$scope.acessList = GroupsSvc.getAccessRulesForGroup(whichGroup);
			GroupsSvc.getGroupObj(whichGroup).$loaded().then(
				function(obj){
					$scope.group = obj;
				}
			);

		$scope.addRule = function(){
			if($rootScope.currentSession.user.type == 'admin'){
				let whichMember = $scope.access.memberId;
				let memberName = document.getElementById('memberSelect').options[document.getElementById('memberSelect').selectedIndex].text;
				let groupName = $scope.group.group.name;
				let record = { memberName: memberName, memberId: whichMember, date:firebase.database.ServerValue.TIMESTAMP };

				let ruleExists = false;
				$scope.acessList.forEach(function(rule) {
						if(rule.memberId == whichMember){
							ruleExists = true;
						}
				});

				if(!ruleExists){
					//Use the Group´s access list to add a new record
					$scope.acessList.$add(record).then(function(ref) {
						AuditSvc.recordAudit(whichGroup, "access granted", "groups");
						$rootScope.response = { accessMsgOk: "Acceso Concedido a " + memberName };
						//update record. Now to point to the Group
						var id = ref.key; //use the same push key for the record on member/access folder
						record = { groupName: groupName, groupId: whichGroup, date:firebase.database.ServerValue.TIMESTAMP };
						MembersSvc.getMemberReference(whichMember).child("access").child(id).set(record, function(error) {
							if(error){
								$rootScope.response = { accessMsgError: error };
							}else{
								AuditSvc.recordAudit(whichMember, "access granted", "members");
							}
						});
					});
				}else{
					$rootScope.response = { accessMsgError: memberName + " ya tiene acceso al grupo"};
				}
			}
		};

		$scope.deleteRule = function(ruleId){
			var rec = $scope.acessList.$getRecord(ruleId);
			let whichMember = rec.memberId;
			$scope.acessList.$remove(rec).then(function(ref) {
				//rule removed from Groups access folder
				$rootScope.response = { accessMsgOk: "Acceso Revocado" };
				//now removed the same rule from Member access folder
			  AuditSvc.recordAudit(whichGroup, "access deleted", "groups");
				MembersSvc.getMemberReference(whichMember).child("access").child(ref.key).set(null, function(error) {
					if(error){
						$rootScope.response = { accessMsgError: error };
					}else{
						AuditSvc.recordAudit(whichMember, "access deleted", "members");
					}
				});
			});
		};
	}
]);
