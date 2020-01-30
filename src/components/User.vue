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
     * returns a style for the user associated with this component
     */
    userColorStyle: function() {
      return "background-color: " + this.userColor + " !important";
    }
  }
};
</script>
