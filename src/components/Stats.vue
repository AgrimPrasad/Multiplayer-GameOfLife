<template>
  <div class="box">
    <div class="columns is-halfwidth">
      <div class="column is-size-7">
        <strong>TICKS: {{ currentTick }}</strong>
      </div>
      <div class="column is-size-7">
        <strong>CELL COUNT: {{ cellCount }}</strong>
      </div>
      <div class="column is-size-7">
        <strong>CELLS ALIVE: {{ cellsAlive }}</strong>
      </div>
      <div class="column is-size-7">
        <strong>CELLS CREATED: {{ cellsCreated }}</strong>
      </div>
      <div class="column is-size-7">
        <strong>SPEED: {{ currentSpeed }}%</strong>
      </div>
      <div class="column is-size-7">
        <strong>INTERVAL: {{ currentInterval }}ms</strong>
      </div>
      <div class="column is-size-7">
        <strong
          >User:
          <span>{{ username }}&nbsp;</span>
        </strong>
        <span :style="userColorStyle" class="icon">
          <i class="far fa-user" />
        </span>
      </div>
      <div class="column is-size-7" v-if="users.length > 1">
        <strong>Other Users: </strong>
        <div>
          <span v-for="user in users" :key="user.username">
            <app-user
              v-if="user.username != username"
              :username="user.username"
              :userColor="user.userColor"
            />
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import User from "./User";
export default {
  components: {
    "app-user": User
  },
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
    },
    users: {
      default: function() {
        return [];
      },
      type: Array
    }
  },
  data() {
    return {};
  },
  computed: {
    /*
     * returns the current interval computed from the current speed
     */
    currentInterval: function() {
      return Math.round(100000 / this.currentSpeed);
    },
    /*
     * returns a style for the current user
     */
    userColorStyle: function() {
      return "background-color: " + this.userColor + " !important";
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
