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
				$scope.activeChatId = undefined;
				$scope.loggedUserId = authUser.uid;
				$scope.loggedUserEmail = authUser.email;
    			$scope.chatSectionHeight = Math.round(window.innerHeight*.75);
				
				$scope.userChatsList = ChatService.getUserConversationsList(authUser.uid);
				//Filter this list to show only users with whim I dont have a chat yet
				$scope.usersList = MembersSvc.getMembersWithUser();

			});
			
		}});

	
		document.getElementById("chatInput").focus();
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
	        if($scope.activeChatId && message){
				ChatService.saveMessage(message, $scope.loggedUserEmail, $scope.loggedUserId, $scope.activeChatId );
				//Update the receiver metadata
				$scope.activeChatMetadataTo.$loaded().then(function(metadata){
					metadata.unreadCount = metadata.unreadCount+1;
					metadata.lastReceivedOn = firebase.database.ServerValue.TIMESTAMP;
					metadata.lastReceivedExcerpt = (message.length<messagePreviewSize)?message:(message.substring(0, messagePreviewSize-3)+"...");
					metadata.$save();
				});
				//Clean unreadCount for this chat everytime you click on it
				$scope.activeChatMetadataFrom.$loaded().then(function(metadata){
					metadata.unreadCount = 0;
					metadata.$save().then(function(){
						scrollBottom();
					});
				});
	        }
	        chatInput.value = "";
	        //scrollBottom();
		};

		scrollBottom = function(){
			var element = document.getElementById("chatArea");
    		element.scrollTop = element.scrollHeight;
		}

		$scope.openChatWithUser = function(chatWithUserId){
			let loggedUserId = $rootScope.currentSession.user.$id;

			//Visual updates on the previous selected chat
			let prevHtmlElement = document.getElementById("chat-"+$scope.activeChatId);
			if($scope.activeChatId && prevHtmlElement){
				prevHtmlElement.classList.remove("active");
				prevHtmlElement.classList.remove("text-white");
			}

			//Load Messages only if clicking in a different Chat
			if( !$scope.activeChatId || ($scope.activeChatId && $scope.activeChatId != chatWithUserId) ){
				$scope.activeChatId = chatWithUserId;
				$scope.activeChatMessages = undefined;
				//Get the Chat conversation Messages from the loggedUserId folder
				$scope.activeChatMessages = ChatService.getConversationMessages(loggedUserId,chatWithUserId);
				$scope.activeChatMessages.$loaded().then(function(event) {
					$scope.activeChatMessages.$watch(function(event) {scrollBottom();});
					scrollBottom();
				});
				//Metadata for this conversation (receiver folder). Used when sending messages
				$scope.activeChatMetadataTo = ChatService.getConversationMetadata(chatWithUserId,loggedUserId);
				//Metadata for this conversation (sender folder, the loggedUser)
				$scope.activeChatMetadataFrom = ChatService.getConversationMetadata(loggedUserId,chatWithUserId);
			}

			//Clean unreadCount for this chat everytime you click on it
			$scope.activeChatMetadataFrom.$loaded().then(function(metadata){
				metadata.unreadCount = 0;
				metadata.$save();
			});

			//Visual updates on the selected chat
			scrollBottom();
			document.getElementById("chatInput").focus();
			let htmlElement = document.getElementById("chat-"+chatWithUserId);
			if( htmlElement ){
				htmlElement.classList.add("active");
				htmlElement.classList.add("text-white");
			}
		};

		$scope.initChatWithUser = function(chatWithUserId,chatWithUserShortname){
			//Do we already have a conversation with this user?
			let conversation = $scope.userChatsList.$getRecord(chatWithUserId);
			if(!conversation){
				console.log("Creating Chat Initial Metadata")
				/* If there is no a conversation with that user already, 
				then we need to created the metadata folder for both Users*/
				ChatService.createBaseMetadata( $rootScope.currentSession.user.$id, $rootScope.currentSession.member.member.shortname, 
												chatWithUserId, chatWithUserShortname);
			}else{
				$scope.openChatWithUser(chatWithUserId);
			}

		};

	}
]);

okulusApp.factory('ChatService', ['$rootScope', '$firebaseArray', '$firebaseObject','AuditSvc', 'ErrorsSvc',
	function($rootScope, $firebaseArray, $firebaseObject, AuditSvc,ErrorsSvc){

		let chatsRef = firebase.database().ref().child('pibxalapa').child('chats');

		return {
			getUserConversationsList: function(userid){
				let reference = chatsRef.child(userid).child("conversations");
				return $firebaseArray(reference);
			},
			getConversationMessages: function(useridFrom,useridTo){
				let reference = chatsRef.child(useridFrom).child("conversations").child(useridTo).child("messages");
				return $firebaseArray(reference);
			},
			getConversationMetadata: function(useridFrom,useridTo){
				let reference = chatsRef.child(useridFrom).child("conversations").child(useridTo).child("metadata");
				return $firebaseObject(reference);
			},
			createBaseMetadata: function(userFromId, userFromShortname,userToId, userToShortname){
				chatsRef.child(userFromId).child("conversations").child(userToId).child("metadata").update({unreadCount:0, chatWith:userToShortname});
				chatsRef.child(userToId).child("conversations").child(userFromId).child("metadata").update({unreadCount:0, chatWith:userFromShortname});
			},
			saveMessage: function(message,emailFrom,userFrom,userTo){
				//Save messages in both (userFrom, userTo) users' folder
				let record = { message: message, 
								audit:{createdOn:firebase.database.ServerValue.TIMESTAMP,createdBy:emailFrom}};
				
				//Updates in the User sending the message
				chatsRef.child(userFrom).child("conversations").child(userTo).child("messages").push().set( record, 
					function(error) {
						if(error){
							ErrorsSvc.logError(error);
							console.log(error);
						}
					});
				//Updates in the User receiving the message
				chatsRef.child(userTo).child("conversations").child(userFrom).child("messages").push().set(record, 
					function(error) {
						if(error){
							ErrorsSvc.logError(error);
							console.log(error);
						}
					});
			}
		};/*return end*/
	}
]);
