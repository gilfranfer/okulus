okulusApp.factory('MessageCenterSvc', ['$rootScope', '$firebaseArray', '$firebaseObject',
	function($rootScope, $firebaseArray, $firebaseObject){
		let messagesRef = firebase.database().ref().child(rootFolder).child('messages');
		return{
			getAdminMessages: function(){
				return $firebaseArray(messagesRef);
			},
		};
}]);

/* Controller for Mesage Center, that is the section displayed on home Page
 where admin can post communications */
okulusApp.controller('MessageCenterCntrl', ['$rootScope','$scope','$location','$firebaseAuth',
								'MessageCenterSvc','AuditSvc',
	function($rootScope, $scope, $location, $firebaseAuth, MessageCenterSvc, AuditSvc){
		let adminType = "admin";

		if(!$rootScope.messages){
			$scope.response = {loading: true, message: $rootScope.i18n.msgCenter.loadingMessages };
			$rootScope.messages = MessageCenterSvc.getAdminMessages();
			$rootScope.messages.$loaded().then(function(messages){
				if(messages.length > 0){
					$scope.response = null;
				}else{
					$scope.response = {error: true, message: $rootScope.i18n.msgCenter.noMessages };
				}
			}).catch(function(error) {
				$scope.response = { error: true, message: $rootScope.i18n.msgCenter.loadingError };
				console.error(error);
			});
		}

		$scope.postMessage = function(){
			//Double check user is Admin before posting
			if($rootScope.currentSession.user.type == adminType){
				$scope.response = {working: true, message: $rootScope.i18n.msgCenter.createInProgress };
				let type = ($scope.message.isImportant)?"danger":"primary";
				let record = {message: $scope.message.content, type: type};
				$scope.messages.$add(record).then(function(ref) {
					AuditSvc.recordAudit(ref.key, "create", "messages");
					$scope.response = {success:true, message: $rootScope.i18n.msgCenter.createSuccess };
				}).catch(function(error) {
					$scope.response = { error: true, message: $rootScope.i18n.msgCenter.createError };
					console.error(error);
				});
				$scope.message = null;
			}
		};

		$scope.removeMessage = function(id ){
			//Only admin can remove Messages
			if($rootScope.currentSession.user.type == adminType){
				$scope.response = {working: true, message: $rootScope.i18n.msgCenter.deleteInProgress };
				var record = $scope.messages.$getRecord(id);
				$scope.messages.$remove(record).then(function(ref) {
					AuditSvc.recordAudit(ref.key, "delete", "messages");
					$scope.response = {success:true, message: $rootScope.i18n.msgCenter.deleteSuccess };
				}).catch(function(error) {
					$scope.response = { error: true, message: $rootScope.i18n.msgCenter.deleteError };
					console.error(error);
				});

			}
		};

	}]
);
