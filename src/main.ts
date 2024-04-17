import { consola } from "consola/basic";
import { createApp } from "./core/createApp";
import App from "./app/App.vue";

const b = require("./index");

consola.wrapConsole()

b.start()

const a = createApp(App)

a.mount()
