<template>
  <div
    :class="status.isAlive ? 'alive' : 'dead'"
    :style="userColorStyle"
    class="cell"
    @click="reborn(true)"
    @mouseover="reborn(isMouseDown)"
  />
</template>
<script>
export default {
  props: {
    statusObj: {
      default: function() {
        return {
          isAlive: false,
          color: "#ffffff"
        };
      },
      type: Object
    },
    xPos: {
      default: -1,
      type: Number
    },
    yPos: {
      default: -1,
      type: Number
    },
    userColor: {
      default: "#ffffff",
      type: String
    },
    isMouseDown: {
      default: false,
      type: Boolean
    }
  },
  data() {
    return {
      // The status for a single cell.
      status: this.statusObj
    };
  },
  computed: {
    userColorStyle: function() {
      if (this.status.isAlive) {
        return "background-color: " + this.status.color + "!important";
      }

      return "";
    }
  },
  methods: {
    /**
     * Checks if the cell has been clicked
     * and switches its isAlive status.
     * Also emits to the grid component for the
     * drag and drop functionality.
     *
     * @param {boolean} bool - the isMouseDown boolean
     */
    reborn: function(bool) {
      if (bool) {
        this.status.isAlive = !this.status.isAlive;

        const cellState = {
          x: this.xPos,
          y: this.yPos,
          isAlive: this.status.isAlive,
          updateRemote: true
        };
        this.$emit("wasUpdated", cellState);
      }
    }
  }
};
</script>

<style>
.cell {
  flex: 1;
  border-right: 1px solid #1a0707;
  border-bottom: 1px solid #1a0707;
  padding-bottom: 100%;
}

.cell:hover {
  background-color: rgba(132, 26, 26, 0.6);
}
</style>
