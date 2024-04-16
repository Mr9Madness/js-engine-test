
import { defineComponent, h } from '@vue/runtime-core'
import { onMounted, onUpdated } from 'vue'

export const root = defineComponent({
    props: ['root'],
    name: 'root',
    setup(props) {
        let needsUpdate = false
        let interval

        function renderRoot() {
            console.log('render')
        }

        onMounted(() => {
            interval = setInterval(() => {
                console.log('loop')
                if (needsUpdate) {
                    console.log('needs update') 
                    renderRoot()
                    needsUpdate = false
                }
            }, 32)

            renderRoot()
        })

        function scheduleUpdate() {
            needsUpdate = true
        }
        onUpdated(scheduleUpdate)

        return () => h('div', [
            h(props.root)
        ])
    }
})
