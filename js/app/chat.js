/* Controller linked to /chats */
okulusApp.controller('ChatCntrl', ['MembersSvc', 'ChatService','$rootScope','$scope','$firebaseAuth', '$location','AuthenticationSvc',
	function(MembersSvc, ChatService, $rootScope,$scope,$firebaseAuth,$location,AuthenticationSvc){

		$firebaseAuth().$onAuthStateChanged( function(authUser){ if(authUser){
			AuthenticationSvc.loadSessionData(authUser.uid).$loaded().then(function (user) {
				if(!user.memberId){
					$location.path("/error/nomember");
					return;
				}

				//Initial Load
				$scope.activeChatWith = undefined;
				$scope.loggedUserId = authUser.uid;
				$scope.loggedUserEmail = authUser.email;
    		$scope.chatSectionHeight = Math.round(window.innerHeight*.75);
				$scope.userChatsList = ChatService.getUserChatMetadataList(authUser.uid);
				$scope.usersList = MembersSvc.getMembersWithUser();
				/*Filter this list to show only users with whim I dont have a chat yet
				//let allMembersWithUser = undefined;
				// $scope.usersList = [];
				// $scope.userChatsList.$loaded().then(function(chatsList) {
				// 	allMembersWithUser = MembersSvc.getMembersWithUser();
				// 	allMembersWithUser.$watch(function(e) {
				// 		// console.debug(e);
				// 		let member = allMembersWithUser.$getRecord(e.key)
				// 		if( e.event === "child_added" && !chatsList.$getRecord(member.user.userId) ){
				// 			$scope.usersList.push(member);
				// 		}
				// 	});
				// }); */
			});

		}});

		document.querySelector('#chatInput').addEventListener('keyup', function(e){
	        if (e.keyCode === 13) {
	            if(e.shiftKey) {
	            }
	            else {
	            	saveMessage();
	            }
	    	}
    	});

		const messagePreviewSize = 25;
		saveMessage = function(){
			let chatInput = document.getElementById("chatInput");
			let message = chatInput.value.trim();
	    if($scope.activeChatWith && message){
				ChatService.saveMessage(message, $scope.loggedUserId, $scope.activeChatWith);
				//Update the receiver metadata
				$scope.activeChatMetadataTo.$loaded().then(function(metadata){
					metadata.unreadCount = metadata.unreadCount+1;
					metadata.lastMessageOn = firebase.database.ServerValue.TIMESTAMP;
					metadata.lastMessageExcerpt = (message.length<messagePreviewSize)?message:(message.substring(0, messagePreviewSize-3)+"...");
					metadata.$save();
				});
				//Clean unreadCount for this chat
				$scope.activeChatMetadataFrom.$loaded().then(function(metadata){
					if(metadata.unreadCount >0){
						metadata.unreadCount = 0;
						metadata.$save().then(function(){
							scrollBottom();
						});
					}
				});
			}
			chatInput.value = "";
		};

		scrollBottom = function(){
			var element = document.getElementById("chatArea");
    		element.scrollTop = element.scrollHeight;
		}
		scrollToTop = function(){
			var element = document.getElementById("chatArea");
    		element.scrollTop = 0;
		}

		$scope.openChatWithUser = function(chatWithUserId){
			let loggedUserId = $rootScope.currentSession.user.$id;
			//Visual updates on the previous selected chat
			let prevHtmlElement = document.getElementById("chat-"+$scope.activeChatWith);
			if($scope.activeChatWith && prevHtmlElement){
				prevHtmlElement.classList.remove("active");
				prevHtmlElement.classList.remove("text-white");
			}

			//Load Messages only if clicking in a different Chat
			if( !$scope.activeChatWith || ($scope.activeChatWith && $scope.activeChatWith != chatWithUserId) ){
				$scope.activeChatWith = chatWithUserId;
				$scope.activeChatMessages = undefined;
				//Get the Chat conversation Messages from the loggedUserId folder
				$scope.activeChatMessages = ChatService.getConversationMessages(loggedUserId,chatWithUserId);
				$scope.activeChatMessages.$loaded().then(function(event) {
					$scope.activeChatMessages.$watch(function(event) {scrollBottom();});
				});
				//Metadata for this conversation (receiver folder). Used when sending messages
				$scope.activeChatMetadataTo = ChatService.getConversationMetadata(chatWithUserId,loggedUserId);
				//Metadata for this conversation (sender folder, the loggedUser)
				$scope.activeChatMetadataFrom = ChatService.getConversationMetadata(loggedUserId,chatWithUserId);
			}

			//Clean unreadCount for this chat everytime you click on it
			$scope.activeChatMetadataFrom.$loaded().then(function(metadata){
				metadata.unreadCount = 0;
				metadata.$save().then(function(){
					//Visual updates on the selected chat
					document.getElementById("chatInput").value = "";;
					document.getElementById("chatInput").focus();
					let htmlElement = document.getElementById("chat-"+chatWithUserId);
					if( htmlElement ){
						htmlElement.classList.add("active");
						htmlElement.classList.add("text-white");
					}
					scrollBottom();
				});
			});
		};

		$scope.initChatWithUser = function(chatWithUserId,chatWithUserShortname){
			//Do we already have a conversation with this user?
			let conversation = $scope.userChatsList.$getRecord(chatWithUserId);
			if(!conversation){
				console.debug("Creating Chat Initial Metadata")
				/* If there is no a conversation with that user already,
				then we need to created the metadata folder for both Users*/
				ChatService.createBaseMetadata( $rootScope.currentSession.user.$id, chatWithUserId, chatWithUserShortname);
				//ChatService.createBaseMetadata( chatWithUserId, $rootScope.currentSession.user.$id, $rootScope.currentSession.member.member.shortname);
				ChatService.createBaseMetadata( chatWithUserId, $rootScope.currentSession.user.$id, $rootScope.currentSession.memberData.shortname);
			}else{
				$scope.openChatWithUser(chatWithUserId);
			}

		};

	}
]);

okulusApp.factory('ChatService', ['$rootScope', '$firebaseArray', '$firebaseObject', 'ErrorsSvc',
	function($rootScope, $firebaseArray, $firebaseObject, ErrorsSvc){

		let chatsRef = firebase.database().ref().child(rootFolder).child('chats');

		return {
			getUserChatMetadataList: function(userid){
				let reference = chatsRef.child("metadata").child(userid);
				return $firebaseArray(reference);
			},
			getUnreadChats: function(userid){
				let reference = chatsRef.child("metadata").child(userid).orderByChild("unreadCount").startAt(1);
				return $firebaseArray(reference);
			},
			getConversationMessages: function(useridFrom,useridTo){
				let reference = chatsRef.child("conversations").child(useridFrom).child(useridTo).child("messages");
				return $firebaseArray(reference);
			},
			getConversationMetadata: function(useridFrom,useridTo){
				let reference = chatsRef.child("metadata").child(useridFrom).child(useridTo);
				return $firebaseObject(reference);
			},
			createBaseMetadata: function(userFromId, userToId, userToShortname){
				chatsRef.child("metadata").child(userFromId).child(userToId).update({unreadCount:0, chatWith:userToShortname});
			},
			saveMessage: function(message,userFrom,userTo){
				//Save messages in both (userFrom, userTo) users' folder
				let record = { message: message, from: userFrom, time:firebase.database.ServerValue.TIMESTAMP};

				//Updates in the User sending the message
				chatsRef.child("conversations").child(userFrom).child(userTo).child("messages").push().set( record,
					function(error) {
						if(error){
							console.debug(error);
						}
					});
				//Updates in the User receiving the message
				chatsRef.child("conversations").child(userTo).child(userFrom).child("messages").push().set(record,
					function(error) {
						if(error){
							console.debug(error);
						}
					});
			}
		};/*return end*/
	}
]);
