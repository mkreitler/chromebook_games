const JEM = function() {
  this.assertRenderer = null;
  this.newTickers = [];
  this.tickers = [];
  this.expiredTickers = [];
  
  this.FSM = null;
  this.switchboard = null;
  this.game = null;

  return this;
};

JEM.create = function() {
    const jem = new JEM();

    return jem;
};

JEM.prototype.start = function(game) {
  this.assert(game["run"], "Game is missing 'run' method!");
  this.assert(game["update"], "Game is missing 'update' method!");

  jem.utils = JEM.Utils;
  jem.keyHandler = JEM.KeyHandler;

  this.FSM = new JEM.FsmManager();
  this.switchboard = new JEM.Switchboard();
  this.pixi = this.initPixi();

  this.game = game;
  this.game.run();
};

JEM.prototype.stop = function() {
    this.game = null;
};

JEM.prototype.reset = function(doStop) {
  this.FSM.clear();
  this.switchboard.clear();
  this.clearTickers();

  if (doStop) {
      this.stop();
  }
};

JEM.prototype.initPixi = function() {
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
  
  app.ticker.add((dt) => this.tick(dt));
  
  return app;
};

JEM.prototype.width = function() {
  return this.pixi ? this.pixi.screen.width : window.innerWidth;
};

JEM.prototype.height = function() {
  return this.pixi ? this.pixi.screen.height : window.innerHeight;
};

JEM.prototype.setAssertRenderer = function(renderer) {
  this.assertRenderer = renderer;
};

JEM.prototype.assert = function(test, message) {
  if (!test) {
    console.log(message);
  
    if (this.assertRenderer) {
        this.assertRenderer.render(message);
    }
  
    debugger;
  }
};

JEM.prototype.addTicker = function(ticker) {
  this.newTickers.push(ticker);
};

JEM.prototype.removeTicker = function(ticker) {
  this.expiredTickers.push(ticker);
};

JEM.prototype.clearTickers = function() {
  this.newTickers.length = 0;
  this.expiredTickers.length = 0;
  this.tickers.length = 0;
};

JEM.prototype.tick = function(dt) {
    this.expiredTickers.forEach((ticker) => {
    if (this.tickers.indexOf(ticker) >= 0) {
        JEM.Utils.removeElement(this.tickers, ticker, true);
    }
    });
    this.expiredTickers.length = 0;

    this.newTickers.forEach((ticker) => {
    if (this.tickers.indexOf(ticker) < 0) {
        this.tickers.push(ticker);
    }
    });
    this.newTickers.length = 0;

    for (var ticker of this.tickers) {
        ticker.update(dt);
        if (this.tickers.length === 0) {
            break;
        }
    }

    if (this.game) {
        this.game.update(dt);
    }
};

