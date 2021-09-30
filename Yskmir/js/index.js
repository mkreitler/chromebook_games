// Tales of Ymskir object:
toy = {};

jb.program = {
  fontName: "VT323-Regular",
  largeFontName: "UncialAntiqua-Regular",
  WIDTH: 1024,
  HEIGHT: 768,
  fontMain: null,
  fontLarge: null,
  chars: {image: null, sheet: null},
  inside: {image: null},
  backdrop: {image: null},
  TILE_SIZE: 24,
  FONT_SIZE: 48,
  FONT_SIZE_LARGE: 120,
  splash: {},
  
  loadResources: function() {
    jb.resize(this.WIDTH, this.HEIGHT);
    jb.setBackColor("block");
    this.fontMain = resources.loadFont(this.fontName, "../Shared", "ttf");
    this.fontLarge = resources.loadFont(this.largeFontName, "../Shared", "ttf");
    this.chars.image = resources.loadImage("oryx_16bit_fantasy_creatures_trans.png", "../Shared/fantasy_art/");
    this.inside.image = resources.loadImage("oryx_16bit_fantasy_world_trans.png", "../Shared/fantasy_art/");
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
    this.chars.sheet = jb.sprites.addSheet("characters", this.chars.image, 0, 0, this.TILE_SIZE, this.TILE_SIZE);
    blueprints.draft("DemoChar", {}, {});
    blueprints.make("DemoChar", "sprite");
    this.splash.charLeft = blueprints.build("DemoChar");
    this.splash.charRight = blueprints.build("DemoChar");

    var chars = [this.splash.charLeft, this.splash.charRight];
    chars.forEach( function(char) {
      var idleState = jb.sprites.createState([0, 1], 0.33);
      char.spriteSetSheet("characters");
      char.spriteAddState("idle", idleState);
      char.spriteSetAnchor(0.5, 0.0);
      char.spriteSetState("idle");
    });
    
    this.splash.charLeft.spriteMoveTo(this.WIDTH / 4, this.HEIGHT * 3 / 5);
    this.splash.charRight.spriteMoveTo(this.WIDTH * 3 / 4, this.HEIGHT * 3 / 5);
    this.splash.charLeft.spriteSetScale(-4, 4);
    this.splash.charRight.spriteSetScale(4, 4);
    
    this.choices = ["New Game", "Continue", "Credits"];
    this.choice = 0;
    toy.menu.init(this.fontMain, this.WIDTH / 2, this.HEIGHT * 3 / 5, null, this.choices, 0, "white", "gray", this.FONT_SIZE);
  },
  
  do_showSplashPage: function() {
    jb.ctxt.fillStyle = "black";
    jb.clear();
    jb.setOpenTypeFont(this.fontLarge, this.FONT_SIZE);
    jb.drawOpenTypeFontAt(jb.ctxt, "Tales of", this.WIDTH / 2, this.HEIGHT / 4, "yellow", "yellow", 0.5, 1.0);
    jb.setOpenTypeFont(this.fontLarge, this.FONT_SIZE_LARGE);
    jb.drawOpenTypeFontAt(jb.ctxt, "Yskmir", this.WIDTH / 2, 2 * this.HEIGHT / 5, "white", "white", 0.5, 1.0);
    this.splash.charLeft.spriteUpdate();
    this.splash.charRight.spriteUpdate();
    this.splash.charLeft.spriteDraw();
    this.splash.charRight.spriteDraw();

    this.choice = toy.menu.update();
  
    jb.while(this.choice < 0);
  },
  
  checkPlayerChoice: function() {
    switch (this.choices[this.choice]) {
      case "New Game": {
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

