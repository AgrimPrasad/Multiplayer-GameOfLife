<template>
  <span :style="userColorStyle" :title="username" class="icon">
    <i class="far fa-user" /> </span
></template>
<script>
export default {
  props: {
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
    /*
     * returns a style for the current user
     */
    userColorStyle: function() {
      return "background-color: " + this.userColor + " !important";
    }
  }
};
</script>
