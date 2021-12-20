JEM.Utils = {
    /**
     * Remove an element from an array at the specified index.
     * @param {The array from which to remove an element} array 
     * @param {Index of the element to remove} index 
     * @param {If 'true' preserves the order of the array (but takes more time)} preserveOrder 
     */
    removeElementAtIndex: function(array, index, preserveOrder) {
        if (index >=0 && index < array.length) {
            if (preserveOrder) {
                for (var i=index; i<array.length - 1; ++i) {
                    array[i] = array[i + 1];
                }
            }
            else {
                array[index] = array[array.length - 1];
            }

            array.length -= 1;
        }
    },

    /**
     * Remove a given element from an array.
     * @param {The array from which to remove an element} array 
     * @param {The element to remove} element 
     * @param {If 'true', preserves the order of the remaining elements (but takes more time)} preserveOrder 
     * @param {If 'true', removes the last instance of the element (otherwise, removes the first instance)} fromLast 
     */
    removeElement: function(array, element, preserveOrder, fromLast) {
        if (array) {
            var index = fromLast ? array.lastIndexOf(element) : array.indexOf(element);
            this.removeElementAtIndex(array, index, preserveOrder);
        }
    },

    /**
     * Adds NOP functions to missing interface elements. Expects the following arguments:
     * @param {object on which to enforce the interface} object
     * @param {any number of keys representing interface members} String
     * @param {a default function to add to the object for each missing interface member} function
     */
    enforceInterface: function() {
        var obj = arguments[0];
        var defaultFn = arguments[arguments.length - 1];

        for (var i=1; i<arguments.length - 1; ++i) {
            if (!obj[arguments[i]]) {
                obj[arguments[i]] = defaultFn;
            }
        }
    },

    radiansToDegrees: function(rad) {
        return rad * 180 / Math.PI;
    },

    degreesToRadians: function(deg) {
        return deg * Math.PI / 180;
    },
};
