class Invoice {

    // region CTOR

    constructor() {

        /**
         * Holds the vehicles in this invoice
         * @type {Array<Vehicle>}
         * @private
         */
        this._vehicles = [];

        /**
         * Holds the miscellaneous charges in this invoice
         * @type {Array<MiscCharge>}
         * @private
         */
        this._miscCharges = [];

        /**
         * Holds the template to be used for each vehicle row
         * @type {HTMLDivElement}
         * @private
         */
        this._vehicleTemplate = document.getElementById(VEHICLE_TEMPLATE_ID).cloneNode(true);
        this._vehicleTemplate.removeAttribute("id");

        /**
         * Holds the template to be used for each miscellaneous charge row
         * @type {HTMLDivElement}
         * @private
         */
        this._chargeTemplate = document.getElementById(MISC_CHARGE_ID).cloneNode(true);
        this._chargeTemplate.removeAttribute("id");

        /**
         * The parent to insert new vehicles into
         * @type {HTMLDivElement}
         * @private
         */
        this._vehicleContainer = document.getElementById(VEHICLE_TEMPLATE_ID).parentNode;

        /**
         * The parent to insert new miscellaneous charges into
         * @type {HTMLDivElement}
         * @private
         */
        this._chargeContainer = document.getElementById(MISC_CHARGE_ID).parentNode;

        /**
         * The Invoice State dropdown
         * @type {TextInput}
         */
        this._state = new TextInput(document.getElementById(INVOICE_STATE_ID));

        /**
         * The Tax field
         * @type {MoneyInput}
         * @private
         */
        this._tax = new MoneyInput(document.getElementById(TAX_ID));

        /**
         * The Doc Fee field
         * @type {MoneyInput}
         * @private
         */
        this._docFee = new MoneyInput(document.getElementById(DOC_FEE_ID));

        /**
         * The Down Payment field
         * @type {MoneyInput}
         * @private
         */
        this._downPayment = new MoneyInput(document.getElementById(DOWN_PYMT_ID));

        /**
         * The customer data
         * @type {Customer}
         * @private
         */
        this._customer = new Customer(document.getElementById(INVOICE_CUSTOMER_DATA_ID));

        /**
         * The lien holder data
         * @type {Customer}
         * @private
         */
        this._lienHolder = new LienHolder(document.getElementById(INVOICE_LIEN_HOLDER_ID));

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
         * The event to fire when any of the money fields have been changed
         * @type {function}
         * @private
         */
        this._boundCalculateTotal = this._calculateTotal.bind(this);

        // Get the money inputs and subscribe to them
        const inputsArray = [this._tax, this._docFee, this._downPayment];
        for (let moneyInput of inputsArray) {
            moneyInput.subscribe(EVENT_PROPERTY_CHANGE, this._boundCalculateTotal);
        }
    }

    // endregion

    // region Public Methods

    /**
     * Initialize the default document
     */
    initialize() {
        const vehicle = new Vehicle(document.getElementById(VEHICLE_TEMPLATE_ID));
        vehicle.subscribe(EVENT_PROPERTY_CHANGE, this._boundLastRowChanged);
        this._vehicles.push(vehicle);

        const miscCharge = new MiscCharge(document.getElementById(MISC_CHARGE_ID));
        miscCharge.subscribe(EVENT_PROPERTY_CHANGE, this._boundLastRowChanged);
        this._miscCharges.push(miscCharge);
    }

    /**
     * Gets this class as a JSON object
     * @return {Object<string, *>}
     */
    toJSON(){
        var properties = {};
        properties["State"] = this._state.value;
        properties["Buyer"] = this._customer;
        properties["LienHolder"] = this._lienHolder;
        properties["Vehicles"] = this._vehicles.slice(0, -1);  // The last element will always be empty
        properties["Fees"] = this._miscCharges.slice(0, -1);
        properties["TaxAmount"] = this._tax.value;
        properties["DocFee"] = this._docFee.value;
        properties["DownPayment"] = this._downPayment.value;

        return properties;
    }

    // endregion

    // region Private Methods

    /**
     * Calculates the invoice total
     * @private
     */
    _calculateTotal() {
        // The Math.max is used because any empty field will give -1.

        // Get the tax, doc fee, and down payment
        let total = Math.max(0, this._tax.value) +
            Math.max(0, this._docFee.value) - // << Subtract the down payment
            Math.max(0, this._downPayment.value);

        // Add the amount for all the vehicles
        for (let v of this._vehicles) total += Math.max(0, v.Price);

        // Add the amount for all the miscellaneous charges
        for (let c of this._miscCharges) total += Math.max(0, c.Price);

        // Update the total
        const prettyTotal = "$ " + total.toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        document.getElementById(INVOICE_TOTAL_ID).innerHTML = prettyTotal;
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
            e.propertyName != "" &&     // Ignore 'input' events, which do not have a property name, and are used for duplication
            target.areInputsEmpty())
        {
            target.destroy();
        }

        // Otherwise, if it came from a price object, calculate the new total
        else if (e.propertyName == "Price") {
            this._calculateTotal();
        }
    }

    /**
     * Fires when the last row / dummy row has something entered into it
     * @param e
     * @private
     */
    _lastRowChanged(e) {

        // If this came from a Vehicle row
        if (e.originalTarget instanceof Vehicle) {

            // Get the last row, unsubscribe this method from it, and subscribe to the existing row handler
            const lastRow = this._vehicles[this._vehicles.length - 1];
            lastRow.unsubscribe(EVENT_PROPERTY_CHANGE, this._boundLastRowChanged);
            lastRow.subscribe(EVENT_PROPERTY_CHANGE, this._boundExistingRowChanged);

            // Create a new row, and subscribe this event to it
            const newRow = this._vehicleTemplate.cloneNode(true);
            const newVehicle = new Vehicle(newRow);
            newVehicle.subscribe(EVENT_PROPERTY_CHANGE, this._boundLastRowChanged);
            this._vehicles.push(newVehicle);

            // Append the new row to the container
            this._vehicleContainer.appendChild(newRow);
        }
        // Otherwise, if it's from miscellaneous charge
        else if (e.originalTarget instanceof MiscCharge) {
            // Ditto as if, but for a MiscCharge instead
            const lastRow = this._miscCharges[this._miscCharges.length - 1];
            lastRow.unsubscribe(EVENT_PROPERTY_CHANGE, this._boundLastRowChanged);
            lastRow.subscribe(EVENT_PROPERTY_CHANGE, this._boundExistingRowChanged);

            const newRow = this._chargeTemplate.cloneNode(true);
            const newCharge = new MiscCharge(newRow);
            newCharge.subscribe(EVENT_PROPERTY_CHANGE, this._boundLastRowChanged);
            this._miscCharges.push(newCharge);

            this._chargeContainer.appendChild(newRow);
        }
    }

    // endregion
}

const invoice = new Invoice();
invoice.initialize();