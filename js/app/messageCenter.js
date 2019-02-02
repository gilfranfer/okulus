okulusApp.factory('MessageCenterSvc',
	['$firebaseArray', '$firebaseObject',
	function($firebaseArray, $firebaseObject){
		let baseRef = firebase.database().ref().child(rootFolder);
		let messagesRef = baseRef.child(constants.folders.messagesList);

		return{
			getMessages: function(){
				return $firebaseArray(messagesRef);
			}
		};
}]);

/* Controller for Mesage Center, that is the section displayed on home Page
 where admin can post communications */
okulusApp.controller('MessageCenterCntrl',
	['$rootScope','$scope','$location','$firebaseAuth', 'MessageCenterSvc','AuthenticationSvc',
	function($rootScope, $scope, $location, $firebaseAuth, MessageCenterSvc,AuthenticationSvc){

		/*Executed everytime we enter to Message Center */
		$scope.response = {loading: true, message: systemMsgs.inProgress.loading };
		$firebaseAuth().$onAuthStateChanged(function(authUser){ if(authUser){
			AuthenticationSvc.loadSessionData(authUser.uid).$loaded().then( function(user){

				//Saving Messages in rootScope to avoid reloading all the time
				if(!$rootScope.msgCenterMessages){
					$rootScope.msgCenterMessages = MessageCenterSvc.getMessages();
				}
				$rootScope.msgCenterMessages.$loaded().then(function(messages){
					$scope.response = null;
				}).catch(function(error) {
					$scope.response = { error: true, message: systemMsgs.error.loadingMessagesError };
					console.error(error);
				});

			});
		}});

		$scope.postMessage = function(){
			$scope.response = {working: true, message: systemMsgs.inProgress.postingMessage };
			//Double check user is Admin before posting
			if($rootScope.currentSession.user.type == constants.roles.admin){
				let type = ($scope.message.isImportant)?"danger":"primary";
				let record = { message: $scope.message.content, type: type,
							createdBy: $rootScope.currentSession.user.email, createdOn:firebase.database.ServerValue.TIMESTAMP};

				$scope.msgCenterMessages.$add(record).then(function(ref) {
					$scope.response = {success:true, message: systemMsgs.success.postingMessageSuccess };
				}).catch(function(error) {
					console.error(error);
					$scope.response = { error: true, message: systemMsgs.error.postingMessageError };
				});
				$scope.message = null;
			}else{
				$scope.response = { error: true, message: systemMsgs.error.noPrivilegesShort };
			}
		};

		$scope.removeMessage = function(messageId){
			$scope.response = {working: true, message: systemMsgs.inProgress.deletingMessage };
			//Only admin can remove Messages
			if($rootScope.currentSession.user.type == constants.roles.admin){
				var record = $scope.msgCenterMessages.$getRecord(messageId);
				$scope.msgCenterMessages.$remove(record).then(function(ref) {
					$scope.response = { success:true, message: systemMsgs.success.deleteMessageSuccess };
				}).catch(function(error) {
					console.error(error);
					$scope.response = { error: true, message: systemMsgs.error.deleteMessageError };
				});
			}else{
				$scope.response = { error: true, message: systemMsgs.error.noPrivilegesShort };
			}
		};

	}]
);
