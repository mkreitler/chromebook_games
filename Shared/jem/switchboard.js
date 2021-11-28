JEM.Switchboard = function(preserveListenerOrder) {
  this.toAdd = [];
  this.toRemove = [];
  this.messageTable = {};
  this.updating = false;
  this.preserveListenerOrder = preserveListenerOrder;
};

// Interface ==================================================================
/**
 * Add an object to the switchboard that listens for broadcasts of the given message.
 * @param {Object that implements 'message' as a function accepting 1 argument} listener 
 * @param {String that acts as a key to a single-argument function in the listener} message 
 */
JEM.Switchboard.prototype.addListener = function(listener, message) {
  jem.assert(listener[message], "Listener doesn't implement message!");

  if (!this.updating) {
    this.safeAddListener(listener, message);
  }
  else {
    this.toAdd.push({listener: listener, message: message});
  }
};

/**
 * "Unsubscribes" the given listener object from the specified message.
 * If the message parameter is null or missing, this removes the listener
 * from the switchboard altogther.
 * @param {An object that was formerly registered with the 'addListener' method} listener 
 * @param {The message from which to unsubscribe the 'listener' object} message 
 */
JEM.Switchboard.prototype.removeListener = function(listener, message) {
  if (!this.updating) {
    this.safeRemoveListener(listener, message);
  }
  else {
    this.toRemove.push({listener: listener, message: message});
  }
};

/**
 * Send a message to all relevant listeners. Listeners are not
 * necessarily called in the order they were added.
 * @param {The message to send to all relevant listeners (corresponds to a single-argument function in each listener)} message 
 * @param {Single argument passed to all listeners} arg 
 */
JEM.Switchboard.prototype.broadcast = function(message, arg) {
  const listeners = this.messageTable[message];
  
  for (var listener of listeners) {
    listener[message](arg);
  }
};

// Implementation =============================================================
JEM.Switchboard.prototype.update = function(unused) {
  this.updating = true;
  this.removeListeners();
  this.addListeners();
  this.updating = false;
};

JEM.Switchboard.prototype.clear = function() {
  for (var message in this.messageTable) {
    this.messageTable[message].length = 0;
  }
  
  this.messageTable = {};
};

JEM.Switchboard.prototype.removeListeners = function() {
  for (var entry of this.toRemove) {
    this.safeRemoveListener(listener, entry.message);
  }
  this.toRemove.length = 0;
};

JEM.Switchboard.prototype.addListeners = function() {
  for (var entry of this.toAdd) {
    this.safeAddListener(entry.listener, entry.message);
  }
  this.toAdd.length = 0;
};

JEM.Switchboard.prototype.safeRemoveListener = function(listener, message) {
  if (message) {
    var listeners = this.messageTable[message];
    if (listeners && listeners.indexOf(listener) >= 0) {
      jem.Utils.removeElement(listeners, entrty.listener, this.preserveListenerOrder);
    }
  }
  else {
    for (var curMessage of this.messageTable) {
      const listeners = this.messageTable[curMessage];

      if (listeners && listeners.indexOf(listener) >= 0) {
        jem.Utils.removeElement(listeners, listener, this.preserveListenerOrder);
      }
    }
  }
};

JEM.Switchboard.prototype.safeAddListener = function(listener, message) {
  var listeners = this.messageTable[message];
  if (!listeners) {
    listeners = [];
    this.messageTable[message] = listeners;
  }
  
  if (listeners.indexOf(listener) < 0) {
    listeners.push(listener);
  }
};