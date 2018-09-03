const express = require('express'),
			app = express(),
			http = require('http').Server(app),
			io = require('socket.io')(http),
			util = require('./utils/util');

let port = process.env.PORT || 5001;

let Players = [];

io.on('connection', (socket) => {
	console.log('::Server::socket.io::connection A client connected... Id: ', socket.id);

	socket.on('room', (roomName) => {
		console.log('::Server::socket.io::room roomName: ', roomName, ' from: ', socket.id);
		let player = {
			id: socket.id,
			roomName: roomName,
			socket: socket
		};
		if (util.areTwoPlayersAlreadyInRoom(Players, player)) {
			socket.emit('cannot join', 'Game Room is already occupied by two players.');
			return;
		}

		socket.join(roomName);
		Players.push(player);
		io.in(roomName).emit('join room', socket.id);
		console.log('::Server::socket.io::room Number of Players connected to server: ', Players.length);
	});

	socket.on('confirm', (receiverId) => {
		console.log('::Server::socket.io.confirm receiverId: ', receiverId);
		if (receiverId !== socket.id) {
			let receiverSocket = util.checkBothPlayersInSameRoom(Players, socket, receiverId);
			if (receiverSocket === false) {
				return;
			}
			receiverSocket.emit('confirm player2', socket.id);
		}
	});

	socket.on('disconnect', () => {
		let roomName = util.getRoomName(Players, socket.id);
		if (roomName === null) {
			console.log('::Server::socket.io::disconnect player: ', socket.id, ' not in a room');
			return;
		}
		Players = util.removePlayer(Players, socket.id);
		console.log('::Server::socket.io::disconnect A client disconnected... Id: ', socket.id);
		console.log('::Server::socket.io::disconnect Number of Players connected to server: ', Players.length);
		io.in(roomName).emit('left game room', socket.id);
	});

	socket.on('msg send event', (msg) => {
		console.log('::Server::socket.io::msg send event Message received: ', msg, ' from: ', socket.id);
		msg = JSON.parse(msg);
		let newMsg = {
			sender: socket.id,
			msg: msg.msg
		};
		let receiverSocket = util.checkBothPlayersInSameRoom(Players, socket, msg.receiver);
		if (receiverSocket === false) {
			return;
		}
		receiverSocket.emit('msg receive event', newMsg);
	});

	socket.on('bingo', (opponent) => {
		console.log('::Sender::socket.io::bingo opponent: ', opponent);
		let receiverSocket = util.checkBothPlayersInSameRoom(Players, socket, opponent);
		if (receiverSocket === false) {
			return;
		}
		receiverSocket.emit('opponent bingo', socket.id);
	});
});

app.use(express.static(__dirname + '/public'));
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
	res.render('pages/bingo');
});

app.set('port', port);
http.listen(app.get('port'), () => {
	console.log('html bingo game is running on port: ', app.get('port'));
});
