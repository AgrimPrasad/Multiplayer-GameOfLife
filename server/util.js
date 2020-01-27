/**
 * Creates a 2D-Array Grid during runtime for
 * the website to use for most operations.
 *
 *  @param {object} grid - grid object which is being manipulated
 */
export let cellCalc = function(grid) {
  for (let i = 0; i < grid.width; i++) {
    grid.gridList[i] = [];
    for (let j = 0; j < grid.height; j++) {
      grid.gridList[i][j] = { isAlive: false };
    }
  }

  return grid;
};

/**
 * Changes the 'isAlive' object property
 * of a specific cell to the one requested
 * in the param.
 *
 * @param {number} x - the x position
 * @param {number} y - the y position
 * @param {boolean} isAlive - the new alive status
 * @param {object} grid - grid object which is being manipulated
 */
export let setCell = function(x, y, isAlive, grid) {
  if (grid.gridList[x][y].isAlive != isAlive) {
    grid.gridList[x][y].isAlive = isAlive;

    let { updatedCellsAlive, updatedCellsCreated } = updateCellCount(
      isAlive,
      grid.cellsAlive,
      grid.cellsCreated
    );

    grid.cellsAlive = updatedCellsAlive;
    grid.cellsCreated = updatedCellsCreated;
  }

  return grid;
};

/**
 * Updates the current cellcount on each new tick.
 *
 * @param {boolean} alive - boolean based on cell isAlive status
 * @param {number} cellsAlive - number of cells alive currently
 * @param {number} cellsCreated - number of cells created so far
 */
export let updateCellCount = function(alive, cellsAlive, cellsCreated) {
  if (alive) {
    cellsAlive++;
    cellsCreated++;
  } else {
    cellsAlive--;
  }

  return { cellsAlive, cellsCreated };
};

/**
 * The main function that updates the grid
 * every tick based on the game of life rules.
 *
 * @param {object} grid - grid object which is being manipulated
 * @return {object} grid - manipulated grid object
 */
export let update = function(grid) {
  let tempArr = [];
  for (let i = 0; i < grid.width; i++) {
    tempArr[i] = [];
    for (let j = 0; j < grid.height; j++) {
      let status = grid.gridList[i][j].isAlive;
      let neighbours = getNeighbours(i, j, grid);
      let result = false;
      // Rule 1:
      // Any live cell with fewer than two live neighbours dies,
      // as if by under population
      if (status && neighbours < 2) {
        result = false;
      }
      // Rule 2:
      // Any live cell with two or three neighbours lives on
      // to the next generation
      if ((status && neighbours == 2) || neighbours == 3) {
        result = true;
      }
      // Rule 3:
      // Any live cell with more than three live neighbours dies,
      // as if by overpopulation
      if (status && neighbours > 3) {
        result = false;
      }
      // Rule 4:
      // Any dead cell with exactly three live neighbours becomes
      // a live cell, as if by reproduction
      if (!status && neighbours == 3) {
        result = true;
      }
      tempArr[i][j] = result;
    }
  }

  // set new gridList content and update cell counts
  for (let i = 0; i < this.width; i++) {
    for (let j = 0; j < this.height; j++) {
      grid = setCell(i, j, tempArr[i][j], grid);
    }
  }
  grid.gridList = tempArr;

  return grid;
};

/**
 * Returns the amount of neighbours for
 * a specific cell on the grid.
 *
 * @param {number} posX - the x position
 * @param {number} posY - the Y position
 * @param {array} grid - copy of the shared grid
 * @return {number} neighbours - amount of neighbours
 */
export let getNeighbours = function(posX, posY, grid) {
  let neighbours = 0;
  if (posX <= grid.width && posY <= grid.height) {
    for (let offsetX = -1; offsetX < 2; offsetX++) {
      for (let offsetY = -1; offsetY < 2; offsetY++) {
        let newX = posX + offsetX;
        let newY = posY + offsetY;
        // check if offset is:
        // on current cell, out of bounds and if isAlive
        // for cell true
        if (
          (offsetX != 0 || offsetY != 0) &&
          newX >= 0 &&
          newX < grid.width &&
          newY >= 0 &&
          newY < grid.height &&
          grid.gridList[posX + offsetX][posY + offsetY].isAlive == true
        ) {
          neighbours++;
        }
      }
    }
  }
  return neighbours;
};
