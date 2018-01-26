okulusApp.factory('UtilsSvc', ['$firebaseArray', '$firebaseObject',
	function( $firebaseArray, $firebaseObject){

		return {
			buildDateJson: function(dateObject){
		    	let dateJson = null;
		    	if(dateObject){
		    		dateJson = { day:dateObject.getDate(),
							 month: dateObject.getMonth()+1,
							 year:dateObject.getFullYear() };
				}
				return dateJson;
			}
		};
	}
]);