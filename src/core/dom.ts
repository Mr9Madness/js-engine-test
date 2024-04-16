import { StyleValue } from "vue"

export type DOMElementName = 'tui:text' | 'tui:root' | 'tui:box'
export type NodeName = DOMElementName | '#text' | '#comment'

export class BaseNode {
    constructor(parent: DOMElement | null = null) {
        this.parent = parent
    }
    parent: DOMElement | null
}

export class TextNode extends BaseNode {
    nodeName = '#text' as const
    nodeValue: string

    constructor(nodeValue: string, parentNode = null) {
        super(parentNode)
        this.nodeValue = nodeValue
    }
}

/**
 * Container element
 */
export class DOMElement extends BaseNode {
    constructor(nodeName: string, parentNode = null) {
        super(parentNode)
        this.nodeName = nodeName
    }
    nodeName = 'div'
    style: StyleValue
    childNodes: DOMNode[] = []

    insert(el: DOMNode, anchor?: DOMNode | null) {
        el.parent = this
    }
}

export type DOMNode<T = { nodeName: NodeName }> =
    T extends { nodeName: infer U }
    ? U extends '#text'
    ? TextNode
    : DOMElement
    : never