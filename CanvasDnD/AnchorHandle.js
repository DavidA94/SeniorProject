/**
 * Created by David on 10/04/16.
 */

/**
 * Used to specify which anchor handle to get -- acts like an enum
 * @enum {number}
 */
const Anchor = {
    LeftTop: 1,
    LeftBottom: 2,
    RightTop: 3,
    RightBottom: 4
};

/**
 * Represents and Anchor handle for a shape
 */
class AnchorHandle{

    // region Constructor

    /**
     * Creates a new Anchor handle
     * @param {number} x - The X position of the anchor
     * @param {number} y - The Y position of the anchor
     * @param {number} width - The width of the anchor
     * @param {number} height - The height of the anchor
     */
    constructor(x, y, width, height){
        // Remember all the parameters in private member variables

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
         * @type {number}
         */
        this._width = width;

        /**
         * @private
         * @type {number}
         */
        this._height = height;
    }

    // endregion

    // region X/Y, Width/Height getter/setters

    /**
     * Gets the X position
     * @returns {number}
     * @constructor
     */
    get X() { return this._x; }

    /**
     * Sets the X position
     * @param {number} value - The new X value
     * @constructor
     */
    set X(value) { this._x = value; }

    
    /**
     * Gets the Y position
     * @returns {number}
     * @constructor
     */
    get Y() { return this._y; }

    /**
     * Sets the Y position
     * @param {number} value - the new Y value
     * @constructor
     */
    set Y(value) { this._y = value; }

    
    /**
     * Gets the width
     * @returns {number}
     * @constructor
     */
    get Width() { return this._width; }

    /**
     * Sets the width
     * @param {number} value
     * @constructor
     */
    set Width(value) { this._width = value; }

    
    /**
     * Gets the height
     * @returns {number}
     * @constructor
     */
    get Height() { return this._height; }

    /**
     * Sets the height
     * @param {number} value
     * @constructor
     */
    set Height(value) { this._height = value; }

    // endregion

    // region Top, Right, Bottom, and Left getters

    /**
     * Gets the value of the top side
     * @returns {number}
     * @constructor
     */
    get Top() { return this._y; }

    /**
     * Gets the value of the right side
     * @returns {number}
     * @constructor
     */
    get Right() { return this._x + this._width; }

    /**
     * Gets the value of the bottom side
     * @returns {number}
     * @constructor
     */
    get Bottom() { return this._y + this._height; }

    /**
     * Gets the value of the left side
     * @returns {number}
     * @constructor
     */
    get Left () { return this._x; }

    // endregion

    // region Public Functions

    /**
     * Checks if the given (x, y) coordinate is within the anchor handle, or close enough by as specified by the padding
     * @param x - The x coordinate to be checked
     * @param y - The y coordinate to be checked
     * @param padding - How far away the coordinate can be to still be counted as within the anchor
     * @returns {boolean}
     */
    isPointInShape(x, y, padding = 0){
        return x - this.Left > -padding && x - this.Left <= this.Width + padding &&
            y - this.Top  > -padding && y - this.Top  <= this.Height + padding;
    }

    // endregion
}