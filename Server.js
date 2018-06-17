var express = require('express');
var socket = require('socket.io');
var player = require('./Player');
var utility = require('./Utility');
var utility = new utility.Utility();

var app = express();
var server = app.listen(5002, '62.65.227.49', function(){
	console.log("Listening on port 5002");
});

app.use(express.static('public'));

//Socket seup
var io = socket(server);

var playerCount = [];

//Generate random coordiantes for the player that don't overlap
randomPosition = function(newplayer){
	newplayer.x = Math.floor(Math.random() * 20);
	newplayer.y = Math.floor(Math.random() * 12);
	for(var i = 0; i < playerCount.length; i++){
		if(playerCount[i].x == newplayer.x && playerCount[i].y == newplayer.y){
			newplayer.x = Math.floor(Math.random() * 20);
			newplayer.y = Math.floor(Math.random() * 12);
			randomPosition(newplayer);
		}
	}
}

io.on('connection', function(socket){
		//Create new player ojbect and add it to the utility playerCount object list
		//But only if a player with the same ip doesn't exist already
		if(!utility.contains(playerCount, socket.handshake.address)){ 
			var newPlayer = new player.Player(socket.id, socket.handshake.address);
			randomPosition(newPlayer);
			playerCount.push(newPlayer);
			console.log('New player created/ ' + newPlayer.ip + ' // ' + newPlayer.x + ':' + newPlayer.y + ' (' + playerCount.length + ')');
		}
		
		//Every time the browser is refleshed, send all players data to all the players
		socket.on('requestRender', function(data){
			var color = [];
			var x = [];
			var y = [];
			for(var i = 0; i < playerCount.length; i++){
				color[i] = playerCount[i].color;
			}
			for(var i = 0; i < playerCount.length; i++){
				x[i] = playerCount[i].x;
			}
			for(var i = 0; i < playerCount.length; i++){
				y[i] = playerCount[i].y;
			}
			
			io.sockets.emit('renderPlayers', {
				colors: color,
				xPos: x,
				yPos: y
			});
		});
		
		//Client is calling the 'move'
		socket.on('move', function(data){
			for(var i = 0; i < playerCount.length; i++){
				if(playerCount[i].ip == socket.handshake.address){
					if(data == 38){
						playerCount[i].y -= 1;
					}
					if(data == 40){
						playerCount[i].y += 1;
					}
					if(data == 39){
						playerCount[i].x += 1;
					}
					if(data == 37){
						playerCount[i].x -= 1;
					}
					//Make sure noone goes out of the area... 
					if(playerCount[i].x < 0){
						playerCount[i].x = 0;
					}
					if(playerCount[i].x > 19){
						playerCount[i].x = 19;
					}
					if(playerCount[i].y < 0){
						playerCount[i].y = 0;
					}
					if(playerCount[i].y > 11){
						playerCount[i].y = 11;
					}
				}
			}
		});
	
	//console.log('New player socket set: ' + newPlayer.socket);
	//console.log('New player ip set: ' + newPlayer.ip);
	//console.log('Player id: ' + playerCount.length);
});
