<template>
  <div>
    <app-stats
      :current-tick="currentTick"
      :cell-count="cellCount"
      :cells-alive="cellsAlive"
      :cells-created="cellsCreated"
      :current-speed="currentSpeed"
    />
    <div
      class="game-grid columns"
      @mousedown="isMouseDown = true"
      @mouseup="isMouseDown = false"
      @mouseleave="isMouseDown = false"
    >
      <div v-for="(col, indexX) in gridList" :key="indexX" class="game-column">
        <app-cell
          v-for="(isAlive, indexY) in col"
          :key="indexY"
          :status-obj="isAlive"
          :x-pos="indexX"
          :y-pos="indexY"
          :is-mouse-down="isMouseDown"
          @wasUpdated="updateCellState"
        />
      </div>
    </div>
  </div>
</template>

<script>
import Cell from "./Cell.vue";
import Stats from "./Stats.vue";
export default {
  components: {
    "app-cell": Cell,
    "app-stats": Stats
  },
  props: {
    message: {
      default: "",
      type: String
    },
    importToken: {
      default: "",
      type: String
    },
    currentSpeed: {
      default: 0,
      type: Number
    },
    serverAddr: {
      default: "",
      type: String
    }
  },
  data() {
    return {
      width: 46,
      height: 20,
      gridList: [],

      // Stats that get passed down to the app-stats component
      currentTick: 0,
      cellCount: 0,
      cellsAlive: 0,
      cellsCreated: 0,

      // A prop that gets used by the app-cell component (drag)
      isMouseDown: false,

      // socket variables
      isConnected: false
    };
  },
  computed: {},
  sockets: {
    connect() {
      this.isConnected = true;
    },

    disconnect() {
      this.isConnected = false;
    },

    // Fired when the server sends something
    // on the "gridUpdate" channel.
    gridUpdate(data) {
      this.updateFromRemote(data);
    }
  },
  watch: {
    /**
     * Watches for changes in the message prop
     * that gets passed down from the App component
     * and then handles the input on a specific tick.
     *
     * @param {string} val - the value
     */
    message: function(val) {
      // TODO: Remove nextStep as it's
      // confusing and will cause race conditions
      if (val === "nextStep") {
        this.update();
        this.currentTick++;
      } else if (val === "redoSession") {
        this.reset();
      } else if (val === "randomSeed") {
        this.randomSeed();
      } else if (val === "importSession") {
        this.importSession();
      } else if (val === "exportSession") {
        this.exportSession();
      }
    }
  },
  created() {
    this.fetchCells();
  },
  methods: {
    /**
     * Fetches current state of grid from server
     * and then creates a 2D-Array during runtime for
     * the website to use for most operations.
     */
    fetchCells: function() {
      const currentGridAPI = this.serverAddr + "/api/grid/current";
      fetch(currentGridAPI)
        .then(res => res.json())
        .then(data => {
          const dataErr = data.error;
          if (dataErr) {
            console.error(dataErr, "clickStart returned error in data");
          } else {
            this.gridList = data.grid.gridList;
            this.cellCount = data.grid.cellCount;
            this.cellsAlive = data.grid.cellsAlive;
            this.cellsCreated = data.grid.cellsCreated;
            this.currentSpeed = data.grid.currentSpeed;
            this.currentTick = data.grid.currentTick;
            this.$emit("isRunning", data.isRunning);
          }
        })
        .catch(error => console.error(error, "fetchCells failed"));
    },
    /**
     * Changes the 'isAlive' object property
     * of a specific cell to the one requested
     * in the param.
     *
     * @param {number} x - the x position
     * @param {number} y - the y position
     * @param {boolean} isAlive - the new isAlive status
     * @param {boolean} updateRemote - if true, call API to update remote state
     */
    setCell: function(x, y, isAlive, updateRemote) {
      if (this.gridList[x][y].isAlive != isAlive) {
        this.gridList[x][y].isAlive = isAlive;

        const cellState = { x, y, isAlive, updateRemote };
        this.updateCellState(cellState);
      }
    },
    /**
     * The main function that updates the grid
     * every tick based on the game of life rules.
     */
    update: function() {
      let tempArr = [];
      for (let i = 0; i < this.width; i++) {
        tempArr[i] = [];
        for (let j = 0; j < this.height; j++) {
          let status = this.gridList[i][j].isAlive;
          let neighbours = this.getNeighbours(i, j);
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
      // set new gridList content
      for (let i = 0; i < this.width; i++) {
        for (let j = 0; j < this.height; j++) {
          this.setCell(i, j, tempArr[i][j], true);
        }
      }
    },
    updateFromRemote: function(data) {
      if (!data || !data.grid || !data.grid.gridList) {
        console.error("updateFromRemote received invalid data:", data);
      }

      this.cellCount = data.grid.cellCount;
      this.cellsAlive = data.grid.cellsAlive;
      this.cellsCreated = data.grid.cellsCreated;
      this.currentSpeed = data.grid.currentSpeed;
      this.currentTick = data.grid.currentTick;

      // set new gridList content
      for (let i = 0; i < this.width; i++) {
        for (let j = 0; j < this.height; j++) {
          this.setCell(i, j, data.grid.gridList[i][j].isAlive, false);
        }
      }
    },
    /**
     * Returns the amount of neighbours for
     * a specific cell on the grid.
     *
     * @param {number} posX - the x position
     * @param {number} posY - the Y position
     * @return {number} neighbours - amount of neighbours
     */
    getNeighbours: function(posX, posY) {
      let neighbours = 0;
      if (posX <= this.width && posY <= this.height) {
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
              newX < this.width &&
              newY >= 0 &&
              newY < this.height &&
              this.gridList[posX + offsetX][posY + offsetY].isAlive == true
            ) {
              neighbours++;
            }
          }
        }
      }
      return neighbours;
    },
    /**
     * Resets all gridList cells back to the
     * start value.
     */
    reset: function() {
      const socketID = this.$socket.id;
      const resetAPI = this.serverAddr + "/api/grid/reset";
      fetch(resetAPI, {
        method: "POST",
        headers: new Headers({ "content-type": "application/json" }),
        body: JSON.stringify({
          socketID: socketID
        })
      })
        .then(res => res.json())
        .then(data => {
          const dataErr = data.error;
          if (dataErr) {
            console.error(dataErr, "resetAPI returned error in data");
          }
        })
        .catch(error => console.error(error, "resetAPI failed"));
    },
    /**
     * Populates and overwrites gridList with cells.
     */
    randomSeed: function() {
      for (let i = 0; i < this.width; i++) {
        for (let j = 0; j < this.height; j++) {
          let rand = Math.random();
          if (rand < 0.2) {
            this.setCell(i, j, true, true);
          } else {
            this.setCell(i, j, false, true);
          }
        }
      }
    },
    /**
     * Resets and then imports new cells into the gridList
     * based on the importToken prop that gets passed down
     * App.vue.
     * The importToken is a string and its syntax looks
     * like this:
     * '[xPos,yPos],[xPos,yPos]...'.
     */
    importSession: function() {
      this.reset();
      let regex = /\[\d+,\d+\]/gm;
      let tempArr = this.importToken.match(regex);
      if (tempArr) {
        tempArr.forEach(element => {
          element = element.substring(1, element.length - 1);
          let xy = element.split(",");
          this.setCell(xy[0], xy[1], true);
        });
      }
    },
    /**
     * Uses gridList to create an exportToken and
     * emits it up to App.vue for the user to copy.
     * Same format as in importToken().
     */
    exportSession: function() {
      let exportToken = "";
      for (let i = 0; i < this.width; i++) {
        for (let j = 0; j < this.height; j++) {
          if (this.gridList[i][j].isAlive) {
            exportToken += "[" + i + "," + j + "]";
          }
        }
      }
      this.$emit("exportToken", exportToken);
    },
    /**
     * Updates the current cellcount on client and server
     *
     * @param {object} cellState - cell x, y positions and alive state
     */
    updateCellState: function(cellState) {
      if (cellState.isAlive) {
        this.cellsAlive++;
        this.cellsCreated++;
      } else {
        if (this.cellsAlive > 0) {
          this.cellsAlive--;
        }
      }

      if (!cellState.updateRemote) {
        return;
      }

      const socketID = this.$socket.id;
      const clickAPI = this.serverAddr + "/api/grid/click";
      fetch(clickAPI, {
        method: "POST",
        headers: new Headers({ "content-type": "application/json" }),
        body: JSON.stringify({
          socketID: socketID,
          x: cellState.x,
          y: cellState.y,
          isAlive: cellState.isAlive
        })
      })
        .then(res => res.json())
        .then(data => {
          const dataErr = data.error;
          if (dataErr) {
            console.error(dataErr, "clickAPI returned error in data");
          }
        })
        .catch(error => console.error(error, "clickAPI failed"));
    }
  }
};
</script>

<style lang="scss">
.game-grid {
  border-top: 1px solid #1a0707;
  border-left: 1px solid #1a0707;
  display: flex;
  flex: 1;
  justify-content: center;
}
.game-column {
  flex: 1;
  display: flex;
  justify-content: center;
  padding: 0;
  margin: 0 auto;
  flex-direction: column;
}
</style>
