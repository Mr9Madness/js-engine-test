import consola, { createConsola } from "consola/basic";
import { createApp } from "./core/createApp";
import App from "./app/App.vue";

console.log(lib.symbols.add(1, 2));

consola.wrapConsole()

const a = createApp(App)

a.mount()
