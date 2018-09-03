let exportUtil = module.exports = {};

// util functions
exportUtil.checkBothPlayersInSameRoom = (Players, socket, receiverId) => {
	let roomName1,
		roomName2, socket2;
	for (let i = 0; i < Players.length; ++i) {
		if (socket.id === Players[i].id) {
			roomName1 = Players[i].roomName;
			break;
		}
	}
	for (let i = 0; i < Players.length; ++i) {
		if (receiverId === Players[i].id) {
			roomName2 = Players[i].roomName;
			socket2 = Players[i].socket;
			break;
		}
	}
	console.log('::checkBothPlayersInSameRoom:: roomName1: ', roomName1, ' roomName2: ', roomName2);

	if (roomName1 !== roomName2) {
		socket.emit('no opponent', receiverId);
		return false;
	}
	return socket2;
};

exportUtil.areTwoPlayersAlreadyInRoom = (Players, player) => {
	let count = 0;
	for (let i = 0; i < Players.length; ++i) {
		if (Players[i].roomName === player.roomName) {
			count++;
		}
		if (count >= 2) {
			return true;
		}
	}
	return false;
};

exportUtil.removePlayer = (Players, socketId) => {
	for (let i = 0; i < Players.length; ++i) {
		console.log('::Server::socket.io::util::removePlayer Player: ', Players[i].id, ' socketId: ', socketId);
		if (Players[i].id === socketId) {
			console.log('::Server::socket.io::util::removePlayer Removing playerId: ', socketId);
			Players.splice(i, 1);
			return Players;
		}
	}
	console.log('::Server::socket.io::util::removePlayer No players removed');
	return Players;
};

exportUtil.getRoomName = (Players, socketId) => {
	for (let i = 0; i < Players.length; ++i) {
		console.log('::Server::socket.io::util::getRoomName Player: ', Players[i].id, ' socketId: ', socketId);
		if (Players[i].id === socketId) {
			return Players[i].roomName;
		}
	}
	return null;
};
