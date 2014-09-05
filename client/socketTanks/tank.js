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


// Create a new tank.
SocketTanks.Tank = function(tankId){
	// Private stuff.
	var direction = 'N';

	// Movement animation.
	var movementCounter = 0;
	var movementSpriteDuration = 1;
	var movementSprites = [{x: 1,y: 0}, {x: 2,y: 0}, {x: 3,y: 0}, {x: 4,y: 0}, {x: 5,y: 0}, {x: 6,y: 0}, {x: 7,y: 0}, {x: 0,y: 1}];
	var currentMovementSprite = 0;

	// Explosion animation.
	var explosionCounter = 0;
	var explosionDuration = 8;
	var explosionSprite = {x: 1, y: 2};

	// Public stuff.
	var properties = {
		/**
		 * Tank identifier.
		 */
		"tankId":{
			get: function(){
				return tankId;
			}
		},

		/**
		 * Tanks direction.
		 */
		"direction":{
			get: function(){
				return direction;
			},
			set: function(newDirection){
				if(newDirection === 'N' || newDirection === 'E' || newDirection === 'S' || newDirection === 'W'){
					direction = newDirection;
				}
			}
		},

		/**
		 * Tank's state.
		 * 0: still
		 * 1: moving.
		 * 2: exploding.
		 */
		 "state":{
		 	value: 0,
		 	writable: true
		 },

		/*
		 * Freeze the tank by decreasing the movement counter.
		 */
		"freeze": {
			value: function(){
				movementCounter--;
			}
		},

		/**
		* Update the tank's position.
		* Returns true if the tank should be removed from the board.
		*/
		"update": {
			value: function(scale){
				var removeTank;
				if(this.state === 1){
					// Calculate the current sprite.
					movementCounter++;
					if(movementCounter > movementSpriteDuration){
						movementCounter = 0;
						currentMovementSprite--;
						if(currentMovementSprite < 0){
							currentMovementSprite = movementSprites.length - 1;
						}
					}

					// Update the tank's position.
					this.position = SocketTanks.util.updatePosition(this.position, this.direction, SocketTanks.CONFIG.TANK_SPEED, scale);

					removeTank = false;
				} else if(this.state === 2){
					// Update the explosion animation.
					explosionCounter++;
					if(explosionCounter >= explosionDuration){
						removeTank = true;
					} else{
						if(explosionCounter < explosionDuration / 3){
							explosionSprite = {x: 1, y: 2};
						} else if(explosionCounter > explosionDuration * 2 / 3){
							explosionSprite = {x: 3, y: 2};
						} else{
							explosionSprite = {x: 2, y: 2};
						}
						removeTank = false;
					}
				}
				return removeTank;
			}
		},

		/**
		* Draw the object.
		*/
		"draw": {
			value: function(context, image, sourceSize, scale, isPlayer){
				// Rotate the tank.
				var sprite = movementSprites[currentMovementSprite];
				var angle = Math.PI/180;
				var xCoord = this.position.x;
				var yCoord = this.position.y;
				if(this.direction === 'N'){
					angle *= 0;
				} else if(this.direction === 'E'){
					angle *= 90;
					var xCoordTemp = xCoord;
					xCoord = yCoord;
					yCoord = (-1 * xCoordTemp) - sourceSize;
				} else if(this.direction === 'S'){
					angle *= 180;
					xCoord = (-1 * xCoord) - sourceSize;
					yCoord = (-1 * yCoord) - sourceSize;
				} else if(this.direction === 'W'){
					angle *= 270;
					var xCoordTemp = xCoord;
					xCoord = (-1 * yCoord) - sourceSize;;
					yCoord = xCoordTemp;
				}

				// Draw the tank.
				context.save();
				context.rotate(angle);
				context.drawImage(image, // Sprite sheet.
					sprite.x * sourceSize, (isPlayer? sprite.y: sprite.y + 1) * sourceSize, sourceSize, sourceSize, // Source.
					xCoord * scale, yCoord * scale, sourceSize * scale, sourceSize * scale); // Destination.
				context.restore();

				// Draw the explosion.
				if(this.state === 2){
					context.drawImage(image, // Sprite sheet.
						explosionSprite.x * sourceSize, explosionSprite.y * sourceSize, sourceSize, sourceSize, // Source.
						this.position.x * scale, this.position.y * scale, sourceSize * scale, sourceSize * scale); // Destination.
					context.restore;
				}
			}
		}
	};

	var basicObject = SocketTanks.ObjectWithSprite(5, 2);
	return Object.create(basicObject, properties);
}; 