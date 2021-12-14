/**
 * Piximitter emits generic particles, assumed own a Pixi Sprite
 * that can be accessed via the following Interface:
 * getSprite()
 * 
 * @param {generic function that creates a particle} generator 
 */
jem.Piximitter = function(generator, container, rate, speed, minAngle, maxAngle) {
    this.generator = generator;
    this.container = container;
    this.rate = rate;
    this.speed = speed;
    this.minAngle = minAngle;
    this.maxAngle = maxAngle;
}; 