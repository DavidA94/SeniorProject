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
     */
    addEvent(eventName, eventFunc){
        this.htmlObj.addEventListener(eventName, eventFunc);
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

    clearEvents(){
        for(let event of this._events){
            this.htmlObj.removeEventListener(event[0], event[1]);
        }
    }

    get htmlObj() { return this._htmlObj; }

    /**
     * The Value of the field
     * @return {string|number}
     * @abstract
     */
    get value() {  }

    /**
     *
     * @param {string|number} value - The value to set the field as
     * @abstract
     */
    set value(value) {  }
}