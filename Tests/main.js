jb.program = {
  fontName: "VT323-Regular",
  largeFontName: "UncialAntiqua-Regular",
  WIDTH: 1024,
  HEIGHT: 768,
  fontMain: null,
  fontLarge: null,
  oldWidth: 0,
  oldHeight: 0,
  
  start: function() {
    //Create a Pixi Application
    const app = new PIXI.Application({
        antialias: false,   // default: false
        resolution: 1       // default: 1
      }
    );
    
    app.renderer.view.style.position = "absolute";
    app.renderer.view.style.display = "block";
    app.renderer.autoDensity = true;
    app.resizeTo = window;
    
    //Add the canvas that Pixi automatically created for you to the HTML document
    document.body.appendChild(app.view);
    
    jb.setPixiRenderer(app.renderer);
  },

  loadResources: function() {
    jb.logToConsole("Loading resources...");
    jb.listenForTap();
  },
  
  
  do_waitForResources: function() {
    if (jb.pixiRenderer.height != jb.screen.height || jb.pixiRenderer.width != jb.screen.width) {
      jb.logToConsole(">>> Size Matters <<<");
    }

    jb.while(!jb.tap.done);
  },
  
  setup: function() {
    jb.logToConsole("Ready!");
  },
}