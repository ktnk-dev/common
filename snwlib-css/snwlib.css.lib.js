/**
 * @typedef {Partial<CSSStyleDeclaration> & Record<string, string | number | null | undefined>} CSSObject
 */

/**
 * @typedef {Object} CSSRuleNode
 * @property {'rule'} kind
 * @property {string} path
 * @property {CSSObject} styles
 * @property {Array.<CSSNode>} children
 * @property {CSSNode | null} parent
 */

/**
 * @typedef {Object} CSSMediaNode
 * @property {'media'} kind
 * @property {string} query
 * @property {Array.<CSSNode>} children
 * @property {CSSNode | null} parent
 */

/**
 * @typedef {Object} CSSKeyframesNode
 * @property {'keyframes'} kind
 * @property {string} name
 * @property {Record<string, CSSObject>} frames
 * @property {CSSNode | null} parent
 */

/**
 * @typedef {CSSRuleNode | CSSMediaNode | CSSKeyframesNode} CSSNode
 */

(function(global) {
    const REGISTRY_KEY = '__snwlibCssRegistry'

    /**
     * Shared registry survives repeated imports of the same file.
     * @type {{
     *   inserted: Set<string>,
     *   pending: Set<CSSNode>,
     *   flushQueued: boolean,
     *   styleElement: HTMLStyleElement | null
     * }}
     */
    const registry = global[REGISTRY_KEY] || (global[REGISTRY_KEY] = {
        inserted: new Set(),
        pending: new Set(),
        flushQueued: false,
        styleElement: null
    })

    /**
     * Create global CSS rule.
     * Nested calls are joined into one selector tree.
     *
     * @param {string} path
     * @param {CSSObject=} styles
     * @param {...CSSNode} children
     * @returns {CSSRuleNode}
     */
    function css(path, styles = {}, ...children) {
        const node = {
            kind: 'rule',
            path,
            styles: styles || {},
            children: normalizeChildren(children),
            parent: null
        }

        attachChildren(node)
        scheduleNode(node)

        return node
    }

    /**
     * Create media block.
     *
     * @param {string} query
     * @param {...CSSNode} children
     * @returns {CSSMediaNode}
     */
    function cssMedia(query, ...children) {
        const node = {
            kind: 'media',
            query,
            children: normalizeChildren(children),
            parent: null
        }

        attachChildren(node)
        scheduleNode(node)

        return node
    }

    /**
     * Create keyframes block.
     *
     * @param {string} name
     * @param {Record<string, CSSObject>} frames
     * @returns {CSSKeyframesNode}
     */
    function cssKeyframes(name, frames) {
        const node = {
            kind: 'keyframes',
            name,
            frames: frames || {},
            parent: null
        }

        scheduleNode(node)

        return node
    }

    /**
     * @param {Array.<CSSNode | Array.<CSSNode> | null | undefined | false>} children
     * @returns {Array.<CSSNode>}
     */
    function normalizeChildren(children) {
        return children
            .flat()
            .filter(Boolean)
    }

    /**
     * @param {CSSRuleNode | CSSMediaNode} parent
     * @returns {void}
     */
    function attachChildren(parent) {
        parent.children.forEach(child => {
            child.parent = parent
            registry.pending.delete(child)
        })
    }

    /**
     * @param {CSSNode} node
     * @returns {void}
     */
    function scheduleNode(node) {
        registry.pending.add(node)

        if (registry.flushQueued) return

        registry.flushQueued = true
        scheduleMicrotask(flushPending)
    }

    /**
     * Flush only root nodes. Nested nodes are rendered by their parent.
     * @returns {void}
     */
    function flushPending() {
        registry.flushQueued = false

        const nodes = [...registry.pending].filter(node => !node.parent)
        registry.pending.clear()

        if (!nodes.length) return

        const cssText = nodes
            .map(node => renderNode(node, '', []))
            .filter(Boolean)
            .join('\n')

        if (!cssText) return

        ensureStyleElement().appendChild(document.createTextNode(cssText + '\n'))
    }

    /**
     * @param {CSSNode} node
     * @param {string} parentSelector
     * @param {Array.<string>} mediaStack
     * @returns {string}
     */
    function renderNode(node, parentSelector, mediaStack) {
        if (node.kind === 'rule') {
            return renderRule(node, parentSelector, mediaStack)
        }

        if (node.kind === 'media') {
            return renderMedia(node, parentSelector, mediaStack)
        }

        return renderKeyframes(node)
    }

    /**
     * @param {CSSRuleNode} node
     * @param {string} parentSelector
     * @param {Array.<string>} mediaStack
     * @returns {string}
     */
    function renderRule(node, parentSelector, mediaStack) {
        const selector = combineSelectors(parentSelector, node.path)
        const chunks = []
        const declarations = serializeDeclarations(node.styles)
        const dedupeKey = buildRuleKey(selector, mediaStack)

        if (declarations && !registry.inserted.has(dedupeKey)) {
            registry.inserted.add(dedupeKey)
            chunks.push(wrapMedia(`${selector}{${declarations}}`, mediaStack))
        }

        node.children.forEach(child => {
            const childText = renderNode(child, selector, mediaStack)
            if (childText) chunks.push(childText)
        })

        return chunks.join('\n')
    }

    /**
     * @param {CSSMediaNode} node
     * @param {string} parentSelector
     * @param {Array.<string>} mediaStack
     * @returns {string}
     */
    function renderMedia(node, parentSelector, mediaStack) {
        return node.children
            .map(child => renderNode(child, parentSelector, [...mediaStack, node.query]))
            .filter(Boolean)
            .join('\n')
    }

    /**
     * @param {CSSKeyframesNode} node
     * @returns {string}
     */
    function renderKeyframes(node) {
        const dedupeKey = `keyframes|${node.name}`
        if (registry.inserted.has(dedupeKey)) return ''

        const frames = Object.entries(node.frames)
            .map(([step, styles]) => {
                const declarations = serializeDeclarations(styles)
                if (!declarations) return ''
                return `${step}{${declarations}}`
            })
            .filter(Boolean)
            .join('')

        if (!frames) return ''

        registry.inserted.add(dedupeKey)
        return `@keyframes ${node.name}{${frames}}`
    }

    /**
     * @param {string} selector
     * @param {Array.<string>} mediaStack
     * @returns {string}
     */
    function buildRuleKey(selector, mediaStack) {
        return `rule|${mediaStack.join('|')}|${selector}`
    }

    /**
     * @param {string} cssText
     * @param {Array.<string>} mediaStack
     * @returns {string}
     */
    function wrapMedia(cssText, mediaStack) {
        return mediaStack.reduceRight((acc, query) => `@media ${query}{${acc}}`, cssText)
    }

    /**
     * Join child selector to parent selector.
     * Supports pseudo selectors, attribute selectors and `&`.
     *
     * @param {string} parentSelector
     * @param {string} childSelector
     * @returns {string}
     */
    function combineSelectors(parentSelector, childSelector) {
        const selectors = childSelector
            .split(',')
            .map(selector => selector.trim())
            .filter(Boolean)

        if (!parentSelector) return selectors.join(', ')

        return selectors.map(selector => {
            if (selector.includes('&')) {
                return selector.split('&').join(parentSelector)
            }

            if (
                selector.startsWith(':')
                || selector.startsWith('::')
                || selector.startsWith('[')
            ) {
                return `${parentSelector}${selector}`
            }

            return `${parentSelector} ${selector}`
        }).join(', ')
    }

    /**
     * Convert JS style object into CSS declaration string.
     *
     * @param {CSSObject} styles
     * @returns {string}
     */
    function serializeDeclarations(styles) {
        return Object.entries(styles || {})
            .filter(([, value]) => value != null)
            .map(([property, value]) => `${toKebabCase(property)}:${String(value)};`)
            .join('')
    }

    /**
     * @param {string} property
     * @returns {string}
     */
    function toKebabCase(property) {
        if (property.startsWith('--')) return property

        return property.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`)
    }

    /**
     * @param {() => void} callback
     * @returns {void}
     */
    function scheduleMicrotask(callback) {
        if (typeof queueMicrotask === 'function') {
            queueMicrotask(callback)
            return
        }

        Promise.resolve().then(callback)
    }

    /**
     * Reuse one style element for the whole page.
     *
     * @returns {HTMLStyleElement}
     */
    function ensureStyleElement() {
        if (registry.styleElement && registry.styleElement.isConnected) {
            return registry.styleElement
        }

        const existing = document.querySelector('style[data-snwlib-css]')
        if (existing) {
            registry.styleElement = existing
            return existing
        }

        const style = document.createElement('style')
        style.setAttribute('data-snwlib-css', '')
        ;(document.head || document.documentElement).appendChild(style)
        registry.styleElement = style

        return style
    }

    /**
     * Default screen queries for cssMedia.
     * @type {{
     *   mobile: string,
     *   tablet: string,
     *   desktop: string
     * }}
     */
    const cssScreens = {
        mobile: '(max-width: 640px)',
        tablet: '(max-width: 1024px)',
        desktop: '(max-width: 1440px)'
    }

    global.css = css
    global.cssMedia = cssMedia
    global.cssKeyframes = cssKeyframes
    global.cssScreens = cssScreens
})(globalThis)
