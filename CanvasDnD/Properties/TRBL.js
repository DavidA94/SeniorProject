/**
 * Created by David on 09/26/16.
 */

/**
 * Represents a Top, Right, Bottom, and Left
 */
class TRBL {
    // region Constructor

    constructor(){
        /**
         * @private
         * @type {number}
         */
        this._top = 0;

        /**
         * @private
         * @type {number}
         */
        this._right = 0;

        /**
         * @private
         * @type {number}
         */
        this._bottom = 0;

        /**
         * @private
         * @type {number}
         */
        this._left = 0;
    }

    // endregion

    // region Public Properties

    /**
     * Gets the top
     * @returns {number}
     */
    get top() { return this._top; }

    /**
     * Sets the top
     * @param {number} value
     */
    set top(value) { this._top = value; }


    /**
     * Gets the right
     * @returns {number}
     */
    get right() { return this._right; }

    /**
     * Sets the right
     * @param {number} value
     */
    set right(value) { this._right = value; }


    /**
     * Gets the bottom
     * @returns {number}
     */
    get bottom() { return this._bottom; }

    /**
     * Sets the bottom
     * @param {number} value
     */
    set bottom(value) { this._bottom = value; }


    /**
     * Gets the left
     * @returns {number}
     */
    get left() { return this._left; }

    /**
     * Sets the left
     * @param {number} value
     */
    set left(value) { this._left = value; }

    // endregion

    // region Public Functions

    /**
     * Creates a deep copy clone
     * @returns {TRBL}
     */
    clone(){
        var newTRBL = new TRBL();
        newTRBL.top = this.top;
        newTRBL.right = this.right;
        newTRBL.bottom = this.bottom;
        newTRBL.left = this.left;

        return newTRBL;
    }

    // endregion
}
