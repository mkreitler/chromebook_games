BathGame.Bubble = function(sprite, gameScale, minY) {
    this.sprite = sprite;
    this.sprite.anchor.x = 0.5;
    this.sprite.anchor.y = 0.5;
    this.vx = 0;
    this.vy = 0;
    this.startY = 0;
    this.startX = 0;
    this.emitter = null;
    this.gameScale = gameScale;
    this.minY = minY;
};

BathGame.Bubble.MAX_BUBBLE_HEIGHT = 40;
BathGame.Bubble.MAX_X_WOBBLE = 3;
BathGame.Bubble.VELOCITY_SCALAR = 2;

BathGame.Bubble.bubbleCount = 0;
BathGame.Bubble.MAX_BUBBLES = 10;

BathGame.Bubble.prototype.setEmitter = function(emitter) {
    this.emitter = emitter;
};

BathGame.Bubble.prototype.setVelocity = function(vx, vy) {
    this.vx = vx;
    this.vy = vy / BathGame.Bubble.VELOCITY_SCALAR;
};

BathGame.Bubble.prototype.setPosition = function(x, y) {
    this.sprite.x = x;
    this.sprite.y = y;
    this.startY = y;
    this.startX = x;
};

BathGame.Bubble.prototype.getSprite = function() {
    return this.sprite;
};

BathGame.Bubble.resetBubbleCount = function() {
    BathGame.Bubble.bubbleCount = 0;
};

BathGame.Bubble.setBubbleCountParam = function(bubbleCountParam) {
    BathGame.Bubble.maxBubbles = Math.round(BathGame.Bubble.MAX_BUBBLES * bubbleCountParam);
};

BathGame.Bubble.prototype.onSpawned = function() {
    BathGame.Bubble.bubbleCount += 1;
    if (BathGame.Bubble.bubbleCount === BathGame.Bubble.maxBubbles) {
        jem.switchboard.broadcast("stopBubbling", null);
    }
    this.sprite.visible = true;
    this.sprite.alpha = 1;
};

BathGame.Bubble.prototype.onDespawned = function() {
    this.sprite.visible = false;
};

BathGame.Bubble.prototype.update = function(dt) {
    this.sprite.y += dt * this.vy;
    const dy = this.sprite.y - this.startY;
    const dx = BathGame.Bubble.MAX_X_WOBBLE * this.gameScale * Math.sin(dy / (BathGame.Bubble.MAX_X_WOBBLE * this.gameScale * BathGame.Bubble.VELOCITY_SCALAR) * Math.PI);

    this.sprite.x = this.startX + dx;
    const heightParam = 1.0 - Math.abs(dy) / (BathGame.Bubble.MAX_BUBBLE_HEIGHT * this.gameScale);
    this.sprite.alpha = heightParam;

    if (Math.abs(dy) > BathGame.Bubble.MAX_BUBBLE_HEIGHT * this.gameScale || this.sprite.y < this.minY) {
        this.emitter.onDied(this);
    }
};