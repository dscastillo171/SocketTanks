/*
	The MIT License (MIT)

	Copyright (c) 2013 Chess Team

	Permission is hereby granted, free of charge, to any person obtaining a copy
	of this software and associated documentation files (the "Software"), to deal
	in the Software without restriction, including without limitation the rights
	to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	copies of the Software, and to permit persons to whom the Software is
	furnished to do so, subject to the following conditions:

	The above copyright notice and this permission notice shall be included in
	all copies or substantial portions of the Software.

	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
	THE SOFTWARE.
*/

// Global used to avoid polluting the namespace.
var SocketTanks = SocketTanks || {};

// Create a board, loaded with the given map data.
SocketTanks.BoardWithCanvas = function(canvasObj, mapData, scale){
	// Image sprites.
	var sprites = new Image();
	sprites.src = SocketTanks.CONFIG.SPRITES_URL;

	// Get the size of the window.
	var windowWidth = window.innerWidth || document.documentElement.clientWidth || document.getElementsByTagName('body')[0].clientWidth;
	var windowHeight = window.innerHeight || document.documentElement.clientHeight || document.getElementsByTagName('body')[0].clientHeight;

	// Setup the canvas.
	var canvas = canvasObj;
	canvas.width = mapData[0].length * SocketTanks.CONFIG.TILE_SIZE * scale;
	canvas.height = mapData.length * SocketTanks.CONFIG.TILE_SIZE * scale;
	var left = (windowWidth - canvas.width) / 2;
	left = left < 0? 0: left;
	canvasObj.style.left = left + 'px';
	var top = (windowHeight - canvas.height) / 2;
	top = top < 0? 0: top;
	canvas.style.top = top + 'px';
	var context = canvas.getContext('2d');
	var stop = false;

	// Setup the map tiles.
	var tiles = [];
	for(var i = 0; i < mapData.length; i++){
		for(var j = 0; j < mapData[i].length; j++){
			tiles[i] = tiles[i] || [];
			if(mapData[i][j] == 0){
				tiles[i][j] = SocketTanks.ObjectWithSprite(0, 0);
			} else{
				tiles[i][j] = SocketTanks.ObjectWithSprite(7, 2);
			}
			tiles[i][j].position = {x: j * SocketTanks.CONFIG.TILE_SIZE, y: i * SocketTanks.CONFIG.TILE_SIZE};
		}
	}
	
	// Container.
	var bullets = [];
	var playerTank = null;
	var tanks = [];
	var score = 0;

	// Copy a tank.
	var copyTank = function(tank){
		return {
			tankId: tank.tankId,
			direction: tank.direction,
			state: tank.state,
			position: {x: tank.position.x, y: tank.position.y}
		};
	};

	// Define properties.
	var properties = {
		"createPlayer": {
			value: function(playersData){
				var playerId = playersData.playerId;
				tanks = [];
				for(var i = 0; i < playersData.players.length; i++){
					var tank = this.updateTank(playersData.players[i]);
					if(tank.tankId === playerId){
						playerTank = tank;
					}
				}
			}
		},

		"serverUpdates": {
			value: function(data){
				var tanksData = data.tanks;
				if(tanksData){
					var newTankList = [];
					for(var i = 0; i < tanksData.length; i++){
						var tank = this.updateTank(tanksData[i]);
						if(playerTank && tank.tankId === playerTank.tankId){
							playerTank = tank;
						}
						newTankList.push(tank.tankId);
					}
					for(var i = 0; i < tanks.length; i++){
						var tank = tanks[i];
						if(newTankList.indexOf(tank.tankId) < 0){
							tank.state = 2;
						}
					}
				}
				var bulletsData = data.bullets;
				if(bulletsData){
					for(var i = 0; i < bulletsData.length; i++){
						this.newBullet(bulletsData[i]);
					}
				}
			}
		},

		"newBullet": {
			value: function(newBullet){
				if(newBullet && newBullet.bulletSender !== playerTank.tankId){
					var bullet = SocketTanks.Bullet(Math.floor(Math.random() * 1000000000), newBullet.bulletSender, newBullet.direction);
					bullet.position = newBullet.position;
					this.updateBullet(bullet);
				}
			}
		},

		"killedTank": {
			value: function(data){
				data.state = 2;
				this.updateTank(data);
			}
		},

		"startPlayerMovement": {
			value: function(direction){
				if(playerTank){
					playerTank.state = 1;
					playerTank.direction = direction;
				}
			}
		},

		"stopPlayerMovement": {
			value: function(){
				if(playerTank){
					playerTank.state = 0;
				}
			}
		},

		"playerFired": {
			value: function(){
				if(playerTank){
					var bullet = SocketTanks.Bullet(Math.floor(Math.random() * 1000000000), playerTank.tankId, playerTank.direction);
					bullet.position = playerTank.position;
					this.updateBullet(bullet);
				}
			}
		},

		// Reset the game.
		"stop": {
			value: function(){
				stop = true;
			}
		},

		// Update a bullet.
		"updateBullet": {
			value: function(newBullet){
				var bullet;
				for(var i = 0; i < bullets.length; i++){
					if(bullets[i].bulletId === newBullet.bulletId){
						bullet = bullets[i];
						break;
					}
				}
				
				// Create or update the bullet.
				if(bullet){
					bullet.state = newBullet.state;
					bullet.position = newBullet.position;
				} else{
					bullets.push(newBullet);
				}
			}
		},

		// Update a tank.
		"updateTank": {
			value: function(newTank){
				var tank;
				for(var i = 0; i < tanks.length; i++){
					if(tanks[i].tankId === newTank.tankId){
						tank = tanks[i];
						break;
					}
				}
				
				// Create or update the tank.
				if(!tank){
					tank = SocketTanks.Tank(newTank.tankId);
					tanks.push(tank);
				}
				tank.state = newTank.state;
				tank.direction = newTank.direction;
				tank.position = newTank.position;

				return tank;
			}
		},

		// Clear the canvas.
		"clear": {
			value: function(){
				context.clearRect(0, 0, canvas.width, canvas.height);
			}
		},

		// Draw the score.
		"drawScore": {
			value: function(){
				var size = 40 * scale;
				context.font = size + 'px Monaco';
				context.fillStyle = "white";
				context.fillText('Score: ' + score, size * 0.5, size * 1.35);
			}
		},

		// Draw the board's tiles.
		"drawTiles": {
			value: function(){
				for(var i = 0; i < tiles.length; i++){
					for(var j = 0; j < tiles[i].length; j++){
						tiles[i][j].draw(context, sprites, SocketTanks.CONFIG.TILE_SIZE, scale);
					}
				}
			}
		},

		// Draw the bullets.
		"drawBullets": {
			value: function(){
				var remainingBullets = [];
				for(var i = 0; i < bullets.length; i++){
					var previousPosition = {x: bullets[i].position.x, y: bullets[i].position.y};
					var removeBullet = bullets[i].update(scale);
					if(!removeBullet){
						// Check if the bullet collided.
						var currentPosition = bullets[i].position;
						if(previousPosition.x !== currentPosition.x || previousPosition.y !== currentPosition.y){
							var tileCollision = !SocketTanks.util.isTerrain(mapData, SocketTanks.CONFIG.TILE_SIZE, currentPosition.x, currentPosition.y, bullets[i].direction, SocketTanks.CONFIG.BULLET_HITBOX_RADIUS);
							var killedTank = SocketTanks.util.touchesTank(tanks, SocketTanks.CONFIG.TILE_SIZE, SocketTanks.CONFIG.TANK_HITBOX_RADIUS, currentPosition.x, currentPosition.y, bullets[i].direction, SocketTanks.CONFIG.BULLET_HITBOX_RADIUS, bullets[i].bulletSender);
							if(tileCollision || killedTank){
								bullets[i].state = 1;
							}
						}
						bullets[i].draw(context, sprites, SocketTanks.CONFIG.TILE_SIZE, scale);
						remainingBullets.push(bullets[i]);
					}
				}
				bullets = remainingBullets;
			}
		},

		// Draw the tanks.
		"drawTanks": {
			value: function(){
				var remainingTanks = [];
				for(var i = 0; i < tanks.length; i++){
					var previousPosition = {x: tanks[i].position.x, y: tanks[i].position.y};
					var removeTank = tanks[i].update(scale);
					if(removeTank && playerTank && tanks[i].tankId === playerTank.tankId){
						playerTank = null;
						this.stop();
					} else if(!removeTank){
						// Check if the tank collided.
						var currentPosition = tanks[i].position;
						if((previousPosition.x !== currentPosition.x || previousPosition.y !== currentPosition.y) &&
							(!SocketTanks.util.isTerrain(mapData, SocketTanks.CONFIG.TILE_SIZE, currentPosition.x, currentPosition.y, tanks[i].direction, SocketTanks.CONFIG.TANK_HITBOX_RADIUS) || 
								SocketTanks.util.touchesTank(tanks, SocketTanks.CONFIG.TILE_SIZE, SocketTanks.CONFIG.TANK_HITBOX_RADIUS, currentPosition.x, currentPosition.y, tanks[i].direction, SocketTanks.CONFIG.TANK_HITBOX_RADIUS, tanks[i].tankId))){
							tanks[i].position = previousPosition;
							tanks[i].freeze();
						}
						
						// Draw the tank.
						tanks[i].draw(context, sprites, SocketTanks.CONFIG.TILE_SIZE, scale, playerTank && tanks[i].tankId === playerTank.tankId);
						remainingTanks.push(tanks[i]);
					}
				}
				tanks = remainingTanks;
			}
		},

		// The player scored a point.
		"playerScored": {
			value: function(){
				score++;
			}
		},

		// Draw the canvas at each passing frame.
		"start": {
		value: function(eventCallback){
				if(stop){
					return false;
				}

				var self = this;

				// Controlls.
				var movement = [];
				document.onkeydown = function (e){
				    e = e || window.event;
				    var direction = null;
				    if(e.keyCode === 87){
				    	direction = 'N';
				    } else if(e.keyCode === 68){
				    	direction = 'E';
				    } else if(e.keyCode === 83){
				    	direction = 'S';
				    } else if(e.keyCode === 65){
				    	direction = 'W';
				    }  else if(e.keyCode === 32){
				    	self.playerFired();
				    	if(eventCallback && playerTank && typeof(eventCallback) === 'function'){
				    		eventCallback({tank: copyTank(playerTank), action: 'fire'});
				    	}
				    }
				    if(direction){
				    	if(movement.indexOf(direction) < 0){
				    		self.startPlayerMovement(direction);
					    	movement.push(direction);
					    	if(eventCallback && playerTank && typeof(eventCallback) === 'function'){
					    		eventCallback({tank: copyTank(playerTank), action: 'movement:' + playerTank.direction});
					    	}
					    }
				    }
				};
				document.onkeyup = function (e){
				    var direction = null;
				    if(e.keyCode === 87){
				    	direction = 'N';
				    } else if(e.keyCode === 68){
				    	direction = 'E';
				    } else if(e.keyCode === 83){
				    	direction = 'S';
				    } else if(e.keyCode === 65){
				    	direction = 'W';
				    }
				    if(direction){
				    	var index = movement.indexOf(direction);
				    	if(index >= 0){
				    		movement.splice(index, 1);
				    		if(movement.length > 0){
				    			self.startPlayerMovement(movement[movement.length - 1]);
				    			if(eventCallback && playerTank && typeof(eventCallback) === 'function'){
						    		eventCallback({tank: copyTank(playerTank), action: 'movement:' + playerTank.direction});
						    	}
				    		} else{
				    			self.stopPlayerMovement();
				    			if(eventCallback && playerTank && typeof(eventCallback) === 'function'){
						    		eventCallback({tank: copyTank(playerTank), action: 'stop'});
						    	}
				    		}
				    	}
				    }
				};

				// Game loop.
				setInterval(function(){
					self.clear();
					self.drawTiles();
					self.drawBullets();
					self.drawTanks();
					self.drawScore();
				}, 1000 / SocketTanks.CONFIG.FPS);

				return true;
			}
		},
	}

	// Return a new board object.
	return Object.create({}, properties);
};