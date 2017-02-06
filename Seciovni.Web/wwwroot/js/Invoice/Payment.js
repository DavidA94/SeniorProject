/**
 * Created by David on 2017-02-05.
 */

class PaymentFields {
    static get date() { return "Date"; }
    static get description() { return "Description"; }
    static get price() { return "Price"; }
}

class Payment extends SubscribableProperty {

    // region CTOR

    /**
     * Creates a new Payment object
     * @param {HTMLDivElement} divRow - The DIV element that holds the payment inputs
     */
    constructor(divRow){
        super();

        /**
         * @private
         * @type {HTMLInputElement}
         */
        this._date = null;

        /**
         * @private
         * @type {HTMLInputElement}
         */
        this._description = null;

        /**
         * @private
         * @type {HTMLInputElement}
         */
        this._price = null;

        /**
         * @private
         * @type {HTMLDivElement}
         */
        this._parentRow = divRow;

        /**
         * The event to fire when one of the fields fires it PropertyChanged event
         * @type {function}
         * @private
         */
        this._boundFieldUpdated = this._fieldUpdated.bind(this);

        /**
         * The event fired when the 'input' event is fired on any of the fields
         * @type {function}
         * @private
         */
        this._inputEvent = () => this.__sendPropChangeEvent("");

        /**
         * The event fired when the keydown event is gotten
         * @param e
         * @private
         */
        this._keydownEvent = (e) => invoice_keydown(e, this._parentRow, this);

        // Get all the elements that have the bind attribute
        const elements = divRow.querySelectorAll(BIND_QUERY);

        // Get all the elements and remember them
        for (let i = 0; i < elements.length; ++i) {
            const attribute = elements[i].getAttribute(BIND_ATTRIB);

            let element = null;

            switch (attribute) {
                case PaymentFields.date:
                    this._date = element = new TextInput(elements[i]);
                    break;
                case PaymentFields.description:
                    this._description = element = new TextInput(elements[i]);
                    break;
                case MiscChargeFields.price:
                    this._price = element = new MoneyInput(elements[i]);
                    break;
            }

            // Subscribe to when they change, and subscribe to the input event
            element.subscribe(EVENT_PROPERTY_CHANGE, this._boundFieldUpdated);
            element.addEvent('input', this._inputEvent);
            element.addEvent('keydown', this._keydownEvent);
        }
    }

    // endregion

    // region Public Properties

    /**
     * The payments date
     * @return {TextInput}
     */
    get Date() { return this._date; }

    /**
     * The payment's description
     * @return {TextInput}
     */
    get Description() { return this._description; }

    /**
     * The payment's price
     * @return {MoneyInput}
     */
    get Price() { return this._price; }

    // endregion

    // region Public Methods

    /**
     * Checks if all the fields in this object are empty
     * @return {boolean}
     */
    areInputsEmpty() {
        return this._date.value == "" &&
            this._description.value == "" &&
            this._price.value == -1;
    }

    /**
     * Destroys this object, and removes its corresponding HTML elements from the document
     */
    destroy() {

        const fields = [
            this._date,
            this._description,
            this._price
        ];

        for (let field of fields) field.clearEvents();

        this._parentRow.nextElementSibling.getElementsByTagName("input")[0].focus();
        this._parentRow.remove();
    }

    /**
     * Initializes this class from a JSON object
     * @param {json} json - The JSON data
     */
    initialize_json(json) {
        this.Date.value = json[PaymentFields.date];
        this.Description.value = json[MiscChargeFields.description];
        this.Price.value = json[PaymentFields.price];

        // Ensure the parent knows something has changed
        this.__sendPropChangeEvent("");
    }

    /**
     * Gets the JSON data for this class
     * @return {Object<string, *>}
     */
    toJSON(){
        const properties = {};
        properties[PaymentFields.date] = this.Date.value;
        properties[PaymentFields.description] = this.Description.value;
        properties[PaymentFields.price] = this.Price.value;
        return properties;
    }

    // endregion

    // region Private Methods

    /**
     * Fires when one of the fields is updated
     * @param e
     * @private
     */
    _fieldUpdated(e) {
        this.__sendPropChangeEvent(e.propertyName);
    }

    // endregion
}