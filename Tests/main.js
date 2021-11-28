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

  this.gameSize = {rows: 20, cols: 11};
  this.gameScale = 1;
  this.playField = {top: 0, left: 0, width: 0, height: 0};
  this.backTexture = null;
  this.backSprite = null;
  this.imageInfo = [
    {name: "bathy", url: null, onComplete: this.onImageLoaded},
    {name: "mine_black", url: null, onComplete: this.onImageLoaded},
    {name: "ship", url: null, onComplete: this.onImageLoaded},
    {name: "seaweed", url: null, onComplete: this.onImageLoaded},
    {name: "lights", url: null, onComplete: this.onImageLoaded},
    {name: "chest", url: null, onComplete: this.onImageLoaded},
    {name: "bubble", url: null, onComplete: this.onImageLoaded},
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

  this.sprites = {};
  this.pixiApp = this.initPIXI();
  this.loadImages();
};

BathGame.prototype.initPIXI = function() {
  // Create a Pixi Application
  const app = new PIXI.Application({
    antialias: false,   // default: false
    resolution: 1       // default: 1
  });

  app.renderer.view.style.position = "absolute";
  app.renderer.view.style.display = "block";
  app.renderer.autoDensity = true;
  app.resizeTo = window;

  document.body.appendChild(app.view);

  return app;
};

BathGame.prototype.loadImages = function() {
  this.imageInfo.forEach((info) => {
    info.url = this.IMAGE_PATH + "/" + info.name + "." + this.IMAGE_TYPE;
  });

  PIXI.Loader.shared
  .add(this.imageInfo)
  .load(this.onImagesLoaded);
};

BathGame.prototype.onImagesLoaded = function() {
  // TODO: timeout if image load fails?
  game.setup();
};

BathGame.prototype.setup = function() {
  this.imageInfo.forEach((info) => {
    this.sprites[info.name] = new PIXI.Sprite(PIXI.Loader.shared.resources[info.name].texture);
  });

  this.computePlayFieldSize();
  this.createBackground();

  this.createChest();
  this.createMines();
  this.createPlayer();

  this.level = 1;
  this.startLevel();
  this.pixiApp.ticker.add((dt) => this.update(dt));
};

BathGame.prototype.createMines = function() {
  for (var i=0; i<this.maxMines; ++i) {
    this.mines.push(new PIXI.Sprite(this.getSprite("mine_black").texture));
  }
};

BathGame.prototype.createPlayer = function() {
  this.player = new PIXI.Sprite(this.getSprite("bathy").texture);
  this.lights = new PIXI.Sprite(this.getSprite("lights").texture);
  this.player.addChild(this.lights);
};

BathGame.prototype.createChest = function() {
  this.chest = new PIXI.Sprite(this.getSprite("chest").texture);
};

BathGame.prototype.startLevel = function() {
  this.placeChest();
  this.resetPlayer();
  this.placeMines();
};

BathGame.prototype.placeChest = function() {
  const chestColumn = Math.floor(Math.random() * this.gameSize.cols);
  this.chest.y = this.yFromRow(this.gameSize.rows - 1);
  this.chest.x = this.xFromColumn(chestColumn);
  this.chest.alpha = this.CHEST_ALPHA;

  this.pixiApp.stage.addChild(this.chest);
};

BathGame.prototype.resetPlayer = function() {
  this.player.alpha = 1;
  this.lights.alpha = 1;
  this.player.x = this.playField.left + Math.floor(this.gameSize.cols / 2) * this.TILE_SIZE * this.gameScale;
  this.player.y = this.playField.top;

  this.pixiApp.stage.addChild(this.player);
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
      const posVal = currentRow * this.gameSize.cols + currentCol;
      const valIndex = allPositions.indexOf(posVal);
      jem.Utils.removeElementAtIndex(allPositions, valIndex);
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

    mine.x = this.xFromColumn(col);
    mine.y = this.yFromRow(row);
    this.pixiApp.stage.addChild(mine);

    numMines -= 1;
    mineIndex += 1;
  }
};

BathGame.prototype.rowFromY = function(y) {
  return Math.floor((y - this.playField.top) / (this.TILE_SIZE * this.gameScale));
};

BathGame.prototype.yFromRow = function(row) {
  return this.playField.top + this.TILE_SIZE * this.gameScale * row;
};

BathGame.prototype.columnFromX = function(x) {
  return Math.floor((x - this.playField.left) / (this.TILE_SIZE * this.gameScale));
};

BathGame.prototype.xFromColumn = function(col) {
  return this.playField.left + this.TILE_SIZE * this.gameScale * col;
};

BathGame.prototype.getMineCount = function() {
  const effectiveLevel = Math.min(this.level, this.numLevels);
  const p = (effectiveLevel - 1) / (this.numLevels - 1);
  return Math.round(this.minMines + (this.maxMines - this.minMines) * p);
};

BathGame.prototype.update = function(dt) {
};

BathGame.prototype.width = function() {
  return this.pixiApp ? this.pixiApp.screen.width : window.innerWidth;
};

BathGame.prototype.height = function() {
  return this.pixiApp ? this.pixiApp.screen.height : window.innerHeight;
};

BathGame.prototype.getSprite = function(name) {
  var sprite = this.sprites[name];

  if (sprite) {
    if (sprite.width === sprite.texture.width) {
      sprite.width *= this.gameScale;
    }

    if (sprite.height === sprite.texture.height) {
      sprite.height *= this.gameScale;
    }
  }

  return sprite;
}

BathGame.prototype.computePlayFieldSize = function() {
  // The game wants a 16x9 portrait playField.
  const pixPerRow = this.pixiApp.renderer.height / this.gameSize.rows;
  const pixPerCol = this.pixiApp.renderer.width / this.gameSize.cols;
  const pixSize = Math.min(pixPerRow, pixPerCol);
  this.gameScale = Math.floor(pixSize / this.TILE_SIZE);
  this.gameScale = Math.max(1, this.gameScale);

  this.playField.width = this.gameScale * this.TILE_SIZE * this.gameSize.cols;
  this.playField.height = this.gameScale * this.TILE_SIZE * this.gameSize.rows;
  this.playField.left = Math.floor((this.pixiApp.renderer.width - this.playField.width) / 2);
  this.playField.top = this.pixiApp.renderer.height - this.playField.height;
};
  
BathGame.prototype.createBackground = function() {
  if (this.backSprite) {
    this.pixiApp.stage.removeChild(this.backSprite);
    this.backSprite = null;
  }

  this.backTexture = PIXI.RenderTexture.create(
    this.pixiApp.screen.width,
    this.pixiApp.screen.height,
  );    
  this.backSprite = new PIXI.Sprite(this.backTexture);

  const backContainer = new PIXI.Container();

  // Clear background.
  const rectGfx = new PIXI.Graphics();
  rectGfx.x = 0;
  rectGfx.y = 0;
  rectGfx.beginFill(0x000000);
  rectGfx.drawRect(0, 0, this.pixiApp.screen.width, this.pixiApp.screen.height);
  backContainer.addChild(rectGfx);

  // Draw sky.
  const skyGfx = new PIXI.Graphics();
  var y0 = this.pixiApp.screen.height - this.playField.height;
  const dy = y0;
  for (var i=y0; i>=0; --i) {
    const fadeFactor = Math.log(i + 1) / Math.log(dy + 1);
    skyGfx.lineStyle(1, this.COLOR_SKY, fadeFactor);
    skyGfx.moveTo(0, i);
    skyGfx.lineTo(this.pixiApp.screen.width + this.playField.width, i);
  }
  backContainer.addChild(skyGfx);
  
  // Draw ship.
  const ship = this.getSprite("ship");
  ship.anchor.x = 0.5;
  ship.anchor.y = 1.0;
  ship.x = Math.floor(this.pixiApp.renderer.width / 2);
  ship.y = this.playField.top + this.WATERLINE * this.gameScale;
  backContainer.addChild(ship);

  // Draw depths.
  const gradientGfx = new PIXI.Graphics();
  y0 = this.pixiApp.screen.height - this.playField.height;
  const numLines = this.PHOTO_LAYER_ROWS * this.TILE_SIZE * this.gameScale;

  for (var i=0; i<numLines; ++i) {
    var gradColor = Math.floor(this.COLOR_WATER * (1.0 - i / numLines));
    gradColor = Math.max(gradColor, 0x000000);
    gradientGfx.lineStyle(1, gradColor, 0.67);
    // gradientGfx.moveTo(0, y0 + i);
    // gradientGfx.lineTo(this.pixiApp.screen.width + this.playField.width, y0 + i);
    gradientGfx.moveTo(this.playField.left, y0 + i);
    gradientGfx.lineTo(this.playField.left + this.playField.width, y0 + i);
  }
  backContainer.addChild(gradientGfx);

  // Draw seaweed.
  const sourceSprite = this.getSprite("seaweed");

  var top = this.playField.top;
  for (var iRow=0; iRow<this.gameSize.rows; ++iRow) {
    var left = this.playField.left - this.TILE_SIZE * this.gameScale;
    var right = this.playField.left + this.playField.width;
    while (left > -this.TILE_SIZE * this.gameScale) {
      var cloneSprite = new PIXI.Sprite(sourceSprite.texture);
      cloneSprite.alpha = 1.0 - Math.log(iRow + 1) * this.SEAWEED_FADE_POWER;
      cloneSprite.x = left;
      cloneSprite.y = top;
      backContainer.addChild(cloneSprite);

      cloneSprite = new PIXI.Sprite(sourceSprite.texture);
      cloneSprite.alpha = 1.0 - Math.log(iRow + 1) * this.SEAWEED_FADE_POWER;
      cloneSprite.x = right;
      cloneSprite.y = top;
      backContainer.addChild(cloneSprite);

      left -= this.TILE_SIZE * this.gameScale;
      right += this.TILE_SIZE * this.gameScale;
    }
    top += this.TILE_SIZE * this.gameScale;
  }

  this.pixiApp.renderer.render(backContainer, this.backTexture);
  this.pixiApp.stage.addChild(this.backSprite);
};

// ============================================================================
const game = new BathGame();
