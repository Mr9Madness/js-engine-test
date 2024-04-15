import { defineComponent, h } from '@vue/runtime-core';

export default defineComponent({
    setup() {
        return () => h('div', ['Test'])
    }
})
