/* Controller linked to /chats */
okulusApp.controller('ChatCenterCntrl',
	['$rootScope','$scope','$firebaseAuth','$location','AuthenticationSvc','MembersSvc','UsersSvc','ChatSvc',
	function($rootScope,$scope,$firebaseAuth,$location,AuthenticationSvc,MembersSvc,UsersSvc,ChatSvc){
		const messageExcerptSize = 25;

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
				/* Setting some values useful in the frontend */
				$scope.chatCenterParams = {
					chatAreaHeight: Math.round(window.innerHeight*.75),
					loggedUserId: loggedUser.$id, //loggedUserEmail: loggedUser.email,
					activeChatWith:undefined, activeChatMessages: undefined,
					activeChatLimit: undefined
				};
				/*Load User's Chat List*/
				if(!$rootScope.chatList){
					$rootScope.chatList = ChatSvc.getChatRoomsForUser(loggedUser.$id);
				}
				$rootScope.chatList.$loaded().then(function(list){ $scope.response = undefined; });

				//Register vent to post message with "Enter"
				document.querySelector('#chatInput').addEventListener('keyup', function(e){
		      if (e.keyCode === 13 && !e.shiftKey) {
		        sendMessage();
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
				ChatSvc.createChatRoomWith(loggedUserId,selectedUser);
			}
		};

		/* Called when clicking an element from the ChatRooms List */
		$scope.openChatRoom = function(chatRoom){
			let loggedUserId = $rootScope.currentSession.user.$id;
			let previuosChatWith = $scope.chatCenterParams.activeChatWith;

			/* Load Messages, and update view only when clicking in a different Chat */
			if(previuosChatWith != chatRoom.$id){
				document.getElementById("chatInput").value = "";
				$scope.chatCenterParams.activeChatMessages = undefined;
				$scope.chatCenterParams.activeChatWith = chatRoom.$id;

				/* Remove Styles to previous Selected Chat*/
				let htmlElement = document.getElementById("chat-"+previuosChatWith);
				if(htmlElement){
					htmlElement.classList.remove("active");
					htmlElement.classList.remove("text-white");
				}
				/* Add Styles to Selected Chat*/
				htmlElement = document.getElementById("chat-"+chatRoom.$id);
				if(htmlElement){
					htmlElement.classList.add("active");
					htmlElement.classList.add("text-white");
				}

				/*Get the Chat Messages from the loggedUserId folder, and Mark Chat as Read*/
				let limit = $rootScope.config.maxQueryListResults;
				$scope.chatCenterParams.activeChatLimit = limit;
				$scope.chatCenterParams.activeChatMessages = ChatSvc.getChatMessages(loggedUserId,chatRoom.$id,limit);
			}

			/* This should be done anytime you clic in the chatRoom, even if it's already selected.
			 After Chat Messages are retrieved from DB*/
			$scope.chatCenterParams.activeChatMessages.$loaded().then(function(messages) {
				//Clean Input Area
				document.getElementById("chatInput").focus();
				//Set unreadCount to 0 on ChatRoom
				ChatSvc.setChatRoomUnreadCount(chatRoom.$id,0);
				//Remove this chat from unreadChats List
				ChatSvc.removeChatFromUnreadList(loggedUserId,chatRoom.$id);
				scrollBottom();
			});
		};

		/* Persist the Message to Firebase, and perform updates in the unreadChats and the chatRoom summary */
		sendMessage = function(){
			let senderId = $scope.chatCenterParams.loggedUserId;
			let receiverId = $scope.chatCenterParams.activeChatWith;
			let chatInput = document.getElementById("chatInput");
			let message = chatInput.value.trim();
			chatInput.value = "";

			//(receiverId==chatRoomId)
			if(message && receiverId){
				let timestamp = firebase.database.ServerValue.TIMESTAMP;
				//Prepare the ChatRoom Summary record, and Message Record
				let messageExcerpt = (message.length<messageExcerptSize)?message:(message.substring(0, messageExcerptSize-3)+"...");
				let chatRoomSummaryRecord = {lastMessageExcerpt:messageExcerpt, lastMessageFrom:senderId, lastMessageOn:timestamp}
				let messageRecord = {message:message, from:senderId, time:timestamp};

				//Save Message in Sender's Folder
				let messageReference = ChatSvc.persistMessage(senderId, receiverId, messageRecord, null);
				//Update the Sender's ChatRoom summary
				ChatSvc.updateChatRoomSummary(senderId, receiverId, chatRoomSummaryRecord);
				//Set Sender's Chat as Readed
				ChatSvc.setChatRoomUnreadCount(receiverId,0);
				//Remove this chat from Sender's unreadChats List
				ChatSvc.removeChatFromUnreadList(senderId,receiverId);

				//Save Message in Receiver's Folder, using the same Key from the previous message
				ChatSvc.persistMessage(receiverId, senderId, messageRecord, messageReference.key);
				/*Update the Receiver's ChatRoom summary. Including the shortname of the
				loggedUser as chattingWith, in case the Receiver was not having the ChatRoom before*/
				chatRoomSummaryRecord.chattingWith = $rootScope.currentSession.memberData.shortname
				ChatSvc.updateChatRoomSummary(receiverId,senderId,chatRoomSummaryRecord);
				//Increase Receiver's ChatRoom unreadCount
				ChatSvc.increaseChatRoomUnreadCount(receiverId,senderId);
				//Add this chat to Receiver's unreadChats List
				ChatSvc.addChatToUnreadList(receiverId,senderId);
			}
			scrollBottom();
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

		/* Expand/retract the Menu with the Delete and Edit icons,
		and the full message's date*/
		$scope.showMessageMenu = function(message){
			let messageId = message.$id;
			let previous = $scope.chatCenterParams.showMenuInMessage;
			if(messageId == previous){
				//clicking for secondtime in the same message
				$scope.chatCenterParams.showMenuInMessage = undefined;
			}else{
				$scope.chatCenterParams.showMenuInMessage = messageId;
			}
		};

		/* Used by "Delete" and "Edit" icons to set the selected message in the
		chatCenterParams, for further use (when performing the actual edit/delete)*/
		$scope.setMessage = function(message){
			$scope.chatCenterParams.selectedMessage = message;
		};

		/*Called from deleteMessageModal, to delete the message only from the
		loggedUser's db folder. It will use the message previously saved in the
		chatCenterParams, using setMessage(). For security, double chek the message
		belongs to the loggedUser*/
		$scope.deleteMessageForUser = function(){
			let message = $scope.chatCenterParams.selectedMessage;
			let loggedUserId = $scope.chatCenterParams.loggedUserId;
			let chatRoomId = $scope.chatCenterParams.activeChatWith;
			if(message.from == loggedUserId){
				ChatSvc.deleteChatMessage(loggedUserId,chatRoomId,message.$id);
			}
			$scope.chatCenterParams.selectedMessage = undefined;
		};

		$scope.deleteMessageForBoth = function(){
			let message = $scope.chatCenterParams.selectedMessage;
			let loggedUserId = $scope.chatCenterParams.loggedUserId;
			let chatRoomId = $scope.chatCenterParams.activeChatWith;
			if(message.from == loggedUserId){
				//Delete from Sender's Folder
				ChatSvc.softDeleteMessage(loggedUserId,chatRoomId,message.$id);
				//Delete from Receiver's Folder
				ChatSvc.softDeleteMessage(chatRoomId,loggedUserId,message.$id);
			}
			$scope.chatCenterParams.selectedMessage = undefined;
		};

	}
]);

/* New Service for the Chat Refactor */
okulusApp.factory('ChatSvc',
	['$rootScope', '$firebaseArray', '$firebaseObject',
	function($rootScope, $firebaseArray, $firebaseObject){
		let chatsRef = firebase.database().ref().child(rootFolder).child( constants.folders.chats );

		return {
			/* Returns $firebaseArray with the list of unread ChatRoom Ids for the given user.
			This is mainly used in AuthenticationSvc for the navigation badge.*/
			getUnreadChatsForUser: function(userId){
				let reference = chatsRef.child(userId).child(constants.folders.unreadChats);
				return $firebaseArray(reference);
			},
			/* Returns $firebaseArray with all the chat rooms for the given user */
			getChatRoomsForUser: function(userId){
				let reference = chatsRef.child(userId).child(constants.folders.chatList);
				return $firebaseArray(reference);
			},
			/* Returns $firebaseObject with the specific chat room*/
			getChatRoomObject: function(userId,chatWithUserId){
				let reference = chatsRef.child(userId).child(constants.folders.chatList).child(chatWithUserId);
				return $firebaseObject(reference);
			},
			/* Create a new object in the User's ChatRooms
				chatWithUserObj is a User Object that represents the User chatting with*/
			createChatRoomWith: function(userId, chatWithUserObj){
				let newChat = {
					chattingWith:chatWithUserObj.shortname, lastMessageOn:firebase.database.ServerValue.TIMESTAMP
				};
				let newChatRef = chatsRef.child(userId).child(constants.folders.chatList).child(chatWithUserObj.$id);
				newChatRef.update(newChat);
			},
			/* Returns $firebaseArray with the chat messages between the loggedUser and
			the user selected from the chatList. The limit will help to reduce the data downloaded */
			getChatMessages: function(loggedUser,chatWithUserId,limit){
				let reference = chatsRef.child(loggedUser).child(constants.folders.chatMessages).child(chatWithUserId).orderByKey().limitToLast(limit);;
				return $firebaseArray(reference);
			},
			/* Persist a Message in the firebase location /chats/{{userId}}/messages/{{chattingWithId}}
			and return the reference to the recenlty created message. This method should be called twice for each
			message in the chat. The first time will be to save the message in the Sender's Db folder, and the
			param messageKey should be null. The second time will be to save the message in the Receiver's Db folder,
			and the param messageKey should be valid because it will be used as Key for the new message. */
			persistMessage: function(userId, chattingWithId, messageRecord, messageKey){
				let newMessageRef = chatsRef.child(userId).child(constants.folders.chatMessages).child(chattingWithId);
				if(!messageKey){
					//Used when persisting a Message in the Sender's Db folder
					newMessageRef = newMessageRef.push();
				}else {
					//Used when persisting a Message in the Receiver's Db Folder
					newMessageRef = newMessageRef.child(messageKey);
				}
				newMessageRef.set(messageRecord,
					function(error) {
						if(error){
							console.error(error);
						}
					});
				return newMessageRef;
			},
			/* Update the unreadCount value of the logged User's chatRoom, using the
			chatList ($firebaseArray) that should be available in rootScope. */
			setChatRoomUnreadCount: function (chatRoomId, count){
				let chatRoom = $rootScope.chatList.$getRecord(chatRoomId);
				chatRoom.unreadCount = count;
				$rootScope.chatList.$save(chatRoom).then(function(){});
			},
			/*Using transaction to Increase the count by 1*/
			increaseChatRoomUnreadCount: function (userid,chatRoomId){
				let chatRoomRef = chatsRef.child(userid).child(constants.folders.chatList).child(chatRoomId).child(constants.folders.unreadCount);
				chatRoomRef.transaction(function(currentUnread) {
					return currentUnread+1;
				});
			},
			/* Remove the Chat Id from the /chats/{{userId}}/unreadChats list*/
			removeChatFromUnreadList: function (userId, chatRoomId){
				let reference = chatsRef.child(userId).child(constants.folders.unreadChats).child(chatRoomId);
				reference.set({});
			},
			/* Add the Chat Id to the /chats/{{userId}}/unreadChats list*/
			addChatToUnreadList: function (userId, chatRoomId){
				let reference = chatsRef.child(userId).child(constants.folders.unreadChats).child(chatRoomId);
				reference.set(true);
			},
			/*Called when sending a Message, to update the ChatRoom Summary*/
			updateChatRoomSummary: function(userId,chatRoomId,record) {
				let reference = chatsRef.child(userId).child(constants.folders.chatList).child(chatRoomId);
				reference.update(record);
			},
			/*Delete a Message */
			deleteChatMessage: function(userId,chatRoomId,messageId){
				let reference = chatsRef.child(userId).child(constants.folders.chatMessages).child(chatRoomId).child(messageId);
				reference.set({});
			},
			/* Soft Delete a Message. Remove the message text, and set "wasDeleted" value.*/
			softDeleteMessage: function(userId,chatRoomId,messageId){
				let reference = chatsRef.child(userId).child(constants.folders.chatMessages).child(chatRoomId).child(messageId);
				reference.update({message:"",wasDeleted:true});
			}
		};
	}
]);
