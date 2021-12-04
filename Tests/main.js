const BathGame = function() {
  this.IMAGE_PATH = "art";
  this.IMAGE_TYPE = "png";
  this.TILE_SIZE = 32;
  this.PHOTO_LAYER_ROWS = 4;
  this.COLOR_WATER = 0x0000FF;
  this.COLOR_SKY = 0x49c0ff;
  this.SEAWEED_FADE_POWER = 0.4;
  this.WATERLINE = 8;
  this.CHEST_ALPHA = 0.33;
  this.MIN_MINE_ROW = 2;
  this.MOVE_VERTICAL_BIAS = 1; // The higher this value, the more likely the path to the chest will be straight up/down
  this.SPEED = 2;
  this.MOVE_PERIOD = 20;
  this.MIN_PLAYER_ALPHA = 0.2;
  this.PLAYER_FADE_POWER = 2.0;

  this.gameSize = {rows: 20, cols: 11};
  this.gameScale = 1;
  this.playField = {top: 0, left: 0, width: 0, height: 0};
  this.backTexture = null;
  this.backSprite = null;
  this.imageInfo = [
    {name: "mine_black", url: null, onComplete: this.onImageLoaded},
    {name: "ship", url: null, onComplete: this.onImageLoaded},
    {name: "seaweed", url: null, onComplete: this.onImageLoaded},
    {name: "chest", url: null, onComplete: this.onImageLoaded},
    {name: "bubble", url: null, onComplete: this.onImageLoaded},
    {name: "bathy", url: null, onComplete: this.onImageLoaded},
    {name: "lights", url: null, onComplete: this.onImageLoaded},
  ];
  this.imagesLoaded = 0;
  this.sprites = {};
  this.level = 0;
  this.numLevels = 20;
  this.minMines = Math.round(this.gameSize.rows * this.gameSize.cols * 0.2);
  this.maxMines = Math.round(this.gameSize.rows * this.gameSize.cols * 0.8);
  this.mines = [];
  this.mineLocations = [];
  this.player = null;
  this.lights = null;
  this.chest = null;
  this.bubbles = null;
  this.from = {x: 0, y: 0},
  this.to = {x: 0, y: 0},
  this.moveParam;
  this.fsm = null;
  this.states = {};
  this.activeState = null;
  
  this.sprites = {};
};

BathGame.prototype.run = function() {
  this.loadImages();
};

BathGame.prototype.loadImages = function() {
  this.imageInfo.forEach((info) => {
    info.url = this.IMAGE_PATH + "/" + info.name + "." + this.IMAGE_TYPE;
  });

  PIXI.Loader.shared
  .add(this.imageInfo)
  .load(this.onImagesLoaded);
};

// Update =====================================================================
BathGame.prototype.update = function(dt) {

};

BathGame.prototype.startMove = function() {
  this.moveParam = 0.0;
};

BathGame.prototype.updateMove = function(dt) {
  var moveIsDone = false;

  this.moveParam += dt;
  this.moveParam = Math.min(this.moveParam, this.MOVE_PERIOD);
  var param = Math.sin(this.moveParam * Math.PI / 2 / this.MOVE_PERIOD);

  if (param > 0.99) param = 1.0;

  var newX = this.to.x * param + this.from.x * (1.0 - param);
  this.player.x = newX;
  
  var newY = this.to.y * param + this.from.y * (1.0 - param);
  this.player.y = newY;

  this.lights.x = this.player.x;
  this.lights.y = this.player.y;

  this.player.alpha = this.getPlayerAlpha();

  moveIsDone = param === 1.0;
  
  if (moveIsDone) {
    this.setState("waitForMove");
  }
};

// ============================================================================
// State Input Handlers
BathGame.prototype.waitingForKeyDown = function(code) {
  if (!jem.keyHandler.isDown(code)) {
    switch(code) {
      case "left": {
        this.moveLeft();
        break;
      }

      case "right": {
        this.moveRight();
        break;
      }

      case "up": {
        this.moveUp();
        break;
      }

      case "down": {
        this.moveDown();
        break;
      }

      case "space": {
        this.sonarPing();
        break;
      }

      default: {
        // Nothing to do here.
      }
    }
  }
};

// ============================================================================
BathGame.prototype.setState = function(stateName) {
  this.activeState = this.fsm.setState(stateName);
};

BathGame.prototype.onImagesLoaded = function() {
  // TODO: timeout if image load fails?
  game.setup();
};

BathGame.prototype.getPlayerAlpha = function() {
  const depthParam = (this.player.y - this.playField.top) / this.playField.height;
  return Math.max(this.MIN_PLAYER_ALPHA, 1.0 - Math.log(depthParam + 1) * this.PLAYER_FADE_POWER);
};

BathGame.prototype.moveLeft = function() {
  var newX = this.player.x;
  newX -= this.TILE_SIZE * this.gameScale;
  newX = Math.max(newX, this.playField.left);

  if (newX != this.player.x) {
    this.from.y = this.to.y = this.player.y;
    this.from.x = this.player.x;
    this.to.x = newX;
    this.setState("doMove");
  }
};

BathGame.prototype.moveRight = function() {
  var newX = this.player.x;
  newX += this.TILE_SIZE * this.gameScale;
  newX = Math.min(newX, this.playField.right - this.TILE_SIZE * this.gameScale);

  if (newX != this.player.x) {
    this.from.y = this.to.y = this.player.y;
    this.from.x = this.player.x;
    this.to.x = newX;
    this.setState("doMove");
  }
};

BathGame.prototype.moveUp = function() {
  var newY = this.player.y;
  newY -= this.TILE_SIZE * this.gameScale;
  newY = Math.max(newY, this.playField.top);

  if (newY != this.player.y) {
    this.from.x = this.to.x = this.player.x;
    this.from.y = this.player.y;
    this.to.y = newY;
    this.setState("doMove");
  }
};

BathGame.prototype.moveDown = function() {
  var newY = this.player.y;
  newY += this.TILE_SIZE * this.gameScale;
  newY = Math.min(newY, this.playField.bottom - this.TILE_SIZE * this.gameScale);

  if (newY != this.player.y) {
    this.from.x = this.to.x = this.player.x;
    this.to.y = newY;
    this.from.y = this.player.y;
    this.setState("doMove");
  }
};

BathGame.prototype.sonarPing = function() {
  // TODO: add this.
};

BathGame.prototype.setup = function() {
  this.imageInfo.forEach((info) => {
    this.sprites[info.name] = new PIXI.Sprite(PIXI.Loader.shared.resources[info.name].texture);
  });

  jem.keyHandler.addListener(this);

  this.computePlayFieldSize();
  this.createBackground();

  this.createChest();
  this.createMines();
  this.createPlayer();

  this.fsm = jem.FSM.create(this);
  this.states["waitForMove"] = this.fsm.createState("waitForMove");
  this.states["doMove"] = this.fsm.createState("doMove", this.startMove, this.updateMove);

  this.states["waitForMove"].onKeyDown = this.waitingForKeyDown.bind(this);

  this.level = 1;
  this.startLevel();
};

BathGame.prototype.createMines = function() {
  for (var i=0; i<this.maxMines; ++i) {
    const mine = new PIXI.Sprite(this.getSprite("mine_black").texture);
    mine.width *= this.gameScale;
    mine.height *= this.gameScale;
    this.mines.push(mine);
  }
};

BathGame.prototype.createPlayer = function() {
  this.player = new PIXI.Sprite(this.getSprite("bathy").texture);
  this.lights = new PIXI.Sprite(this.getSprite("lights").texture);
  this.player.width *= this.gameScale;
  this.player.height *= this.gameScale;
};

BathGame.prototype.createChest = function() {
  this.chest = new PIXI.Sprite(this.getSprite("chest").texture);
  this.chest.width *= this.gameScale;
  this.chest.height *= this.gameScale;
};

BathGame.prototype.startLevel = function() {
  this.placeChest();
  this.resetPlayer();
  this.placeMines();

  this.setState("waitForMove");
};

BathGame.prototype.placeChest = function() {
  const chestColumn = Math.floor(Math.random() * this.gameSize.cols);
  this.chest.y = this.yFromRow(this.gameSize.rows - 1);
  this.chest.x = this.xFromColumn(chestColumn);
  this.chest.alpha = this.CHEST_ALPHA;

  jem.pixi.stage.addChild(this.chest);
};

BathGame.prototype.resetPlayer = function() {
  this.player.x = this.playField.left + Math.floor(this.gameSize.cols / 2) * this.TILE_SIZE * this.gameScale;
  this.player.y = this.playField.top;
  this.lights.x = this.player.x;
  this.lights.y = this.player.y;
  this.player.alpha = this.getPlayerAlpha();
  this.lights.alpha = 1;

  jem.pixi.stage.addChild(this.player);
  jem.pixi.stage.addChild(this.lights);
};

BathGame.prototype.placeMines = function() {
  this.mineLocations.length = 0;

  // First, build a list of all possible positions.
  const allPositions = []
  for (var iRow=this.MIN_MINE_ROW; iRow<this.gameSize.rows; ++iRow) {
    for (var iCol=0; iCol<this.gameSize.cols; ++iCol) {
      allPositions.push(iRow * this.gameSize.cols + iCol);
    }
  }

  // Next, prevent a mine from being placed on the chest.
  var posVal = this.rowFromY(this.chest.y) * this.gameSize.cols + this.columnFromX(this.chest.x);
  var valIndex = allPositions.indexOf(posVal);
  jem.utils.removeElementAtIndex(allPositions, valIndex);

  // Next, build a path from the chest back up to the surface.
  var currentRow = this.gameSize.rows - 1;
  var currentCol = this.columnFromX(this.chest.x);

  while (currentRow > this.MIN_MINE_ROW) {
    const oldRow = currentRow;
    const oldCol = currentCol;

    switch (Math.floor(Math.random() * (this.MOVE_VERTICAL_BIAS + 2))) {
      case 0:
          // Move left.
          currentCol -= 1;
          currentCol = Math.max(0, currentCol);
        break;

      case 1:
          // Move right.
          currentCol += 1;
          currentCol = Math.min(this.gameSize.cols - 1, currentCol);
        break;

      default:
        // Move up.
        currentRow -= 1;
    }

    if (currentRow != oldRow || currentCol != oldCol) {
      posVal = currentRow * this.gameSize.cols + currentCol;
      valIndex = allPositions.indexOf(posVal);
      jem.utils.removeElementAtIndex(allPositions, valIndex);
    }
  }

  // Finally, place mines using the remaining positions.
  var numMines = this.getMineCount();
  numMines = Math.min(numMines, allPositions.length);

  var mineIndex = 0;
  while (numMines > 0) {
    const posIndex = Math.floor(Math.random() * allPositions.length);
    const row = Math.floor(allPositions[posIndex] / this.gameSize.cols);
    const col = allPositions[posIndex] - row * this.gameSize.cols;
    const mine = this.mines[mineIndex];

    mine.x = this.xFromColumn(col) + this.TILE_SIZE / 2 * this.gameScale - mine.width / 2;
    mine.y = this.yFromRow(row) + this.TILE_SIZE / 2 * this.gameScale - mine.height / 2;
    jem.pixi.stage.addChild(mine);

    numMines -= 1;
    mineIndex += 1;
  }
};

BathGame.prototype.rowFromY = function(y) {
  return Math.floor((y - this.playField.top) / (this.TILE_SIZE * this.gameScale));
};

BathGame.prototype.yFromRow = function(row) {
  return Math.floor(this.playField.top + this.TILE_SIZE * this.gameScale * row);
};

BathGame.prototype.columnFromX = function(x) {
  return Math.floor((x - this.playField.left) / (this.TILE_SIZE * this.gameScale));
};

BathGame.prototype.xFromColumn = function(col) {
  return Math.floor(this.playField.left + this.TILE_SIZE * this.gameScale * col);
};

BathGame.prototype.getMineCount = function() {
  const effectiveLevel = Math.min(this.level, this.numLevels);
  const p = (effectiveLevel - 1) / (this.numLevels - 1);
  return Math.round(this.minMines + (this.maxMines - this.minMines) * p);
};

BathGame.prototype.getSprite = function(name) {
  return this.sprites[name];
}

BathGame.prototype.computePlayFieldSize = function() {
  // The game wants a 16x9 portrait playField.
  const pixPerRow = jem.height() / this.gameSize.rows;
  const pixPerCol = jem.width() / this.gameSize.cols;
  const pixSize = Math.min(pixPerRow, pixPerCol);
  this.gameScale = Math.floor(pixSize / this.TILE_SIZE);
  this.gameScale = Math.max(1, this.gameScale);

  this.playField.width = this.gameScale * this.TILE_SIZE * this.gameSize.cols;
  this.playField.height = this.gameScale * this.TILE_SIZE * this.gameSize.rows;

  while (this.playField.height > jem.height()) {
    this.gameScale /= 2;
    this.playField.width = this.gameScale * this.TILE_SIZE * this.gameSize.cols;
    this.playField.height = this.gameScale * this.TILE_SIZE * this.gameSize.rows;
  }

  this.playField.left = Math.floor((jem.width() - this.playField.width) / 2);
  this.playField.top = jem.height() - this.playField.height;
  this.playField.right = this.playField.left + this.playField.width;
  this.playField.bottom = this.playField.top + this.playField.height;
};
  
BathGame.prototype.createBackground = function() {
  if (this.backSprite) {
    jem.pixi.stage.removeChild(this.backSprite);
    this.backSprite = null;
  }

  this.backTexture = PIXI.RenderTexture.create(
    jem.pixi.screen.width,
    jem.pixi.screen.height,
  );
  this.backSprite = new PIXI.Sprite(this.backTexture);

  const backContainer = new PIXI.Container();

  // Clear background.
  const rectGfx = new PIXI.Graphics();
  rectGfx.x = 0;
  rectGfx.y = 0;
  rectGfx.beginFill(0x000000);
  rectGfx.drawRect(0, 0, jem.pixi.screen.width, jem.pixi.screen.height);
  backContainer.addChild(rectGfx);

  // Draw sky.
  const skyGfx = new PIXI.Graphics();
  var y0 = jem.pixi.screen.height - this.playField.height;
  const dy = y0;
  for (var i=y0; i>=0; --i) {
    const fadeFactor = Math.log(i + 1) / Math.log(dy + 1);
    skyGfx.lineStyle(1, this.COLOR_SKY, fadeFactor);
    skyGfx.moveTo(0, i);
    skyGfx.lineTo(jem.pixi.screen.width + this.playField.width, i);
  }
  backContainer.addChild(skyGfx);
  
  // Draw ship.
  const ship = this.getSprite("ship");
  ship.width *= this.gameScale;
  ship.height *= this.gameScale;
  ship.anchor.x = 0.5;
  ship.anchor.y = 1.0;
  ship.x = Math.floor(jem.width() / 2);
  ship.y = this.playField.top + this.WATERLINE * this.gameScale;
  backContainer.addChild(ship);

  // Draw depths.
  const gradientGfx = new PIXI.Graphics();
  y0 = jem.pixi.screen.height - this.playField.height;
  const numLines = this.PHOTO_LAYER_ROWS * this.TILE_SIZE * this.gameScale;

  for (var i=0; i<numLines; ++i) {
    var gradColor = Math.floor(this.COLOR_WATER * (1.0 - i / numLines));
    gradColor = Math.max(gradColor, 0x000000);
    gradientGfx.lineStyle(1, gradColor, 0.67);
    // gradientGfx.moveTo(0, y0 + i);
    // gradientGfx.lineTo(jem.pixi.screen.width + this.playField.width, y0 + i);
    gradientGfx.moveTo(this.playField.left, y0 + i);
    gradientGfx.lineTo(this.playField.left + this.playField.width, y0 + i);
  }
  backContainer.addChild(gradientGfx);

  // Draw seaweed.
  const sourceSprite = this.getSprite("seaweed");
  sourceSprite.width *= this.gameScale;
  sourceSprite.height *= this.gameScale;

  var top = this.playField.top;
  for (var iRow=0; iRow<this.gameSize.rows; ++iRow) {
    var left = this.playField.left - this.TILE_SIZE * this.gameScale;
    var right = this.playField.left + this.playField.width;
    while (left > -this.TILE_SIZE * this.gameScale) {
      var cloneSprite = new PIXI.Sprite(sourceSprite.texture);
      cloneSprite.width *= this.gameScale;
      cloneSprite.height *= this.gameScale;
      cloneSprite.x = left;
      cloneSprite.y = top;
      backContainer.addChild(cloneSprite);

      cloneSprite = new PIXI.Sprite(sourceSprite.texture);
      cloneSprite.width *= this.gameScale;
      cloneSprite.height *= this.gameScale;
      cloneSprite.x = right;
      cloneSprite.y = top;
      backContainer.addChild(cloneSprite);

      left -= this.TILE_SIZE * this.gameScale;
      right += this.TILE_SIZE * this.gameScale;
    }

    const fadeGfx = new PIXI.Graphics();
    const localTop = this.playField.top + iRow * this.TILE_SIZE * this.gameScale;
    for (var i=0; i<this.TILE_SIZE * this.gameScale; ++i) {
      fadeGfx.lineStyle(1, 0x000000, Math.min(1, Math.log(iRow + i / (this.TILE_SIZE * this.gameScale) + 1) * this.SEAWEED_FADE_POWER));
      fadeGfx.moveTo(0, localTop + i);
      fadeGfx.lineTo(this.playField.left, localTop + i);
      fadeGfx.moveTo(this.playField.right, localTop + i);
      fadeGfx.lineTo(jem.width(), localTop + i);
    }
    backContainer.addChild(fadeGfx);
    
  top += this.TILE_SIZE * this.gameScale;
  }

  jem.pixi.renderer.render(backContainer, this.backTexture);
  jem.pixi.stage.addChild(this.backSprite);
};

// Listener Interfaces ========================================================
BathGame.prototype.onKeyDown = function(code) {
  if (this.activeState && this.activeState["onKeyDown"]) {
    this.activeState["onKeyDown"](code);
  }
};

BathGame.prototype.onKeyUp = function(code) {
};

BathGame.prototype.onKeyPress = function(code) {
};

// Don't need to implement onNewLine()
// ============================================================================
// Create the engine and the game.
var jem = JEM.create();
const game = new BathGame();
jem.start(game);
