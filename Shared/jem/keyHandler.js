JEM.KeyHandler = {
    normal: {last: null, down:{}},
    special: {last: null, down: {}},
    lastCode: -1,
    got: "",
    INPUT_STATES: {NONE: 0,
        READ_LINE: 1,
        READ_KEY: 2},
    inputState:  0,
    listeners: [],
    input: null,
    line: null,

    // Listeners may implement any of the following functions:
    // onKeyDown(string)
    // onKeyUp(string)
    // onKeyPress(string)
    // onNewLine(string)
    // Any listener that returns 'false' from any of these
    // routines will 'consume' the event, preventing it from
    // reaching subsequent listeners.
    addListener: function(listener) {
        if (this.listeners.indexOf(listener) < 0) {
            this.listeners.push(listener);
        }
    },

    removeListener: function(listener) {
        jem.Utils.removeElement(listener, true);
    },

    onPress: function(e) {
        var charCode = e.which || e.keyCode,
            specialCode = this.special.last;
        
        if (specialCode) {
            // User pressed a special key.
            this.got = specialCode;
            
            if (specialCode === "enter" || specialCode === "return") {
                this.line = this.input;
                this.bWantsNewInput = true;
                this.got = this.NEWLINE;
                this.inputState = this.INPUT_STATES.NONE;
            }
            else if (specialCode === "space") {
                if (this.bWantsNewInput) {
                    this.input = "";
                    this.bWantsNewInput = false;
                }
    
                this.input += " ";
            }
        }
        else {
            // 'Normal' key.
            this.got = String.fromCharCode(charCode);
            
            if (this.bWantsNewInput) {
                this.input = "";
                this.line = "";
                this.bWantsNewInput = false;
            }
            
            this.input += this.got;
        }

        for (var listener of this.listeners) {
            if (listener["onKeyPress"]) {
                if (listener["onKeyPress"](this.got)) {
                    break;
                }
            }
        }
    
        if (this.line) {
            for (var listener of this.listeners) {
                if (listener["onNewLine"]) {
                    if (listener["onNewLine"](this.got)) {
                        break;
                    }
                }
            }
        }
    },
    
    onDown: function(e) {
        var keyCode = e.which || e.keyCode,
            specialCode = this.codes["" + keyCode],
            lookupCode = null,
            retVal = true;
        
        this.lastCode = keyCode;
    
        if (specialCode) {
          lookupCode = specialCode;
        }
        else {
          lookupCode = String.fromCharCode(keyCode);
        }
    
        if (this.keys[lookupCode]) {
          this.keys[lookupCode].isDown = true;
        }
        else {
          this.keys[lookupCode] = {isDown: true};
        }
        
        if (specialCode) {
            // User pressed a special key.
            this.special.last = specialCode;
            this.special.down[specialCode] = true;
            this.normal.last = "";
            this.got = specialCode;

            if (specialCode === "enter" || specialCode === "return") {
                this.got = this.NEWLINE;
            }
    
            if (this.inputState === this.INPUT_STATES.READ_LINE) {
                if (specialCode === "left" ||
                    specialCode === "backspace" ||
                    specialCode === "del") {
    
                    this.input = this.input.substring(0, this.input.length - 1);
                }
            }
    
            e.preventDefault();
            if (specialCode === "backspace") {
                retVal = false;
            }
        }
        else {
            // 'Normal' key.
            this.normal.last = String.fromCharCode(this.lastCode);
            this.got = this.normal.last;
            this.normal.down[this.normal.last] = true;
            this.special.last = "";
        }

        for (var listener of listeners) {
            if (listener["onKeyDown"]) {
                if (listener["onKeyDown"](this.got)) {
                    break;
                }
            }
        }
    
        return retVal;
    },
    
    onUp: function(e) {
        var keyCode = e.which || e.keyCode,
            specialCode = this.codes["" + keyCode],
            lookupCode = null;
        
        this.lastCode = keyCode;
    
        if (specialCode) {
          lookupCode = specialCode;
        }
        else {
          lookupCode = String.fromCharCode(keyCode);
        }

        this.got = lookupCode;
        if (this.got === "enter" || this.got === "return") {
            this.got = this.NEWLINE;
        }

        if (this.keys[lookupCode]) {
          this.keys[lookupCode].isDown = false;
        }
        else {
          this.keys[lookupCode] = {isDown: false};
        }
        
        if (specialCode) {
            // User pressed a special key.
            this.special.down[specialCode] = false;
        }
        else {
            // 'Normal' key.
            this.normal.down[lookupCode] = false;
        }

        for (var listener of listener) {
            if (listener["onKeyUp"]) {
                if (listener["onKeyUp"](this.got)) {
                    break;
                }
            }
        }
    },
    
    codes: {
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
    },
    
    KEYCODE: {
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
    },
};

document.addEventListener("keydown", JEM.KeyHandler.onDown, true);
document.addEventListener("keyup", JEM.KeyHandler.onUp, true);
document.addEventListener("keypress", JEM.KeyHandler.onPress, true);
