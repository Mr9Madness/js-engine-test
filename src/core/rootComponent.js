
import { defineComponent, h } from '@vue/runtime-core'
import { onMounted, onUpdated } from 'vue'
import { consola } from "consola";

export const root = defineComponent((props) => {
    let needsUpdate = false
    let interval

    function renderRoot() {
        console.log('render')
    }

    function scheduleUpdate() {
        needsUpdate = true
    }

    onMounted(() => {
        interval = setInterval(() => {
            if (needsUpdate) {
                consola.log('needs update')
                renderRoot()
                needsUpdate = false
            }
        }, 32)

        renderRoot()
    })

    onUpdated(() => {
        scheduleUpdate()
    })

    return () => h('div', [
        h(props.root)
    ])
}, {
    name: 'root',
    props: ['root'],
})
