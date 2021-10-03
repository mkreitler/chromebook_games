toy.scenes = {
  tileIndices: [0, 1, 2, 3, 4, 5, 6],
  stairIndices: [7, 8],
  //             0   1   2   3   4   5   6   7   8   9  10  11  12  13  14  15,
  wallIndicies: [9, 15, 10, 18, 13, 14, 16, 23, 12, 19, 11, 24, 17, 22, 21, 20],
  sheets: {
    wallsAndFloors: null,
    decorations: null,
  },
  
  init: function(wallsAndFloors, decorations) {
    this.sheets.wallsAndFloors = new jb.tileSheetObj(wallsAndFloors, jb.program.TILE_SIZE, jb.program.TILE_SIZE);
    this.sheets.decorations = new jb.tileSheetObj(decorations, jb.program.TILE_SIZE, jb.program.TILE_SIZE);
  },
  
  sceneToTiles: function(scene) {
    var tileList = [];
    
    for (var iRow=0; iRow<scene.length; ++iRow) {
      var rowData = [];
      tileList.push(rowData);
      
      for (var iCol=0; iCol<scene[iRow].length; ++iCol) {
        var tileCode = 0;
        if (scene[iRow].charAt(iCol) === '*') {
          if (iRow > 0 && scene[iRow - 1].charAt(iCol) === '*') tileCode += (1 << 0);
          if (iRow < scene.length - 1 && scene[iRow + 1].charAt(iCol) === '*') tileCode += (1 << 2);
          if (iCol > 0 && scene[iRow].charAt(iCol - 1) === '*') tileCode += (1 << 3);
          if (iCol < scene[iRow].length - 1 && scene[iRow].charAt(iCol + 1) === '*') tileCode += (1 << 1);
        }
        
        rowData.push(tileCode);
      }
    }
    
    return tileList;
  },
  
  drawAt: function(ctxt, layer, x, y, scale, tileList, tileSetIndex) {
    var tileSet = this.sheets[layer];
    jb.assert(tileSet, "Tile layer " + layer + " not found!");
    
    if (typeof tileSetIndex === 'undefined') tileSetIndex = 0;

    for (var iRow=0; iRow<tileList.length; ++iRow) {
      var top = y + iRow * jb.program.TILE_SIZE * scale;
      for (var iCol=0; iCol<tileList[iRow].length; ++iCol) {
        var left = x + iCol * jb.program.TILE_SIZE * scale;
        tileSet.draw(ctxt, left, top, tileSetIndex, tileList[iRow][iCol], scale, scale);
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
      ]
  },
};
