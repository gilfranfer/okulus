okulusApp.factory('ChatService',
	['$rootScope', '$firebaseArray', '$firebaseObject', 'ErrorsSvc',
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

/* New Controller linked to /chats */
okulusApp.controller('ChatCenterCntrl',
	['$rootScope','$scope','$firebaseAuth','$location','AuthenticationSvc','MembersSvc','UsersSvc','ChatSvc',
	function($rootScope,$scope,$firebaseAuth,$location,AuthenticationSvc,MembersSvc,UsersSvc,ChatSvc){

		/* Executed everytime we enter to Chat Center
		  This function is used to confirm the user is logged and prepare some initial values */
		$scope.response = {loading: true, message: $rootScope.i18n.alerts.loading };
		$firebaseAuth().$onAuthStateChanged( function(authUser){ if(authUser){
			AuthenticationSvc.loadSessionData(authUser.uid).$loaded().then(function(loggedUser){
				if(!loggedUser.memberId){
					$rootScope.response = { error:true, message: systemMsgs.error.noMemberAssociated};
					$location.path(constants.pages.error);
					return;
				}
				$scope.chatCenterParams = {
					chatAreaHeight: Math.round(window.innerHeight*.75),
					loggedUserId: authUser.uid,
					loggedUserEmail: authUser.email,
					activeChatWith:undefined, activeChatMessages: undefined,
					activeChatLimit: undefined
				};
				/*Load User's Chat List*/
				if(!$rootScope.chatList){
					$rootScope.chatList = ChatSvc.getChatListForUser(loggedUser.$id);
				}
				$rootScope.chatList.$loaded().then(function(list){ $scope.response = undefined; });

				//Event to post message with "Enter"
				document.querySelector('#chatInput').addEventListener('keyup', function(e){
		      if (e.keyCode === 13 && !e.shiftKey) {
		        aveMessage();
		    	}
				});
			});
		}});

		/* Prepare the List of Valid Users that will be displayed in the newChat modal*/
		$scope.openNewChatModal = function(){
			$rootScope.allValidUsersList = UsersSvc.loadValidUsersList();
		};

		/* Function called from newChat modal, when clicking on a User name from the list.
		Use the ChatSvc to create a new Chat in the User's chatList folder */
		$scope.closeNewChatModal = function(selectedUser){
			let loggedUserId = $rootScope.currentSession.user.$id;
			let chatExists = $rootScope.chatList.$getRecord(selectedUser);
			if(!chatExists){
				ChatSvc.createChatWith(loggedUserId,selectedUser);
				//Should I creae the chat in both users?
			}
		};

		/* Called when clicking an element from the ChatList */
		$scope.openChatWithUser = function(activeChatWith){
			let loggedUserId = $rootScope.currentSession.user.$id;
			let previuosChatWith = $scope.chatCenterParams.activeChatWith;

			/* Load Messages, and update view only when clicking in a different Chat */
			if(previuosChatWith != activeChatWith){
				$scope.chatCenterParams.activeChatMessages = undefined;
				$scope.chatCenterParams.activeChatWith = activeChatWith;

				document.getElementById("chatInput").value = "";
				/* Remove Styles to previous Selected Chat*/
				let htmlElement = document.getElementById("chat-"+previuosChatWith);
				if(htmlElement){
					htmlElement.classList.remove("active");
					htmlElement.classList.remove("text-white");
				}
				/* Add Styles to Selected Chat*/
				htmlElement = document.getElementById("chat-"+activeChatWith);
				if(htmlElement){
					htmlElement.classList.add("active");
					htmlElement.classList.add("text-white");
				}

				//Get the Chat conversation Messages from the loggedUserId folder
				let limit = $rootScope.config.maxQueryListResults;
				$scope.chatCenterParams.activeChatLimit = limit;
				$scope.chatCenterParams.activeChatMessages = ChatSvc.getChatMessages(loggedUserId,activeChatWith,limit);
				//$scope.chatCenterParams.activeChatMessages.$watch(function(event) {scrollBottom();});

				//Metadata for this conversation (receiver folder). Used when sending messages
				//$scope.chatCenterParams.activeChatMetadataTo = ChatService.getConversationMetadata(chatId,loggedUserId);
				//Metadata for this conversation (sender folder, the loggedUser)
				//$scope.chatCenterParams.activeChatMetadataFrom = ChatService.getConversationMetadata(loggedUserId,chatId);
			}

			document.getElementById("chatInput").focus();
			scrollBottom();

			//Clean unreadCount for this chat everytime you click on it
			// $scope.chatCenterParams.activeChatMetadataFrom.$loaded().then(function(metadata){
			// 	metadata.unreadCount = 0;
			// 	metadata.$save().then(function(){
			// 		//Visual updates on the selected chat
			// 		document.getElementById("chatInput").value = "";;
			// 		document.getElementById("chatInput").focus();
			// 		let htmlElement = document.getElementById("chat-"+chatId);
			// 		if( htmlElement ){
			// 			htmlElement.classList.add("active");
			// 			htmlElement.classList.add("text-white");
			// 		}
			// 		scrollBottom();
			// 	});
			// });
		};

		const messageExcerptSize = 25;
		saveMessage = function(){
			let chatInput = document.getElementById("chatInput");
			let message = chatInput.value.trim();
	    if($scope.activeChatWith && message){
				ChatService.saveMessage(message, $scope.loggedUserId, $scope.activeChatWith);
				//Update the receiver metadata
				$scope.activeChatMetadataTo.$loaded().then(function(metadata){
					metadata.unreadCount = metadata.unreadCount+1;
					metadata.lastMessageOn = firebase.database.ServerValue.TIMESTAMP;
					metadata.lastMessageExcerpt = (message.length<messageExcerptSize)?message:(message.substring(0, messageExcerptSize-3)+"...");
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

		/* Current problem is this method doesnt work the first time you open the chat,
		because the messages are printed async, after the data comes from Firebase */
		scrollBottom = function(){
			var element = document.getElementById("messagesList");
    	element.scrollTop = element.scrollHeight;
		};

		scrollToTop = function(){
			var element = document.getElementById("messagesList");
    		element.scrollTop = 0;
		}

	}
]);

/* New Service for the Chat Refactor */
okulusApp.factory('ChatSvc',
	['$rootScope', '$firebaseArray', '$firebaseObject',
	function($rootScope, $firebaseArray, $firebaseObject){
		let chatsRef = firebase.database().ref().child(rootFolder).child( constants.folders.chats );

		return {
			/* Returns $firebaseObject with the Chats metadata for the given user */
			getChatMetadataForUser: function(userId){
				let reference = chatsRef.child(userId).child(constants.folders.metadata);
				return $firebaseObject(reference);
			},
			/* Returns $firebaseArray with the chat list for the given user */
			getChatListForUser: function(userId){
				let reference = chatsRef.child(userId).child(constants.folders.chatList);
				return $firebaseArray(reference);
			},
			/* Create a new object in the User's Chatlist
				chatWithUser is a User Object that represents the person chatting with*/
			createChatWith: function(loggedUserId, chatWithUser){
				let newChat = {
					recipientAlias:chatWithUser.shortname,
					lastMessageExcerpt:"", lastMessageOn:firebase.database.ServerValue.TIMESTAMP, unreadCount: 0
				};
				let newChatRef = chatsRef.child(loggedUserId).child(constants.folders.chatList).child(chatWithUser.$id);
				newChatRef.update(newChat);
			},
			getChatMessages: function(loggedUser,chatWithUserId,limit){
				let reference = chatsRef.child(loggedUser).child(constants.folders.chatMessages).child(chatWithUserId).orderByKey().limitToLast(limit);;
				return $firebaseArray(reference);
			}
		};/*return end*/
	}
]);
