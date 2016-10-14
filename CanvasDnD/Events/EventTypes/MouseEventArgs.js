/**
 * Created by David on 10/11/16.
 */

/**
 * @enum {string}
 */
const MouseButton = {
    Left: "Left",
    Middle: "Middle",
    Right: "Right"
};

/**
 * Holds information about a mouse event
 */
class MouseEventArgs extends EventArgs {
    /**
     * Creates a new MouseEventArgs object
     * @param {number} x - The X position the event happened at
     * @param {number} y - The y position the event happened at
     * @param {MouseButton} eventType
     */
    constructor(x, y, mouseButton){
        super();

        /**
         * @private
         * @type {number}
         */
        this._x = x;

        /**
         * @private
         * @type {number}
         */
        this._y = y;

        /**
         * @private
         * @type {MouseButton}
         */
        this._mouseButton = mouseButton;
    }

    /**
     * @returns {number}
     */
    get x() { return this._x; }

    /**
     * @returns {number}
     */
    get y() { return this._y; }

    /**
     * @returns {MouseButton}
     */
    get button() { return this._mouseButton; }
}