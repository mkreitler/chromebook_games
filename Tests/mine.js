BathGame.Mine = function(lightSprite, darkSprite) {
    this.FULLY_LIGHT = 1.0;
    this.FULLY_DARK = 0.0;
    this.BLEND_SPEED = 1;

    this.lightSprite = lightSprite;
    this.darkSprite = darkSprite;
    this.lightSprite.anchor.x = 0.5;
    this.lightSprite.anchor.y = 0.5;
    this.darkSprite.anchor.x = 0.5;
    this.darkSprite.anchor.y = 0.5;
    
    this.wantAlpha = 1.0;
    this.currentAlpha = 1.0;
    this.startAlpha = 0;
    
    this.fsm = jem.FSM.create(this);
    this.fsm.createState("update", function(){}, this.update, function() {});
};

BathGame.Mine.prototype.setPosition = function(x, y) {
  this.lightSprite.x = x;
  this.lightSprite.y = y;
  this.darkSprite.x = x;
  this.darkSprite.y = y;
};

BathGame.Mine.prototype.setAlpha = function(newAlpha, immediate) {
  this.wantAlpha = newAlpha;
  
  if (immediate) {
    this.currentAlpha = newAlpha;
    this.updateAlpha();
  }
  
  if (this.wantAlpha !== this.currentAlpha) {
    this.fsm.setState("update");
  }
};

BathGame.Mine.prototype.width = function() {
  return this.darkSprite.width;
};

BathGame.Mine.prototype.height = function() {
  return this.darkSprite.height;
};

BathGame.Mine.prototype.update = function(dt) {
  var delta = this.wantAlpha > this.currentAlpha ? this.BLEND_SPEED : -this.BLEND_SPEED;
  if (delta > 0) {
    this.currentAlpha = Math.min(this.wantAlpha, this.currentAlpha + delta * dt);
  }
  else {
    this.currentAlpha = Math.max(this.wantAlpha, this.currentAlpha - delta * dt);
  }
  
  this.updateAlpha();
  
  if (this.currentAlpha === this.wantAlpha) {
    this.fsm.setState(null);
  }
};

BathGame.Mine.prototype.updateAlpha = function() {
  this.darkSprite.alpha = 1.0 - this.currentAlpha;
  this.lightSprite.alpha = this.currentAlpha;
};

BathGame.Mine.prototype.addToScene = function(x, y, alpha) {
  jem.pixi.stage.addChild(this.darkSprite);
  jem.pixi.stage.addChild(this.lightSprite);
  
  this.setAlpha(alpha, true);
  this.setPosition(x, y);
};

BathGame.Mine.prototype.removeFromScene = function() {
  jem.pixi.stage.removeChild(this.darkSprite);
  jem.pixi.stage.removeChild(this.lightSprite);
  this.fsm.setState(null);
};

