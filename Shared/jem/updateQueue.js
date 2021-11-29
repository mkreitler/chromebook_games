/**
 * Maintains a list of elements which update each game tick.
 * Elements are assumed to implement the following interface:
 * onAdded()
 * onRemoved()
 * update(param)
 *
 * @param {If 'true', the update order of elements doesn't change when remove elements} preserveUpdateOrder
 */
JEM.UpdateQueue = function(preserveUpdateOrder) {
    this.toAdd = [];
    this.toRemove = [];
    this.updating = [];
    this.preserveUpdateOrder = preserveUpdateOrder ? true : false;

    jem.addTicker(this);
};

JEM.UpdateQueue.prototype.destroy = function() {
  this.clear();
  jem.removeTicker(this);
};

JEM.UpdateQueue.prototype.enforceInterface = function(element) {
    if (!element["onAdded"]) {
        element["onAdded"] = function() {};
    }
    if (!element["onRemoved"]) {
        element["onRemoved"] = function() {};
    }
    if (!element["onUpdate"]) {
        element["onUpdate"] = function(param) {};
    }
};

JEM.UpdateQueue.prototype.add = function(element) {
    this.enforceInterface(element);
    this.toAdd.push(element);
};

JEM.UpdateQueue.prototype.remove = function(element) {
    this.toRemove.push(element);
};

JEM.UpdateQueue.prototype.clear = function() {
  for (var element of this.toAdd) {
    element.onRemoved();
  }
  this.toAdd.length = 0;
  
  for (element of this.toRemove) {
    element.onRemoved();
  }
  this.toRemove.length = 0;
  
  for (element of this.updating) {
    jem.removeTicker(element);
    element.onRemoved();
  }
  this.updating.length = 0;
};

JEM.UpdateQueue.prototype.update = function(param) {
    this.toRemove.forEach((element) => {
        if (this.updating.indexOf(element) >= 0) {
            element.onRemoved();
            jem.Utils.removeElement(this.updating, element, this.preserveUpdateOrder);
        }
    });
    this.toRemove.length = 0;

    this.toAdd.forEach((element) => {
        if (this.updating.indexOf(element) < 0) {
            this.updating.push(element);
            element.onAdded();
        }
    });

    this.toAdd.length = 0;

    for (var element of this.updating) {
      element.update(param);
      if (this.updating.length === 0) {
        break;
      }
    }
};