/**
 * Created by David on 2017-02-07.
 */

class PhoneFields {
    static get number() { return "Number"; }
    static get type() { return "Type"; }
}

class PhoneNumber {
    // region CTOR

    constructor(){
        /**
         * @private
         * @type {BaseHtmlElement}
         */
        this._number = null;

        /**
         * @private
         * @type {BaseHtmlElement}
         */
        this._type = null;
    }

    // endregion

    // region Public Properties

    /**
     * The number
     * @return {BaseHtmlElement}
     */
    get Number() { return this._number; }

    /**
     * The number
     * @param {BaseHtmlElement} value
     */
    set Number(value) { this._number = value; }

    /**
     // * The type
     * @return {BaseHtmlElement}
     */
    get Type() { return this._type; }

    /**
     * The type
     * @param {BaseHtmlElement} value
     */
    set Type(value) { this._type = value; }

    // endregion

    // region Public Methods

    /**
     * Initializes this class from a JSON object
     * @param {json} json - The JSON data
     */
    initialize_json(json) {
        this._number.value = json[PhoneFields.number];
    }

    toJSON(){
        const properties = {};
        properties[PhoneFields.number] = this._number.value;

        return properties;
    }

    // endregion
}