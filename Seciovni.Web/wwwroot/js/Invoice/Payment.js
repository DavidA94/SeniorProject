/**
 * Created by David on 2017-02-05.
 */

class PaymentFields {
    static get date() { return "date"; }
    static get description() { return "description"; }
    static get amount() { return "amount"; }
}

class Payment extends SubscribableProperty {

    // region CTOR

    /**
     * Creates a new Payment object
     * @param {HTMLDivElement} divRow - The DIV element that holds the payment inputs
     */
    constructor(divRow){
        super();
        this.__addEvent(EVENT_OBJECT_DESTROYED);

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
        this._amount = null;

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
            const attribute = elements[i].getAttribute(ATTRIBUTE_BIND);

            let element = null;

            switch (attribute) {
                case PaymentFields.date:
                    this._date = element = new DateInput(elements[i]);
                    break;
                case PaymentFields.description:
                    this._description = element = new TextInput(elements[i]);
                    break;
                case PaymentFields.amount:
                    this._amount = element = new MoneyInput(elements[i]);
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
     * The payment's amount
     * @return {MoneyInput}
     */
    get Amount() { return this._amount; }

    // endregion

    // region Public Methods

    /**
     * Checks if all the fields in this object are empty
     * @return {boolean}
     */
    areInputsEmpty() {
        return this._date.value === "" &&
            this._description.value === "" &&
            this._amount.value === -1;
    }

    /**
     * Destroys this object, and removes its corresponding HTML elements from the document
     */
    destroy() {

        const fields = [
            this._date,
            this._description,
            this._amount
        ];

        for (let field of fields) field.clearEvents();

        if(this._parentRow.nextElementSibling) this._parentRow.nextElementSibling.getElementsByTagName("input")[0].focus();
        this._parentRow.remove();

        this.__dispatchEvent(EVENT_OBJECT_DESTROYED, new ObjectDestroyedEventArgs(this));
    }

    /**
     * Initializes this class from a JSON object
     * @param {JSON} json - The JSON data
     */
    initialize_json(json) {
        this.Date.value = json[PaymentFields.date];
        this.Description.value = json[PaymentFields.description];
        this.Amount.value = json[PaymentFields.amount];

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
        properties[PaymentFields.amount] = this.Amount.value;
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