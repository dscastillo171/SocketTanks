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


// Create a new game object using the given sprite.
SocketTanks.ObjectWithSprite = function(spriteCoordX, spriteCoordY){
	// Private stuff.
	var spriteCoords = {x: spriteCoordX, y: spriteCoordY};
	var position = {x: 0, y: 0};

	// Public stuff.
	var properties = {
		/**
		 * Sprite coordinates.
		 */
		"spriteCoords":{
			get: function(){
				return spriteCoords;
			},
			set: function(newSpriteCoords){
				spriteCoords.x = newSpriteCoords.x;
				spriteCoords.y = newSpriteCoords.y;
			}
		},

		/**
		* The object's position.
		*/
		"position": {
			set: function(newPosition){
				position.x = newPosition.x;
				position.y = newPosition.y;
			},
			get: function(){
				return position;
			}
		},

		/**
		* Draw the object.
		*/
		"draw": {
			value: function(context, image, sourceSize, scale){
				context.drawImage(image, // Sprite sheet.
					Math.floor(spriteCoords.x * sourceSize), Math.floor(spriteCoords.y * sourceSize), Math.floor(sourceSize), Math.floor(sourceSize), // Source.
					Math.floor(position.x * scale), Math.floor(position.y * scale), Math.floor(sourceSize * scale), Math.floor(sourceSize * scale)); // Destination.
			}
		}
	};

	return Object.create({}, properties);
}; 