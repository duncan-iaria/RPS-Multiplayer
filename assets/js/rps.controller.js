//=======================
//	RPS CONTROLLER
//=======================
//for sending events from the frontend to the game

var rpsController = ( function()
{
	//page elements
	var loginInput = document.getElementById( 'login-input' );
	var loginButton = document.getElementById( 'login-button' );
	var loginForm = document.getElementById( 'login-form' );
	var feedbackMessage = document.getElementById( 'feedback-message' );

	//player elements
	var player1Name = document.getElementById( 'player1-name' );
	var player2Name = document.getElementById( 'player2-name' );
	var player1Stats = document.getElementById( 'player1-stats' );
	var player2Stats = document.getElementById( 'player2-stats' );

	var playerId;
	var currentPlayerChoice;
	var currentTurn;

	//what is publically accessible
	var publicAPI =
	{
		loginButton: loginButton,
		login: playerLogin,
		hideLogin: hideLoginForm,
		showLogin: showLoginForm,
		setFeedback: setFeedbackMessage,
		setPlayerName: setPlayerName,
		setPlayerId: setLocalPlayerId,
		getPlayerId: getLocalPlayerId,
		startTurn: startTurn,
		setChoice: setPlayerChoice,
	}
	
	return publicAPI;

	//LOGIN
	function playerLogin( tEvent )
	{
		tEvent.preventDefault();

		//log in a player with the name from the input, and pass in the onLoginSuccess callback
		rps.logPlayerIn( loginInput.value.trim(), onLoginSuccess );
	}

	//when login is successful, set the id and name
	function onLoginSuccess( tName )
	{
		console.log( "successful player log in" );

		hideLoginForm();
		setFeedbackMessage( "waiting for players..." );
	}

	function hideLoginForm()
	{
		$( loginForm ).addClass( 'hidden' );
	}

	function showLoginForm()
	{
		$( loginForm ).removeClass( 'hidden' );
	}

	//FEEDBACK
	function setFeedbackMessage( tMessage )
	{
		$( feedbackMessage ).text( tMessage );
	}

	//PLAYERS
	function setLocalPlayerId( tPlayerId )
	{
		playerId = tPlayerId;
	}

	function getLocalPlayerId()
	{
		return playerId;
	}

	function updatePlayerStats( tPlayerId, tStats )
	{

	}

	function setPlayerName( tPlayerId, tName )
	{
		$( '#player' + tPlayerId + "-name" ).html( "player" + tPlayerId + ": " + tName );
	}

	//TURNS
	function startTurn( tTurn )
	{
		if( tTurn == playerId )
		{
			displayTurnCommands( tTurn );
		}

		currentTurn = tTurn;
	}

	//for showing the turn options
	function displayTurnCommands( tPlayerId )
	{
		$( '#player' + tPlayerId + "-choice" ).addClass( 'hidden' );
		$( '.player' + tPlayerId + " > div" ).removeClass( 'hidden' );
	}

	//for showing what choice was made and hiding the options
	function displayCurrentChoice()
	{
		$( '#player' + getLocalPlayerId() + "-choice" ).removeClass( 'hidden' );
		$( '.player' + getLocalPlayerId() + " > div" ).addClass( 'hidden' );		
	}

	function setPlayerChoice()
	{	
		currentPlayerChoice = $( this ).attr( 'data-choice' );

		//set the player choice in the server
		rps.setPlayerChoice( getLocalPlayerId(), currentPlayerChoice, currentTurn );

		//display the local choice
		displayCurrentChoice();
	}

})();


//EVENT LISTENERS
rpsController.loginButton.addEventListener( "click", rpsController.login );
$( '.choice' ).on( "click", rpsController.setChoice ); 