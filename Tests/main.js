jb.program = {
  WIDTH: 1024,
  HEIGHT: 768,
  PHOTO_LAYER_ROWS: 3,
  fontName: "VT323-Regular",
  largeFontName: "UncialAntiqua-Regular",
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
    
    jb.listenForTap();
    
    jb.resumeAfter("testBackground");
  },
  
  do_waitForTap: function() {
    jb.while(!jb.tap.done);
  },
  
  terminate: function() {
    jb.end();
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
    
    jb.end();
  },

  testBackground: function() {
    const backTexture = PIXI.RenderTexture.create(
      this.pixiApp.screen.width,
      this.pixiApp.screen.height,
    );    

    const gfx = new PIXI.Graphics();

    gfx.beginFill(0x335577);
    gfx.drawRect(0, 0, 300, 300);
    gfx.endFill();
    gfx.x = 150;
    gfx.y = 150;

    this.pixiApp.renderer.render(gfx, {backTexture});

    this.backSprite = new PIXI.Sprite(backTexture);
    this.backSprite.x = 150;
    this.backSprite.y = 150;
    this.pixiApp.stage.addChild(this.backSprite);

    jb.end();
  },
  
  createBackground: function() {
    if (this.backSprite) {
      this.pixiApp.stage.removeChild(this.backSprite);
      this.backSprite = null;
    }

    const backTexture = PIXI.RenderTexture.create(
      this.pixiApp.screen.width,
      this.pixiApp.screen.height,
    );    

    // Clear background.
    const rectGfx = new PIXI.Graphics();
    rectGfx.x = 0;
    rectGfx.y = 0;
    rectGfx.width = this.pixiApp.renderer.width;
    rectGfx.height = this.pixiApp.renderer.height;
    rectGfx.beginFill(0x000000);
    rectGfx.drawRect(0, 0, rectGfx.width, rectGfx.height);
    rectGfx.closePath();
    this.pixiApp.renderer.render(rectGfx, {backTexture});
    
    // Draw depths.
    const gradientGfx = new PIXI.Graphics();
    gradientGfx.width = this.pixiApp.renderer.width;
    gradientGfx.height = this.playField.height;
    gradientGfx.x = 0;
    gradientGfx.y = this.pixiApp.renderer.height - this.playField.height;
    for (var i=0; i<this.playField.height; ++i) {
      var gradColor = Math.floor(0x000088 * (1.0 - i / this.PHOTO_LAYER_ROWS * this.TILE_SIZE * this.gameScale));
      gradColor = Math.max(i, 0x000000);
      gradientGfx.lineStyle(gradColor);
      gradientGfx.moveTo(0, i);
      gradientGfx.lineTo(gradientGfx.width, i);
    }
    gradientGfx.closePath();
    this.pixiApp.renderer.render(gradientGfx, {backTexture});

    // Draw sky.
    rectGfx.height = this.pixiApp.renderer.height - this.playField.height;
    rectGfx.beginFill(0x49d8f6);
    rectGfx.drawRect(0, 0, rectGfx.width, rectGfx.height);
    this.pixiApp.renderer.render(rectGfx, {backTexture});

    // Draw seaweed.
    const seaweedSprite = this.getSprite("seaweed");
    seaweedSprite.anchor.x = 0;
    seaweedSprite.anchor.y = 0;

    var left = this.playField.left - this.TILE_SIZE * this.gameScale;
    var right = this.playField.left + this.playField.width;
    var top = this.playField.top;
    for (var iRow=0; iRow<this.gameSize.rows; ++iRow) {
      while (left > -this.TILE_SIZE * this.gameScale) {
        seaweedSprite.alpha = 1.0 - iRow / this.gameSize.rows;
        seaweedSprite.x = left;
        seaweedSprite.y = top;
        this.pixiApp.renderer.render(seaweedSprite, {backTexture});

        seaweedSprite.x = right;
        this.pixiApp.renderer.render(seaweedSprite, {backTexture});

        left -= this.TILE_SIZE * this.gameScale;
        right += this.TILE_SIZE * this.gameScale;
        top += this.TILE_SIZE * this.gameScale;
      }
    }

    seaweedSprite.alpha = 1;

    // Draw ship.
    const ship = this.getSprite("ship");
    ship.anchor.x = 0.5;
    ship.anchor.y = 1.0;
    ship.x = Math.floor(this.pixiApp.renderer.width / 2);
    ship.y = this.playField.top;
    this.pixiApp.renderer.render(ship, {backTexture});

    this.backSprite = new PIXI.Sprite(backTexture);
    this.pixiApp.stage.addChild(this.backSprite);
    
    jb.end();
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
    
    jb.end();
  }
};
