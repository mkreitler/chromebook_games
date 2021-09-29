/**
 * Characters have the following traits:
 * Strength = # of Power talents
 * Agility = # of Accuracy talents
 * Intellect = # of Magic talents
 * Instinct = # of Reflex talents
 * Devotion = # of Prayer talents
 * Mettle = # of Endurance talents
 */
 
 toy.charCreate = {};
 
 toy.charCreate.questions = {
   "str_agl_01": {
     text: [
       "You are a guard at a border outpost.",
       "Orcs attack in the dead of night.",
       "Do you:",
       ],
     choices: [
       "Grab a bow and snipe from the walls",
       "Grab an axe and defend the gate"
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
     next: [
       "str_agl_02a",
       "str_agl_02b"
       ]
   },
   
   "str_agl_02a": {
     text: [
       "While exploring a cave, you are",
       "trapped by a mudslide. Overhead,",
       "A narrow crevice glows with daylight.",
       "Do you:"
       ],
     choices: [
       "Wriggle up and out through the crack",
       "Heave mud and stone to clear the entry"
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
     next: ["str_agl_03", "int_ins_01"]
   },
   "str_agl_02b": {
     text: [
       "You are invited to a tournament.",
       "In which event do you compete?",
       ],
     choices: [
       "Archery context",
       "Wrestling contest",
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
     next: ["int_ins_01", "str_agl_03"]
   },
   "str_agl_03": {
     text: [
       "While searching an ancient tomb,",
       "you uncover a treasure chest.",
       "Do you:"
       ],
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
     next: ["int_ins_01", "int_ins_01"]
   },
   "int_ins_01": {
     text: [
       "While searching an ancient tomb,",
       "you uncover a treasure chest.",
       "Do you:"
       ],
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
     next: ["int_ins_01", "int_ins_01"]
   },
   
   "dev_met_01": {
     text: [
       "You and a friend are exploring ruins.",
       "A decrepit stone pillar tumbles toward",
       "your friend. Do you:",
       ],
     choices: [
       "Pray for strength and try to hold it up",
       "Risk your life to push your friend clear"
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
     next: [
       "str_agl_02a",
       "str_agl_02b"
       ]
   },
 };
 
 toy.charCreate.step = null;
 toy.charCreate.storyChoice = 0;

jb.program.charCreate = function() {
  toy.charCreate.step = "str_agl_01";
  jb.setOpenTypeFont(this.fontMain, this.FONT_SIZE);
};

jb.program.do_CharCreateStorySelect = function() {
  if (toy.charCreate.step) {
    var charCreateStep = toy.charCreate.questions[toy.charCreate.step];
    var y = 0;
    
    jb.clear();
    
    for (var i=0; i<charCreateStep.text.length; ++i) {
      jb.drawOpenTypeFontAt(jb.ctxt, charCreateStep.text[i], 0, y, "gray", "gray", 0, 0);
      y += this.FONT_SIZE;
    }
    
    y += this.FONT_SIZE;
    for (i=0; i<charCreateStep.choices.length; ++i) {
      if (i === toy.charCreate.storyChoice) {
        jb.drawOpenTypeFontAt(jb.ctxt, "> " + charCreateStep.choices[i] + " <", 0, y, "white", "white", 0, 0);
      }
      else {
        jb.drawOpenTypeFontAt(jb.ctxt, "  " + charCreateStep.choices[i] + "  ", 0, y, "gray", "gray", 0, 0);
      }
      y += this.FONT_SIZE;
    }
    
    if (jb.got === "up") {
      toy.charCreate.storyChoice -= 1
      if (toy.charCreate.storyChoice < 0) toy.charCreate.storyChoice = charCreateStep.choices.length - 1;
    }
    else if (jb.got === "down") {
      toy.charCreate.storyChoice += 1
      toy.charCreate.storyChoice %= charCreateStep.choices.length;
    }
    
    jb.reset();
    
  }

  jb.while(toy.charCreate.step !== null);
};

jb.program.charCreateStartSkillSelect = function() {
  jb.listenForTap();
};

jb.program.do_waitForSkillSelect = function() {
  while(!jb.tap.done);
};
