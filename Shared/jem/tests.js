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
            }
            catch(err) {
                // Nothing to do, here.
            }
            finally {
                this.testIndex += 1;
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

        const thirdArray = [1, 3, 2, 3, 5];
        jem.Utils.removeElement(thirdArray, 3);
        this.assert(thirdArray[1] !== 3);
        this.assert(thirdArray[2] === 3);

        const fourthArray = [1, 3, 2, 3, 5];
        jem.Utils.removeElement(thirdArray, 3, true);
        this.assert(fourthArray[3] !== 3);
        this.assert(fourthArray[1] === 3);
    },
};

var jem = JEM.create();
jem.start(JEM.Tests);
