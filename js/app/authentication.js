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
	['$scope','$rootScope','$firebaseAuth','$location','AuthenticationSvc','ChatSvc','MembersSvc','UsersSvc', 'ErrorsSvc',
	function($scope,$rootScope,$firebaseAuth,$location,AuthenticationSvc,ChatSvc,MembersSvc,UsersSvc,ErrorsSvc){

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
							$rootScope.currentSession.unreadChats = ChatSvc.getUnreadChatsForUser(authUser.uid);
							if(loggedUser.type == "admin"){
								$rootScope.errorsGlobalCount = ErrorsSvc.getGlobalErrorCounter();
							}
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
		5. Load Member data to scope only when member isActive
		In case of any error, Remove the Cross Reference */
		var validateMemberFromUser = function(loggedUserObj) {
			let errorMessage = undefined;
			MembersSvc.getMemberBasicDataObject(loggedUserObj.memberId).$loaded().then(function(memberDataObj){
				if(!memberDataObj || !memberDataObj.email){
					errorMessage = systemMsgs.error.memberlinkedDoesntExist;
				}else if(memberDataObj.email != loggedUserObj.email){
					errorMessage = systemMsgs.error.memberAndUserEmailMismatch;
				}else if(!memberDataObj.isActive){
					errorMessage = systemMsgs.error.memberNotActiveUser;
				}else{
					/* All good: Emails match, and the member isActive.
					 Update the UserId reference in the Member Object.
					 Update the MemberId and Member Shortname in the User Object */
					MembersSvc.updateUserReferenceInMemberObject(loggedUserObj.$id, memberDataObj);
					UsersSvc.updateMemberReferenceInUserObject(loggedUserObj.memberId, memberDataObj.shortname, loggedUserObj);
					$rootScope.currentSession.memberData = memberDataObj;
				}

				if(errorMessage){
					UsersSvc.updateMemberReferenceInUserObject(null, null, loggedUserObj);
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
		2. When only one member is found it'll be linked to the user (if the member status = active) */
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
					if(memberObj.isActive){
						$rootScope.currentSession.memberData = memberObj;
						//Create Cross Reference
						UsersSvc.updateMemberReferenceInUserObject(memberObj.$id, memberObj.shortname, loggedUser);
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
			AuthenticationSvc.logout();
		};

	}]//function
);

/* Controller linked to  /login */
okulusApp.controller('LoginCntrl',
	['$scope', '$rootScope', '$location', 'AuthenticationSvc',
	function($scope, $rootScope, $location, AuthenticationSvc){

		/* When navigating to "#!/login", but the user is already logged-in
		 we better redirect him to Home Page, instead of showing the login page */
		if($rootScope.currentSession && $rootScope.currentSession.user ){
			$location.path(constants.pages.home); return;
		}

		$scope.response = null;

		/*For login:
		1. Use firebase $signInWithEmailAndPassword, throug AuthenticationSvc.loginUser
		2. Update User's last login date and status.
		3. Redirect to Home */
		$scope.login = function(){
			$scope.response = {working: true, message: systemMsgs.inProgress.logingUser };
			AuthenticationSvc.loginUser($scope.user).then( function (user){
				AuthenticationSvc.updateUserLastLogin(user.uid);
				$location.path(constants.pages.home);
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

/* Controller linked to  /register */
okulusApp.controller('RegistrationCntrl',
	['$scope', '$rootScope', '$location', 'AuthenticationSvc','AuditSvc', 'UsersSvc',
	function($scope, $rootScope, $location, AuthenticationSvc, AuditSvc, UsersSvc){

		/* When navigating to "#!/register", but the user is already logged-in
		 we better redirect him to Home Page, instead of showing the login page */
		if($rootScope.currentSession && $rootScope.currentSession.user){
			$location.path(constants.pages.home); return;
		}

		/* To register a user:
		1. Create user in firebase Authentication with $createUserWithEmailAndPassword
		2. After Firebase-User creation, record a user object in the DB
		3. Trigger Audit Record
		4. Redirect to Home */
		$scope.register = function(){
			$scope.response = {working: true, message: systemMsgs.inProgress.registeringUser};
			AuthenticationSvc.register($scope.newUser).then(function(regUser){
				$scope.response = {success: true, message: systemMsgs.success.userRegistered};
				UsersSvc.createUser(regUser.uid, $scope.newUser.email, constants.roles.user);
				AuditSvc.recordAudit(regUser.uid, constants.actions.create, constants.folders.users);
				$rootScope.redirectFronRegister = true;
				$location.path(constants.pages.home);
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
okulusApp.factory('AuthenticationSvc', ['$rootScope','$firebaseObject', '$firebaseAuth',
	function($rootScope,$firebaseObject,$firebaseAuth){
		let usersFolder = firebase.database().ref().child(rootFolder).child( constants.folders.usersList )
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
				let record = { lastLoginOn:firebase.database.ServerValue.TIMESTAMP, lastLogin:null};
				usersFolder.child(userid).update(record);
			},
			loginUser: function(user){
				return auth.$signInWithEmailAndPassword(user.email,user.pwd);
			},
			logout: function(){
				return auth.$signOut();
			},
			isUserLoggedIn: function(){
				return auth.$requireSignIn();
			},
			register: function(user){
				return auth.$createUserWithEmailAndPassword(user.email, user.pwd);
			}
		};
	}
]);

/* Controller linked to /home */
okulusApp.controller('HomeCntrl',
	['$scope','$rootScope','$location','$firebaseAuth',
	'MembersSvc','AuthenticationSvc', 'MessageCenterSvc',
	function($scope,$rootScope,$location, $firebaseAuth,
		MembersSvc, AuthenticationSvc, MessageCenterSvc){

		$firebaseAuth().$onAuthStateChanged( function(authUser){
			if(!authUser) return;
			AuthenticationSvc.loadSessionData(authUser.uid).$loaded().then(function(user){
				//Get Member Access Rules
				if(user.isValid){
					$rootScope.currentSession.accessRules = MembersSvc.getMemberAccessRules(user.memberId);
				}

				if(user.isRoot){
					//Root User needs to be redirected to /admin/monitor
					$location.path(constants.pages.adminMonitor);
				}else if($rootScope.redirectFronRegister){
					$rootScope.redirectFronRegister = undefined;
				}else if(!user.isValid){
					$rootScope.response = { error:true, message: systemMsgs.error.noMemberAssociated};
					$location.path(constants.pages.error);
				}
			});
		});

		/* Assuming the member has only 1 access rule */
		$scope.quickReportLauncher = function(){
			let groupId = $rootScope.currentSession.accessRules[0].groupId;
			$location.path(constants.pages.reportNew + groupId);
		};

		$scope.closeGroupSelectModal = function(rule){
			let groupId = rule.groupId;
			$location.path(constants.pages.reportNew + groupId);
		};

	}]
);
