/**
 * ObjectBanks manage collections of generic objects, capping the number
 * that can actually exist. The spawn() function returns an object ready
 * for initialization. ObjectBanks first try to use objects previously
 * created but not currently in the world. If that fails, they try to
 * create a new object if the total object count hasn't reached the cap.
 * If that fails, they recycle an object that is currently in the world.
 * ObjectBanks expect to communicate with a listener via this interface:
 * onSpawned(newInstance) -- called in response to a 'spawn' request.
 * onDespawned(instance, isRecycle) -- called in response to 'despawn' or 'spawn' recycle
 * 
 * @param {Argument-free constructor used to create a new object} generator 
 * @param {Number of objects to create initially} initialSize 
 * @param {Max number of objects to allow before recycling} maxSize 
 */

JEM.ObjectBank = function(listener, generator, initialSize = 0, maxSize = 128) {
    this.listener = listener;

    jem.assert(listener, "No listener found!");
    jem.assert(listener.onSpawned, "Invalid interface!");
    jem.assert(listener.onDespawned, "Invalid interface!");

    this.size = initialSize;
    this.maxSize = maxSize || initialSize * 4;
    this.generator = generator;
    this.spawned = [];
    this.waiting = [];
    this.initialize();
};

JEM.ObjectBank.prototype.initialize = function() {
    for (var i=0; i<this.size; ++i) {
        this.waiting.push(new this.generator(this));
    }
};

JEM.ObjectBank.prototype.capacity = function() {
    return this.size;
};

JEM.ObjectBank.prototype.spawnCount = function() {
    return this.spawned.length;
};

JEM.ObjectBank.prototype.waitCount = function() {
    return this.waiting.length;
};

JEM.ObjectBank.prototype.despawnAll = function() {
    while (this.spawned.length > 0) {
        this.despawn(this.spawned[this.spawned.length - 1]);
    }
};

JEM.ObjectBank.prototype.spawn = function(allowRecycle) {
    var instance = null;

    if (this.waiting.length > 0) {
        instance = this.waiting.pop();
        this.spawned.push(instance);
        this.listener.onSpawned(instance);
    }

    if (!instance && this.spawned.length < this.maxSize) {
        jem.assert(this.spawned.length === this.size);

        if (this.spawned.length < this.maxSize) {
            this.size = Math.min(Math.max(1, this.size * 2), this.maxSize);
            for (var i=this.spawned.length; i<this.size; ++i) {
                this.waiting.push(new this.generator(this));
            }
            instance = this.spawn(false);
            // No need to explicitly call onSpawned() as it is
            // implicitly called by the recursive this.spawn().
        }
    }

    if (!instance && allowRecycle) {
        instance = this.spawned.shift();
        this.listener.onDespawned(instance, true);
        
        this.spawned.push(instance);
        this.listener.onSpawned(instance);
    }

    return instance;
};

JEM.ObjectBank.prototype.despawn = function(instance) {
    JEM.Utils.removeElement(this.spawned, instance, true);
    this.waiting.push(instance);
    this.listener.onDespawned(instance, false);
};
