console.log( "rps initilized" );

//EXAMPLE DATABASE MANIUPULATION
// currentPlayerData.push
// ({
// 	player:
// 	{
// 		name: "ron",
// 		wins: 1,
// 		losses: 2
// 	}
// });

// turnData.set
// ({
// 	turn: 1
// });

// chatData.set
// ({
// 	message: "hello",
// });

//=========================
//	Main Game Object
//=========================
//module pattern
var rps = ( function()
{
	//check the server to see if we have players or not
	function initlize()
	{
		currentPlayerData.once( "value" ).then( function( data )
		{
			//console.log( data.numChildren() );
			if( data.numChildren() < 2 )
			{
				//allow login
				//console.log( "showing login form" );
				rpsController.showLogin();
			}
			else
			{
				//hide login
				//console.log( "hiding login form" );
				rpsController.hideLogin();
				rpsController.setFeedback( "game currently in progress..." );
			}
		});
	}

	//adds a player to the game
	function addPlayer( tName, tSuccessCallback ) 
	{
		var tempCurrentPlayerCount;

		//check how many players are there are currently
		currentPlayerData.once( "value" ).then( function( data )
		{
			//get amount of players so we can set this one's to the correct ID
			tempCurrentPlayerCount = data.numChildren();

			//save local id to the controller
			rpsController.setPlayerId( tempCurrentPlayerCount + 1 );

			//push the new player to the game and save the key
			var tempKey = currentPlayerData.push
			({
				player: 
				{ 
					id: rpsController.getPlayerId(),
					data:
					{
						name: tName,
						wins: 0,
						losses: 0,
						ties: 0,
						choice: "null"
					}
				}
			 }).key;

			rpsController.setPlayerKey( tempKey );

			//login was a success, trigger callback
			tSuccessCallback( tName );
		});
	}

	function setPlayerChoice( tPlayerId, tPlayerKey, tChoice, tCurrentTurn )
	{	
		currentPlayerData.orderByChild( 'player/id' ).equalTo( tPlayerId ).once( 'value' ).then( function( data )
		{	
			database.ref( "game/currentPlayers/" + tPlayerKey + "/player/data/" ).update
			({
				choice: tChoice,
			});

			//increment turn
			setTurn( tCurrentTurn );
		});
	}

	function setPlayerStats( tPlayerId, tPlayerKey, tStats )
	{
		//get the player by id from the server
		currentPlayerData.orderByChild( 'player/id' ).equalTo( tPlayerId ).once( 'value' ).then( function( data )
		{	
			database.ref( "game/currentPlayers/" + tPlayerKey + "/player/data/" ).update
			({
				wins: tStats.wins,
				losses: tStats.losses,
				ties: tStats.ties
			});
		});
	}

	function setTurn( tTurn )
	{
		turnData.set
		({
		 	turn: tTurn,
		});
	}

	function resetServer()
	{
		//console.log( "resetting server" );
		currentPlayerData.remove( function( error )
		{
			console.log( error );
		});

		turnData.remove( function( error )
		{
			console.log( error );
		});
	}

	//=====================
	// FIREBASE EVENTS
	//=====================
	//player added
	currentPlayerData.on( "child_added", function( data )
	{
		var tempNewPlayer = data.val();
		console.log( tempNewPlayer.player );
		rpsController.setNewPlayer( tempNewPlayer.player.id, tempNewPlayer.player.data.name );

		//check how many players we now have
		currentPlayerData.once( "value" ).then( function( data )
		{
			if( data.numChildren() == 2 )
			{
				//we have enough players to play the game, so start the game!
				setTurn( 1 );
			}
		})
	});

	//on child change ( choice was updated )
	currentPlayerData.on( "child_changed", function( data )
	{
		console.log( "child changed!" );
		//console.log( data.val().player.data.choice );
		rpsController.evaluateChoice( data.val().player );
		rpsController.updatePlayerStats( data.val().player );

	});

	//turn changed
	turnData.on( "value", function( data )
	{ 
		if( data.exists() )
		{
			switch( data.val().turn )
			{
				case 0:
					break;
				case 1:
					rpsController.setFeedback( "player 1's turn" );
					rpsController.startTurn( 1 );
					break;
				case 2:
					rpsController.setFeedback( "player 2's turn" );
					rpsController.startTurn( 2 );
					break;
				case 3:
					rpsController.startTurn( 3 );
					break;
				default:
					break;
			}
		}
	});

	//what is publically accessible
	var publicAPI =
	{
		initlize: initlize,
		logPlayerIn: addPlayer,
		setPlayerChoice: setPlayerChoice,
		setTurn: setTurn,
		setPlayerStats: setPlayerStats,
		resetServer: resetServer,
	}
	
	return publicAPI;

})();

//kick this whole thing off
rps.initlize();