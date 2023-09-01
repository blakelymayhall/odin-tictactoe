// Game Board 
// Responsibility:
    // manage the internal board and check win conditions and 
    // error conditions
const GameBoard = (() => {
    let gameBoard = null;

    const clearGameBoard = () => {
        gameBoard = [
            [null,null,null],
            [null,null,null],
            [null,null,null]];
    };

    // Check that the game board cell is empty
    const isValidPlay = (x,y) => {
        return gameBoard[y][x] == null ? true : false;
    };

    const addPieceToBoard = (player, x, y) => {
        gameBoard[y][x] = player.getPlayerPiece();
    };

    // Loop over rows of 2d array and check for 
    // three of the same game piece
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

    // Check rows (normal gameboard), columns 
    // (transposed game board, and diagonals to see
    // if there is any winning run
    const checkWin = (player) => {
        const gameBoardT = gameBoard[0].map((x,i) => gameBoard.map(x => x[i]));
        const diags = [gameBoard.map((x, i) => x[i]),gameBoard.map((x,i) => x[x.length-i-1])];
        let allRuns = gameBoard.concat(gameBoardT).concat(diags);
        return checkThreeInRow(allRuns, player);
    };

    // Check if any nulls in gameboard
    // if true, then the game is tied (since check win is 
    // called first)
    const checkTie = () => {
        return !gameBoard.some(row => row.includes(null));
    };

    return {
        clearGameBoard,
        isValidPlay,
        addPieceToBoard,
        checkWin,
        checkTie
    }
})();

// Game Manager 
// Responsibility:
    // initializing the game and processing user turns
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
        // Clean Game Info, Toggle Button, gameboard
        // and change to a play again button
        DisplayManager.resetGame();

        // Clear internal game board
        GameBoard.clearGameBoard();

        // Initialize Players
        // Randomize who gets X and O
        //    Make array of the possible game pieces and randomly 
        //    assign to each player
        const pieces = [GAME_PIECES.X, GAME_PIECES.O];
        const rand = Math.floor(Math.random()*pieces.length);
        const playerConfigFormData = new FormData(document.forms.configPlayersOverlay);
        player1 = Player(playerConfigFormData.get("playerOneName"), pieces[rand]);
        player2 = Player(playerConfigFormData.get("playerTwoName"), pieces[rand == 0 ? 1 : 0], 
            playerConfigFormData.get("playCOM") == "on");

        // Set active player (player who got X)
        player1.getPlayerPiece() === GAME_PIECES.X ? activePlayer = player1 : activePlayer = player2;

        // Print to log the player names and who's turn it is
        DisplayManager.displayPlayers([player1,player2]);
        DisplayManager.addToLog(`${activePlayer.getPlayerName()}'s Turn`);

        // Set game state to playing so moves can be made
        gameState = GAME_STATES.PLAYING;

        // Process COM move if there is a COM and it is their turn
        if (activePlayer === player2 && player2.getIsCOM()) {
            processComMove();
        }
    };

    const processTurn = (gameBoardCell) => {

        // Verify we are playing the game
        // Verify the cell not already taken
        if (gameState != GAME_STATES.PLAYING || 
            !GameBoard.isValidPlay(gameBoardCell.dataset.x,gameBoardCell.dataset.y)) {
            return;
        }

        // Add pieces to internal board and DOM
        GameBoard.addPieceToBoard(activePlayer, gameBoardCell.dataset.x, gameBoardCell.dataset.y);
        DisplayManager.addPieceToBoard(gameBoardCell, activePlayer.getPlayerPiece().description);

        // Check win/tie condition
        // if neither, continue game
        if (GameBoard.checkWin(activePlayer) || GameBoard.checkTie()) {
            GameBoard.checkWin(activePlayer) ? 
                DisplayManager.addToLog(`${activePlayer.getPlayerName()} Wins!`) :
                DisplayManager.addToLog(`It's a Tie!`);
            gameState = GAME_STATES.OVER;
            DisplayManager.toggleButton();
            return;
        }

        // Toggle active player
        activePlayer === player1 ? activePlayer = player2 : activePlayer = player1; 
        DisplayManager.addToLog(`${activePlayer.getPlayerName()}'s Turn`);

        // Process COM move if there is a COM
        if (activePlayer === player2 && player2.getIsCOM()) {
            processComMove();
        }
    };

    const processComMove = () => {
        // Randomly determine a cell to play that is valid
        let x, y;
        while(true) {
            x = Math.floor(Math.random()*3);
            y = Math.floor(Math.random()*3);

            if (GameBoard.isValidPlay(x,y)) {
                break;
            }
        }
        processTurn(document.querySelector(`[data-x="${x}"][data-y="${y}"]`))
    };

    return {
        initializeGame,
        processTurn
    }
})();

// Display Manager
// Responsibility:
    // DOM manipulation to display the game progress
const DisplayManager = (() => {
    const logEntry = document.querySelector(".gameInfo .gameLog");
    const playerInfo = document.querySelector(".gameInfo .playerInfo");
    const playButton = document.querySelector(".gameWindow .playButton");
    const playerConfigWindow = document.querySelector("#configPlayersOverlay");

    const toggleButton = () => {
        playButton.disabled = !playButton.disabled;
    };

    const addPieceToBoard = (gameBoardCell, pieceString) => {
        const gameBoardPiece = document.createElement("p");
        gameBoardPiece.classList.add("gameBoardPiece");
        gameBoardPiece.classList.add(pieceString);
        gameBoardPiece.textContent = pieceString;
        gameBoardCell.appendChild(gameBoardPiece);
    };

    const displayPlayers = (players) => {
        players.forEach( (player) => {
            const playerText = document.createElement("p");
            playerText.textContent = `${player.getPlayerName()}: ${player.getPlayerPiece().description}'s`
            playerInfo.appendChild(playerText);
        });
    }

    const addToLog = (text) => {
        logEntry.textContent = text;
    };

    const togglePlayerConfig = () => {
        playerConfigWindow.style.display === "flex" ? 
            playerConfigWindow.style.display = "none" : 
            playerConfigWindow.style.display = "flex";
    };

    const resetGame = () => {
        // Toggle Button Off, Change to Play Again Button 
        toggleButton();
        playButton.textContent = "Play Again?";

        // Delete all game pieces and player infos
        const toDelete = document.querySelectorAll(".playerInfo p, .gameBoardPiece");
        toDelete.forEach((e) => {
            e.parentElement.removeChild(e);
        });

        // Clear turn string
        logEntry.textContent = "";
    };

    return {
        toggleButton,
        resetGame,
        addPieceToBoard,
        displayPlayers,
        addToLog,
        togglePlayerConfig
    }
})();


// Player Object
// Responsibility:
    // Factory function to provide the game with player objects. Player 
    // Objects have a name and an assigned piece (x or o)
const Player = (playerName, playerPiece, isCOM = false) => {
    const getPlayerName = () => playerName;
    const getPlayerPiece = () => playerPiece; 
    const getIsCOM = () => isCOM; 
 
    return {
        getPlayerName,
        getPlayerPiece,
        getIsCOM
    }
};

// Buttons that toggle the player config form
const formButtons = document.querySelectorAll(".playButton, .closeForm, .confirmForm");
formButtons.forEach((button) => {
    button.addEventListener("click", () => {
        DisplayManager.togglePlayerConfig();
    })
});

// Confirm the player config form - this starts the game
function validateForm() {
    const playerOneName = document.forms.configPlayersOverlay["playerOneName"].value;
    const playerTwoName = document.forms.configPlayersOverlay["playerTwoName"].value;
    const invalidForm = playerOneName.length < 2 || playerOneName.length > 12 || 
        playerTwoName.length < 2 || playerTwoName.length > 12; 
    if (invalidForm) {
      alert("Names must be between 2 and 12 characters");
      return false;
    }
    return true;
}
const submitFormButton = document.querySelector(".confirmForm");
submitFormButton.addEventListener("click", () => {
    if(validateForm()) {
        GameManager.initializeGame();
    }
});

// Grid Cell Actions
const gameBoardCells = document.querySelectorAll(".gameBoardCell");
gameBoardCells.forEach((gameBoardCell) => {
    gameBoardCell.addEventListener("click", () => {
        GameManager.processTurn(gameBoardCell);
    });
});