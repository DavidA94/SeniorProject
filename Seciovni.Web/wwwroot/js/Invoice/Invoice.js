class Invoice {

    // region CTOR

    constructor() {

        this._saveButton = document.getElementById("saveButton");
        this._saveButton.addEventListener('click', (e) => {
            e.preventDefault();

            postToApi("Invoice/Save", JSON.stringify(this), (xmlhttp) =>{
                if(xmlhttp === null) {
                    alert("Failed to contact server");
                    return;
                }
                if(xmlhttp.readyState == XMLHttpRequest.DONE){
                    if(xmlhttp.status === 200){
                        const response = JSON.parse(xmlhttp.response);

                        const valid = response.successful;
                        const message = response.message;

                        if(!valid){
                            alert(message);
                        }
                    }
                }
            });
        });

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
         * @type {LienHolder}
         * @private
         */
        this._lienHolder = new LienHolder(document.getElementById(INVOICE_LIEN_HOLDER_ID));

        /**
         * The payments data
         * @type {Payments}
         * @private
         */
        this._payments = new Payments(document.getElementById(INVOICE_PAYMENTS_DATA_ID));
        this._payments.subscribe(EVENT_DATA_SAVED, () => this._calculateTotal());
        this._payments.initialize();

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
        const vehicle = new Vehicle(/** @type {HTMLDivElement} */document.getElementById(VEHICLE_TEMPLATE_ID));
        vehicle.subscribe(EVENT_PROPERTY_CHANGE, this._boundLastRowChanged);
        this._vehicles.push(vehicle);

        const miscCharge = new MiscCharge(/** @type {HTMLDivElement} */document.getElementById(MISC_CHARGE_ID));
        miscCharge.subscribe(EVENT_PROPERTY_CHANGE, this._boundLastRowChanged);
        this._miscCharges.push(miscCharge);
    }

    /**
     * Initializes this class from a JSON object
     * @param {json} json - The JSON data
     */
    initialize_json(json){
        this._state.value = json.State;
        this._customer.initialize_json(json.Buyer);
        this._lienHolder.initialize_json(json.LienHolder);
        this._tax.value = json.TaxAmount;
        this._docFee.value = json.DocFee;
        this._downPayment.value = json.DownPayment;


        for(let vehicle of json.Vehicles){
            this._vehicles[this._vehicles.length - 1].initialize_json(vehicle);
        }

        for(let fee of json.Fees){
            this._miscCharges[this._miscCharges.length - 1].initialize_json(fee);
        }

        this._calculateTotal();
        this._payments.initialize_json(json.Payments);
    }

    /**
     * Gets this class as a JSON object
     * @return {Object<string, *>}
     */
    toJSON(){
        const properties = {};
        properties["State"] = this._state.value;
        properties["Buyer"] = this._customer;
        properties["LienHolder"] = this._lienHolder;
        properties["Vehicles"] = this._vehicles.slice(0, -1);  // The last element will always be empty
        properties["Fees"] = this._miscCharges.slice(0, -1);
        properties["TaxAmount"] = this._tax.value;
        properties["DocFee"] = this._docFee.value;
        properties["DownPayment"] = this._downPayment.value;
        properties["Payments"] = this._payments;

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
            Math.max(0, this._downPayment.value) - // << Subtract the total payments
            Math.max(0, this._payments.Total);

        // Add the amount for all the vehicles
        for (let v of this._vehicles) total += Math.max(0, v.Price.value);

        // Add the amount for all the miscellaneous charges
        for (let c of this._miscCharges) total += Math.max(0, c.Price.value);

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
        else if (e.propertyName === VehicleFields.price || e.propertyName === MiscChargeFields.price) {
            this._calculateTotal();
        }
        // If the VIN ensure no duplicates
        else if(e.propertyName === VehicleFields.vin){
            const vin = e.sender.VIN.value;
            e.sender.VIN.error = null;

            for(let v of this._vehicles){
                if(v !== e.sender && v.VIN.value === vin){
                    v.VIN.error = "Duplicate VIN";
                    e.sender.VIN.error = "Duplicate VIN";
                }
                else if(v !== e.sender){
                    v.VIN.error = null;
                }
            }
        }
        // If the stock number, ensure no duplicates
        else if(e.propertyName === VehicleFields.stockNum){
            const stockNum = e.sender.StockNum.value;
            e.sender.StockNum.error = null;

            for(let v of this._vehicles){
                if(v !== e.sender && v.StockNum.value === stockNum){
                    v.StockNum.error = "Duplicate VIN";
                    e.sender.StockNum.error = "Duplicate VIN";
                }
                else if(v !== e.sender){
                    v.StockNum.error = null;
                }
            }
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
            const newVehicle = new Vehicle(/** @type {HTMLDivElement} */newRow);
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
            const newCharge = new MiscCharge(/** @type {HTMLDivElement} */newRow);
            newCharge.subscribe(EVENT_PROPERTY_CHANGE, this._boundLastRowChanged);
            this._miscCharges.push(newCharge);

            this._chargeContainer.appendChild(newRow);
        }
    }

    // endregion
}

let invoice = new Invoice();
invoice.initialize();