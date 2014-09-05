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


// Create a new bullet.
SocketTanks.Bullet = function(bulletId, sender, direction){
	// Private stuff.
	var explosionCounter = 0;

	// Public stuff.
	var properties = {
		/**
		 * Bullet identifier.
		 */
		"bulletId":{
			get: function(){
				return bulletId;
			}
		},

		/**
		 * Bullet's sender.
		 */
		"bulletSender":{
			get: function(){
				return sender;
			}
		},

		/**
		 * Bullet's direction.
		 */
		"direction":{
			get: function(){
				return direction;
			}
		},

		/**
		 * Bullet state.
		 * 0: moving.
		 * 1: exploding.
		 */
		 "state":{
		 	value: 0,
		 	writable: true
		 },

		/**
		* Update the bullets position.
		* Returns true if the bullet should be removed from the board.
		*/
		"update": {
			value: function(scale){
				var removeBullet;
				if(this.state === 0){
					this.position = SocketTanks.util.updatePosition(this.position, this.direction, SocketTanks.CONFIG.BULLET_SPEED, scale);
					removeBullet = false;
				} else if(this.state === 1){
					this.spriteCoords = {x: 1, y: 2};
					explosionCounter++;
					if(explosionCounter >= SocketTanks.CONFIG.BULLET_EXPLOSION_DURATION){
						explosionCounter = 0;
						removeBullet = true;
					} else{
						removeBullet = false;
					}
				}
				return removeBullet;
			}
		}
	};

	var basicObject = SocketTanks.ObjectWithSprite(5, 2);
	return Object.create(basicObject, properties);
}; 