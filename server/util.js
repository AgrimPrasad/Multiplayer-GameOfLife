import averageColour from "average-colour";
import randomColor from "randomcolor";
import * as shared from "./shared";

/**
 * Init a 2D-Array Grid of cellsduring runtime for
 * the website to use for most operations.
 *
 *  @param {object} grid - grid object which is being manipulated
 */
export let initCells = function(grid) {
  for (let i = 0; i < grid.width; i++) {
    grid.gridList[i] = [];
    for (let j = 0; j < grid.height; j++) {
      grid.gridList[i][j] = {
        isAlive: false,
        color: "#ffffff" // default white
      };
    }
  }

  grid.cellsAlive = 0;
  grid.cellsCreated = 0;
  grid.currentSpeed = 100;
  grid.currentTick = 0;

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
 * @param {string} color - color for this cell
 * @param {object} grid - grid object which is being manipulated
 */
export let setCell = function(x, y, isAlive, color, grid) {
  if (grid.gridList[x][y].isAlive != isAlive) {
    grid.gridList[x][y].isAlive = isAlive;
    grid.gridList[x][y].color = color;

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
  let updatedCellsAlive = cellsAlive;
  let updatedCellsCreated = cellsCreated;
  if (alive) {
    updatedCellsAlive++;
    updatedCellsCreated++;
  } else {
    if (updatedCellsAlive > 0) {
      updatedCellsAlive--;
    }
  }

  return { updatedCellsAlive, updatedCellsCreated };
};

/**
 * The main function that updates the grid
 * every tick based on the game of life rules.
 *
 * @param {object} grid - grid object which is being manipulated
 * @param {string} color - grid object which is being manipulated
 * @return {object} grid - manipulated grid object
 */
export let update = function(grid, color) {
  let tempArr = [];
  for (let i = 0; i < grid.width; i++) {
    tempArr[i] = [];
    for (let j = 0; j < grid.height; j++) {
      let status = grid.gridList[i][j].isAlive;
      let color = grid.gridList[i][j].color;
      let neighbours = getNeighbours(i, j, grid);
      let result = false;
      // Rule 1:
      // Any live cell with fewer than two live neighbours dies,
      // as if by under population
      if (status && neighbours.length < 2) {
        result = false;
      }
      // Rule 2:
      // Any live cell with two or three neighbours lives on
      // to the next generation
      if ((status && neighbours.length == 2) || neighbours.length == 3) {
        result = true;
      }
      // Rule 3:
      // Any live cell with more than three live neighbours dies,
      // as if by overpopulation
      if (status && neighbours.length > 3) {
        result = false;
      }
      // Rule 4:
      // Any dead cell with exactly three live neighbours becomes
      // a live cell, as if by reproduction
      if (!status && neighbours.length == 3) {
        result = true;

        let neighbourColours = [];
        neighbours.forEach(neighbour => {
          neighbourColours.push(neighbour.color);
        });

        color = averageColour(neighbourColours);
      }
      tempArr[i][j] = { result, color };
    }
  }

  // set new gridList content and update cell counts
  for (let i = 0; i < grid.width; i++) {
    for (let j = 0; j < grid.height; j++) {
      grid = setCell(i, j, tempArr[i][j].result, tempArr[i][j].color, grid);
    }
  }

  return grid;
};

/**
 * Returns the amount of neighbours for
 * a specific cell on the grid.
 *
 * @param {number} posX - the x position
 * @param {number} posY - the Y position
 * @param {array} grid - copy of the shared grid
 * @return {array} neighbours - list of neighbours
 */
export let getNeighbours = function(posX, posY, grid) {
  let neighbours = [];
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
          neighbours.push(grid.gridList[posX + offsetX][posY + offsetY]);
        }
      }
    }
  }
  return neighbours;
};

/**
 * Starts a new simulation,
 * should call from timer
 */
export let startSimulation = function(userColor) {
  // Backup current grid and grid list
  let backupGridList = shared.grid.gridList.map(function(arr) {
    return arr.slice();
  });

  let backupGrid = {};
  Object.assign(backupGrid, shared.grid);
  backupGrid.gridList = backupGridList;

  // update backup grid for latest tick
  // and update shared grid thereafter
  backupGrid = update(backupGrid, userColor);
  shared.grid = backupGrid;
  shared.grid.currentTick++;

  if (process.env.NODE_ENV != "production") {
    console.log("current cellsAlive:", shared.grid.cellsAlive);
    console.log("current cellsCreated:", shared.grid.cellsCreated);
    console.log("current currentTick:", shared.grid.currentTick);
    console.log("current currentSpeed:", shared.grid.currentSpeed);
  }

  // Broadcast message
  shared.io.sockets.emit("gridUpdate", {
    grid: shared.grid
  });
};

/**
 * Gets a unique color
 * not assigned to any existing user
 */
export let getUniqueColor = function() {
  let uniqueColorFound = false;
  let newColor = "";
  while (!uniqueColorFound) {
    newColor = randomColor({
      luminosity: "light",
      hue: "random"
    });

    let colorExists = false;
    for (let user of Object.values(shared.users)) {
      if (newColor == user.userColor) {
        console.log("newColor and existing color clash:", newColor);
        colorExists = true;
        break;
      }
    }

    uniqueColorFound = !colorExists;
  }

  return newColor;
};
