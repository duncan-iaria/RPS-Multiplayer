// Initialize Firebase
var config = 
{
  apiKey: "AIzaSyD_tSPM0N384Ks2htt9j4aIinckYyE6wzE",
  authDomain: "rps-multiplayer-e2292.firebaseapp.com",
  databaseURL: "https://rps-multiplayer-e2292.firebaseio.com",
  projectId: "rps-multiplayer-e2292",
  storageBucket: "rps-multiplayer-e2292.appspot.com",
  messagingSenderId: "978981637680"
};

firebase.initializeApp( config );

console.log( "firebase initilized" );

//=======================
// FIREBASE PATHS
//=======================
//base path
var database = firebase.database();

//current player path
var currentPlayerData = database.ref( "game/currentPlayers" );

//path for the chat data
var chatData = database.ref( "game/chat" );

//path for the current turn
var turnData = database.ref( "game/turn" );
