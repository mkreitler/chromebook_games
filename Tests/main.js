jb.program = {
  fontName: "VT323-Regular",
  largeFontName: "UncialAntiqua-Regular",
  WIDTH: 1024,
  HEIGHT: 768,
  fontMain: null,
  fontLarge: null,
  oldWidth: 0,
  oldHeight: 0,
  imageList: ["art/bathy.png", "art/mine_black.png", "art/ship.png", "art/seaweed.png"],
  imagesLoaded: 0,
  allImagesLoaded: false,
  sprites: {},
  pixiApp: null,
  gameSize: {rows: 20, cols: 11},
  gameScale: 1,
  TILE_SIZE: 32,
  playField: {top: 0, left: 0, width: 0, height: 0},
  viewport: {top: 0, left: 0, width: 0, height: 0},
  backSprite: null,
  
  start: function() {
    // Create a Pixi Application
    const app = new PIXI.Application({
        antialias: false,   // default: false
        resolution: 1       // default: 1
      }
    );

    app.renderer.view.style.position = "absolute";
    app.renderer.view.style.display = "block";
    app.renderer.autoDensity = true;
    app.resizeTo = window;

    this.pixiApp = app;
    
    // Add the canvas that Pixi automatically created for you to the HTML document
    document.body.appendChild(app.view);
    
    jb.setPixi(this.pixiApp);

    jb.resumeAfter("createHelpers");
  },

  initView: function() {
    jb.resumeAfter('computeViewportSize');
  },

  loadResources: function() {
    PIXI.Loader.shared
    .add(this.imageList)
    .load(function() {
      this.allImagesLoaded = true;
    }.bind(this));
  },
  
  do_waitForResources: function() {
    jb.while(!this.allImagesLoaded);
  },
  
  setup: function() {
    this.sprites["bathy"] = new PIXI.Sprite(PIXI.Loader.shared.resources[this.imageList[0]].texture);
    this.sprites["seaweed"] = new PIXI.Sprite(PIXI.Loader.shared.resources[this.imageList[0]].texture);
    // this.sprites["mine"] = new PIXI.Sprite(PIXI.Loader.shared.resources[this.imageList[1]].texture);
    this.sprites["ship"] = new PIXI.Sprite(PIXI.Loader.shared.resources[this.imageList[3]].texture);
  },

  // Subroutines ==============================================================
  computeViewportSize: function() {
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

    var canvas = document.createElement("canvas");
    canvas.width = this.pixiApp.renderer.width;
    canvas.height = this.pixiApp.renderer.height;
    const ctxt = canvas.getContext('2d');

    // Clear canvas.
    jb.clearCanvas(canvas, 'black');

    // Draw depths.
    jb.drawGradientRect(canvas, this.playField.left, this.playField.top, this.playField.width, this.playField.height, true, [{fraction: 0.0, color: "blue"}, {fraction: 0.167, color: "black"}, {fraction: 1.0, color: "black"}]);

    // Draw sky.
    ctxt.fillStyle = "#49d8f6"
    ctxt.fillRect(0, 0, this.pixiApp.renderer.width, this.playField.top);

    // Draw seaweed.
    const renderTexture = PIXI.RenderTexture.create({ width: this.TILE_WIDTH * this.gameScale, height: this.TILE_HEIGHT * this.gameScale });
    const seaweedSprite = this.getSprite("seaweed");
    this.pixiApp.renderer.render(seaweedSprite, {renderTexture});
    const seaweedImage = renderTexture.getDrawableSource();

    var left = this.playField.left - this.TILE_SIZE * this.gameScale;
    var right = this.playField.left + this.playField.width;
    var top = this.playField.top;
    for (var iRow=0; iRow<this.gameSize.rows; ++iRow) {
      while (left > -this.TILE_SIZE * this.gameScale) {
        ctxt.globalAlpha = 1.0 - iRow / this.gameSize.rows;
        ctxt.drawImage(seaweedImage, left, top);
        ctxt.drawImage(seaweedImage, right, top);

        left -= this.TILE_SIZE * this.gameScale;
        right += this.TILE_SIZE * this.gameScale;
        top += this.TILE_SIZE * this.gameScale;
      }
    }

    ctxt.globalAlpha = 1;
 
    this.backSprite = jb.pixiSpriteFromCanvas(canvas);
    this.pixiApp.stage.addChild(this.backSprite);

    // Draw ship.
    const ship = tihs.getSprite("ship");
    ship.anchor.x = 0.5;
    ship.anchor.y = 1.0;
    ship.x = Math.floor(this.pixiApp.renderer.width / 2);
    ship.y = this.playField.top;
    this.pixiApp.stage.addChild(ship);
  },

  createHelpers: function() {
    jb.program.getSprite = function(spriteName) {
      var sprite = null;

      if (this.sprites[spriteName]) {
        sprite = this.sprites[spriteName];
        sprite.width = this.TILE_SIZE * this.gameScale;
        sprite.height = this.TILE_SIZE * this.gameScale;
      }

      return sprite;
    }
  }
};
