var ws = new WebSocket("ws://localhost:5002");

var gameBingoElement = document.getElementById("gameBingo"),
    boardElement = document.getElementById("gameBoard"),
    bingoTitle = document.getElementById("bingo-title");

var bingoDivElements = [],
    bingoNumbers = [],
    bingoPositions = [],
    bingoBoard = [],
    bingoBoardChecked = [];

var strikes = 0,
    colorFlag = false;

var strikeColors = ["#FF1744", "#D500F9", "#651FFF", "#00E5FF", "#1DE9B6"],
    bingoStrikeChecked = [false, false, false, false, false],
    rowStrikes = [false, false, false, false, false],
    colStrikes = [false, false, false, false, false],
    diagonalStrikes = [false, false];

function getBingoDivElements() {
	for (var i = 0; i < 5; i++) {
		bingoDivElements[i] = document.getElementById("bingo" + (i+1));
	}
}

function storeBingoNumbers() {
	for (var i = 0; i < 25; i++) {
		bingoNumbers[i] = i + 1;
	}
}

function storeBingoPositions() {
	for (var i = 0; i < 25; i++) {
		bingoPositions[i] = i + 1;
	}
}

function shuffleList(arr) {
	var i = arr.length, j = 0, tmp;
	while (i--) {
		j = Math.floor(Math.random() * (i+1));
		tmp = arr[i];
		arr[i] = arr[j];
		arr[j] = tmp;
	}
	return arr;
}

function initiateBoard() {
	for (var i = 0; i < 5; i++) {
		bingoBoard[i] = [];
		bingoBoardChecked[i] = [];
	}
	for (var i = 0; i < 5; i++) {
		for (var j = 0; j < 5; j++) {
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
	for (var i = 0; i < bingoNumbers.length; i++) {
		var count = 0, flag = false;
		for (var j = 0; j < 5; j++) {
			for (var k = 0; k < 5; k++) {
				count++;
				if (count == bingoPositions[i]) {
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
		bingoTitle.style.color = "red";
	} else {
		colorFlag = true;
		bingoTitle.style.color = "blue";
	}
	setTimeout(flashBingo, 100);
}

function itIsABingo() {
	bingoTitle.innerHTML = "Bingo!";
	setTimeout(flashBingo, 100);
	for (var i = 0; i < 5; i++) {
		for (var j = 0; j < 5; j++) {
			cell = document.getElementById(i + "" + j);
			cell.onclick = null;
		}
	}
}

function processStrike(method) {
    var trueCount = 0,
        reverseRowIndex;
    switch(method) {
		case 0:
				for (var i = 0; i < 5; i++) {
					trueCount = 0;
					if (!rowStrikes[i]) {
						for (var j = 0; j < 5; j++) {
							if (bingoBoardChecked[i][j])
								trueCount++;
						}
						if (trueCount === 5) {
							rowStrikes[i] = true;
							strikes++;
							console.log("rowStrike : " + i);
						}
					}
				}
				break;
		case 1:
				for (var i = 0; i < 5; i++) {
					trueCount = 0;
					if (!colStrikes[i]) {
						for (var j = 0; j < 5; j++) {
							if (bingoBoardChecked[j][i])
								trueCount++;
						}
						if (trueCount === 5) {
							colStrikes[i] = true;
							strikes++;
							console.log("colStrike : " + i);
						}
					}
				}
				break;
		case 2:
				// left-top-corner to right-bottom-corner
				trueCount = 0;
				for (var i = 0; i < 5; i++) {
					if (!diagonalStrikes[0]) {
						if (bingoBoardChecked[i][i])
							trueCount++;
					}
				}
				if (trueCount === 5) {
					diagonalStrikes[0] = true;
					strikes++;
					console.log("diagonalStrike : 0");
				}

				// right-top-corner to left-bottom-corner
				trueCount = 0;
				reverseRowIndex = 4;
				for (var i = 0; i < 5; i++) {
					if (!diagonalStrikes[1]) {
						if (bingoBoardChecked[i][reverseRowIndex])
							trueCount++;
					}
					reverseRowIndex--;
				}
				if (trueCount === 5) {
					diagonalStrikes[1] = true;
					strikes++;
					console.log("diagonalStrike : 1");
				}
				break;
	}
}

function processGame() {
	if (strikes === 5) {
		itIsABingo();
	}
	else {
		var prevStrikes = strikes;
		// row check
		processStrike(0);
		// column check
		processStrike(1);
		// diagonal check
		processStrike(2);

		if (strikes > prevStrikes) {
			var diff = strikes - prevStrikes;
			for (var i = 0; i < 5; i++) {
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
	var boardIndex = cellElement.id,
        boardCell = document.getElementById(boardIndex);
	boardCell.setAttribute("class", "scratch-cell");
	console.log(boardIndex);
	bingoBoardChecked[parseInt(boardIndex[0])][parseInt(boardIndex[1])] = true;
	boardCell.onclick = null; // disable click on this cell
	processGame();
}

function createBingo() {
	var bLetters = ["B", "I", "N", "G", "O"],
        table = document.createElement("table");
	table.setAttribute("border", "1");
	table.setAttribute("id", "board");
	var tr = document.createElement("tr");

	for (var i = 0; i < 5; i++) {
		var td = document.createElement("td");
		td.setAttribute("id", "bingo" + (i+1));
		td.appendChild(document.createTextNode(bLetters[i]));
		td.setAttribute("class", "bingo-cell");
		tr.appendChild(td);
	}
	table.appendChild(tr);
	gameBingoElement.appendChild(table);
	gameBingoElement.innerHTML = gameBingoElement.innerHTML + "<br>";
}

function createBingoBoardUI() {
	var table = document.createElement("table");
	table.setAttribute("border", "1");
	table.setAttribute("id", "board");
	for (var i = 0; i < 5; i++) {
		var tr = document.createElement("tr");
		for (var j = 0; j < 5; j++) {
			var td = document.createElement("td");
			td.appendChild(document.createTextNode(bingoBoard[i][j]));
			td.setAttribute("id", i + "" + j);
			td.onclick = function () {
				scratchCell(this);
			}
			tr.appendChild(td);
		}
		table.appendChild(tr);
	}
	boardElement.appendChild(table);
}

function restartGame() {
	location.reload();
}

// js objects
initiateGameObjects();
createBingoBoardMatrix();

// create ui
createBingo();
getBingoDivElements();
createBingoBoardUI();

// var name;
//
// function takeInputName() {
//     name = prompt("Enter your name");
//     console.log("Client: " + name);
// }
//
// takeInputName();

function webSocketInit() {
	if (! "WebSocket" in window) {
		console.log("WebSocket not supported");
		return;
	}

	ws.onopen = function () {
	    console.log("::Client:: Connection is open...");
	};

	ws.onmessage = function (e) {
		console.log("::Client:: Message received... :" + e.data);
	};

    ws.onerror = function () {
        console.log("::Server:: WebSocket error...");
        ws.close();
    };

	ws.onclose = function () {
		console.log("::Client:: Connection is closed...");
	};

	window.onbeforeunload = function () {
		ws.close();
	};
}

webSocketInit();
