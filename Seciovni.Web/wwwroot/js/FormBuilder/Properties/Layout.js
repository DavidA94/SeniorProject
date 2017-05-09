/**
 * Created by David on 09/26/16.
 */

class LayoutFields {
    static get x() { return "x"; }
    static get y() { return "y"; }
    static get height() { return "height"; }
    static get width() { return "width"; }
    static get margin() { return "margin"; }
    static get padding() { return "padding"; }
}

/**
 * Represents the Layout properties of an object
 */
class Layout extends SubscribableProperty {
    // region Constructor

    /**
     * Creates a new Layout object
     */
    constructor(){
        super();

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
    set x(value) { if(value !== this._x) { this._x = value; this.__sendPropChangeEvent("x"); } }


    /**
     * Gets the current Y value
     * @returns {number}
     */
    get y() { return this._y; }

    /**
     * Sets the Y value
     * @param {number} value
     */
    set y(value) { if(value !== this._y) { this._y = value; this.__sendPropChangeEvent("y"); } }


    /**
     * Gets the current width
     * @returns {number}
     */
    get width() { return this._width; }

    /**
     * Sets the width
     * @param {number} value
     */
    set width(value) { if(value !== this._width) { this._width = value; this.__sendPropChangeEvent("width"); } }


    /**
     * Gets the current height
     * @returns {number}
     */
    get height() { return this._height; }

    /**
     * Sets the height
     * @param {number} value
     */
    set height(value) { if(value !== this._height) { this._height = value; this.__sendPropChangeEvent("height"); } }


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
        const newLayout = new Layout();
        newLayout._x = this._x;
        newLayout._y = this._y;
        newLayout.width = this.width;
        newLayout.height = this.height;
        newLayout._margin = this.margin.clone();
        newLayout._padding = this.padding.clone();

        return newLayout;
    }

    /**
     * Copies a layout into this one
     * @param {Layout} layout
     */
    copyIn(layout){
        this.x = layout.x;
        this.y = layout.y;
        this.width = layout.width;
        this.height = layout.height;
    }

    /**
     * Checks if this layout is equal to another
     * @param {Layout} rhs
     */
    equals(rhs){
        return this.x === rhs.x && this.y === rhs.y && this.width === rhs.width && this.height === rhs.height;
    }

    // endregion

    // region JSON

    /**
     * Gets the JSON data for this class
     * @return {Object<string, *>}
     */
    toJSON() {
        const properties = {};
        properties[LayoutFields.x] = this.x;
        properties[LayoutFields.y] = this.y;
        properties[LayoutFields.height] = this.height;
        properties[LayoutFields.width] = this.width;
        properties[LayoutFields.margin] = this.margin;
        properties[LayoutFields.padding] = this.padding;

        return properties;
    }

    /**
     * Initializes the object from the provided JSON
     * @param {JSON} json - The JSON to use
     */
    initialize_json(json){
        this.x = json[LayoutFields.x];
        this.y = json[LayoutFields.y];
        this.height = json[LayoutFields.height];
        this.width = json[LayoutFields.width];
        this.margin.initialize_json(json[LayoutFields.margin]);
        this.padding.initialize_json(json[LayoutFields.padding]);
    }

    // endregion
}