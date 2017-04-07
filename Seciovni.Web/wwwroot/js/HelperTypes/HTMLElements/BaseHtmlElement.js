/**
 * Created by David on 02/01/17.
 */

class BaseHtmlElement extends SubscribableProperty {
    constructor(htmlObj){
        super();

        /**
         * @private
         * @type {HTMLElement}
         */
        this._htmlObj = htmlObj;

        /**
         * @type {object<function, function>}
         * @private
         */
        this._boundMethods = {};

        /**
         * The events that have been added
         * @type {Array<Array<string, function>>}
         * @private
         */
        this._events = [];

        /**
         * The original title to be used when an error is cleared
         * @type {string}
         * @private
         */
        this._title = htmlObj.hasAttribute("title") ? htmlObj.getAttribute("title") : "";

        // Clear the error every time the field changes, so we don't have
        // to worry about errors no longer being valid after things are
        // flagged from the server
        this.addEvent('change', (e) => this.error = null, true);
    }

    /**
     * Gets a method which has `this` bound to it so it can be used for events
     * Creates the bound method if it does not exist.
     * @param {function} func - The original function that needed `this` bound to it
     * @returns {function}
     * @protected
     */
    __getBoundFunc(func){
        if(!this._boundMethods[func]) this._boundMethods[func] = func.bind(this);

        return this._boundMethods[func];
    }

    /**
     * Add an event to this element
     * @param {string} eventName - the name of the event
     * @param {function} eventFunc - The callback for this event
     * @param {boolean} useCapture - Indicates if the event should be captured during tunneling
     */
    addEvent(eventName, eventFunc, useCapture = false){
        this.htmlObj.addEventListener(eventName, eventFunc, useCapture);
        this._events.push([eventName, eventFunc]);
    }

    /**
     * Remove an event from this element
     * @param {string} eventName - the name of the event
     * @param {function} eventFunc - The callback for this event
     * @private
     */
    removeEvent(eventName, eventFunc){
        this.htmlObj.removeEventListener(eventName, eventFunc);
        this._events.splice(this._events.indexOf([eventName, eventFunc], 1));
    }

    /**
     * Removes all subscribed events
     */
    clearEvents(){
        for(let event of this._events){
            this.htmlObj.removeEventListener(event[0], event[1]);
        }
    }

    /**
     * The HTML object that this object wraps
     * @return {HTMLElement}
     */
    get htmlObj() { return this._htmlObj; }

    /**
     * The error on this HTML element
     * @param {string|null} value - The error the cell has -- null if no error
     */
    set error(value) {
        if(value === null){
            this.htmlObj.removeAttribute(ATTRIBUTE_ERROR);
            this.htmlObj.setAttribute("title", this._title);
        }
        else{
            this.htmlObj.setAttribute(ATTRIBUTE_ERROR, value);
            this.htmlObj.setAttribute("title", value);
        }
    }

    /**
     * The error on this HTML element
     * @return {string|null}
     */
    get error() { return this.htmlObj.hasAttribute(ATTRIBUTE_ERROR) ? this.htmlObj.getAttribute(ATTRIBUTE_ERROR) : null; }

    /**
     * The Value of the field
     * @return {*}
     * @virtual
     */
    get value() { return this._htmlObj.innerHTML }

    /**
     *
     * @param {*} value - The value to set the field as
     * @virtual
     */
    set value(value) { this._htmlObj.innerHTML = value; }

    toString(){
        return this.value;
    }
}