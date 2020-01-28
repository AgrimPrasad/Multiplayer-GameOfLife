<template>
  <div class="box">
    <div class="columns is-fullwidth">
      <div class="column is-size-7-mobile is-size-6-desktop is-half-mobile">
        <strong>TICKS: {{ currentTick }}</strong>
      </div>
      <div class="column is-size-7-mobile is-size-6-desktop is-half-mobile">
        <strong>CELL COUNT: {{ cellCount }}</strong>
      </div>
      <div class="column is-size-7-mobile is-size-6-desktop is-half-mobile">
        <strong>CELLS ALIVE: {{ cellsAlive }}</strong>
      </div>
      <div class="column is-size-7-mobile is-size-6-desktop is-half-mobile">
        <strong>CELLS CREATED: {{ cellsCreated }}</strong>
      </div>
      <div class="column is-size-7-mobile is-size-6-desktop is-half-mobile">
        <strong>SPEED: {{ currentSpeed }}%</strong>
      </div>
      <div class="column is-size-7-mobile is-size-6-desktop is-half-mobile">
        <strong>INTERVAL: {{ currentInterval }}ms</strong>
      </div>
      <div class="column is-size-7-mobile is-size-6-desktop is-half-mobile">
        <strong
          >User:
          <span>{{ username }}&nbsp;</span>
        </strong>
        <span :style="userColorStyle" class="icon">
          <i class="far fa-user" />
        </span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    currentTick: {
      default: 0,
      type: Number
    },
    cellCount: {
      default: 0,
      type: Number
    },
    cellsAlive: {
      default: 0,
      type: Number
    },
    cellsCreated: {
      default: 0,
      type: Number
    },
    currentSpeed: {
      default: 0,
      type: Number
    },
    userColor: {
      default: "",
      type: String
    },
    username: {
      default: "",
      type: String
    }
  },
  data() {
    return {};
  },
  computed: {
    userColorStyle: function() {
      return "background-color: " + this.userColor + "!important";
    },
    currentInterval: function() {
      return Math.round(100000 / this.currentSpeed);
    }
  }
};
</script>

<style scoped>
.box {
  background-color: #e7eef5;
}
.columns {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  text-align: center;
}
.column {
  margin: 0;
}
</style>
