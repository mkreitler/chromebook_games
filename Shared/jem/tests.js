JEM.Tests = {
    assertions: [],
    tests: null,
    testIndex: 0,

    run: function() {
        // Register all tests here.
        this.tests = [
            this.arrayRemoval,
        ];
        
        this.testIndex = 0;
    },

    update: function(dt) {
        if (this.testIndex < this.tests.length) {
            try {
                this.tests[this.testIndex]();
                this.testIndex += 1;
            }
            catch(err) {
                // Nothing to do, here.
            }
        }
        else {
            this.report();
            jem.removeTicker(this);
            jem.reset();
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
            const message = "--- " + this.assert.caller
            this.assertions.push(message);
            throw new Error(message);
        }
    },

    arrayRemoval: function() {
        const firstArray = [1, 2, 3, 4, 5];
        jem.Utils.removeElementAtIndex(firstArray, 2);
        this.assert(firstArray[2] !== 3);

        const secondArray = [1, 2, 3, 4, 5];
        jem.Utils.removeElement(secondArray, 2);
        this.assert(secondArray[2] !== 3);
    },
};

var jem = JEM.create();
jem.start(JEM.Tests);
