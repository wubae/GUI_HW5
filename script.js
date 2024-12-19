let tileData = []; // To store JSON data
let tileBag = [];  // Tile bag to hold all tiles
let firstTilePlaced = false; // Track if the first tile has been placed

// Load pieces.json and initialize the tile bag
fetch('pieces.json')
  .then(response => response.json())
  .then(data => {
    tileData = data.pieces;
    tileBag = createTileBag(tileData);
    shuffle(tileBag);

    // Initialize the board
    initializeBoard();

    // Automatically generate tiles on page load
    generateTiles(7);

    // Make the board cells droppable
    $('.board-cell').droppable({
      accept: '.tile',
      drop: function (event, ui) {
        const droppedTile = ui.draggable;
        const cell = $(this);

        // Get the position of this cell
        const row = cell.data('row');
        const col = cell.data('col');

        // Rule 1: First tile must be placed in the center (8,8)
        if (!firstTilePlaced) {
          if (row === 8 && col === 8) {
            firstTilePlaced = true;
            placeTile(droppedTile, cell);
          } else {
            returnToRack(droppedTile); // Bounce back to rack
          }
        } else {
          // Rule 2: Subsequent tiles must be adjacent to an existing tile
          if (isAdjacentToTile(row, col)) {
            placeTile(droppedTile, cell);
          } else {
            returnToRack(droppedTile);
          }
        }
      },
    });

    // Make the rack droppable
    $('.player-rack').droppable({
      accept: '.tile',
      drop: function (event, ui) {
        const droppedTile = ui.draggable;
        returnToRack(droppedTile); // Allow tiles to be dropped back onto the rack
      },
    });
  })
  .catch(error => console.error('Error loading JSON:', error));

// Function to create the tile bag
function createTileBag(tileData) {
  const bag = [];
  tileData.forEach(tile => {
    for (let i = 0; i < tile.amount; i++) {
      bag.push({ letter: tile.letter });
    }
  });
  return bag;
}

// Shuffle the tile bag
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

// Function to generate tiles
function generateTiles(count) {
  const playerRack = $('.player-rack');
  playerRack.empty(); // Clear any existing tiles

  const drawnTiles = drawTiles(tileBag, count);
  drawnTiles.forEach(tile => {
    const tileDiv = createTileElement(tile.letter);
    playerRack.append(tileDiv);

    // Make tiles draggable
    $(tileDiv).draggable({
      revert: 'invalid',
    });
  });
  updateRemainingCount();
}

// Draw tiles from the bag
function drawTiles(bag, count) {
  const drawn = [];
  for (let i = 0; i < count && bag.length > 0; i++) {
    drawn.push(bag.pop());
  }
  return drawn;
}

// Function to create a tile element
function createTileElement(letter) {
  const tileDiv = $('<div>').addClass('tile');
  const fileName = letter === 'Blank' ? 'Scrabble_Tile_Blank.jpg' : `Scrabble_Tile_${letter}.jpg`;

  tileDiv.css({
    'background-image': `url("tiles/${fileName}")`,
    'background-size': 'contain',
    'background-repeat': 'no-repeat',
  });

  return tileDiv;
}

// Update remaining tile count
function updateRemainingCount() {
  $('#remaining-count').text(tileBag.length);
}

// Initialize the 15x15 board
function initializeBoard() {
  const board = $('.scrabble-board');
  board.empty(); // Clear any existing cells

  // Loop through a 15x15 grid
  for (let row = 1; row <= 15; row++) {
    for (let col = 1; col <= 15; col++) {
      const cell = $('<div>')
        .addClass('board-cell')
        .attr('data-row', row)
        .attr('data-col', col); // Add row and col as attributes

      // Add "Triple Word" tiles
      if ((row === 1 && col === 1) || (row === 1 && col === 8) || (row === 1 && col === 15)
        || (row === 8 && col === 1) || (row === 8 && col === 15) || (row === 15 && col === 1)
        || (row === 15 && col === 8) || (row === 15 && col === 15)) {
        cell.addClass('triple-word'); // Add a special class
        cell.text('Triple Word'); // Add text to the cell
      }

      // Add "Double Letter" tiles
      if ((row === 1 && col === 4) || (row === 1 && col === 12) 
        || (row === 3 && col === 7) || (row === 3 && col === 9) 
        || (row === 4 && col === 1) || (row === 4 && col === 8) || (row === 4 && col === 15) 
        || (row === 7 && col === 3) || (row === 7 && col === 7) || (row === 7 && col === 9) || (row === 7 && col === 13) 
        || (row === 8 && col === 4) || (row === 8 && col === 12)
        || (row === 9 && col === 3) || (row === 9 && col === 7) || (row === 9 && col === 9) || (row === 9 && col === 13)
        || (row === 12 && col === 1) || (row === 12 && col === 8) || (row === 12 && col === 15)
        || (row === 13 && col === 7) || (row === 13 && col === 9)
        || (row === 15 && col === 4) || (row === 15 && col === 12)) {
        cell.addClass('double-letter'); // Add a special class
        cell.text('Double Letter'); // Add text to the cell
      }

      // Add "Triple Letter" tiles
      if ((row === 2 && col === 6) || (row === 2 && col === 10)
        || (row === 6 && col === 2) || (row === 6 && col === 6) || (row === 6 && col === 10) || (row === 6 && col === 14)
        || (row === 10 && col === 2) || (row === 10 && col === 6) || (row === 10 && col === 10) || (row === 10 && col === 14)
        || (row === 14 && col === 6) || (row === 14 && col === 10)) {
        cell.addClass('triple-letter');
        cell.text('Triple Letter');
      }

      // Add "Double Word" tiles
      if ((row === 2 && col === 2) || (row === 2 && col === 14)
        || (row === 3 && col === 3) || (row === 3 && col === 13)
        || (row === 4 && col === 4) || (row === 4 && col === 12)
        || (row === 5 && col === 5) || (row === 5 && col === 11)
        || (row === 14 && col === 2) || (row === 14 && col === 14)
        || (row === 13 && col === 3) || (row === 13 && col === 13)
        || (row === 12 && col === 4) || (row === 12 && col === 12)
        || (row === 11 && col === 5) || (row === 11 && col === 11)) {
        cell.addClass('double-word');
        cell.text('Double Word');
      }

      // Add a black border for the center tile
      if (row === 8 && col === 8) {
        cell.addClass('center-tile');
        cell.text('START');
      }

      board.append(cell);
    }
  }
}

// Function to place a tile on the board
function placeTile(tile, cell) {
  $(tile)
    .detach()
    .css({
      top: 0,
      left: 0,
      position: 'absolute',
    })
    .appendTo(cell); // Attach the tile to the board cell
}

// Function to return a tile to the rack
function returnToRack(tile) {
  const rack = $('.player-rack');
  $(tile)
    .detach()
    .css({
      top: 0,
      left: 0,
      position: 'relative',
    })
    .appendTo(rack); // Return the tile to the rack
}

// Function to check if a cell is adjacent to an existing tile
function isAdjacentToTile(row, col) {
  const adjacentCells = [
    `[data-row="${row - 1}"][data-col="${col}"]`, // Above
    `[data-row="${row + 1}"][data-col="${col}"]`, // Below
    `[data-row="${row}"][data-col="${col - 1}"]`, // Left
    `[data-row="${row}"][data-col="${col + 1}"]`, // Right
  ];

  // Check if any adjacent cell contains a locked tile
  return adjacentCells.some(selector => {
    const adjacentCell = $(selector);
    return adjacentCell.children('.tile').length > 0; // Tile exists in this cell
  });
}

// Event listener for the Reset button
$('#reset-button').on('click', () => {
  resetGame();
});

// Function to reset the game
function resetGame() {
  // Clear the board
  $('.scrabble-board').empty();
  initializeBoard(); // Recreate the 15x15 grid

  // Update the drop handler to enforce the rule
$('.board-cell').droppable({
  accept: '.tile',
  drop: function (event, ui) {
    const droppedTile = ui.draggable;
    const cell = $(this);

    // Get the position of this cell
    const row = cell.data('row');
    const col = cell.data('col');

    // Rule 1: First tile must be placed in the center (8,8)
    if (!firstTilePlaced) {
      if (row === 8 && col === 8) {
        firstTilePlaced = true; // First tile is now placed
        placeTile(droppedTile, cell); // Place the tile
      } else {
        returnToRack(droppedTile); // Bounce back to rack
      }
    } else {
      // Rule 2: Subsequent tiles must be adjacent to an existing tile
      if (isAdjacentToTile(row, col)) {
        placeTile(droppedTile, cell); // Place the tile
      } else {
        returnToRack(droppedTile); // Bounce back to rack
      }
    }
  },
});

  // Clear the rack
  $('.player-rack').empty();

  // Refill the tile bag and reset remaining tiles
  tileBag = createTileBag(tileData);
  shuffle(tileBag);
  generateTiles(7); // Regenerate tiles in the rack
  updateRemainingCount();

  // Reset the score
  currentScore = 0; // Reset the score to 0
  updateScoreboard(currentScore); // Update the scoreboard display

  // Reset firstTilePlaced flag
  firstTilePlaced = false;
}

let currentScore = 0; // Track the current score

// Updated "Next" button functionality
// Event listener for the Next button
$('#next-button').on('click', () => {
  const placedTiles = getPlacedTiles(); // Tiles placed during this turn
  const newWords = groupTilesIntoWords(placedTiles); // Group new words

  if (newWords.length === 0) {
    alert("No words formed! Place tiles on the board.");
    return;
  }

  // Validate each new word
  const validationPromises = newWords.map(wordObj =>
    validateWord(wordObj.tiles.map(tile => tile.letter).join('')) // Word as a string
  );

  Promise.all(validationPromises)
    .then(validationResults => {
      const invalidWords = newWords.filter((_, index) => !validationResults[index]);

      if (invalidWords.length > 0) {
        // Invalid words detected
        alert(`Invalid words: ${invalidWords.map(wordObj => wordObj.tiles.map(t => t.letter).join('')).join(', ')}`);

        // Do NOT remove any tiles or return them to the rack.
        // Just stop here so the player can fix the issue on their next turn.
        return;
      }

      // If we reach here, all words are valid
      const turnScore = calculateTurnScore(placedTiles);
      currentScore += turnScore;
      updateScoreboard(currentScore);

      lockTilesOnBoard(placedTiles);
      refillRack();

      // Add validated words to the list of scored words
      newWords.forEach(wordObj => {
        const wordString = wordObj.tiles.map(tile => tile.letter).join('');
        validatedWords.add(wordString);
      });
    })
    .catch(error => {
      console.error("Error validating words:", error);
      alert("Failed to validate the words. Try again.");
    });
});

// Function to get placed tiles and organize them by row and column
function getPlacedTiles() {
  const placedTiles = [];

  $('.board-cell').each(function () {
    const tile = $(this).children('.tile');
    if (tile.length > 0) {
      const row = $(this).data('row');
      const col = $(this).data('col');
      const letter = tile.css('background-image').match(/Scrabble_Tile_(\w).jpg/)[1];
      placedTiles.push({ row, col, letter });
    }
  });

  return placedTiles;
}

// Function to reconstruct the word from placed tiles
function reconstructWord(placedTiles) {
  // Sort tiles by position (row, then column)
  placedTiles.sort((a, b) => (a.row - b.row) || (a.col - b.col));
  return placedTiles.map(tile => tile.letter).join('');
}

// Function to validate a word using the Dictionary API
function validateWord(word) {
  const apiUrl = `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`;
  console.log("Validating Word:", word); // Debugging
  return fetch(apiUrl)
    .then(response => {
      if (response.status === 200) {
        return true; // Word found in the dictionary
      } else if (response.status === 404) {
        return false; // Word not found in the dictionary
      } else {
        throw new Error(`Unexpected response: ${response.status}`);
      }
    })
    .catch(error => {
      console.error("Error during word validation:", error);
      return false;
    });
}

// Function to update the scoreboard
function updateScoreboard(score) {
  $('.scoreboard p').text(score); // Update the scoreboard display
}

// Updated "Clear Board Tiles" function (no longer used to clear locked tiles)
function clearBoardTiles(placedTiles) {
  placedTiles.forEach(tile => {
    const cell = $(`[data-row="${tile.row}"][data-col="${tile.col}"]`);
    const tileDiv = cell.children('.tile');

    // Remove the tile only if it's not locked
    if (!tileDiv.hasClass('locked')) {
      tileDiv.remove();
    }
  });
}

// Function to refill the rack
function refillRack() {
  const playerRack = $('.player-rack');
  const currentTileCount = playerRack.children('.tile').length;
  const tilesNeeded = 7 - currentTileCount;

  if (tilesNeeded > 0) {
    const newTiles = drawTiles(tileBag, tilesNeeded);
    newTiles.forEach(tile => {
      const tileDiv = createTileElement(tile.letter);
      playerRack.append(tileDiv);
      $(tileDiv).draggable({
        revert: 'invalid',
      });
    });
    updateRemainingCount();
  }
}


// Function to lock tiles on the board
function lockTilesOnBoard(placedTiles) {
  placedTiles.forEach(tile => {
    const cell = $(`[data-row="${tile.row}"][data-col="${tile.col}"]`);
    const tileDiv = cell.children('.tile');

    tileDiv.addClass('locked');
    tileDiv.draggable('disable'); // Disable further dragging of the tile
  });
}

// Function to group tiles into words horizontally or vertically
function groupTilesIntoWords(placedTiles) {
  const words = [];

  // Helper to check if a cell has a tile
  function hasTile(row, col) {
    return $(`[data-row="${row}"][data-col="${col}"]`).children('.tile').length > 0;
  }

  // Find horizontal words
  placedTiles.forEach(tile => {
    if (
      !hasTile(tile.row, tile.col - 1) && // No tile to the left (start of word)
      placedTiles.some(t => t.row === tile.row && t.col === tile.col + 1) // Tile to the right
    ) {
      const word = [];
      let col = tile.col;

      while (hasTile(tile.row, col)) {
        const letterTile = $(`[data-row="${tile.row}"][data-col="${col}"]`).children('.tile');
        const letter = letterTile.css('background-image').match(/Scrabble_Tile_(\w).jpg/)[1];
        word.push({ row: tile.row, col, letter });
        col++;
      }

      if (word.length > 1) {
        words.push({ tiles: word });
      }
    }
  });

  // Find vertical words
  placedTiles.forEach(tile => {
    if (
      !hasTile(tile.row - 1, tile.col) && // No tile above (start of word)
      placedTiles.some(t => t.row === tile.row + 1 && t.col === tile.col) // Tile below
    ) {
      const word = [];
      let row = tile.row;

      while (hasTile(row, tile.col)) {
        const letterTile = $(`[data-row="${row}"][data-col="${tile.col}"]`).children('.tile');
        const letter = letterTile.css('background-image').match(/Scrabble_Tile_(\w).jpg/)[1];
        word.push({ row, col: tile.col, letter });
        row++;
      }

      if (word.length > 1) {
        words.push({ tiles: word });
      }
    }
  });

  return words;
}

// Function to get locked tiles on the board
function getLockedTiles() {
  const lockedTiles = [];
  $('.board-cell').each(function () {
    const tile = $(this).children('.tile.locked');
    if (tile.length > 0) {
      const row = $(this).data('row');
      const col = $(this).data('col');
      const letter = tile.css('background-image').match(/Scrabble_Tile_(\w).jpg/)[1];
      lockedTiles.push({ row, col, letter });
    }
  });
  return lockedTiles;
}

let validatedWords = new Set();

function calculateTurnScore(placedTiles) {
  // Combine new tiles (placedTiles) with locked tiles to identify full words formed this turn
  const allTiles = placedTiles.concat(getLockedTiles());
  const newWords = groupTilesIntoWords(allTiles);

  let totalScore = 0;

  newWords.forEach(wordObj => {
    // Reconstruct the word string
    const wordString = wordObj.tiles.map(tile => tile.letter).join('');

    // Skip if this word was already validated and scored in a previous turn
    if (validatedWords.has(wordString)) return;

    // Check if the word includes at least one newly placed tile
    const includesNewTile = wordObj.tiles.some(
      wTile => placedTiles.some(pTile => pTile.row === wTile.row && pTile.col === wTile.col)
    );

    // If the word doesn't include a newly placed tile, skip it (no scoring)
    if (!includesNewTile) return;

    let wordScore = 0;
    let wordMultiplier = 1;

    // Calculate the score for this word
    wordObj.tiles.forEach(tile => {
      const tileInfo = tileData.find(t => t.letter === tile.letter);
      if (tileInfo) {
        let tileScore = tileInfo.value;

        const cell = $(`[data-row="${tile.row}"][data-col="${tile.col}"]`);
        const isNewTile = placedTiles.some(pt => pt.row === tile.row && pt.col === tile.col);

        // Apply letter multipliers only if the tile was placed
        if (cell.hasClass('double-letter')) {
          tileScore *= 2;
        } else if (cell.hasClass('triple-letter')) {
          tileScore *= 3;
        }

        wordScore += tileScore;

        // Apply word multipliers for the entire word
        if (cell.hasClass('double-word')) {
          wordMultiplier *= 2;
        } else if (cell.hasClass('triple-word')) {
          wordMultiplier *= 3;
        }
      }
    });

    wordScore *= wordMultiplier;
    totalScore += wordScore;

    // Mark this word as validated so we don't score it again later
    validatedWords.add(wordString);
  });

  return totalScore;
}