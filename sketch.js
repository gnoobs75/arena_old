// Global Variables - Game State and UI Elements
let currentScreen = 'splash'; // Tracks current game screen (splash, characterSelect, placement, game)
let player1Characters = []; // Array of Player 1's selected champion names
let player2Characters = []; // Array of Player 2's selected champion names
let characters = [ // List of available champions
  'Brute', 'Ranger', 'Beast', 'Redeemer', 'Confessor', 'Barbarian',
  'Burglar', 'Berserker', 'Shaman', 'Illusionist', 'DarkWizard', 'Alchemist'
];
let championColors = { // Color mappings for champion visuals
  'Brute': 'olive', 'Ranger': 'brown', 'Beast': 'green', 'Redeemer': 'white',
  'Confessor': 'purple', 'Barbarian': 'orange', 'Burglar': 'black', 'Berserker': 'red',
  'Shaman': 'blue', 'Illusionist': 'maroon', 'DarkWizard': 'black', 'Alchemist': '#FFFF33'
};
let championStats = { // Base stats for each champion (range, power, movement)
  'Brute': { range: 1, power: 2, movement: 4 }, 'Ranger': { range: 7, power: 1, movement: 3 },
  'Beast': { range: 1, power: 2, movement: 3 }, 'Redeemer': { range: 5, power: 1, movement: 5 },
  'Confessor': { range: 4, power: 0, movement: 4 }, 'Barbarian': { range: 1, power: 2, movement: 4 },
  'Burglar': { range: 2, power: 2, movement: 4 }, 'Berserker': { range: 1, power: 3, movement: 3 },
  'Shaman': { range: 3, power: 2, movement: 4 }, 'Illusionist': { range: 6, power: 0, movement: 3 },
  'DarkWizard': { range: 4, power: 2, movement: 4 }, 'Alchemist': { range: 2, power: 1, movement: 5 }
};
let taunts = { // Taunt messages for combat interactions
  'Brute': {
    'Beast': ["Get back to the zoo, furball!", "I’ll snap you like a twig!", "Too slow, beastie!"],
    'Ranger': ["Arrows? I eat those for breakfast!", "Step closer if you dare, sharpshooter!", "Your range means nothing up close!"],
    'DarkWizard': ["Magic? I’ll crush it with my fists!", "Your spells can’t save you now!", "Darkness falls to brute strength!"]
  },
  'Ranger': {
    'Brute': ["Stay back, you lumbering oaf!", "I’ll pin you from a mile away!", "Too slow to catch me, big guy!"],
    'Beast': ["Nice claws—too bad you’re outranged!", "I hunt beasts like you for sport!", "Stay down, mutt!"],
    'Shaman': ["Your spirits can’t block my arrows!", "Range beats ritual, old man!", "Dance all you want—I’ll still hit you!"]
  },
  'Beast': {
    'Ranger': ["I’ll chew through your quiver!", "Run all you want—I’m faster!", "Arrows won’t stop my fangs!"],
    'Berserker': ["Rage meets claws—who wins?", "I’ll rip through your fury!", "You’re loud, but I bite harder!"],
    'Alchemist': ["Your potions won’t save you!", "I’ll shred your lab coat!", "Taste my claws, brewer!"]
  },
  'Berserker': {
    'Illusionist': ["Tricks won’t stop my rage!", "I’ll cleave through your illusions!", "Scream louder—I love it!"],
    'Confessor': ["Prayers won’t save you now!", "I’ll silence your sermons!", "Kneel before my fury!"],
    'Barbarian': ["Two savages, one victor—me!", "I’ll out-rage you, brother!", "Blood for blood, brute!"]
  },
  'default': ["Feel the sting!", "You’re done!", "Take that, fool!", "This’ll hurt!"]
};
let selectionPhase = 'p1_first'; // Tracks character selection phase (p1_first, p2_first, p1_second, p2_second)
let startButton; // Button to start the game
let enterArenaButton; // Button to enter game from character select
let returnSelectButton; // Button to reset character selection
let endTurnButton; // Button to end current player's turn
let undoButton; // Button to undo last action
let fadeAlpha = 0; // Alpha value for fade effects
let vsTilt = 0; // Animation tilt for "VS" text
let lastMouseX = -1; // Last recorded mouse X position
let lastMouseY = -1; // Last recorded mouse Y position
let mouseLocked = true; // Prevents immediate clicks after screen change

let player1Champions = []; // Array of Player 1's Champion objects
let player2Champions = []; // Array of Player 2's Champion objects
let player1Mana = 5; // Player 1's current mana
let player2Mana = 5; // Player 2's current mana
let player1Cards = []; // Player 1's hand of cards
let player2Cards = []; // Player 2's hand of cards
let player1Deck = []; // Player 1's draw pile
let player2Deck = []; // Player 2's draw pile
let player1Discard = []; // Player 1's discard pile
let player2Discard = []; // Player 2's discard pile

let allCards; // Loaded card data from cards.json
let cardImages = {}; // Loaded card image objects
let gameBoard = []; // 10x10 grid representing the game map
let placementPhase = 'p1_first'; // Tracks champion placement phase
let draggingChampion = null; // Champion being dragged during placement
let currentPlayer = 1; // Current player (1 or 2)
let originalPlayer = 1; // Tracks player whose turn was interrupted by a response
let selectedChampion = null; // Currently selected champion for actions
let validMoves = []; // Valid move positions for selected champion
let validRange = []; // Valid attack range for selected champion
let fireCursor; // Custom cursor image for targeting
let tauntBubble = null; // Displays taunt text during combat
let announcement = null; // Displays game announcements
let lastAction = null; // Tracks last action for undo functionality
let resourcesLoaded = false; // Indicates if preload is complete

let targetingSpell = null; // Tracks spell requiring targeting (e.g., Ground Pound)
let targetingDirections = []; // Directions for spell targeting
let selectedDirection = null; // Chosen direction for spell
let targetingPosition = null; // For spells targeting a grid position
let selectedTarget = null; // For spells targeting a champion

let responseState = null; // Tracks response opportunities { player, trigger, data }
let hoveredCard = null; // Card currently being hovered over for popup

// Grid dimensions (global scope)
let gridSize = 10; // Size of game grid (10x10)
let cellSize = 60; // Pixel size of each grid cell
let gridWidth = gridSize * cellSize; // Total grid width
let gridHeight = gridSize * cellSize; // Total grid height

// Preload Function - Loads card data and images before setup
function preload() {
  console.log("Starting preload...");
  fetch('cards.json')
    .then(response => {
      if (!response.ok) throw new Error(`cards.json fetch failed: ${response.status}`);
      return response.json();
    })
    .then(data => {
      allCards = data; // Store card data
      console.log("cards.json loaded successfully");
      let loadPromises = allCards.map(card => {
        if (!cardImages[card.name]) {
          return new Promise((resolve, reject) => {
            cardImages[card.name] = loadImage(`assets/art/${card.image}`,
              () => {
                console.log(`Loaded ${card.image}`);
                resolve();
              },
              () => {
                console.error(`Failed to load assets/art/${card.image}`);
                reject();
              }
            );
          });
        }
        return Promise.resolve();
      });
      return Promise.all(loadPromises);
    })
    .then(() => {
      fireCursor = loadImage('https://cdn-icons-png.flaticon.com/512/785/785863.png',
        () => console.log("Fire cursor loaded"),
        () => console.error("Failed to load fire cursor")
      );
      resourcesLoaded = true;
      console.log("Preload completed!");
    })
    .catch(error => {
      console.error('Preload error:', error);
      resourcesLoaded = true; // Proceed even if some assets fail
    });
}

// Setup Function - Initializes Canvas and UI Elements
function setup() {
  createCanvas(1200, 1000); // Set canvas size

  // Initialize UI buttons
  startButton = createButton('Start Game');
  startButton.position(width / 2 - 50, height / 2 + 50);
  startButton.style('background-color', '#C8C8C8');
  startButton.style('border-radius', '5px');
  startButton.style('padding', '10px 20px');
  startButton.style('font-size', '18px');
  startButton.mousePressed(startGame);

  enterArenaButton = createButton('Enter Arena');
  enterArenaButton.hide();
  enterArenaButton.mousePressed(enterArena);

  returnSelectButton = createButton('Select Champions');
  returnSelectButton.hide();
  returnSelectButton.mousePressed(resetCharacterSelect);

  endTurnButton = createButton('End Turn');
  endTurnButton.hide();
  endTurnButton.mousePressed(endTurn);

  undoButton = createButton('Undo');
  undoButton.hide();
  undoButton.mousePressed(undoLastAction);
}

// Draw Function - Main Game Loop
function draw() {
  lastMouseX = mouseX; // Update last mouse position
  lastMouseY = mouseY;

  if (!resourcesLoaded) { // Show loading screen if resources aren't ready
    background(0);
    fill(255);
    textSize(32);
    textAlign(CENTER, CENTER);
    text("Loading Resources...", width / 2, height / 2);
    return;
  }

  // Render current screen
  if (currentScreen === 'splash') {
    drawSplashScreen();
  } else if (currentScreen === 'characterSelect') {
    drawCharacterSelect();
  } else if (currentScreen === 'placement') {
    drawPlacementScreen();
  } else if (currentScreen === 'game') {
    drawGame();
  }

  drawTauntBubble(); // Render combat taunts
  drawAnnouncement(); // Render game announcements

  if (responseState) { // Show response prompt if active
    drawResponsePrompt();
  }

  // Update cursor based on game state
  if (currentScreen === 'game' && selectedChampion && !responseState) {
    let enemies = currentPlayer === 1 ? player2Champions : player1Champions;
    let inRange = enemies.some(enemy => 
      enemy.position && 
      validRange.some(([rx, ry]) => rx === enemy.position[0] && ry === enemy.position[1]) &&
      dist(mouseX, mouseY, startX + enemy.position[0] * cellSize + cellSize / 2, gridStartY + enemy.position[1] * cellSize + cellSize / 2) < 30
    );
    if (inRange && !selectedChampion.hasAttacked) {
      cursor(fireCursor, 16, 16); // Targeting cursor
    } else {
      cursor(ARROW);
    }
  } else {
    cursor(ARROW);
  }

  // Draw card popup if hovering
  if (hoveredCard) {
    drawCardPopup(hoveredCard);
  }
}

// Renders taunt bubble during combat
function drawTauntBubble() {
  if (!tauntBubble) return;

  let elapsed = millis() - tauntBubble.startTime;
  let alpha = 255;

  if (elapsed > tauntBubble.duration) {
    let fadeProgress = (elapsed - tauntBubble.duration) / tauntBubble.fadeTime;
    alpha = max(0, 255 * (1 - fadeProgress));
    if (alpha === 0) {
      tauntBubble = null;
      return;
    }
  }

  fill(255, 255, 255, alpha);
  stroke(0, alpha);
  strokeWeight(2);
  rect(tauntBubble.x - 100, tauntBubble.y - 40, 200, 30, 10);
  fill(0, alpha);
  noStroke();
  textSize(16);
  textAlign(CENTER, CENTER);
  text(tauntBubble.text, tauntBubble.x, tauntBubble.y - 25);
}

// Renders game announcements (e.g., turn start, response)
function drawAnnouncement() {
  if (!announcement) return;

  let elapsed = millis() - announcement.startTime;
  let alpha = 255;

  if (elapsed > announcement.duration) {
    let fadeProgress = (elapsed - announcement.duration) / announcement.fadeTime;
    alpha = max(0, 255 * (1 - fadeProgress));
    if (alpha === 0) {
      announcement = null;
      return;
    }
  }

  fill(255, 255, 255, alpha);
  stroke(0, alpha);
  strokeWeight(4);
  rect(width / 2 - 150, height / 2 - 40, 300, 80, 15);
  fill(0, alpha);
  noStroke();
  textSize(32);
  textAlign(CENTER, CENTER);
  text(announcement.text, width / 2, height / 2);
}

// Displays response prompt for the current player
function drawResponsePrompt() {
  fill(255, 255, 255, 200);
  stroke(0);
  strokeWeight(2);
  rect(width / 2 - 150, height / 2 - 100, 300, 80, 10);
  fill(0);
  noStroke();
  textSize(24);
  textAlign(CENTER, CENTER);
  text(`Player ${responseState.player} - Response?`, width / 2, height / 2 - 60);
}

// Renders the initial splash screen
function drawSplashScreen() {
  let gradient = drawingContext.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, 'rgba(255, 0, 0, 0.8)');
  gradient.addColorStop(1, 'rgba(0, 0, 255, 0.8)');
  drawingContext.fillStyle = gradient;
  drawingContext.shadowBlur = 10;
  drawingContext.shadowColor = 'black';
  noStroke();
  rect(0, 0, width, height);
  drawingContext.shadowBlur = 0;

  stroke(255);
  strokeWeight(6);
  noFill();
  rect(0, 0, width, height);

  textSize(48);
  textAlign(CENTER);
  fill(255);
  drawingContext.shadowBlur = 10;
  drawingContext.shadowColor = 'black';
  text('Welcome to Arena', width / 2, height / 2);
  drawingContext.shadowBlur = 0;
}

// Renders the character selection screen
function drawCharacterSelect() {
  background(220);
  
  let topHeight = height * 0.08;
  fill(192);
  rect(0, 0, width, topHeight + 15);
  fill(0);
  textSize(26);
  textAlign(CENTER);
  text("Choose Your Champions", width / 2, topHeight / 2 + 13);

  let middleHeight = height * 0.74;
  let bottomHeight = height * 0.18;
  let cardWidth = 180;
  let cardHeight = 220;
  let totalWidth = cardWidth * 4 + 80;
  let totalHeightCards = cardHeight * 3 + 40;
  let startX = (width - totalWidth) / 2;
  let startY = topHeight + 15 + (middleHeight - totalHeightCards) / 2;

  textSize(20);
  textAlign(CENTER, CENTER);
  textStyle(NORMAL);

  // Draw champion selection cards
  for (let i = 0; i < characters.length; i++) {
    let row = Math.floor(i / 4);
    let col = i % 4;
    let x = startX + col * (cardWidth + 20);
    let y = startY + row * (cardHeight + 20);
    fill(255);
    if (player1Characters.includes(characters[i])) {
      stroke(255, 0, 0);
      strokeWeight(4);
    } else if (player2Characters.includes(characters[i])) {
      stroke(0, 0, 255);
      strokeWeight(4);
    } else {
      noStroke();
    }
    rect(x, y, cardWidth, cardHeight, 15);
    fill(0);
    text(characters[i], x + cardWidth / 2, y + cardHeight / 2);

    if (isMouseOver(x, y, cardWidth, cardHeight) && !player1Characters.includes(characters[i]) && !player2Characters.includes(characters[i])) {
      push();
      if (selectionPhase === 'p1_first' || selectionPhase === 'p1_second') {
        noFill();
        stroke(255, 0, 0);
        strokeWeight(4);
        rect(x - 5, y - 5, cardWidth + 10, cardHeight + 10, 15);
        fill(255, 0, 0);
        textSize(16);
        textAlign(LEFT, TOP);
        text("P1", x + 5, y + 5);
      } else {
        noFill();
        stroke(0, 0, 255);
        strokeWeight(4);
        rect(x - 5, y - 5, cardWidth + 10, cardHeight + 10, 15);
        fill(0, 0, 255);
        textSize(16);
        textAlign(LEFT, TOP);
        text("P2", x + 5, y + 5);
      }
      pop();
      textSize(20);
      textAlign(CENTER, CENTER);
      textStyle(NORMAL);
    }
  }

  // Draw player selection summaries
  let bottomY = topHeight + middleHeight + 15;
  fill(0);
  rect(0, bottomY, width, bottomHeight + 15);
  
  let p1Width = width * 0.4;
  fill(255, 0, 0);
  textSize(22);
  textAlign(CENTER);
  text("Player 1", p1Width / 2, bottomY + 30);
  for (let i = 0; i < player1Characters.length; i++) {
    fill(255);
    stroke(255, 0, 0);
    strokeWeight(3);
    rect((p1Width - 360) / 2 + i * 220, bottomY + 50, 180, 90, 15);
    fill(0);
    noStroke();
    textSize(20);
    textAlign(CENTER, CENTER);
    text(player1Characters[i], (p1Width - 360) / 2 + i * 220 + 90, bottomY + 85);
  }

  push();
  translate(width / 2, bottomY + 90);
  rotate(sin(vsTilt) * 0.2);
  fill(139, 0, 0);
  textSize(60);
  textStyle(BOLD);
  textAlign(CENTER, CENTER);
  text("VS", 0, 0);
  textStyle(NORMAL);
  pop();
  vsTilt += 0.05;

  let p2Width = width * 0.4;
  let p2StartX = width - p2Width;
  fill(0, 0, 255);
  textSize(22);
  textAlign(CENTER);
  text("Player 2", p2StartX + p2Width / 2, bottomY + 30);
  for (let i = 0; i < player2Characters.length; i++) {
    fill(255);
    stroke(0, 0, 255);
    strokeWeight(3);
    rect(p2StartX + (p2Width - 360) / 2 + i * 220, bottomY + 50, 180, 90, 15);
    fill(0);
    noStroke();
    textSize(20);
    textAlign(CENTER, CENTER);
    text(player2Characters[i], p2StartX + (p2Width - 360) / 2 + i * 220 + 90, bottomY + 85);
  }

  // Show transition buttons when selection is complete
  if (player1Characters.length === 2 && player2Characters.length === 2) {
    fadeAlpha = min(fadeAlpha + 5, 255);
    fill(0, fadeAlpha);
    noStroke();
    rect(0, 0, width, topHeight + middleHeight);

    let buttonWidth = 400;
    let buttonHeight = 80;
    let buttonYTop = (topHeight + middleHeight) / 2 - buttonHeight - 30;
    let buttonYBottom = (topHeight + middleHeight) / 2 + 30;
    drawGothicButton(returnSelectButton, width / 2 - buttonWidth / 2, buttonYTop, "Select Champions");
    drawGothicButton(enterArenaButton, width / 2 - buttonWidth / 2, buttonYBottom, "Enter Arena");
    enterArenaButton.show();
    returnSelectButton.show();
  } else {
    fadeAlpha = 0;
    enterArenaButton.hide();
    returnSelectButton.hide();
  }
}

// Checks if mouse is over a rectangular area
function isMouseOver(x, y, w, h) {
  return lastMouseX >= x && lastMouseX <= x + w && lastMouseY >= y && lastMouseY <= y + h;
}

// Styles and positions gothic-style buttons
function drawGothicButton(button, x, y, label) {
  button.position(x, y);
  button.style('background-color', '#2c1e1e');
  button.style('border', '4px solid #8b0000');
  button.style('border-radius', '10px');
  button.style('padding', '20px 60px');
  button.style('font-family', 'Arial Black');
  button.style('font-size', '22px');
  button.style('color', '#ffffff');
  button.style('text-shadow', '2px 2px 4px #8b0000');
  button.size(400, 80);
}

// Transitions from splash screen to character selection
function startGame() {
  if (!resourcesLoaded) {
    console.log("Resources still loading, delaying start...");
    setTimeout(startGame, 500);
    return;
  }
  currentScreen = 'characterSelect';
  startButton.hide();
  mouseLocked = true;
  setTimeout(() => mouseLocked = false, 100); // Brief lock to prevent immediate clicks
}

// Resets character selection process
function resetCharacterSelect() {
  currentScreen = 'characterSelect';
  player1Characters = [];
  player2Characters = [];
  selectionPhase = 'p1_first';
  fadeAlpha = 0;
  enterArenaButton.hide();
  returnSelectButton.hide();
  mouseLocked = true;
  setTimeout(() => mouseLocked = false, 100);
}

// Handles mouse clicks across game screens
function mousePressed() {
  if (!resourcesLoaded) return;

  if (currentScreen === 'characterSelect' && !mouseLocked) {
    let topHeight = height * 0.08;
    let middleHeight = height * 0.74;
    let cardWidth = 180;
    let cardHeight = 220;
    let totalWidth = cardWidth * 4 + 80;
    let totalHeightCards = cardHeight * 3 + 40;
    let startX = (width - totalWidth) / 2;
    let startY = topHeight + 15 + (middleHeight - totalHeightCards) / 2;

    for (let i = 0; i < characters.length; i++) {
      let row = Math.floor(i / 4);
      let col = i % 4;
      let x = startX + col * (cardWidth + 20);
      let y = startY + row * (cardHeight + 20);
      if (mouseX > x && mouseX < x + cardWidth && mouseY > y && mouseY < y + cardHeight) {
        let champ = characters[i];
        if (!player1Characters.includes(champ) && !player2Characters.includes(champ)) {
          if (selectionPhase === 'p1_first' || selectionPhase === 'p1_second') {
            player1Characters.push(champ);
            if (selectionPhase === 'p1_first') {
              selectionPhase = 'p2_first';
            } else {
              selectionPhase = 'p2_second';
            }
          } else {
            player2Characters.push(champ);
            if (selectionPhase === 'p2_first') {
              selectionPhase = 'p1_second';
            }
          }
        }
      }
    }
  } else if (currentScreen === 'placement') {
    handlePlacementClick();
  } else if (currentScreen === 'game') {
    handleGameClick();
  }
}

// Transitions to placement screen and initializes game state
function enterArena() {
  if (!allCards) {
    console.error("Cards not loaded yet! Please wait.");
    return;
  }

  currentScreen = 'placement';
  enterArenaButton.hide();
  returnSelectButton.hide();
  fadeAlpha = 0;
  placementPhase = 'p1_first';

  // Create champion objects
  player1Champions = [
    new Champion(player1Characters[0], null, championStats[player1Characters[0]].movement, championStats[player1Characters[0]].power, championStats[player1Characters[0]].range, 20),
    new Champion(player1Characters[1], null, championStats[player1Characters[1]].movement, championStats[player1Characters[1]].power, championStats[player1Characters[1]].range, 20)
  ];
  player2Champions = [
    new Champion(player2Characters[0], null, championStats[player2Characters[0]].movement, championStats[player2Characters[0]].power, championStats[player2Characters[0]].range, 20),
    new Champion(player2Characters[1], null, championStats[player2Characters[1]].movement, championStats[player2Characters[1]].power, championStats[player2Characters[1]].range, 20)
  ];

  // Initialize and shuffle decks
  player1Deck = [];
  player2Deck = [];
  player1Characters.forEach(char => {
    let charCards = allCards.filter(card => card.character === char);
    player1Deck = player1Deck.concat(charCards.map(card => ({ ...card })));
  });
  player2Characters.forEach(char => {
    let charCards = allCards.filter(card => card.character === char);
    player2Deck = player2Deck.concat(charCards.map(card => ({ ...card })));
  });

  // Ensure 40-card deck by duplicating if needed, then shuffle
  while (player1Deck.length < 40) {
    player1Deck = player1Deck.concat(player1Deck.map(card => ({ ...card })));
  }
  while (player2Deck.length < 40) {
    player2Deck = player2Deck.concat(player2Deck.map(card => ({ ...card })));
  }
  player1Deck = player1Deck.slice(0, 40);
  player2Deck = player2Deck.slice(0, 40);
  shuffleArray(player1Deck);
  shuffleArray(player2Deck);

  player1Cards = player1Deck.splice(0, 3); // Draw initial hand
  player2Cards = player2Deck.splice(0, 3);

  player1Discard = [];
  player2Discard = [];
  console.log(`Player 1 Deck: ${player1Deck.length}, Hand: ${player1Cards.length}`);
  console.log(`Player 2 Deck: ${player2Deck.length}, Hand: ${player2Cards.length}`);

  setupGameBoard();
}

// Sets up the game board with walls and pits
function setupGameBoard() {
  gameBoard = Array(10).fill().map(() => Array(10).fill('empty'));
  for (let i = 0; i < 10; i++) { // Add border walls
    gameBoard[0][i] = 'wall';
    gameBoard[9][i] = 'wall';
    gameBoard[i][0] = 'wall';
    gameBoard[i][9] = 'wall';
  }
  // Add central pits
  gameBoard[4][4] = 'pit';
  gameBoard[4][5] = 'pit';
  gameBoard[5][4] = 'pit';
  gameBoard[5][5] = 'pit';
}

// Renders the placement screen for positioning champions
function drawPlacementScreen() {
  background(220);

  let statusHeight = 150;
  let statusWidth = gridWidth;
  let totalHeight = statusHeight + 20 + gridHeight + 20 + statusHeight;
  let offsetY = (height - totalHeight) / 2;
  let startX = (width - gridWidth) / 2;
  let gridStartY = offsetY + statusHeight + 20;

  drawPlayerStatusWindow(startX, offsetY - 10, statusWidth, statusHeight, 'Player 1', player1Champions, player1Mana, true);

  // Draw game grid
  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      if (gameBoard[i][j] === 'wall') {
        fill(150, 150, 150);
      } else if (gameBoard[i][j] === 'pit') {
        fill(255, 0, 0);
      } else {
        fill(100, 100, 100);
      }
      stroke(0);
      strokeWeight(1);
      rect(startX + j * cellSize, gridStartY + i * cellSize, cellSize, cellSize);
    }
  }

  // Highlight valid placement rows
  for (let j = 1; j < 9; j++) {
    if (placementPhase.startsWith('p1') && gameBoard[1][j] === 'empty') {
      fill(255, 0, 0, 100);
      rect(startX + j * cellSize, gridStartY + cellSize, cellSize, cellSize);
    } else if (placementPhase.startsWith('p2') && gameBoard[8][j] === 'empty') {
      fill(0, 0, 255, 100);
      rect(startX + j * cellSize, gridStartY + 8 * cellSize, cellSize, cellSize);
    }
  }

  let gridBottom = gridStartY + gridHeight;
  drawPlayerStatusWindow(startX, gridBottom + 20, statusWidth, statusHeight, 'Player 2', player2Champions, player2Mana, false);

  // Draw placed champions
  player1Champions.concat(player2Champions).forEach(champ => {
    if (champ.position) {
      fill(championColors[champ.name]);
      ellipse(startX + champ.position[0] * cellSize + cellSize / 2, gridStartY + champ.position[1] * cellSize + cellSize / 2, cellSize, cellSize);
    }
  });

  if (draggingChampion) { // Draw dragging champion
    fill(championColors[draggingChampion.name]);
    ellipse(mouseX, mouseY, cellSize, cellSize);
  }

  fill(255);
  textSize(24);
  textAlign(CENTER);
  text(`Player ${placementPhase.startsWith('p1') ? 1 : 2}, place your ${placementPhase.endsWith('first') ? 'first' : 'second'} champion`, width / 2, gridStartY + gridHeight / 2);
}

// Define grid positioning variables globally for game screen
let startX, gridStartY;
// Renders the main game screen with balanced layout
function drawGame() {
  background(220);

  let statusHeight = 150;
  let statusWidth = 600; // Fixed width for status window
  let totalHeight = statusHeight + 20 + gridHeight + 20 + statusHeight;
  let offsetY = (height - totalHeight) / 2;
  startX = 300; // Center grid horizontally
  gridStartY = offsetY + statusHeight + 20;

  // Player 1 (top) elements
  drawEquipment(player1Champions, 190, offsetY - 10); // Left of P1 status
  drawPlayerStatusWindow(startX, offsetY - 10, statusWidth, statusHeight, 'Player 1', player1Champions, player1Mana, true);

  // Draw game grid
  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      if (gameBoard[i][j] === 'wall') {
        fill(150, 150, 150);
      } else if (gameBoard[i][j] === 'pit') {
        fill(255, 0, 0);
      } else {
        fill(100, 100, 100);
      }
      stroke(0);
      strokeWeight(1);
      rect(startX + j * cellSize, gridStartY + i * cellSize, cellSize, cellSize);
    }
  }

  // Highlight valid moves and range
  if (selectedChampion) {
    validMoves.forEach(([x, y]) => {
      fill(0, 255, 0, 100);
      rect(startX + x * cellSize, gridStartY + y * cellSize, cellSize, cellSize);
    });
    validRange.forEach(([x, y]) => {
      fill(255, 0, 0, 100);
      rect(startX + x * cellSize, gridStartY + y * cellSize, cellSize, cellSize);
    });
  }

  // Highlight targeting for directional spells
  if (targetingSpell) {
    if (targetingDirections.length > 0) {
      targetingDirections.forEach(dir => {
        let [dx, dy] = dir;
        let [cx, cy] = targetingSpell.caster.position;
        for (let i = 1; i <= gridSize; i++) {
          let tx = cx + dx * i;
          let ty = cy + dy * i;
          if (tx < 0 || tx >= gridSize || ty < 0 || ty >= gridSize || gameBoard[ty][tx] === 'wall') break;
          fill(255, 255, 0, 100);
          rect(startX + tx * cellSize, gridStartY + ty * cellSize, cellSize, cellSize);
        }
      });
    } else if (targetingPosition) {
      let [px, py] = targetingSpell.caster.position;
      for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
          let tx = px + j;
          let ty = py + i;
          if (tx >= 0 && tx < gridSize && ty >= 0 && ty < gridSize) {
            fill(255, 255, 0, 100);
            rect(startX + tx * cellSize, gridStartY + ty * cellSize, cellSize, cellSize);
          }
        }
      }
    }
  }

  // Draw champions on grid
  player1Champions.concat(player2Champions).forEach(champ => {
    if (champ.position) {
      fill(championColors[champ.name]);
      ellipse(startX + champ.position[0] * cellSize + cellSize / 2, gridStartY + champ.position[1] * cellSize + cellSize / 2, cellSize, cellSize);

      // Add Nature's Resilience indicators
      if (champ.tempEffects.damageReduction) {
        noFill();
        stroke(0, 255, 0); // Green border
        strokeWeight(6); // Bold
        ellipse(startX + champ.position[0] * cellSize + cellSize / 2, gridStartY + champ.position[1] * cellSize + cellSize / 2, cellSize + 4, cellSize + 4);
        noStroke();
        fill(0, 255, 0); // Green text
        textSize(24);
        textAlign(CENTER, CENTER);
        textStyle(BOLD);
        text("B", startX + champ.position[0] * cellSize + cellSize / 2, gridStartY + champ.position[1] * cellSize + cellSize / 2);
        textStyle(NORMAL);
      }

      if (champ === selectedChampion) {
        noFill();
        stroke(255, 255, 0);
        strokeWeight(4);
        ellipse(startX + champ.position[0] * cellSize + cellSize / 2, gridStartY + champ.position[1] * cellSize + cellSize / 2, cellSize + 4, cellSize + 4);
        noStroke();
      }
    }
  });

  // Player 2 (bottom) elements
  let gridBottom = gridStartY + gridHeight;
  drawPlayerStatusWindow(startX, gridBottom + 20, statusWidth, statusHeight, 'Player 2', player2Champions, player2Mana, false);
  drawEquipment(player2Champions, startX + statusWidth + 10, gridBottom + 20); // Right of P2 status

  // Draw card stacks and piles
  drawCardStack(player1Cards, 50, gridStartY); // Start at top of battle map
  drawDeck(player1Deck, 50, gridBottom + 20); // Aligned with P2 status
  drawDiscard(player1Discard, 160, gridBottom + 20); // Aligned with P2 status
  drawCardStack(player2Cards, 950, gridStartY); // Start at top of battle map
  drawDeck(player2Deck, 950, offsetY - 10); // Aligned with P1 status
  drawDiscard(player2Discard, 1060, offsetY - 10); // Aligned with P1 status

  endTurnButton.position(width / 2 - 100, gridBottom + statusHeight + 40);
  endTurnButton.show();
  undoButton.position(width / 2 + 100, gridBottom + statusHeight + 40);
  undoButton.show();
}

// Renders player status window with champion stats and mana
function drawPlayerStatusWindow(x, y, w, h, playerName, champions, mana, isTop) {
  let gradient = drawingContext.createLinearGradient(x, y, x, y + h);
  gradient.addColorStop(0, isTop ? 'rgba(255, 0, 0, 0.8)' : 'rgba(0, 0, 255, 0.8)');
  gradient.addColorStop(1, isTop ? 'rgba(150, 0, 0, 0.8)' : 'rgba(0, 0, 150, 0.8)');
  drawingContext.fillStyle = gradient;
  drawingContext.shadowBlur = 10;
  drawingContext.shadowColor = 'black';
  noStroke();
  rect(x, y, w, h, 10);
  drawingContext.shadowBlur = 0;

  stroke(isTop ? '#ff3333' : '#3333ff');
  strokeWeight(6);
  noFill();
  rect(x, y, w, h, 10);

  textSize(28);
  textAlign(CENTER);
  fill(255);
  text(playerName, x + w / 2, y + 25);

  textSize(18);
  textAlign(LEFT);
  fill(255);
  let champYStart = y + 65;
  let spacing = 45;
  for (let i = 0; i < champions.length; i++) {
    let champY = champYStart + i * spacing;
    if (champions[i] === selectedChampion && (currentPlayer === 1) === isTop && !responseState) {
      fill(255, 255, 0, 100);
      rect(x + 15, champY - 20, 380, 30, 5);
    }
    if (!champions[i].position) {
      fill(championColors[champions[i].name]);
      ellipse(x + 30, champY, 30, 30);
    }
    fill(255);
    text(champions[i].name, x + 60, champY);

    let statX = x + 160;
    let healthWidth = 120;
    let statHeight = 20;

    let healthGradient = drawingContext.createLinearGradient(statX, 0, statX + healthWidth, 0);
    healthGradient.addColorStop(0, 'rgba(0, 255, 0, 0.8)');
    healthGradient.addColorStop(1, 'rgba(0, 150, 0, 0.8)');
    drawingContext.fillStyle = healthGradient;
    rect(statX, champY - 15, healthWidth * (champions[i].life / 20), statHeight);
    fill(255);
    textSize(18);
    textAlign(CENTER);
    text(`${champions[i].life}/20`, statX + healthWidth / 2, champY + 5);
    textAlign(LEFT);

    statX += healthWidth + 15;
    textSize(18);
    text("R: " + champions[i].range, statX, champY);
    statX += 50;
    text("P: " + champions[i].power, statX, champY);
    statX += 50;
    text("M: " + champions[i].movementSpeed, statX, champY);
  }

  // Draw mana circle
  let manaX = x + w - 95;
  let manaY = y + h / 2;
  let radius = 45;
  fill(0, 0, 50);
  ellipse(manaX, manaY, radius * 2);
  let wedgeAngle = TWO_PI / 5;
  for (let j = 0; j < mana; j++) {
    let startAngle = j * wedgeAngle - PI / 2;
    let endAngle = (j + 1) * wedgeAngle - PI / 2;
    fill(0, 200, 255);
    arc(manaX, manaY, radius * 2, radius * 2, startAngle, endAngle, PIE);
  }
  fill(255);
  textSize(18);
  textAlign(CENTER);
  text("Mana", manaX, manaY + 55);
}

// Renders equipped equipment card next to status window
function drawEquipment(champions, x, y) {
  let cardWidth = 100;
  let cardHeight = 150;
  let equippedCard = null;

  for (let champ of champions) {
    if (champ.equipped) {
      equippedCard = champ.equipped;
      break;
    }
  }

  if (equippedCard && cardImages[equippedCard.name] && cardImages[equippedCard.name].width > 0) {
    let img = cardImages[equippedCard.name];
    image(img, x, y, cardWidth, cardHeight);
    if (equippedCard.charges !== undefined) {
      fill(255);
      textSize(16);
      textAlign(CENTER);
      text(equippedCard.charges, x + cardWidth / 2, y + cardHeight - 10);
    }
  } else if (equippedCard) {
    fill(255);
    rect(x, y, cardWidth, cardHeight, 5);
    fill(255, 0, 0);
    textSize(16);
    textAlign(CENTER, CENTER);
    text("IMAGE NOT FOUND", x + cardWidth / 2, y + cardHeight / 2);
  } else {
    fill(200, 200, 200);
    stroke(0);
    strokeWeight(1);
    rect(x, y, cardWidth, cardHeight, 5);
    fill(0);
    textSize(18);
    textAlign(CENTER, CENTER);
    text("Equipment", x + cardWidth / 2, y + cardHeight / 2);
  }
}

// Renders the card popup for inspection
function drawCardPopup(cardInfo) {
  let { card, x, y, player } = cardInfo;
  let popupWidth = 280; // 2x hand card width
  let popupHeight = 420; // 2x hand card height
  let popupX = player === 1 ? 200 : 800; // Right of P1 hand, left of P2 hand
  let popupY = y;

  // Draw popup background
  fill(255);
  stroke(0);
  strokeWeight(2);
  rect(popupX, popupY, popupWidth, popupHeight, 10);

  // Draw card image
  if (cardImages[card.name] && cardImages[card.name].width > 0) {
    let img = cardImages[card.name];
    image(img, popupX, popupY, popupWidth, popupHeight);
  } else {
    fill(255, 0, 0);
    textSize(24);
    textAlign(CENTER, CENTER);
    text("IMAGE NOT FOUND", popupX + popupWidth / 2, popupY + popupHeight / 2);
  }

  // Draw cost
  fill(0);
  textSize(20);
  textAlign(RIGHT, TOP);
  text(card.cost, popupX + popupWidth - 10, popupY + 10);

  // Draw "Cast" button
  let buttonWidth = 100;
  let buttonHeight = 40;
  let buttonX = popupX + (popupWidth - buttonWidth) / 2;
  let buttonY = popupY + popupHeight - buttonHeight - 10;
  fill(200);
  rect(buttonX, buttonY, buttonWidth, buttonHeight, 5);
  fill(0);
  textSize(18);
  textAlign(CENTER, CENTER);
  text("Cast", buttonX + buttonWidth / 2, buttonY + buttonHeight / 2);
}

// Initiates dragging a champion during placement
function handlePlacementClick() {
  let statusHeight = 150;
  let totalHeight = statusHeight + 20 + gridHeight + 20 + statusHeight;
  let offsetY = (height - totalHeight) / 2;
  let startX = 300;
  let gridStartY = offsetY + statusHeight + 20;

  let champions = placementPhase.startsWith('p1') ? player1Champions : player2Champions;
  let statusY = placementPhase.startsWith('p1') ? (offsetY - 10) : (gridStartY + gridHeight + 20);

  for (let i = 0; i < champions.length; i++) {
    if (!champions[i].position) {
      let tokenX = startX + 30;
      let tokenY = statusY + 65 + i * 45;
      if (dist(mouseX, mouseY, tokenX, tokenY) < 15) {
        draggingChampion = champions[i];
        break;
      }
    }
  }
}

// Updates dragging position during placement
function mouseDragged() {
  if (currentScreen === 'placement' && draggingChampion) {
    // Position updated in drawPlacementScreen via mouseX, mouseY
  }
}

// Places champion on release during placement
function mouseReleased() {
  if (currentScreen === 'placement' && draggingChampion) {
    let statusHeight = 150;
    let totalHeight = statusHeight + 20 + gridHeight + 20 + statusHeight;
    let offsetY = (height - totalHeight) / 2;
    let startX = 300;
    let gridStartY = offsetY + statusHeight + 20;

    let gridX = Math.floor((mouseX - startX) / cellSize);
    let gridY = Math.floor((mouseY - gridStartY) / cellSize);

    let isValid = false;
    if (placementPhase.startsWith('p1') && gridY === 1 && gridX >= 1 && gridX < 9) {
      isValid = gameBoard[gridY][gridX] === 'empty' && !isOccupied(gridX, gridY);
    } else if (placementPhase.startsWith('p2') && gridY === 8 && gridX >= 1 && gridX < 9) {
      isValid = gameBoard[gridY][gridX] === 'empty' && !isOccupied(gridX, gridY);
    }

    if (isValid) {
      draggingChampion.position = [gridX, gridY];
      if (placementPhase === 'p1_first') placementPhase = 'p2_first';
      else if (placementPhase === 'p2_first') placementPhase = 'p1_second';
      else if (placementPhase === 'p1_second') placementPhase = 'p2_second';
      else if (placementPhase === 'p2_second') {
        currentScreen = 'game';
        startTurn();
      }
    }
    draggingChampion = null;
  }
}

// Checks if a grid position is occupied by a champion
function isOccupied(x, y) {
  return player1Champions.concat(player2Champions).some(champ => champ.position && champ.position[0] === x && champ.position[1] === y);
}

// Checks if two positions are in melee range (adjacent, including diagonals)
function isInMeleeRange(pos1, pos2) {
  let [x1, y1] = pos1;
  let [x2, y2] = pos2;
  let dx = Math.abs(x1 - x2);
  let dy = Math.abs(y1 - y2);
  return dx <= 1 && dy <= 1 && !(dx === 0 && dy === 0);
}

// Returns a random taunt for combat
function getTaunt(attacker, defender) {
  let tauntList = taunts[attacker.name] && taunts[attacker.name][defender.name] 
    ? taunts[attacker.name][defender.name] 
    : taunts['default'];
  return tauntList[Math.floor(Math.random() * tauntList.length)];
}

// Handles game interactions (movement, attacks, card play)
function handleGameClick() {
  if (responseState) { // Handle response card casting
    let cards = responseState.player === 1 ? player1Cards : player2Cards;
    let discard = responseState.player === 1 ? player1Discard : player2Discard;
    handlePlayClick(cards, discard, responseState.player === 1 ? 50 : 950, gridStartY);
    return;
  }

  let statusHeight = 150;
  let totalHeight = statusHeight + 20 + gridHeight + 20 + statusHeight;
  let offsetY = (height - totalHeight) / 2;
  let startX = 300;
  let gridStartY = offsetY + statusHeight + 20;
  let gridBottom = gridStartY + gridHeight;

  let gridX = Math.floor((mouseX - startX) / cellSize);
  let gridY = Math.floor((mouseY - gridStartY) / cellSize);

  // Handle targeting for spells
  if (targetingSpell) {
    if (targetingDirections.length > 0) { // Directional targeting
      let [cx, cy] = targetingSpell.caster.position;
      for (let dir of targetingDirections) {
        let [dx, dy] = dir;
        for (let i = 1; i <= gridSize; i++) {
          let tx = cx + dx * i;
          let ty = cy + dy * i;
          if (tx < 0 || tx >= gridSize || ty < 0 || ty >= gridSize || gameBoard[ty][tx] === 'wall') break;
          if (tx === gridX && ty === gridY) {
            selectedDirection = [dx, dy];
            castCard(targetingSpell.card, targetingSpell.caster, null, selectedDirection);
            if (currentPlayer === 1) {
              player1Mana -= targetingSpell.card.cost;
            } else {
              player2Mana -= targetingSpell.card.cost;
            }
            let cards = currentPlayer === 1 ? player1Cards : player2Cards;
            let discard = currentPlayer === 1 ? player1Discard : player2Discard;
            cards.shift();
            discard.push(targetingSpell.card);
            targetingSpell = null;
            targetingDirections = [];
            selectedDirection = null;
            return;
          }
        }
      }
    } else if (targetingPosition) { // Position targeting (e.g., AOE)
      if (gridX >= 0 && gridX < gridSize && gridY >= 0 && gridY < gridSize) {
        selectedTarget = [gridX, gridY];
        castCard(targetingSpell.card, targetingSpell.caster, selectedTarget);
        if (currentPlayer === 1) {
          player1Mana -= targetingSpell.card.cost;
        } else {
          player2Mana -= targetingSpell.card.cost;
        }
        let cards = currentPlayer === 1 ? player1Cards : player2Cards;
        let discard = currentPlayer === 1 ? player1Discard : player2Discard;
        cards.shift();
        discard.push(targetingSpell.card);
        targetingSpell = null;
        targetingPosition = null;
        selectedTarget = null;
        return;
      }
    } else { // Champion targeting
      let allChamps = player1Champions.concat(player2Champions);
      for (let champ of allChamps) {
        if (champ.position && champ.position[0] === gridX && champ.position[1] === gridY) {
          selectedTarget = champ;
          castCard(targetingSpell.card, targetingSpell.caster, selectedTarget);
          if (currentPlayer === 1) {
            player1Mana -= targetingSpell.card.cost;
          } else {
            player2Mana -= targetingSpell.card.cost;
          }
          let cards = currentPlayer === 1 ? player1Cards : player2Cards;
          let discard = currentPlayer === 1 ? player1Discard : player2Discard;
          cards.shift();
          discard.push(targetingSpell.card);
          targetingSpell = null;
          selectedTarget = null;
          return;
        }
      }
    }
    return;
  }

  // Champion selection
  let champions = currentPlayer === 1 ? player1Champions : player2Champions;
  for (let champ of champions) {
    if (champ.position) {
      let champX = startX + champ.position[0] * cellSize + cellSize / 2;
      let champY = gridStartY + champ.position[1] * cellSize + cellSize / 2;
      if (dist(mouseX, mouseY, champX, champY) < 30) {
        if (selectedChampion === champ) {
          selectedChampion = null;
          validMoves = [];
          validRange = [];
        } else if (!champ.hasMoved || !champ.hasAttacked) {
          selectedChampion = champ;
          validMoves = champ.hasMoved ? [] : getValidMoves(champ);
          validRange = champ.hasAttacked ? [] : getValidRange(champ);
        }
        return;
      }
    }
  }

  // Handle movement and attacks
  if (selectedChampion) {
    if (validMoves.some(([vx, vy]) => vx === gridX && vy === gridY) && !isOccupied(gridX, gridY)) {
      let prevPos = [...selectedChampion.position];
      selectedChampion.position = [gridX, gridY];
      selectedChampion.hasMoved = true;
      lastAction = { type: 'move', champ: selectedChampion, prevPos };

      // Check for Bear Trap or Pit of Despair trigger
      let opponentChampions = currentPlayer === 1 ? player2Champions : player1Champions;
      let opponentPlayer = currentPlayer === 1 ? 2 : 1;
      let rangers = opponentChampions.filter(champ => champ.name === 'Ranger' && champ.position);
      let wizards = opponentChampions.filter(champ => champ.name === 'DarkWizard' && champ.position);
      for (let ranger of rangers) {
        if (isInMeleeRange(selectedChampion.position, ranger.position)) {
          originalPlayer = currentPlayer;
          currentPlayer = opponentPlayer;
          responseState = {
            player: opponentPlayer,
            trigger: 'move',
            data: { mover: selectedChampion, position: selectedChampion.position }
          };
          console.log(`Bear Trap opportunity for Player ${opponentPlayer}`);
          break;
        }
      }
      for (let wizard of wizards) {
        if (isInMeleeRange(selectedChampion.position, wizard.position)) {
          originalPlayer = currentPlayer;
          currentPlayer = opponentPlayer;
          responseState = {
            player: opponentPlayer,
            trigger: 'move',
            data: { mover: selectedChampion, position: selectedChampion.position }
          };
          console.log(`Pit of Despair opportunity for Player ${opponentPlayer}`);
          break;
        }
      }

      validMoves = [];
      validRange = selectedChampion.hasAttacked ? [] : getValidRange(selectedChampion);
      return;
    }

    let enemies = currentPlayer === 1 ? player2Champions : player1Champions;
    for (let enemy of enemies) {
      if (enemy.position && 
          enemy.position[0] === gridX && enemy.position[1] === gridY && 
          validRange.some(([rx, ry]) => rx === gridX && ry === gridY)) {
        let damage = selectedChampion.power;
        if (enemy.equipped && enemy.equipped.name === 'Earth Armor') {
          damage = max(0, damage - 1);
          console.log(`${enemy.name}'s Earth Armor reduced damage by 1`);
        }
        applyDamage(enemy, damage, selectedChampion);
        selectedChampion.hasAttacked = true;
        lastAction = { type: 'attack', champ: selectedChampion, target: enemy, damage };
        console.log(`${selectedChampion.name} attacked ${enemy.name} for ${damage} damage. ${enemy.name} HP: ${enemy.life}`);
        
        let tauntText = getTaunt(selectedChampion, enemy);
        tauntBubble = {
          text: tauntText,
          x: startX + enemy.position[0] * cellSize + cellSize / 2,
          y: gridStartY + enemy.position[1] * cellSize,
          startTime: millis(),
          duration: 3000,
          fadeTime: 2000
        };

        validMoves = selectedChampion.hasMoved ? [] : getValidMoves(selectedChampion);
        validRange = [];
        return;
      }
    }
  }

  // Handle deck clicks
  handleDeckClick(player1Deck, player1Cards, 50, gridBottom + 20); // P1 deck at (50, 690)
  handleDeckClick(player2Deck, player2Cards, 950, offsetY - 10); // P2 deck at (950, 40)

  // Handle popup click for casting
  if (hoveredCard) {
    let popupX = hoveredCard.player === 1 ? 200 : 800;
    let popupY = hoveredCard.y;
    let buttonX = popupX + 90; // Center of 280 width
    let buttonY = popupY + 370; // Bottom of 420 height - 10 padding
    if (isMouseOver(buttonX, buttonY, 100, 40)) {
      let cards = hoveredCard.player === 1 ? player1Cards : player2Cards;
      let discard = hoveredCard.player === 1 ? player1Discard : player2Discard;
      let currentMana = hoveredCard.player === 1 ? player1Mana : player2Mana;
      let index = cards.indexOf(hoveredCard.card);

      if (index !== -1 && currentMana >= hoveredCard.card.cost && hoveredCard.caster) {
        let card = cards[index];
        if (card.type === 'Action' && !responseState) {
          if (card.name === 'Ground Pound') {
            targetingSpell = { card: card, caster: hoveredCard.caster };
            targetingDirections = [[0, 1], [0, -1], [1, 0], [-1, 0]];
            console.log("Select direction for Ground Pound");
          } else if (['Big Hug', 'No Bullying', 'Encouragement', 'Shove Off', 'Power Shot', 'Rain of Arrows', 'Multi-Shot', 'Focus Shot', 'Two for One', 'From the Sky', 'Ape Smash', 'Elk Infusion', 'Fast Heal', 'Calming', 'Spirit Strike', 'Restoration', 'Betrayal', 'Head Smash', 'Hamstrung', 'Distract', 'Blinded', 'Quick Hit', 'Last Stand', 'Lightning Strike', 'Spirit Link', 'Vortex Shield', 'Shadow Bolt', 'Hypnotize', 'Underworld Terror'].includes(card.name)) {
            targetingSpell = { card: card, caster: hoveredCard.caster };
            announcement = { text: "Select a target champion", startTime: millis(), duration: 2000, fadeTime: 1000 };
          } else if (['Light Bomb', 'Elemental Storm', 'Healing Rain', 'Acid Bomb'].includes(card.name)) {
            targetingSpell = { card: card, caster: hoveredCard.caster };
            targetingPosition = true;
            announcement = { text: "Select a target position", startTime: millis(), duration: 2000, fadeTime: 1000 };
          } else {
            castCard(card, hoveredCard.caster);
            if (hoveredCard.player === 1) {
              player1Mana -= card.cost;
            } else {
              player2Mana -= card.cost;
            }
            cards.splice(index, 1);
            discard.push(card);
            console.log(`${card.name} cast by ${hoveredCard.caster.name}. Mana left: ${currentMana - card.cost}`);
          }
        } else if (card.type === 'Equipment' && !responseState) {
          hoveredCard.caster.equipped = card;
          if (card.name === 'Repentance' || card.name === 'Intimidation' || card.name === 'Combat Medic') card.charges = 3;
          if (hoveredCard.player === 1) {
            player1Mana -= card.cost;
          } else {
            player2Mana -= card.cost;
          }
          cards.splice(index, 1);
          console.log(`${card.name} equipped by ${hoveredCard.caster.name}. Mana left: ${currentMana - card.cost}`);
        } else if (responseState && responseState.player === hoveredCard.player && card.type === 'Response') {
          if (card.name === 'Bear Trap' && responseState.trigger === 'move') {
            let mover = responseState.data.mover;
            castCard(card, hoveredCard.caster, mover);
            if (hoveredCard.player === 1) {
              player1Mana -= card.cost;
            } else {
              player2Mana -= card.cost;
            }
            cards.splice(index, 1);
            discard.push(card);
            announcement = { text: "Response!", startTime: millis(), duration: 2000, fadeTime: 1000 };
            currentPlayer = originalPlayer;
            responseState = null;
            console.log(`${card.name} cast by ${hoveredCard.caster.name}. Mana left: ${currentMana - card.cost}`);
          } else if (card.name === 'Pit of Despair' && responseState.trigger === 'move') {
            castCard(card, hoveredCard.caster, responseState.data.mover);
            if (hoveredCard.player === 1) {
              player1Mana -= card.cost;
            } else {
              player2Mana -= card.cost;
            }
            cards.splice(index, 1);
            discard.push(card);
            announcement = { text: "Response!", startTime: millis(), duration: 2000, fadeTime: 1000 };
            currentPlayer = originalPlayer;
            responseState = null;
          }
        }
        hoveredCard = null; // Clear popup after casting
      }
    }
  }

  // Update hovered card
  hoveredCard = null; // Reset each frame
  checkCardHover(player1Cards, 50, gridStartY, 1);
  checkCardHover(player2Cards, 950, gridStartY, 2);
}

// Checks for card hover on top part (name area) and sets hoveredCard
function checkCardHover(cards, x, y, player) {
  let cardWidth = 140;
  let cardHeight = 210;
  let offset = 35;
  let nameHeight = 35; // Top 35 pixels for "name" area

  // Iterate from bottom to top to catch lower cards first
  for (let i = cards.length - 1; i >= 0; i--) {
    let cardY = y + i * offset;
    // Check only the top "name" area
    if (isMouseOver(x, cardY, cardWidth, nameHeight)) {
      let caster = (player === 1 ? player1Champions : player2Champions).find(champ => champ.name === cards[i].character);
      hoveredCard = { card: cards[i], x, y: cardY, player, caster };
      break;
    }
  }
}

// Reverses the last action (move or attack)
function undoLastAction() {
  if (!lastAction) return;

  if (lastAction.type === 'move') {
    lastAction.champ.position = lastAction.prevPos;
    lastAction.champ.hasMoved = false;
    validMoves = getValidMoves(lastAction.champ);
    validRange = lastAction.champ.hasAttacked ? [] : getValidRange(lastAction.champ);
  } else if (lastAction.type === 'attack') {
    lastAction.target.life += lastAction.damage;
    lastAction.champ.hasAttacked = false;
    validMoves = lastAction.champ.hasMoved ? [] : getValidMoves(lastAction.champ);
    validRange = getValidRange(lastAction.champ);
    tauntBubble = null;
  }

  lastAction = null;
  console.log("Last action undone");
}

// Calculates valid move positions using BFS
function getValidMoves(champ) {
  let moves = [];
  let [startX, startY] = champ.position;
  let maxDist = champ.movementSpeed;
  let visited = new Set();
  let queue = [[startX, startY, 0]];

  visited.add(`${startX},${startY}`);

  while (queue.length > 0) {
    let [x, y, steps] = queue.shift();

    if (steps <= maxDist && steps > 0) {
      moves.push([x, y]);
    }

    if (steps >= maxDist) continue;

    let directions = [[0, 1], [0, -1], [1, 0], [-1, 0]];
    if (champ.tempEffects.agility) directions = [[0, 1], [0, -1], [1, 0], [-1, 0], [1, 1], [1, -1], [-1, 1], [-1, -1]];
    for (let [dx, dy] of directions) {
      let newX = x + dx;
      let newY = y + dy;
      let key = `${newX},${newY}`;

      if (newX >= 0 && newX < gridSize && 
          newY >= 0 && newY < gridSize && 
          gameBoard[newY][newX] !== 'pit' && 
          gameBoard[newY][newX] !== 'wall' &&  // Add this check to exclude walls
          (!isOccupied(newX, newY) || champ.tempEffects.agility) && 
          !visited.has(key)) {
        visited.add(key);
        queue.push([newX, newY, steps + 1]);
      }
    }
  }

  return moves;
}

// Calculates valid attack range (adjacent directions up to range)
function getValidRange(champ) {
  let rangeTiles = [];
  let [startX, startY] = champ.position;
  let maxRange = champ.range;

  let directions = [[0, 1], [0, -1], [1, 0], [-1, 0]];
  for (let [dx, dy] of directions) {
    for (let i = 1; i <= maxRange; i++) {
      let newX = startX + dx * i;
      let newY = startY + dy * i;
      if (newX >= 0 && newX < gridSize && newY >= 0 && newY < gridSize) {
        if (gameBoard[newY][newX] === 'wall') break;
        rangeTiles.push([newX, newY]);
      } else {
        break;
      }
    }
  }

  return rangeTiles;
}

// Initializes a new turn
function startTurn() {
  player1Champions.forEach(champ => {
    champ.hasMoved = false;
    champ.hasAttacked = false;
    champ.hasCast = false;
    champ.tempEffects = champ.tempEffects || {};
    if (champ.tempEffects.thisTurn) {
      if (champ.tempEffects.thisTurn.power) champ.power -= champ.tempEffects.thisTurn.power;
      if (champ.tempEffects.thisTurn.range) champ.range -= champ.tempEffects.thisTurn.range;
      if (champ.tempEffects.thisTurn.movement) champ.movementSpeed -= champ.tempEffects.thisTurn.movement;
      champ.tempEffects.thisTurn = {};
    }
    if (champ.tempEffects.untilNextTurn) {
      champ.tempEffects = { ...champ.tempEffects, ...champ.tempEffects.untilNextTurn };
      delete champ.tempEffects.untilNextTurn;
    }
  });
  player2Champions.forEach(champ => {
    champ.hasMoved = false;
    champ.hasAttacked = false;
    champ.hasCast = false;
    champ.tempEffects = champ.tempEffects || {};
    if (champ.tempEffects.thisTurn) {
      if (champ.tempEffects.thisTurn.power) champ.power -= champ.tempEffects.thisTurn.power;
      if (champ.tempEffects.thisTurn.range) champ.range -= champ.tempEffects.thisTurn.range;
      if (champ.tempEffects.thisTurn.movement) champ.movementSpeed -= champ.tempEffects.thisTurn.movement;
      champ.tempEffects.thisTurn = {};
    }
    if (champ.tempEffects.untilNextTurn) {
      champ.tempEffects = { ...champ.tempEffects, ...champ.tempEffects.untilNextTurn };
      delete champ.tempEffects.untilNextTurn;
    }
  });

  if (currentPlayer === 1) {
    player1Mana = 5; // Refill mana
    if (player1Deck.length > 0) {
      let drawnCard = player1Deck.shift();
      player1Cards.push(drawnCard); // Draw a card
      console.log(`Player 1 drew ${drawnCard.name}. Hand: ${player1Cards.length}, Deck: ${player1Deck.length}`);
    }
  } else {
    player2Mana = 5;
    if (player2Deck.length > 0) {
      let drawnCard = player2Deck.shift();
      player2Cards.push(drawnCard);
      console.log(`Player 2 drew ${drawnCard.name}. Hand: ${player2Cards.length}, Deck: ${player2Deck.length}`);
    }
  }
  
  announcement = {
    text: `Player ${currentPlayer}'s Turn!`,
    startTime: millis(),
    duration: 3000,
    fadeTime: 2000
  };
}

// Ends the current turn and switches players
function endTurn() {
  selectedChampion = null;
  validMoves = [];
  validRange = [];
  tauntBubble = null;
  targetingSpell = null;
  targetingDirections = [];
  selectedDirection = null;
  targetingPosition = null;
  selectedTarget = null;
  responseState = null;
  currentPlayer = originalPlayer; // Restore original player if interrupted

  // Discard excess cards if hand exceeds 7
  if (currentPlayer === 1 && player1Cards.length > 7) {
    let excess = player1Cards.length - 7;
    player1Discard.push(...player1Cards.splice(0, excess));
    console.log(`Player 1 discarded ${excess} cards. Hand: ${player1Cards.length}, Discard: ${player1Discard.length}`);
  } else if (currentPlayer === 2 && player2Cards.length > 7) {
    let excess = player2Cards.length - 7;
    player2Discard.push(...player2Cards.splice(0, excess));
    console.log(`Player 2 discarded ${excess} cards. Hand: ${player2Cards.length}, Discard: ${player2Discard.length}`);
  }

  currentPlayer = currentPlayer === 1 ? 2 : 1;
  originalPlayer = currentPlayer;
  startTurn();
}

// Renders player's card hand with smaller size and highlight
function drawCardStack(cards, x, y) {
  let cardWidth = 140; // Reduced from 210
  let cardHeight = 210; // Reduced from 315
  let offset = 35; // Reduced from 50
  let currentMana = currentPlayer === 1 ? player1Mana : player2Mana;
  let isResponseTurn = responseState && responseState.player === (x === 50 ? 1 : 2);

  for (let i = 0; i < cards.length; i++) {
    let cardY = y + i * offset;
    let canCast = (!isResponseTurn && (cards[i].type === 'Action' || cards[i].type === 'Equipment') && currentMana >= cards[i].cost) ||
                  (isResponseTurn && cards[i].type === 'Response' && currentMana >= cards[i].cost);

    if (cardImages[cards[i].name] && cardImages[cards[i].name].width > 0) {
      let img = cardImages[cards[i].name];
      let imgAspect = img.width / img.height;
      let cardAspect = cardWidth / cardHeight;

      let scaledWidth, scaledHeight, imgX, imgY;
      if (imgAspect > cardAspect) {
        scaledHeight = cardHeight;
        scaledWidth = scaledHeight * imgAspect;
        imgX = x - (scaledWidth - cardWidth) / 2;
        imgY = cardY;
      } else {
        scaledWidth = cardWidth;
        scaledHeight = scaledWidth / imgAspect;
        imgX = x;
        imgY = cardY - (scaledHeight - cardHeight) / 2;
      }
      push();
      if (!canCast) {
        tint(100); // Gray out uncastable cards
      }
      image(img, imgX, imgY, scaledWidth, scaledHeight);
      pop();
    } else {
      fill(canCast ? 255 : 150);
      rect(x, cardY, cardWidth, cardHeight, 5);
      fill(255, 0, 0);
      textSize(16);
      textStyle(BOLD);
      textAlign(CENTER, CENTER);
      text("IMAGE NOT FOUND", x + cardWidth / 2, cardY + cardHeight / 2);
      textStyle(NORMAL);
    }

    // Highlight if hovered
    if (hoveredCard && hoveredCard.card === cards[i]) {
      noFill();
      stroke(255, 255, 0);
      strokeWeight(3);
      rect(x, cardY, cardWidth, cardHeight, 5);
      noStroke();
    } else {
      noFill();
      stroke(0);
      strokeWeight(1);
      rect(x, cardY, cardWidth, cardHeight, 5);
      noStroke();
    }

    fill(0);
    textSize(12);
    textAlign(RIGHT, TOP);
    text(cards[i].cost, x + cardWidth - 5, cardY + 5); // Adjusted for smaller size
  }
}

// Renders the deck draw pile
function drawDeck(deck, x, y) {
  let cardWidth = 100;
  let cardHeight = 150;
  fill(200, 200, 200);
  stroke(0);
  strokeWeight(1);
  rect(x, y, cardWidth, cardHeight, 5);
  fill(0);
  textSize(18);
  textAlign(CENTER, CENTER);
  text(`Deck (${deck.length})`, x + cardWidth / 2, y + cardHeight / 2);
}

// Renders the discard pile
function drawDiscard(discard, x, y) {
  let cardWidth = 100;
  let cardHeight = 150;
  fill(150, 150, 150);
  stroke(0);
  strokeWeight(1);
  rect(x, y, cardWidth, cardHeight, 5);
  fill(0);
  textSize(18);
  textAlign(CENTER, CENTER);
  text(`Discard (${discard.length})`, x + cardWidth / 2, y + cardHeight / 2);
}

// Draws a card from the deck to the hand
function handleDeckClick(deck, hand, x, y) {
  let cardWidth = 100;
  let cardHeight = 150;
  if (mouseX > x && mouseX < x + cardWidth && mouseY > y && mouseY < y + cardHeight) {
    if (hand.length < 7 && deck.length > 0) {
      let drawnCard = deck.shift();
      hand.push(drawnCard);
      console.log(`Card drawn: ${drawnCard.name}. Hand size: ${hand.length}`);
      checkResponseTriggers('draw', currentPlayer === 1 ? 2 : 1, { count: 1 });
    }
  }
}

// Casts a card and applies its effect
function castCard(card, caster, target = null, direction = null) {
  let allChamps = player1Champions.concat(player2Champions);
  let enemies = currentPlayer === 1 ? player2Champions : player1Champions;
  let friendlies = currentPlayer === 1 ? player1Champions : player2Champions;

  caster.tempEffects = caster.tempEffects || {};

  if (card.character === 'Brute') {
    if (card.name === 'Oblivious') { // Response: handled in applyDamage
    } else if (card.name === 'Nap Time') {
      caster.life = min(caster.life + 3, 20);
      caster.hasAttacked = true;
      console.log(`${caster.name} used Nap Time. Life: ${caster.life}`);
    } else if (card.name === 'Friends Forever') {
      let enemyCount = enemies.filter(e => e.position && isInRange(caster, e)).length;
      caster.tempEffects.thisTurn = { power: enemyCount };
      caster.power += enemyCount;
      console.log(`${caster.name} gained ${enemyCount} power from Friends Forever`);
    } else if (card.name === 'Tantrum') { // Response: handled in applyDamage
    } else if (card.name === 'Heave' && target) {
      let [tx, ty] = findEmptyPositionOverWall(caster, target, direction);
      if (tx !== null) {
        target.position = [tx, ty];
        console.log(`${caster.name} heaved ${target.name} to [${tx}, ${ty}]`);
      }
    } else if (card.name === 'Ground Pound' && direction) {
      let [dx, dy] = direction;
      let [cx, cy] = caster.position;
      let targets = [];
      for (let i = 1; i <= gridSize; i++) {
        let tx = cx + dx * i;
        let ty = cy + dy * i;
        if (tx < 0 || tx >= gridSize || ty < 0 || ty >= gridSize || gameBoard[ty][tx] === 'wall') break;
        let hit = allChamps.find(champ => champ.position && champ.position[0] === tx && champ.position[1] === ty);
        if (hit) targets.push(hit);
      }
      targets.forEach(t => applyDamage(t, 2, caster));
      console.log(`${caster.name} used Ground Pound, hitting ${targets.length} champions`);
    } else if (card.name === 'Big Hug' && target) {
      target.tempEffects.untilNextTurn = { canMove: false };
      console.log(`${caster.name} hugged ${target.name}, immobilizing them next turn`);
    } else if (card.name === 'No Bullying' && target) {
      let corners = [[1, 1], [1, 8], [8, 1], [8, 8]];
      let newPos = corners.find(([x, y]) => !isOccupied(x, y) && gameBoard[y][x] === 'empty');
      if (newPos) {
        target.position = newPos;
        console.log(`${caster.name} sent ${target.name} to corner ${newPos}`);
      }
    } else if (card.name === 'Endless Energy') {
      caster.hasMoved = false;
      caster.hasAttacked = false;
      console.log(`${caster.name} gained extra move and attack`);
    } else if (card.name === 'Encouragement' && target) {
      target.tempEffects.thisTurn = { power: 2, range: 2, movement: 2 };
      target.power += 2;
      target.range += 2;
      target.movementSpeed += 2;
      console.log(`${caster.name} encouraged ${target.name}, +2 to all stats`);
    } else if (card.name === 'Shove Off' && target) {
      let [dx, dy] = getDirectionToWall(caster, target);
      let [tx, ty] = pushUntilWall(target, dx, dy);
      target.position = [tx, ty];
      if (target.equipped) {
        let discard = currentPlayer === 1 ? player2Discard : player1Discard;
        discard.push(target.equipped);
        target.equipped = null;
      }
      console.log(`${caster.name} shoved ${target.name} to [${tx}, ${ty}]`);
    } else if (card.name === 'Enough is Enough') {
      caster.tempEffects.thisTurn = { power: 2 };
      caster.power += 2;
      caster.hasAttacked = false;
      console.log(`${caster.name} gained +2 power and extra attack`);
    }
  } else if (card.character === 'Ranger') {
    if (card.name === 'Elusive') {
      caster.hasMoved = false;
      console.log(`${caster.name} gained extra movement phase`);
    } else if (card.name === 'Swiftness') {
      caster.tempEffects.thisTurn = { movement: 5, range: -5 };
      caster.movementSpeed += 5;
      caster.range -= 5;
      console.log(`${caster.name} gained +5 movement, -5 range`);
    } else if (card.name === 'Power Shot') {
      caster.tempEffects.thisTurn = { power: 2, range: -2 };
      caster.power += 2;
      caster.range -= 2;
      console.log(`${caster.name} gained +2 power, -2 range`);
    } else if (card.name === 'Bear Trap') { // Response: handled in movement
    } else if (card.name === 'Resourceful') {
      let discard = currentPlayer === 1 ? player1Discard : player2Discard;
      let hand = currentPlayer === 1 ? player1Cards : player2Cards;
      let options = discard.filter(c => c.character === 'Ranger' && c.cost <= 1);
      if (options.length > 0) {
        let cardToRetrieve = options[Math.floor(Math.random() * options.length)];
        hand.push(cardToRetrieve);
        discard.splice(discard.indexOf(cardToRetrieve), 1);
        console.log(`${caster.name} retrieved ${cardToRetrieve.name} from discard`);
      }
    } else if (card.name === 'Rain of Arrows' && target) {
      let [tx, ty] = target;
      let hits = getAOETargets(tx, ty);
      distributeDamageRandomly(hits, 4);
      console.log(`${caster.name} fired Rain of Arrows, distributing 4 damage`);
    } else if (card.name === 'Multi-Shot') {
      enemies.filter(e => e.position && isInRange(caster, e)).forEach(e => applyDamage(e, 2, caster));
      console.log(`${caster.name} used Multi-Shot`);
    } else if (card.name === 'Rapid Fire') {
      let deck = currentPlayer === 1 ? player1Deck : player2Deck;
      let hand = currentPlayer === 1 ? player1Cards : player2Cards;
      let drawn = deck.splice(0, 3);
      hand.push(...drawn);
      console.log(`${caster.name} drew ${drawn.map(c => c.name).join(', ')}`);
      // Free Ranger card play not fully implemented due to UI limitations
    } else if (card.name === 'Leech') {
      caster.tempEffects.thisTurn = { leech: true };
      console.log(`${caster.name} activated Leech`);
    } else if (card.name === 'Focus Shot') {
      caster.hasMoved = true;
      caster.tempEffects.thisTurn = { power: 3 };
      caster.power += 3;
      console.log(`${caster.name} used Focus Shot, +3 power`);
    } else if (card.name === 'Two for One') {
      caster.tempEffects.thisTurn = { power: 2 };
      caster.power += 2;
      caster.hasAttacked = false;
      console.log(`${caster.name} gained +2 power and extra attack`);
    } else if (card.name === 'From the Sky') {
      let hand = currentPlayer === 1 ? player1Cards : player2Cards;
      let discard = currentPlayer === 1 ? player1Discard : player2Discard;
      let count = hand.length - 1; // Exclude this card
      discard.push(...hand.splice(0, count));
      for (let i = 0; i < count; i++) {
        let enemy = enemies[Math.floor(Math.random() * enemies.length)];
        if (enemy.position) applyDamage(enemy, 2, caster);
      }
      console.log(`${caster.name} discarded ${count} cards, dealt ${count * 2} damage`);
    }
  } else if (card.character === 'Beast') {
    if (card.name === 'Quick Instincts') { // Response: handled in applyDamage
    } else if (card.name === 'Natures Wrath') { // Response: handled in endTurn
    } else if (card.name === 'Bear Tank') { // Response: handled in applyDamage
    } else if (card.name === 'Elk Restoration') {
      caster.tempEffects.thisTurn = { range: 3, elkRestoration: true };
      caster.range += 3;
      console.log(`${caster.name} gained +3 range with Elk Restoration`);
    } else if (card.name === 'Ape Smash') {
      caster.tempEffects.thisTurn = { power: 1, apeSmash: true };
      caster.power += 1;
      console.log(`${caster.name} gained +1 power with Ape Smash`);
    } else if (card.name === 'Natures Gift') {
      let deck = currentPlayer === 1 ? player1Deck : player2Deck;
      let hand = currentPlayer === 1 ? player1Cards : player2Cards;
      let bear = deck.find(c => c.name.includes('Bear'));
      let elk = deck.find(c => c.name.includes('Elk'));
      let ape = deck.find(c => c.name.includes('Ape'));
      [bear, elk, ape].forEach(c => {
        if (c) {
          hand.push(c);
          deck.splice(deck.indexOf(c), 1);
          console.log(`${caster.name} retrieved ${c.name}`);
        }
      });
    } else if (card.name === 'Natures Resilience') {
      friendlies.forEach(c => {
        c.tempEffects.untilNextTurn = { ...c.tempEffects.untilNextTurn, damageReduction: true };
      });
      console.log(`${caster.name} activated Nature's Resilience for all friendlies`);
    } else if (card.name === 'Versatility') {
      let stat = random(['power', 'range', 'movementSpeed']);
      caster.tempEffects.thisTurn = { [stat]: 3 };
      caster[stat] += 3;
      console.log(`${caster.name} gained +3 ${stat}`);
    } else if (card.name === 'Bear Intimidation') {
      let [cx, cy] = caster.position;
      let targets = getAOETargets(cx, cy, enemies);
      targets.forEach(t => {
        let moves = getValidMoves(t);
        if (moves.length > 0) t.position = moves[0];
      });
      console.log(`${caster.name} intimidated ${targets.length} enemies`);
    } else if (card.name === 'Ape Slam' && target) {
      applyDamage(target, 3, caster);
      target.tempEffects.untilNextTurn = { canMove: false, canAttack: false };
      console.log(`${caster.name} slammed ${target.name}`);
    } else if (card.name === 'Elk Infusion') {
      friendlies.forEach(c => c.life = min(c.life + 3, 20));
      console.log(`${caster.name} restored 3 health to all friendlies`);
    }
  } else if (card.character === 'Redeemer') {
    if (card.name === 'Fast Heal' && target) {
      target.life = min(target.life + 2, 20);
      console.log(`${caster.name} healed ${target.name} for 2`);
    } else if (card.name === 'Power Shield') { // Response: handled in applyDamage
    } else if (card.name === 'Inspire' && target) {
      target.tempEffects.thisTurn = { power: 1, range: 1, movement: 1 };
      target.power += 1;
      target.range += 1;
      target.movementSpeed += 1;
      console.log(`${caster.name} inspired ${target.name}`);
    } else if (card.name === 'Calming' && target) {
      target.tempEffects.untilNextTurn = { canCast: false, canAttack: false };
      console.log(`${caster.name} calmed ${target.name}`);
    } else if (card.name === 'Light Speed') {
      friendlies.forEach(c => {
        c.tempEffects.thisTurn = { movement: 3 };
        c.movementSpeed += 3;
      });
      console.log(`${caster.name} granted +3 movement to all friendlies`);
    } else if (card.name === 'Spirit Strike' && target) {
      applyDamage(target, 2, caster);
      caster.life = min(caster.life + 2, 20);
      console.log(`${caster.name} struck ${target.name} and healed`);
    } else if (card.name === 'Light Bomb' && target) {
      let [tx, ty] = target;
      let hits = getAOETargets(tx, ty);
      hits.forEach(h => {
        let [dx, dy] = getDirectionToWall(caster, h);
        let [nx, ny] = pushUntilWall(h, dx, dy);
        h.position = [nx, ny];
      });
      console.log(`${caster.name} knocked back ${hits.length} champions`);
    } else if (card.name === 'Restoration' && target) {
      target.life = min(target.life + 4, 20);
      console.log(`${caster.name} restored 4 health to ${target.name}`);
    } else if (card.name === 'Refocus') {
      let discard = currentPlayer === 1 ? player1Discard : player2Discard;
      let hand = currentPlayer === 1 ? player1Cards : player2Cards;
      let oppDiscard = currentPlayer === 1 ? player2Discard : player1Discard;
      let oppHand = currentPlayer === 1 ? player2Cards : player1Cards;
      let toRetrieve = discard.splice(0, min(2, discard.length));
      let oppRetrieve = oppDiscard.splice(0, min(2, oppDiscard.length));
      hand.push(...toRetrieve);
      oppHand.push(...oppRetrieve);
      console.log(`${caster.name} refocused, retrieving ${toRetrieve.length} cards`);
    } else if (card.name === 'Spirit Wall') {
      // Implementation requires turn-start targeting; simplified here
      console.log(`${caster.name} cast Spirit Wall (simplified)`);
    } else if (card.name === 'Meditation') {
      caster.hasMoved = true;
      let deck = currentPlayer === 1 ? player1Deck : player2Deck;
      let hand = currentPlayer === 1 ? player1Cards : player2Cards;
      let cardToRetrieve = deck.find(c => c.character === 'Redeemer');
      if (cardToRetrieve) {
        hand.push(cardToRetrieve);
        deck.splice(deck.indexOf(cardToRetrieve), 1);
        console.log(`${caster.name} retrieved ${cardToRetrieve.name}`);
      }
    } else if (card.name === 'Resurrection') {
      // Simplified: requires dead champion tracking
      let deck = currentPlayer === 1 ? player1Deck : player2Deck;
      let hand = currentPlayer === 1 ? player1Cards : player2Cards;
      hand.push(...deck.splice(0, 2));
      console.log(`${caster.name} drew 2 cards (Resurrection simplified)`);
    }
  } else if (card.character === 'Confessor') {
    if (card.name === 'Denial') {
      let opponent = currentPlayer === 1 ? player2Champions : player1Champions;
      opponent.forEach(c => c.tempEffects.thisTurn = { canCast: false });
      let deck = currentPlayer === 1 ? player1Deck : player2Deck;
      let hand = currentPlayer === 1 ? player1Cards : player2Cards;
      if (deck.length > 0) hand.push(deck.shift());
      console.log(`${caster.name} denied opponent casting and drew a card`);
    } else if (card.name === 'Secret Revealed') {
      let oppHand = currentPlayer === 1 ? player2Cards : player1Cards;
      if (oppHand.length > 0) {
        let revealed = oppHand[Math.floor(Math.random() * oppHand.length)];
        let targetChamp = enemies.find(c => c.name === revealed.character);
        if (targetChamp) applyDamage(targetChamp, 2, caster);
        console.log(`${caster.name} revealed ${revealed.name}, dealt 2 damage`);
      }
    } else if (card.name === 'Introspection') {
      let deck = currentPlayer === 1 ? player1Deck : player2Deck;
      let hand = currentPlayer === 1 ? player1Cards : player2Cards;
      let discard = currentPlayer === 1 ? player1Discard : player2Discard;
      hand.push(...deck.splice(0, 2));
      discard.push(...hand.splice(0, 2));
      console.log(`${caster.name} drew and discarded 2 cards`);
    } else if (card.name === 'Hypocrite') { // Response: handled in draw
    } else if (card.name === 'Blasphemy' && target) {
      applyDamage(target, 2, caster);
      card.canCastFromDiscard = true;
      console.log(`${caster.name} cast Blasphemy on ${target.name}`);
    } else if (card.name === 'Betrayal' && target) {
      let moves = getValidMoves(target);
      if (moves.length > 0) target.position = moves[0];
      let range = getValidRange(target);
      let hit = friendlies.find(f => range.some(([x, y]) => f.position && f.position[0] === x && f.position[1] === y));
      if (hit) applyDamage(hit, target.power, target);
      console.log(`${caster.name} betrayed ${target.name}`);
    } else if (card.name === 'Life Payment') {
      let oppHand = currentPlayer === 1 ? player2Cards : player1Cards;
      caster.life = min(caster.life + oppHand.length, 20);
      console.log(`${caster.name} restored ${oppHand.length} health`);
    } else if (card.name === 'Atone') {
      friendlies.forEach(c => c.life = min(c.life + 3, 20));
      distributeDamageRandomly(enemies, 3);
      card.canCastFromDiscard = true;
      console.log(`${caster.name} cast Atone`);
    } else if (card.name === 'Conspire') {
      let oppDiscard = currentPlayer === 1 ? player2Discard : player1Discard;
      let options = oppDiscard.filter(c => c.cost <= 1);
      if (options.length > 0) {
        let toCast = options[Math.floor(Math.random() * options.length)];
        castCard(toCast, caster);
        oppDiscard.splice(oppDiscard.indexOf(toCast), 1);
        console.log(`${caster.name} conspired to cast ${toCast.name}`);
      }
    } else if (card.name === 'Self-Hate') { // Response: handled in applyDamage
    } else if (card.name === 'Evil Within') {
      let deck = currentPlayer === 1 ? player1Deck : player2Deck;
      let hand = currentPlayer === 1 ? player1Cards : player2Cards;
      let discard = currentPlayer === 1 ? player1Discard : player2Discard;
      let confessorCards = deck.filter(c => c.character === 'Confessor').slice(0, 2);
      hand.push(...confessorCards);
      confessorCards.forEach(c => deck.splice(deck.indexOf(c), 1));
      if (hand.length > 1) discard.push(hand.shift());
      console.log(`${caster.name} retrieved ${confessorCards.length} cards`);
    }
  } else if (card.character === 'Barbarian') {
    if (card.name === 'Pursuit') {
      let x = min(player1Mana, 5); // Simplified X value
      caster.tempEffects.thisTurn = { movement: x };
      caster.movementSpeed += x;
      caster.life -= x;
      console.log(`${caster.name} gained ${x} movement, lost ${x} life`);
    } else if (card.name === 'Blood Shield') {
      caster.tempEffects.thisTurn = { untouchable: true };
      console.log(`${caster.name} is untouchable this turn`);
    } else if (card.name === 'Whirlwind') {
      let [cx, cy] = caster.position;
      let targets = getAOETargets(cx, cy, enemies);
      targets.forEach(t => applyDamage(t, caster.power, caster));
      console.log(`${caster.name} hit ${targets.length} enemies with Whirlwind`);
    } else if (card.name === 'Over Confident') {
      let damaged = allChamps.filter(c => c.damageTakenThisTurn > 0).length;
      let deck = currentPlayer === 1 ? player1Deck : player2Deck;
      let hand = currentPlayer === 1 ? player1Cards : player2Cards;
      hand.push(...deck.splice(0, damaged));
      console.log(`${caster.name} drew ${damaged} cards`);
    } else if (card.name === 'Fearless Strike') {
      caster.hasAttacked = false;
      let hand = currentPlayer === 1 ? player1Cards : player2Cards;
      let discard = currentPlayer === 1 ? player1Discard : player2Discard;
      if (hand.length > 1) discard.push(hand.shift());
      console.log(`${caster.name} gained extra attack`);
    } else if (card.name === 'Critical Strike') {
      caster.tempEffects.thisTurn = { critical: true };
      console.log(`${caster.name} next attack may deal double damage`);
    } else if (card.name === 'Refuel') {
      caster.tempEffects.thisTurn = { refuel: true };
      console.log(`${caster.name} will heal at turn end`);
    } else if (card.name === 'Head Smash' && target) {
      let adj = findAdjacentEmpty(target.position);
      if (adj) {
        caster.position = adj;
        applyDamage(target, 3, caster);
        console.log(`${caster.name} head smashed ${target.name}`);
      }
    } else if (card.name === 'Dodge') { // Response: handled in applyDamage
    } else if (card.name === 'Cheat Death') {
      caster.tempEffects.thisTurn = { cheatDeath: true };
      console.log(`${caster.name} cannot die this turn`);
    } else if (card.name === 'Hamstrung' && target) {
      target.tempEffects.untilNextTurn = { canMove: false };
      console.log(`${caster.name} hamstrung ${target.name}`);
    }
  } else if (card.character === 'Burglar') {
    if (card.name === 'Pick Pocket') {
      let oppMana = currentPlayer === 1 ? player2Mana : player1Mana;
      if (oppMana > 0) {
        oppMana--;
        player1Mana += currentPlayer === 1 ? 1 : 0;
        player2Mana += currentPlayer === 2 ? 1 : 0;
        console.log(`${caster.name} stole 1 mana`);
      }
    } else if (card.name === 'Quick Advantage') {
      caster.tempEffects.thisTurn = { unlimitedMovement: true };
      caster.hasAttacked = true;
      console.log(`${caster.name} gained unlimited movement`);
    } else if (card.name === 'Surprise Attack') {
      let moves = getValidMoves(caster);
      if (moves.length > 0) caster.position = moves[0];
      caster.hasAttacked = false;
      console.log(`${caster.name} surprise attacked`);
    } else if (card.name === 'Distract' && target) {
      let los = getLOSPositions(caster);
      let newPos = los.find(([x, y]) => !isOccupied(x, y) && gameBoard[y][x] === 'empty');
      if (newPos) target.position = newPos;
      console.log(`${caster.name} distracted ${target.name}`);
    } else if (card.name === 'Blinded' && target) {
      if (random([true, false])) {
        target.tempEffects.untilNextTurn = { canAttack: false };
        console.log(`${caster.name} blinded ${target.name}`);
      }
    } else if (card.name === 'Vanish') { // Response: handled in applyDamage
    } else if (card.name === 'Quick Hit' && target) {
      applyDamage(target, 3, caster);
      if (random([true, false])) {
        let hand = currentPlayer === 1 ? player1Cards : player2Cards;
        hand.push(card);
      }
      console.log(`${caster.name} quick hit ${target.name}`);
    } else if (card.name === 'Safe House') {
      if (!enemies.some(e => isInRange(e, caster))) {
        caster.life = min(caster.life + 6, 20);
        console.log(`${caster.name} healed 6 in Safe House`);
      }
    } else if (card.name === 'Jackpot') {
      player1Mana += currentPlayer === 1 ? 3 : 0;
      player2Mana += currentPlayer === 2 ? 3 : 0;
      console.log(`${caster.name} gained 3 mana`);
    } else if (card.name === 'Breaking and Entering') {
      allChamps.forEach(c => {
        if (c.equipped) {
          let discard = c === player1Champions.includes(c) ? player1Discard : player2Discard;
          discard.push(c.equipped);
          c.equipped = null;
        }
      });
      shuffleArray(player1Discard);
      shuffleArray(player2Discard);
      player1Deck.push(...player1Discard);
      player2Deck.push(...player2Discard);
      player1Discard = [];
      player2Discard = [];
      console.log(`${caster.name} broke and entered`);
    } else if (card.name === 'From the Shadows') {
      enemies.filter(e => isInRange(caster, e)).forEach(e => applyDamage(e, 3, caster));
      console.log(`${caster.name} struck from the shadows`);
    } else if (card.name === 'Disguise' && target) {
      caster.power = target.power;
      caster.range = target.range;
      caster.movementSpeed = target.movementSpeed;
      let oppDiscard = currentPlayer === 1 ? player2Discard : player1Discard;
      let toCast = oppDiscard.find(c => c.character === target.name);
      if (toCast) {
        castCard(toCast, caster);
        oppDiscard.splice(oppDiscard.indexOf(toCast), 1);
      }
      console.log(`${caster.name} disguised as ${target.name}`);
    }
  } else if (card.character === 'Berserker') {
    if (card.name === 'Enrage') {
      caster.tempEffects.thisTurn = { power: 2 };
      caster.power += 2;
      caster.life -= 3;
      console.log(`${caster.name} enraged`);
    } else if (card.name === 'Agility') {
      caster.tempEffects.thisTurn = { agility: true };
      console.log(`${caster.name} gained agility`);
    } else if (card.name === 'Commanding Shout' && target) {
      target.tempEffects.untilNextTurn = { canAttack: false };
      caster.life--;
      console.log(`${caster.name} shouted at ${target.name}`);
    } else if (card.name === 'Bloodthirsty') { // Response: handled in healing
    } else if (card.name === 'Second Wind') {
      if (caster.damageTakenThisTurn > 4) {
        caster.life = min(caster.life + caster.damageTakenThisTurn, 20);
        console.log(`${caster.name} healed ${caster.damageTakenThisTurn}`);
      }
    } else if (card.name === 'Throwing Axe' && target) {
      caster.tempEffects.thisTurn = { power: -3, range: 3 };
      caster.power -= 3;
      caster.range += 3;
      target.tempEffects.untilNextTurn = { canMove: false };
      caster.hasAttacked = true;
      console.log(`${caster.name} threw axe at ${target.name}`);
    } else if (card.name === 'Dual Wield') {
      if (random([true, false])) caster.hasAttacked = false;
      console.log(`${caster.name} dual wielded`);
    } else if (card.name === 'Last Stand' && target) {
      let hand = currentPlayer === 1 ? player1Cards : player2Cards;
      let damage = hand.length === 1 ? 4 : 2;
      applyDamage(target, damage, caster);
      console.log(`${caster.name} last stood against ${target.name}`);
    } else if (card.name === 'Spell Punish') { // Response: handled in applyDamage
    } else if (card.name === 'Battlecry') {
      let hand = currentPlayer === 1 ? player1Cards : player2Cards;
      let discard = currentPlayer === 1 ? player1Discard : player2Discard;
      let count = hand.length - 1;
      discard.push(...hand.splice(0, count));
      for (let i = 0; i < count; i++) {
        let roll = Math.floor(Math.random() * 6) + 1;
        let stat = roll <= 2 ? 'range' : roll <= 4 ? 'power' : 'movementSpeed';
        caster.tempEffects.thisTurn = { ...caster.tempEffects.thisTurn, [stat]: (caster.tempEffects.thisTurn[stat] || 0) + 1 };
        caster[stat]++;
      }
      console.log(`${caster.name} battlecried, discarded ${count} cards`);
    } else if (card.name === 'Mutually Assured Destruction' && target) {
      applyDamage(target, 5, caster);
      applyDamage(caster, 5, caster);
      caster.tempEffects.noHeal = true;
      console.log(`${caster.name} mutually destroyed ${target.name}`);
    }
  } else if (card.character === 'Shaman') {
    if (card.name === 'Cloud Shift') {
      let discard = currentPlayer === 1 ? player1Discard : player2Discard;
      let hand = currentPlayer === 1 ? player1Cards : player2Cards;
      let options = discard.filter(c => c.character === 'Shaman' && c.cost <= 1);
      if (options.length > 0) {
        let cardToRetrieve = options[Math.floor(Math.random() * options.length)];
        hand.push(cardToRetrieve);
        discard.splice(discard.indexOf(cardToRetrieve), 1);
        console.log(`${caster.name} shifted ${cardToRetrieve.name}`);
      }
    } else if (card.name === 'Lightning Strike' && target) {
      applyDamage(target, 2, caster);
      console.log(`${caster.name} struck ${target.name}`);
    } else if (card.name === 'Spirit Link' && target) {
      let secondTarget = friendlies.find(c => c !== target && c.position);
      if (secondTarget) {
        let transfer = min(5, target.life - 1);
        target.life -= transfer;
        secondTarget.life = min(secondTarget.life + transfer, 20);
        console.log(`${caster.name} linked ${target.name} to ${secondTarget.name}`);
      }
    } else if (card.name === 'Revitalize') {
      let deck = currentPlayer === 1 ? player1Deck : player2Deck;
      let hand = currentPlayer === 1 ? player1Cards : player2Cards;
      hand.push(...deck.splice(0, 2));
      console.log(`${caster.name} revitalized`);
    } else if (card.name === 'Vortex Shield' && target) {
      target.tempEffects.untilNextTurn = { immune: true };
      console.log(`${caster.name} shielded ${target.name}`);
    } else if (card.name === 'Elemental Storm' && target) {
      let [tx, ty] = target;
      let hits = getAOETargets(tx, ty);
      hits.forEach(h => applyDamage(h, caster.power, caster));
      console.log(`${caster.name} stormed ${hits.length} champions`);
    } else if (card.name === 'Healing Rain' && target) {
      let [tx, ty] = target;
      let hits = getAOETargets(tx, ty);
      hits.forEach(h => h.life = min(h.life + 3, 20));
      console.log(`${caster.name} healed ${hits.length} champions`);
    } else if (card.name === 'Thunderous Wrath') {
      let enemy = enemies[Math.floor(Math.random() * enemies.length)];
      if (enemy.position) applyDamage(enemy, 3, caster);
      console.log(`${caster.name} wrath hit ${enemy.name}`);
    } else if (card.name === 'Static Shock') {
      let targets = allChamps.filter(c => isInRange(caster, c));
      targets.forEach(t => applyDamage(t, random([1, 2]), caster));
      console.log(`${caster.name} shocked ${targets.length} champions`);
    } else if (card.name === 'Super Charged' && target) {
      target.tempEffects.thisTurn = { unlimitedRange: true, unlimitedMovement: true };
      console.log(`${caster.name} super charged ${target.name}`);
    } else if (card.name === 'Elemental Fury') {
      let deck = currentPlayer === 1 ? player1Deck : player2Deck;
      let hand = currentPlayer === 1 ? player1Cards : player2Cards;
      let discard = currentPlayer === 1 ? player1Discard : player2Discard;
      discard.push(...hand.splice(0, hand.length - 1));
      let options = deck.filter(c => c.cost <= 1).slice(0, 3);
      hand.push(...options);
      options.forEach(c => deck.splice(deck.indexOf(c), 1));
      caster.hasAttacked = true;
      console.log(`${caster.name} unleashed fury`);
    }
  } else if (card.character === 'Illusionist') {
    if (card.name === 'Pick a Card…') {
      let discard = currentPlayer === 1 ? player1Discard : player2Discard;
      let hand = currentPlayer === 1 ? player1Cards : player2Cards;
      if (discard.length > 0) {
        let cardToRetrieve = discard[Math.floor(Math.random() * discard.length)];
        hand.push(cardToRetrieve);
        discard.splice(discard.indexOf(cardToRetrieve), 1);
        console.log(`${caster.name} picked ${cardToRetrieve.name}`);
      }
    } else if (card.name === 'Now You See Me') { // Response: handled in applyDamage
    } else if (card.name === 'Intel') {
      let deck = currentPlayer === 1 ? player1Deck : player2Deck;
      let oppDeck = currentPlayer === 1 ? player2Deck : player1Deck;
      if (deck.length > 0) console.log(`Top of P${currentPlayer} deck: ${deck[0].name}`);
      if (oppDeck.length > 0) console.log(`Top of P${currentPlayer === 1 ? 2 : 1} deck: ${oppDeck[0].name}`);
      // Simplified: no top/bottom choice
    } else if (card.name === 'Gamble') {
      let manaGain = 0;
      while (random([true, false])) {
        manaGain++;
        player1Mana += currentPlayer === 1 ? 1 : 0;
        player2Mana += currentPlayer === 2 ? 1 : 0;
      }
      console.log(`${caster.name} gambled and gained ${manaGain} mana`);
    } else if (card.name === 'Guess Again') {
      let x = min(player1Mana, 5); // Simplified X
      enemies.forEach(c => c.tempEffects.untilNextTurn = { maxCastCost: x });
      console.log(`${caster.name} limited casting to ${x} or less`);
    } else if (card.name === 'Reshuffle') {
      let x = min(player1Mana, 5); // Simplified X
      let deck = currentPlayer === 1 ? player1Deck : player2Deck;
      let hand = currentPlayer === 1 ? player1Cards : player2Cards;
      hand.push(...deck.splice(0, x));
      console.log(`${caster.name} drew ${x} cards`);
    } else if (card.name === 'Confuse') { // Response: not fully implemented
    } else if (card.name === 'Grand Finale') {
      let hand = currentPlayer === 1 ? player1Cards : player2Cards;
      caster.tempEffects.thisTurn = { power: hand.length };
      caster.power = hand.length;
      console.log(`${caster.name} power set to ${hand.length}`);
    } else if (card.name === 'House Odds') {
      let roll = Math.floor(Math.random() * 11) + 2;
      if (roll <= 4) {
        applyDamage(caster, 4, caster);
      } else if (roll <= 10) {
        let enemy = enemies[Math.floor(Math.random() * enemies.length)];
        if (enemy.position) applyDamage(enemy, 4, caster);
      } else {
        enemies.forEach(e => applyDamage(e, 4, caster));
      }
      console.log(`${caster.name} rolled ${roll}`);
    } else if (card.name === 'Unlimited Chances') { // Response: handled in applyDamage
    }
  } else if (card.character === 'DarkWizard') {
    if (card.name === 'Lifetap') {
      let deck = currentPlayer === 1 ? player1Deck : player2Deck;
      let hand = currentPlayer === 1 ? player1Cards : player2Cards;
      if (deck.length > 0) hand.push(deck.shift());
      caster.life--;
      console.log(`${caster.name} lifetapped`);
    } else if (card.name === 'Pit of Despair') { // Response: handled in movement
    } else if (card.name === 'Mana Burn') {
      let x = min(player1Mana, 5); // Simplified X
      let oppMana = currentPlayer === 1 ? player2Mana : player1Mana;
      oppMana = max(0, oppMana - x);
      console.log(`${caster.name} burned ${x} opponent mana`);
    } else if (card.name === 'Black Hole' && target) {
      let [tx, ty] = target;
      let hits = getAOETargets(tx, ty);
      let totalDamage = hits.length;
      hits.forEach(h => applyDamage(h, 1, caster));
      caster.life = min(caster.life + totalDamage, 20);
      console.log(`${caster.name} black holed ${totalDamage} damage`);
    } else if (card.name === 'No Pain, No Gain') {
      caster.life -= 2;
      caster.hasAttacked = false;
      console.log(`${caster.name} gained extra attack`);
    } else if (card.name === 'Hypnotize' && target) {
      target.tempEffects.untilNextTurn = { immune: true, hypnotized: true };
      console.log(`${caster.name} hypnotized ${target.name}`);
    } else if (card.name === 'Shadow Bolt' && target) {
      applyDamage(target, caster.power, caster);
      console.log(`${caster.name} shadow bolted ${target.name}`);
    } else if (card.name === 'Underworld Terror') {
      enemies.forEach(c => c.tempEffects.untilNextTurn = { powerLocked: true });
      console.log(`${caster.name} terrorized enemies`);
    } else if (card.name === 'Evil Tricks') {
      // Simplified: deal 2 damage to random enemy
      let enemy = enemies[Math.floor(Math.random() * enemies.length)];
      if (enemy.position) applyDamage(enemy, 2, caster);
      console.log(`${caster.name} used evil tricks`);
    } else if (card.name === 'Life Force') {
      let hand = currentPlayer === 1 ? player1Cards : player2Cards;
      let discard = currentPlayer === 1 ? player1Discard : player2Discard;
      let count = hand.length - 1;
      discard.push(...hand.splice(0, count));
      caster.life = min(caster.life + count * 2, 20);
      console.log(`${caster.name} restored ${count * 2} life`);
    } else if (card.name === 'Telekinesis') {
      let discard = currentPlayer === 1 ? player1Discard : player2Discard;
      let hand = currentPlayer === 1 ? player1Cards : player2Cards;
      let options = discard.filter(c => c.cost <= 3).slice(0, 3);
      hand.push(...options);
      options.forEach(c => discard.splice(discard.indexOf(c), 1));
      console.log(`${caster.name} telekinesised ${options.length} cards`);
    } else if (card.name === 'Shadow Burst' && target) {
      let discard = currentPlayer === 1 ? player1Discard : player2Discard;
      let deck = currentPlayer === 1 ? player1Deck : player2Deck;
      applyDamage(target, discard.length, caster);
      deck.push(...discard);
      shuffleArray(deck);
      discard.length = 0;
      console.log(`${caster.name} burst ${target.name} for ${discard.length}`);
    }
  } else if (card.character === 'Alchemist') {
    if (card.name === 'Stealth Flask' && target) {
      target.tempEffects.untilNextTurn = { stealth: true };
      console.log(`${caster.name} stealthed ${target.name}`);
    } else if (card.name === 'Agility Flask' && target) {
      let boost = caster.equipped && caster.equipped.name === 'Dragon’s Tail' ? 1 : 0;
      target.tempEffects.thisTurn = { range: 2 + boost, movement: 2 + boost };
      target.range += 2 + boost;
      target.movementSpeed += 2 + boost;
      console.log(`${caster.name} boosted ${target.name} agility`);
    } else if (card.name === 'Might Flask' && target) {
      let boost = caster.equipped && caster.equipped.name === 'Dragon’s Tail' ? 1 : 0;
      target.tempEffects.thisTurn = { power: 2 + boost };
      target.power += 2 + boost;
      console.log(`${caster.name} boosted ${target.name} might`);
    } else if (card.name === 'Rejuvenation Flask' && target) {
      target.life = min(target.life + 4, 20);
      console.log(`${caster.name} rejuvenated ${target.name}`);
    } else if (card.name === 'Superior Flask' && target) {
      let boost = caster.equipped && caster.equipped.name === 'Dragon’s Tail' ? 1 : 0;
      target.tempEffects.thisTurn = { power: 1 + boost, range: 1 + boost, movement: 1 + boost };
      target.power += 1 + boost;
      target.range += 1 + boost;
      target.movementSpeed += 1 + boost;
      console.log(`${caster.name} superior boosted ${target.name}`);
    } else if (card.name === 'Acid Bomb' && target) {
      let [tx, ty] = target;
      let hits = getAOETargets(tx, ty);
      hits.forEach(h => applyDamage(h, 2, caster));
      console.log(`${caster.name} acid bombed ${hits.length} champions`);
    } else if (card.name === 'Smoke Bomb') { // Response: handled in applyDamage
    } else if (card.name === 'Preparation') {
      let discard = currentPlayer === 1 ? player1Discard : player2Discard;
      let hand = currentPlayer === 1 ? player1Cards : player2Cards;
      let flasks = discard.filter(c => c.name.includes('Flask')).slice(0, 2);
      hand.push(...flasks);
      flasks.forEach(c => discard.splice(discard.indexOf(c), 1));
      console.log(`${caster.name} prepared ${flasks.length} flasks`);
    } else if (card.name === 'Spectre’s Essence') {
      caster.tempEffects.thisTurn = { spectreEssence: true };
      console.log(`${caster.name} activated Spectre’s Essence`);
    } else if (card.name === 'Time Warp Flask') {
      let allDiscard = player1Discard.concat(player2Discard);
      shuffleArray(allDiscard);
      player1Deck.push(...allDiscard.filter(c => player1Characters.includes(c.character)));
      player2Deck.push(...allDiscard.filter(c => player2Characters.includes(c.character)));
      player1Discard = [];
      player2Discard = [];
      player1Cards = player1Deck.splice(0, 5);
      player2Cards = player2Deck.splice(0, 5);
      console.log(`${caster.name} warped time`);
    }
  }
}

// Helper Functions for Card Mechanics
function applyDamage(target, amount, source) {
  target.damageTakenThisTurn = (target.damageTakenThisTurn || 0) + amount;
  let actualDamage = amount;

  // Check responses
  let responses = (currentPlayer === 1 ? player2Cards : player1Cards).filter(c => c.type === 'Response');
  let opponentPlayer = currentPlayer === 1 ? 2 : 1;
  for (let card of responses) {
    if (target.tempEffects.damageReduction) {
      actualDamage = 1;
      console.log(`${target.name} protected by Nature's Resilience, damage reduced to 1`);
    } else if (card.name === 'Oblivious' && target.name === 'Brute') {
      actualDamage = 1;
      break;
    } else if (card.name === 'Quick Instincts' && target.name === 'Beast') {
      target.tempEffects.thisTurn = { movement: 2 };
      target.movementSpeed += 2;
      let moves = getValidMoves(target);
      if (moves.length > 0) target.position = moves[0];
    } else if (card.name === 'Bear Tank' && source.name !== 'Beast') {
      let beast = friendlies.find(c => c.name === 'Beast');
      if (beast && isInLOS(beast, target)) {
        let adj = findAdjacentEmpty(target.position);
        if (adj) {
          beast.position = adj;
          beast.life -= 1;
          actualDamage = 0;
          break;
        }
      }
    } else if (card.name === 'Power Shield' && target.tempEffects.shield) {
      actualDamage = max(0, actualDamage - 2);
      delete target.tempEffects.shield;
    } else if (card.name === 'Self-Hate' && target.name === 'Confessor') {
      applyDamage(source, amount, target);
      actualDamage = 0;
      break;
    } else if (card.name === 'Dodge' && target.name === 'Barbarian') {
      let moves = getValidMoves(target);
      if (moves.length > 0) target.position = moves[0];
    } else if (card.name === 'Vanish' && target.name === 'Burglar') {
      let safePos = findSafePosition(target);
      if (safePos) target.position = safePos;
      actualDamage = 0;
      break;
    } else if (card.name === 'Now You See Me' && target.name === 'Illusionist' && random([true, false])) {
      actualDamage = 0;
    } else if (card.name === 'Unlimited Chances' && target.name === 'Illusionist' && random([true, false])) {
      actualDamage = 0;
      let hand = opponentPlayer === 1 ? player1Cards : player2Cards;
      hand.push(card);
    } else if (card.name === 'Spell Punish' && target.name === 'Berserker' && source !== target) {
      let adj = findAdjacentEmpty(source.position);
      if (adj) target.position = adj;
    } else if (card.name === 'Smoke Bomb') {
      friendlies.forEach(c => {
        let moves = getValidMoves(c);
        if (moves.length > 0) c.position = moves[0];
      });
    }
  }

  if (target.tempEffects.damageReduction) actualDamage = 1;
  if (target.tempEffects.stealth && !targetingPosition) actualDamage = 0;
  if (target.tempEffects.cheatDeath && target.life - actualDamage < 1) target.life = 1;
  else target.life = max(0, target.life - actualDamage);

  if (target.tempEffects.leech && source.tempEffects.leech) {
    source.life = min(source.life + 1, 20);
  }
  if (source.tempEffects.critical && random([true, false])) {
    target.life = max(0, target.life - actualDamage);
  }
  if (source.tempEffects.elkRestoration) {
    friendlies.forEach(c => c.life = min(c.life + 2, 20));
  }
  if (source.tempEffects.apeSmash) {
    enemies.filter(e => e !== target && isInRange(source, e)).forEach(e => applyDamage(e, 1, source));
  }
  if (target.equipped && target.equipped.name === 'Intimidation' && target.equipped.charges > 0) {
    applyDamage(source, actualDamage, target);
    target.equipped.charges--;
    if (target.equipped.charges === 0) target.equipped = null;
  }
  if (source.tempEffects.spectreEssence && random([true, false])) {
    enemies.forEach(e => applyDamage(e, 1, source));
  }

  checkResponseTriggers('damage', opponentPlayer, { target, amount: actualDamage, source });
}

function checkResponseTriggers(trigger, player, data) {
  let cards = player === 1 ? player1Cards : player2Cards;
  let responses = cards.filter(c => c.type === 'Response');
  for (let card of responses) {
    if (trigger === 'damage' && card.name === 'Tantrum' && data.target.name === 'Brute') {
      originalPlayer = currentPlayer;
      currentPlayer = player;
      responseState = { player, trigger: 'damage', data };
    } else if (trigger === 'draw' && card.name === 'Hypocrite') {
      let deck = player === 1 ? player1Deck : player2Deck;
      let hand = player === 1 ? player1Cards : player2Cards;
      hand.push(...deck.splice(0, data.count));
    } else if (trigger === 'heal' && card.name === 'Bloodthirsty') {
      applyDamage(data.target, 2, data.source);
    }
  }
}

function isInRange(champ1, champ2) {
  let range = getValidRange(champ1);
  return range.some(([x, y]) => champ2.position && champ2.position[0] === x && champ2.position[1] === y);
}

function findEmptyPositionOverWall(caster, target, direction) {
  let [cx, cy] = caster.position;
  let [tx, ty] = target.position;
  let dx = direction ? direction[0] : Math.sign(tx - cx);
  let dy = direction ? direction[1] : Math.sign(ty - cy);
  let x = tx + dx;
  let y = ty + dy;
  while (x >= 0 && x < gridSize && y >= 0 && y < gridSize) {
    if (gameBoard[y][x] === 'wall') {
      x += dx;
      y += dy;
      if (x >= 0 && x < gridSize && y >= 0 && y < gridSize && gameBoard[y][x] === 'empty' && !isOccupied(x, y)) {
        return [x, y];
      }
      break;
    }
    x += dx;
    y += dy;
  }
  return [null, null];
}

function getDirectionToWall(caster, target) {
  let [cx, cy] = caster.position;
  let [tx, ty] = target.position;
  let dx = Math.sign(tx - cx);
  let dy = Math.sign(ty - cy);
  return [dx || 1, dy || 0];
}

function pushUntilWall(target, dx, dy) {
  let [tx, ty] = target.position;
  while (tx + dx >= 0 && tx + dx < gridSize && ty + dy >= 0 && ty + dy < gridSize && gameBoard[ty + dy][tx + dx] !== 'wall') {
    tx += dx;
    ty += dy;
  }
  return [tx, ty];
}

function getAOETargets(x, y, champs = player1Champions.concat(player2Champions)) {
  let targets = [];
  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {
      let tx = x + j;
      let ty = y + i;
      if (tx >= 0 && tx < gridSize && ty >= 0 && ty < gridSize) {
        let champ = champs.find(c => c.position && c.position[0] === tx && c.position[1] === ty);
        if (champ) targets.push(champ);
      }
    }
  }
  return targets;
}

function distributeDamageRandomly(targets, totalDamage) {
  for (let i = 0; i < totalDamage; i++) {
    let target = targets[Math.floor(Math.random() * targets.length)];
    if (target.position) applyDamage(target, 1, null);
  }
}

function findAdjacentEmpty(pos) {
  let [x, y] = pos;
  let directions = [[0, 1], [0, -1], [1, 0], [-1, 0]];
  for (let [dx, dy] of directions) {
    let tx = x + dx;
    let ty = y + dy;
    if (tx >= 0 && tx < gridSize && ty >= 0 && ty < gridSize && gameBoard[ty][tx] === 'empty' && !isOccupied(tx, ty)) {
      return [tx, ty];
    }
  }
  return null;
}

function getLOSPositions(champ) {
  let [cx, cy] = champ.position;
  let positions = [];
  let directions = [[0, 1], [0, -1], [1, 0], [-1, 0]];
  for (let [dx, dy] of directions) {
    for (let i = 1; i < gridSize; i++) {
      let tx = cx + dx * i;
      let ty = cy + dy * i;
      if (tx < 0 || tx >= gridSize || ty < 0 || ty >= gridSize || gameBoard[ty][tx] === 'wall') break;
      positions.push([tx, ty]);
    }
  }
  return positions;
}

function isInLOS(champ1, champ2) {
  let los = getLOSPositions(champ1);
  return los.some(([x, y]) => champ2.position && champ2.position[0] === x && champ2.position[1] === y);
}

function findSafePosition(champ) {
  let enemies = currentPlayer === 1 ? player2Champions : player1Champions;
  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
      if (gameBoard[y][x] === 'empty' && !isOccupied(x, y) && !enemies.some(e => isInRange(e, { position: [x, y] }))) {
        return [x, y];
      }
    }
  }
  return null;
}

// Champion class definition
class Champion {
  constructor(name, position, movementSpeed, power, range, life) {
    this.name = name; // Champion name
    this.position = position; // [x, y] grid position
    this.movementSpeed = movementSpeed; // Max move distance
    this.power = power; // Attack damage
    this.range = range; // Attack range
    this.life = life; // Current health
    this.hasMoved = false; // Turn movement flag
    this.hasAttacked = false; // Turn attack flag
    this.hasCast = false; // Turn cast flag (unused currently)
    this.equipped = null; // Currently equipped equipment card
    this.tempEffects = {}; // Temporary buffs/debuffs
    this.damageTakenThisTurn = 0; // Track damage for cards like Second Wind
  }
}

// Shuffles an array using Fisher-Yates algorithm
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}