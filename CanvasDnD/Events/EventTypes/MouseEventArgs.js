/**
 * Created by David on 10/11/16.
 */

/**
 * @enum {number}
 */
const MouseButton = {
    None: 0,
    Left: 1,
    Right: 2,
    Middle: 4,
    Back: 8,
    Forward: 16
};

/**
 * Holds information about a mouse event
 */
class MouseEventArgs extends EventArgs {
    /**
     * Creates a new MouseEventArgs object
     * @param {Subscribable} sender - The object that is sending the event
     * @param {number} x - The X position the event happened at
     * @param {number} y - The y position the event happened at
     * @param {MouseButton} mouseButton - The currently pressed button
     * @param {boolean} altKey
     * @param {boolean} ctrlKey
     * @param {boolean} shiftKey
     */
    constructor(sender, x, y, mouseButton, altKey, ctrlKey, shiftKey){
        super(sender);

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

        /**
         * @type {boolean}
         * @private
         */
        this._alt = altKey;

        /**
         * @type {boolean}
         * @private
         */
        this._ctrl = ctrlKey;

        /**
         * @type {boolean}
         * @private
         */
        this._shift = shiftKey
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

    /**
     * @returns {boolean}
     */
    get altKey() { return this._alt; }

    /**
     * @returns {boolean}
     */
    get ctrlKey() { return this._ctrl; }

    /**
     * @returns {boolean}
     */
    get shiftKey() { return this._shift; }
}