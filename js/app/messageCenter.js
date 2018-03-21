okulusApp.factory('MessageCenterSvc', ['$rootScope', '$firebaseArray', '$firebaseObject',
	function($rootScope, $firebaseArray, $firebaseObject){
		let messagesRef = firebase.database().ref().child('pibxalapa/messages');

		return{
			getAdminMessages: function(){
				return $firebaseArray(messagesRef);
			},
		};
}]);

okulusApp.controller('MessageCenterCntrl', ['$rootScope','$scope','$location', 'AuthenticationSvc','$firebaseAuth', 'MessageCenterSvc','AuditSvc',
	function($rootScope, $scope,$location, AuthenticationSvc,$firebaseAuth,MessageCenterSvc,AuditSvc){
		$scope.messages = MessageCenterSvc.getAdminMessages();
		console.log("Persist Message:");

		$scope.saveMessage = function(){
			if($rootScope.currentSession.user.type == 'admin'){
				let messageType = "secondary";
				if($scope.importantMessage){
					messageType = "danger";
				}

				$scope.messages.$add({message:$scope.newmessage, type:messageType}).then(function(ref) {
					AuditSvc.recordAudit(ref.key, "create", "messages");
				});
				$scope.newmessage = "";
			}

		};

	}]
);
