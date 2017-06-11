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
				console.log( "showing login form" );
				rpsController.showLogin();
			}
			else
			{
				//hide login
				console.log( "hiding login form" );
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

			//push the new player to the game
			currentPlayerData.push
			({
				player: 
				{ 
					id: rpsController.getPlayerId(),
					data:
					{
						name: tName,
						wins: 0,
						losses: 0
					}
				}
			 });

			//login was a success, trigger callback
			tSuccessCallback( tName );
		});
	}

	function setPlayerChoice( tPlayerId, tChoice, tCurrentTurn )
	{
		console.log( "lamos" );
		//console.log( currentPlayerData.equalTo( tPlayerId ).val() );
		//console.log( currentPlayerData.orderByChild( 'player' ).equalTo( tPlayerId ) );
		currentPlayerData.orderByChild( 'player' ).equalTo( tPlayerId ).once( 'value' ).then( function( data )
		{
			console.log( data.val() );
			console.log( data.val().player );
			console.log( data.val().playerData );

			//update the choice val
			// data.val().key
			// ({
			// 	choice: tChoice,
			// })

			// database.ref( "game/currentPlayers/" + data.val().constructor.name + "/playerData/" ).set
			// ({
			// 	choice: tChoice,
			// })

			//increment turn
			turnData.set
			({
			 	turn: tCurrentTurn++,
			});

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
		rpsController.setPlayerName( tempNewPlayer.player.id, tempNewPlayer.player.data.name );

		//check how many players we now have
		currentPlayerData.once( "value" ).then( function( data )
		{
			if( data.numChildren() == 2 )
			{
				//we have enough players to play the game
				turnData.set
				({
				 	turn: 1,
				});
			}
		})
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
	}
	
	return publicAPI;

})();

rps.initlize();