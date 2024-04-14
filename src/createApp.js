import { createRenderer, markRaw } from '@vue/runtime-core'
import { root } from './rootComponent'

class CustomNode {
    constructor(parent = null) {
        this.parent = parent
    }
    parent
    text
}

class CustomElement {
    constructor(opt) {
        this.type = opt.type
        this.namespace = opt.namespace
        this.isCustomizedBuiltIn = opt.isCustomizedBuiltIn
        this.vnodeProps = opt.vnodeProps
    }
    type = 'div'
    namespace
    isCustomizedBuiltIn
    vnodeProps
    children = []
}

const { render, createApp: baseCreateApp } = createRenderer({
    createElement(type, namespace, isCustomizedBuiltIn, vnodeProps) {
        console.log('createElement')
        return new CustomElement({ type, namespace, isCustomizedBuiltIn, vnodeProps })
    },
    patchProp(el, key, prevValue, nextValue, namespace, prevChildren, parentComponent, parentSuspense, unmountChildren) {
        console.log('patchProp')
    },
    insert(el, parent, anchor) {
        console.log('insert')
    },
    remove(el) {
        console.log('remove')
    },
    createText(text) {
        console.log('createText')
        return new CustomNode()
    },
    createComment(text) {
        console.log('createComment')
        return new CustomNode()
    },
    setText(node, text) {
        console.log('setText')
    },
    setElementText(node, text) {
        console.log('setElementText')
    },
    parentNode(node) {
        console.log('parentNode')
        return node.parent
    },
    nextSibling(node) {
        console.log('nextSibling')
        if (!node.parent) return null
        const index = node.parent.children.indexOf(node)
        return node.parent.children[index + 1] || null
    },
})

export function createApp(rootElement) {
    const app = baseCreateApp(root, {
        root: markRaw(rootElement),
    })

    const { mount, unmount } = app
    app.mount = ({ renderOnce = false, exitOnCtrlC = true } = {}) => {
        const rootEl = new CustomElement({ type: 'tui:root' })
        mount(rootEl)
        return app
    }

    return app
}
