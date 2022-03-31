import "reflect-metadata";
import "element-ui/lib/theme-chalk/index.css";
// import "../../static/Easemob-chat-3.6.3.js";

import ElementUI from "element-ui";
import Vue from "vue";

import App from "./App.vue";
import store from "./store";

if (process.env.NODE_ENV === "development") {
    import("@vue/devtools").then((devtools) => devtools.connect(/* host, port */));
}

Vue.use(ElementUI);

new Vue({
    el: "#app",
    store,
    render: (h: any) => h(App),
});
