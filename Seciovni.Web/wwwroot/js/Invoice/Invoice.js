class Invoice {
    constructor(){
        this.vehicles = [];
        this.miscCharges = [];

        this.vehicleTemplate = document.getElementById(VEHICLE_TEMPLATE_ID).cloneNode(true);
        this.vehicleTemplate.removeAttribute("id");

        this.chargeTemplate = document.getElementById(MISC_CHARGE_ID).cloneNode(true);
        this.chargeTemplate.removeAttribute("id");

        this.vehicleContainer = document.getElementById(VEHICLE_TEMPLATE_ID).parentNode;
        this.chargeContainer = document.getElementById(MISC_CHARGE_ID).parentNode;

        this.taxInput = new MoneyInput(document.getElementById(TAX_ID));
        this.docFeeInput = new MoneyInput(document.getElementById(DOC_FEE_ID));
        this.downPaymentInput = new MoneyInput(document.getElementById(DOWN_PYMT_ID));

        this.boundMethods = {};
        this.boundMethods[this.lastRowChanged] = this.lastRowChanged.bind(this);
        this.boundMethods[this.existingRowChanged] = this.existingRowChanged.bind(this);
        this.boundMethods[this.calculateTotal] = this.calculateTotal.bind(this);



        const inputsArray = [this.taxInput, this.docFeeInput, this.downPaymentInput];

        for(let moneyInput of inputsArray) {
            moneyInput.subscribe(EVENT_PROPERTY_CHANGE, this.boundMethods[this.calculateTotal]);
        }
    }

    initialize(){
        const vehicle = new Vehicle(document.getElementById(VEHICLE_TEMPLATE_ID));
        vehicle.subscribe(EVENT_PROPERTY_CHANGE, this.boundMethods[this.lastRowChanged]);
        this.vehicles.push(vehicle);

        const miscCharge = new MiscCharge(document.getElementById(MISC_CHARGE_ID));
        miscCharge.subscribe(EVENT_PROPERTY_CHANGE, this.boundMethods[this.lastRowChanged]);
        this.miscCharges.push(miscCharge);


    }

    calculateTotal(){
        let total = Math.max(0, this.taxInput.value) +
                    Math.max(0, this.docFeeInput.value) +
                    Math.max(0, this.downPaymentInput.value);


        for(let v of this.vehicles) total += Math.max(0, v.Price);
        for(let c of this.miscCharges) total += Math.max(0, c.Price);

        document.getElementById("invoiceTotalDue").innerHTML = "$ " + total.toFixed(2);
    }


    lastRowChanged(e){
        if(e.originalTarget instanceof Vehicle) {
            const lastRow = this.vehicles[this.vehicles.length - 1];
            lastRow.unsubscribe(EVENT_PROPERTY_CHANGE, this.boundMethods[this.lastRowChanged]);
            lastRow.subscribe(EVENT_PROPERTY_CHANGE, this.boundMethods[this.existingRowChanged]);

            const newRow = this.vehicleTemplate.cloneNode(true);
            const newVehicle = new Vehicle(newRow);
            newVehicle.subscribe(EVENT_PROPERTY_CHANGE, this.boundMethods[this.lastRowChanged]);
            this.vehicles.push(newVehicle);

            this.vehicleContainer.appendChild(newRow);
        }
        else if(e.originalTarget instanceof MiscCharge){
            const lastRow = this.miscCharges[this.miscCharges.length - 1];
            lastRow.unsubscribe(EVENT_PROPERTY_CHANGE, this.boundMethods[this.lastRowChanged]);
            lastRow.subscribe(EVENT_PROPERTY_CHANGE, this.boundMethods[this.existingRowChanged]);

            const newRow = this.chargeTemplate.cloneNode(true);
            const newCharge = new MiscCharge(newRow);
            newCharge.subscribe(EVENT_PROPERTY_CHANGE, this.boundMethods[this.lastRowChanged]);
            this.miscCharges.push(newCharge);

            this.chargeContainer.appendChild(newRow);
        }
    }

    existingRowChanged(e){

        const target = e.originalTarget;
        if(target instanceof Vehicle || target instanceof MiscCharge){
            if(target.areInputsEmpty()) {
                target.destroy();
            }
            else if(e.propertyName == "Price"){
                this.calculateTotal();
            }
        }
    }
}

const invoice = new Invoice();
invoice.initialize();