JEM.Tests = {
    ASSERT_PREFIX: "--- ",
    assertions: [],
    tests: null,
    testIndex: 0,
    stateOne: null,
    stateTwo: null,
    fsm: null,
    testObject: {
        START_VALUE: 2,
        value: 0,
        altValue: 0,
        testFunction: function(arg) {
            this.value = arg;
        },
        getValue: function() {
            return this.value;
        },
        getAltValue: function() {
            return this.altValue;
        },
        enter: function() {
            this.value = this.START_VALUE;
            this.altValue = this.START_VALUE;
        },
        exit: function() {
            this.value -= 1;
            this.altValue -= 1;
        },
        updateOne: function() {
            this.value += 3;
        },
        updateTwo: function() {
            this.altValue += 7;
        },
        createFsm: function() {
            this.fsm = jem.FSM.create(this);
            this.fsm.createState("StateOne", this.enter, this.updateOne, this.exit);
            this.fsm.createState("StateTwo", this.enter, this.updateTwo, this.exit);

            return this.fsm;
        },
        getFsm: function() {
            return this.fsm;
        }
    },

    run: function() {
        // Register all tests here.
        this.tests = [
            this.arrayRemoval,
            this.switchboardTest00,
            this.switchboardTest01,
            this.switchboardTest02,
            this.switchboardTest03,
            this.switchboardTest04,
            this.switchboardTest05,
            this.switchboardTest06,
            this.switchboardTest07,
            this.fsmTest00,
            this.fsmTest01,
            this.fsmTest02,
            this.fsmTest03,
        ];
        
        this.testIndex = 0;
    },

    update: function(dt) {
        var realError = null;

        if (this.testIndex < this.tests.length) {
            try {
                this.tests[this.testIndex].bind(this)();
            }
            catch(err) {
                if (err.toString().indexOf(this.ASSERT_PREFIX) < 0) {
                    realError = err;
                }
            }
            finally {
                this.testIndex += 1;
            }

            if (realError) {
                throw new Error(realError);                
            }
        }
        else {
            this.report();
            jem.reset(true);
        }
    },

    report: function() {
        if (this.assertions.length === 0) {
            console.log("All tests passed!");
        }
        else {
            console.log(this.assertions.length + " tests failed:");
            for(const testName of this.assertions) {
                console.log(testName);
            }
        }
    },

    assert: function(test) {
        if (!test) {
            const message = this.ASSERT_PREFIX + this.assert.caller
            this.assertions.push(message);
            throw new Error(message);
        }
    },

    // Tests ==================================================================
    fsmTest00: function() {
        const fsm = this.testObject.createFsm();
        fsm.setState("StateOne");
    },

    fsmTest01: function() {
        // console.log("Values: " + this.testObject.getValue() + ", " + this.testObject.getAltValue());
        this.assert(this.testObject.getValue() === 5);
        this.assert(this.testObject.getAltValue() === 2);
        const fsm = this.testObject.getFsm();
        fsm.setState("StateTwo");
    },

    fsmTest02: function() {
        // console.log("Values: " + this.testObject.getValue() + ", " + this.testObject.getAltValue());
        this.assert(this.testObject.getValue() === 2);
        this.assert(this.testObject.getAltValue() === 9);
        const fsm = this.testObject.getFsm();
        fsm.setState(null);
    },

    fsmTest03: function() {
        // console.log("Values: " + this.testObject.getValue() + ", " + this.testObject.getAltValue());
        this.assert(this.testObject.getValue() === 1);
        this.assert(this.testObject.getAltValue() === 8);
        const fsm = this.testObject.getFsm();
        jem.FSM.destroy(fsm);
    },

    arrayRemoval: function() {
        const firstArray = [1, 2, 3, 4, 5];
        jem.utils.removeElementAtIndex(firstArray, 2);
        this.assert(firstArray[2] !== 3);

        const secondArray = [1, 2, 3, 4, 5];
        jem.utils.removeElement(secondArray, 2);
        this.assert(secondArray[1] !== 2);

        const thirdArray = [1, 3, 2, 3, 5];
        jem.utils.removeElement(thirdArray, 3);
        this.assert(thirdArray[1] !== 3);
        this.assert(thirdArray[1] === 5);

        const fourthArray = [1, 3, 2, 3, 5];
        jem.utils.removeElement(fourthArray, 3, true);
        this.assert(fourthArray[1] === 2);
        this.assert(fourthArray[2] === 3);

        const fifthArray = [1, 3, 2, 3, 5];
        jem.utils.removeElement(fifthArray, 3, true, true);
        this.assert(fifthArray[3] !== 3);
        this.assert(fifthArray[1] === 3);
    },

    switchboardTest00: function() {
        jem.switchboard.addListener(this.testObject, "testFunction");
    },

    switchboardTest01: function() {
        jem.switchboard.broadcast("testFunction", 3);
        this.assert(this.testObject.getValue() === 3);
        // console.log("TestValue is " + this.testObject.getValue());
    },

    switchboardTest02: function() {
        jem.switchboard.removeListener(this.testObject, "testFunction");
    },

    switchboardTest03: function() {
        jem.switchboard.broadcast("testFunction", 7);
        this.assert(this.testObject.getValue() === 3);
        // console.log("TestValue is " + this.testObject.getValue());
    },

    switchboardTest04: function() {
        jem.switchboard.addListener(this.testObject, "testFunction");
    },

    switchboardTest05: function() {
        jem.switchboard.broadcast("testFunction", 5);
        this.assert(this.testObject.getValue() === 5);
        // console.log("TestValue is " + this.testObject.getValue());
    },

    switchboardTest06: function() {
        jem.switchboard.removeListener(this.testObject);
    },

    switchboardTest07: function() {
        jem.switchboard.broadcast("testFunction", 4);
        jem.assert(this.testObject.getValue() === 5);
        // console.log("TestValue is " + this.testObject.getValue());
    },
};

var jem = JEM.create();
jem.start(JEM.Tests);
