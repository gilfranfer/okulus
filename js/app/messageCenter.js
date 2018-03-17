okulusApp.factory('MessageCenterSvc', ['$rootScope', '$firebaseArray', '$firebaseObject',
	function($rootScope, $firebaseArray, $firebaseObject){
		let messagesRef = firebase.database().ref().child('pibxalapa/messages');

		return{
			getAdminMessages: function(){
				return $firebaseArray(messagesRef);
			},
		};
}]);

okulusApp.controller('MessageCenterCntrl', ['$scope','$location', 'AuthenticationSvc','$firebaseAuth', 'MessageCenterSvc','AuditSvc',
	function($scope,$location, AuthenticationSvc,$firebaseAuth,MessageCenterSvc,AuditSvc){
		$scope.messages = MessageCenterSvc.getAdminMessages();
		console.log("Persist Message:");

		$scope.saveMessage = function(){
			$scope.messages.$add({message:$scope.newmessage, type:'secondary'}).then(function(ref) {
				AuditSvc.recordAudit(ref.key, "create", "messages");
			});
			$scope.newmessage = "";
		};

	}]
);