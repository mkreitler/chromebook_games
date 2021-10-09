toy.scenes = {
  tileIndices: [0, 1, 2, 3, 4, 5, 6],
  stairIndices: [7, 8],
  //             0   1   2   3   4   5   6   7   8   9  10  11  12  13  14  15,
  wallIndices: [9, 15, 10, 18, 13, 14, 16, 23, 12, 19, 11, 24, 17, 22, 21, 20],
  sheets: {
    wallsAndFloors: null,
    decorations: null,
    backdrop: null,
    actors: null,
  },
  
  init: function(wallsAndFloors, decorations, backdrop, actors) {
    this.sheets.wallsAndFloors = new jb.tileSheetObj(wallsAndFloors, jb.program.TILE_SIZE, jb.program.TILE_SIZE);
    this.sheets.decorations = new jb.tileSheetObj(decorations, jb.program.TILE_SIZE, jb.program.TILE_SIZE);
    this.sheets.backdrop = new jb.tileSheetObj(backdrop, jb.program.BACKDROP_TILE_WIDTH, jb.program.BACKDROP_TILE_HEIGHT);
    this.sheets.actors = new jb.tileSheetObj(actors, jb.program.TILE_SIZE, jb.program.TILE_SIZE);
  },
  
  sceneToTiles: function(scene) {
    var tileList = [];
    
    for (var iRow=0; iRow<scene.length; ++iRow) {
      var rowData = [];
      tileList.push(rowData);
      
      for (var iCol=0; iCol<scene[iRow].length; ++iCol) {
        var tileCode = 3;
        if (scene[iRow].charAt(iCol) === '*') {
            tileCode = 0;
          if (iRow > 0 && scene[iRow - 1].charAt(iCol) === '*') tileCode += (1 << 0);
          if (iRow < scene.length - 1 && scene[iRow + 1].charAt(iCol) === '*') tileCode += (1 << 2);
          if (iCol > 0 && scene[iRow].charAt(iCol - 1) === '*') tileCode += (1 << 3);
          if (iCol < scene[iRow].length - 1 && scene[iRow].charAt(iCol + 1) === '*') tileCode += (1 << 1);
          tileCode = this.wallIndices[tileCode];
        }
        
        rowData.push(tileCode);
      }
    }
    
    return tileList;
  },
  
  drawAt: function(ctxt, layer, x, y, scale, tileList, tileSetIndex) {
    if (layer === "backdrop") {
        this.drawBackdropAt(ctxt, x, y, scale, tileList, tileSetIndex);
    }
    else if (layer == "actors" || layer == "decorations") {
        this.drawActorsAt(ctxt, layer, x, y, scale, tileList);
    }
    else {
        var tileSet = this.sheets[layer];
        jb.assert(tileSet, "Tile layer " + layer + " not found!");
        
        if (typeof tileSetIndex === 'undefined') tileSetIndex = 0;

        for (var iRow=0; iRow<tileList.length; ++iRow) {
            var top = y + iRow * jb.program.TILE_SIZE * scale;
            for (var iCol=0; iCol<tileList[iRow].length; ++iCol) {
                var left = x + iCol * jb.program.TILE_SIZE * scale;
                var xScale = scale;
                var tileIndex = tileList[iRow][iCol];
                if (tileIndex < 0) {
                    xScale *= -1;
                    tileIndex *= -1;
                    tileIndex -= 1;
                }
                tileSet.draw(ctxt, left, top, tileSetIndex, tileIndex, xScale, scale);
            }
        }
    }
  },

  drawActorsAt: function(ctxt, sheet, x, y, scale, tileList) {
    var tileSet = this.sheets[sheet];

    for (var iRow=0; iRow<tileList.length; ++iRow) {
        var top = y + iRow * jb.program.TILE_SIZE * scale;
        for (var iCol=0; iCol<tileList[iRow].length; ++iCol) {
            var left = x + iCol * jb.program.TILE_SIZE * scale;
            var xScale = scale;
            var rowIndex = tileList[iRow][iCol][0]
            var tileIndex = tileList[iRow][iCol][1];

            if (tileIndex) {
                if (tileIndex < 0) {
                    xScale *= -1;
                    tileIndex *= -1;
                }

                tileIndex -= 1;
                tileIndex += rowIndex * tileSet.cols;

                tileSetIndex = Math.floor(tileIndex / tileSet.cols);
                tileIndex = tileIndex % tileSet.cols;

                tileSet.draw(ctxt, left, top, tileSetIndex, tileIndex, xScale, scale);
            }
        }
    }
},
  
drawBackdropAt: function(ctxt, x, y, scale, tileList) {
    var tileSet = this.sheets["backdrop"];
    
    if (typeof tileSetIndex === 'undefined') tileSetIndex = 5;

    for (var iRow=0; iRow<tileList.length; ++iRow) {
      var top = y + iRow * jb.program.BACKDROP_TILE_HEIGHT * scale;
      for (var iCol=0; iCol<tileList[iRow].length; ++iCol) {
        var left = x + iCol * jb.program.BACKDROP_TILE_WIDTH * scale;
        var tileSetIndex = tileList[iRow][iCol][0];
        var tileIndex = tileList[iRow][iCol][1];
        var xScale = scale;
        if (tileIndex < 0) {
            xScale *= -1;
            tileIndex *= -1;
            tileIndex -= 1;
        }
        tileSet.draw(ctxt, left, top, tileSetIndex, tileIndex, xScale, scale);
      }
    }
  },
  
  sceneList: {
    charCreate011: {
        draw: function(ctxt) {
            jb.drawGradientRect(ctxt, 0, 0, jb.program.WIDTH, 211, true, [{fraction: 0.0, color: "#000088"}, {fraction: 0.75, color: "black"}]);
            jb.drawGradientRect(ctxt, 0, 212, jb.program.WIDTH, 32, true, [{fraction: 0.0, color: "#332200"}, {fraction: 0.75, color: "black"}]);
  
            toy.scenes.drawAt(ctxt, "backdrop", 0, 100, 2, this.testBack, 0);
            toy.scenes.drawAt(ctxt, "actors", 0, 100 - jb.program.TILE_SIZE * 2, 2, this.testActors1);
            toy.scenes.drawAt(ctxt, "actors", 24, 214 - jb.program.TILE_SIZE * 2, 2, this.testActors2);

        },
        testBack: [
            [[0, 2], [0, 2], [0, 6], [0, 2], [0, 6], [0, 6], [0, 7], [0, 6]],
        ],
        testActors1: [
            [[0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, -3]],
        ],
        testActors2: [
            [[0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, -7], [0, 0], [0, 0], [0, 0], [8, 2], [8, 1], [0, 0], [8, 3]],
        ]
      },
      charCreate012a: {
        draw: function(ctxt) {
            jb.drawGradientRect(ctxt, 0, 0, jb.program.WIDTH, 212, true, [{fraction: 0, color: "#332200"}, {fraction: 0.125, color: "#332200"}, {fraction: 0.5, color: "#000000"}, {fraction: 0.67, color: "#000000"}, {fraction: 0.825, color: "#332200"}]);
            jb.drawGradientRect(ctxt, 0, 212, jb.program.WIDTH, 32, true, [{fraction: 0.0, color: "#332200"}, {fraction: 0.75, color: "black"}]);
  
            toy.scenes.drawAt(ctxt, "backdrop", 112, 100, 2, this.testBack, 0);
            toy.scenes.drawAt(ctxt, "actors", 24, 214 - jb.program.TILE_SIZE * 2, 2, this.testActors1);
        },
        testBack: [
            [[7, 0], [7, 4], [7, 2], [7, 3], [7, 1], [7, 6], [7, 4], [7, 5]],
        ],
        testActors1: [
            [[2, 0], [2, 0], [2, 0], [2, 0], [2, 0], [2, 0], [2, 0], [2, 0], [2, 0], [0, 2]],
        ],
      },
      charCreate012b: {
        draw: function(ctxt) {
            jb.drawGradientRect(ctxt, 0, 0, jb.program.WIDTH, toy.charCreate.TEXT_TOP - jb.program.TILE_SIZE * 4, true, [{fraction: 0.0, color: "blue"}, {fraction: 0.9, color: "#8888FF"}, {fraction: 1.0, color: "#2D5526"}]);
            toy.scenes.drawAt(ctxt, "decorations", -16, toy.charCreate.TEXT_TOP - 1 - 2 * jb.program.TILE_SIZE * 2, 2, this.ground, 13);
            toy.scenes.drawAt(ctxt, "actors", 24, toy.charCreate.TEXT_TOP - jb.program.TILE_SIZE * 5, 2, this.wrestlers);

            for (var i=0; i<this.archery.length; ++i) {
                var x = jb.program.WIDTH - 8 * jb.program.TILE_SIZE * 2 + i * jb.program.TILE_SIZE;
                var y = toy.charCreate.TEXT_TOP - jb.program.TILE_SIZE * 5 + i * jb.program.TILE_SIZE;
                toy.scenes.drawAt(ctxt, "actors", x, y, 2, this.archery[i].archer);
                toy.scenes.sheets.decorations.draw(ctxt, x + jb.program.TILE_SIZE * 4 * 2, y, this.archery[i].target[0], this.archery[i].target[1], 1, 2);
            }

            jb.drawGradientRect(ctxt, 0, 228, jb.program.WIDTH, 24, true, [{fraction: 0.0, color: "#2D5526"}, {fraction: 0.75, color: "black"}]);

            // toy.scenes.drawAt(ctxt, "backdrop", 352, toy.charCreate.TEXT_TOP / 2 - jb.program.TILE_SIZE, 1, this.testBack01, 0);
            // toy.scenes.drawAt(ctxt, "backdrop", 182, toy.charCreate.TEXT_TOP - 57, 1, this.testBack01, 0);
        },
        ground: [
            [7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7],
            [7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7],
        ],
        testBack01: [
            [[8, 4], [8, 4], [8, 5], [8, 4], [8, 5], [8, 5], [8, 4], [8, 5]],
        ],
        wrestlers: [
            [[0, 0], [0, 0], [4, -6], [0, 0]],
            [[0, 0], [0, 0], [0, 0], [3, 4]],
        ],
        archery: [
            {archer: [[[0, -3]]], target: [6, 1]},
            {archer: [[[0, -12]]], target: [6, 1]},
            {archer: [[[7, -13]]], target: [6, 1]},
        ]
      },
      charCreate013: {
        draw: function(ctxt) {
          jb.drawGradientRect(ctxt, 0, 0, jb.program.WIDTH, jb.program.TILE_SIZE * 8, true, [{fraction: 0, color: "#666666"}, {fraction: 0.125, color: "#666666"}, {fraction: 0.5, color: "#000000"}]);
          jb.drawGradientRect(ctxt, 0, 210, jb.program.WIDTH, 36, true, [{fraction: 0.0, color: "#666666"}, {fraction: 0.25, color: "#666666"}, {fraction: 0.75, color: "black"}]);

          ctxt.globalAlpha = 0.67;
          toy.scenes.drawAt(ctxt, "backdrop", 0, 100, 2, this.back, 0);
          ctxt.globalAlpha = 1.0;

          toy.scenes.drawAt(ctxt, "actors", 24, 214 - jb.program.TILE_SIZE * 2, 2, this.actors1);
          toy.scenes.drawAt(ctxt, "decorations", 24, 214 - jb.program.TILE_SIZE * 2, 2, this.decor1);
      },
      back: [
        [[0, 0], [0, 7], [4, 2], [4, 5], [4, 3], [0, 2], [0, 3], [4, 1], [4, 6], [4, 4], [4, 5], [2, 2], [2, 5]],
      ],
      actors1: [
        [[2, 0], [2, 0], [2, 0], [2, 0], [2, 0], [2, 0], [2, 0], [2, -15], [2, 0], [3, 5]],
      ],
      decor1: [
        [[2, 0], [2, 0], [2, 0], [2, 0], [2, 0], [2, 0], [2, 0], [2, 0], [3, 4], [2, 0]],
      ],
    },
  },
};
