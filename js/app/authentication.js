//This will catch routeChangeError from route resolve
okulusApp.run( ['$rootScope', '$location', function($rootScope,$location){
	$rootScope.$on('$routeChangeError', function( event, next, previous, error){
		if(error == 'AUTH_REQUIRED'){
			$location.path('/error/login');
		}else{
			console.error();(error);
			//$rootScope.appMessages.errorMessage = error;
			$location.path('/error');
		}
	});

}]);

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
						//userId: regUser.uid,
						createdOn: firebase.database.ServerValue.TIMESTAMP,
						lastLogin: firebase.database.ServerValue.TIMESTAMP,
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
							message = "Intente nuevamente";
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
				// console.log( "Sucessful Login!");
				// console.log(user);
				usersFolder.child(user.uid).update({lastLogin: firebase.database.ServerValue.TIMESTAMP, sessionStatus:"online"});
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
				// console.error( error ) ;
			});
		};

	}]
);

okulusApp.controller('LogoutCntrl', ['$rootScope','$scope', 'AuthenticationSvc',
	function($rootScope,$scope, AuthenticationSvc){
		$scope.logout = function(){
			AuthenticationSvc.logout($rootScope.currentSession.user.$id);
		};
	}]
);

okulusApp.controller('AuthenticationCntrl', ['$scope', '$rootScope', 'AuthenticationSvc', '$firebaseAuth','$location', 'MembersSvc','ErrorsSvc',
	function($scope, $rootScope, AuthenticationSvc,$firebaseAuth, $location,MembersSvc,ErrorsSvc){

		$firebaseAuth().$onAuthStateChanged( function(authUser){
				if(authUser){
					console.log("AuthSvc - User is Logged");
					AuthenticationSvc.loadSessionData(authUser.uid).$loaded().then(function(user){
						//if User already has a Member mapped:
						// 1. Verify The member still active,
						// 2. Confirm the member still canBeUser
						// 3. Validate the email form the user and the member.
						// 		In case they differ (the member emial was updated), remove the member reference from the user
						if(user.isRoot){
							// console.log("Welcome Root");
						}else{
							if(user.memberId){
								// console.log("With Member Id");
								MembersSvc.getMember(user.memberId).$loaded().then(function(memberObj) {
									if(memberObj.member && memberObj.member.status == 'active' && memberObj.member.canBeUser){
										// console.log("Assign Member");
										if(user.email !=  memberObj.member.email){
											user.memberId = null;
											user.$save();
											$scope.response = {authErrorMsg:"Inteta nuevamente"};
											ErrorsSvc.logError("Se ha desvinculado al usuario "+ user.email +" del Miembro "
												+ memberObj.$id + ", porque el correo electrónico no coindía con: " + memberObj.member.email );
										}else{
											$rootScope.currentSession.member = memberObj;
										}
									}else{
										$scope.response = {authErrorMsg:"No pudimos encontrar información del Miembro ligado a tu cuenta."};
										ErrorsSvc.logError("El usuario "+ user.email +" esta asignado a un Miembro que no existe: "+ user.memberId);
									}
								});
							}
							//if User doesnt have a Member mapped:
							else{
								// console.log("No Member Id");
								//Try to find a member Reference for this user
								MembersSvc.findMemberByEmail(user.email).$loaded().then(function(dataArray) {
									//if there more than one members with same email, notify admin
									if(dataArray.length > 1){
										$scope.response = {authErrorMsg:"Hay mas de un miembro con el mismo correo electrónico. Notificalo a tu administrador."};
										ErrorsSvc.logError("Mas de un Miembro usan el correo: "+user.email);
									}else{
										//map the member Id to the user
										data = dataArray[0];
										if(data && data.member.status == 'active' && data.member.canBeUser){
											$rootScope.currentSession.member = data;
											user.memberId = data.$id
											user.$save();
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

okulusApp.factory( 'AuthenticationSvc', ['$rootScope','$location','$firebaseObject', 'MembersSvc', '$firebaseAuth',
	function($rootScope, $location,$firebaseObject,MembersSvc,$firebaseAuth){
		let usersFolder = firebase.database().ref().child('pibxalapa/users')
		var auth = $firebaseAuth();

		return{
			loginUser: function(user){
				return auth.$signInWithEmailAndPassword( user.email,user.pwd)

			},
			logout: function(userId){
				return auth.$signOut().then(function() {
					usersFolder.child(userId).update({sessionStatus:"offline"});
					// console.log("logout done");
					// $location.path( "/login" );
				});
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

okulusApp.controller('HomeCntrl', ['$rootScope','$location', 'AuthenticationSvc','$firebaseAuth',
	function($rootScope,$location, AuthenticationSvc,$firebaseAuth){

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
