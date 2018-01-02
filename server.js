const express = require('express'),
	app = express(),
	WebSocket = require('ws').Server;

var port = process.env.PORT || 5001,
	wsPort = process.env.WS_PORT || 5002;

// initialize the WebSocket server instance
const wss = new WebSocket({port: wsPort});

var clients = [];

wss.on('connection', function (ws) {
	ws.on('open', function () {
        console.log("::Server:: Connection is open...");
    });

    ws.on('message', function (message) {
		console.log('::Server:: Message received: ' + message);
		ws.send("::Server:: Hello! You sent: " + message);
	});

    ws.on('error', function () {
		console.log("::Server:: WebSocket error...");
		ws.close();
    });

    ws.on('close', function () {
        console.log("::Server:: Connection is closed...");
    });

	ws.send("::Server:: Hi there, WebSocket from server");
});

app.use(express.static(__dirname + '/public'));
app.set('view engine', 'ejs');

app.get('/', function(req, res) {
	res.render('pages/bingo');
});

app.set('port', port);
app.listen(app.get('port'), function () {
	console.log('html bingo game is running on port: ', app.get('port'));
});
