/**
 * Piximitter emits generic particles, assumed own a Pixi Sprite
 * that can be accessed via the following Interface:
 * getSprite()
 * 
 * The Piximitter takes an optional 'options' parameter, which can
 * contains any of the following optional fields:
 * position: {minX, minY, [maxX, maxY]}
 * velocity: {minSpeed, maxSpeed, minAngle, [maxAngle]}
 * scale: {minScaleX, minScaleY, [maxScaleX, maxScaleY]}
 * rotation: {minAngle, [maxAngle]} (in degrees)
 * offsetFunction: this is a function that returns an object of the form {x, y} which are scaled pixel offsets
 * 
 * @param {generic function that creates a particle; particle objects must 'setEmitter', 'onSpawned', and 'onDespawned' methods} generator 
 */
JEM.Piximitter = function(generator, emissionRate, srcContainer = null, destContainer = null, options = null, startSize = 4, maxSize = 32) {
    this.srcContainer = srcContainer;
    this.destContainer = destContainer;
    this.emissionRate = emissionRate;
    this.options = options;
    this.wantsStop = false;
    this.bank = new JEM.ObjectBank(this, generator, startSize, maxSize);
    this.clock = 0;
    this.particleCount = 0;
    this.running = false;
    this.rate = emissionRate;
    this.active = true;
}; 

JEM.Piximitter.prototype.setActive = function(isActive) {
    this.active = isActive;
};

JEM.Piximitter.prototype.setSourceContainer = function(srcContainer) {
    this.srcContainer = srcContainer;
};

JEM.Piximitter.prototype.setDestinationContainer = function(destContainer) {
    this.destContainer = destContainer;
};

JEM.Piximitter.prototype.onSpawned = function(particle) {
    particle.onSpawned();
    this.particleCount += 1;

    if (particle["update"]) {
        jem.addTicker(particle);
    }

    if (this.destContainer) {
        if (particle instanceof PIXI.Sprite) {
            this.destContainer.addChild(particle);
        }
        else if (particle["getSprite"]) {
            this.destContainer.addChild(particle.getSprite());
        }
    }
    else if (particle instanceof PIXI.Sprite) {
        jem.pixi.stage.addChild(particle);
    }
    else if (particle["getSprite"]) {
        jem.pixi.stage.addChild(particle.getSprite());
    }
};

JEM.Piximitter.prototype.onDespawned = function(particle, wasRecycled) {
    if (particle["update"]) {
        jem.removeTicker(particle);
    }

    particle.onDespawned();

    if (this.destContainer) {
        if (particle instanceof PIXI.Sprite) {
            this.destContainer.removeChild(particle);
        }
        else if (particle["getSprite"]) {
            this.destContainer.removeChild(particle.getSprite());
        }
    }
    else if (particle instanceof PIXI.Sprite) {
        jem.pixi.stage.removeChild(particle);
    }
    else if (particle["getSprite"]) {
        jem.pixi.stage.removeChild(particle.getSprite());
    }

    this.particleCount -= 1;
};

JEM.Piximitter.prototype.start = function() {
    jem.addTicker(this);
    this.particleCount = 0;
    this.running = true;
    this.wantsStop = false;
};

JEM.Piximitter.prototype.stop = function(stopNow) {
    if (stopNow) {
        this.bank.despawnAll();
        jem.removeTicker(this);
        this.running = false;
    }
    else {
        this.wantsStop = true;
    }
};

JEM.Piximitter.prototype.update = function(dt) {
    if (this.wantsStop) {
        if (this.particleCount === 0) {
            jem.removeTicker(this);
            this.running = false;
        }
    }
    else {
        this.clock += dt;
        const period = 1.0 / this.rate;

        while (this.clock >= period) {
            this.clock -= period;
            this.emit();
        }
    }
};

JEM.Piximitter.prototype.getCount = function() {
    return this.bank.spawnCount();
};

JEM.Piximitter.prototype.onDied = function(particle) {
    this.bank.despawn(particle);
};

JEM.Piximitter.prototype.emit = function() {
    var particle = null;
    if (this.active) {
        particle = this.bank.spawn(true);
        particle.setEmitter(this);

        if (this.options) {
            if (particle["setPosition"]) {
                var baseX = 0;
                var baseY = 0;

                if (this.srcContainer && this.destContainer) {
                    baseX = this.srcContainer.x - this.destContainer.x;
                    baseY = this.srcContainer.y - this.destContainer.y;
                }
                else if (this.srcContainer) {
                    baseX = this.srcContainer.x;
                    baseY = this.srcContainer.y;
                }
                else if (this.destContainer) {
                    baseX = -this.destContainer.x;
                    baseY = -this.destContainer.y;
                }

                if (typeof this.options.position !== 'undefined') {
                    var x = this.options.position.minX;
                    var y = this.options.position.minY;

                    if (typeof this.options.position.maxX !== 'undefined') {
                        x += Math.round(Math.random() * (this.options.position.maxX - this.options.position.minX));
                    }
                    if (typeof this.options.position.maxY !== 'undefined') {
                        y += Math.round(Math.random() * (this.options.position.maxY - this.options.position.minY));
                    }

                    baseX += x;
                    baseY += y;
                }

                if (this.options["offsetFunction"]) {
                    const offset = this.options.offsetFunction();
                    baseX += offset.x;
                    baseY += offset.y;
                }

                particle.setPosition(baseX, baseY);
            }

            if (particle["setVelocity"] && this.options.velocity && typeof this.options.velocity.minSpeed !== 'undefined') {
                var speed = this.options.velocity.minSpeed;

                if (Math.abs(speed) > 0 || this.options.velocity["maxSpeed"]) {
                    if (this.options.velocity["maxSpeed"]) {
                        speed += Math.round(Math.random() * (this.options.velocity.maxSpeed - speed));
                    }
                    var angle = 0;
                    var angle = typeof this.options.velocity.minAngle !== 'undefined' ? this.options.velocity.minAngle : 0
                    if (typeof this.options.velocity.maxAngle !== 'undefined') {
                        angle += Math.round(Math.random() * (this.options.velocity.maxAngle - this.options.velocity.minAngle));
                    }

                    const angleRad = JEM.Utils.degreesToRadians(angle);
                    const vx = speed * Math.cos(angleRad);
                    const vy = -speed * Math.sin(angleRad);

                    particle.setVelocity(vx, vy);
                }
            }

            if (particle["setScale"] && typeof this.options.scale !== 'undefined') {
                var scaleX = this.options.scale.minScaleX || 1;
                if (this.options.scale.maxScaleX) {
                    scaleX += Math.round(Math.random() * (this.options.scale.maxScaleX - this.optionsScale.minScaleX));
                }

                var scaleY = this.options.scale.minScaleY || 1;
                if (this.options.scale.maxScaleY) {
                    this.scaleY += Math.round(Math.random() * (this.options.scale.maxScaleY - this.optionsScale.minScaleY));
                }

                particle.setScale(scaleX, scaleY);
            }

            if (particle["setRotation"] && typeof this.options.rotation !== 'undefined') {
                var theta = this.options.rotation.minAngle || 0;
                if (typeof this.options.rotation.maxAngle !== 'undefined') {
                    theta += Math.round(Math.random() * (this.options.rotation.maxAngle - this.options.rotation.minAngle));
                }
                theta = JEM.Utils.degreesToRadians(theta);
                particle.setRotation(theta);
            }
        }
    }

    return particle;
};