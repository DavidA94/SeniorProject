/**
 * Created by David on 09/26/16.
 */

/**
 * Represents the Layout properties of an object
 */
class Layout {
    // region Constructor

    /**
     * Creates a new Layout object
     */
    constructor(){
        /**
         * The x position
         * @type {number}
         * @private
         */
        this._x = 0;

        /**
         * The y position
         * @type {number}
         * @private
         */
        this._y = 0;

        /**
         * The width
         * @type {number}
         * @private
         */
        this._width = 0;

        /**
         * The height
         * @type {number}
         * @private
         */
        this._height = 0;

        /**
         * Holds the margin properties
         * @type {TRBL}
         * @private
         */
        this._margin = new TRBL();

        /**
         * Holds the padding properties
         * @type {TRBL}
         * @private
         */
        this._padding = new TRBL();
    }

    // endregion

    // region Public Properties

    /**
     * Gets the current X value
     * @returns {number}
     */
    get x() { return this._x; }

    /**
     * Sets the X value
     * @param {number} value
     */
    set x(value) { this._x = value; }


    /**
     * Gets the current Y value
     * @returns {number}
     */
    get y() { return this._y; }

    /**
     * Sets the Y value
     * @param {number} value
     */
    set y(value) { this._y = value; }


    /**
     * Gets the current width
     * @returns {number}
     */
    get width() { return this._width; }

    /**
     * Sets the width
     * @param {number} value
     */
    set width(value) { this._width = value; }


    /**
     * Gets the current height
     * @returns {number}
     */
    get height() { return this._height; }

    /**
     * Sets the height
     * @param {number} value
     */
    set height(value) { this._height = value; }


    /**
     * Gets the margin
     * @returns {TRBL}
     */
    get margin() { return this._margin; }

    /**
     * Gets the padding
     * @returns {TRBL}
     */
    get padding() { return this._padding; }

    // endregion

    // region Public Functions

    /**
     * Returns a deep-copy clone of the layout
     * @returns {Layout}
     */
    clone(){
        var newLayout = new Layout();
        newLayout._x = this._x;
        newLayout._y = this._y;
        newLayout.width = this.width;
        newLayout.height = this.height;
        newLayout._margin = this.margin.clone();
        newLayout._padding = this.padding.clone();

        return newLayout;
    }

    // endregion
}