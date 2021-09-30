toy.player = {
  traits: {
    "strength": 0,
    "agility" : 0,
    "intellect" : 0,
    "instinct" : 0,
    "devotion" : 0,
    "mettle": 0
  },

  reset: function() {
    this.traits.strength = 0;
    this.traits.agility = 0;
    this.traits.intellect = 0;
    this.traits.instinct = 0;
    this.traits.devotion = 0;
    this.traits.mettle = 0;
  },

  debug: function() {
    jb.logToConsole("=== Player Stats ===");
    Object.keys(this.traits).forEach( function(key) {
      jb.logToConsole(key + ": " + this.traits[key]);
    }.bind(toy.player))
  }
};
