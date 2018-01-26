okulusApp.controller('ReportCntrl', ['$rootScope','$scope', 'GroupsSvc', 'MembersSvc', 'WeeksSvc',
	function($rootScope, $scope, GroupsSvc, MembersSvc,WeeksSvc){
		
		GroupsSvc.loadActiveGroups();
		MembersSvc.loadActiveMembers();
		WeeksSvc.loadActiveWeeks();

		//To put default Values on Attendance
		$scope.attendance = {
				guests:{
					male:{kid:0, young:0, adult:0},
					female:{kid:0, young:0, adult:0}
				},
				members:{
					male:{kid:0, young:0, adult:0},
					female:{kid:0, young:0, adult:0}
				}
			};


		$scope.saveReport = function(){
			//Resolve reunion date
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

	}
]);

okulusApp.factory('WeeksSvc', ['$rootScope', '$firebaseArray', '$firebaseObject',
	function($rootScope, $firebaseArray, $firebaseObject){

		let weeksRef = firebase.database().ref().child('pibxalapa').child('weeks').orderByChild("status").equalTo("open");;

		return {
			loadActiveWeeks: function(){
				if(!$rootScope.allActiveWeeks){
					$rootScope.allActiveWeeks = $firebaseArray(weeksRef);
				}
			}
		};
	}
]);