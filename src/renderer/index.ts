import "reflect-metadata";

import Vue from "vue";

import ElementUI from "element-ui";
import "element-ui/lib/theme-chalk/index.css";

import App from "./App.vue";
import store from "./store";

Vue.use(ElementUI);

new Vue({
    el: "#app",
    store,
    render: (h: any) => h(App),
});
