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
						memberId: "NA", type:"user",
						//userId: regUser.uid,
						createdOn: firebase.database.ServerValue.TIMESTAMP,
						lastLogin: firebase.database.ServerValue.TIMESTAMP,
						sessionStatus: "online"
					});
					AuditSvc.recordAudit(regUser.uid, "create", "users");
					$location.path( "/home" );
				}
			).catch( function(error){
				console.log(error);
				$scope.response = { loginErrorMsg: error.message};
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
				$scope.response = { loginErrorMsg: error.message};
				// console.error( $rootScope.response.loginErrorMsg) ;
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

okulusApp.controller('AuthenticationCntrl', ['$scope', '$rootScope', 'AuthenticationSvc', '$firebaseAuth','$location', 'MembersSvc',
	function($scope, $rootScope, AuthenticationSvc,$firebaseAuth, $location,MembersSvc){

		$firebaseAuth().$onAuthStateChanged( function(authUser){
				if(authUser){
					console.log("AuthSvc - User is Logged");
					AuthenticationSvc.loadSessionData(authUser.uid).$loaded().then(function(user){
						//if User already has a Member mapped:
						// 1. Verify The member still active,
						// 2. Confirm the member still canBeUser
						if(user.memberId){
							MembersSvc.getMember(user.memberId).$loaded().then(function(memberObj) {
								if(memberObj && memberObj.member.status == 'active' && memberObj.member.canBeUser){
									$rootScope.currentSession.member = memberObj;
								}
							});
						}
						//if User doesnt have a Member mapped:
						else{
							//Try to find a member Reference for this user
							MembersSvc.findMemberByEmail(user.email).$loaded().then(function(dataArray) {
								//if there more than one members with same email, notify admin
								if(dataArray.length > 1){
									$scope.response = {authErrorMsg:"Hay mas de un miembro con el mismo correo electrónico. Notificalo a tu administrador."};
									
								}else{
									data = dataArray[0];
									if(data && data.member.status == 'active' && data.member.canBeUser){
										$rootScope.currentSession.member = data;
										user.memberId = data.$id
										user.$save();
									}
								}
							});
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
						console.log("Rootscope Prop: "+prop);
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