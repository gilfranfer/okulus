// Initialize Firebase
  var config = {
    /* Dev Sandbox */
    apiKey: "AIzaSyAERYbnjq6Hu3gFFNBptRvbcvlBt4anwHk",
    authDomain: "dev-sandbox-b557a.firebaseapp.com",
    databaseURL: "https://dev-sandbox-b557a.firebaseio.com",
    projectId: "dev-sandbox-b557a",
    storageBucket: "dev-sandbox-b557a.appspot.com",
    messagingSenderId: "962638064654"

    /* Prod
    apiKey: "AIzaSyA-fKa3EmMg_t_YOTzhOf36JhKUCyCBS1A",
    authDomain: "okulus-prd.firebaseapp.com",
    databaseURL: "https://okulus-prd.firebaseio.com",
    projectId: "okulus-prd",
    storageBucket: "",
    messagingSenderId: "681782068973"
    */
  };
  firebase.initializeApp(config);