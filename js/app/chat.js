/* Controller linked to /chats */
okulusApp.controller('ChatCenterCntrl',
	['$rootScope','$scope','$firebaseAuth','$location','AuthenticationSvc','MembersSvc','UsersSvc','ChatSvc',
	function($rootScope,$scope,$firebaseAuth,$location,AuthenticationSvc,MembersSvc,UsersSvc,ChatSvc){
		const messageExcerptSize = 25;
		const delay = 25;

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
				let messageRecord = {message:message, from:senderId, time:timestamp};

				//Save Message in Sender's Folder first
				let messageReference = ChatSvc.persistMessage(senderId, receiverId, messageRecord, null);
				messageReference.once('value').then(function(persistedMessage) {
				  //The Promise was "fulfilled" (it succeeded). So proceed with other updates
					let chatRoomSummaryRecord = {lastMessageExcerpt:messageExcerpt, lastMessageFrom:senderId,
						lastMessageOn:timestamp, lastMessageId:messageReference.key};
					//Update the Sender's ChatRoom summary
					ChatSvc.updateChatRoomSummary(senderId, receiverId, chatRoomSummaryRecord);
					//Set Sender's ChatRoom as Readed (unreadCount=0)
					ChatSvc.setChatRoomUnreadCount(receiverId,0);
					//Remove this chat from Sender's unreadChats List
					ChatSvc.removeChatFromUnreadList(senderId,receiverId);

					//Save Message in Receiver's Folder, using the same Key from the previous message
					ChatSvc.persistMessage(receiverId, senderId, messageRecord, messageReference.key);
					/*Update the Receiver's ChatRoom summary. Including the shortname of the
					loggedUser as chattingWith, in case the Receiver was not having the ChatRoom before*/
					chatRoomSummaryRecord.chattingWith = $rootScope.currentSession.memberData.shortname
					let chatRoomRef = ChatSvc.updateChatRoomSummary(receiverId,senderId,chatRoomSummaryRecord);
					chatRoomRef.once('value').then(function(updatedChatRoom) {
						/*Increase Receiver's ChatRoom unreadCount. Thi is done in the Promise
						after the ChatRoom Summary is updated/created because, if it didnt exists
						before, the unread count was not going to be increased. */
						ChatSvc.increaseChatRoomUnreadCount(receiverId,senderId);
					}, function(error) {console.error(error);});
					//Add this chat to Receiver's unreadChats List
					ChatSvc.addChatToUnreadList(receiverId,senderId);
		      scrollBottom();
				}, function(error) {console.error(error);});
			}
		};

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

		/* Used by "Delete" icon to set the selected message in the
		chatCenterParams, for further use (when performing the actual delete)*/
		$scope.prepareForDelete = function(message){
			$scope.chatCenterParams.messageToDelete = message;
		};

		/*Called from deleteMessageModal, to delete the message only from the
		loggedUser's db folder. It will use the message previously saved in the
		chatCenterParams, using prepareForDelete(). For security, double chek the message
		belongs to the loggedUser*/
		$scope.deleteMessageForUser = function(){
			let messageObj = $scope.chatCenterParams.messageToDelete;
			let loggedUserId = $scope.chatCenterParams.loggedUserId;
			let chatRoomId = $scope.chatCenterParams.activeChatWith;

			if(messageObj.from == loggedUserId){
				ChatSvc.softDeleteForUser(loggedUserId,chatRoomId,messageObj.$id);
				//Update ChatRooms Summary
				let messageInChatRoomSummary = $rootScope.chatList.$getRecord(chatRoomId).lastMessageId;
				if(messageObj.$id == messageInChatRoomSummary){
					//Update the Sender's ChatRoom summary
					let messageTxt = $rootScope.i18n.chat.deletedForUser;
					ChatSvc.updateChatRoomSummary(loggedUserId, chatRoomId, {lastMessageExcerpt:messageTxt});
				}
			}
			$scope.chatCenterParams.messageToDelete = undefined;
		};

		/*Called from deleteMessageModal, to soft delete the message for both, the
		sender and receiver's db folder. It will use the message previously saved in the
		chatCenterParams, using prepareForDelete(). For security, double chek the message
		belongs to the loggedUser*/
		$scope.deleteMessageForBoth = function(){
			let messageObj = $scope.chatCenterParams.messageToDelete;
			let loggedUserId = $scope.chatCenterParams.loggedUserId;
			let chatRoomId = $scope.chatCenterParams.activeChatWith;

			if(messageObj.from == loggedUserId){
				//Delete from Sender's Folder
				ChatSvc.softDeleteForAll(loggedUserId,chatRoomId,messageObj.$id);
				//Delete from Receiver's Folder
				ChatSvc.softDeleteForAll(chatRoomId,loggedUserId,messageObj.$id);
				//Update ChatRooms Summary
				let messageInChatRoomSummary = $rootScope.chatList.$getRecord(chatRoomId).lastMessageId;
				if(messageObj.$id == messageInChatRoomSummary){
					//Update the Sender's ChatRoom summary
					let messageTxt = $rootScope.i18n.chat.deletedForAll;
					ChatSvc.updateChatRoomSummary(loggedUserId, chatRoomId, {lastMessageExcerpt:messageTxt});
					//Update the Receiver's ChatRoom summary
					ChatSvc.updateChatRoomSummary(chatRoomId, loggedUserId, {lastMessageExcerpt:messageTxt});
				}
			}
			$scope.chatCenterParams.messageToDelete = undefined;
		};

		/* Used by "Edit" icon to set the selected message in the
		chatCenterParams, for further use (when performing the actual edit)*/
		$scope.prepareForEdit = function(messageObg){
			$scope.chatCenterParams.messageToEdit = messageObg;
			$scope.chatCenterParams.editedMessagetTxt = messageObg.message;
		};

		/*Called from editMessageModal, to save updates to the message.
		It will use two params from chatCenterParams: 1) the message previously saved,
		using setMessage(), 2) and the chattingWith param. For security, double chek
		the message belongs to the loggedUser*/
		$scope.editMessage = function(){
			let editedMessagetTxt = $scope.chatCenterParams.editedMessagetTxt;
			let messageObj = $scope.chatCenterParams.messageToEdit;
			let loggedUserId = $scope.chatCenterParams.loggedUserId;
			let chatRoomId = $scope.chatCenterParams.activeChatWith;

			if(messageObj.from == loggedUserId){
				//Update Message in the Sender's folder
				ChatSvc.updateMessageText(loggedUserId,chatRoomId,messageObj.$id,editedMessagetTxt);
				//Update Message in the Receiver's folder
				ChatSvc.updateMessageText(chatRoomId,loggedUserId,messageObj.$id,editedMessagetTxt);
				//Update ChatRooms Summary
				let messageInChatRoomSummary = $rootScope.chatList.$getRecord(chatRoomId).lastMessageId;
				if(messageObj.$id == messageInChatRoomSummary){
					let messageExcerpt = (editedMessagetTxt.length<messageExcerptSize)?editedMessagetTxt:(editedMessagetTxt.substring(0, messageExcerptSize-3)+"...");
					//Update the Sender's ChatRoom summary
					ChatSvc.updateChatRoomSummary(loggedUserId, chatRoomId, {lastMessageExcerpt:messageExcerpt});
					//Update the Receiver's ChatRoom summary
					ChatSvc.updateChatRoomSummary(chatRoomId, loggedUserId, {lastMessageExcerpt:messageExcerpt});
				}
			}
			$scope.chatCenterParams.messageToEdit = undefined;
		};

		/* Added a delay to this method to ensure that all HTML elements are fully
		rendered before setting the scroll position to the bottom of the chat area*/
		scrollBottom = function(){
			var element = document.getElementById("messagesList");
			setTimeout(function() {
				element.scrollTop = element.scrollHeight;
			}, delay)
		};

		scrollToTop = function(){
			var element = document.getElementById("messagesList");
    		element.scrollTop = 0;
		}

		/*This function will watch for scroll. Once it reaches the top, it will load
		older messages, increasing the limit value used for the Db query. */
		$('#messagesList').scroll(function() {
	    var pos = $('#messagesList').scrollTop();
			//check if we have reached the top of the list
	    if(pos == 0){
				let loggedUserId = $rootScope.currentSession.user.$id;
				let chatRoomId = $scope.chatCenterParams.activeChatWith;
				let messagesLimit = $scope.chatCenterParams.activeChatLimit + $rootScope.config.maxQueryListResults;
				$scope.chatCenterParams.activeChatLimit = messagesLimit;
				$scope.chatCenterParams.activeChatMessages = ChatSvc.getChatMessages(loggedUserId,chatRoomId,messagesLimit);
	    }
		});
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
				return reference;
			},
			/* Soft Delete a Message. Remove the message text, and set "wasDeleted" value.*/
			softDeleteForUser: function(userId,chatRoomId,messageId){
				let reference = chatsRef.child(userId).child(constants.folders.chatMessages).child(chatRoomId).child(messageId);
				reference.update({deletedForUser:true,deletedForAll:null,wasEdited:null,message:null});
			},
			/* Soft Delete a Message. Remove the message text, and set "wasDeleted" value.*/
			softDeleteForAll: function(userId,chatRoomId,messageId){
				let reference = chatsRef.child(userId).child(constants.folders.chatMessages).child(chatRoomId).child(messageId);
				reference.update({deletedForAll:true,deletedForUser:null,wasEdited:null,message:null});
			},
			/* Soft Delete a Message. Remove the message text, and set "wasDeleted" value.*/
			updateMessageText: function(userId,chatRoomId,messageId,editedMessagetTxt){
				let reference = chatsRef.child(userId).child(constants.folders.chatMessages).child(chatRoomId).child(messageId);
				reference.update({message:editedMessagetTxt,wasEdited:true});
			}
		};
	}
]);
