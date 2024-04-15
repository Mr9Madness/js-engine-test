import { consola, createConsola } from "consola/basic";
import { createApp } from "./src/core/createApp";
import App from "./src/app/App";

consola.wrapConsole()

const a = createApp(App).mount()
