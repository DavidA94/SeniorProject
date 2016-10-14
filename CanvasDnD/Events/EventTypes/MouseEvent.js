/**
 * Created by David on 10/11/16.
 */

/**
 * @enum {string}
 */
const MouseEventType = {
    MouseDown: "MouseDown",
    MouseEnter: "MouseEnter",
    MouseLeave: "MouseLeave",
    MouseMove: "MouseMove",
    MouseUp: "MouseUp"
};

class MouseEvent extends BaseEventType {
    /**
     * Creates a new MouseEvent
     * @param {MouseEventType} event - The mouse event that occurred
     */
    constructor(event){

        /**
         * @private
         * @type {MouseEventType}
         */
        this._event = event;
    }

    /**
     * Gets the mouse event that occurred
     * @returns {MouseEventType}
     */
    get event() { return this._event; }
}