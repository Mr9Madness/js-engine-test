import { defineComponent, h } from "@vue/runtime-core";
import { createApp } from "./src/createApp";
import { consola, createConsola } from "consola/basic";

consola.wrapConsole()

const App = defineComponent(() => {
    return () => h('div')
})

const a = createApp(App).mount()
