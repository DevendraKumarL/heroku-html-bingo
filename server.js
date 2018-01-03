const express = require('express'),
	app = express(),
	// WebSocket = require('ws').Server,
	http = require('http').Server(app),
	io = require('socket.io')(http);

let port = process.env.PORT || 5001;
// let wsPort = process.env.WS_PORT || 5002;

let util = require('./public/js/util');

let Players = [];

io.on('connection', (socket) => {
	console.log('::Server::socket.io::connection A client connected... Id: ', socket.id);

	socket.on('room', (roomName) => {
		console.log('::Server::socket.io::room ', roomName, ' from: ', socket.id);
        let player = {
            id: socket.id,
            roomName: roomName,
			socket: socket
        };
        if (util.areTwoPlayersInRoom(Players, player)) {
            socket.emit('cannot join', 'Game Room is already occupied by two players.');
            return;
        }
        socket.join(roomName);
        Players.push(player);
        io.in(roomName).emit('join room', socket.id);
        console.log('::Server::socket.io::room Number of Players: ', Players.length);
    });

	socket.on('confirm', (receiverId) => {
		console.log('::Server::socket.io.confirm id: ', receiverId);
		if (receiverId !== socket.id) {
		    let sockt = util.checkBothPlayersInSameRoom(Players, socket, receiverId);
		    if (sockt === false) {
		        return;
            }
            sockt.emit('confirm player2', socket.id);
		}
    });

    // socket.on('msg send event', (msg) => {
		// console.log('::Server::socket.io::msg send event Message received: ', msg, ' from: ', socket.id);
    //     msg = JSON.parse(msg);
    //     let sockt = checkBothPlayersInSameRoom(socket, msg.receiver);
    //     if (sockt === false) {
    //         return;
    //     }
		// sockt.emit('msg receive event', msg.msg)
    // });
	
	socket.on('disconnect', () => {
	    Players = util.removePlayer(Players, socket.id);
		console.log('::Server::socket.io::disconnect A client disconnected... Id: ', socket.id);
        console.log('::Server::socket.io::disconnect Number of Players: ', Players.length);
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
