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
            this.objectBankTest,
            this.piximitterTest,
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

    // Object Bank ------------------------------------------------------------
    spawnCount: 0,

    objectBankTest: function() {
        const bank = new JEM.ObjectBank(this, function() {
            this.value = 1;
        });

        const spawned = [];

        this.spawnCount = 0;

        for (var i=0; i<64; ++i) {
            spawned.push(bank.spawn(false));
        }

        jem.assert(bank.capacity() === 64);
        jem.assert(bank.spawnCount() === 64);
        jem.assert(bank.waitCount() === 0);

        while (spawned.length > 0) {
            bank.despawn(spawned.pop());
        }

        jem.assert(bank.capacity() === 64);
        jem.assert(bank.spawnCount() === 0);
        jem.assert(bank.waitCount() === 64);

        for (var i=0; i<129; ++i) {
            spawned.push(bank.spawn(true));
        };

        bank.despawnAll();
        spawned.length = 0;
        jem.assert(bank.capacity() === 128);
        jem.assert(bank.spawnCount() === 0);
        jem.assert(bank.waitCount() === 128);
    },

    onSpawned: function(instance) {
        this.spawnCount += 1;
    },

    onDespawned: function(instance, wasRecycled) {
        if (wasRecycled) {
            jem.assert(this.spawnCount === 128);
        }

        this.spawnCount -= 1;
    },

    // Piximitter -------------------------------------------------------------
    fakeContainer: function(x, y) {
        this.x = x;
        this.y = y;
        this.children = [];
        this.addChild = function(child) {
            this.children.push(child);
        }
        this.removeChild = function(child) {
            JEM.Utils.removeElement(this.children, child);
        }
    },

    fakeParticle: function() {
        this.emitter = null;
        this.x = 0;
        this.y = 0;
        this.vx = 0;
        this.vy = 0;
        this.sx = 1;
        this.sy = 1;
        this.rot = 0;

        this.setEmitter = function(emitter) {
            this.emitter = emitter;
        };

        this.setPosition = function(x, y) {
            this.x = x;
            this.y = y;
        };

        this.setVelocity = function(vx, vy) {
            this.vx = vx;
            this.vy = vy;
        };

        this.setScale = function(sx, sy) {
            this.sx = sx;
            this.sy = sy;
        };

        this.setRotation = function(theta) {
            this.rot = theta;
        };

        this.onSpawned = function() {
        };

        this.onDespawned = function() {
        };

        this.kill = function() {
            if (this.emitter) {
                this.emitter.onDied(this);
            }
        };
    },

    piximitterTest: function() {
        const srcContainer = new this.fakeContainer(100, 100);
        const destContainer = new this.fakeContainer(200, 0);

        var piximitter = new JEM.Piximitter(this.fakeParticle, 0, null, null);
        var particle = piximitter.emit();
        jem.assert(particle.x === 0);
        jem.assert(particle.y === 0);
        jem.assert(particle.vx === 0);
        jem.assert(particle.vy === 0);
        jem.assert(particle.sx === 1);
        jem.assert(particle.sy === 1);
        jem.assert(particle.rot === 0);
        jem.assert(piximitter.getCount() == 1);
        particle.kill();
        jem.assert(piximitter.getCount() == 0);

        var optionsOne = {
            position: {minX: 5, minY: 15},
            velocity: {minSpeed: 4, minAngle: 90.0},
            scale: {minScaleX: 2, minScaleY: 3},
            rotation: {minAngle: 45}
        };

        piximitter = new JEM.Piximitter(this.fakeParticle, 0, null, null, optionsOne);
        particle = piximitter.emit();
        jem.assert(particle.x === 5);
        jem.assert(particle.y === 15);
        jem.assert(Math.abs(0 - particle.vx) < 0.001);
        jem.assert(Math.abs(-optionsOne.velocity.minSpeed - particle.vy) < 0.001);
        jem.assert(particle.sx === 2);
        jem.assert(particle.sy === 3);
        jem.assert(Math.abs(particle.rot - JEM.Utils.degreesToRadians(45)) < 0.001);
        jem.assert(piximitter.getCount() == 1);
        particle.kill();
        jem.assert(piximitter.getCount() == 0);

        piximitter = new JEM.Piximitter(this.fakeParticle, 0, srcContainer, null, optionsOne);
        particle = piximitter.emit();
        jem.assert(particle.x === 105);
        jem.assert(particle.y === 115);
        jem.assert(Math.abs(0 - particle.vx) < 0.001);
        jem.assert(Math.abs(-optionsOne.velocity.minSpeed - particle.vy) < 0.001);
        jem.assert(particle.sx === 2);
        jem.assert(particle.sy === 3);
        jem.assert(Math.abs(particle.rot - JEM.Utils.degreesToRadians(45)) < 0.001);
        jem.assert(piximitter.getCount() == 1);
        particle.kill();
        jem.assert(piximitter.getCount() == 0);

        piximitter = new JEM.Piximitter(this.fakeParticle, 0, srcContainer, destContainer, optionsOne);
        particle = piximitter.emit();
        jem.assert(particle.x === -95);
        jem.assert(particle.y === 115);
        jem.assert(Math.abs(0 - particle.vx) < 0.001);
        jem.assert(Math.abs(-optionsOne.velocity.minSpeed - particle.vy) < 0.001);
        jem.assert(particle.sx === 2);
        jem.assert(particle.sy === 3);
        jem.assert(Math.abs(particle.rot - JEM.Utils.degreesToRadians(45)) < 0.001);
        jem.assert(piximitter.getCount() == 1);
        particle.kill();
        jem.assert(piximitter.getCount() == 0);

        optionsOne.offsetFunction = function() {
            const result = {
                x: Math.random() < 0.5 ? -10 : 10,
                y: Math.random() < 0.5 ? -15 : 15
            };

            return result;
        };

        piximitter = new JEM.Piximitter(this.fakeParticle, 0, srcContainer, destContainer, optionsOne);
        particle = piximitter.emit();
        jem.assert(particle.x === -105 || particle.x === -85);
        jem.assert(particle.y === 100 || particle.y === 130);
        jem.assert(Math.abs(0 - particle.vx) < 0.001);
        jem.assert(Math.abs(-optionsOne.velocity.minSpeed - particle.vy) < 0.001);
        jem.assert(particle.sx === 2);
        jem.assert(particle.sy === 3);
        jem.assert(Math.abs(particle.rot - JEM.Utils.degreesToRadians(45)) < 0.001);
        jem.assert(piximitter.getCount() == 1);
        particle.kill();
        jem.assert(piximitter.getCount() == 0);
    }
};

var jem = JEM.create();
jem.start(JEM.Tests);
