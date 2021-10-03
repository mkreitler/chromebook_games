// Tales of Ymskir object:
toy = {};

jb.program = {
  fontName: "VT323-Regular",
  largeFontName: "UncialAntiqua-Regular",
  WIDTH: 1024,
  HEIGHT: 768,
  fontMain: null,
  fontLarge: null,
  floorsAndWalls: {image: null},
  decorations: {image: null},
  backdrop: {image: null},
  TILE_SIZE: 24,
  BACKDROP_TILE_WIDTH: 40,
  BACKDROP_TILE_HEIGHT: 56,
  FONT_SIZE: 48,
  FONT_SIZE_LARGE: 120,
  splash: {},
  
  loadResources: function() {
    jb.resize(this.WIDTH, this.HEIGHT);
    jb.setBackColor("block");
    this.fontMain = resources.loadFont(this.fontName, "../Shared", "ttf");
    this.fontLarge = resources.loadFont(this.largeFontName, "../Shared", "ttf");
    toy.sprites.chars.image = resources.loadImage("oryx_16bit_fantasy_creatures_trans.png", "../Shared/fantasy_art/");
    this.floorsAndWalls.image = resources.loadImage("floorsAndWalls_24x24_trans.png", "../Shared/fantasy_art/");
    this.decorations.image = resources.loadImage("decorations_interior_24x24_trans.png", "../Shared/fantasy_art/");
    this.backdrop.image = resources.loadImage("oryx_16bit_background_trans.png", "../Shared/fantasy_art/");
  },
  
  do_waitForResources: function() {
    var x = jb.canvas.width / 20;
    var y = jb.canvas.height / 2 - jb.canvas.height / 20;
    var width = jb.canvas.width * 18 / 20;
    var height = jb.canvas.height / 10;
    
    jb.ctxt.strokeStyle = "white";
    jb.ctxt.lineWidth = 1;
    jb.ctxt.fillStyle = "white"
    jb.ctxt.fillRect(x, y, width, height);
    
    jb.ctxt.strokeStyle = "green";
    jb.ctxt.fillStyle = "green";
    jb.ctxt.fillRect(x, y, width * resources.getLoadProgress(), height);
    jb.while(resources.getLoadProgress() < 1.0);
  },
  
  setup: function() {
    jb.setAntiAliasing(false);
    toy.sprites.init();
    toy.sprites.makeSplashSprites();
    toy.sprites.addSplashSprites();
    toy.scenes.init(this.floorsAndWalls.image, this.decorations.image, this.backdrop.image, toy.sprites.chars.image);

    this.choices = ["New Game", "Continue", "Credits"];
    this.choice = 0;
    toy.menu.init(this.fontMain, this.WIDTH / 2, this.HEIGHT * 3 / 5, null, this.choices, 0, "white", "gray", this.FONT_SIZE);

    jb.ctxt.fillStyle = "black";
  },
  
  do_showSplashPage: function() {
    jb.clear();

    jb.setOpenTypeFont(this.fontLarge, this.FONT_SIZE);
    jb.drawOpenTypeFontAt(jb.ctxt, "Tales of", this.WIDTH / 2, this.HEIGHT / 4, "yellow", "yellow", 0.5, 1.0);
    jb.setOpenTypeFont(this.fontLarge, this.FONT_SIZE_LARGE);
    jb.drawOpenTypeFontAt(jb.ctxt, "Yskmir", this.WIDTH / 2, 2 * this.HEIGHT / 5, "white", "white", 0.5, 1.0);

    toy.sprites.update(jb.ctxt);

    this.choice = toy.menu.update();
  
    jb.while(this.choice < 0);
  },
  
  checkPlayerChoice: function() {
    switch (this.choices[this.choice]) {
      case "New Game": {
        toy.sprites.removeSplashSprites();
        jb.goto("charCreate");
        break;
      }
      
      case "Continue": {
        console.log("Continue");
        break;
      }
      
      case "Credits": {
        console.log("Credits");
        break;
      }
    }
  },
};

