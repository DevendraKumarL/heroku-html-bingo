let gameBingoElement = document.getElementById('gameBingo'),
    boardElement = document.getElementById('gameBoard'),
    bingoTitle = document.getElementById('bingo-title');

let bingoDivElements = [],
    bingoNumbers = [],
    bingoPositions = [],
    bingoBoard = [],
    bingoBoardChecked = [];

let strikes = 0,
    colorFlag = false;

let strikeColors = ['#FF1744', '#D500F9', '#651FFF', '#00E5FF', '#1DE9B6'],
    bingoStrikeChecked = [false, false, false, false, false],
    rowStrikes = [false, false, false, false, false],
    colStrikes = [false, false, false, false, false],
    diagonalStrikes = [false, false];

function getBingoDivElements() {
	for (let i = 0; i < 5; i++) {
		bingoDivElements[i] = document.getElementById('bingo' + (i+1));
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
	let i = arr.length, j = 0, tmp;
	while (i--) {
		j = Math.floor(Math.random() * (i+1));
		tmp = arr[i];
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
	// console.log(bingoNumbers);

	storeBingoPositions();
	// console.log(bingoPositions);

	bingoNumbers = shuffleList(bingoNumbers);
	bingoPositions = shuffleList(bingoPositions);
	// console.log(bingoNumbers);
	// console.log(bingoPositions);

	initiateBoard();
	// console.log(bingoBoard);
	// console.log(bingoBoardChecked);
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
	// console.log(bingoBoard);
}

function flashBingo() {
	if (colorFlag) {
		colorFlag = false;
		bingoTitle.style.color = 'red';
	} else {
		colorFlag = true;
		bingoTitle.style.color = 'blue';
	}
	setTimeout(flashBingo, 100);
}

function itIsABingo() {
	bingoTitle.innerHTML = 'Bingo!';
	setTimeout(flashBingo, 100);
	for (let i = 0; i < 5; i++) {
		for (let j = 0; j < 5; j++) {
			let cell = document.getElementById(i + '' + j);
			cell.onclick = null;
		}
	}
}

function processStrike(method) {
    let trueCount = 0,
        reverseRowIndex;
    switch(method) {
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
							console.log('rowStrike : ' + i);
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
							console.log('colStrike : ' + i);
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
					console.log('diagonalStrike : 0');
				}

				// right-top-corner to left-bottom-corner
				trueCount = 0;
				reverseRowIndex = 4;
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
					console.log('diagonalStrike : 1');
				}
				break;
	}
}

function processGame() {
	if (strikes === 5) {
		itIsABingo();
	}
	else {
		let prevStrikes = strikes;
		// row check
		processStrike(0);
		// column check
		processStrike(1);
		// diagonal check
		processStrike(2);

		if (strikes > prevStrikes) {
			let diff = strikes - prevStrikes;
			for (let i = 0; i < 5; i++) {
				if (!bingoStrikeChecked[i] && diff > 0) {
					bingoStrikeChecked[i] = true;
					bingoDivElements[i].style.backgroundColor = strikeColors[i];
					diff--;
				}
			}
		}

		if (strikes === 5) {
			itIsABingo();
		}
	}
}

function scratchCell(cellElement) {
	let boardIndex = cellElement.id,
        boardCell = document.getElementById(boardIndex);
	boardCell.setAttribute('class', 'scratch-cell');
	console.log(boardIndex);
	bingoBoardChecked[parseInt(boardIndex[0])][parseInt(boardIndex[1])] = true;
	boardCell.onclick = null; // disable click on this cell
	processGame();
}

function createBingo() {
	let bLetters = ['B', 'I', 'N', 'G', 'O'],
        table = document.createElement('table');
	table.setAttribute('border', '1');
	table.setAttribute('id', 'board');
	let tr = document.createElement('tr');

	for (let i = 0; i < 5; i++) {
		let td = document.createElement('td');
		td.setAttribute('id', 'bingo' + (i+1));
		td.appendChild(document.createTextNode(bLetters[i]));
		td.setAttribute('class', 'bingo-cell');
		tr.appendChild(td);
	}
	table.appendChild(tr);
	gameBingoElement.appendChild(table);
	gameBingoElement.innerHTML = gameBingoElement.innerHTML + '<br>';
}

function createBingoBoardUI() {
	let table = document.createElement('table');
	table.setAttribute('border', '1');
	table.setAttribute('id', 'board');
	for (let i = 0; i < 5; i++) {
		let tr = document.createElement('tr');
		for (let j = 0; j < 5; j++) {
			let td = document.createElement('td');
			td.appendChild(document.createTextNode(bingoBoard[i][j]));
			td.setAttribute('id', i +' ' + j);
			td.onclick = function () {
				scratchCell(this);
			};
			tr.appendChild(td);
		}
		table.appendChild(tr);
	}
	boardElement.appendChild(table);
}

function restartGame() {
	location.reload();
}

// js objects for game logic
initiateGameObjects();
createBingoBoardMatrix();

// create ui
createBingo();
getBingoDivElements();
createBingoBoardUI();

let roomName,
    password,
    room;

function takeInputName() {
    roomName = prompt('Enter Room Name');
    password = prompt('Enter Room Password');
    if (roomName === null || password === null) {
    	$('#gameBoard').remove();
    	alert('Room Name or Room Password not given. Please click on Restart button to reload game');
    	return;
	}
    room = roomName + ':' + password;
    console.log('Room: ' + room);
}

takeInputName();

let players = {
    player1: '',
    player2: ''
};

$(function () {
    let socket = io.connect();

    socket.on('connect', () => {
        console.log('::Client::socket.io::connection Client connected to WebSocket server... ');
        socket.emit('room', room);
    });

    socket.on('join room', (senderId) => {
        console.log('::Client::socket.io::join room socketId: ', senderId);
        if (players.player1 === '') {
            console.log('Player1 joined room');
            players.player1 = senderId;
            console.log('players: ', players);
            return;
        }
        if (players.player1 !== '') {
            console.log('Player2 joined room');
            players.player2 = senderId;
            socket.emit('confirm', senderId);
            console.log('players: ', players);
        }
    });

    socket.on('confirm player2', (player2Id) => {
        console.log('::Client::socket.io::confirm player2 id: ', player2Id);
        if (players.player2 === '') {
            players.player2 = player2Id;
            console.log('players: ', players);
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

    // socket.on('msg receive event', (msg) => {
    //     console.log('::Client::socket.io::msg receive event Message received: ', msg);
    //     if (msg.sender !== players.player1) {
    //         $('#history').append($('<li>').text('msg: ' + msg));
    //     }
    // });

    // $('#sendBtn').click(() => {
    //     let data = {
    //         receiver: players.player2,
    //         msg: $('#messageInput').val()
    //     };
    //     data = JSON.stringify(data);
    //     console.log('::Client:: Sending message: ', data, ' to: ', players.player2);
    //     socket.emit('msg send event', data);
    //     $('#messageInput').val('');
    // });
});
