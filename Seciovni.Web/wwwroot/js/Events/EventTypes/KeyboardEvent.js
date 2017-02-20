/**
 * Created by David on 11/14/16.
 */

/**
 * @enum {string}
 */
const KeyboardEventType = {
    GotFocus: "GotFocus",
    LostFocus: "LostFocus",
    KeyDown: "KeyDown",
    KeyUp: "KeyUp",
};

class KeyboardEvent extends BaseEventType {
    /**
     * Creates a new MouseEvent
     * @param {KeyboardEventType} event - The mouse event that occurred
     */
    constructor(event){
        super();
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