/**
 * Created by David on 2017-02-12.
 */

class SpanElement extends BaseHtmlElement {
    /**
     * Creates a new Span Element
     * @param {HTMLSpanElement} spanElement
     */
    constructor(spanElement){
        super(spanElement);
    }

    /**
     * The value
     * @return {string}
     */
    get value() { return this.htmlObj.innerHTML; }

    /**
     * The value
     * @param {string} value
     */
    set value(value) { this.htmlObj.innerHTML = value; }

    /**
     * The value
     * @return {boolean}
     */
    get bold() { return this.htmlObj.style.fontWeight === "bold"; }

    /**
     * The value
     * @param {boolean} value
     */
    set bold(value) { this.htmlObj.style.fontWeight = "bold"; }
}