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

///////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ooo        ooooo oooooooooooo  .oooooo..o  .oooooo..o       .o.         .oooooo.    oooooooooooo  .oooooo..o
// `88.       .888' `888'     `8 d8P'    `Y8 d8P'    `Y8      .888.       d8P'  `Y8b   `888'     `8 d8P'    `Y8
//  888b     d'888   888         Y88bo.      Y88bo.          .8"888.     888            888         Y88bo.
//  8 Y88. .P  888   888oooo8     `"Y8888o.   `"Y8888o.     .8' `888.    888            888oooo8     `"Y8888o.
//  8  `888'   888   888    "         `"Y88b      `"Y88b   .88ooo8888.   888     ooooo  888    "         `"Y88b
//  8    Y     888   888       o oo     .d8P oo     .d8P  .8'     `888.  `88.    .88'   888       o oo     .d8P
// o8o        o888o o888ooooood8 8""88888P'  8""88888P'  o88o     o8888o  `Y8bood8P'   o888ooooood8 8""88888P'
// Messages ///////////////////////////////////////////////////////////////////////////////////////////////////
jb.messages = {
  registry: {},
  queryRegistry: {},
  args: [],

  listen: function(message, listener) {
    var listeners = null;

    if (!this.registry[message]) {
      this.registry[message] = [];
    }

    listeners = this.registry[message];

    if (listeners.indexOf(listener) < 0) {
      listeners.push(listener);
    }
  },

  answer: function(message, answerer) {
    var answerers = null;

    if (!this.queryRegistry[message]) {
      this.queryRegistry[message] = [];
    }

    answerers = this.queryRegistry[message];

    if (answerers.indexOf(answerer) < 0) {
      answerers.push(answerer);
    }
  },

  unlisten: function(message, listener) {
    if (this.registry[message] && this.registry[message].indexOf(listener) >= 0) {
      jb.removeFromArray(this.registry[message], listener, true);
    }
  },

  unanswer: function(message, answerer) {
    if (this.queryRegistry[message] && this.queryRegistry[message].indexOf(answerer) >= 0) {
      jb.removeFromArray(this.queryRegistry[message], answerer, true);
    }
  },

  query: function(message, querier) {
    var i = 0,
        answerer = null;

    if (querier && (typeof querier[message] === "function") && this.queryRegistry[message]) {
      for (i=0; i<this.queryRegistry[message].length; ++i) {
        // Call the querier's function, sending the current listener as the argument.
        answerer = this.queryRegistry[message][i];
        querier[message].call(querier, answerer);
      }
    }
  },

  send: function(message) {
    var i = 0,
        listener = null;

    if (this.registry[message]) {
      this.args.length = 0;

      for (i=1; i<arguments.length; ++i) {
        this.args.push(arguments[i]);
      }

      for (i=0; i<this.registry[message].length; ++i) {
        listener = this.registry[message][i];

        if (listener) {
          listener[message].apply(listener, this.args);
        }
      }
    }
  }
}

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
    jb.updateTimers();

    if (jb.bInterrupt) {
        jb.nextInstruction();
    }
    else if (jb.execStack.length > 0) {
        if (jb.execStack[0].loopingRoutine) {
            jb.execStack[0].bWhile = null;
            jb.execStack[0].bUntil = null;
            jb.execStack[0].loopingRoutine.bind(jb.context)();

            if (jb.execStack[0].bWhile === null && jb.execStack[0].bUntil === null) {
                jb.logToConsole("Missing 'jb.while' or 'jb.until' in " + jb.instructions[jb.execStack[0].pc].label);
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

    jb.render();
};

jb.render = function() {
    if (jb.execStack.length <= 0 && jb.bShowStopped) {
        jb.bShowStopped = false;
        jb.logToConsole("--- stopped ---");
    }

    // Rendering code goes here...

    // Request a new a update.
    requestAnimationFrame(jb.loop);
};

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
      // Draw typed character here.
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
                  // Move cursor position here.
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
    jb.pointInfo.srcElement = jb.canvas ? jb.canvas : null;
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
        // e.preventDefault();
        e.stopPropagation();
      
        if (e.touches.length === 1) {
            jb.getClientPos(e.touches[0]);
            jb.gestureStart();
        }
    }
},
  
jb.touchMove = function(e) {
    if (e) {
        // e.preventDefault();
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

jb.program = {
    defaultRoutine: function() {
      jb.logToConsole("Started...");
    }
};

// Start the game!
window.onload = function() {
    jb.run(jb.program);
};
