BathGame.Mine = function(lightSprite, darkSprite) {
    this.FULLY_LIGHT = 1.0;
    this.FULLY_DARK = 0.0;

    this.lightSprite = lightSprite;
    this.darkSprite = darkSprite;
    this.alphaParam = this.FULLY_DARK;
    this.lightSprite.anchor.x = 0.5;
    this.lightSprite.anchor.y = 0.5;
    this.darkSprite.anchor.x = 0.5;
    this.darkSprite.anchor.y = 0.5;
};

BathGame.Mine.prototype.setPosition = function(x, y) {

};