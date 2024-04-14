import { consola, createConsola } from "consola/basic";
import { createApp } from "./src/createApp";
import App from "./src/App.vue";

consola.wrapConsole()

const a = createApp(App).mount()
