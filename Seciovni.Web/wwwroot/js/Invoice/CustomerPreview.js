/**
 * Created by David on 2017-02-12.
 */

class CustomerPreview {

    // region CTOR

    constructor(){

        /**
         * The element that is holding this info
         * @type {BaseHtmlElement}
         * @private
         */
        this._divElement = null;

        /**
         * @private
         * @type {number}
         */
        this._customerID = -1;

        /**
         * @private
         * @type {SpanElement}
         */
        this._firstName = null;

        /**
         * @private
         * @type {SpanElement}
         */
        this._lastName = null;

        /**
         * @private
         * @type {SpanElement}
         */
        this._streetAddress = null;

        /**
         * @private
         * @type {SpanElement}
         */
        this._city = null;

        /**
         * @private
         * @type {SpanElement}
         */
        this._state = null;

        /**
         * @private
         * @type {SpanElement}
         */
        this._zip = null;

        /**
         * @private
         * @type {SpanElement}
         */
        this._email = null;

        /**
         * @private
         * @type {SpanElement}
         */
        this._phoneNumber = null;
    }

    // endregion

    // region Public Properties

    /**
     * The parent element of this customer
     * @return {BaseHtmlElement}
     */
    get parentElement() { return this._divElement; }

    /**
     * The customer's ID
     * @return {number}
     */
    get customerID() { return this._customerID; }

    /**
     * The customer's ID
     * @param {number} value
     */
    set customerID(value) { this._customerID = value; }

    /**
     * The first name
     * @type {SpanElement}
     */
    get firstName() { return this._firstName; }

    /**
     * The last name
     * @type {SpanElement}
     */
    get lastName() { return this._lastName; }

    /**
     * The street address
     * @type {SpanElement}
     */
    get streetAddress() { return this._streetAddress; }

    /**
     * The city
     * @type {SpanElement}
     */
    get city() { return this._city; }

    /**
     * The state
     * @type {SpanElement}
     */
    get state() { return this._state; }

    /**
     * The zip
     * @type {SpanElement}
     */
    get zip() { return this._zip; }

    /**
     * The email
     * @type {SpanElement}
     */
    get email() { return this._email; }

    /**
     * The phone number
     * @type {SpanElement}
     */
    get phoneNumber() { return this._phoneNumber; }

    // endregion

    // region Public Methods

    /**
     * Creates a CustomerPreview from JSON data, including the HTML elements
     * @param {*} json
     * @return {CustomerPreview}
     */
    static createFromJSON(json){
        const cp = new CustomerPreview();

        cp.customerID = json.customerID;

        const parent = document.createElement("div");
        parent.className = CONTACT_PREVIEW_CLASSES;

        const nameP = document.createElement("p");
        const addressP = document.createElement("p");
        const emailP = document.createElement("p");
        cp._divElement = new BaseHtmlElement(parent);
        cp.parentElement.htmlObj.appendChild(nameP);
        cp.parentElement.htmlObj.appendChild(addressP);
        cp.parentElement.htmlObj.appendChild(emailP);

        // --------------------------------------------------

        const firstNameElement = /** @type{HTMLSpanElement} */document.createElement("span");
        cp._firstName = new SpanElement(firstNameElement);
        cp.firstName.value = json.user.firstName;

        const lastNameElement = /** @type{HTMLSpanElement} */document.createElement("span");
        cp._lastName = new SpanElement(lastNameElement);
        cp.lastName.value = json.user.lastName;

        nameP.appendChild(firstNameElement);
        nameP.appendChild(document.createTextNode(" "));
        nameP.appendChild(lastNameElement);

        // --------------------------------------------------

        const streetAddressElement = /** @type{HTMLSpanElement} */document.createElement("span");
        cp._streetAddress = new SpanElement(streetAddressElement);
        cp.streetAddress.value = /** @type{string} */json.address.streetAddress;

        const cityElement = /** @type{HTMLSpanElement} */document.createElement("span");
        cp._city = new SpanElement(cityElement);
        cp.city.value = json.address.city;

        const stateElement = /** @type{HTMLSpanElement} */document.createElement("span");
        cp._state = new SpanElement(stateElement);
        cp.state.value = json.address.state;

        const zipElement = /** @type{HTMLSpanElement} */document.createElement("span");
        cp._zip = new SpanElement(zipElement);
        cp.zip.value = json.address.zipCode;

        addressP.appendChild(streetAddressElement);
        addressP.appendChild(document.createTextNode(" "));
        addressP.appendChild(cityElement);
        addressP.appendChild(document.createTextNode(", "));
        addressP.appendChild(stateElement);
        addressP.appendChild(document.createTextNode(" "));
        addressP.appendChild(zipElement);

        // --------------------------------------------------

        const emailElement = /** @type{HTMLSpanElement} */document.createElement("span");
        cp._email = new SpanElement(emailElement);
        cp.email.value = json.user.email;

        emailP.appendChild(emailElement);

        return cp;
    }

    // endregion
}