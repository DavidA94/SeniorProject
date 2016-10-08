/**
 * Created by David on 09/26/16.
 */

/**
 * Represents a border
 */
class Border {
    // region Constructor

    /**
     * Creates a new Border object
     */
    constructor(){
        /**
         * Holds the color of the border
         * @type {string}
         * @private
         */
        this._color = "#000000";

        /**
         * Holds how thick each side of the border is
         * @type {TRBL}
         * @private
         */
        this._thickness = new TRBL();
    }

    // endregion

    // region Public Properties

    /**
     * Gets the color of the border
     * @returns {string}
     */
    get color() { return this._color; }

    /**
     * Sets the color of the border
     * @param {string} value
     */
    set color(value) { this._color = value; }


    /**
     * Gets the top thickness
     * @returns {number}
     */
    get top() { return this._thickness.top; }

    /**
     * Sets the top thickness
     * @param {number} value
     */
    set top(value) { this._thickness.top = value; }


    /**
     * Sets the right thickness
     * @returns {number}
     */
    get right() { return this._thickness.right; }

    /**
     * Gets the right thickness
     * @param {number} value
     */
    set right(value) { this._thickness.right = value; }


    /**
     * Gets the bottom thickness
     * @returns {number}
     */
    get bottom() { return this._thickness.bottom; }

    /**
     * Sets the bottom thickness
     * @param {number} value
     */
    set bottom(value) { this._thickness.bottom = value; }


    /**
     * Gets the left thickness
     * @returns {number}
     */
    get left() { return this._thickness.left; }

    /**
     * Sets the left thickness
     * @param {number} value
     */
    set left(value) { this._thickness.left = value; }

    // endregion
}