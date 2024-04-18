import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store"; // Make sure the store is imported

import "./assets/css/main.css";

const app = createApp(App);
app.use(router);
app.use(store); // Apply the Vuex store
app.mount("#app");
