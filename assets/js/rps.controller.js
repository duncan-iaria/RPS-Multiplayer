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

	//for testing
	var resetButton = document.getElementById( 'reset-server' );

	//local player data
	var playerId;
	var opponentId;
	var playerKey;
	var currentPlayerChoice;
	var currentOpponentChoice;

	var localStats =
	{
		wins: 0,
		losses: 0,
		ties: 0,
	}

	var currentTurn;
	var endRoundTimerDuration = 2500; //(2seconds)

	//what is publically accessible
	var publicAPI =
	{
		//login methods
		loginButton: loginButton,
		login: playerLogin,
		hideLogin: hideLoginForm,
		showLogin: showLoginForm,

		//feedback methods
		setFeedback: setFeedbackMessage,
		setNewPlayer: setNewPlayer,
		updatePlayerStats: updatePlayerStats,

		//utilities
		setPlayerId: setLocalPlayerId,
		getPlayerId: getLocalPlayerId,
		setPlayerKey: setLocalPlayerKey,
		getPlayerKey: getLocalPlayerKey,
		setOpponentId: setOpponentId,

		//game logic
		startTurn: startTurn,
		setChoice: setPlayerChoice,
		evaluateChoice: evaluateChoice,

		//testing
		resetButton: resetButton,
		resetServer: resetServer
	}
	
	return publicAPI;

	//===============
	// LOGIN
	//===============
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

	//hide, effectively disallowing future logins
	function hideLoginForm()
	{
		$( loginForm ).addClass( 'hidden' );
	}

	//display the login form to the user
	function showLoginForm()
	{
		$( loginForm ).removeClass( 'hidden' );
	}

	//====================
	// FEEDBACK
	///===================
	function setFeedbackMessage( tMessage )
	{
		$( feedbackMessage ).text( tMessage );
	}

	//====================
	// PLAYERS
	///===================
	function setLocalPlayerId( tPlayerId )
	{
		playerId = tPlayerId;
	}

	function getLocalPlayerId()
	{
		return playerId;
	}

	function setOpponentId( tId )
	{
		opponentId = tId;
	}

	function getOpponentId()
	{
		return opponentId;
	}

	function setLocalPlayerKey( tKey )
	{
		playerKey = tKey;
	}

	function getLocalPlayerKey()
	{
		return playerKey;
	}

	function updatePlayerStats( tPlayer )
	{
		$( '#player' + tPlayer.id +"-stats" ).text( "W : " + tPlayer.data.wins + " / L : " + tPlayer.data.losses + " / T : " + tPlayer.data.ties );
	}

	//initilize a new player
	function setNewPlayer( tPlayerId, tName )
	{
		//set the display name
		$( '#player' + tPlayerId + "-name" ).html( "<h3>player" + tPlayerId + ": " + tName +"</h3>" );

		//if this new player is not the local player's id, then set it as the opponents
		if( tPlayerId != getLocalPlayerId() )
		{
			setOpponentId( tPlayerId );
		}
	}

	//====================
	// TURNS/GAME LOGIC
	///===================
	function startTurn( tTurn )
	{
		currentTurn = tTurn;

		//if the turn equals the player id (meaning its your turn)
		if( tTurn == playerId )
		{
			displayTurnCommands( tTurn );
		}

		//if we're on the eval stage
		if( currentTurn == 3 )
		{
			console.log( "started round 3" );
			displayOpponentChoice();
			compareChoices();
		}
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
		$( '#player' + getLocalPlayerId() + "-choice" ).text( currentPlayerChoice );
		$( '#player' + getLocalPlayerId() + "-choice" ).removeClass( 'hidden' );
		$( '.player' + getLocalPlayerId() + " > div" ).addClass( 'hidden' );		
	}

	function displayOpponentChoice()
	{
		console.log( "opponent id = " + getOpponentId() );
		$( '#player' + getOpponentId() + "-choice" ).text( currentOpponentChoice );
	}

	function displayReset()
	{
		$( '#player' + getLocalPlayerId() + "-choice" ).text( "???" );
		$( '#player' + getOpponentId() + "-choice" ).text( "???" );
	}

	function setPlayerChoice()
	{	
		currentPlayerChoice = $( this ).attr( 'data-choice' );

		//increment the current turn
		currentTurn++;

		//set the player choice in the server
		rps.setPlayerChoice( getLocalPlayerId(), getLocalPlayerKey(), currentPlayerChoice, currentTurn );

		//display the local choice
		displayCurrentChoice();
	}

	//check if it's the opponents choice that was set or your own
	function evaluateChoice( tPlayerData )
	{	
		//if it's not your choice, store opponents choice locally for comparison
		if( tPlayerData.id != getLocalPlayerId() )
		{
			currentOpponentChoice = tPlayerData.data.choice;
		}
	}

	function startNewRound()
	{
		//reset the displays
		displayReset();

		//set the turn to 1
		rps.setTurn( 1 );
	}

	//MAIN GAME LOGIC COMPARISONS ARE HERE
	function compareChoices()
	{
		//message for feedback (win/lose/tie)
		var tempWinMessage = "Player " + getLocalPlayerId() + " wins!";
		var tempLoseMessage = "Player " + getOpponentId() + " wins!";
		var tempTieMessage = "TIE GAME!";

		switch( currentPlayerChoice )
		{
			case "scissors":
				compareScissors();
				break;

			case "paper":
				comparePaper();
				break;

			case "rock":
				compareRock();
				break;

			default:
				break;
		}

		//start new round after a timer
		setTimeout( startNewRound, endRoundTimerDuration );

		//COMPARISON FUNCTIONS
		function compareScissors()
		{
			if( currentOpponentChoice == "rock" )
			{
				onLose();
			}
			else if( currentOpponentChoice == "paper" )
			{
				onWin();
			}
			else
			{
				onTie();
			}
		}

		function compareRock()
		{
			if( currentOpponentChoice == "rock" )
			{
				onTie();
			}
			else if( currentOpponentChoice == "paper" )
			{
				onLose();
			}
			else
			{
				onWin();
			}
		}

		function comparePaper()
		{
			if( currentOpponentChoice == "rock" )
			{
				onWin();
			}
			else if( currentOpponentChoice == "paper" )
			{
				onTie();
			}
			else
			{
				onLose();
			}
		}

		function onWin()
		{
			localStats.wins++;
			setFeedbackMessage( tempWinMessage );
			rps.setPlayerStats( getLocalPlayerId(), getLocalPlayerKey(), localStats );
		}

		function onTie()
		{
			localStats.ties++;
			setFeedbackMessage( tempTieMessage );
			rps.setPlayerStats( getLocalPlayerId(), getLocalPlayerKey(), localStats );
		}

		function onLose()
		{
			localStats.losses++;
			setFeedbackMessage( tempLoseMessage );
			rps.setPlayerStats( getLocalPlayerId(), getLocalPlayerKey(), localStats );
		}
	}

	//TESTING
	function resetServer()
	{
		rps.resetServer();
	}

})();


//EVENT LISTENERS
rpsController.loginButton.addEventListener( "click", rpsController.login );
rpsController.resetButton.addEventListener( "click", rpsController.resetServer );
$( '.choice' ).on( "click", rpsController.setChoice ); 