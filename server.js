const express = require('express'),
	app = express(),
	WebSocket = require('ws').Server,
	http = require('http').Server(app),
	io = require('socket.io')(http);

var port = process.env.PORT || 5001,
	wsPort = process.env.WS_PORT || 5002;

// initialize the WebSocket server instance
// const wss = new WebSocket({port: wsPort});
//
// wss.on('connection', function (ws) {
// 	ws.on('open', function () {
//         console.log("::Server:: Connection is open...");
//     });
//
//     ws.on('message', function (message) {
// 		console.log('::Server:: Message received: ' + message);
// 		ws.send("::Server:: Hello! You sent: " + message);
// 	});
//
//     ws.on('error', function () {
// 		console.log("::Server:: WebSocket error...");
// 		ws.close();
//     });
//
//     ws.on('close', function () {
//         console.log("::Server:: Connection is closed...");
//     });
//
// 	ws.send("::Server:: Hi there, WebSocket from server");
// });

function checkBothPlayersInSameRoom() {

}

var Players = [];

io.on('connection', function (socket) {
	console.log('::Server::socket.io::connection A client connected... Id: ', socket.id);

	socket.on('room', function (roomname) {
		console.log('::Server::socket.io::room ', roomname, ' from: ', socket.id);
		socket.join(roomname);
        var player = {
            id: socket.id,
            roomname: roomname,
			socket: socket
        };
        var count = 0;
        for (var i = 0; i < Players.length; ++i) {
        	if (Players[i].roomname === player.roomname) {
        		count++;
			}
            if (count >= 2) {
        		socket.emit('cannot join', 'room occupied');
        		return;
            }
		}
        Players.push(player);
        io.in(roomname).emit('join room', socket.id);
    });

	socket.on('confirm', function (receiverId) {
		console.log('::Server::socket.io.confirm id: ', receiverId);
		if (receiverId !== socket.id) {
            var roomname1,
                roomname2, socket2;
            for (var i = 0; i < Players.length; ++i) {
                if (socket.id === Players[i].id) {
                    roomname1 = Players[i].roomname;
                    break;
                }
            }
            for (var i = 0; i < Players.length; ++i) {
                if (receiverId === Players[i].id) {
                    roomname2 = Players[i].roomname;
                    socket2 = Players[i].socket;
                    break;
                }
            }

            if (roomname1 !== roomname2) {
                socket.emit('no opponent', receiverId);
                return;
            }

            socket2.emit('confirm player2', socket.id);
		}
    });

	socket.on('msg send event', function (msg) {
		console.log('::Server::socket.io::msg send event Message received: ', msg, ' from: ', socket.id);
        msg = JSON.parse(msg);
        var roomname1,
			roomname2, socket2;
        for (var i = 0; i < Players.length; ++i) {
        	if (socket.id === Players[i].id) {
        		roomname1 = Players[i].roomname;
        		break;
			}
		}
		console.log('::Server::socket.io::msg send event sender roomname: ', roomname1);
        for (var i = 0; i < Players.length; ++i) {
            if (msg.receiver === Players[i].id) {
                roomname2 = Players[i].roomname;
                socket2 = Players[i].socket;
                break;
            }
        }
        console.log('::Server::socket.io::msg send event receiver roomname: ', roomname2);

        if (roomname1 !== roomname2) {
        	socket.emit('no opponent', msg.receiver);
        	return;
		}

		socket2.emit('msg receive event', msg.msg)
		// io.in(roomname1).emit('msg receive event', msg.msg);
    });
	
	socket.on('disconnect', function () {
		console.log('::Server::socket.io::disconnect A client disconnected... Id: ', socket.id);
    });
});

app.use(express.static(__dirname + '/public'));
app.set('view engine', 'ejs');

app.get('/', function(req, res) {
	res.render('pages/bingo');
});

app.set('port', port);
// app.listen(app.get('port'), function () {
// 	console.log('html bingo game is running on port: ', app.get('port'));
// });
http.listen(app.get('port'), function () {
	console.log('html bingo game is running on port: ', app.get('port'));
});
