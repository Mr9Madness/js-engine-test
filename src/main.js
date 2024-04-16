import { consola } from "consola/basic";
import { createApp } from "./core/createApp";
import App from "./app/App.vue";

consola.wrapConsole()

const a = createApp(App).mount()
