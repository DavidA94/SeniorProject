/**
 * Created by David on 09/26/16.
 */

class TRBLFields {
    static get top() { return "top"; }
    static get right() { return "right"; }
    static get bottom() { return "bottom"; }
    static get left() { return "left"; }
}

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
        const newTRBL = new TRBL();
        newTRBL.top = this.top;
        newTRBL.right = this.right;
        newTRBL.bottom = this.bottom;
        newTRBL.left = this.left;

        return newTRBL;
    }

    /**
     * Checks if the given RHS is equal to this object
     * @param {TRBL} rhs
     * @return {boolean}
     */
    equals(rhs){
        return this.top === rhs.top && this.right === rhs.right && this.bottom === rhs.bottom && this.left === rhs.left;
    }

    // endregion

    // region JSON

    /**
     * Gets the JSON data for this class
     * @return {Object<string, *>}
     */
    toJSON() {
        const properties = {};
        properties[TRBLFields.top] = this.top;
        properties[TRBLFields.right] = this.right;
        properties[TRBLFields.bottom] = this.bottom;
        properties[TRBLFields.left] = this.left;

        return properties;
    }

    /**
     * Initializes the object from the provided JSON
     * @param {json} json - The JSON to use
     */
    initialize_json(json){
        this.top = json[TRBLFields.top];
        this.right = json[TRBLFields.right];
        this.bottom = json[TRBLFields.bottom];
        this.left = json[TRBLFields.left];
    }

    // endregion
}
