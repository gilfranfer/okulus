/* This function will catch routeChangeError event triggeres from $routeProvider
when a route has a resolve. It will detect when the user is not logged in. */
okulusApp.run( ['$rootScope', '$location', function($rootScope,$location){
	$rootScope.$on('$routeChangeError', function( event, next, previous, error){
		if(error == 'AUTH_REQUIRED'){
			$rootScope.response = {error:true, message: systemMsgs.error.nologin, showLoginButton:true };
		}else{
			$rootScope.response = {error:true, message: error};
		}
		$location.path( constants.pages.error );
	});
}]);

/* Controller linked to page body, to control the whole app */
okulusApp.controller('AuthenticationCntrl',
	['$scope', '$rootScope', '$firebaseAuth','$location', 'AuthenticationSvc','ChatService',
		'NotificationsSvc', 'MembersSvc', 'UsersSvc', 'ErrorsSvc','UtilsSvc',
	function($scope, $rootScope, $firebaseAuth, $location, AuthenticationSvc, ChatService,
						NotificationsSvc, MembersSvc, UsersSvc,ErrorsSvc,UtilsSvc){

		/* Function executed anytime an Authetication state changes in the app.
		Like after login, or when refreshing page. */
		$firebaseAuth().$onAuthStateChanged( function(authUser){
				if(authUser){
					console.debug("AuthSvc: Auth State Changed");
					AuthenticationSvc.loadSessionData(authUser.uid).$loaded().then(
						function(loggedUser){
							/* Every User, except Root, must be linked to a Member with a reference (memberId).
							When the reference already exist, we need to check if the member is still valid */
							if(loggedUser.memberId && !loggedUser.isRoot ){
								validateMemberFromUser(loggedUser);
							}
							/* If the User doesn't have a Member reference, we'll use the User's email
							to find a matching member and link it. */
							else if(!loggedUser.memberId && !loggedUser.isRoot ){
								setMemberToUser(loggedUser);
							}
							/* Update lastlogin, and sessionStatus */
							AuthenticationSvc.updateUserLastActivity(authUser.uid, constants.status.online);
							/* Load Unread Chats Count */

							// $rootScope.unreadChats = ChatService.getUnreadChats(authUser.uid);
							// if(loggedUser.type == "admin"){
							// 	UtilsSvc.loadSystemCounter();
							// }
					});
				}else{
					cleanRootScope();
					$location.path( constants.pages.login );
				}
		});

		/* This process is to ensure the User is tagged to a valid Member.
		1. Get the Member Object from DB, using the Member Id reference in the User
		2. When no object is returned, is because the Member was deleated (error)
		3. Email from the User and the linked Member must match (error, when email upadated for the Member)
		4. The User already has a reference to the member, Now Link the Member to User (Cross Reference)
		5. Load Member data to scope only when member isActive and canBeUser
		In case of any error, Remove the Cross Reference */
		var validateMemberFromUser = function(loggedUserObj) {
			let errorMessage = undefined;
			MembersSvc.getMemberDataObject(loggedUserObj.memberId).$loaded().then(function(memberDataObj){
				if(!memberDataObj || !memberDataObj.email){
					errorMessage = systemMsgs.error.memberlinkedDoesntExist;
				}else if(memberDataObj.email != loggedUserObj.email){
					errorMessage = systemMsgs.error.memberAndUserEmailMismatch;
				}else if(memberDataObj.status != constants.status.active || !memberDataObj.canBeUser){
					errorMessage = systemMsgs.error.memberNotActiveUser;
				}else{
					/* All good: Emails match, the member is "Active" and canBeUser.
					 Update the User reference in the Member Object and save Memeber Data in rootScope */
					MembersSvc.updateUserReferenceInMemberObject(loggedUserObj.$id, memberDataObj);
					$rootScope.currentSession.memberData = memberDataObj;
				}

				if(errorMessage){
					UsersSvc.updateMemberReferenceInUserObject(null, loggedUserObj);
					if(memberDataObj){
						MembersSvc.updateUserReferenceInMemberObject(null, memberDataObj);
					}
					ErrorsSvc.logError(errorMessage + " " + systemMsgs.error.referenceRemoved);
					$rootScope.response = { error:true, message: errorMessage + " " + systemMsgs.error.contactAdmin};
					$location.path( constants.pages.error );
				}
			});
		};

		/* This process is to find a Member that matches the User's email.
		1. More than one member is an error that must be notified to the Admin
		2. Exactly one member found will be linked to the user, only if the
		   member isActive and canBeUser */
		var setMemberToUser = function(loggedUser){
			let errorMessage = undefined;
			MembersSvc.getMembersByEmail(loggedUser.email).$loaded().then(function(membersFound) {
				if(membersFound.length > 1){
					errorMessage = systemMsgs.error.moreThanOneMemberFound + " " + loggedUser.email + ".";
				}else	if(membersFound.length == 0 || !membersFound[0]){
					errorMessage = systemMsgs.error.noMemberFound + " " + loggedUser.email + ".";
				}else{
					memberObj = membersFound[0];
					membersFound.$destroy();
					if(memberObj.member.status == constants.status.active && memberObj.member.canBeUser){
						$rootScope.currentSession.memberData = memberObj.member;
						//Create Cross Reference
						UsersSvc.updateMemberReferenceInUserObject(memberObj.$id, loggedUser);
						MembersSvc.updateUserReferenceInMember(loggedUser.$id, memberObj.$id);
					}else{
						errorMessage = systemMsgs.error.memberNotActiveUser;
					}
				}

				if(errorMessage){
					ErrorsSvc.logError(errorMessage);
					$rootScope.response = { error:true, message: errorMessage + " " + systemMsgs.error.contactAdmin};
					$location.path( constants.pages.error );
				}
			});
		};

		/* Delete all properties from rootScope (except for config and i18n)*/
		var cleanRootScope = function(){
			for (var prop in $rootScope) {
			    if (prop.substring(0,1) !== '$') {
						if( prop!="config" && prop!="i18n"){
							delete $rootScope[prop];
						}
			    }
			}
		};

		/** Using firebase Auth to send Verification Email **/
		$scope.sendVerificationEmail = function() {
			firebase.auth().currentUser.sendEmailVerification().then(function() {
				$scope.response = { emailSent: true };
			}).catch(function(error) {
				$scope.response = { emailSent: false };
			});
		};

		/** Using firebase Auth to send a Password Reset Email **/
		$scope.resetPwd = function(form) {
			$scope.response = {working: true, message: systemMsgs.inProgress.sendingPwdResetEmail };
			let email = form.email.$modelValue;
			$firebaseAuth().$sendPasswordResetEmail(email).then(function() {
				$scope.response = {success: true, message: systemMsgs.success.pwdResetEmailSent };
			}).catch(function(error) {
				$scope.response = { error: true, message: systemMsgs.error.pwdResetEmailError};
			});
		};

		$scope.logout = function(){
			let userId = $rootScope.currentSession.user.$id;
			AuthenticationSvc.updateUserLastActivity(userId, constants.status.offline);
			AuthenticationSvc.logout(userId);
		};

	}]//function
);

okulusApp.controller('LoginCntrl', ['$scope', '$rootScope', '$location', 'AuthenticationSvc',
	function($scope, $rootScope, $location, AuthenticationSvc){

		let homePage ="/home";
		/* When navigating to "#!/login", but the user is already logged-in
		 we better redirect him to Home Page, instead of showing the login page */
		if($rootScope.currentSession && $rootScope.currentSession.user ){
			$location.path(homePage);
		}
		$scope.response = null;

		$scope.login = function(){
			$scope.response = {working: true, message: $rootScope.i18n.login.loginInProgress };
			AuthenticationSvc.loginUser($scope.user).then( function (user){
				$scope.response = null;
				AuthenticationSvc.updateUserLastLogin(user.uid);
				$location.path(homePage);
			})
			/* Catching unsuccessful login attempts */
			.catch( function(error){
				let message = undefined;
				switch(error.code) {
						case "auth/wrong-password":
						case "auth/user-not-found":
								message = systemMsgs.error.incorrectCredentials;
								//AuthenticationSvc.increaseFailedLoginAttemptCount(user.uid);
								break;
						default:
							message = systemMsgs.error.tryAgainLater;
				}
				$scope.response = { error: true, message: message };
			});
		};
	}]
);

okulusApp.controller('RegistrationCntrl', ['$scope', '$rootScope', '$location', 'AuthenticationSvc',
																	'AuditSvc', 'UsersSvc',
	function($scope, $rootScope, $location, AuthenticationSvc, AuditSvc, UsersSvc){
		let homePage ="/home";

		/* When navigating to "#!/register", but the user is already logged-in
		 we better redirect him to Home Page, instead of showing the login page */
		if($rootScope.currentSession && $rootScope.currentSession.user){
			$location.path(homePage);
		}

		$scope.register = function(){
			$scope.response = {working: true, message: $rootScope.i18n.register.registerInProgress };
			AuthenticationSvc.register($scope.newUser).then(function(regUser){
				$scope.response = {success: true, message: $rootScope.i18n.register.registerSuccess };
				UsersSvc.createUser(regUser.uid, $scope.newUser.email, constants.roles.user);
				AuditSvc.recordAudit(regUser.uid, "create", "users");
				$location.path(homePage);
			})
			.catch( function(error){
				let message = undefined;
				switch(error.code) {
						case "auth/email-already-in-use":
								message = systemMsgs.error.emailExist;
								break;
						default:
							message = systemMsgs.error.tryAgainLater;
				}
				$scope.response = { error: true, message: message };
				console.error(error);
			});
		};

	}]
);

/* Service methods for Authetication related tasks. */
okulusApp.factory('AuthenticationSvc', ['$rootScope','$location','$firebaseObject', 'MembersSvc', '$firebaseAuth',
	function($rootScope, $location,$firebaseObject,MembersSvc,$firebaseAuth){
		let usersFolder = firebase.database().ref().child(rootFolder).child('users')
		var auth = $firebaseAuth();

		return{
			/* Creates currentSession in $rootScope with the User Object from firebase
			 and the emailVerified status.*/
			loadSessionData: function(authUserUid){
				if(!$rootScope.currentSession){
					let emailVerified = firebase.auth().currentUser.emailVerified;
					let userObject = $firebaseObject(usersFolder.child(authUserUid));
					$rootScope.currentSession = { user: userObject, emailVerified: emailVerified };
				}
				return $rootScope.currentSession.user;
			},
			/* Update the date when User was "active" for last time, and make sure to
			update his session status (online or offline) */
			updateUserLastActivity: function(userid,sessionStatus){
				usersFolder.child(userid).update(
					{lastActivityOn: firebase.database.ServerValue.TIMESTAMP, sessionStatus:sessionStatus});
			},
			/* Only called after a successful login */
			updateUserLastLogin: function(userid){
				//TODO: Remove lastLogin: old value. setting null to remove from DB
				let record = { lastLoginOn:firebase.database.ServerValue.TIMESTAMP, lastLogin:null};
				usersFolder.child(userid).update(record);
			},
			loginUser: function(user){
				return auth.$signInWithEmailAndPassword(user.email,user.pwd);
			},
			logout: function(userId){
				return auth.$signOut();
			},
			isUserLoggedIn: function(){
				return auth.$requireSignIn();
			},
			register: function(user){
				return auth.$createUserWithEmailAndPassword(user.email, user.pwd);
			}
		};//return
	}
]);

/* Controller linked to /home */
okulusApp.controller('HomeCntrl',
	['$scope','$location','$firebaseAuth', 'AuthenticationSvc', 'MessageCenterSvc',
	function($scope,$location, $firebaseAuth,AuthenticationSvc, MessageCenterSvc){

		$firebaseAuth().$onAuthStateChanged( function(authUser){
			if(!authUser) return;
			AuthenticationSvc.loadSessionData(authUser.uid).$loaded().then(function(user){
				if(user.isRoot){
					//Root User needs to be redirected to /admin/monitor
					$location.path(constants.pages.adminMonitor);
				}else if(!user.memberId){
					$rootScope.response = { error:true, message: systemMsgs.error.tryAgainLater};
					$location.path(constants.pages.error);
				}
			});
		});

	}]
);
