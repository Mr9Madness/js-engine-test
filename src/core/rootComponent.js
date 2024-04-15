
import { defineComponent, h } from '@vue/runtime-core'

export const root = defineComponent({
    props: ['root'],
    name: 'root',
    setup(props) {
        return () => h('div', [
            h(props.root)
        ])
    }
})
