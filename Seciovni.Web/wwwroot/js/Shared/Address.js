/**
 * Created by David on 2017-02-07.
 */

class AddressFields {
    static get address() { return "streetAddress"; }
    static get city() { return "city"; }
    static get state() { return "state"; }
    static get zip() { return "zipCode"; }
}

class Address {
    // region CTOR

    constructor(){
        /**
         * @private
         * @type {BaseHtmlElement}
         */
        this._streetAddress = null;

        /**
         * @private
         * @type {BaseHtmlElement}
         */
        this._city = null;

        /**
         * @private
         * @type {BaseHtmlElement}
         */
        this._state = null;

        /**
         * @private
         * @type {BaseHtmlElement}
         */
        this._zipCode = null;
    }

    // endregion

    // region Public Properties

    /**
     * The Address
     * @return {BaseHtmlElement}
     */
    get StreetAddress() { return this._streetAddress; }

    /**
     * The address
     * @param {BaseHtmlElement} value
     */
    set StreetAddress(value) { this._streetAddress = value;}

    /**
     * The City
     * @return {BaseHtmlElement}
     */
    get City() { return this._city; }

    /**
     * The City
     * @param {BaseHtmlElement} value
     */
    set City(value) { this._city = value; }

    /**
     * The State
     * @return {BaseHtmlElement}
     */
    get State() { return this._state; }

    /**
     * The state
     * @param {BaseHtmlElement} value
     */
    set State(value) { this._state = value; }

    /**
     * The ZIP
     * @return {BaseHtmlElement}
     */
    get Zip() { return this._zipCode; }

    /**
     * The ZIP
     * @param {BaseHtmlElement} value
     */
    set Zip(value) { this._zipCode = value; }

    // endregion

    // region Public Methods

    initialize_json(json){
        const zip = json[AddressFields.zip];
        this._streetAddress.value = json[AddressFields.address];
        this._city.value = json[AddressFields.city];
        this._state.value = json[AddressFields.state];
        this._zipCode.htmlObj.value = (isNaN(zip) || zip === "") ? "" : parseInt(zip);
    }

    toJSON(){
        const properties = {};
        properties[AddressFields.address] = this._streetAddress.value;
        properties[AddressFields.city] = this._city.value;
        properties[AddressFields.state] = this._state.value;
        properties[AddressFields.zip] = this._zipCode.htmlObj.value;

        return properties;
    }

    // endregion
}