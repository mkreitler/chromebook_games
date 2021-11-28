jem.State = function(owner, onEnter, onUpdate, onExit) {
    this.onEnter = onEnter ? onEnter.bind(owner) : function() {};
    this.onUpdate = onUpdate ? onUpdate.bind(owner) : function() {};
    this.onExit = onExit ? onExit.bind(owner) : function() {};
};

jem.State.prototype.enter = function() {
    this.onEnter();
};

jem.State.prototype.update = function(dt) {
    this.onUpdate(dt);
};

jem.State.prototype.exit = function() {
    this.onExit();
};

///////////////////////////////////////////////////////////////////////////////

jem.FSM = function(owner) {
    this.owner = owner;
    this.currentState = null;
    this.states = {};
    this.transitions = [];
};

jem.FSM.prototype.createState = function(name, onEnter, onUpdate, onExit) {
    const safeName = name.toLowerCase();
    jem.assert(!this.states[safeName], "State already exists!");

    const newState = new jem.State(this.owner, onEnter, onUpdate, onExit);
    this.states[safeName] = newState;

    return newState;
};

jem.FSM.prototype.setState = function(stateName) {
    const safeName = stateName.toLowerCase();
    const newState = this.states[safeName];

    jem.assert(newState, "State doesn't exist!");

    this.transitions.push(newState);
};

jem.FSM.prototype.onRemoved = function() {
  this.destroy();
};

jem.FSM.prototype.destroy = function() {
  for (var stateName in this.states) {
    const state = this.states[stateName];
    state.destroy();
  }
};

jem.FSM.prototype.update = function(dt) {
    while (this.transitions.length > 0) {
        const newState = this.transitions[0];

        if (this.currentState != newState) {
            if (this.currentState) {
                this.currentState.onExit();
            }
            
            if (newState) {
              newState.onEnter();
            }

            this.currentState = newState;
        }
    }

    if (this.currentState) {
        this.currentState.update(dt);
    }
};

///////////////////////////////////////////////////////////////////////////////

jem.FsmManager = function() {
  this.fsms = new jem.UpdateQueue(true);
  jem.addTicker(this);
};

jem.FsmManager.prototype.createFsm = function(owner) {
  const newFsm = new jem.FSM(owner);
  this.fsms.add(newFsm);
  
  return newFsm;
};

jem.FsmManager.prototype.destroyFsm = function(fsm) {
  this.fsms.remove(fsm);
};

jem.FsmManager.prototype.clear = function() {
  this.fsms.clear();
};
