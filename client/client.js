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

// Document fully loaded.
window.onload = function(){
	// Initialize the game.
	var canvasObj = document.getElementById('GameCanvas');
	var board = SocketTanks.BoardWithCanvas(canvasObj, SocketTanks.MapStructure, SocketTanks.CONFIG.SCALE);

	// Socket.io
	var socket = io.connect();

	socket.on('connect', function(){
		// Start the game.
		var started = board.start(function(tankEvent){
			socket.emit('clientTankEvent', tankEvent);
		});

		// Create the player.
		if(started){
			socket.emit('newPlayer', function(playersData){
				board.createPlayer(playersData);
			});
		}
	});

	socket.on('serverUpdate', function(data){
		board.serverUpdates(data);
	});

	socket.on('tankKilled', function(data){
		board.killedTank(data);
	});

	socket.on('point', function(){
		board.playerScored();
	});

	socket.on('disconnect', function(){
		board.stop();
	});
};