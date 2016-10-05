/**
 * Created by David on 10/04/16.
 */

/**
 * @callback setter
 * @param value - The new value to be set
 */
/**
 * @callback getter
 * @returns {*}
 */

/**
 * Represents a custom Property for a given FormBuilder object
 */
class Property{

    // region Constructor

    /**
     * Creates a new Property
     * @param {string} displayText - The text to be shown next to the property
     * @param {Property.Type} type - The type of property
     * @param {getter} getValueFunc - The function to be called that will get the current value
     * @param {setter} setValueFunc - The function to be called that will set the new value
     * @param {string} unit - The type of unit for this property (e.g. mm, px, in, etc.)
     * @param {Array} dropDownValues - The options to be presented for a @see {@link Property.Type.DROP_DOWN}
     */
    constructor(displayText, type, getValueFunc, setValueFunc, unit = null, dropDownValues = null){

        /**
         * @private
         * @type {string}
         */
        this._displayText = displayText;

        /**
         * @private
         * @type {string}
         */
        this._type = Property.Type[type];

        /**
         * @private
         * @type {getter}
         */
        this._getValueFunc = getValueFunc;

        /**
         * @private
         * @type {setter}
         */
        this._setValueFunc = setValueFunc;

        /**
         * @private
         * @type {string}
         */
        this._unit = unit;

        /**
         * @private
         * @type {Array}
         */
        this._DDvalues = dropDownValues;

        // Ensure we got a type
        if(!this.type){
            throw "Invalid type. Must use type found in Property.Type";
        }
    }

    // endregion

    // region Public Getters

    /**
     * Gets the display text
     * @returns {string}
     */
    get displayText() { return this._displayText; }

    /**
     * Gets the type of property
     * @returns {string}
     */
    get type() { return this._type; }

    /**
     * Gets the function that allows getting the current property value
     * @returns {getter}
     */
    get value() { return this._getValueFunc(); }

    /**
     * Gets the available options for the dropdown
     * @returns {Array}
     */
    get dropDownValues() { return this._DDvalues; }

    /**
     * Gets the unit to display for this property
     * @returns {string}
     */
    get unit() { return this._unit; }

    /**
     * The available property types
     * @enum {string}
     */
    static get Type(){
        return {
            INT: "INT",
            BOOL: "BOOL",
            STRING: "STRING",
            DOUBLE: "DOUBLE",
            DROP_DOWN: "DROP_DOWN",
            COLOR: "COLOR",
        };
    }

    // endregion
}