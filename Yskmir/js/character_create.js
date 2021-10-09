/**
 * Characters have the following traits:
 * Strength = # of Power talents
 * Agility = # of Accuracy talents
 * Intellect = # of Magic talents
 * Instinct = # of Reflex talents
 * Devotion = # of Prayer talents
 * Mettle = # of Endurance talents
 */
 
 toy.charCreate = {
  step: null,
  storyChoice: 0,
  TEXT_TOP: 250,

  reset: function() {
    this.step = null;
    this.storyChoice = 0;
  },
  
  setStep: function(stepKey) {
    jb.assert(this.questions.hasOwnProperty(stepKey), "No character create question for key " + stepKey + "!");
    this.step = stepKey;
  },
  
  getStepData: function() {
    return this.questions[this.step];
  }
};

jb.program.charCreate = function() {
  toy.player.reset();
  toy.charCreate.reset();
  jb.clear();

  toy.charCreate.setStep("str_agl_01");
  var charCreateStep = toy.charCreate.getStepData();
  toy.menu.init(this.fontMain, 0, toy.charCreate.TEXT_TOP, charCreateStep.text, charCreateStep.choices, 0, "white", "gray", this.FONT_SIZE);
};

jb.program.do_CharCreateStorySelect = function() {
  jb.clear();
  
  var charCreateDone = false;
  var choice = toy.menu.update();

  var charCreateStep = toy.charCreate.getStepData();
  charCreateStep.scene.draw(jb.ctxt);

if (choice >= 0) {
    charCreateStep.responses[choice](toy.player);
    
    var nextStep = charCreateStep.next[choice];
    charCreateDone = nextStep === null;

    if (!charCreateDone) {
      toy.charCreate.setStep(nextStep);
      charCreateStep = toy.charCreate.getStepData();
      toy.menu.init(this.fontMain, 0, toy.charCreate.TEXT_TOP, charCreateStep.text, charCreateStep.choices, 0, "white", "gray", this.FONT_SIZE);
    }
  }

  jb.while(!charCreateDone);
};

jb.program.charCreateStartSkillSelect = function() {
  toy.player.debug();
  jb.listenForTap();
};

jb.program.do_waitForSkillSelect = function() {
  jb.while(!jb.tap.done);
};

toy.charCreate.questions = {
  // Strength vs Agility
  "str_agl_01": {
    text: "You are a guard at a border outpost. Orcs attack in the dead of night. Do you:",
    choices: [
      "Grab a bow and snipe from the walls",
      "Grab an axe and defend the gate"
      ],
    responses: [
      function(player) {
        player.traits.strength = 1;
        player.traits.agility = 2;
      },
      function(player) {
        player.traits.strength = 2;
        player.traits.agility = 1;
      }
    ],
    scene: toy.scenes.sceneList.charCreate011,
    next: ["str_agl_02a", "str_agl_02b"]
  },
  "str_agl_02a": {
    text: "While exploring a cave, you are trapped by a mudslide. Overhead, daylight shines through a narrow crevice. Do you:",
    choices: [
      "Wriggle up and out through the crack",
      "Heave mud and stone to clear the entry"
      ],
    responses: [
      function(player) {
        player.traits.strength = 0;
        player.traits.agility = 3;
      },
      function(player) {
        player.traits.strength = -1;
        player.traits.agility = -1;
      }
    ],
    scene: toy.scenes.sceneList.charCreate012a,
    next: ["int_ins_01", "str_agl_03"]
  },
  "str_agl_02b": {
    text: "You are invited to a tournament. In which event do you compete?",
    choices: [
      "Archery competition",
      "Wrestling contest",
      ],
    responses: [
      function(player) {
        player.traits.strength = -1;
        player.traits.agility = -1;
      },
      function(player) {
        player.traits.strength = 3;
        player.traits.agility = 0;
      }
    ],
    scene: toy.scenes.sceneList.charCreate012b,
    next: ["str_agl_03", "int_ins_01"]
  },
  "str_agl_03": {
    text: "While searching an ancient tomb, you uncover a treasure chest. Do you:",
    choices: [
      "1) Smash it open",
      "2) Try to pick the lock",
      ],
    responses: [
      function(player) {
        player.traits.strength = 2;
        player.traits.agility = 1;
      },
      function(player) {
        player.traits.strength = 1;
        player.traits.agility = 2;
      }
    ],
    scene: toy.scenes.sceneList.charCreate013,
    next: ["int_ins_01", "int_ins_01"]
  },

  // Intellect vs Instinct
  "int_ins_01": {
    text: "You are deep in a subterranean cave when your last torch burns out. Do you:",
    choices: [
      "Use air currents to find your way out",
      "Retrace your steps based on memory",
      ],
    responses: [
      function(player) {
        player.traits.intellect = 1;
        player.traits.instinct = 2;
      },
      function(player) {
        player.traits.intellect = 2;
        player.traits.instinct = 1;
      }
    ],
    scene: toy.scenes.sceneList.charCreate01a,
    next: ["int_ins_02a", "int_ins_02b"]
  },
  "int_ins_02a": {
    text: "You have found a mysteriouds altar on which rests a solid gold idol. You are certain the statue is booby trapped. Do you:",
    choices: [
      "Try to locate and disarm the mechanism",
      "Snatch the idol and dodge the trap",
      ],
    responses: [
      function(player) {
        player.traits.intellect = -1;
        player.traits.instinct = -1;
      },
      function(player) {
        player.traits.intellect = 0;
        player.traits.instinct = 3;
      }
    ],
    scene: toy.scenes.sceneList.charCreate01a,
    next: ["int_ins_03", "dev_met_01"]
  },
  "int_ins_02b": {
    text: "While hunting in an Elder Wood, you encounter a boulder inscribed with runes. Do you:",
    choices: [
      "Spend several hours decyphering them",
      "Stay alert and proceed with caution",
      ],
    responses: [
      function(player) {
        player.traits.intellect = 3;
        player.traits.instinct = 0;
      },
      function(player) {
        player.traits.intellect = -1;
        player.traits.instinct = -1;
      }
    ],
    scene: toy.scenes.sceneList.charCreate01a,
    next: ["dev_met_01", "int_ins_03"]
  },
  "int_ins_03": {
    text: "You are gambling at an inn with 2 men, both strangers. The first man accuses the second of using loaded dice. The second man denies it. They turn to you to settle the matter. Do you:",
    choices: [
      "Search the others' eyes to see who is lying",
      "Compute the odds that the dice are rigged",
      ],
    responses: [
      function(player) {
        player.traits.intellect = 1;
        player.traits.instinct = 2;
      },
      function(player) {
        player.traits.intellect = 2;
        player.traits.instinct = 1;
      }
    ],
    scene: toy.scenes.sceneList.charCreate01a,
    next: ["dev_met_01", "dev_met_01"]
  },
  
  // Devotion vs Mettle
  "dev_met_01": {
    text: "You and a friend are exploring ruins. A decrepit stone pillar tumbles toward the two of you. Do you:",
    choices: [
      "Pray for strength and try to hold the wall up",
      "Push your friend clear and hope you survive"
      ],
    responses: [
      function(player) {
        player.traits.devotion = 2;
        player.traits.mettle = 1;
      },
      function(player) {
        player.traits.devotion = 1;
        player.traits.mettle = 2;
      }
    ],
    scene: toy.scenes.sceneList.charCreate01a,
    next: ["dev_met_02a", "dev_met_02b"]
  },
  "dev_met_02a": {
    text: "You are wandering lost in the wilderness and have not eaten in days. Do you:",
    choices: [
      "Use your last strength to hunt and gather",
      "Keep walking, sure you will find food soon"
      ],
    responses: [
      function(player) {
        player.traits.devotion = -1;
        player.traits.mettle = -1;
      },
      function(player) {
        player.traits.devotion = 3;
        player.traits.mettle = 0;
      }
    ],
    scene: toy.scenes.sceneList.charCreate01a,
    next: ["dev_met_03", null]
  },
  "dev_met_02b": {
    text: "You visit an old friend, only to find she has been ravaged by disease. Though she has recovered, she is weak. Do you:",
    choices: [
      "Offer to rehabilitate her to full strength",
      "Offer to take her to the Temple healers"
      ],
    responses: [
      function(player) {
        player.traits.devotion = 0;
        player.traits.mettle = 3;
      },
      function(player) {
        player.traits.devotion = -1;
        player.traits.mettle = -1;
      }
    ],
    scene: toy.scenes.sceneList.charCreate01a,
    next: [null, "dev_met_03"]
  },
  "dev_met_03": {
    text: "What is the better use for fine wine?",
    choices: [
      "Holy sacrament",
      "Drinking contest"
      ],
    responses: [
      function(player) {
        player.traits.devotion = 2;
        player.traits.mettle = 1;
      },
      function(player) {
        player.traits.devotion = 1;
        player.traits.mettle = 2;
      }
    ],
    scene: toy.scenes.sceneList.charCreate01a,
    next: [null, null]
  },
};
