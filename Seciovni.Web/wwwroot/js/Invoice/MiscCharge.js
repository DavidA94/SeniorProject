/**
 * Created by David on 01/31/17.
 */

class MiscChargeFields {
    static get description() { return "description"; }
    static get price() { return "price"; }
}

class MiscCharge extends SubscribableProperty {

    // region CTOR

    /**
     * Creates a new MiscCharge object
     * @param {HTMLDivElement} divRow - The DIV element that holds the miscellaneous charge inputs
     */
    constructor(divRow) {
        super();
        this.__addEvent(EVENT_OBJECT_DESTROYED);

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
                case MiscChargeFields.description:
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

    // region Public Methods

    /**
     * Checks if all the fields in this object are empty
     * @return {boolean}
     */
    areInputsEmpty() {
        return this._description.value == "" &&
            this._price.value == -1;
    }

    /**
     * Destroys this object, and removes its corresponding HTML elements from the document
     */
    destroy() {

        const fields = [
            this._description,
            this._price
        ];

        for (let field of fields) field.clearEvents();

        if(this._parentRow.nextElementSibling) this._parentRow.nextElementSibling.getElementsByTagName("input")[0].focus();
        this._parentRow.remove();

        this.__dispatchEvent(EVENT_OBJECT_DESTROYED, new ObjectDestroyedEventArgs(this));
    }

    /**
     * Initializes this class from a JSON object
     * @param {json} json - The JSON data
     */
    initialize_json(json) {
        this.Description.value = json[MiscChargeFields.description];
        this.Price.value = json[MiscChargeFields.price];
        
        // Ensure the parent knows something has changed
        this.__sendPropChangeEvent("");
    }
    
    /**
     * Gets the JSON data for this class
     * @return {Object<string, *>}
     */
    toJSON(){
        const properties = {};
        properties[MiscChargeFields.description] = this.Description.value;
        properties[MiscChargeFields.price] = this.Price.value;
        return properties;
    }

    // endregion

    // region Public Properties

    /**
     * The description for this charge
     * @return {TextInput}
     */
    get Description() {
        return this._description;
    }

    /**
     * The price for this charge
     * @return {MoneyInput}
     */
    get Price() {
        return this._price;
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