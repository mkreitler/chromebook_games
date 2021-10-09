toy.menu = {
    preamble: null,
    choices: null,
    defaultChoice: null,
    font: null,
    fontSize: 0,
    choice: -1,
    top: 0,
    left: 0,
    hAlign: 0,
    vAlign: 0,
    selectColor: "gray",
    unselectColor: "white",

    init: function(font, left, top, preamble, choices, defaultChoice, selectColor, unselectColor, fontSize) {
        this.preamble = preamble;
        this.choices = choices;
        this.defaultChoice = defaultChoice;
        this.choice = defaultChoice;

        if (typeof top === 'undefined') {
            this.top = 0;
        }
        else {
            this.top = top;
        }

        if (typeof left === 'undefined') {
            this.left = 0;
        }
        else {
            this.left = left;
        }

        this.selectColor = selectColor || "white";
        this.unselectColor = unselectColor || "gray";

        this.hAlign = left / jb.program.WIDTH;
        this.vAlign = top / jb.program.HEIGHT;

        this.font = font;
        this.fontSize = fontSize || jb.program.FONT_SIZE;
    },

    update: function() {
        var result = -1;

        jb.setOpenTypeFont(this.font, this.fontSize);

        if (jb.got === "up") {
            this.choice -= 1;
            if (this.choice < 0) this.choice += this.choices.length;
        }
        else if (jb.got === "down") {
            this.choice += 1;
            this.choice %= this.choices.length;
        }
        else if (jb.got === 'return') {
            result = this.choice;
        }

        jb.reset();

        var y = this.top;
        var x = this.left;

        if (this.preamble && this.preamble.length > 0) {
            var lines = jb.wordWrap(x, this.preamble);
            if (lines) {
                lines.forEach(function(line) {
                    jb.drawOpenTypeFontAt(jb.ctxt, line, x, y, this.unselectColor, this.unselectColor, this.hAlign, this.vAlign);
                    y += this.fontSize;
                }.bind(this));
            }

            y += this.fontSize;
        }

        if (this.choices && this.choices.length > 0) {
            for (var i=0; i<this.choices.length; ++i) {
                if (i === this.choice) {
                    jb.drawOpenTypeFontAt(jb.ctxt, "> " + this.choices[i] + " <", x, y, this.selectColor, this.selectColor, this.hAlign, this.vAlign);
                }
                else {
                    jb.drawOpenTypeFontAt(jb.ctxt, "  " + this.choices[i] + "  ", x, y, this.unselectColor, this.unselectColor, this.hAlign, this.vAlign);
                }

                y += this.fontSize;
            }
        }

        return result;
    }
};