jem.Switchboard = function() {
  this.toAdd = [];
  this.toRemove = [];
  this.messageTable = {};
};

jem.Switchboard.prototype.addListener = function(listener, message) {
  jem.assert(!listener[message], "Listener doesn't respond to message!");
  this.toAdd.push({listener: listener, message: message});
};

jem.Switchboard.prototype.removeListener = function(listener, message) {
  this.toRemove.push({listener: listener, message: message});
};

jem.Switchboard.prototype.update = function(unused) {
  this.removeListeners();
  this.addListeners();
};

jem.Switchboard.prototype.broadcast = function(message, arg) {
  const listeners = this.messageTable[message];
  
  for (var listener of listeners) {
    listener[message](arg);
  }
};

jem.Switchboard.prototype.clear = function() {
  for (var message in this.messageTable) {
    this.messageTable[message].length = 0;
  }
  
  this.messageTable = {};
};

jem.Switchboard.prototype.removeListeners = function() {
  for (var entry of this.toRemove) {
    if (entry.message) {
      var listeners = this.messageTable[entry.message];
      if (!listeners) {
        listeners = [];
        this.messageTable[entry.message] = listeners;
      }
      
      if (listeners.indexOf(entry.listener) >= 0) {
        jem.Utils.removeElement(listeners, entrty.listener);
      }
    }
    else {
      for (var message of this.messageTable) {
        const listeners = this.messageTable[message];
        
        for (const listener of listeners) {
          if (listener.indexOf(entrty.listener) >= 0) {
            jem.Utils.removeElement(listeners, entry.listener);
            break;
          }
        }
      }
    }
  }
};

jem.Switchboard.prototype = function() {
  for (var entry of this.toAdd) {
    var listeners = this.messageTable[entry.message];
    if (!listeners) {
      listeners = [];
      this.messageTable[message] = listeners;
    }
    
    if (listeners.indexOf(entry.listener) < 0) {
      listeners.push(entry.listener);
    }
  }
  this.toAdd.length = 0;
};
