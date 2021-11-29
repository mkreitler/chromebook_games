JEM.State = function(owner, onEnter, onUpdate, onExit) {
    this.onEnter = onEnter ? onEnter.bind(owner) : function() {};
    this.onUpdate = onUpdate ? onUpdate.bind(owner) : function() {};
    this.onExit = onExit ? onExit.bind(owner) : function() {};
};

JEM.State.prototype.enter = function() {
    this.onEnter();
};

JEM.State.prototype.update = function(dt) {
    this.onUpdate(dt);
};

JEM.State.prototype.exit = function() {
    this.onExit();
};

// ============================================================================

JEM.FSM = function(owner) {
    this.owner = owner;
    this.currentState = null;
    this.states = {};
    this.transitions = [];
};

JEM.FSM.prototype.createState = function(name, onEnter, onUpdate, onExit) {
    const safeName = name.toLowerCase();
    jem.assert(!this.states[safeName], "State already exists!");

    const newState = new JEM.State(this.owner, onEnter, onUpdate, onExit);
    this.states[safeName] = newState;

    return newState;
};

JEM.FSM.prototype.setState = function(stateName) {
    const safeName = stateName.toLowerCase();
    const newState = this.states[safeName];

    jem.assert(newState, "State doesn't exist!");

    this.transitions.push(newState);
};

JEM.FSM.prototype.onRemoved = function() {
  this.destroy();
};

JEM.FSM.prototype.destroy = function() {
  for (var stateName in this.states) {
    const state = this.states[stateName];
    state.destroy();
  }
};

JEM.FSM.prototype.update = function(dt) {
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

// ============================================================================

JEM.FsmManager = function() {
  this.fsms = new JEM.UpdateQueue(true);
};

JEM.FsmManager.prototype.createFsm = function(owner) {
  const newFsm = new JEM.FSM(owner);
  this.fsms.add(newFsm);
  
  return newFsm;
};

JEM.FsmManager.prototype.destroyFsm = function(fsm) {
  this.fsms.remove(fsm);
};

JEM.FsmManager.prototype.clear = function() {
  this.fsms.clear();
};
