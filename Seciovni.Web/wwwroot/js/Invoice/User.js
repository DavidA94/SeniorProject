/**
 * Created by David on 2017-02-07.
 */

class UserFields {
    static get firstName() { return "FirstName"; }
    static get lastName() { return "LastName"; }
    static get email() { return "Email"; }
}

class User {
    // region CTOR

    constructor() {
        /**
         * @private
         * @type {BaseHtmlElement}
         */
        this._firstName = null;

        /**
         * @private
         * @type {BaseHtmlElement}
         */
        this._lastName = null;

        /**
         * @private
         * @type {BaseHtmlElement}
         */
        this._email = null;
    }

    // endregion

    // region Public Properties

    /**
     * The First name
     * @return {BaseHtmlElement}
     */
    get FirstName() { return this._firstName; }

    /**
     * The First name
     * @param {BaseHtmlElement} value
     */
    set FirstName(value) { this._firstName = value;}

    /**
     * The last name
     * @return {BaseHtmlElement}
     */
    get LastName() {return this._lastName;}

    /**
     * The last name
     * @param {BaseHtmlElement} value
     */
    set LastName(value) { this._lastName = value; }

    /**
     * The email
     * @return {BaseHtmlElement}
     */
    get Email() {return this._email;}

    /**
     * The email
     * @param {BaseHtmlElement} value
     */
    set Email(value) { this._email = value; }

    // endregion

    // region Public Methods

    /**
     * Initializes this class from a JSON object
     * @param {json} json - The JSON data
     */
    initialize_json(json) {
        this._firstName.value = json[UserFields.firstName];
        this._lastName.value = json[UserFields.lastName];
        this._email.value = json[UserFields.email];
    }

    /**
     * Gets the JSON data for this class
     * @return {Object<string, *>}
     */
    toJSON(){
        const properties = {};
        properties[UserFields.firstName] = this._firstName.value;
        properties[UserFields.lastName] = this._lastName.value;
        properties[UserFields.email] = this._email.value;

        return properties
    }

    // endregion
}