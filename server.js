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
 * Config. 
 */
// Set up app.
var app = require('express')();
var server = require('http').Server(app);

// Set up the game logic.
var socketTanks = require('./socketTanks')();

/*
 * Routing. 
 */ 
// Basic routing.
app.get('/', function(req, res){
	res.sendfile(__dirname + '/client/index.html');
});

// Dynamic files.
app.get('/socketTanks/*', socketTanks.handlePath);

// Static files.
app.get('/client/*', function(req, res){
	res.sendfile(__dirname + req.url);
});

/*
 * Action.
 */
// Startup server.
server.listen(8080, '0.0.0.0');
console.log("SocketTanks listening on port 8080.");

/*
 * Socket.io 
 */
