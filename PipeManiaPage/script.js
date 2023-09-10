// Function to start a new game when the "Start Game" button is clicked
document.getElementById('start-game-button').addEventListener('click', () => {
    const username = prompt('Enter your username:');
    if (username) {
        // Save the username and start the game
        startGame(username);
    }
});

// Function to exit the game when the "Exit Game" button is clicked
document.getElementById('exit-game-button').addEventListener('click', () => {
    exitGame();
});

// Initialize the game board when the page loads
window.addEventListener('load', () => {
    // Hide the game container initially
    document.getElementById('game-container').style.display = 'none';
});

// Function to check pipes when the "Check Pipes" button is clicked
document.getElementById('check-pipes-button').addEventListener('click', () => {
    checkModel();
});

// Function to exit the game when the "Exit Game" button is clicked
document.getElementById('exit-game-button').addEventListener('click', () => {
    exitGame();
});

// Function to start the game with a given username
function startGame(username) {
    // Set the username (you can store it in a variable or send it to the server)
    console.log('Username:', username);
    // Hide the menu and show the game container
    document.getElementById('menu').style.display = 'none';
    document.getElementById('game-container').style.display = 'block';
    initializeBoardWithSourceAndDrain();
}

// Function to exit the game and stop the timer
function exitGame() {
    // Show the menu and hide the game container
    document.getElementById('menu').style.display = 'flex'; // Change to 'flex' to center elements
    document.getElementById('game-container').style.display = 'none';
    resetGame();

    // Stop the timer interval
    clearInterval(intervalId);
}

// Function to reset the game board
function resetGame() {
    initializeBoardWithSourceAndDrain();
    document.getElementById('score-display').textContent = 'Score: 0';
}

// Define constants for pipe types
const PIPE_TYPES = {
    DEFAULT: 'X',
    CIRCULAR: 'o',
    HORIZONTAL: '=',
    VERTICAL: '||',
    SOURCE: 'F',
    DRAIN: 'D'
};

// Define the game board as a 2D array of characters
let gameBoard = [];

// Function to initialize the game board with source and drain
function initializeBoardWithSourceAndDrain() {
    const rows = 8;
    const columns = 8;
    gameBoard = Array.from({ length: rows }, () => Array(columns).fill(PIPE_TYPES.DEFAULT));

    // Generate random positions for source and drain, ensuring they are different
    let sourceRow, sourceColumn, drainRow, drainColumn;
    do {
        sourceRow = Math.floor(Math.random() * rows);
        sourceColumn = Math.floor(Math.random() * columns);
        drainRow = Math.floor(Math.random() * rows);
        drainColumn = Math.floor(Math.random() * columns);
    } while (sourceRow === drainRow && sourceColumn === drainColumn);

    // Set source and drain on the game board
    gameBoard[sourceRow][sourceColumn] = PIPE_TYPES.SOURCE;
    gameBoard[drainRow][drainColumn] = PIPE_TYPES.DRAIN;

    renderBoard();
}

// Function to render the game board on the HTML page
function renderBoard() {
    const gameBoardElement = document.getElementById('game-board');
    gameBoardElement.innerHTML = '';

    gameBoard.forEach((row, rowIndex) => {
        const rowElement = document.createElement('div');
        rowElement.className = 'row';

        row.forEach((pipeType, columnIndex) => {
            const pipeElement = document.createElement('div');
            pipeElement.className = 'pipe';
            pipeElement.textContent = pipeType;

            // Add click event listener to switch pipe types, but not for source and drain
            if (pipeType !== PIPE_TYPES.SOURCE && pipeType !== PIPE_TYPES.DRAIN) {
                pipeElement.addEventListener('click', () => {
                    switch (pipeType) {
                        case PIPE_TYPES.DEFAULT:
                            gameBoard[rowIndex][columnIndex] = PIPE_TYPES.CIRCULAR;
                            break;
                        case PIPE_TYPES.CIRCULAR:
                            gameBoard[rowIndex][columnIndex] = PIPE_TYPES.HORIZONTAL;
                            break;
                        case PIPE_TYPES.HORIZONTAL:
                            gameBoard[rowIndex][columnIndex] = PIPE_TYPES.VERTICAL;
                            break;
                        case PIPE_TYPES.VERTICAL:
                            // Prevent changing to source or drain
                            gameBoard[rowIndex][columnIndex] = PIPE_TYPES.DEFAULT; // Revert to 'X'
                            break;
                    }
                    renderBoard();
                });
            }

            rowElement.appendChild(pipeElement);
        });

        gameBoardElement.appendChild(rowElement);
    });
}


// Function to find the position of a pipe type on the board
function findPipePosition(pipeType) {
    for (let row = 0; row < gameBoard.length; row++) {
        for (let col = 0; col < gameBoard[row].length; col++) {
            if (gameBoard[row][col] === pipeType) {
                return { row, col };
            }
        }
    }
    return null; // Pipe not found
}

// Function to check pipes on the board
function checkModel() {
    const sourcePosition = findPipePosition(PIPE_TYPES.SOURCE);
    if (ModelRecursive(sourcePosition, null) >= 1) {
        alert('Your model is correct');
    } else {
        alert('Your model is incorrect');
    }
}

function ModelRecursive(current, previous) {
    let tries = 0;

    if (!current) {
        return 0; // Handle the case when the current pipe is null
    }

    // Check if the current pipe is the drain
    if (gameBoard[current.row][current.col] === PIPE_TYPES.DRAIN) {
        tries += 1;
    }

    // Explore neighboring pipes based on their type
    switch (gameBoard[current.row][current.col]) {
        case PIPE_TYPES.DEFAULT:
            tries += 0; // No valid path from a default pipe
            break;
        case PIPE_TYPES.CIRCULAR:
            // Circular pipe can connect to horizontal or vertical pipes
            if (
                (previous !== 'up' && current.row < gameBoard.length - 1 && gameBoard[current.row + 1][current.col] === PIPE_TYPES.VERTICAL) ||
                (previous !== 'down' && current.row > 0 && gameBoard[current.row - 1][current.col] === PIPE_TYPES.VERTICAL) ||
                (previous !== 'left' && current.col < gameBoard[current.row].length - 1 && gameBoard[current.row][current.col + 1] === PIPE_TYPES.HORIZONTAL) ||
                (previous !== 'right' && current.col > 0 && gameBoard[current.row][current.col - 1] === PIPE_TYPES.HORIZONTAL)
            ) {
                tries += ModelRecursive({ row: current.row + 1, col: current.col }, 'up');
                tries += ModelRecursive({ row: current.row - 1, col: current.col }, 'down');
                tries += ModelRecursive({ row: current.row, col: current.col + 1 }, 'left');
                tries += ModelRecursive({ row: current.row, col: current.col - 1 }, 'right');
            }
            break;
        case PIPE_TYPES.HORIZONTAL:
            // Horizontal pipe can connect to other horizontal pipes or the drain
            if (
                (previous !== 'left' && current.col < gameBoard[current.row].length - 1 && gameBoard[current.row][current.col + 1] === PIPE_TYPES.HORIZONTAL) ||
                (previous !== 'right' && current.col > 0 && gameBoard[current.row][current.col - 1] === PIPE_TYPES.HORIZONTAL)
            ) {
                tries += ModelRecursive({ row: current.row, col: current.col + 1 }, 'left');
                tries += ModelRecursive({ row: current.row, col: current.col - 1 }, 'right');
            } else if (
                (previous !== 'up' && current.row < gameBoard.length - 1 && gameBoard[current.row + 1][current.col] === PIPE_TYPES.VERTICAL) ||
                (previous !== 'down' && current.row > 0 && gameBoard[current.row - 1][current.col] === PIPE_TYPES.VERTICAL)
            ) {
                tries += ModelRecursive({ row: current.row + 1, col: current.col }, 'up');
                tries += ModelRecursive({ row: current.row - 1, col: current.col }, 'down');
            } else if (gameBoard[current.row][current.col] === PIPE_TYPES.DRAIN) {
                tries += 1; // A horizontal pipe connected to the drain
            }
            break;
        case PIPE_TYPES.VERTICAL:
            // Vertical pipe can connect to other vertical pipes or the drain
            if (
                (previous !== 'up' && current.row < gameBoard.length - 1 && gameBoard[current.row + 1][current.col] === PIPE_TYPES.VERTICAL) ||
                (previous !== 'down' && current.row > 0 && gameBoard[current.row - 1][current.col] === PIPE_TYPES.VERTICAL)
            ) {
                tries += ModelRecursive({ row: current.row + 1, col: current.col }, 'up');
                tries += ModelRecursive({ row: current.row - 1, col: current.col }, 'down');
            } else if (
                (previous !== 'left' && current.col < gameBoard[current.row].length - 1 && gameBoard[current.row][current.col + 1] === PIPE_TYPES.HORIZONTAL) ||
                (previous !== 'right' && current.col > 0 && gameBoard[current.row][current.col - 1] === PIPE_TYPES.HORIZONTAL)
            ) {
                tries += ModelRecursive({ row: current.row, col: current.col + 1 }, 'left');
                tries += ModelRecursive({ row: current.row, col: current.col - 1 }, 'right');
            } else if (gameBoard[current.row][current.col] === PIPE_TYPES.DRAIN) {
                tries += 1; // A vertical pipe connected to the drain
            }
            break;
        case PIPE_TYPES.SOURCE:
            // A source pipe has no effect on the path
            break;
        default:
            tries += 0; // Other pipe types should not affect the path
            break;
    }

    return tries;
}




// Helper function to get the opposite direction
function getOppositeDirection(direction) {
    const oppositeDirections = {
        'up': 'down',
        'down': 'up',
        'left': 'right',
        'right': 'left',
    };
    return oppositeDirections[direction];
}



// Function to add a random source and drain to the game board
function randomSourceDrain() {
    const rows = gameBoard.length;
    const columns = gameBoard[0].length;

    let sourceRow, sourceColumn, drainRow, drainColumn;

    // Generate random positions for source and drain, ensuring they are different
    do {
        sourceRow = Math.floor(Math.random() * rows);
        sourceColumn = Math.floor(Math.random() * columns);
        drainRow = Math.floor(Math.random() * rows);
        drainColumn = Math.floor(Math.random() * columns);
    } while (sourceRow === drainRow && sourceColumn === drainColumn);

    // Set source and drain on the game board
    gameBoard[sourceRow][sourceColumn] = PIPE_TYPES.SOURCE;
    gameBoard[drainRow][drainColumn] = PIPE_TYPES.DRAIN;

    renderBoard();
}


let score = 0;
let startTime = null;
let intervalId = null;


// Function to update and display the score and time
function updateTimeAndScore() {
    // Calculate the elapsed time
    const currentTime = Date.now();
    const elapsedSeconds = Math.floor((currentTime - startTime) / 1000);

    // Count the number of pipes of each type
    const pipeCounts = {
        [PIPE_TYPES.CIRCULAR]: 0,
        [PIPE_TYPES.HORIZONTAL]: 0,
        [PIPE_TYPES.VERTICAL]: 0,
    };

    // Iterate through the game board and count pipes
    gameBoard.forEach(row => {
        row.forEach(pipeType => {
            if (pipeCounts.hasOwnProperty(pipeType)) {
                pipeCounts[pipeType]++;
            }
        });
    });

    // Calculate the used pipes based on the counts
    const usedPipes = pipeCounts[PIPE_TYPES.CIRCULAR] + pipeCounts[PIPE_TYPES.HORIZONTAL] + pipeCounts[PIPE_TYPES.VERTICAL];

    // Calculate the score
    score = (100 - usedPipes) * 10 - elapsedSeconds;

    // Update and display the score and time
    updateScore();
    updateTime(elapsedSeconds);
}

// Function to update and display the time
function updateTime(elapsedSeconds) {
    document.getElementById('time-display').textContent = `Time: ${elapsedSeconds} seconds`;
}




