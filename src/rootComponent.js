
import { defineComponent, h } from '@vue/runtime-core'

export const root = defineComponent({
    setup() {
        return () => h('div')
    }
})
