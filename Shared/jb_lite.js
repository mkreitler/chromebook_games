// Define the jb objects
jb = {
    EPSILON: 0.003,
    execStack: [],
    assert: function(test, msg) {
        if (!test) {
            this.logToConsole(msg);
            debugger;
        }
    },

    logToConsole: function(text) {
      // TODO: prevent console.log from executing on unsupported browsers.
      console.log(text);
    }
};

/////////////////////////////////////////////////////////////////////////////////////////////////////
// oooooo   oooooo     oooo            .o8       oooooo     oooo            o8o
//  `888.    `888.     .8'            "888        `888.     .8'             `"'
//   `888.   .8888.   .8'    .ooooo.   888oooo.    `888.   .8'    .ooooo.  oooo   .ooooo.   .ooooo.
//    `888  .8'`888. .8'    d88' `88b  d88' `88b    `888. .8'    d88' `88b `888  d88' `"Y8 d88' `88b
//     `888.8'  `888.8'     888ooo888  888   888     `888.8'     888   888  888  888       888ooo888
//      `888'    `888'      888    .o  888   888      `888'      888   888  888  888   .o8 888    .o
//       `8'      `8'       `Y8bod8P'  `Y8bod8P'       `8'       `Y8bod8P' o888o `Y8bod8P' `Y8bod8P'
/////////////////////////////////////////////////////////////////////////////////////////////////////

webVoice = {};

webVoice.get = function() {
  // alert("Your web browser does not support voice recognition. Please upgrade to Google Chrome 25 or higher.");
  return false;
};

webVoice.init = function(fnOnStart, fnOnEnd, fnOnResult, fnOnError, bContinuous, bInterim) {
  var recog = webVoice.get();

  if (recog) {
    recog.onstart = fnOnStart;
    recog.onend = fnOnEnd;
    recog.onresult = fnOnResult;
    recog.onerror = fnOnError;
    recog.continuous = bContinuous ? true : false;
    recog.interimResults = bInterim ? true : false;
  }
};

(function() {
  var recognition = null;

  if (('webkitSpeechRecognition' in window)) {
    recognition = new webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onstart = null;
    recognition.onresult = null;
    recognition.onerror = null;
    recognition.onend = null;

    webVoice.get = function() {
      return recognition;
    }
  }
})();


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ooooooooo.   oooooooooooo  .oooooo.o   .oooooo.   ooooo     ooo ooooooooo.     .oooooo.   oooooooooooo  .oooooo.o
// `888   `Y88. `888'     `8 d8P'    `Y8  d8P'  `Y8b  `888'     `8' `888   `Y88.  d8P'  `Y8b  `888'     `8 d8P'    `Y8
//  888   .d88'  888         Y88bo.      888      888  888       8   888   .d88' 888           888         Y88bo.
//  888ooo88P'   888oooo8     `"Y8888o.  888      888  888       8   888ooo88P'  888           888oooo8     `"Y8888o.
//  888`88b.     888    "         `"Y88b 888      888  888       8   888`88b.    888           888    "         `"Y88b
//  888  `88b.   888       o oo     .d8P `88b    d88'  `88.    .8'   888  `88b.  `88b    ooo   888       o oo     .d8P
// o888o  o888o o888ooooood8 8""88888P'   `Y8bood8P'     `YbodP'    o888o  o888o  `Y8bood8P'  o888ooooood8 8""88888P'
// Resources /////////////////////////////////////////////////////////////////////////////////////////////////////////
resources = {
  resourcesPending: 0,
  resourcesLoaded: 0,
  resourcesRequested: 0,
  bResourceLoadSuccessful: true,

  incPendingCount: function() {
    resources.resourcesPending += 1;
    resources.resourcesRequested += 1;
  },

  incLoadedCount: function(bLoadSuccessful) {
    resources.resourcesLoaded += 1;
    resources.resourcesPending -= 1;

    resources.bResourceLoadSuccessful &= bLoadSuccessful;
  },

  getLoadProgress: function() {
    var completion = resources.resourcesRequested > 0 ? resources.resourcesLoaded / resources.resourcesRequested : 1.0;

    if (!resources.bResourceLoadSuccessful) {
      completion *= -1.0;
    }

    return completion;
  },

  getLoadedCount: function() {
    return resources.resourcesLoaded;
  },

  loadComplete: function() {
    return resources.resourcesPending === 0 && resources.resourcesLoaded === resources.resourcesRequested;
  },

  loadSuccessful: function() {
    return resources.bResourceLoadSuccessful;
  },

  loadFont: function(fontName, fontPath, fontType) {
    var fontInfo = {openTypeFont: null, loadErr: null},
        fullURL = (fontPath || "./res/fonts") + "/" + fontName + "." + (fontType || "ttf");

    fullURL = fullURL.replace("//", "/");

    resources.incPendingCount();

    opentype.load(fullURL, function(err, font) {
      if (err) {
        fontInfo.loadErr = err;
        resources.incLoadedCount(false);
      }
      else {
        fontInfo.openTypeFont = font;
        resources.incLoadedCount(true);
      }
    });

    return fontInfo;
  },

  loadImage: function(imageURL, imagePath) {
    var image = new Image(),
        fullURL = (imagePath || "./res/images/") + imageURL;

    resources.incPendingCount();
  
    image.onload = function() {
      resources.incLoadedCount(true);
    }
    
    image.onerror = function() {
      resources.incLoadedCount(false);
    }
  
    image.src = fullURL;
  
    return image;
  },
  
  loadSound: function(soundURL, resourcePath, nChannels, repeatDelaySec) {
    var path = resourcePath || "./res/sounds/";

    soundURL = path + soundURL;

    resources.incPendingCount();

    return jb.sound.load(soundURL,
        function() {
          resources.incLoadedCount(true);
        },
        function() {
          resources.incLoadedCount(false);
        },
        nChannels, repeatDelaySec);
  },
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// oooooooooo.  ooooo        ooooo     ooo oooooooooooo ooooooooo.   ooooooooo.   ooooo ooooo      ooo ooooooooooooo  .oooooo.o
// `888'   `Y8b `888'        `888'     `8' `888'     `8 `888   `Y88. `888   `Y88. `888' `888b.     `8' 8'   888   `8 d8P'    `Y8
//  888     888  888          888       8   888          888   .d88'  888   .d88'  888   8 `88b.    8       888      Y88bo.
//  888oooo888'  888          888       8   888oooo8     888ooo88P'   888ooo88P'   888   8   `88b.  8       888       `"Y8888o.
//  888    `88b  888          888       8   888    "     888          888`88b.     888   8     `88b.8       888           `"Y88b
//  888    .88P  888       o  `88.    .8'   888       o  888          888  `88b.   888   8       `888       888      oo     .d8P
// o888bood8P'  o888ooooood8    `YbodP'    o888ooooood8 o888o        o888o  o888o o888o o8o        `8      o888o     8""88888P'
// Blueprints //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Usage:
//
// Define a new blueprint:
// blueprints.draft(
//   "testKnight",
//
//   // Data
//   {
//     ...
//   },
//
//   // Actions
//   {
//     ...
//   },
// );
//
// Extend an existing blueprint with components:
// blueprints.make("testKnight", "touchable")
//
// Instantiate an object from a blueprint:
// blueprints.build("testKnight");
//
blueprints = {
    mixins: {},

    make: function(blueprint, extension) {
        var key = null,
            bpData = blueprints[blueprint],
            mixin = blueprints.mixins[extension],
            proto = bpData ? bpData.proto : null;

        if (bpData && mixin && proto) {
            for (key in mixin) {
                if (key.indexOf(extension) >= 0) {
                    proto[key] = mixin[key];
                }
            }

            proto._components.push(extension);
        }
    },

    draft: function(name, dataObj, classObj) {
        var args = Array.prototype.slice.call(arguments),
            propObj = {},
            key = null;

        if (!blueprints[name]) {
            classObj._components = [];
            classObj.destroy = function() {
                var i = 0;

                for (i=0; i<this._components.length; ++i) {
                    blueprints.mixins[this._components[i]].destroy(this);
                }
            }

            for (key in dataObj) {
                propObj[key] = {value: dataObj[key], writable: true, enumerable: true, configurable: true};
            }

            blueprints[name] = {data: propObj, proto: classObj};
        }
    },

    build: function(name) {
        var instance = null,
            template = blueprints[name],
            i = 0,
            mixin = null,
            args = [];

        if (template) {
            // Build argument list.
            for (i=1; i<arguments.length; ++i) {
              args.push(arguments[i]);
            }

            instance = Object.create(template.proto, JSON.parse(JSON.stringify(template.data)));

            for (i=0; i<template.proto._components.length; ++i) {
                mixin = blueprints.mixins[template.proto._components[i]];
                if (mixin) {
                    mixin.spawn(instance);
                }
            }

            if (instance.onCreate) {
                instance.onCreate.apply(instance, args);
            }
        }

        return instance;
    }
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//   .oooooo.     .oooooo.   ooo        ooooo ooooooooo.     .oooooo.   ooooo      ooo oooooooooooo ooooo      ooo ooooooooooooo  .oooooo.o
//  d8P'  `Y8b   d8P'  `Y8b  `88.       .888' `888   `Y88.  d8P'  `Y8b  `888b.     `8' `888'     `8 `888b.     `8' 8'   888   `8 d8P'    `Y8
// 888          888      888  888b     d'888   888   .d88' 888      888  8 `88b.    8   888          8 `88b.    8       888      Y88bo.
// 888          888      888  8 Y88. .P  888   888ooo88P'  888      888  8   `88b.  8   888oooo8     8   `88b.  8       888       `"Y8888o.
// 888          888      888  8  `888'   888   888         888      888  8     `88b.8   888    "     8     `88b.8       888           `"Y88b
// `88b    ooo  `88b    d88'  8    Y     888   888         `88b    d88'  8       `888   888       o  8       `888       888      oo     .d8P
//  `Y8bood8P'   `Y8bood8P'  o8o        o888o o888o         `Y8bood8P'  o8o        `8  o888ooooood8 o8o        `8      o888o     8""88888P'
// Components //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// All components must define 'spawn', and 'destroy' functions in order
// to be correctly added/removed by the 'blueprint' object.

///////////////////////////////////////////////////////////////////////////////
// State Machines
///////////////////////////////////////////////////////////////////////////////
jb.stateMachines = {
  machines: [],
  updating: [],
  toAdd: [],
  toRemove: [],

  addMachine: function(machine) {
    if (this.machines.indexOf(machine) < 0) {
      this.machines.push(machine);
    }
  },

  removeMachine: function(machine) {
    jb.removeFromArray(this.machines, machine);
    jb.removeFromArray(this.updating, machine, true);
  },

  transitionTo: function(that, state) {
    var bWantsUpdate = false,
        bTransitioned = false;

    that.smNextState = null;

    if (state && state !== that.smCurrentState) {
      // Exit current state.
      if (that.smCurrentState && that.smCurrentState.exit) {
        that.smCurrentState.exit.call(that);
      }

      that.smCurrentState = state;

      if (that.smCurrentState) {
        if (that.smCurrentState.enter) {
          that.smCurrentState.enter.call(that);
        }

        bWantsUpdate = true;
      }

      bTransitioned = true;
    }
    else if (state === null) {
      that.smCurrentState = null;
    }

    return bTransitioned;
  },

  update: function() {
    var i = 0,
        that = null;

    if (this.toAdd.length) {
      for (i=0; i<this.toAdd.length; ++i) {
        that = this.toAdd[i];
        jb.assert(that.smNextState, "Starting state machine has to starting state!");
        jb.assert(!that.smCurrentState, "Starting state machine has existing state!");

        that.smCurrentState = that.smNextState;

        if (that.smNextState.enter) {
          that.smNextState.enter.call(that);
        }

        this.updating.push(this.toAdd[i]);
      }
      this.toAdd.length = 0;
    }

    for (i=0; i<this.updating.length; ++i) {
      that = this.updating[i];

      if (that.smNextState && that.smNextState !== that.smCurrentState) {
        if (that.smCurrentState.exit) {
          that.smCurrentState.exit.call(that);
        }

        that.smCurrentState = that.smNextState;
        that.smNextState = null;
      }

      if (that.smCurrentState) {
        that.smAllowStateChange = true;

        if (that.smCurrentState.update) {
          that.smCurrentState.update.call(that, jb.time.deltaTime);

          if (that.smNextState && that.smNextState !== that.smCurrentState) {
            if (that.smCurrentState.exit) {
              that.smCurrentState.exit.call(that);
            }

            if (that.smNextState.enter) {
              that.smNextState.enter.call(that);
            }

            that.smCurrentState = that.smNextState;
            that.smNextState = null;
          }
        }
        else {
          // No update state, so force a stop.
          that.stateMachineStop();
        }

        that.smAllowStateChange = false;
      }
    }

    if (this.toRemove.length) {
      for (i=0; i<this.toRemove.length; ++i) {
        that = this.toRemove[i];
        jb.assert(that.smCurrentState, "Stopping state machine has no state!");

        if (that.smCurrentState.exit) {
          that.smCurrentState.exit.call(that);
        }

        that.smCurrentState = null;

        jb.removeFromArray(jb.stateMachines.updating, that, true);
      }
      this.toRemove.length = 0;
    }
  },

  // Blueprint Interface //////////////////////////////////////////////////////
  spawn: function(instance) {
    if (!instance.smCurrentState) {
      instance.smCurrentState = null;
    }

    if (!instance.smNextState) {
      instance.smNextState = null;
    }

    if (!instance.smAllowStateChange) {
      instance.smAllowStateChange = false;
    }

    this.addMachine(instance);
  },

  destroy: function(instance) {
    this.removeMachine(instance);
  },

  // Mixins ///////////////////////////////////////////////////////////////////
  stateMachineStart: function(state) {
    jb.assert(!this.smCurrentState, "State machine already started!");
    jb.assert(jb.stateMachines.updating.indexOf(this) < 0, "State machine already in update list!");

    this.smAllowStateChange = true;
    this.stateMachineSetNextState(state);
    this.smAllowStateChange = false;

    if (jb.stateMachines.toAdd.indexOf(this) < 0) {
      jb.stateMachines.toAdd.push(this);
    }
  },

  stateMachineSetNextState: function(nextState) {
    jb.assert(this.smAllowStateChange, "Illegal state change in state machine!");

    if (this.smCurrentState != nextState) {
      this.smNextState = nextState;
    }
  },

  stateMachineIsInState: function(testState) {
    return testState === this.smCurrentState;
  },

  stateMachineStop: function() {
    jb.assert(this.smCurrentState, "State machine already stopped");
    jb.assert(jb.stateMachines.updating.indexOf(this) >= 0, "State machine not in update list!");

    if (jb.stateMachines.toRemove.indexOf(this) < 0) {
      jb.stateMachines.toRemove.push(this);
    }
  }
};

blueprints.mixins["stateMachine"] = jb.stateMachines;


///////////////////////////////////////////////////////////////////////////////
// Transitions ----------------------------------------------------------------
///////////////////////////////////////////////////////////////////////////////
jb.transitions = {
  // Blueprint Interface //////////////////////////////////////////////////////
  transitioners: [],

  spawn: function(instance) {
    jb.transitions.makeInstance(instance);
    this.transitioners.push(instance);
  },

  destroy: function(instance) {
    jb.removeFromArray(this.transitioners, instance);
  },

  // 'Transitions' Interface //////////////////////////////////////////////////
  makeInstance: function(instance) {
    if (typeof instance.transitions === "undefined") {
      instance.transitions = [];
    }

    if (typeof instance.transitionStates === "undefined") {
      instance.transitionStates = {};
    }
  },

  transitionState: function(tStart, tEnd, tNow, duration, fnUpdate, fnFinalize) {
    this.reset = function(tStart, tEnd, tNow, duration, fnUpdate, fnFinalize) {
      this.tStart = tStart;
      this.tEnd = tEnd;
      this.tNow = tNow;
      this.duration = Math.max(duration, 1);
      this.update = fnUpdate;
      this.finalize = fnFinalize;
      this.bActive = false;
    }
  },

  update: function() {
    var iTransitioner = 0,
        param = 0,
        transitioner = null;

    for (iTransitioner=0; iTransitioner<this.transitioners.length; ++iTransitioner) {
      transitioner = this.transitioners[iTransitioner];
      if (transitioner !== null) {
        transitioner.transitionerUpdate.apply(transitioner);
      }
    }
  },

  isTransitioning: function() {
    var i = 0,
        bTransitioning = false;

    for (i=0; i<this.transitioners.length; ++i) {
      if (this.transitioners[i] && this.transitioners[i].transitionerCountActiveTransitions() > 0) {
        bTransitioning = true;
        break;
      }
    }

    return bTransitioning;
  },

  // Mixins -------------------------------------------------------------------
  // All mixins must start with the prefix 'transitions' in order to be added
  // to the instance's prototype.

  bDoUpdate: true,  // DEBUG: set to 'false' to disable update look. Useful for debugging infinite loops.

  transitionerUpdate: function() {
    var param = 0,
        dt = jb.time.deltaTimeMS,
        timeUsed = 0,
        curState = this.transitions[0];

    while (jb.transitions.bDoUpdate && dt > 0 && this.transitions.length > 0 && curState) {
      curState.bActive = true;
      timeUsed = Math.min(dt, curState.tEnd - curState.tNow);
      dt -= timeUsed;
      curState.tNow += timeUsed;
      param = Math.min(1.0, (curState.tNow - curState.tStart) / curState.duration);

      curState.update(param);

      if (Math.abs(param - 1.0) < jb.EPSILON) {
        this.transitionerFinalizeCurrent();
      }

      curState = this.transitions[0];
    }
  },

  transitionerCountActiveTransitions: function() {
    return this.transitions.length;
  },

  transitionerParamToEaseInOut: function(param) {
    var easedParam = (1.0 + Math.sin(-Math.PI * 0.5 + Math.PI * param)) * 0.5;
    return easedParam * easedParam;
  },

  transitionerAdd: function(name, duration, fnUpdate, fnFinalize, bReset) {
    var newTransition = null,
        tStart = 0,
        curParam = 0;

    duration *= 1000;

    // See if this transition state already exists for us.
    newTransition = this.transitionStates[name];

    if (!newTransition) {
      // No previous
      newTransition = new jb.transitions.transitionState()
      bReset = true;
    }

    if (!newTransition.bActive || bReset) {
      // Old transition finished or we're resetting it.
      newTransition.reset(jb.time.now, jb.time.now + duration, jb.time.now, duration, fnUpdate.bind(this), fnFinalize.bind(this));
    }
    else {
      // Old transition exists and is still active.
      // Figure out where we should start the new transition. If we're
      // already tracking a transitionState of this type, we should
      // start where the last one left off.
      curParam = (newTransition.tNow - newTransition.tStart) / newTransition.duration;
      newTransition.tEnd = newTransition.tNow + (1 - curParam) * duration;
      newTransition.reset(newTransition.tNow - curParam * duration, newTransition.tEnd, newTransition.tNow, duration, update.bind(this), finalize.bind(this));
    }

    this.transitions.push(newTransition);
    this.transitionStates[name] = newTransition;
  },

  transitionerFinalizeCurrent: function() {
    if (this.transitions[0]) {
      this.transitions[0].finalize();
      this.transitions[0].bActive = false;
      this.transitionStates[this.transitions[0].name] = null;
      this.transitions.shift();
    }
  },

  transitionerFinalizeAll: function() {
    var i = 0;

    while (this.transitions.length) {
      this.transitionerFinalizeCurrent();
    }
  }
};

blueprints.mixins["transitioner"] = jb.transitions;

///////////////////////////////////////////////////////////////////////////////
// Touchables -----------------------------------------------------------------
///////////////////////////////////////////////////////////////////////////////
jb.touchables = {
    // Blueprint Interface ////////////////////////////////////////////////////
    spawn: function(instance) {
        var i = 0,
            bInserted = false;

        jb.touchables.makeInstance(instance);
        jb.touchables.instances.unshift(instance);
    },

    destroy: function(instance) {
        var index = jb.touchables.instances.indexOf(instance);

        // Remove the instance from the instances array.
        // TODO: replace 'splice' with an optimizable function.
        if (index >= 0) {
            jb.touchables.instances.splice(index, 1);
        }
    },

    // 'Touchables' Implementation ////////////////////////////////////////////
    instances: [],

    makeInstance: function(instance) {
        if (!instance.bounds) {
            instance.bounds = new jb.bounds(0, 0, 0, 0);
        }

        if (!instance.touchLayer) {
            instance.touchLayer = 0;
        }

        if (!instance.onTouched) {
          instance.onTouched = null;
        }

        if (!instance.onUntouched) {
          instance.onUntouched = null;
        }

        instance.bTouchableEnabled = true;
    },

    getTouched: function(screenX, screenY) {
        var i,
            touched = null,
            x = jb.screenToWorldX(screenX),
            y = jb.screenToWorldY(screenY);

        for (i=jb.touchables.instances.length - 1; i>=0; --i) {
            if (jb.touchables.instances[i].bTouchableEnabled && jb.touchables.instances[i].bounds.contain(x, y)) {
                touched = jb.touchables.instances[i];
                if (touched.onTouched) {
                  touched.onTouched.call(touched, screenX, screenY);
                }
                break;
            }
        }

        return touched;
    },

    // Mixins ---------------------------------------------
    // All "mixin" functions must start with the prefix
    // "touchable" in order to flag their inclusion into
    // the specified prototypes.
    // e.g.:
    //     touchableGetLayer: function() { .. },
    touchableSetLayer: function(newLayer) {
      if (jb.touchables.instances.indexOf(this) >= 0) {
        jb.removeFromArray(jb.touchables.instances, this, true);
      }

      this.touchLayer = Math.max(0, newLayer);

      for (i=0; i<jb.touchables.instances.length; ++i) {
          if (instance.touchLayer <= jb.touchables.instances[i].touchLayer) {
              // Insert the instance at this point.
              // TODO: replace 'splice' with an optimizable function.
              jb.touchables.splice(i, 0, instance);
              bInserted = true;
              break;
          }
      }

      if (!bInserted) {
          jb.touchables.instances.push(instance);
      }
    },

    touchableEnable: function() {
      this.bTouchableEnabled = true;
    },

    touchableDisable: function() {
      this.bTouchabelDisabled = false;
    }
};

blueprints.mixins["touchable"] = jb.touchables;

///////////////////////////////////////////////////////////////////////////////
// Swipeables -----------------------------------------------------------------
///////////////////////////////////////////////////////////////////////////////
jb.swipeables = {
    // Blueprint Interface ////////////////////////////////////////////////////
    spawn: function(instance) {
        var i = 0,
            bInserted = false;

        jb.swipeables.makeInstance(instance);

        if (!bInserted) {
            jb.swipeables.instances.push(instance);
        }
    },

    destroy: function(instance) {
        var index = jb.swipeables.instances.indexOf(instance);

        // Remove the instance from the instances array.
        // TODO: replace 'splice' with an optimizable function.
        if (index >= 0) {
            jb.swipeables.instances.splice(index, 1);
        }
    },

    // 'Swipeables' Implementation ////////////////////////////////////////////
    instances: [],

    makeInstance: function(instance) {
        if (!instance.bounds) {
            instance.bounds = new jb.bounds(0, 0, 0, 0);
        }

        instance.touchLayer = 0;
        instance.bSwipeableEnabled = true;

        if (!instance.onTouched) {
          instance.onTouched = null;
        }

        if (!instance.onUntouched) {
          instance.onUntouched = null;
        }
    },

    getSwiped: function() {
        var i,
            swiped = null,
            sx = jb.screenToWorldX(jb.swipe.lastX),
            sy = jb.screenToWorldY(jb.swipe.lastY),
            ex = jb.screenToWorldX(jb.swipe.endX),
            ey = jb.screenToWorldY(jb.swipe.endY);

        jb.swipe.allSwiped.length = 0;

        for (i=jb.swipeables.instances.length - 1; i>=0; --i) {
            if (jb.swipeables.instances[i].bSwipeableEnabled && (jb.swipeables.instances[i].bounds.intersectLine(sx, sy, ex, ey))) {
              swiped = jb.swipeables.instances[i];

              jb.swipe.allSwiped.push(swiped);

              if (jb.swipe.swiped.indexOf(swiped) < 0) {
                jb.swipe.swiped.push(swiped);

                if (swiped.onSwiped) {
                  swiped.onSwiped.call(swiped);
                }
              }
            }
        }
    },

    // Mixins ---------------------------------------------
    // All "mixin" functions must start with the prefix
    // "swipeable" in order to flag their inclusion into
    // the specified prototypes.
    // e.g.:
    //     swipeableGetLayer: function() { .. },
    swipeableSetLayer: function(newLayer) {
      if (jb.swipeables.instances.indexOf(this) >= 0) {
        jb.removeFromArray(jb.swipeables.instances, this, true);
      }

      this.swipeLayer = Math.max(0, newLayer);

      for (i=0; i<jb.swipeables.instances.length; ++i) {
          if (instance.swipeLayer <= jb.swipeables.instances[i].swipeLayer) {
              // Insert the instance at this point.
              // TODO: replace 'splice' with an optimizable function.
              jb.swipeables.splice(i, 0, instance);
              bInserted = true;
              break;
          }
      }

      if (!bInserted) {
          jb.swipeables.instances.push(instance);
      }
    },

    swipeableEnable: function() {
      this.bSwipeableEnabled = true;
    },

    swipeableDisable: function() {
      this.bSwipeableEnabled = false;
    }
};

blueprints.mixins["swipeable"] = jb.swipeables;

/////////////////////////////////////////////////////////////////////////////////////////////
// ooooo   ooooo oooooooooooo ooooo        ooooooooo.   oooooooooooo ooooooooo.    .oooooo.o
// `888'   `888' `888'     `8 `888'        `888   `Y88. `888'     `8 `888   `Y88. d8P'    `Y8
//  888     888   888          888          888   .d88'  888          888   .d88' Y88bo.
//  888ooooo888   888oooo8     888          888ooo88P'   888oooo8     888ooo88P'   `"Y8888o.
//  888     888   888    "     888          888          888    "     888`88b.         `"Y88b
//  888     888   888       o  888       o  888          888       o  888  `88b.  oo     .d8P
// o888o   o888o o888ooooood8 o888ooooood8 o888o        o888ooooood8 o888o  o888o 8""88888P'
// Helpers //////////////////////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////////////////
// tileSheet Object
///////////////////////////////////////////////////////////////////////////////
jb.tileSheetObj = function(source, cellDx, cellDy, left, top, right, bottom) {
  this.source = source;
  this.top = top;
  this.left = left;
  this.cellDx = cellDx;
  this.cellDy = cellDy;

  if (typeof left === 'undefined') left = 0;
  if (typeof top === 'undefined') top = 0;
  if (typeof right === 'undefined') right = source.width - 1;
  if (typeof bottom === 'undefined') bottom = source.height - 1;
  
  this.left = left;
  this.top = top;

  this.rows = (bottom - top + 1) / cellDy;
  this.cols = (right - left + 1) / cellDx;
};

jb.tileSheetObj.prototype.draw = function(ctxt, destX, destY, cellRow, cellCol, scaleX, scaleY, rotation, anchorX, anchorY) {
  var offsetX = 0,
      offsetY = 0,
      dx = 0,
      dy = 0;
      
  if (typeof scaleX === 'undefined') scaleX = 1;
  if (typeof scaleY === 'undefined') scaleY = 1;
  if (typeof rotation === 'undefined') rotation = 0;
  if (typeof anchorX === 'undefined') anchorX = 0;
  if (typeof anchorY === 'undefined') anchorY = 0;

  if (typeof cellRow === 'undefined' || typeof cellRow === 'object') { // 'object' indicates 'null' was passed in for cellRow
    // Assume cellRow is actually a 1D array index into the sheet.
    cellCol = cellRow % this.cols;
    cellRow = Math.floor(cellRow / this.cols);
  }

  ctxt.save();
  if (rotation || scaleX < 0 || scaleY < 0) {
    if (scaleX < 0) {
      offsetX = Math.round(this.cellDx * (anchorX - 0.5) * scaleX / Math.abs(scaleX));
    }
      
    if (scaleY < 0) {
      offsetY = Math.round(this.cellDy * (anchorY - 0.5) * scaleY / Math.abs(scaleY));
    }

    dx = destX + offsetX;
    dy = destY + offsetY;

    ctxt.translate(dx, dy);
    destX = -offsetX;
    destY = -offsetY;

    if (scaleX !== 1.0 || scaleY !== 1.0) {
      ctxt.scale(scaleX, scaleY);
      scaleX = 1.0;
      scaleY = 1.0;
    }

    ctxt.rotate(rotation);
  }

  ctxt.drawImage(this.source,
                 this.left + cellCol * this.cellDx - 0.25 / scaleX, // 0.25 / scaleX -> HACK to prevent anti-aliasing from adding extra pixels when drawing a scaled sprite.
                 this.top + cellRow * this.cellDy + 0.25 / scaleY, // 0.25 / scaleY -> HACK to prevent anti-aliasing from adding extra pixels when drawing a scaled sprite.
                 this.cellDx,
                 this.cellDy,
                 destX,
                 destY,
                 Math.round(this.cellDx * scaleX),
                 Math.round(this.cellDy * scaleY));

  ctxt.restore();
};

jb.tileSheetObj.prototype.drawTile = function(ctxt, left, top, destRow, destCol, cellRow, cellCol, scaleX, scaleY) {
  if (arguments.length < 7) {
    // Assume cellRow is actually a 1D array index into the sheet.
    cellCol = cellRow % this.cols;
    cellRow = Math.floor(cellRow / this.cols);
  }

  scaleX = scaleX || 1;
  scaleY = scaleY || 1;

  ctxt.drawImage(this.source,
                 this.left + cellCol * this.cellDx,
                 this.top + cellRow * this.cellDy,
                 this.cellDx,
                 this.cellDy,
                 left + destCol * this.cellDx * scaleX,
                 top + destRow * this.cellDy * scaleY,
                 this.cellDx * scaleX,
                 this.cellDy * scaleY);
}

jb.tileSheetObj.prototype.getCellWidth = function() {
  return this.cellDx;
};

jb.tileSheetObj.prototype.getCellHeight = function() {
  return this.cellDy;
};

jb.tileSheetObj.prototype.getNumCells = function() {
  return this.rows * this.cols;
};

///////////////////////////////////////////////////////////////////////////////
// Array Utilities
///////////////////////////////////////////////////////////////////////////////
jb.removeFromArray = function(theArray, theElement, bPreserveOrder) {
    var index = theArray.indexOf(theElement),
        i = 0;

    if (index >= 0) {
      if (!bPreserveOrder) {
        if (index >= 0) {
            theArray[index] = theArray[theArray.length - 1];
        }
      }
      else {
        for (i=index; i<theArray.length - 1; ++i) {
          theArray[i] = theArray[i + 1];
        }
      }

      theArray.length -= 1;
    }
};

jb.randomizeArray = function(array) {
  var i = 0,
      temp = null,
      index = 0;

  if (array) {
    for (i=0; i<array.length; ++i) {
      index = Math.floor(Math.random() * (array.length - i));
      temp = array[index];
      array[index] = array[array.length - i - 1];
      array[array.length - i - 1] = temp;
    }
  }
};

///////////////////////////////////////////////////////////////////////////////
// requestAnimationFrame
///////////////////////////////////////////////////////////////////////////////
// http://paulirish.com/2031/requestanimationframe-for-smart-animating/
// http://my.opera.com/emoller/blog/2031/12/20/requestanimationframe-for-smart-er-animating
 
// requestAnimationFrame polyfill by Erik Möller
// fixes from Paul Irish and Tino Zijdel
 
(function() {
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame']
                                   || window[vendors[x]+'CancelRequestAnimationFrame'];
    }
 
    if (!window.requestAnimationFrame)
        window.requestAnimationFrame = function(callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function() { callback(currTime + timeToCall); },
              timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };
 
    if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
}());

///////////////////////////////////////////////////////////////////////////////
// ooo        ooooo       .o.       ooooooooooooo ooooo   ooooo
// `88.       .888'      .888.      8'   888   `8 `888'   `888'
//  888b     d'888      .8"888.          888       888     888
//  8 Y88. .P  888     .8' `888.         888       888ooooo888
//  8  `888'   888    .88ooo8888.        888       888     888
//  8    Y     888   .8'     `888.       888       888     888
// o8o        o888o o88o     o8888o     o888o     o888o   o888o
// Math ///////////////////////////////////////////////////////////////////////
jb.MathEx = {};

jb.MathEx.linesIntersect = function(x11, y11, x12, y12, x21, y21, x22, y22) {
    var vx1121 = x21 - x11,  // First point in segment 1 to first point in segment 2, x-coord.
        vy1121 = y21 - y11,  // First point in segment 1 to first point in segment 2, y-coord.
        vx1122 = x22 - x11,  // First point in segment 1 to second point in segment 2, x-coord.
        vy1122 = y22 - y11,  // First point in segment 1 to second point in segment 2, y-coord.
        c1 = vx1121 * vy1122 - vx1122 * vy1121,
        vx1221 = x21 - x12, // Second point in segment 1 to first point in segment 2, x-coord.
        vy1221 = y21 - y12, // Second point in segment 1 to first point in segment 2, y-coord.
        vx1222 = x22 - x12, // Second point in segment 1 to second point in segment 2, x-coord.
        vy1222 = y22 - y12, // Second point in segment 1 to second point in segment 2, y-coord.
        c2 = vx1221 * vy1222 - vx1222 * vy1221,
        c3 = 1,
        c4 = 1;

        if (c1 * c2 <= 0.0) {
          c3 = vx1121 * vy1221 - vy1121 * vx1221;
          c4 = vx1122 * vy1222 - vy1122 * vx1222;
        }

        return c3 * c4 <= 0.0;
};

jb.MathEx.zeroNorm = function(dx, dy) {
  return Math.max(Math.abs(dx), Math.abs(dy));
};

jb.MathEx.oneNorm = function(dx, dy) {
  return Math.abs(dx) + Math.abs(dy);
};

jb.MathEx.twoNorm = function(dx, dy) {
  return Math.round(Math.sqrt(dx * dx + dy * dy));
};

jb.MathEx.sign = function(x) {
  return x > 0 ? 1 : (x < 0 ? -1 : 0);
};

jb.MathEx.bresenhamInterp = function(x1, y1, x2, y2, step, current) {
  var dx = x2 - x1,
      dy = y2 - y1,
      absDx = Math.abs(dx),
      absDy = Math.abs(dy),
      curDx = Math.abs(current.x - x1),
      curDy = Math.abs(current.y - y1),
      modFactor = 0,
      nextDx = 0,
      nextDy = 0,
      progX = 0,
      progY = 0,
      doModX = false;

  if (absDx === absDy) {
    doModX = curDx < curDy;
  }
  else if (absDx === 0) {
    doModX = false;
  }
  else if (absDy === 0) {
    doModX = true;
  }
  else {
    absDx += 1;
    absDy += 1;
    curDx += 1;
    curDy += 1;

    nextDx = Math.abs(current.x + jb.MathEx.sign(dx) - x1);
    nextDy = Math.abs(current.y + jb.MathEx.sign(dy) - y1);
    progX = nextDx / absDx;
    progY = nextDy / absDy;

    if (progX === progY) {
      doModX = curDx / absDx < curDy / absDy;
    }
    else {
      doModX = progX < progY;
    }
  }

  if (doModX) {
    current.x += jb.MathEx.sign(dx);
  }
  else {
    current.y += jb.MathEx.sign(dy);
  }
};

jb.MathEx.simpleInterp2d = function(x1, y1, x2, y2, step, result) {
  var dx = x2 - x1,
      dy = y2 - y1,
      isMaxX = Math.abs(dx) > Math.abs(dy),
      stepX = isMaxX ? jb.MathEx.sign(dx) : dx / Math.abs(dy),
      stepY = isMaxX ? dy / Math.abs(dx) : jb.MathEx.sign(dy);

  if (result) {
    result.x = Math.floor(x1 + stepX * step);
    result.y = Math.floor(y1 + stepY * step);
  }
};

// Cubic Splines --------------------------------------------------------------
jb.MathEx.cubic = function(a, b, c, d, u) {
   this.a = a;
   this.b = b;
   this.c = c;
   this.d = d;
};

jb.MathEx.cubic.prototype.getValueAt = function(u){
  return (((this.d * u) + this.c) * u + this.b) * u + this.a;
};

jb.MathEx.calcNaturalCubic = function(values, component, cubics) {
   var num = values.length - 1;
   var gamma = []; // new float[num+1];
   var delta = []; // new float[num+1];
   var D = []; // new float[num+1];
   var i = 0;

   /*
        We solve the equation
       [2 1       ] [D[0]]   [3(x[1] - x[0])  ]
       |1 4 1     | |D[1]|   |3(x[2] - x[0])  |
       |  1 4 1   | | .  | = |      .         |
       |    ..... | | .  |   |      .         |
       |     1 4 1| | .  |   |3(x[n] - x[n-2])|
       [       1 2] [D[n]]   [3(x[n] - x[n-1])]
       
       by using row operations to convert the matrix to upper triangular
       and then back sustitution.  The D[i] are the derivatives at the knots.
   */
   gamma.push(1.0 / 2.0);
   for(i=1; i< num; i++) {
      gamma.push(1.0/(4.0 - gamma[i-1]));
   }
   gamma.push(1.0/(2.0 - gamma[num-1]));

   p0 = values[0][component];
   p1 = values[1][component];
         
   delta.push(3.0 * (p1 - p0) * gamma[0]);
   for(i=1; i< num; i++) {
      p0 = values[i-1][component];
      p1 = values[i+1][component];
      delta.push((3.0 * (p1 - p0) - delta[i - 1]) * gamma[i]);
   }
   p0 = values[num-1][component];
   p1 = values[num][component];

   delta.push((3.0 * (p1 - p0) - delta[num - 1]) * gamma[num]);

   D.unshift(delta[num]);
   for(i=num-1; i >= 0; i--) {
      D.unshift(delta[i] - gamma[i] * D[0]);
   }

   /*
        now compute the coefficients of the cubics
   */
   cubics.length = 0;

   for(i=0; i<num; i++) {
      p0 = values[i][component];
      p1 = values[i+1][component];

      cubics.push(new jb.MathEx.cubic(
                     p0,
                     D[i],
                     3*(p1 - p0) - 2*D[i] - D[i+1],
                     2*(p0 - p1) +   D[i] + D[i+1]
                   )
               );
   }
};

jb.MathEx.Spline2D = function() {
   this.points = [];
   this.xCubics = [];
   this.yCubics = [];
};

jb.MathEx.Spline2D.prototype.reset = function() {
  this.points.length = 0;
  this.xCubics.length = 0;
  this.yCubics.length = 0;
};
 
jb.MathEx.Spline2D.prototype.addPoint = function(point) {
   this.points.push(point);
};
 
jb.MathEx.Spline2D.prototype.getPoints = function() {
   return this.points;
};
 
jb.MathEx.Spline2D.prototype.calcSpline = function() {
   jb.MathEx.calcNaturalCubic(this.points, "x", this.xCubics);
   jb.MathEx.calcNaturalCubic(this.points, "y", this.yCubics);
};
 
jb.MathEx.Spline2D.prototype.getPoint = function(position) {
   position = position * this.xCubics.length; // extrapolate to the arraysize
    
   var cubicNum = Math.floor(position);
   var cubicPos = (position - cubicNum);
    
   return {x: this.xCubics[cubicNum].getValueAt(cubicPos),
           y: this.yCubics[cubicNum].getValueAt(cubicPos)};
};

jb.MathEx.Spline3D = function() {
   this.points = [];
   this.xCubics = [];
   this.yCubics = [];
   this.zCubics = [];
};

jb.MathEx.Spline3D.prototype.reset = function() {
 this.points.length = 0;
 this.xCubics.length = 0;
 this.yCubics.length = 0;
 this.zCubics.length = 0;
};

jb.MathEx.Spline3D.prototype.addPoint = function() {
  this.points.push(point);
};

jb.MathEx.Spline3D.prototype.getPoints = function() {
  return this.points;
};

jb.MathEx.Spline3D.prototype.calcSpline = function() {
  jb.MathEx.calcNaturalCubic(this.points, "x", this.xCubics);
  jb.MathEx.calcNaturalCubic(this.points, "y", this.yCubics);
  jb.MathEx.calcNaturalCubic(this.points, "z", this.zCubics);
};

jb.MathEx.Spline3D.prototype.getPoint = function(position) {
  position = position * this.xCubics.length; // extrapolate to the arraysize
  
  var cubicNum = Math.floor(position);
  var cubicPos = (position - cubicNum);
  
  return {x: this.xCubics[cubicNum].getValueAt(cubicPos),
          y: this.yCubics[cubicNum].getValueAt(cubicPos),
          z: this.zCubics[cubicNum].getValueAt(cubicPos)};
};

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// .oooooo..o                   o8o      .             oooo         .o8                                          .o8
// d8P'    `Y8                   `"'    .o8             `888        "888                                         "888
// Y88bo.      oooo oooo    ooo oooo  .o888oo  .ooooo.   888 .oo.    888oooo.   .ooooo.   .oooo.   oooo d8b  .oooo888
// `"Y8888o.   `88. `88.  .8'  `888    888   d88' `"Y8  888P"Y88b   d88' `88b d88' `88b `P  )88b  `888""8P d88' `888
//     `"Y88b   `88..]88..8'    888    888   888        888   888   888   888 888   888  .oP"888   888     888   888
// oo     .d8P    `888'`888'     888    888 . 888   .o8  888   888   888   888 888   888 d8(  888   888     888   888
// 8""88888P'      `8'  `8'     o888o   "888" `Y8bod8P' o888o o888o  `Y8bod8P' `Y8bod8P' `Y888""8o d888b    `Y8bod88P"
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
jb.switchboard = {
  toAdd: [],
  toRemove: [],
  messageTable: {},
};

jb.switchboard.addListener = function(listener, message) {
  jb.assert(listener, "No listener defined!");
  jb.assert(message, "No message defined!");
  
  this.toAdd.push({listener: listener, message: message});
};

jb.switchboard.removeListener = function(listener, message) {
  jb.assert(listener, "No listener defined!");
  this.toRemove.push({listener: listener, message: message});
};

jb.switchboard.update = function() {
  this.removePendingListeners();
  this.addPendingListeners();
};

jb.switchboard.clear = function() {
  jb.toAdd.length = 0;
  jb.toRemove.length = 0;
  jb.messageTable = {};
};

jb.switchboard.addPendingListeners = function() {
  while (this.toAdd.length > 0) {
    var listener = this.toAdd[0][listener];
    var message = this.toAdd[0][message].toLowerCase();
    this.toAdd.shift();
    
    if (!this.messageTable[message]) {
      this.messageTable[message] = [];
    }
    
    var listeners = this.messageTable[message];
    if (listeners.indexOf(listener) < 0) {
      listeners.push(listener);
    }
  }
};

jb.switchboard.removePendingListeners = function() {
  while (this.toRemove.length > 0) {
    var listener = this.toRemove[0][listener];
    var message = this.toRemove[0][message].toLowerCase();
    this.toRemove.shift();
    
    if (message) {
      var listeners = this.messageTable[message];
      
      if (listeners && listeners.indexOf(listener) >= 0) {
        jb.removeFromArray(listeners, listener);
      }
    }
    else {
      for ([message, listeners] of Object.entries(this.messageTable)) {
        if (listeners.indexOf(listener) >= 0) {
          jb.removeFromArray(listeners, listener);
        }
      }
    }
  }
};

jb.switchboard.broadcast = function(message, arg) {
  var listeners = this.messageTable[message.toLowerCase()];
  if (listeners) {
    for (var listener in listeners) {
      listeners[message](arg);
    }
  }
};

///////////////////////////////////////////////////////////////////////////////
// ooooooooooooo oooooo   oooo ooooooooo.   oooooooooooo  .oooooo.o
// 8'   888   `8  `888.   .8'  `888   `Y88. `888'     `8 d8P'    `Y8
//      888        `888. .8'    888   .d88'  888         Y88bo.
//      888         `888.8'     888ooo88P'   888oooo8     `"Y8888o.
//      888          `888'      888          888    "         `"Y88b
//      888           888       888          888       o oo     .d8P
//     o888o         o888o     o888o        o888ooooood8 8""88888P'
// Types //////////////////////////////////////////////////////////////////////
jb.bounds = function(left, top, width, height) {
    this.set(left, top, width, height);
    this.isBound = true;
};

jb.bounds.prototype.clear = function() {
  this.t = 0;
  this.l = 0;
  this.w = 0;
  this.h = 0;
};

jb.bounds.prototype.set = function(left, top, width, height) {
    this.t = top || 0;
    this.l = left || 0;
    this.w = width || 0;
    this.h = height || 0;

    this.halfWidth = Math.round(this.w * 0.5);
    this.halfHeight = Math.round(this.h * 0.5);
};

jb.bounds.prototype.contain = function(x, y) {
    return this.l <= x && this.l + this.w >= x &&
           this.t <= y && this.t + this.h >= y;
};

jb.bounds.prototype.intersectLine = function(sx, sy, ex, ey) {
  return jb.MathEx.linesIntersect(sx, sy, ex, ey, this.l, this.t, this.l + this.w, this.t) ||
         jb.MathEx.linesIntersect(sx, sy, ex, ey, this.l + this.w, this.t, this.l + this.w, this.t + this.h) ||
         jb.MathEx.linesIntersect(sx, sy, ex, ey, this.l + this.w, this.t + this.h, this.l, this.t + this.h) ||
         jb.MathEx.linesIntersect(sx, sy, ex, ey, this.l, this.t + this.h, this.l, this.t) ||
         // These last two tests shouldn't be necessary, but inaccuracies in the above four
         // tests might make them necessary.
         this.contain(sx, sy) ||
         this.contain(ex, ey);
};

jb.bounds.prototype.copy = function(dest) {
    dest.t = this.t;
    dest.l = this.l;
    dest.w = this.w;
    dest.h = this.h;
    dest.halfWidth = this.halfWidth;
    dest.halfHeight = this.halfHeight;
};

jb.bounds.prototype.scale = function(sx, sy, anchorX, anchorY) {
    var xScale = sx || 1,
        yScale = sy || xScale,
        anchorPoint;

    xScale = Math.abs(xScale);
    yScale = Math.abs(yScale);
    anchorX = anchorX === undefined ? 0.5 : anchorX;
    anchorY = anchorY === undefined ? 0.5 : anchorY;

    anchorPoint = this.t + this.h * anchorY;
    this.h = Math.round(this.h * yScale);
    this.t = Math.round(anchorPoint - this.h * anchorY);

    anchorPoint = this.l + this.w * anchorX;
    this.w = Math.round(this.w * xScale);
    this.l = Math.round(anchorPoint - this.w * anchorX);

    this.halfWidth = Math.round(this.w * 0.5);
    this.halfHeight = Math.round(this.h * 0.5);
};

jb.bounds.prototype.moveTo = function(left, top) {
    this.t = top;
    this.l = left;
};

jb.bounds.prototype.moveBy = function(dl, dt) {
    this.t += dt;
    this.l += dl;
};

jb.bounds.prototype.resizeTo = function(width, height) {
    this.w = width;
    this.h = height;
    
    this.screen

    this.halfWidth = Math.round(this.w * 0.5);
    this.halfHeight = Math.round(this.h * 0.5);
};

jb.bounds.prototype.resizeBy = function(dw, dh) {
    this.w += dw;
    this.h += dh;

    this.halfWidth = Math.round(this.w * 0.5);
    this.halfHeight = Math.round(this.h * 0.5);
};

jb.bounds.prototype.overlap = function(other) {
    var bInLeftRight = false,
        bInTopBottom = false;

    jb.assert(other, "jb.bounds.intersect: invalid 'other'!");

    if (this.l < other.l) {
        bInLeftRight = other.l < this.l + this.w;
    }
    else {
        bInLeftRight = this.l < other.l + other.w;
    }

    if (this.t < other.t) {
        bInTopBottom = other.t < this.t + this.h;
    }
    else {
        bInTopBottom = this.t < other.t + other.h;
    }

    return bInLeftRight && bInTopBottom;
};

jb.bounds.prototype.intersect = function(other) {
    var bInLeftRight = false,
        bInTopBottom = false;

    jb.assert(other, "jb.bounds.intersect: invalid 'other'!");

    if (this.l < other.l) {
        bInLeftRight = other.l <= this.l + this.w;
    }
    else {
        bInLeftRight = this.l <= other.l + other.w;
    }

    if (this.t < other.t) {
        bInTopBottom = other.t <= this.t + this.h;
    }
    else {
        bInTopBottom = this.t <= other.t + other.h;
    }

    return bInLeftRight && bInTopBottom;
};

jb.bounds.prototype.intersection = function(other, result) {
    jb.assert(other && other.isBound, "jb.bounds.intersection: invalid 'other'!");
    jb.assert(result && result.isBound, "jb.bounds.intersection: invalid 'result'!");

    if (this.l < other.l) {
        result.l = other.l;
        result.w = Math.min(this.l + this.w, other.l + other.w) - result.l;
    }
    else {
        result.l = this.l;
        result.w = Math.min(this.l + this.w, other.l + other.w) - result.l;
    }

    if (this.t < other.t) {
        result.t = other.t;
        result.h = Math.min(this.t + this.h, other.t + other.h) - result.l;
    }
    else {
        result.t = this.t;
        result.h = Math.min(this.t + this.h, other.t + other.h) - result.l;
    }
};

////////////////////////////////////////////////////////////////////////////////
// oooooo     oooo ooo        ooooo
//  `888.     .8'  `88.       .888'
//   `888.   .8'    888b     d'888
//    `888. .8'     8 Y88. .P  888
//     `888.8'      8  `888'   888
//      `888'       8    Y     888
//       `8'       o8o        o888o
// Virtual Machine /////////////////////////////////////////////////////////////
jb.instructions     = []
jb.bStarted         = false;
jb.fnIndex          = 0;
jb.context          = null;
jb.LOOP_ID          = "DO_";
jb.bShowStopped     = true;
jb.interrupt        = false;
jb.time             = {now: Date.now(), deltaTime: 0, deltaTimeMS: 0};
jb.timers           = {};

jb.stackFrame = function(pc) {
    this.pc               = pc;    // Program counter
    this.loopingRoutine   = null;
    this.bUntil           = false;
    this.bWhile           = false;
};

// OS Commands /////////////////////////////////////////////////////////////////
jb.add = function(fn, label) {
    jb.instructions.push({type: "block", code: fn, label: label || "fn" + jb.fnIndex});
    jb.fnIndex += 1;
};

jb.until = function(bUntil) {
    jb.execStack[0].bUntil = bUntil;
},

jb.while = function(bWhile) {
    jb.execStack[0].bWhile = bWhile;
}

// Loop code, when added, will continue to execute as long as it returns 'true'.
jb.addLoop = function(loop, label) {
    jb.instructions.push({type: "loop", code: loop, label: label || "fn" + jb.fnIndex});
    jb.fnIndex += 1;
};

jb.run = function(program) {
    var key = null;

    if (program) {
        if (!jb.bStarted) {
            // TODO: add initialization here?
            jb.bStarted = true;
        }

        // Move the program's functions into the jb virtual machine.
        for (key in program) {
            if (typeof(program[key]) === "function") {
                if (key.length >= jb.LOOP_ID.length && key.substr(0, jb.LOOP_ID.length).toUpperCase() === jb.LOOP_ID) {
                    jb.addLoop(program[key], key);
                }
                else {
                    jb.add(program[key], key);
                }
            }
        }

        jb.execStack.unshift(new jb.stackFrame(-1));

        jb.context = program;

        requestAnimationFrame(jb.loop);
    }
};

// Runtime Commands ////////////////////////////////////////////////////////////
jb.resumeAfter = function(label) {
    var i;

    label = label.toUpperCase();

    for (i=0; i<jb.instructions.length; ++i) {
        if (jb.instructions[i] &&
            jb.instructions[i].label.toUpperCase() === label) {
            jb.bInterrupt = true;
            jb.execStack.unshift(new jb.stackFrame(i - 1));
            break;
        }
    }
};

jb.goto = function(label) {
    var i;

    label = label.toUpperCase();

    for (i=0; i<jb.instructions.length; ++i) {
        if (jb.instructions[i] &&
            jb.instructions[i].label.toUpperCase() === label) {
            jb.execStack[0].pc = i - 1;
            jb.execStack[0].loopingRoutine = null;
            jb.bInterrupt = true;
            break;
        }
    }
};

jb.end = function() {
    jb.execStack.shift();
    if (jb.execStack.length > 0) {
        jb.nextInstruction();
    }
};

// Interal Methods /////////////////////////////////////////////////////////////
jb.loop = function() {
  if (jb.pixiRenderer) {
    jb.screen.width = jb.pixiRenderer.width;
    jb.screen.height = jb.pixiRenderer.height;
  }

  jb.updateTimers();
  jb.stateMachines.update();
  jb.transitions.update();
  jb.switchboard.update();

  if (jb.bInterrupt) {
      jb.nextInstruction();
  }
  else if (jb.execStack.length > 0) {
      if (jb.execStack[0].loopingRoutine) {
          jb.execStack[0].bWhile = null;
          jb.execStack[0].bUntil = null;
          jb.execStack[0].loopingRoutine.bind(jb.context)();

          if (jb.execStack[0].bWhile === null && jb.execStack[0].bUntil === null) {
              jb.print("Missing 'jb.while' or 'jb.until' in " + jb.instructions[jb.execStack[0].pc].label);
              jb.end();
          }
          else if (jb.execStack[0].bUntil === true) {
              jb.nextInstruction();
          }
          else if (jb.execStack[0].bWhile === false) {
              jb.nextInstruction();
          }
      }
      else if (jb.execStack[0].pc < jb.instructions.length) {
          jb.nextInstruction();
      }
  }
};

// jb.render = function() {
//     if (jb.execStack.length <= 0 && jb.bShowStopped) {
//         jb.bShowStopped = false;
//         jb.print("`");
//         jb.print("--- stopped ---");
//     }

//     if (jb.canvas && jb.screen.width > 0 && jb.screen.height > 0) {

//       // Refresh the screen.
//       jb.screenBufferCtxt.save();

//       // Clear screen.
//       jb.screenBufferCtxt.fillStyle = "black";
//       jb.screenBufferCtxt.fillRect(0, 0, jb.screen.width, jb.screen.height);

//       if (Math.abs(1 - jb.viewScale) > jb.EPSILON) {
//         jb.screenBufferCtxt.scale(jb.viewScale, jb.viewScale);
//       }
//       jb.screenBufferCtxt.translate(-jb.viewOrigin.x, -jb.viewOrigin.y);
//       jb.screenBufferCtxt.drawImage(jb.canvas, 0, 0);
//       jb.screenBufferCtxt.restore();

//       if (jb.program && jb.program.drawGUI && jb.screenBufferCtxt) {
//         jb.program.drawGUI(jb.screenBufferCtxt);
//       }
//     }

//     // Request a new a update.
//     requestAnimationFrame(jb.loop);
// };

jb.nextInstruction = function() {
    var instr = null;

    if (jb.execStack.length > 0) {
        for (jb.execStack[0].pc += 1; jb.execStack[0].pc<jb.instructions.length; jb.execStack[0].pc++) {
            instr = jb.instructions[jb.execStack[0].pc];

            jb.reset();
            jb.bForcedBreak = false;
            jb.execStack[0].loopingRoutine = null;

            if (instr.type === "block") {
                instr.code.bind(jb.context)();
                if (jb.bInterrupt) {
                    break;
                }
            }
            else {
                jb.execStack[0].loopingRoutine = instr.code;
                break;
            }

            if (jb.execStack.length <= 0) {
                break;
            }
        }

        if (jb.execStack.length > 0 && jb.execStack[0].pc >= jb.instructions.length) { // !jb.execStack[0].loopingRoutine && jb.bShowStopped) {
            jb.execStack.shift();
            jb.nextInstruction();
        }
    }
};

jb.updateTimers = function() {
    var key,
        lastTime = jb.time.now;

    jb.time.now = Date.now();
    jb.time.deltaTimeMS = (jb.time.now - lastTime);
    jb.time.deltaTime = jb.time.deltaTimeMS * 0.001;

    for (key in jb.timers) {
        jb.timers[key].last = jb.timers[key].now;
        jb.timers[key].now += jb.time.deltaTime;
    }
};

jb.startTimer = function(timerName) {
    jb.timers[timerName] = jb.timers[timerName] || {now: 0, last: -1};

    jb.timers[timerName].now = 0;
    jb.timers[timerName].last = -1;
};

jb.setTimer = function(timerName, timerVal) {
    jb.timers[timerName].now = timerVal;
    jb.timers[timerName].last = timerVal;
};

jb.getTimerTicks = function(timerName, tickInterval, wantsPartialTicks) {
  var ticks = 0;

  if (jb.timers[timerName] && tickInterval > 0) {
    ticks = jb.timers[timerName].now;
    ticks /= tickInterval;

    if (!wantsPartialTicks) {
      ticks = Math.floor(ticks);
    }
  }

  return ticks;
};

jb.rewindTimerTicks = function(timerName, tickInterval, numTicks) {
  var curTime = 0,
      newTime = 0;

  if (jb.timers[timerName]) {
    curTime = jb.timers[timerName].now;
    newTime = curTime - tickInterval * numTicks;

    jb.setTimer(timerName, newTime);
  }
};

jb.timer = function(timerName) {
    return jb.timers[timerName] ? jb.timers[timerName].now : 0;
};

jb.timerLast = function(timerName) {
    return jb.timers[timerName] ? jb.timers[timerName].last : -1;
};

////////////////////////////////////////////////////////////////////////////////
// oooooo     oooo ooooo oooooooooooo oooooo   oooooo     oooo
//  `888.     .8'  `888' `888'     `8  `888.    `888.     .8'
//   `888.   .8'    888   888           `888.   .8888.   .8'
//    `888. .8'     888   888oooo8       `888  .8'`888. .8'
//     `888.8'      888   888    "        `888.8'  `888.8'
//      `888'       888   888       o      `888'    `888'
//       `8'       o888o o888ooooood8       `8'      `8'
// View ////////////////////////////////////////////////////////////////////////
// Get canvas and resize to fit window.
jb.NEWLINE = "`";
jb.OPEN_TYPE_FONT_DEFAULT_VALIGN = 0.5;
jb.OPEN_TYPE_FONT_DEFAULT_HALIGN = 0.5;
jb.OPEN_TYPE_FONT_DEFAULT_COLOR = "white";
jb.columns = 80;
jb.viewScale = 1;
jb.viewOrigin = {x: 0, y: 0 };
jb.rows = 25;
jb.COL_TO_CHAR = 12 / 20;
jb.COL_TO_CHAR_SPACING = 11.69 / 20;
jb.backColor = "black";
jb.foreColor = "green";
jb.fontSize = 1;
jb.row = 0;
jb.col = 0;
jb.fontInfo = null;
jb.bCursorOn = false;
jb.cellSize = {width: 0, height: 0};
jb.globalScale = 1;
jb.openTypeFont = null;
jb.openTypeFontSize = 1;
jb.openTypeFontWidthFudge = 1;
jb.fontMetrics = new jb.bounds(0, 0, 0, 0);
jb.screen = {width: screen.width, height: screen.height};
jb.pixiRenderer = null;

jb.setPixiRenderer = function(renderer) {
  jb.pixiRenderer = renderer;
};

jb.drawImage = function(ctxt, image, xa, ya, anchorX, anchorY) {
  var x = xa - anchorX * image.width,
      y = ya - anchorY * image.height;

    if (ctxt) {
      ctxt.drawImage(image, x, y);
    }
};
jb.relXtoScreenX = function(relX) {
  return Math.round(jb.screen.width * relX);
};
jb.relYtoScreenY = function(relY) {
  return Math.round(jb.screen.height * relY);
};
jb.screenXtoRelX = function(screenX) {
  return screenX / jb.screen.width;
};
jb.screenYtoRelY = function(screenY) {
  return screenY / jb.screen.height;
};
jb.screenToWorldX = function(screenX) {
  return screenX / jb.viewScale + jb.viewOrigin.x;
};
jb.screenToWorldY = function(screenY) {
  return screenY / jb.viewScale + jb.viewOrigin.y;
};
jb.setViewScale = function(newScale) {
  jb.viewScale = newScale;
};
jb.getViewScale = function() {
  return jb.viewScale;
};
jb.setViewOrigin = function(x, y) {
  jb.viewOrigin.x = x || 0;
  jb.viewOrigin.y = y || 0;
};
jb.getViewOrigin = function() {
  return jb.viewOrigin;
};
jb.xFromCol = function(col) {
    return col * jb.cellSize.width;
};
jb.yFromRow = function(row) {
    return row * jb.cellSize.height;
};

////////////////////////////////////////////////////////////////////////////////
// ooooo ooooo      ooo ooooooooo.   ooooo     ooo ooooooooooooo
// `888' `888b.     `8' `888   `Y88. `888'     `8' 8'   888   `8
//  888   8 `88b.    8   888   .d88'  888       8       888
//  888   8   `88b.  8   888ooo88P'   888       8       888
//  888   8     `88b.8   888          888       8       888
//  888   8       `888   888          `88.    .8'       888
// o888o o8o        `8  o888o           `YbodP'        o888o
// Input ///////////////////////////////////////////////////////////////////////
jb.normal = {last: null, down:{}};
jb.special = {last: null, down: {}};
jb.lastCode = -1;
jb.got = "";
jb.input = null;
jb.inputOut = null;
jb.minCol = 0;
jb.bWantsNewInput = true;
jb.INPUT_STATES = {NONE: 0,
                     READ_LINE: 1,
                     READ_KEY: 2};
jb.inputState = jb.INPUT_STATES.NONE;
jb.DOUBLE_TAP_INTERVAL = 333; // Milliseconds
jb.pointInfo = {x:0, y:0, srcElement:null};

jb.keys = {};

jb.keys.isDown = function(whichKey) {
  return jb.keys[whichKey] && jb.keys[whichKey].isDown;
};

jb.readLine = function() {
    var retVal = "";

    if (jb.inputState !== jb.INPUT_STATES.READ_LINE) {
        jb.minCol = jb.col;
    }

    jb.inputState = jb.INPUT_STATES.READ_LINE;
    
    retVal = jb.inputOut;
    jb.inputOut = null;

    return retVal;
};

jb.readKey = function() {
    var retVal = jb.got;

    jb.inputState = jb.INPUT_STATES.READ_KEY;
    
    if (retVal && retVal.length > 1) {
        if (retVal === "space") {
            retVal = " ";
        }
    }
    else if (!jb.got) {
      retVal = null;
    }

    jb.got = "";
    return retVal;
};

jb.readInput = function() {   // Legacy
    return jb.readLine();
};

jb.get = function() {         // Legacy
    return jb.readKey();
};

jb.reset = function() {
  jb.inputState = jb.INPUT_STATES.NONE;
  jb.inputOut = null;
  jb.got = null;
  jb.bInterrupt = false;
};

jb.onPress = function(e) {
    var charCode = e.which || e.keyCode,
        specialCode = jb.special.last;
    
    if (specialCode) {
        // User pressed a special key.
        jb.got = specialCode;
        
        if (specialCode === "enter" || specialCode === "return") {
            jb.inputOut = jb.input;
            jb.bWantsNewInput = true;
            jb.got = jb.NEWLINE;
            jb.inputState = jb.INPUT_STATES.NONE;
        }
        else if (specialCode === "space") {
            if (jb.bWantsNewInput) {
                jb.input = "";
                jb.bWantsNewInput = false;
            }

            jb.input += " ";
        }
    }
    else {
        // 'Normal' key.
        jb.got = String.fromCharCode(charCode);
        
        if (jb.bWantsNewInput) {
            jb.input = "";
            jb.bWantsNewInput = false;
        }
        
        jb.input += jb.got;
    }

    if (jb.inputState === jb.INPUT_STATES.READ_LINE && jb.input) {
        jb.cursorTo(jb.row, jb.minCol);
        jb.printAt(jb.input.charAt(jb.input.length - 1), jb.row + 1, jb.minCol + jb.input.length);
        jb.cursorTo(jb.row, jb.minCol + jb.input.length);
    }
};

jb.onDown = function(e) {
    var keyCode = e.which || e.keyCode,
        specialCode = jb.codes["" + keyCode],
        lookupCode = null,
        retVal = true;
    
    jb.lastCode = keyCode;

    if (specialCode) {
      lookupCode = specialCode;
    }
    else {
      lookupCode = String.fromCharCode(keyCode);
    }

    if (jb.keys[lookupCode]) {
      jb.keys[lookupCode].isDown = true;
    }
    else {
      jb.keys[lookupCode] = {isDown: true};
    }
    
    if (specialCode) {
        // User pressed a special key.
        jb.special.last = specialCode;
        jb.special.down[specialCode] = true;
        jb.normal.last = "";
        jb.got = specialCode;

        if (jb.inputState === jb.INPUT_STATES.READ_LINE) {
            if (specialCode === "left" ||
                specialCode === "backspace" ||
                specialCode === "del") {

                jb.input = jb.input.substring(0, jb.input.length - 1);
                if (jb.col > jb.minCol) {
                    jb.cursorMove(0, -1);
                }
            }
        }

        e.preventDefault();
        if (specialCode === "backspace") {
            retVal = false;
        }
    }
    else {
        // 'Normal' key.
        jb.normal.last = String.fromCharCode(jb.lastCode);
        jb.got = jb.normal.last;
        jb.normal.down[jb.normal.last] = true;
        jb.special.last = "";
    }

    return retVal;
};

jb.onUp = function(e) {
    var keyCode = e.which || e.keyCode,
        specialCode = jb.codes["" + keyCode],
        lookupCode = null;
    
    jb.lastCode = keyCode;

    if (specialCode) {
      lookupCode = specialCode;
    }
    else {
      lookupCode = String.fromCharCode(keyCode);
    }

    if (jb.keys[lookupCode]) {
      jb.keys[lookupCode].isDown = false;
    }
    else {
      jb.keys[lookupCode] = {isDown: false};
    }
    
    if (specialCode) {
        // User pressed a special key.
        jb.special.down[specialCode] = false;
    }
    else {
        // 'Normal' key.
        jb.normal.down[String.fromCharCode(jb.lastCode)] = false;
    }
};

jb.codes = {
  3:  "cancel",
  6:  "help",
  8:  "backspace",
  9:  "tab",
  12: "clear",
  13: "return",
  14: "enter",
  16: "shift",
  17: "control",
  18: "alt",
  19: "pause",
  20: "caps lock",
  27: "escape",
  32: "space",
  33: "page up",
  34: "page down",
  35: "end",
  36: "home",
  37: "left",
  38: "up",
  39: "right",
  40: "down",
  44: "printscreen",
  45: "insert",
  46: "delete",
};

jb.KEYCODE = {
  CANCEL: 3,
  HELP: 6,
  BACKSPACE: 8,
  TAB: 9,
  CLEAR: 12,
  RETURN: 13,
  ENTER: 14,
  SHIFT: 16,
  CONTROL: 17,
  ALT: 18,
  PAUSE: 19,
  CAPSLOCK: 20,
  ESCAPE: 27,
  SPACE: 32,
  PAGEUP: 33,
  PAGEDOWN: 34,
  END: 35,
  HOME: 36,
  LEFT: 37,
  UP: 38,
  RIGHT: 39,
  DOWN: 40,
  PRINTSCREEN: 44,
  INSERT: 45,
  DELETE: 46,
};

jb.getMouseX = function(e) {
    return Math.round((e.srcElement ? e.pageX - e.srcElement.offsetLeft : (e.target ? e.pageX - e.target.offsetLeft : e.pageX)) / jb.globalScale);
};

jb.getMouseY = function(e) {
    return Math.round((e.srcElement ? e.pageY - e.srcElement.offsetTop : (e.target ? e.pageY - e.target.offsetTop : e.pageY)) / jb.globalScale);
};

jb.getClientPos = function(touch) {
    // Adapted from gregers' response in StackOverflow:
    // http://stackoverflow.com/questions/5885808/includes-touch-events-clientx-y-scrolling-or-not

    var winOffsetX = window.pageXoffset;
    var winOffsetY = window.pageYoffset;
    var x = touch.clientX;
    var y = touch.clientY;

    if (touch.pageY === 0 && Math.floor(y) > Math.floor(touch.pageY) ||
        touch.pageX === 0 && Math.floor(x) > Math.floor(touch.pageX)) {
      x = x - winOffsetX;
      y = y - winOffsetY;
    }
    else if (y < (touch.pageY - winOffsetY) || x < (touch.pageX - winOffsetX)) {
      x = touch.pageX - winOffsetX;
      y = touch.pageY - winOffsetY;
    }

    jb.pointInfo.x = x;
    jb.pointInfo.y = y;
};

jb.tap = {bListening: false, x: -1, y: -1, done: false, count: 0, isDoubleTap: false, lastTapTime: 0, touched: null};
jb.swipe = {bListening: false, startX: -1, startY: -1, lastX: -1, lastY: -1, endX: -1, endY: -1, startTime: 0, endTime: 0, swiped: [], allSwiped: [], done: false};
jb.swipe.isWiderThan = function(dx) {
  return Math.abs(jb.swipe.lastX - jb.swipe.startX) >= dx;
};
jb.swipe.isTallerThan = function(dy) {
  return Math.abs(jb.swipe.lastY - jb.swipe.startY) >= dy;
};
jb.swipe.isBiggerThan = function(dx, dy) {
  return jb.swipe.isTallerThan(dx) && jb.swipe.isWiderThan(dy);
};
jb.swipe.top = function() {
  return Math.min(jb.swipe.startY, jb.swipe.lastY);
};
jb.swipe.left = function() {
  return Math.min(jb.swipe.startX, jb.swipe.lastX);
};
jb.swipe.width = function() {
  return Math.abs(jb.swipe.lastX - jb.swipe.startX);
};
jb.swipe.height = function() {
  return Math.abs(jb.swipe.lastY - jb.swipe.startY);
};
jb.swipe.isUp = function() {
  return jb.swipe.lastY < jb.swipe.startY;
};
jb.swipe.isLeft = function() {
  return jb.swipe.lastX < jb.swipe.startX;
};
jb.listenForTap = function() {
    jb.resetTap();
    jb.tap.bListening = true;
    jb.tap.touched = false;
};

jb.resetTap = function() {
    jb.tap.x = -1;
    jb.tap.y = -1;
    jb.tap.done = false;
    jb.tap.isDoubleTap = false;
    jb.tap.lastTapTime = -1;
    jb.tap.bListening = false;
};

jb.listenForSwipe = function() {
    jb.resetSwipe();
    jb.swipe.bListening = true;
};

jb.resetSwipe = function() {
    jb.swipe.startX = -1;
    jb.swipe.startY = -1;
    jb.swipe.lastX = -1;
    jb.swipe.lastY = -1;
    jb.swipe.endX = -1;
    jb.swipe.endY = -1;
    jb.swipe.startTime = 0;
    jb.swipe.endTime = 0;
    jb.swipe.done = false;
    jb.swipe.started = false;
    jb.swipe.bListening = false;
};

jb.doubleTapTimedOut = function() {
    return Date.now() - jb.tap.lastTapTime >= jb.DOUBLE_TAP_INTERVAL;
};

jb.mouseDown = function(e) {
    jb.pointInfo.x = jb.getMouseX(e);
    jb.pointInfo.y = jb.getMouseY(e);
    window.addEventListener("mousemove", jb.mouseDrag, true);
    jb.gestureStart();
};

jb.mouseDrag = function(e) {
    jb.pointInfo.x = jb.getMouseX(e);
    jb.pointInfo.y = jb.getMouseY(e);
    jb.gestureContinue();
};

jb.mouseUp = function(e) {
    window.removeEventListener("mousemove", jb.mouseDrag, true);
    jb.pointInfo.x = jb.getMouseX(e);
    jb.pointInfo.y = jb.getMouseY(e);
    jb.gestureEnd();
};

jb.gestureStart = function() {
    var newNow = Date.now(),
    x = jb.pointInfo.x
    y = jb.pointInfo.y;
    

    if (jb.tap.bListening) {
        jb.tap.x = x;
        jb.tap.y = y;
        jb.tap.count = newNow - jb.tap.lastTapTime >= jb.DOUBLE_TAP_INTERVAL ? 1 : jb.tap.count + 1;
        jb.tap.isDoubleTap = jb.tap.count > 1 && newNow - jb.tap.lastTapTime < jb.DOUBLE_TAP_INTERVAL;
        jb.tap.lastTapTime = newNow;
        jb.tap.touched = jb.touchables.getTouched(x, y);
        jb.tap.done = true;

        if (jb.tap.isDoubleTap || jb.tap.count > 1) {
          jb.tap.count = 0;
        }
    }

    if (jb.swipe.bListening) {
        jb.swipe.startX = x;
        jb.swipe.startY = y;
        jb.swipe.lastX = x;
        jb.swipe.lastY = y;
        jb.swipe.endX = x;
        jb.swipe.endY = y;
        jb.swipe.startTime = newNow;
        jb.swipe.swiped.length = 0;
        jb.swipe.allSwiped.length = 0;
        jb.swipe.started = true;
        jb.swipe.done = false;
    }
};

jb.gestureContinue = function() {
    if (jb.swipe.startTime) {
        jb.swipe.lastX = jb.swipe.endX;
        jb.swipe.lastY = jb.swipe.endY;
        jb.swipe.endX = jb.pointInfo.x;
        jb.swipe.endY = jb.pointInfo.y;

        jb.swipeables.getSwiped(jb.swipe.lastX, jb.swipe.lastY, jb.swipe.endX, jb.swipe.endY);
    }
};

jb.gestureEnd = function() {
  var i = 0;

    if (jb.tap.touched && jb.tap.touched.onUntouched) {
      jb.tap.touched.onUntouched(jb.swipe.endX, jb.swipe.endY);
    }

    if (jb.swipe.startTime) {
      jb.swipe.lastX = jb.swipe.endX;
      jb.swipe.lastY = jb.swipe.endY;
      jb.swipe.endX = jb.pointInfo.x
      jb.swipe.endY = jb.pointInfo.y;
      jb.swipe.endTime = Date.now();
      jb.swipe.done = true;

      jb.swipeables.getSwiped(jb.swipe.lastX, jb.swipe.lastY, jb.swipe.endX, jb.swipe.endY);

      if (jb.swipe.swiped) {
        for (i=0; i<jb.swipe.swiped.length; ++i) {
          if (jb.swipe.swiped[i] !== jb.tap.touched && jb.swipe.swiped[i].onUntouched) {
            jb.swipe.swiped[i].onUntouched(jb.swipe.endX, jb.swipe.endY);
          }
        }
      }
    }
};

jb.touchStart = function(e) {
    if (e) {
        e.preventDefault();
        e.stopPropagation();
      
        if (e.touches.length === 1) {
            jb.getClientPos(e.touches[0]);
            jb.gestureStart();
        }
    }
},
  
jb.touchMove = function(e) {
    if (e) {
        e.preventDefault();
        e.stopPropagation();
      
        if (e.touches.length === 1) {
            jb.getClientPos(e.touches[0]);
            jb.gestureContinue();
        }
    }
},
  
jb.touchEnd = function(e) {
    if (e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    jb.gestureEnd();
},

document.addEventListener("keydown", jb.onDown, true);
document.addEventListener("keyup", jb.onUp, true);
document.addEventListener("keypress", jb.onPress, true);

window.addEventListener("mousedown", jb.mouseDown, true);
window.addEventListener("mouseup", jb.mouseUp, true);

window.addEventListener("touchstart", jb.touchStart, true);
window.addEventListener("touchmove", jb.touchMove, true);
window.addEventListener("touchend", jb.touchEnd, true);


///////////////////////////////////////////////////////////////////////////////
//  .oooooo.o   .oooooo.   ooooo     ooo ooooo      ooo oooooooooo.
// d8P'    `Y8  d8P'  `Y8b  `888'     `8' `888b.     `8' `888'   `Y8b
// Y88bo.      888      888  888       8   8 `88b.    8   888      888
//  `"Y8888o.  888      888  888       8   8   `88b.  8   888      888
//      `"Y88b 888      888  888       8   8     `88b.8   888      888
// oo     .d8P `88b    d88'  `88.    .8'   8       `888   888     d88'
// 8""88888P'   `Y8bood8P'     `YbodP'    o8o        `8  o888bood8P'
// SOUND //////////////////////////////////////////////////////////////////////
jb.sound = {
    DEFAULT_FREQ: 440, // Hz
    DEFAULT_VOL: 1.0,
    DEFAULT_DUR: 0.25, // sec
    CHANNELS: {MONO: 1, STEREO: 2},
    WAVES_PER_NOISE: 17,
    FORMAT: {
        MP3: {ext: 'mp3', mime: 'audio/mpeg'},
        OGG: {ext: 'ogg', mime: 'audio/ogg; codecs=vorbis'}
      },
    DEFAULT_CHANNELS: 2,
    DEFAULT_DELAY:    0.1,
    STOP_ALL_CHANNELS:-1,
    INVALID_CHANNEL:  -99,
      
    isEnabled:       true,
    isAvailable:     window.Audio,
    preferredFormat: null,
    sounds:          {},

    masterVolume:    1.0,
    audioContext: null,
    noiseFactor: 0.33,
    channels: 1,
    dummySound: { audioNode: null, play: function() {}, stop: function() {} },

    init: function() {
        var capTester = new Audio(),
            iFormat = 0;

        // Audio resource initialization:
        for (iFormat in jb.sound.FORMAT) {
          if (capTester.canPlayType(jb.sound.FORMAT[iFormat].mime) === "probably") {
            jb.sound.preferredFormat = jb.sound.FORMAT[iFormat];
            break;
          }
        }

        if (!this.preferredFormat) {
          for (iFormat in jb.sound.FORMAT) {
            if (capTester.canPlayType(jb.sound.FORMAT[iFormat].mime) === "maybe") {
              jb.sound.preferredFormat = jb.sound.FORMAT[iFormat];
              break;
            }
          }
        }

        if (!jb.sound.preferredFormat) {
          jb.sound.isAvailable = false;
          jb.sound.isEnabled = false;
        }

        // Procedural audio initialization:
        try {
          window.AudioContext = window.AudioContext || window.webkitAudioContext;
          this.audioContext = new AudioContext();
        }
        catch(e) {
          alert('Web Audio API is not supported in this browser');
        }
    },

    // Sound Resources ----------------------------------------------
    activate: function() {
        jb.sound.isEnabled = jb.sound.isAvailable;
    },

    deactivate: function() {
        jb.sound.stopAll();
        jb.sound.isEnabled = false;
    },

    getFreeChannelIndex: function(sound, now) {
        var i = 0;
        var iChannel = jb.sound.INVALID_CHANNEL;
        var mostDelay = 0;
        var testDelay = 0;

        if (sound && sound.channels.length && sound.playing.length && sound.lastPlayTime.length) {
            for (var i=0; i<sound.channels.length; ++i) {
                testDelay = (now - sound.lastPlayTime[i]) * 0.003;
                if (testDelay > mostDelay && testDelay > sound.minDelay) {
                    mostDelay = testDelay;
                    iChannel = i;
                }
            }
        }

        return iChannel;
    },

    play: function(sound, volume) {
        var totalVolume = typeof(volume) === 'undefined' ? 1 : volume,
            playedIndex = jb.sound.INVALID_CHANNEL,
            now = Date.now();

        totalVolume = jb.sound.clampVolume(totalVolume * jb.sound.getMasterVolume());

        if (sound) {
            playedIndex = jb.sound.getFreeChannelIndex(sound, now);
      
        try {
            if (playedIndex !== jb.sound.INVALID_CHANNEL) {
                sound.iChannel = playedIndex;
                sound.lastPlayTime[playedIndex] = now;
                sound.channels[playedIndex].pause();
                sound.channels[playedIndex].loop = false;
                sound.channels[playedIndex].volume = totalVolume;
                sound.channels[playedIndex].currentTime = 0;
                sound.playing[playedIndex] = true;
                sound.channels[playedIndex].play();
            }
        }
        catch(err) {
            // Error message?
        }
    }

    return playedIndex;
    },

    loop: function(sound, volume) {
        var now = Date.now(),
            totalVolume = typeof(volume) === 'undefined' ? 1 : volume,
            playedIndex = jb.sound.INVALID_CHANNEL;

        totalVolume = jb.sound.clampVolume(totalVolume * jb.sound.getMasterVolume());

        if (sound) {
            playedIndex = jb.sound.getFreeChannelIndex(sound, now);
          
            try {
                if (playedIndex !== jb.sound.INVALID_CHANNEL) {
                  sound.iChannel = playedIndex;
                  sound.lastPlayTime[playedIndex] = now;
                  sound.channels[playedIndex].pause();
                  sound.channels[playedIndex].loop = true;
                  sound.channels[playedIndex].volume = totalVolume;
                  sound.channels[playedIndex].currentTime = 0;
                  sound.playing[playedIndex] = true;
                  sound.channels[playedIndex].play();
                }
            }
            catch(err) {
            // Error message?
            }
        }

        return playedIndex;
    },

    pause: function(sound, channelIndex) {
        var iChannel = 0,
            iStart = typeof(channelIndex) === 'undefined' || channelIndex === jb.sound.INVALID_CHANNEL ? 0 : channelIndex,
            iEnd = typeof(channelIndex) === 'undefined' || channelIndex === jb.sound.INVALID_CHANNEL ? sound.channels.length - 1 : channelIndex;

        for (iChannel = iStart; iChannel <= iEnd; ++iChannel) {
            sound.channels[iChannel].pause();
            sound.playing[iChannel] = false;
        }
    },

    resume: function(sound, channelIndex) {
        var iChannel = 0,
            iStart = typeof(channelIndex) === 'undefined' || channelIndex === jb.sound.INVALID_CHANNEL ? 0 : channelIndex,
            iEnd = typeof(channelIndex) === 'undefined' || channelIndex === jb.sound.INVALID_CHANNEL ? sound.channels.length - 1 : channelIndex;

        for (iChannel = iStart; iChannel <= iEnd; ++iChannel) {
            sound.channels[iChannel].play();
            sound.playing[iChannel] = true;
        }
    },

    stop: function(sound, channelIndex) {
        var iChannel = 0,
            iStart = typeof(channelIndex) === 'undefined' || channelIndex === jb.sound.INVALID_CHANNEL ? 0 : channelIndex,
            iEnd = typeof(channelIndex) === 'undefined' || channelIndex === jb.sound.INVALID_CHANNEL ? sound.channels.length - 1 : channelIndex;

        channelIndex = channelIndex || jb.sound.STOP_ALL_CHANNELS;

        if (channelIndex === jb.sound.STOP_ALL_CHANNELS) {
            iStart = 0;
            iEnd = sound.channels.length - 1;
        }

        try {
            for (iChannel = iStart; iChannel <= iEnd; ++iChannel) {
                sound.channels[iChannel].pause();
                sound.channels[iChannel].loop = false;
                sound.channels[iChannel].currentTime = 0;
                sound.playing[iChannel] = false;
            }
        }
        catch(err) {
            // Error message?
        }
    },

    stopAll: function() {
        var key;

        for (key in jb.sound.sounds) {
            jb.sound.stop(jb.sound.sounds[key], jb.sound.STOP_ALL_CHANNELS);
        }
    },

    setMasterVolume: function(newMasterVolume) {
        jb.sound.masterVolume = jb.sound.clampVolume(newMasterVolume);
    },

    getMasterVolume: function() {
        return jb.sound.masterVolume;
    },

    clampVolume: function(volume) {
        return Math.min(1, Math.max(0, volume));
    },

    load: function(resourceName, onLoadedCallback, onErrorCallback, nChannels, replayDelay) {
        var numChannels = nChannels || jb.sound.DEFAULT_CHANNELS,
            minReplayDelay = replayDelay || jb.sound.DEFAULT_DELAY,

            path = resourceName,
            extension = path.substring(path.lastIndexOf(".")),
            nNewChannels = 0,
            i = 0,
            newChannel = null,
            sentinel = null;

        if (jb.sound.preferredFormat) {
            if (extension) {
                path = path.replace(extension, "");
            }

            path = path + "." + jb.sound.preferredFormat.ext;

            if (!jb.sound.sounds[resourceName] ||
                jb.sound.sounds[resourceName].length < nChannels) {
                if (!jb.sound.sounds[resourceName]) {
                    jb.sound.sounds[resourceName] = {
                        channels:     [],
                        playing:      [],
                        lastPlayTime: [],
                        minDelay:     minReplayDelay,
                    };
                }
            
                nNewChannels = numChannels - jb.sound.sounds[resourceName].channels.length;
                for (i=0; i<nNewChannels; ++i) {
                    newChannel = new Audio(path);
                    sentinel = new function() { this.bFirstTime = true };
                  
                    newChannel.addEventListener('canplaythrough', function callback() {
                        // HACKy "fix" for Chrome's 'canplaythrough' bug.
                        if (sentinel.bFirstTime) {
                            if (onLoadedCallback) {
                                onLoadedCallback(jb.sound.sounds[resourceName], resourceName);
                            }
                            sentinel.bFirstTime = false;
                        }
                    }, false);
                  
                    if (onErrorCallback) {
                        newChannel.addEventListener('onerror', function callback() {
                            onErrorCallback(resourceName);
                        }, false);
                    }
                
                    newChannel.preload = "auto";
                    newChannel.load();
                    jb.sound.sounds[resourceName].channels.push(newChannel);
                    jb.sound.sounds[resourceName].playing.push(false);
                    jb.sound.sounds[resourceName].lastPlayTime.push(0);
                }
            }
        }
        else if (onLoadedCallback) {
            onLoadedCallback(resourceName, "Error: no preferred format");
        }

        return jb.sound.sounds[resourceName];
    },

    // Procedural Sound ---------------------------------------------
    makeSound: function(waveform, duration, volume, startFreq, endFreq) {
        volume = volume || this.DEFAULT_VOL;
        duration = duration || this.DEFAULT_DUR;
        startFreq = startFreq || this.DEFAULT_FREQ;
        endFreq = endFreq || startFreq;

        return this.audioContext ? this.newSoundFromBuffer(this.getBuffer(waveform, startFreq, endFreq, volume, duration), duration) : this.dummySound;
    },

    waveFns: {
        sine: function(f, t, s) {
            var p = 2.0 * Math.PI * t * f;

            return Math.sin(p);
        },

        saw: function(f, t, s) {
            var p = t * f;
            p = p - Math.floor(p);

            return 2.0 * (p - 0.5);
        },

        square: function(f, t, s) {
            var p = t * f;
            p = p - Math.floor(p);

            return p < 0.5 ? 1.0 : -1.0;
        },

        noisySine: function(f, t, s) {
            return jb.sound.waveFns.sine(f, Math.abs(t + (Math.random() - 0.5) * jb.sound.noiseFactor / f), s);
        },

        noisySaw: function(f, t, s) {
            return jb.sound.waveFns.saw(f, Math.abs(t + (Math.random() - 0.5) * jb.sound.noiseFactor / f), s);
        },

        noisySquare: function(f, t, s) {
            return jb.sound.waveFns.square(f, Math.abs(t + (Math.random() - 0.5) * jb.sound.noiseFactor / f), s);
        },

        noise: function(f, t, s) {
            return 2.0 * (0.5 - Math.random());
        },
    },

    getBuffer: function(waveform, startFreq, endFreq, vol, dur) {
        var nSamples = Math.round(dur * this.audioContext.sampleRate),
            buffer = this.audioContext.createBuffer(this.channels, nSamples, this.audioContext.sampleRate),
            t = 0,
            freq = 0,
            waveFn = this.waveFns[waveform] || this.waveFns["sine"],
            iChannel = 0,
            iSample = 0,
            bPinkNoise = waveform.toUpperCase() === "PINKNOISE",
            iPhase = 0,
            iWave = 0,
            maxAmp = 0,
            numWaves = 0,
            iSamplesPerWave = 0,
            samples = null;

        for (iChannel = 0; iChannel < this.channels; ++iChannel) {
            samples = buffer.getChannelData(iChannel);

            if (bPinkNoise) {
                // Generate noise in the given frequency band by piecing together
                // square waves of random frequencies from within the band.
                numWaves = Math.min(Math.floor((endFreq - startFreq) * 0.33), jb.sound.WAVES_PER_NOISE);

                for (iWave = 0; iWave <= numWaves; ++iWave) {
                    freq = Math.round(startFreq + (endFreq - startFreq) * iWave / numWaves);
                    iSamplesPerWave = Math.floor(this.audioContext.sampleRate / freq);
                    iPhase = Math.floor(Math.random() * iSamplesPerWave);

                    freq = Math.sqrt(freq);
                    for (iSample = 0; iSample < nSamples; ++iSample) {
                        if ((iSample + iPhase) % iSamplesPerWave < iSamplesPerWave / 2) {
                            samples[iSample] += 1.0 / freq;
                        }
                        else {
                            samples[iSample] += -1.0 / freq;
                        }

                        if (Math.abs(samples[iSample]) > maxAmp) {
                            maxAmp = Math.abs(samples[iSample]);
                        }
                    }
                }
            }
            else {
                for (iSample = 0; iSample < nSamples; ++iSample) {
                    t = iSample / this.audioContext.sampleRate;
                    freq = startFreq + (endFreq - startFreq) * t / dur;
                    samples[iSample] = waveFn(freq, t, iSample);

                    if (Math.abs(samples[iSample]) > maxAmp) {
                        maxAmp = Math.abs(samples[iSample]);
                    }
                }
            }


            // Normalize and apply volume.
            for (iSample = 0; iSample < nSamples; ++iSample) {
                samples[iSample] = samples[iSample] / maxAmp * Math.min(1.0, vol);
            }

            // Ramp up the opening samples.
            samples[0] = 0.0;
            samples[1] *= 0.333;
            samples[2] *= 0.667;

            // Ramp down the closing samples.
            samples[nSamples - 1] = 0.0;
            samples[nSamples - 2] *= 0.333;
            samples[nSamples - 3] *= 0.667;
        }

        return buffer;
    },

    newSoundFromBuffer: function(buffer, duration) {
        var self = this;

        return {
                duration: duration,
                node: null,
                play: function() {
                    this.node = self.audioContext.createBufferSource();
                    this.node.buffer = buffer;
                    this.node.onEnded = function() {
                        this.node.disconnect(jb.sound.audioContext.destination);
                        this.node = null;
                    }
                    this.node.connect(jb.sound.audioContext.destination);
                    this.node.start(0);
                },
                stop: function() {
                    if (this.node) {
                        this.node.stop();
                    }
                    this.node = null;
                }
            };
    }
};

jb.sound.init();

jb.program = {
    defaultRoutine: function() {
        jb.setBackColor("black");
        jb.setForeColor("red");
        jb.print("No program defined!");
        jb.setForeColor("gray");
    }
};

// Start the game!
window.onload = function() {
    jb.run(jb.program);
};
