// Game Board 
// Responsibility:

const GameBoard = (() => {
    let gameBoard = null;

    const clearGameBoard = () => {
        gameBoard = [
            [null,null,null],
            [null,null,null],
            [null,null,null]];
    };

    const isValidPlay = (x,y) => {
        return gameBoard[y][x] == null ? true : false;
    };

    const addPieceToBoard = (player, x, y) => {
        gameBoard[y][x] = player.getPlayerPiece();
    };

    const checkThreeInRow = (arr, player) => {
        for (let ii = 0; ii < arr.length; ii++) {
            const threeInRow = arr[ii].every((e) => {
                return e == player.getPlayerPiece();
            });

            if (threeInRow) {
                return true;
            }
        }
    };

    const checkWin = (player) => {
        if(checkThreeInRow(gameBoard, player)) {
            return true;
        }

        const gameBoardT = gameBoard[0].map((x,i) => gameBoard.map(x => x[i]));
        if(checkThreeInRow(gameBoardT, player)) {
            return true;
        }

        const diags = [gameBoard.map((x, i) => x[i]),gameBoard.map((x,i) => x[x.length-i-1])];
        if(checkThreeInRow(diags, player)) {
            return true;
        }

        return false;
    };

    return {
        clearGameBoard,
        isValidPlay,
        addPieceToBoard,
        checkWin
    }
})();

// Game Manager 
// Responsibility:

const GameManager = (() => {

    const GAME_STATES = {
        PRE_INIT: Symbol("Pre_Init"),
        PLAYING: Symbol("Playing"),
        OVER: Symbol("Over")
    }

    const GAME_PIECES = {
        X: Symbol("X"),
        O: Symbol("O")
    };

    let player1, player2 = null;
    let activePlayer = null;
    let gameState = GAME_STATES.PRE_INIT;

    const initializeGame = () => {
        // Disable button
        DisplayManager.disableButton();

        // Clear game board
        GameBoard.clearGameBoard();

        // Initialize players 
        player1 = Player();
        player1.setPlayerName("Player One");
        player2 = Player();
        player2.setPlayerName("Player Two");

        // Randomize who gets X and O
        //    Make array of the possible game pieces and randomly 
        //    assign to each player
        const pieces = [GAME_PIECES.X, GAME_PIECES.O];
        const rand = Math.floor(Math.random()*pieces.length);
        player1.setPlayerPiece(pieces[rand]);
        player2.setPlayerPiece(pieces[rand == 0 ? 1 : 0]);

        // Set active player (player who got X)
        player1.getPlayerPiece() === GAME_PIECES.X ? activePlayer = player1 : activePlayer = player2;
        
        DisplayManager.addToLog(`${activePlayer.getPlayerName()} is X's`);
        DisplayManager.addToLog(`${activePlayer.getPlayerName()}'s (${activePlayer.getPlayerPiece().description}'s) Turn`);

        gameState = GAME_STATES.PLAYING;
    };

    const processTurn = (gameBoardCell) => {

        // Verify we are playing the game
        if (gameState != GAME_STATES.PLAYING) {
            return;
        }

        // Verify the cell not already taken
        if (!GameBoard.isValidPlay(gameBoardCell.dataset.x,gameBoardCell.dataset.y)) {
            return;
        }

        // Add pieces to internal board and DOM
        GameBoard.addPieceToBoard(activePlayer, gameBoardCell.dataset.x, gameBoardCell.dataset.y);
        DisplayManager.addPieceToBoard(gameBoardCell, activePlayer.getPlayerPiece().description);

        // Check win condition
        if (GameBoard.checkWin(activePlayer)) {
            DisplayManager.addToLog(`${activePlayer.getPlayerName()} Wins!`);
            gameState = GAME_STATES.OVER;
        }
        else {
            // Toggle active player
            activePlayer === player1 ? activePlayer = player2 : activePlayer = player1; 
            DisplayManager.addToLog(`${activePlayer.getPlayerName()}'s (${activePlayer.getPlayerPiece().description}'s) Turn`);
        }
    };

    return {
        GAME_PIECES,
        initializeGame,
        processTurn
    }
})();

// Display Manager
// Responsibility:

const DisplayManager = (() => {

    const disableButton = () => {
        document.querySelector("button").disabled = true;
    };

    const addPieceToBoard = (gameBoardCell, pieceString) => {
        const gameBoardPiece = document.createElement("p");
        gameBoardPiece.classList.add("gameBoardPiece");
        gameBoardPiece.classList.add(pieceString);
        gameBoardPiece.textContent = pieceString;
        gameBoardCell.appendChild(gameBoardPiece);
    };

    const addToLog = (text) => {
        const logEntries = document.querySelectorAll(".gameInfo p");
        if(logEntries.length == 3) {
            //delete the first one 
            logEntries[0].parentElement.removeChild(logEntries[0]);
        }

        const newLogEntry = document.createElement("p");
        newLogEntry.textContent = text;
        document.querySelector(".gameInfo").appendChild(newLogEntry);
    };

    const clearLog = () => {
        const logEntries = document.querySelectorAll(".gameInfo p");
        logEntries.forEach( (logEntry) => {
            logEntry.parentElement.removeChild(logEntry);
        });
    };

    return {
        disableButton,
        addToLog,
        clearLog,
        addPieceToBoard
    }

})();


// Player Object
// Responsibility:

const Player = () => {

    let playerName;
    let playerPiece;

    const setPlayerName = (name) => {
        playerName = name;
    };
    const setPlayerPiece = (piece) => {
        playerPiece = piece;
    };
    const getPlayerName = () => playerName;
    const getPlayerPiece = () => playerPiece; 

    return {
        setPlayerName,
        setPlayerPiece,
        getPlayerName,
        getPlayerPiece
    }
};

// Start Game Button
const playGameButton = document.querySelector(".gameWindow button");
playGameButton.addEventListener("click", () => {
    GameManager.initializeGame();
});

// Grid Cell Actions
const gameBoardCells = document.querySelectorAll(".gameBoardCell");
gameBoardCells.forEach((gameBoardCell) => {
    gameBoardCell.addEventListener("click", () => {
        GameManager.processTurn(gameBoardCell);
    });
});