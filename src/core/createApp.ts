import { createRenderer, markRaw } from '@vue/runtime-core'
import { root } from './rootComponent'
import { BaseNode, DOMElement, TextNode, DOMNode } from "./dom";
import { App } from 'vue';
import { lib } from '../native';

const { render, createApp: baseCreateApp } = createRenderer<BaseNode, DOMElement>({
    patchProp(el, key, prevValue, nextValue, namespace, prevChildren, parentComponent, parentSuspense, unmountChildren) {
        console.log('patchProp', key)
        console.log(lib.symbols.add(1, 0));
        if (key === 'style') {
            nextValue = nextValue || {}
            // ensure any previously existing value is erased with undefined
            for (const styleProperty in prevValue) {
                if (!(styleProperty in nextValue)) {
                    nextValue[styleProperty] = undefined
                }
            }
            el.style = nextValue
            // if (el.yogaNode) {
            //     applyStyles(el.yogaNode, nextValue)
            // }
        }
        // else if (key === 'internal_transform') {
        //     el.internal_transform = nextValue
        // }
    },
    insert(el: DOMNode, parent: DOMElement, anchor: DOMNode) {
        console.log('insert', el.nodeName, parent.nodeName)
        console.log(lib.symbols.add(1, 1));

        parent.insert(el, anchor)
    },
    remove(el: DOMNode) {
        console.log('remove', el.nodeName)
    },
    createElement(type, namespace, isCustomizedBuiltIn, vnodeProps) {
        console.log('createElement', type)
        return new DOMElement(type)
    },
    createText(text) {
        console.log('createText', text)
        return new TextNode(text)
    },
    createComment(text) {
        console.log('createComment', text)
        return new TextNode(text)
    },
    setText(node: DOMNode, text) {
        console.log('setText', node.nodeName, text)
        if (node.nodeName === '#text' && node instanceof TextNode) {
            node.nodeValue = text
        }
    },
    setElementText(node, text) {
        console.log('setElementText', text)
        const textNode = node.childNodes.find((node) => node.nodeName === '#text') as TextNode
        if (textNode) {
            textNode.nodeValue = text
        }
        // else {
        //     node.insertNode(new BaseNode(null, text))
        // }
    },
    parentNode(node) {
        console.log('parentNode')
        return node.parent
    },
    nextSibling(node: DOMNode) {
        console.log('nextSibling')
        if (!node.parent) return null
        const index = node.parent.childNodes.indexOf(node)
        return node.parent.childNodes[index + 1] || null
    },
})

interface NewApp extends Omit<App<DOMElement>, 'mount'> {
    mount: (options?: Partial<{ renderOnce: boolean, exitOnCtrlC: boolean }>) => NewApp
}

export function createApp(rootElement) {
    const app = baseCreateApp(root, {
        root: markRaw(rootElement),
    })

    const { mount, unmount } = app
    const newApp = app as unknown as NewApp
    newApp.mount = ({ renderOnce = false, exitOnCtrlC = true } = {}) => {
        const rootEl = new DOMElement('tui:root')
        mount(rootEl)
        return newApp
    }

    return newApp
}
