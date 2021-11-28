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

jem.FSM = function(owner) {
    this.owner = owner;
    this.currentState = null;
    this.states = {};
    this.transitions = [];
    this.wantsTermination = false;
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

jem.FSM.prototype.terminate = function() {
    this.wantsTermiation = true;
};

jem.FSM.prototype.update = function(dt) {
    while (this.transitions.length > 0) {
        const newState = this.transitions[0];

        if (this.currentState != newState) {
            if (this.currentState) {
                this.currentState.onExit();
            }

            this.currentState = newState;
            newState.onEnter();
        }
    }

    if (this.currentState) {
        this.currentState.update(dt);
    }

    return this.wantsTermination;
};

jem.FsmManager = {
    fsms: new jem.UpdateQueue(true),

    createFsm: function(owner) {
        return new jem.FSM(owner);
    }
};
