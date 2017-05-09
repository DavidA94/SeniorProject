/**
 * Created by David on 2017-02-05.
 */

class Payments extends Subscribable {
    // region CTOR

    constructor(paymentDialog){
        super();
        this.__addEvent(EVENT_DATA_SAVED);


        /**
         * @private
         * @type {function}
         */
        this._showBound = this.show.bind(this);

        /**
         * @private
         * @type {function}
         */
        this._hideBound = this.hide.bind(this);

        /**
         * The actual dialog
         * @private
         * @type {HTMLDivElement}
         */
        this._dialog = paymentDialog;

        /**
         * The total amount outside of the dialog (Updated on close_
         * @type {HTMLDivElement}
         * @private
         */
        this._totalPaymentsOuter = document.getElementById(INVOICE_TOTAL_PAYMENTS_ID);

        /**
         * The total amount inside of the dialog (Updated on Amount change)
         * @type {HTMLDivElement}
         * @private
         */
        this._totalPaymentsInner = document.getElementById(INVOICE_TOTAL_PAYMENTS_INNER_ID);

        // Subscribe to all the buttons that can be clicked
        document.getElementById(INVOICE_PAYMENTS_OPEN_ID).addEventListener('click', this._showBound);
        document.getElementById(INVOICE_PAYMENTS_CLOSE_ID).addEventListener('click', this._hideBound);

        /**
         * The payments that have been made
         * @type {Array<Payment>}
         * @private
         */
        this._payments = [];

        /**
         * The total amount of payments
         * @type {number}
         * @private
         */
        this._total = 0;

        /**
         * Holds the template to be used for each payment row
         * @type {HTMLDivElement}
         * @private
         */
        this._paymentTemplate = document.getElementById(INVOICE_PAYMENT_TEMPLATE_ID).cloneNode(true);
        this._paymentTemplate.removeAttribute("id");

        /**
         * The parent to insert new payments into
         * @type {HTMLDivElement}
         * @private
         */
        this._paymentContainer = document.getElementById(INVOICE_PAYMENT_TEMPLATE_ID).parentNode;

        /**
         * The event to fire when the last row has an element that changes
         * @type {function}
         * @private
         */
        this._boundLastRowChanged = this._lastRowChanged.bind(this);

        /**
         * The event to fire when an existing row (not the last one) has an element that changes
         * @type {function}
         * @private
         */
        this._boundExistingRowChanged = this._existingRowChanged.bind(this);

        /**
         * The event to fire when a row has `destroy()` called on it
         * @type {function}
         * @private
         */
        this._boundRowDestroyed = this._rowDestroyed.bind(this);
    }

    // endregion

    // region Public Properties

    /**
     * The total amount of payments
     * @return {number}
     */
    get Total() { return this._total; }

    // endregion

    // region Public Methods

    initialize(){
        const payment = new Payment(/** @type {HTMLDivElement} */document.getElementById(INVOICE_PAYMENT_TEMPLATE_ID));
        payment.subscribe(EVENT_PROPERTY_CHANGE, this._boundLastRowChanged);
        payment.subscribe(EVENT_OBJECT_DESTROYED, this._boundRowDestroyed);
        this._payments.push(payment);
    }

    /**
     * Initializes this class from JSON data
     * @param {JSON} payments - The array of JSON payments
     */
    initialize_json(payments){
        // Inject all of the payments
        for(let payment of payments){
            this._payments[this._payments.length - 1].initialize_json(payment);
        }

        // This also updates the amount stored
        this._totalPaymentsInner.innerHTML = this._totalPaymentsOuter.innerHTML = this._getPrettyTotal();
        this.__dispatchEvent(EVENT_DATA_SAVED, new DataSavedEventArgs(this));
    }

    /**
     * Shows the dialog
     * @param e
     */
    show(e){
        e.preventDefault();
        document.getElementById(INVOICE_PAYMENTS_CLOSE_ID).focus();

        showModalDialog(this._dialog, this._hideBound);
    }

    reset(){
        // Skip the last one -- Go backwards because an event will remove them from the list
        for(let i = this._payments.length - 2; i >= 0; --i) this._payments[i].destroy();

        this._totalPaymentsOuter.innerHTML = this._getPrettyTotal();
    }

    /**
     * Hides the dialog
     * @param e
     */
    hide(e){
        e.preventDefault();
        hideModalDialog(this._dialog, this._hideBound);

        this._totalPaymentsOuter.innerHTML = this._getPrettyTotal();
        this.__dispatchEvent(EVENT_DATA_SAVED, new DataSavedEventArgs(this));
    }

    /**
     * Gets the JSON data for this class
     * @return {Object<string, *>}
     */
    toJSON(){
        return this._payments.slice(0, -1); // The last element will always be empty
    }

    // endregion

    // region Private Methods

    /**
     * Calculates the invoice total
     * @return {string}
     * @private
     */
    _getPrettyTotal() {
        // The Math.max is used because any empty field will give -1.

        // Get the tax, doc fee, and down payment
        let total = 0;

        // Add the amount for all the vehicles
        for (let p of this._payments) total += Math.max(0, p.Amount.value);

        this._total = total;

        return "$ " + total.toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    /**
     * Fires when any row that is not the last row has something changed
     * @param e
     * @private
     */
    _existingRowChanged(e) {

        // Get the object that sent the event
        const target = e.originalTarget;

        // If it has areInputsEmpty and destroy methods, and the inputs are empty, destroy it.
        if (typeof(target.areInputsEmpty) === 'function' &&
            typeof(target.destroy) === 'function' &&
            e.propertyName !== "" &&     // Ignore 'input' events, which do not have a property name, and are used for duplication
            target.areInputsEmpty())
        {
            target.destroy();
        }

        // Otherwise, if it came from an amount object, calculate the new total
        else if (e.propertyName === PaymentFields.amount) {
            this._totalPaymentsInner.innerHTML = this._getPrettyTotal();
        }

    }

    /**
     * Fires when the last row / dummy row has something entered into it
     * @private
     */
    _lastRowChanged() {

        // Get the last row, unsubscribe this method from it, and subscribe to the existing row handler
        const lastRow = this._payments[this._payments.length - 1];
        lastRow.unsubscribe(EVENT_PROPERTY_CHANGE, this._boundLastRowChanged);
        lastRow.subscribe(EVENT_PROPERTY_CHANGE, this._boundExistingRowChanged);

        // Create a new row, and subscribe this event to it
        const newRow = this._paymentTemplate.cloneNode(true);
        const newPayment = new Payment(/** @type {HTMLDivElement} */newRow);
        newPayment.subscribe(EVENT_PROPERTY_CHANGE, this._boundLastRowChanged);
        newPayment.subscribe(EVENT_OBJECT_DESTROYED, this._boundRowDestroyed);
        this._payments.push(newPayment);

        // Append the new row to the container
        this._paymentContainer.appendChild(newRow);

        positionModalDialog(this._dialog);
    }

    /**
     * Fires when a row has its Destroy() method called
     * @param {ObjectDestroyedEventArgs} e
     * @private
     */
    _rowDestroyed(e){
        const row = /** @type{Payment} */e.originalTarget;

        this._payments.splice(this._payments.indexOf(row), 1);
    }

    // endregion
}