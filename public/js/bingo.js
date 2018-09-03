let socket;

let playerTurn = {
	player1: false,
	player2: false
};

let isPlayerHost = true;

let gameBingoElement = document.getElementById('gameBingo'),
	boardElement = document.getElementById('gameBoard'),
	bingoTitle = document.getElementById('bingoTitle'),
	restartBtn = document.getElementById('restartBtn'),
	roomNameElement = document.getElementById('roomName');

let bingoDivElements = [],
	bingoNumbers = [],
	bingoPositions = [],
	bingoBoard = [],
	bingoBoardChecked = [];

let strikes = 0,
	colorFlag = false;

let bingoStrikeChecked = [false, false, false, false, false],
	rowStrikes = [false, false, false, false, false],
	colStrikes = [false, false, false, false, false],
	diagonalStrikes = [false, false];

let gameReadyStatus = false,
	playerBINGO = false;

function getBingoDivElements() {
	for (let i = 0; i < 5; i++) {
		bingoDivElements[i] = document.getElementById('bingo' + (i + 1));
	}
}

function storeBingoNumbers() {
	for (let i = 0; i < 25; i++) {
		bingoNumbers[i] = i + 1;
	}
}

function storeBingoPositions() {
	for (let i = 0; i < 25; i++) {
		bingoPositions[i] = i + 1;
	}
}

function shuffleList(arr) {
	let i = arr.length, j = 0;
	while (i--) {
		j = Math.floor(Math.random() * (i + 1));
		let tmp = arr[i];
		arr[i] = arr[j];
		arr[j] = tmp;
	}
	return arr;
}

function initiateBoard() {
	for (let i = 0; i < 5; i++) {
		bingoBoard[i] = [];
		bingoBoardChecked[i] = [];
	}
	for (let i = 0; i < 5; i++) {
		for (let j = 0; j < 5; j++) {
			bingoBoardChecked[i][j] = false;
		}
	}
}

function initiateGameObjects() {
	storeBingoNumbers();

	storeBingoPositions();

	bingoNumbers = shuffleList(bingoNumbers);
	bingoPositions = shuffleList(bingoPositions);

	initiateBoard();
}

function createBingoBoardMatrix() {
	for (let i = 0; i < bingoNumbers.length; i++) {
		let count = 0, flag = false;
		for (let j = 0; j < 5; j++) {
			for (let k = 0; k < 5; k++) {
				count++;
				if (count === bingoPositions[i]) {
					bingoBoard[j][k] = bingoNumbers[i];
					flag = true;
					break;
				}
			}
			if (flag) {
				break;
			}
		}
	}
}

function flashBingo() {
	if (colorFlag) {
		colorFlag = false;
		bingoTitle.style.color = 'red';
	}
	else {
		colorFlag = true;
		bingoTitle.style.color = 'blue';
	}
	setTimeout(flashBingo, 100);
}

function itIsABingo() {
	for (let i = 0; i < 5; i++) {
		for (let j = 0; j < 5; j++) {
			let cell = document.getElementById(i + '' + j);
			cell.onclick = null;
		}
	}
	setTimeout(flashBingo, 100);
}

function processStrike(method) {
	let trueCount = 0;
	switch (method) {
		case 0:
			for (let i = 0; i < 5; i++) {
				trueCount = 0;
				if (!rowStrikes[i]) {
					for (let j = 0; j < 5; j++) {
						if (bingoBoardChecked[i][j])
							trueCount++;
					}
					if (trueCount === 5) {
						rowStrikes[i] = true;
						strikes++;
						console.log('rowStrike : ' + (i + 1));
					}
				}
			}
			break;
		case 1:
			for (let i = 0; i < 5; i++) {
				trueCount = 0;
				if (!colStrikes[i]) {
					for (let j = 0; j < 5; j++) {
						if (bingoBoardChecked[j][i])
							trueCount++;
					}
					if (trueCount === 5) {
						colStrikes[i] = true;
						strikes++;
						console.log('colStrike : ' + (i + 1));
					}
				}
			}
			break;
		case 2:
			// left-top-corner to right-bottom-corner
			trueCount = 0;
			for (let i = 0; i < 5; i++) {
				if (!diagonalStrikes[0]) {
					if (bingoBoardChecked[i][i])
						trueCount++;
				}
			}
			if (trueCount === 5) {
				diagonalStrikes[0] = true;
				strikes++;
				console.log('diagonalStrike : 1');
			}

			// right-top-corner to left-bottom-corner
			trueCount = 0;
			let reverseRowIndex = 4;
			for (let i = 0; i < 5; i++) {
				if (!diagonalStrikes[1]) {
					if (bingoBoardChecked[i][reverseRowIndex])
						trueCount++;
				}
				reverseRowIndex--;
			}
			if (trueCount === 5) {
				diagonalStrikes[1] = true;
				strikes++;
				console.log('diagonalStrike : 2');
			}
			break;
	}
}

function endGame() {
	playerTurn.player1 = false;
	playerTurn.player2 = false;
	updatePlayerTurnUI();
	$('#result').show();
	$('#result').html('<b>YOU WON THE GAME!</b>')
	$('#result').attr('class', 'text-center alert alert-success');
	$('#result').css('font-size', '25px');
	sendBingoGame();
}

function processGame() {
	if (strikes === 5) {
		playerBINGO = true;
		itIsABingo();
		endGame();
		return;
	}
	let prevStrikes = strikes;
	// row check
	processStrike(0);
	// column check
	processStrike(1);
	// diagonal check
	processStrike(2);

	// new strikes
	if (strikes > prevStrikes) {
		let diff = strikes - prevStrikes;
		for (let i = 0; i < 5; i++) {
			if (!bingoStrikeChecked[i] && diff > 0) {
				bingoStrikeChecked[i] = true;
				bingoDivElements[i].setAttribute('class', 'btn-light text-success');
				bingoDivElements[i].innerHTML = bingoDivElements[i].innerHTML + ' <i class="fa fa-check" aria-hidden="true"></i>';
				diff--;
			}
		}
	}

	// after new strikes update check for bingo
	if (strikes === 5) {
		playerBINGO = true;
		itIsABingo();
		endGame();
	}
}

function scratchCell(cellElementId) {
	if (!gameReadyStatus) {
		return;
	}
	let boardIndex = cellElementId,
		boardCell = document.getElementById(boardIndex);
	// boardCell.setAttribute('class', 'scratch-cell');
	boardCell.setAttribute('class', 'btn-dark scratch-cell text-danger')
	boardCell.innerHTML = boardCell.innerHTML + ' <i class="fa fa-times" aria-hidden="true"></i>';
	console.log(boardIndex);
	bingoBoardChecked[parseInt(boardIndex[0])][parseInt(boardIndex[1])] = true;
	boardCell.onclick = null; // disable click on this cell
	processGame();
}

function createBingo() {
	let bLetters = ['B', 'I', 'N', 'G', 'O'],
		table = document.createElement('table');
	table.setAttribute('class', 'table table-bordered');
	table.setAttribute('id', 'board');
	let tr = document.createElement('tr');

	for (let i = 0; i < 5; i++) {
		let td = document.createElement('td');
		td.setAttribute('id', 'bingo' + (i + 1));
		td.appendChild(document.createTextNode(bLetters[i]));
		td.setAttribute('class', 'btn-light');
		tr.appendChild(td);
	}
	table.appendChild(tr);
	gameBingoElement.appendChild(table);
	gameBingoElement.innerHTML = gameBingoElement.innerHTML + '<br>';
}

function createBingoBoardUI() {
	let table = document.createElement('table');
	table.setAttribute('class', 'table table-bordered');
	table.setAttribute('id', 'board');
	for (let i = 0; i < 5; i++) {
		let tr = document.createElement('tr');
		for (let j = 0; j < 5; j++) {
			let td = document.createElement('td');
			td.appendChild(document.createTextNode(bingoBoard[i][j]));
			td.setAttribute('id', i + '' + j);
			td.setAttribute('class', 'btn-light');
			td.onclick = function () {
				if (!playerTurn.player1) {
					return;
				}
				scratchCell(this.id);
				if (!playerBINGO) {
					sendScratchCellMessageToOpponent(this.id);
				}
			};
			tr.appendChild(td);
		}
		table.appendChild(tr);
	}
	boardElement.appendChild(table);
}

let roomName,
	password,
	room;

function takeInputRoomName() {
	roomName = prompt('Enter Room Name');
	password = prompt('Enter Room Password');
	if (roomName === null || password === null) {
		$('#gameBoard').remove();
		alert('Room Name or Room Password not given. Please click on Restart button to reload game');
		return;
	}
	room = roomName + ':' + password;
	console.log('Room: ' + room);
	createNewSocket();
}

// Build and game logic
$(() => {
	// take room name input from client
	takeInputRoomName();

	// js objects for game logic
	initiateGameObjects();
	createBingoBoardMatrix();

	// create ui
	createBingo();
	getBingoDivElements();
	createBingoBoardUI();

	restartBtn.addEventListener('click', () => {
		location.reload();
	});
});


function updatePlayerTurnUI() {
	if (playerTurn.player1) {
		$('#player1').attr('class', 'btn btn-success');
		$('#player2').attr('class', 'btn btn-danger disabled');
		$('#playerTurnStatusText').show();
		$('#playerTurnStatusText').html('<b>Your turn now...</b>');
		return;
	}
	if (playerTurn.player2) {
		$('#player1').attr('class', 'btn btn-danger disabled');
		$('#player2').attr('class', 'btn btn-success');
		$('#playerTurnStatusText').show();
		$('#playerTurnStatusText').html('<b>Opponents\' turn now...</b>');
		return;
	}
	if (!playerTurn.player1 && !playerTurn.player2) {
		$('#player1').hide();
		$('#player2').hide();
		$('#playerTurnStatusText').hide();
	}
}

function sendScratchCellMessageToOpponent(cellId) {
	if (!gameReadyStatus) {
		return;
	}

	let data = {
		receiver: players.player2,
		msg: bingoBoard[parseInt(cellId[0])][parseInt(cellId[1])]
	};
	data = JSON.stringify(data);
	console.log('::Client:: Sending message: ', data);
	socket.emit('msg send event', data);

	playerTurn.player1 = false;
	playerTurn.player2 = true;
	updatePlayerTurnUI();
}

function sendBingoGame() {
	if (!gameReadyStatus) {
		return;
	}
	console.log('::Client:: Sending bingo event to: ', players.player2);
	socket.emit('bingo', players.player2);
}

function getElementIndex(element) {
	for (let i = 0; i < 5; ++i) {
		for (let j = 0; j < 5; ++j) {
			if (bingoBoard[i][j] === element) {
				return i + '' + j;
			}
		}
	}
	return '';
}


// build socket connection to play with opponent
let players = {
	player1: null,
	player2: null
};

function createNewSocket() {
	socket = io.connect();
	listenToSocketEvents();
}

function listenToSocketEvents() {
	socket.on('connect', () => {
		console.log('::Client::socket.io::connection Client connected to WebSocket server... ');
		socket.emit('room', room);
	});

	socket.on('join room', (senderId) => {
		console.log('::Client::socket.io::join room socketId: ', senderId);
		if (players.player1 === null) {
			console.log('Player1 joined room');
			players.player1 = senderId;
			console.log('players: ', players);
			return;
		}
		if (players.player1 !== null && players.player2 === null) {
			console.log('Player2 joined room');
			players.player2 = senderId;
			socket.emit('confirm', senderId);
			console.log('players: ', players);
			$('#roomName').html('<u><b>' + room.split(':')[0] + '</b></u>');
			isPlayerHost = true;

			playerTurn.player1 = true;
			playerTurn.player2 = false;
			updatePlayerTurnUI();
		}
	});

	socket.on('confirm player2', (player2Id) => {
		console.log('::Client::socket.io::confirm player2 id: ', player2Id);
		if (players.player2 === null) {
			players.player2 = player2Id;
			console.log('players: ', players);
			$('#roomName').html('<u><b>' + room.split(':')[0] + '</b></u>');
			isPlayerHost = false;

			playerTurn.player1 = false;
			playerTurn.player2 = true;
			updatePlayerTurnUI();
		}
	});

	socket.on('no opponent', (id) => {
		console.log('::Client::socket.io::no opponent id:', id);
		$('#gameBoard').remove();
		socket.close();
		alert('No opponent in the current game. Wait for a player to join...');
	});

	socket.on('cannot join', (msg) => {
		console.log('::Client::socket.io::cannot join msg: ', msg);
		socket.close();
		$('#gameBoard').remove();
		alert(msg + ' Please click on Restart button to load a new game');
	});

	socket.on('msg receive event', (msg) => {
		console.log('::Client::socket.io::msg receive event Message received: ', msg);
		if (msg.sender !== players.player1) {
			let element = getElementIndex(msg.msg);
			if (element === '') {
				alert('Error in finding the element sent by opponent');
				// may be send an event to tell the opponent to retry?
				return;
			}
			scratchCell(element);
			if (!playerBINGO) {
				playerTurn.player1 = true;
				playerTurn.player2 = false;
				updatePlayerTurnUI()
			}
		}
	});

	socket.on('opponent bingo', (sender) => {
		console.log('::Client::socket.io::opponent bingo sender: ', sender);
		if (sender === players.player2) {
			playerTurn.player1 = false;
			playerTurn.player2 = false;
			updatePlayerTurnUI();
			$('#result').show();
			$('#result').html('<b>YOU LOST THE GAME</b>')
			$('#result').attr('class', 'text-center alert alert-danger');
			$('#result').css('font-size', '25px');
			alert('Opponent Player won the game first! :(');
		}
	});

	socket.on('left game room', (opponentId) => {
		console.log('::Client::socket.io::left game room opponentId: ', opponentId);
		if (opponentId !== players.player2) {
			return;
		}
		$('#gameBoard').remove();
		$('#gameBingo').remove();
		$('#player1').hide();
		$('#player2').hide();
		$('#playerTurnStatusText').html('<b>Opponent left the game room</b>')
			.attr('class', 'text-center alert alert-warning').css('font-size', '20px');
	});
}


let gameReadyStatusInterval;

function updateGameReadyStatus() {
	if (players.player1 && players.player2) {
		gameReadyStatus = true;
		$('#gameReadyStatus').hide();
		clearInterval(gameReadyStatusInterval);
		return;
	}
	if (!gameReadyStatus) {
		$('#gameReadyStatus').show();
		$('#gameReadyStatus').html('<i>Waiting for a player to join your room...</i>');
		gameReadyStatusInterval = setTimeout(updateGameReadyStatus, 1000);
	}
}

$(() => {
	setTimeout(updateGameReadyStatus, 1000);
});
