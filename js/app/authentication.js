okulusApp.controller('AuthenticationCntrl', ['$scope', '$rootScope', 'AuthenticationSvc',
	function($scope, $rootScope, AuthenticationSvc){
		console.log("ON AuthenticationCntrl");
		$scope.login = function(){
			AuthenticationSvc.loginUser($scope.user);
		};

		$scope.logout = function(){
			AuthenticationSvc.logout();
		};

		$scope.register = function(){
			AuthenticationSvc.register($scope.regUser);
		};

		$scope.clearErrors = function () {
			$rootScope.appMessages = { };
		};

		$scope.clearErrors()
	}]//function
);

okulusApp.factory( 'AuthenticationSvc', ['$rootScope','$location','$firebaseObject','$firebaseAuth',

	function($rootScope, $location,$firebaseObject,$firebaseAuth){

		var auth = $firebaseAuth();
		var usersFolder = firebase.database().ref().child('users');
		var loginSuccessPage = '/mygroups';

		auth.$onAuthStateChanged( function(authUser){
    		if(authUser){
				console.log("AuthSvc - Initialization");
				$rootScope.currentUser = $firebaseObject(usersFolder.child(authUser.uid));
				$rootScope.userTasksRef = usersFolder.child(authUser.uid).child('tasks');
    			$rootScope.userListsRef = usersFolder.child(authUser.uid).child('lists');
				usersFolder.child(authUser.uid).update({lastlogin: firebase.database.ServerValue.TIMESTAMP});
				//ConfigurationSvc.upgradeUserConfig( currentUser );
			}else{
				console.log("AuthSvc - No User Authenticated");

				//$rootScopeappMessages.errorMessage = "Reload page to refresh session";
				//$location.path( "/error" );
				//cleanRootScope();
				//$rootScope.currentUser =  { type: 'admin', member:{ id:'-L3aCrod02U-clEuK8g1' }};
			}
		} );

		var cleanRootScope = function(){
			for (var prop in $rootScope) {
			    if (prop.substring(0,1) !== '$') {
					//console.log("Rootscope Prop: "+prop);
			        delete $rootScope[prop];
			    }
			}
		};

		return{
			loginUser: function(user){
				auth.$signInWithEmailAndPassword( user.email,user.pwd)
					.then( function (user){
						console.log( "Sucessful Login!");
						$location.path( loginSuccessPage );
					}).catch( function(error){
						$rootScope.appMessages.loginErrorMsg = error.message;
						//console.error( error.message );
					});
			},
			logout: function(){
				return auth.$signOut();
			},
			isUserLoggedIn: function(){
				return auth.$requireSignIn();
			},
			loadUserProfileData: function(uid){
				return $firebaseObject(usersFolder.child(uid));
			},
			register: function(user){
				auth.$createUserWithEmailAndPassword(user.email, user.pwd)
					.then(
						function(regUser){
							usersFolder.child(regUser.uid).set({
								firstname: user.firstname,
								lastname: user.lastname,
								email: user.email,
								userid: regUser.uid,
								date: firebase.database.ServerValue.TIMESTAMP,
								lastlogin: firebase.database.ServerValue.TIMESTAMP
							});
							$location.path( loginSuccessPage );
						}
					).catch( function(error){
						$rootScope.appMessages.registerErrorMsg = error.message;
					});
			}
		};//return
	}
]);
