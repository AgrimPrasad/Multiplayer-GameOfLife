<template>
  <div>
    <app-stats
      :current-tick="currentTick"
      :cell-count="cellCount"
      :cells-alive="cellsAlive"
      :cells-created="cellsCreated"
      :current-speed="currentSpeed"
      :user-color="userColor"
      :username="username"
      :users="users"
    />
    <div
      class="game-grid columns"
      @pointerdown="isPointerDown = true"
      @pointerup="isPointerDown = false"
      @pointerleave="isPointerDown = false"
    >
      <div v-for="(col, indexX) in gridList" :key="indexX" class="game-column">
        <app-cell
          v-for="(status, indexY) in col"
          :key="indexY"
          :status-obj="status"
          :x-pos="indexX"
          :y-pos="indexY"
          :user-color="userColor"
          :is-pointer-down="isPointerDown"
          @wasUpdated="setCell"
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
    },
    users: {
      default: function() {
        return [];
      },
      type: Array
    }
  },
  data() {
    return {
      width: 0,
      height: 0,
      gridList: [],

      // Stats that get passed down to the app-stats component
      currentTick: 0,
      cellCount: 0,
      cellsAlive: 0,
      cellsCreated: 0,

      // A prop that gets used by the app-cell component (drag)
      isPointerDown: false,

      // socket variables
      isConnected: false,

      // user variables
      userColor: "#ffffff",
      username: ""
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
      this.update(data);
    },

    // Fired when the server sends something
    // on the "welcome" channel.
    welcome(data) {
      if (this.username != "") {
        // user was connected before
        // handle re-connection by reloading page,
        // otherwise cells don't update properly
        // after reconnection for some reason
        this.username = "";
        window.location.reload();
      }

      this.userColor = data.userColor;
      this.username = data.username;
    },

    // Fired when the server sends something
    // on the "userClickedGrid" channel.
    userClickedGrid(data) {
      const message = data.message;

      if (this.username === message.user.username) {
        return;
      }

      this.setCell(
        message.x,
        message.y,
        message.user.userColor,
        message.isAlive,
        false
      );
    },

    // Fired when the server sends something
    // on the "userClickedMultiple" channel.
    userClickedMultiple(data) {
      const message = data.message;

      if (this.username === message.user.username) {
        return;
      }

      this.setCells(message.cells, message.user.userColor, false);
    },

    // Fired when the server sends something
    // on the "userResetGrid" channel.
    userResetGrid(data) {
      const message = data.message;

      if (this.username === message.user.username) {
        return;
      }

      // reset new gridList content locally
      for (let i = 0; i < this.width; i++) {
        for (let j = 0; j < this.height; j++) {
          this.setCell(i, j, "#ffffff", false, false);
        }
      }
    },

    // Fired when the server sends something
    // on the "userChangedInterval" channel.
    userChangedInterval(data) {
      const message = data.message;

      if (this.username === message.user.username) {
        return;
      }

      const newSpeed = Math.round(100000 / message.interval);
      const deltaSpeed = newSpeed - this.currentSpeed;

      // change current speed locally
      this.$emit("changeSpeed", deltaSpeed);
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
      if (val === "redoSession") {
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
      const currentGridEndpoint = this.serverAddr + "/api/grid/current";

      fetch(currentGridEndpoint)
        .then(res => res.json())
        .then(data => {
          const dataErr = data.error;
          if (dataErr) {
            /* eslint-disable-next-line no-console */
            console.error(dataErr, "fetchCells returned error in data");
          } else {
            this.gridList = data.grid.gridList;
            this.cellCount = data.grid.cellCount;
            this.cellsAlive = data.grid.cellsAlive;
            this.cellsCreated = data.grid.cellsCreated;
            this.currentTick = data.grid.currentTick;
            this.width = data.grid.width;
            this.height = data.grid.height;

            const deltaSpeed = data.grid.currentSpeed - this.currentSpeed;
            this.$emit("changeSpeed", deltaSpeed);

            this.$emit("isRunning", data.isRunning);
          }
        })
        /* eslint-disable-next-line no-console */
        .catch(error => console.error(error, "fetchCells failed"));
    },
    /**
     * Changes the 'isAlive' object property
     * of a set of cells to the one requested
     * in the param.
     *
     * @param {array} cells - array of {x, y, isAlive} cell objects
     * @param {string} color - the new cell color
     * @param {boolean} updateRemote - if true, call API to update remote update of multiple cells
     */
    setCells(cells, color, updateRemote) {
      cells.forEach(cell => {
        // set each cell locally without calling remote
        this.setCell(cell.x, cell.y, color, cell.isAlive, false);
      });

      if (!updateRemote) {
        return;
      }

      // now bulk update cells on remote
      const socketID = this.$socket.id;
      const clicksEndpoint = this.serverAddr + "/api/grid/clicks";
      this.$helpers.sendPOST(clicksEndpoint, {
        socketID,
        cells
      });
    },
    /**
     * Changes the 'isAlive' object property
     * of a specific cell to the one requested
     * in the param.
     *
     * @param {number} x - the x position
     * @param {number} y - the y position
     * @param {string} color - the new cell color
     * @param {boolean} isAlive - the new isAlive status
     * @param {boolean} updateRemote - if true, call API to update remote state
     */
    setCell: function(x, y, color, isAlive, updateRemote) {
      if (color == "") {
        color = this.userColor;
      }

      if (this.gridList[x][y].isAlive != isAlive) {
        this.gridList[x][y].isAlive = isAlive;
        this.gridList[x][y].color = color;

        this.updateCellCount(isAlive);

        if (!updateRemote) {
          return;
        }

        const socketID = this.$socket.id;
        const clickEndpoint = this.serverAddr + "/api/grid/click";
        this.$helpers.sendPOST(clickEndpoint, {
          socketID,
          x,
          y,
          isAlive
        });
      }
    },
    /**
     * Updates the state of the grid and related stats
     *
     * @param {object} data - latest state data from the server
     */
    update: function(data) {
      if (!data || !data.grid || !data.grid.gridList) {
        /* eslint-disable-next-line no-console */
        console.error("update received invalid data:", data);
      }

      if (this.gridList.length == 0) {
        // grid not initialised yet, wait for grid creation
        return;
      }

      this.cellCount = data.grid.cellCount;
      this.cellsAlive = data.grid.cellsAlive;
      this.cellsCreated = data.grid.cellsCreated;
      this.currentTick = data.grid.currentTick;

      const deltaSpeed = data.grid.currentSpeed - this.currentSpeed;
      this.$emit("changeSpeed", deltaSpeed);

      // set new gridList content locally
      for (let i = 0; i < this.width; i++) {
        for (let j = 0; j < this.height; j++) {
          this.setCell(
            i,
            j,
            data.grid.gridList[i][j].color,
            data.grid.gridList[i][j].isAlive,
            false
          );
        }
      }
    },
    /**
     * Resets all gridList cells back to the
     * start value.
     */
    reset: function() {
      // reset new gridList content locally
      for (let i = 0; i < this.width; i++) {
        for (let j = 0; j < this.height; j++) {
          this.setCell(i, j, "#ffffff", false, false);
        }
      }

      // then call reset endpoint to clear the grid on other clients
      const socketID = this.$socket.id;
      const resetEndpoint = this.serverAddr + "/api/grid/reset";
      this.$helpers.sendPOST(resetEndpoint, {
        socketID: socketID
      });
    },
    /**
     * Populates and overwrites gridList with cells
     */
    randomSeed: function() {
      let cells = [];
      for (let i = 0; i < this.width; i++) {
        for (let j = 0; j < this.height; j++) {
          let rand = Math.random();
          let isAlive = false;
          if (rand < 0.2) {
            isAlive = true;
          } else {
            isAlive = false;
          }
          cells.push({
            x: i,
            y: j,
            isAlive: isAlive
          });
        }
      }

      this.setCells(cells, this.userColor, true);
    },
    /**
     * Imports new cells into the gridList
     * without resetting the existing grid
     * based on the importToken prop
     * that gets passed down from App.vue.
     * Existing grid is NOT reset.
     * The importToken is a string and its syntax looks
     * like this:
     * '[xPos,yPos],[xPos,yPos]...'.
     */
    importSession: function() {
      let regex = /\[\d+,\d+\]/gm;
      let tempArr = this.importToken.match(regex);
      if (tempArr) {
        let cells = [];
        tempArr.forEach(element => {
          element = element.substring(1, element.length - 1);
          let xy = element.split(",");
          cells.push({ x: xy[0], y: xy[1], isAlive: true });
        });
        this.setCells(cells, this.userColor, true);
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
     * Updates the current cellcount on client
     *
     * @param {bool} isAlive - cell alive state
     */
    updateCellCount: function(isAlive) {
      if (isAlive) {
        this.cellsAlive++;
        this.cellsCreated++;
      } else {
        if (this.cellsAlive > 0) {
          this.cellsAlive--;
        }
      }
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
