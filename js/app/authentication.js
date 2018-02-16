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

okulusApp.controller('RegistrationCntrl', ['$scope','$location', '$rootScope', 'AuthenticationSvc',
	function($scope, $location, $rootScope, AuthenticationSvc){
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
						memberId: "temporal",
						//userId: regUser.uid,
						createdOn: firebase.database.ServerValue.TIMESTAMP,
						lastLogin: firebase.database.ServerValue.TIMESTAMP
					});
					$location.path( "/home" );
				}
			).catch( function(error){
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
				usersFolder.child(user.uid).update({lastlogin: firebase.database.ServerValue.TIMESTAMP});
				$location.path( "/home" );
			}).catch( function(error){
				$scope.response = { loginErrorMsg: error.message};
				// console.error( $rootScope.response.loginErrorMsg) ;
			});
		};

	}]
);

okulusApp.controller('LogoutCntrl', ['$scope', 'AuthenticationSvc',
	function($scope, AuthenticationSvc){
		$scope.logout = function(){
			AuthenticationSvc.logout();

		};
	}]
);

okulusApp.controller('AuthenticationCntrl', ['$scope', '$rootScope', 'AuthenticationSvc', '$firebaseAuth','$location', 'MembersSvc',
	function($scope, $rootScope, AuthenticationSvc,$firebaseAuth, $location,MembersSvc){

		$firebaseAuth().$onAuthStateChanged( function(authUser){
				if(authUser){
					console.log("AuthSvc - User is Logged");
					AuthenticationSvc.loadSessionData(authUser.uid).$loaded().then(function(user){
						//Try to find a member Reference for this user
						MembersSvc.findMemberByEmail(user.email).$loaded().then(function(dataArray) {
							data = dataArray[0];
							if(data && data.member.status == 'active' && data.member.userAllowed){
								$rootScope.currentSession.member = data;
								user.memberId = data.$id
								user.$save();
								//save memberId on User

							}
						});
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
			logout: function(){
				return auth.$signOut().then(function() {
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
