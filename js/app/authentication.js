//This will catch routeChangeError from route resolve
okulusApp.run( ['$rootScope', '$location', function($rootScope,$location){
	$rootScope.$on('$routeChangeError', function( event, next, previous, error){
		if(error == 'AUTH_REQUIRED'){
			$location.path('/error/login');
		}else{
			//console.error();(error);
			//$rootScope.appMessages.errorMessage = error;
			$location.path('/error');
		}
	});
}]);

okulusApp.controller('AuthenticationCntrl', ['$scope', '$rootScope', '$firebaseAuth','$location',
											'AuthenticationSvc','ChatService', 'NotificationsSvc', 'MembersSvc','ErrorsSvc',
	function($scope, $rootScope, $firebaseAuth, $location,
						AuthenticationSvc, ChatService, NotificationsSvc, MembersSvc, ErrorsSvc){

		$firebaseAuth().$onAuthStateChanged( function(authUser){
				if(authUser){
					console.log("AuthSvc - User is Logged");
					AuthenticationSvc.loadSessionData(authUser.uid).$loaded().then(function(user){
						if(user.isRoot){
							// console.log("Welcome Root");
						}else{
							/* if User already has a Member mapped:
							// 1. Verify The member still active and Confirm still canBeUser
							// 2. Validate the email from the user and the member.
							// 		In case they differ (the member emial was updated), remove the member reference from the user */
							if(user.memberId){
								MembersSvc.getMember(user.memberId).$loaded().then(function(memberObj) {
									let error = undefined;
									if(memberObj.member && memberObj.member.status == 'active' && memberObj.member.canBeUser){
										if(user.email ==  memberObj.member.email){
											//All ok. Save the member in session
											$rootScope.currentSession.member = memberObj;
											memberObj.user = {isUser:true, userId:authUser.uid};
											memberObj.$save();
											//update lastlogin and sessionstatus
											$rootScope.unreadChats = ChatService.getUnreadChats(authUser.uid);
											$rootScope.notifications = NotificationsSvc.getNotificationsMetadata(authUser.uid);
											AuthenticationSvc.updateUserLastActivity(authUser.uid,"online");
										}else{
											error = "El Correo "+user.email+" (usuario) no coincide con "+emberObj.member.email+" (miembro).";
										}
									}else{
										if(!memberObj.member){
											error = "No existe un miembro con el id "+user.memberId;
										}else if(memberObj.member.status == 'inactive' ){
											error = "El miembro "+user.memberId+" se encuentra incativo.";
										}else if(!memberObj.member.canBeUser){
											error = "El miembro "+user.memberId+" no puede ser usuario.";
										}
									}

									if(error){
										user.memberId = null;
										user.type = "user";
										user.$save();
										memberObj.user = null;
										memberObj.$save();
										ErrorsSvc.logError("Se ha desvinculado al usuario "+ user.email +" del Miembro " + memberObj.$id + " por el motivo: "+ error );
										$location.path( "/error/nomember" );
									}


								});
							}
							//if User doesnt have a Member mapped:
							else{
								//Try to find a member Reference for this user
								MembersSvc.findMemberByEmail(user.email).$loaded().then(function(membersFound) {
									//if there more than one members with same email, notify admin
									if(membersFound.length > 1){
										$scope.response = {authErrorMsg:"Hay mas de un miembro con el mismo correo electrónico. Notificalo a tu administrador."};
										ErrorsSvc.logError("Mas de un Miembro usan el correo: "+user.email);
									}else{
										//map the member Id to the user
										memberObj = membersFound[0];
										if(memberObj && memberObj.member.status == 'active' && memberObj.member.canBeUser){
											$rootScope.currentSession.member = memberObj;
											user.memberId = memberObj.$id
											user.$save();
											MembersSvc.getMember(user.memberId).$loaded().then(function(tempMember){
												tempMember.user = {isUser:true, userId:authUser.uid};
												tempMember.$save();
											});

										}
									}
								});
							}
						}
					});
					// usersFolder.child(authUser.uid).update({lastActivityOn: firebase.database.ServerValue.TIMESTAMP});
				}else{
					console.log("AuthSvc - No User Authenticated");
					cleanRootScope();
					$location.path( "/login" );
				}
		} );

		var cleanRootScope = function(){
			for (var prop in $rootScope) {
			    if (prop.substring(0,1) !== '$') {
						// console.log("Rootscope Prop: "+prop);
						if( prop!="config" && prop!="i18n")
			      delete $rootScope[prop];
			    }
			}
		};

	}]//function
);

okulusApp.controller('RegistrationCntrl', ['$scope','$location', '$rootScope', 'AuthenticationSvc','AuditSvc',
	function($scope, $location, $rootScope, AuthenticationSvc,AuditSvc){
		let usersFolder = firebase.database().ref().child('pibxalapa/users')

		//If user is logged, reidrect to home
		if($rootScope.currentSession){
			$location.path("/home");
		}

		$scope.response = null;
		$scope.register = function(){
			AuthenticationSvc.register($scope.newUser).then(
				function(regUser){
					usersFolder.child(regUser.uid).set({
						email: $scope.newUser.email,
						type:"user",
						lastLogin: firebase.database.ServerValue.TIMESTAMP,
						lastActivityOn: firebase.database.ServerValue.TIMESTAMP,
						sessionStatus: "online"
					});
					AuditSvc.recordAudit(regUser.uid, "create", "users");
					$location.path( "/home" );
				}
			).catch( function(error){
				let message = undefined;
				switch(error.code) {
						case "auth/email-already-in-use":
								message = "El correo electrónico ya está en uso";
								break;
						default:
							message = "Intente nuevamente." + error.coindíae;
				}
				$scope.response = { loginErrorMsg: message};
				// console.log(error);
			});
		};

	}]
);

okulusApp.controller('LoginCntrl', ['$scope','$location', '$rootScope', 'AuthenticationSvc',
	function($scope, $location, $rootScope, AuthenticationSvc){
		let usersFolder = firebase.database().ref().child('pibxalapa/users')

		//If user is logged, reidrect to home
		if($rootScope.currentSession){
			$location.path("/home");
		}

		$scope.response = null;

		$scope.login = function(){
			AuthenticationSvc.loginUser($scope.user).then( function (user){
				AuthenticationSvc.updateUserLastLogin(user.uid);
				AuthenticationSvc.updateUserLastActivity(user.uid,"online");
				$location.path( "/home" );
			}).catch( function(error){
				let message = undefined;
				switch(error.code) {
						case "auth/wrong-password":
						case "auth/user-not-found":
								message = "Usuario o Contraseña Incorrectos";
								break;
						default:
							message = "Intente nuevamente";
				}
				$scope.response = { loginErrorMsg: message};
				console.error( error ) ;
			});
		};

	}]
);

okulusApp.controller('LogoutCntrl', ['$rootScope','$scope', 'AuthenticationSvc',
	function($rootScope,$scope, AuthenticationSvc){
		$scope.logout = function(){
			let userId = $rootScope.currentSession.user.$id;
			AuthenticationSvc.updateUserLastActivity(userId,"offline");
			AuthenticationSvc.logout(userId);
		};
	}]
);

okulusApp.factory('AuthenticationSvc', ['$rootScope','$location','$firebaseObject', 'MembersSvc', '$firebaseAuth',
	function($rootScope, $location,$firebaseObject,MembersSvc,$firebaseAuth){
		let usersFolder = firebase.database().ref().child('pibxalapa/users')
		var auth = $firebaseAuth();

		return{
			updateUserLastActivity: function(userid,sessionStatus){
				usersFolder.child(userid).update({lastActivityOn: firebase.database.ServerValue.TIMESTAMP, sessionStatus:sessionStatus});
			},
			updateUserLastLogin: function(userid){
				usersFolder.child(userid).update({lastLogin: firebase.database.ServerValue.TIMESTAMP});
			},
			loginUser: function(user){
				return auth.$signInWithEmailAndPassword(user.email,user.pwd)
			},
			logout: function(userId){
				return auth.$signOut();
			},
			isUserLoggedIn: function(){
				return auth.$requireSignIn();
			},
			loadUserProfileData: function(uid){
				return $firebaseObject(usersFolder.child(uid));
			},
			register: function(user){
				return auth.$createUserWithEmailAndPassword(user.email, user.pwd);
			},
			loadSessionData: function(authUserUid){
				if(!$rootScope.currentSession){
					console.log("AuthSvc - Loading User Data");
					$rootScope.currentSession = {user: $firebaseObject(usersFolder.child(authUserUid)) };
				}
				return $rootScope.currentSession.user;
			}
		};//return
	}
]);

okulusApp.controller('HomeCntrl', ['$scope','$location', 'AuthenticationSvc','$firebaseAuth', 'MessageCenterSvc',
	function($scope,$location, AuthenticationSvc,$firebaseAuth,MessageCenterSvc){

		$firebaseAuth().$onAuthStateChanged( function(authUser){
			AuthenticationSvc.loadSessionData(authUser.uid).$loaded().then(function(user){
				if(user.isRoot){
					$location.path("/admin/monitor");
				}else if(!user.memberId){
					$location.path("/error/nomember");
				}else{
					//continue to Home
				}
			});
		});
	}]
);
