okulusApp.controller('UserCntrl', ['MembersSvc','GroupsSvc', '$rootScope',
	function(MembersSvc, GroupsSvc, $rootScope){
			$rootScope.currentUser =  { type: 'admin', member:{ id:'-L3aCrod02U-clEuK8g1' }};

			let whichMember = $rootScope.currentUser.member.id;
			MembersSvc.getMemberInfo(whichMember).$loaded().then(
				function(data) {
					$rootScope.currentUser.member.data = data;
				}
			);
	}
]);

okulusApp.controller('UserGroupsListCntrl', ['MembersSvc','GroupsSvc', '$rootScope',
	function(MembersSvc, GroupsSvc, $rootScope){
		$rootScope.groupsList = null;
		//When admin is logged, he can see all the groups,
		//even when there is no rule for him on the access folder
		if( $rootScope.currentUser.type === 'admin'){
			console.log("As Admin");
			$rootScope.groupsList = GroupsSvc.loadActiveGroups();
		}
		//But, if a user is logged, we only show the groups that are
		//present in his access rules folder
		else{
			console.log("As User");
			let whichMember = $rootScope.currentUser.member.id;
			let myGroups = [];

			//Filter from the Active Groups, the ones the User has access to
			GroupsSvc.loadActiveGroups().$loaded().then(
				function(activeGroups) {
					MembersSvc.getMemberAccessRules(whichMember).$loaded().then(
						function(memberRules) {
							memberRules.forEach(function(rule) {
								console.log("On a Rule");
								let group = activeGroups.$getRecord(rule.groupId);
								if( group != null){
									myGroups.push( group );
								}
							});
							$rootScope.groupsList = myGroups;
						}
					);
				}
			);
		}

	}
]);
