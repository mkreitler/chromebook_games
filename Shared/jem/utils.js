jem.Utils = {
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

    removeElement: function(array, element, preserveOrder, fromLast) {
        if (array) {
            var index = fromLast ? array.lastIndexOf(element) : array.indexOf(element);
            this.removeElementAtIndex(array, index, preserveOrder);
        }
    }
};
