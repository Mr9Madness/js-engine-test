import { createRenderer, markRaw } from '@vue/runtime-core'
import { root } from './rootComponent'

class CustomNode {
    constructor(parent = null, text = null) {
        this.parent = parent
        this.text = text
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
        console.log('createElement', type)
        return new CustomElement({ type, namespace, isCustomizedBuiltIn, vnodeProps })
    },
    patchProp(el, key, prevValue, nextValue, namespace, prevChildren, parentComponent, parentSuspense, unmountChildren) {
        console.log('patchProp', key)
        // if (key === 'style') {
        //     nextValue = nextValue || {}
        //     // ensure any previously existing value is erased with undefined
        //     for (const styleProperty in prevValue) {
        //         if (!(styleProperty in nextValue)) {
        //             nextValue[styleProperty] = undefined
        //         }
        //     }
        //     el.style = nextValue
        //     if (el.yogaNode) {
        //         applyStyles(el.yogaNode, nextValue)
        //     }
        // } else if (key === 'internal_transform') {
        //     el.internal_transform = nextValue
        // }
    },
    insert(el, parent, anchor) {
        console.log('insert', el.type)
    },
    remove(el) {
        console.log('remove', node.nodeName)
    },
    createText(text) {
        console.log('createText', text)
        return new CustomNode(null, text)
    },
    createComment(text) {
        console.log('createComment', text)
        return new CustomNode(null, text)
    },
    setText(node, text) {
        console.log('setText', node.nodeName, text)
        if (node.nodeName === '#text' || node.nodeName === '#comment') {
            node.nodeValue = text
        }
    },
    setElementText(node, text) {
        console.log('setElementText', node.children, text)
        const textNode = node.childNodes.find((node) => node.nodeName === '#text')
        if (textNode) {
            textNode.nodeValue = text
        } else {
            node.insertNode(new CustomNode(null, text))
        }
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
