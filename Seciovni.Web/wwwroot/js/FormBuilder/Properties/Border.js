/**
 * Created by David on 09/26/16.
 */

class BorderFields {
    static get color() { return "color"; }
    static get thickness() { return "thickness"; }
}

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

    // region Public Functions

    /**
     * Deep copies this object
     * @returns {Border}
     */
    clone(){
        const newBorder = new Border();
        newBorder._thickness = this._thickness.clone();
        newBorder._color = this._color;

        return newBorder;
    }

    /**
     * Checks if this border is the same as another
     * @param {Border} rhs - The border to compare against
     * @returns {boolean}
     */
    equals(rhs){
        return this._thickness.equals(rhs._thickness) && this._color === rhs._color;
    }

    // endregion

    // region JSON

    /**
     * Gets the JSON data for this class
     * @return {Object<string, *>}
     */
    toJSON() {
        const properties = {};
        properties[BorderFields.color] = this.color;
        properties[BorderFields.thickness] = this._thickness;
        return properties;
    }

    /**
     * Initializes the object from the provided JSON
     * @param {JSON} json - The JSON to use
     */
    initialize_json(json){
        this.color = json[BorderFields.color];
        this._thickness.initialize_json(json[BorderFields.thickness]);
    }

    // endregion
}