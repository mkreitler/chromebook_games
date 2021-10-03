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
    else if (layer == "actors") {
        this.drawActorsAt(ctxt, x, y, scale, tileList);
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

  drawActorsAt: function(ctxt, x, y, scale, tileList) {
    var tileSet = this.sheets["actors"];

    for (var iRow=0; iRow<tileList.length; ++iRow) {
        var top = y + iRow * jb.program.TILE_SIZE * scale;
        for (var iCol=0; iCol<tileList[iRow].length; ++iCol) {
            var left = x + iCol * jb.program.TILE_SIZE * scale;
            var xScale = scale;
            var tileIndex = tileList[iRow][iCol];

            if (tileIndex) {
                if (tileIndex < 0) {
                    xScale *= -1;
                    tileIndex *= -1;
                }

                tileIndex -= 1;

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
    test: [
      "********************",
      "*  *          *    *",
      "*      *     ***   *",
      "*          *  *    *",
      "********************",
      ],
    testBack: [
        [[0, 2], [0, 2], [0, 6], [0, 2], [0, 6], [0, 6], [0, 7], [0, 6]],
    ],
    testActors1: [
        [0, 0, 0, 0, 0, 0, 0, 0, 0, -3, 0, 0, 0, 0,   0,   0,   0,   0],
    ],
    testActors2: [
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -7, 0, 0, 0, 145, 146,   0, 145],
    ]
  },
};
