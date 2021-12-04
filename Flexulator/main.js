var _ = {
	canvas: 	null,
	ctxt: 		null,
	rows: 		10,
	cols: 		10,
	keyMap: 	{},
	fontSize: 	30,
	font: 		"Arial",
	value: 		[-1, -1, -1],
	vIndexCur:  -1,
	addByTen: 	false,
	curOp: 		"",
	oneOper: 	0,
	tenOper: 	0,
	mouseRow: 	-1,
	mouseCol: 	-1,
	curRegion: 	0,
	mouseDownX: -1,
	mouseDownY: -1,
	isDragging:  false,
	mouseDown:  false,

	selectRegion: [
		{top: -1, left: -1, width: -1, height: -1, color: "#444444"},
		{top: -1, left: -1, width: -1, height: -1, color: "#442222"},
		{top: -1, left: -1, width: -1, height: -1, color: "#444400"},
		{top: -1, left: -1, width: -1, height: -1, color: "#004444"},
	],

	opSymbol: {add: "+", subtract: "-", multiply: "*", divide: "/"},

	MAX_COLS: 		34,
	MAX_ROWS: 		20,
	MIN_COLS: 		5,
	MIN_ROWS: 		3,
	DEFAULT_CELLS: 	10, 
	VALUE_Y: 		50,
	VALUE_FILL: 	["blue", "green", "red"],
	BASE_VALUE: 	0,
	RESULT: 		1,
	REMAINDER: 		2,
	MAX_VALUE: 		100,
	MOUSE_MOVE_TOL: 15,
	READOUT_SIZE: 	24,

	init: function() {
		this.createCanvas();
		this.setFont();

		document.addEventListener("keydown", this.onKeyDown.bind(this), false);
		document.addEventListener("mousedown", this.onMouseDown.bind(this), false);
		document.addEventListener("mouseup", this.onMouseUp.bind(this), false);
		document.addEventListener("keyup", this.onKeyUp.bind(this), false);
		document.addEventListener("mousemove", this.onMouseMove.bind(this), false);
		this.clearKeymap();

		this.setKeymapFor("arrowleft", this.removeColumn);
		this.setKeymapFor("arrowright", this.addColumn);
		this.setKeymapFor("arrowup", this.addRow);
		this.setKeymapFor("arrowdown", this.removeRow);
		this.setKeymapFor("shift", this.setByTen);
		this.setKeymapFor(" ", this.clearSelections);
		this.setKeymapFor("a", this.add);
		this.setKeymapFor("s", this.subtract);
		this.setKeymapFor("m", this.multiply);
		this.setKeymapFor("d", this.divide);

		for (var i=0; i<10; ++i) {
			this.setKeymapFor("" + i, this.onDigitDown);
		}

		this.setKeymapFor("backspace", this.clearValue);
	},

	resetSelectRegion: function(regionIndex) {
		if (regionIndex >= 0 && regionIndex < this.selectRegion.length) {
			var region = this.selectRegion[regionIndex];
			region.top = -1;
			region.left = -1;
			region.width = -1;
			region.height = -1;
		}
	},

	clearSelections: function() {
		for (var i=0; i<this.selectRegion.length; ++i) {
			this.resetSelectRegion(i);
		}

		this.curRegion = 0;

		this.draw();
	},

	getNextSelectRegion: function() {
		var i = 0;
		var region = null;

		for (i=0; i<this.selectRegion.length; ++i) {
			region = this.selectRegion[i];

			if (region.top < 0) {
				break;
			}
		}

		i %= this.selectRegion.length;

		return i;		
	},

	updateSelectRegion: function(left, top, width, height) {
		if (this.curRegion >= 0 && this.curRegion < this.selectRegion.length) {
			region = this.selectRegion[this.curRegion];

			if (isNaN(left) || isNaN(top) || isNaN(width) || isNaN(height)) {
				console.log("!!!");
			}

			region.top = top;
			region.left = left;
			region.width = width;
			region.height = height;
		}
	},

	onDigitDown: function(key) {
		this.vIndexCur = this.BASE_VALUE;

		if (this.value[this.vIndexCur] < 0) {
			this.value[this.vIndexCur] = 0;
		}

		this.value[this.OTHER_VALUE] = -1;
		this.curOp = "";

		this.value[this.vIndexCur] = parseInt("" + this.value[this.vIndexCur] + key);
		this.draw();
	},

	clearValue: function() {
		for (var i=0; i<this.value.length; ++i) {
			this.value[i] = -1;
		}

		this.setOp("");

		this.draw();
	},

	updateRows: function() {
		this.rows = Math.floor((this.MAX_VALUE + this.cols - 1) / this.cols);
	},

	updateCols: function() {
		this.cols = Math.floor((this.MAX_VALUE + this.rows - 1) / this.rows);
	},

	setByTen: function() {
		this.addByTen = true;
	},

	clearByTen: function() {
		this.addByTen = false;
	},

	add: function() {
		this.setOp("add");

		if (this.addByTen) {
			this.tenOper += 1;
		}
		else {
			this.oneOper += 1;
		}

		this.value[this.RESULT] = this.value[this.BASE_VALUE] + 10 * this.tenOper + this.oneOper;

		if (this.value[this.RESULT] > this.MAX_VALUE) {
			this.clearValue();
		}

		this.draw();
	},

	subtract: function() {
		this.setOp("subtract");

		if (this.addByTen) {
			this.tenOper += 1;
		}
		else {
			this.oneOper += 1;
		}

		this.value[this.RESULT] = this.value[this.BASE_VALUE] - (10 * this.tenOper + this.oneOper);

		if (this.value[this.RESULT] < 1) {
			this.clearValue();
		}

		this.draw();
	},

	multiply: function() {
		this.setOp("multiply");

		this.oneOper += 1;
		this.value[this.RESULT] = this.value[this.BASE_VALUE] * this.oneOper;

		if (this.value[this.RESULT] > this.MAX_VALUE) {
			this.clearValue();
		}

		this.draw();
	},

	divide: function() {
		this.setOp("divide");

		this.oneOper += 1;
		var result = Math.floor(this.value[this.BASE_VALUE] / this.oneOper);
		this.value[this.REMAINDER] = this.value[this.BASE_VALUE] - result * this.oneOper;
		this.value[this.RESULT] = result;

		if (this.value[this.RESULT] < 1) {
			this.clearValue();
		}

		this.draw();
	},

	setOp: function(newOp) {
		if (this.curOp !== newOp) {
			if (newOp === "multiply" || newOp === "divide") {
				this.oneOper = 1;
			}
			else {
				this.oneOper = 0;
			}

			this.tenOper = 0;

			this.value[this.RESULT] = -1;
			this.value[this.REMAINDER] = -1;

			this.curOp = newOp;
		}
	},

	removeColumn: function(key) {
		if (this.cols > this.MIN_COLS) {
			this.cols -= 1;
			this.updateRows();
			this.clearSelections();
			this.draw();
		}
	},

	addColumn: function(key) {
		if (this.cols < this.MAX_COLS) {
			this.cols += 1;
			this.updateRows();
			this.clearSelections();
			this.draw();
		}
	},

	removeRow: function(key) {
		if (this.rows > this.MIN_ROWS) {
			this.rows -= 1;
			this.updateCols();
			this.clearSelections();
			this.draw();
		}
	},

	addRow: function(key) {
		if (this.rows < this.MAX_ROWS) {
			this.rows += 1;
			this.updateCols();
			this.clearSelections();
			this.draw();
		}
	},

	print: function(text, x, y, color, scale) {
		if (text && this.ctxt) {
			if (!color) color = "blue";

			this.ctxt.save();

			if (scale) {
				this.ctxt.font = "" + Math.round(this.fontSize * scale) + "px " + this.font;
			}

			this.ctxt.fillStyle = color;
			this.ctxt.fillText(text, x, y);
			this.ctxt.restore();
		}
	},

	setFont: function() {
		if (this.ctxt) {
			this.ctxt.font = this.fontSize + "px " + this.font;
			this.ctxt.save();
		}
	},

	setKeymapFor: function(key, func) {
		if (key) {
			var lowKey = key.toLowerCase();
			this.keyMap[lowKey] = func.bind(this);
		}
	},

	clearKeymap: function() {
		for (var key in this.keyMap) {
			this.keyMap[key] = null;
		}
	},

	onKeyUp: function(e) {
		if (e.key === "Shift") {
			this.clearByTen();
		}

		e.preventDefault();

		return false;
	},

	onKeyDown: function(e) {
		if (e && e.key) {
			var lowKey = e.key.toLowerCase();

			console.log("KEY: " + e.key);

			for (var key in this.keyMap) {
				if (key === lowKey) {
					if (this.keyMap[key]) {
						this.keyMap[key](key);
					}

					break;
				}
			}
		}

		e.preventDefault();

		return false;
	},

	onMouseDown: function(e) {
		this.getMouseRowAndCol(e.x, e.y);

		this.mouseCol = this.mouseRowCol.col;
		this.mouseRow = this.mouseRowCol.row;
		this.mouseDownX = e.x;
		this.mouseDownY = e.y;
		this.isDragging = false;
		this.mouseDown = true;
	},

	onMouseMove: function(e) {
		if (this.mouseDown) {
			var dx = e.x - this.mouseDownX;
			var dy = e.y - this.mouseDownY;

			if (this.isDragging || dx * dx + dy * dy > this.MOUSE_MOVE_TOL * this.MOUSE_MOVE_TOL) {
				this.isDragging = true;
				this.updateMouseDrag(e);
			}
		}
	},

	updateMouseDrag: function(e) {
		this.getMouseRowAndCol(e.x, e.y);

		var row = this.mouseRowCol.row;
		var col = this.mouseRowCol.col;

		var cellSize = Math.floor(Math.min(this.canvas.height / (this.rows + 1), this.canvas.width / (this.cols + 1)));

		var top = this.canvas.height - cellSize - Math.max(this.mouseRow, row) * cellSize;
		var left = (Math.min(this.mouseCol, col) - 1) * cellSize;
		var height = (Math.abs(this.mouseRow - row) + 1) * cellSize;
		var width = (Math.abs(this.mouseCol - col) + 1) * cellSize;

		this.updateSelectRegion(left, top, width, height);

		this.draw();
	},

	mouseRowCol: {row: -1, col: -1},

	getMouseRowAndCol: function(mouseX, mouseY) {
		var yBottom = this.canvas.offsetTop + this.canvas.height;
		var yOnCanvas = yBottom - mouseY;

		var dCell = 0;
		if (this.canvas.height / (this.rows + 1) < this.canvas.width / (this.cols + 1)) {
			dCell = Math.floor(this.canvas.height / (this.rows + 1));
		}
		else {
			dCell = Math.floor(this.canvas.width / (this.cols + 1));
		}

		var x = mouseX - this.canvas.offsetLeft;
		var y = yOnCanvas - dCell;

		this.mouseRowCol.row = Math.floor(y / dCell) + 1;
		this.mouseRowCol.col = Math.floor(x / dCell) + 1;

		this.mouseRowCol.row = Math.min(this.mouseRowCol.row, this.rows);
		this.mouseRowCol.row = Math.max(this.mouseRowCol.row, 1);

		this.mouseRowCol.col = Math.min(this.mouseRowCol.col, this.cols);
		this.mouseRowCol.col = Math.max(this.mouseRowCol.col, 1);
	},

	onMouseUp: function(e) {
		this.getMouseRowAndCol(e.x, e.y);

		var row = this.mouseRowCol.row;
		var col = this.mouseRowCol.col;

		this.mouseDown = false;

		if (!this.isDragging &&
			row >= 1 && row <= this.rows &&
			col >= 1 && col <= this.cols) {

			this.vIndexCur = this.RESULT;
			this.value[this.vIndexCur] = (row - 1) * this.cols + col;
			this.draw();
		}
		else if (this.isDragging) {
			this.onMouseMove(e);
			this.curRegion += 1;
			this.curRegion %= this.selectRegion.length;
		}

		this.mouseRow = -1;
		this.mouseCol = -1;

		// console.log("Mouse down at: (" + x + ", " + y + ")");
		// console.log("Mouse down at: row = " + row + "   col = " + col);
	},

	createCanvas: function() {
		this.canvas = document.createElement("canvas");

		this.canvas.width = 1024;
		this.canvas.height = 660;

		this.ctxt = this.canvas.getContext('2d');

		document.body.appendChild(this.canvas);
	},

	drawValue: function() {
		// var dx = this.canvas.width - this.canvas.height;

		// this.print("" + this.value, this.canvas.height + Math.round(dx / 2 - this.fontSize / 2), this.VALUE_Y);
	},

	draw: function() {
		if (this.ctxt) {
			this.fillStyle = "black";
			this.ctxt.fillRect(0, 0, this.canvas.width, this.canvas.height);

			this.drawGrid();
			this.drawValue();
		}
	},

	drawGrid: function() {
		if (this.canvas && this.ctxt && this.rows > 0 && this.cols > 0) {
			this.ctxt.save();

			this.ctxt.fillStyle = "black";
			this.ctxt.fillRect(0, 0, this.canvas.width, this.canvas.height);

			this.ctxt.strokeStyle = "green";
			this.ctxt.lineWidth = 2;

			var scale = Math.max(this.rows, this.cols);
			var cellSize = Math.floor(Math.min(this.canvas.height / (this.rows + 1), this.canvas.width / (this.cols + 1)));

			for (var i=0; i<this.selectRegion.length; ++i) {
				if (this.selectRegion[i].top >= 0) {
					var region = this.selectRegion[i];

					this.ctxt.beginPath();
					this.ctxt.fillStyle = region.color;
					this.ctxt.fillRect(region.left, region.top, region.width, region.height);
					this.ctxt.closePath();
				}
			}

			var dx = cellSize * this.cols;
			for (var iRow=0; iRow<=this.rows; ++iRow) {
				var y = (iRow + 1) * cellSize;
				var x = 0;
				this.ctxt.beginPath();
				this.ctxt.moveTo(x, this.canvas.height - y);
				this.ctxt.lineTo(dx, this.canvas.height - y);
				this.ctxt.stroke();

				if (iRow !== this.rows) {
//					this.print("" + (this.cols * (iRow + 1)), dx + this.fontSize / 5, this.canvas.height - y - this.fontSize / 2, "yellow", this.DEFAULT_CELLS / scale);
					this.print("" + (iRow + 1), dx + this.fontSize / 5, this.canvas.height - y - this.fontSize / 2, "yellow", this.DEFAULT_CELLS / scale);
				}
			}

			var dy = cellSize * (this.rows + 1);
			for (var iCol=0; iCol<=this.cols; ++iCol) {
				var x = Math.round(iCol * cellSize);
				this.ctxt.beginPath();
				this.ctxt.moveTo(x, this.canvas.height - cellSize);
				this.ctxt.lineTo(x, this.canvas.height - dy);
				this.ctxt.stroke();

				if (iCol !== this.cols) {
					this.print("" + (iCol + 1), x + this.fontSize / 2, this.canvas.height - 15, "yellow", this.DEFAULT_CELLS / scale);
				}
			}

			for (i=0; i<this.value.length; ++i) {
				if (this.value[i] > 0) {
					var row = Math.floor((this.value[i] - 1) / this.cols);
					var col = this.value[i] - row * this.cols;
					var dSize = cellSize;

					var x1 = (col - 1) * dSize;
					var y1 = this.canvas.height - (row + 1) * dSize;

					this.ctxt.fillStyle = this.VALUE_FILL[i];
					this.ctxt.fillRect(Math.round(x1), Math.round(y1 - dSize), Math.round(dSize), Math.round(dSize));

					var fontScale = this.DEFAULT_CELLS / scale;
					var text = "" + this.value[i];
					this.ctxt.font = "" + Math.round(this.fontSize * this.DEFAULT_CELLS / scale) + "px " + this.font;
					var xt = Math.round(x1) + Math.round(dSize) / 2 - Math.round(this.ctxt.measureText(text).width / 2);
					this.print(text, xt, y1 - 2 * Math.round(fontScale * this.fontSize) / 3, "white", fontScale);
				}
			}

			var x = Math.round(this.canvas.width * 25 / 32);
			var y = Math.round(this.canvas.height / 8);

			if (this.curOp && this.curOp != "") {
				this.ctxt.font = this.READOUT_SIZE + "px " + this.font;

				this.print("" + this.value[this.BASE_VALUE], x, y, this.VALUE_FILL[0], 1);

				x += Math.floor(Math.log(this.value[this.BASE_VALUE]) / Math.log(10)) * this.READOUT_SIZE + 1.1 * this.READOUT_SIZE;
				this.print(this.opSymbol[this.curOp], x, y, "yellow", 1);

				x += this.READOUT_SIZE * 1.1;
				this.print("" + (this.oneOper + this.tenOper * 10), x, y, this.VALUE_FILL[1], 1);
			}

			this.ctxt.restore();
		}
	},
};

_.init();
_.drawGrid();




