toy.sprites = {
    chars: {image: null, sheet: null},
    spawned: [],
    dormant: [],
    splash: { chars: [] },

    init: function() {
        this.chars.sheet = jb.sprites.addSheet("characters", this.chars.image, 0, 0, jb.program.TILE_SIZE, jb.program.TILE_SIZE);
    },

    makeSplashSprites: function() {
        var existsLeftChar = this.splash.chars.length > 0;
        var existsRightChar = this.splash.chars.length > 1;

        if (!existsLeftChar && !existsRightChar) {
            blueprints.draft("DemoChar", {}, {});
            blueprints.make("DemoChar", "sprite");
        }

        var newChars = [];

        if (!existsLeftChar) {
            var char = blueprints.build("DemoChar");
            this.splash.chars.push(char);
            newChars.push(char);
        }

        if (!existsRightChar) {
            var char = blueprints.build("DemoChar");
            this.splash.chars.push(char);
            newChars.push(char);
        }

        newChars.forEach( function(char) {
            var idleState = jb.sprites.createState([0, 1], 0.33);
            char.spriteSetSheet("characters");
            char.spriteAddState("idle", idleState);
            char.spriteSetAnchor(0.5, 0.0);
            char.spriteSetState("idle");
        });
        
        this.splash.chars[0].spriteMoveTo(jb.program.WIDTH / 4, jb.program.HEIGHT * 3 / 5);
        this.splash.chars[1].spriteMoveTo(jb.program.WIDTH * 3 / 4, jb.program.HEIGHT * 3 / 5);
        this.splash.chars[0].spriteSetScale(-4, 4);
        this.splash.chars[1].spriteSetScale(4, 4);
    },

    addSplashSprites: function() {
        this.spawn(this.splash.chars[0]);
        this.spawn(this.splash.chars[1]);
    },

    removeSplashSprites: function() {
        this.despawn(this.splash.chars[0]);
        this.despawn(this.splash.chars[1]);
    },

    update: function(ctxt) {
        for (var i=0; i<this.spawned.length; ++i) {
            this.spawned[i].spriteUpdate();
            this.spawned[i].spriteDraw(ctxt);
        }
    },

    spawn: function(sprite) {
        jb.assert(sprite, "Can't spawn invalid sprite!");

        sprite.spriteResetTimer();
        sprite.spriteShow();

        if (this.dormant.indexOf(sprite) >= 0) {
            jb.removeFromArray(this.dormant, sprite);
        }

        if (this.spawned.indexOf(sprite) < 0) {
            this.spawned.push(sprite);
        }
    },

    despawn: function(sprite) {
        jb.assert(sprite, "Can't despawn invalid sprite!");

        sprite.spriteHide();

        if (this.spawned.indexOf(sprite) >= 0) {
            jb.removeFromArray(this.spawned, sprite);
        }

        if (this.dormant.indexOf(sprite) < 0) {
            this.dormant.push(sprite);
        }
    }
};
