import Vue from "vue";
import App from "./App.vue";
import { library } from "@fortawesome/fontawesome-svg-core";
import { fab } from "@fortawesome/free-brands-svg-icons";
import { far } from "@fortawesome/free-regular-svg-icons";
import { fas } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { dom } from "@fortawesome/fontawesome-svg-core";
import VueSocketIO from "vue-socket.io";

import * as helpers from "./helpers";

library.add(fab);
library.add(far);
library.add(fas);
Vue.component("font-awesome-icon", FontAwesomeIcon);

dom.watch();

Vue.config.productionTip = false;

var debug = false;
if (process.env.NODE_ENV != "production") {
  debug = true;
}

let serverAddr = process.env.VUE_APP_SERVER_ADDRESS || "http://localhost:3000";

Vue.use(
  new VueSocketIO({
    debug: debug,
    connection: serverAddr
  })
);

const plugin = {
  install() {
    Vue.helpers = helpers;
    Vue.prototype.$helpers = helpers;
  }
};

Vue.use(plugin);

new Vue({
  render: h => h(App)
}).$mount("#app");
