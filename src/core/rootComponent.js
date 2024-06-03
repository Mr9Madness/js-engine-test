
import { defineComponent, h } from '@vue/runtime-core'
import { onMounted, onUpdated } from 'vue'

export const root = defineComponent((props) => {
    let needsUpdate = false
    let interval

    onMounted(() => {
        renderApp()
    })

    onUpdated(() => {
        renderApp()
    })

    return () => h('div', [
        h(props.root)
    ])
}, {
    name: 'root',
    props: ['root'],
})
