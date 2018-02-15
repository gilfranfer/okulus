okulusApp.controller('RegistrationCntrl', ['$scope', '$rootScope', 'AuthenticationSvc',
	function($scope, $rootScope, AuthenticationSvc){

		$scope.response = null;

		$scope.register = function(){
			console.log("Register");
			AuthenticationSvc.register($scope.newUser);
		};

	}]
);

okulusApp.controller('AuthenticationCntrl', ['$scope', '$rootScope', 'AuthenticationSvc',
	function($scope, $rootScope, AuthenticationSvc){
		console.log("ON AuthenticationCntrl");
		$scope.login = function(){
			AuthenticationSvc.loginUser($scope.user);
		};

		$scope.logout = function(){
			AuthenticationSvc.logout();
		};

		// $scope.register = function(){
		// 	AuthenticationSvc.register($scope.regUser);
		// };

		$scope.clearErrors = function () {
			$rootScope.appMessages = { };
		};

		$scope.clearErrors()
	}]//function
);

okulusApp.factory( 'AuthenticationSvc', ['$rootScope','$location','$firebaseObject','$firebaseAuth',

	function($rootScope, $location,$firebaseObject,$firebaseAuth){

		var auth = $firebaseAuth();
		var usersFolder = firebase.database().ref().child('pibxalapa/users');
		var loginSuccessPage = '/mygroups';

		auth.$onAuthStateChanged( function(authUser){
    		if(authUser){
					//load Member Data associated to this user
					// let whichMember = $rootScope.currentUser.memberId;
					// MembersSvc.getMemberInfo(whichMember).$loaded().then(
					// 	function(data) {
					// 		$rootScope.currentUser.member.data = data;
					// 	}
					// );
					let memberData = undefined;
					if(memberData){
						$rootScope.currentSession.meber = memberData;
					}
					console.log("AuthSvc - User is Logged");
					$rootScope.currentUser = $firebaseObject(usersFolder.child(authUser.uid));
					usersFolder.child(authUser.uid).update({lastlogin: firebase.database.ServerValue.TIMESTAMP});
			}else{
				console.log("AuthSvc - No User Authenticated");
				$rootScope.currentUser =  { type: 'admin', member:{ id:'-L3aCrod02U-clEuK8g1' }};
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
				console.log(user.email, user.pwd);
				auth.$createUserWithEmailAndPassword(user.email, user.pwd)
					.then(
						function(regUser){
							usersFolder.child(regUser.uid).set({
								email: user.email,
								//userId: regUser.uid,
								createdOn: firebase.database.ServerValue.TIMESTAMP,
								lastLogin: firebase.database.ServerValue.TIMESTAMP
							});
							$location.path( loginSuccessPage );
						}
					).catch( function(error){
						$rootScope.response.registerMsgError = error.message;
					});
			}
		};//return
	}
]);
