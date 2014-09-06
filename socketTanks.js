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

/*
 * Constants used across all clients. 
 */
var CONFIG = {};
// Rendering frames per second.
CONFIG.FPS = 30;
// Tile size, in pixels.
CONFIG.TILE_SIZE = 84;
// Speed of bullets, pixels per frame.
CONFIG.BULLET_SPEED = 14;
// Bullet explosion duration, in frames.
CONFIG.BULLET_EXPLOSION_DURATION = 4;
// Bullet hitbox, in pixels,
CONFIG.BULLET_HITBOX_RADIUS = 7;
// Speed of tanks, pixels per frame.
CONFIG.TANK_SPEED = 6;
// Tank explosion duration, in frames.
CONFIG.TANK_EXPLOSION_DURATION = 8;
// Tank hitbox, in pixels.
CONFIG.TANK_HITBOX_RADIUS = 31;
// Sprites url.
CONFIG.SPRITES_URL = 'client/socketTanks/images/sprites.png';
// Canvas scale.
CONFIG.SCALE = 0.75; // 1.0, 0.75, 0.5, 0.25

/*
 * Private stuff.
 */

// Map structure.
var mapStructure = [
	[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
	[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
	[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
	[1, 0, 0, 1, 1, 0, 1, 1, 0, 0, 1],
	[1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1],
	[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
	[1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1],
	[1, 0, 0, 1, 1, 0, 1, 1, 0, 0, 1],
	[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
	[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
	[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
];

// Setup the game arrays.
var tanks = [];
var bullets = [];
var onKillFuncion = null;
var onPositionUpdateFunction = null;
var onPointFunction = null;

// Write the configurations common to all clients. 
var generateConfigurationFile = function(){
	return 'var SocketTanks = SocketTanks || {};' +
		'SocketTanks.CONFIG = ' + JSON.stringify(CONFIG) + ';' +
		'SocketTanks.util = {};' +
		'SocketTanks.util.isTerrain = ' + isTerrain + ';' +
		'SocketTanks.util.touchesTank = ' + touchesTank + ';' +
		'SocketTanks.util.updatePosition = ' + updatePosition + ';';
};

// Write the game map.
var generateGameMap = function(){
	return 'var SocketTanks = SocketTanks || {};' +
		'SocketTanks.MapStructure = ' + JSON.stringify(mapStructure) + ';';
};

// Return true if the given position is a terrain tile.
var isTerrain = function(map, tileSize, x, y, direction, radius){
	var hitBoxX = x + ((tileSize - (radius * 2)) / 2);
	var hitBoxY = y + ((tileSize - (radius * 2)) / 2);
	var midX = hitBoxX + radius;
	var midY = hitBoxY + radius;
	var upperX, upperY, lowerX, lowerY;
	if(direction === 'N'){
		midY -= radius
		upperX = hitBoxX;
		upperY = hitBoxY;
		lowerX = hitBoxX + (radius * 2);
		lowerY = hitBoxY;
	} else if(direction === 'E'){
		midX += radius;
		upperX = hitBoxX + (radius * 2);
		upperY = hitBoxY;
		lowerX = hitBoxX + (radius * 2);
		lowerY = hitBoxY + (radius * 2);
	} else if(direction === 'S'){
		midY += radius;
		upperX = hitBoxX;
		upperY = hitBoxY + (radius * 2);
		lowerX = hitBoxX + (radius * 2);
		lowerY = hitBoxY + (radius * 2);
	} else if(direction === 'W'){
		midX -= radius;
		upperX = hitBoxX;
		upperY = hitBoxY;
		lowerX = hitBoxX;
		lowerY = hitBoxY + (radius * 2);
	} 
	var tileX = Math.floor(midX / tileSize);
	var tileY = Math.floor(midY / tileSize);
	var tileUpperX = Math.floor(upperX / tileSize);
	var tileUpperY = Math.floor(upperY / tileSize);
	var tileLowerX = Math.floor(lowerX / tileSize);
	var tileLowerY = Math.floor(lowerY / tileSize);
	
	var returnValue = false;
	if(map.length > 0 && tileUpperY < map.length && tileUpperX < map[0].length
		&& tileLowerY < map.length && tileLowerX < map[0].length){
		returnValue = map[tileY][tileX] === 0 && map[tileUpperY][tileUpperX] === 0 && map[tileLowerY][tileLowerX] === 0;
	}
	return returnValue;
};

// Return the touching tank, if the given coordinates touch a tank.
var touchesTank = function(tankList, tileSize, tankHitboxRadius, x, y, direction, radius, skipTankId){
	var hitBoxX = x + ((tileSize - (radius * 2)) / 2);
	var hitBoxY = y + ((tileSize - (radius * 2)) / 2);
	var midX = hitBoxX + radius;
	var midY = hitBoxY + radius;
	var upperX, upperY, lowerX, lowerY;
	if(direction === 'N'){
		midY -= radius
		upperX = hitBoxX;
		upperY = hitBoxY;
		lowerX = hitBoxX + (radius * 2);
		lowerY = hitBoxY;
	} else if(direction === 'E'){
		midX += radius;
		upperX = hitBoxX + (radius * 2);
		upperY = hitBoxY;
		lowerX = hitBoxX + (radius * 2);
		lowerY = hitBoxY + (radius * 2);
	} else if(direction === 'S'){
		midY += radius;
		upperX = hitBoxX;
		upperY = hitBoxY + (radius * 2);
		lowerX = hitBoxX + (radius * 2);
		lowerY = hitBoxY + (radius * 2);
	} else if(direction === 'W'){
		midX -= radius;
		upperX = hitBoxX;
		upperY = hitBoxY;
		lowerX = hitBoxX;
		lowerY = hitBoxY + (radius * 2);
	} 
	var returnValue = null;
	for(var i = 0; i < tankList.length; i++){
		var tankPosition = {x: tankList[i].position.x, y: tankList[i].position.y};
		tankPosition.x += (tileSize - (tankHitboxRadius * 2)) / 2;
		tankPosition.y += (tileSize - (tankHitboxRadius * 2)) / 2;
		if(tankList[i].tankId !== skipTankId && (
			(midX >= tankPosition.x && midX <= tankPosition.x + (tankHitboxRadius * 2) && midY >= tankPosition.y && midY <= tankPosition.y + (tankHitboxRadius * 2))
			|| (upperX >= tankPosition.x && upperX <= tankPosition.x + (tankHitboxRadius * 2) && upperY >= tankPosition.y && upperY <= tankPosition.y + (tankHitboxRadius * 2))
			|| (lowerX >= tankPosition.x && lowerX <= tankPosition.x + (tankHitboxRadius * 2) && lowerY >= tankPosition.y && lowerY <= tankPosition.y + (tankHitboxRadius * 2))
		)){
			returnValue = tankList[i];
			break;
		}
	}
	return returnValue;
};

// Updates the position of a moving object.
var updatePosition = function(currentPosition, direction, speed, scale){
	var newPosition = {x: currentPosition.x, y: currentPosition.y};
	if(direction === 'N'){
		newPosition.y -= speed * scale;
	} else if (direction === 'E'){
		newPosition.x += speed * scale;
	} else if (direction === 'S'){
		newPosition.y += speed * scale;
	} else if (direction === 'W'){
		newPosition.x -= speed * scale;
	}
	return {x: Math.round(newPosition.x), y: Math.round(newPosition.y)};
}

// Create a new tank.
var newTank = function(tankId){
	// Search for an available spot.
	var randomY = Math.floor(Math.random() * mapStructure.length);
	var randomX = mapStructure.length > 0? Math.floor(Math.random() * mapStructure[0].length): 0;
	while(mapStructure[randomY][randomX] === 1 || 
		touchesTank(tanks, CONFIG.TILE_SIZE, CONFIG.TANK_HITBOX_RADIUS, randomX * CONFIG.TILE_SIZE, randomY * CONFIG.TILE_SIZE, 'N', CONFIG.TANK_HITBOX_RADIUS, tankId) ||
		touchesTank(tanks, CONFIG.TILE_SIZE, CONFIG.TANK_HITBOX_RADIUS, randomX * CONFIG.TILE_SIZE, randomY * CONFIG.TILE_SIZE, 'E', CONFIG.TANK_HITBOX_RADIUS, tankId) ||
		touchesTank(tanks, CONFIG.TILE_SIZE, CONFIG.TANK_HITBOX_RADIUS, randomX * CONFIG.TILE_SIZE, randomY * CONFIG.TILE_SIZE, 'S', CONFIG.TANK_HITBOX_RADIUS, tankId) ||
		touchesTank(tanks, CONFIG.TILE_SIZE, CONFIG.TANK_HITBOX_RADIUS, randomX * CONFIG.TILE_SIZE, randomY * CONFIG.TILE_SIZE, 'W', CONFIG.TANK_HITBOX_RADIUS, tankId)){
		randomY = Math.floor(Math.random() * mapStructure.length);
		randomX = mapStructure.length > 0? Math.floor(Math.random() * mapStructure[0].length): 0;
	}

	return {
		tankId: tankId,
		direction: 'N',
		state: 0,
		position: {x: randomX * CONFIG.TILE_SIZE, y: randomY * CONFIG.TILE_SIZE}
	};
}

// Remove the tank with the given id.
var removeTank = function(tankId){
	var index = -1;
	for(var i = 0; i < tanks.length; i++){
		var tank = tanks[i];
		if(tank.tankId === tankId){
			index = i;
			break;
		}
	}

	if(index >= 0){
		tanks.splice(index, 1);
	}
};

/*
 * Public stuff.
 */
var properties = {
	// Handle the given path to a dynamic file.
	handlePath: function(req, res){
		res.set({'Content-Type': 'text/javascript'});
		if(req.url === '/socketTanks/gameConfiguration.js'){
			res.send(generateConfigurationFile());
		} else if(req.url === '/socketTanks/gameMap.js'){
			res.send(generateGameMap());
		} else{
			res.send(404);
		}
	},

	// A new tank joins the game.
	newPlayer: function(tankId){
		var tank = newTank(tankId);
		tanks.push(tank);
		if(onPositionUpdateFunction){
			onPositionUpdateFunction({tanks: tanks});
		}
		return {playerId: tank.tankId, players: tanks};
	},

	// A player disconnected.
	playerLeft: function(tankId){
		removeTank(tankId);
		if(onPositionUpdateFunction){
			onPositionUpdateFunction({tanks: tanks});
		}
	},

	// A player sent and action.
	clientTankEvent: function(action){
		if(action.tank){
			// Search for the tank.
			var tank;
			for(var i = 0; i < tanks.length; i++){
				if(tanks[i].tankId === action.tank.tankId){
					tank = tanks[i];
					break;
				}
			}
			
			// Update the tank.
			var newBullets = [];
			if(tank){
				tank.state = action.tank.state;
				tank.direction = action.tank.direction;
				tank.position = action.tank.position;

				// Add a bullet if necessary.
				if(action.action === 'fire'){
					var bullet = {position: tank.position, bulletSender: tank.tankId, direction: tank.direction};
					bullets.push(bullet);
					newBullets.push(bullet);
				}
			}

			if(onPositionUpdateFunction){
				onPositionUpdateFunction({tanks: tanks, bullets: newBullets});
			}
		}
	},

	// Callback called once the server registers a kill.
	onKill: function(callback){
		if(typeof(callback) === 'function'){
			onKillFuncion = callback;
		}
	},

	onUpdate: function(callback){
		if(typeof(callback) === 'function'){
			onPositionUpdateFunction = callback;
		}
	},

	onPoint: function(callback){
		if(typeof(callback) === 'function'){
			onPointFunction = callback;
		}
	}
};

// Export the socketTank module.
module.exports = function(){
	// Game loop.
	setInterval(function(){
		// Check the bullets.
		var killedTanks = [];
		var killers = [];
		var remainingBullets = [];
		for(var i = 0; i < bullets.length; i++){
			var previousPosition = {x: bullets[i].position.x, y: bullets[i].position.y};
			bullets[i].position = updatePosition(bullets[i].position, bullets[i].direction, CONFIG.BULLET_SPEED, CONFIG.SCALE);

			// Check if the bullet collided.
			var currentPosition = bullets[i].position;
			var tileCollision = !isTerrain(mapStructure, CONFIG.TILE_SIZE, currentPosition.x, currentPosition.y, bullets[i].direction, CONFIG.BULLET_HITBOX_RADIUS);
			var killedTank = touchesTank(tanks, CONFIG.TILE_SIZE, CONFIG.TANK_HITBOX_RADIUS, currentPosition.x, currentPosition.y, bullets[i].direction, CONFIG.BULLET_HITBOX_RADIUS, bullets[i].bulletSender);
			if(tileCollision || killedTank){
				if(killedTank){
					killedTanks.push(killedTank);
					killers.push(bullets[i].bulletSender);
				}
			} else{
				remainingBullets.push(bullets[i]);
			}
		}
		bullets = remainingBullets;


		// Check the tanks.
		var remainingTanks = [];
		for(var i = 0; i < tanks.length; i++){
			// Check if the tank was killed.
			var killed = false;
			for(var j = 0; j < killedTanks.length; j++){
				if(tanks[i].tankId === killedTanks[j].tankId){
					killed = true;
					break;
				}
			}

			// Update the tank's position.
			if(!killed){
				var previousPosition = {x: tanks[i].position.x, y: tanks[i].position.y};
				if(tanks[i].state === 1){
					tanks[i].position = updatePosition(tanks[i].position, tanks[i].direction, CONFIG.TANK_SPEED, CONFIG.SCALE);
					
					// Check if the tank collided.
					var currentPosition = tanks[i].position;
					if(!isTerrain(mapStructure, CONFIG.TILE_SIZE, currentPosition.x, currentPosition.y, tanks[i].direction, CONFIG.TANK_HITBOX_RADIUS) || 
							touchesTank(tanks, CONFIG.TILE_SIZE, CONFIG.TANK_HITBOX_RADIUS, currentPosition.x, currentPosition.y, tanks[i].direction, CONFIG.TANK_HITBOX_RADIUS, tanks[i].tankId)){
						tanks[i].position = previousPosition;
					}
				}
				remainingTanks.push(tanks[i]);
			}
		}
		tanks = remainingTanks;
		
		// Inform the clients about the killed tanks.
		if(killedTanks.length || killers.length){
			for(var i = 0; i < killedTanks.length; i++){
				if(onKillFuncion){
					onKillFuncion(killedTanks[i]);
				}
			}
			for(var i = 0; i < killers.length; i++){
				if(onPointFunction){
					onPointFunction(killers[i]);
				}
			}
		}
	}, 1000 / CONFIG.FPS);

	return properties;
};