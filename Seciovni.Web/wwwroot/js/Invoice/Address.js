/**
 * Created by David on 2017-02-07.
 */

class AddressFields {
    static get address() { return "StreetAddress"; }
    static get city() { return "City"; }
    static get state() { return "State"; }
    static get zip() { return "ZipCode"; }
}

class Address {
    // region CTOR

    constructor(){
        /**
         * @private
         * @type {BaseHtmlElement}
         */
        this._address = null;

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
        this._zip = null;
    }

    // endregion

    // region Public Properties

    /**
     * The Address
     * @return {BaseHtmlElement}
     */
    get Address() { return this._address; }

    /**
     * The address
     * @param {BaseHtmlElement} value
     */
    set Address(value) { this._address = value;}

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
    get Zip() { return this._zip; }

    /**
     * The ZIP
     * @param {BaseHtmlElement} value
     */
    set Zip(value) { this._zip = value; }

    // endregion

    // region Public Methods

    initialize_json(json){
        const zip = json[AddressFields.zip];
        console.log(zip);

        this._address.value = json[AddressFields.address];
        this._city.value = json[AddressFields.city];
        this._state.value = json[AddressFields.state];
        this._zip.htmlObj.value = (isNaN(zip) || zip === "") ? "" : parseInt(zip);
    }

    toJSON(){
        const properties = {};
        properties[AddressFields.address] = this._address.value;
        properties[AddressFields.city] = this._city.value;
        properties[AddressFields.state] = this._state.value;
        properties[AddressFields.zip] = this._zip.htmlObj.value;

        return properties;
    }

    // endregion
}