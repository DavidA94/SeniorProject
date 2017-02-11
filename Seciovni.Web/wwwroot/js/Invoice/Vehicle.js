class VehicleFields {
    static get stockNum() { return "StockNum"; }
    static get vin() { return "VIN"; }
    static get year() { return "Year"; }
    static get make() { return "Make"; }
    static get model() { return "Model"; }
    static get miles() { return "Miles"; }
    static get location() { return "Location"; }
    static get price() { return "Price"; }
}

class Vehicle extends SubscribableProperty {

    // region CTOR

    /**
     * Creates a new Vehicle object
     * @param {HTMLDivElement} divRow - The DIV element that has all of the _vehicles HTML fields
     */
    constructor(divRow) {
        super();
        this.__addEvent(EVENT_OBJECT_DESTROYED);

        /**
         * @private
         * @type {HTMLInputElement}
         */
        this._stockNum = null;

        /**
         * @private
         * @type {HTMLInputElement}
         */
        this._vin = null;

        /**
         * @private
         * @type {HTMLInputElement}
         */
        this._year = null;

        /**
         * @private
         * @type {HTMLInputElement}
         */
        this._make = null;

        /**
         * @private
         * @type {HTMLInputElement}
         */
        this._model = null;

        /**
         * @private
         * @type {HTMLInputElement}
         */
        this._miles = null;

        /**
         * @private
         * @type {HTMLInputElement}
         */
        this._location = null;

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

        // Get all the elements that can be bound to
        const elements = divRow.querySelectorAll(BIND_QUERY);

        // And put them in their proper member variable
        for (let i = 0; i < elements.length; ++i) {
            const attribute = elements[i].getAttribute(BIND_ATTRIB);

            let element = null;

            switch (attribute) {
                case VehicleFields.stockNum:
                    this._stockNum = element = new TextInput(elements[i]);
                    break;
                case VehicleFields.vin:
                    this._vin = element = new TextInput(elements[i]);
                    break;
                case VehicleFields.year:
                    this._year = element = new NumericInput(elements[i], "", 0, false);
                    break;
                case VehicleFields.make:
                    this._make = element = new TextInput(elements[i]);
                    break;
                case VehicleFields.model:
                    this._model = element = new TextInput(elements[i]);
                    break;
                case VehicleFields.miles:
                    this._miles = element = new NumericInput(elements[i]);
                    break;
                case VehicleFields.location:
                    this._location = element = new TextInput(elements[i]);
                    break;
                case VehicleFields.price:
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
    areInputsEmpty(){
        return this._stockNum.value == "" &&
            this._vin.value == "" &&
            this._model.value == "" &&
            this._miles.value == -1 &&
            this._location.value == "" &&
            this._price.value == -1;
    }

    /**
     * Destroys this object, and removes its corresponding HTML elements from the document
     */
    destroy(){

        const fields = [
            this._stockNum,
            this._vin,
            this._year,
            this._make,
            this._model,
            this._miles,
            this._location,
            this._price
        ];

        for(let field of fields) field.clearEvents();
        this._parentRow.nextElementSibling.getElementsByTagName("input")[0].focus();
        this._parentRow.remove();

        this.__dispatchEvent(EVENT_OBJECT_DESTROYED, new ObjectDestroyedEventArgs(this));
    }

    /**
     * Initializes this class from a JSON object
     * @param {json} json - The JSON data
     */
    initialize_json(json){
        this.StockNum.value = json[VehicleFields.stockNum];
        this.VIN.value = json[VehicleFields.vin];
        this.Year.value = json[VehicleFields.year];
        this.Make.value = json[VehicleFields.make];
        this.Model.value = json[VehicleFields.model];
        this.Miles.value = json[VehicleFields.miles];
        this.Location.value = json[VehicleFields.location];
        this.Price.value = json[VehicleFields.price];

        // Ensure the parent knows that something has changed.
        this.__sendPropChangeEvent("");
    }
    
    /**
     * Gets the JSON data for this class
     * @return {Object<string, *>}
     */
    toJSON(){
        const properties = {};
        properties[VehicleFields.stockNum] = this.StockNum.value;
        properties[VehicleFields.vin] = this.VIN.value;
        properties[VehicleFields.year] = this.Year.value;
        properties[VehicleFields.make] = this.Make.value;
        properties[VehicleFields.model] = this.Model.value;
        properties[VehicleFields.miles] = this.Miles.value;
        properties[VehicleFields.location] = this.Location.value;
        properties[VehicleFields.price] = this.Price.value;

        return properties;
    }

    // endregion

    // region Public Properties

    get StockNum() {
        return this._stockNum;
    }

    get VIN() {
        return this._vin;
    }

    get Year() {
        return this._year;
    }

    get Make() {
        return this._make;
    }

    get Model() {
        return this._model;
    }

    get Miles() {
        return this._miles;
    }

    get Location() {
        return this._location;
    }

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
        // Ensure the VIN is valid, and update the year and make accordingly
        if(e.propertyName == VehicleFields.vin){
            const value = this.VIN.value;

            if (value === ""){
                this._vin.error = null;
                this.Make.value = "";
                this.Year.value = "";
            }
            else if (Vehicle._validateVIN(value)) {
                this._vin.error = null;
                this.Make.value = Vehicle._getMake(value);
                this.Year.value = Vehicle._getYear(value);
            }
            else {
                this._vin.error = "Invalid VIN";
                this.Make.value = "INVALID";
                this.Year.htmlObj.value = "INVALID";
            }
        }

        this.__sendPropChangeEvent(e.propertyName);
    }

    /**
     * Gets the year for the given VIN
     * @param {string} vin - The VIN to analyze
     * @return {number}
     * @private
     */
    static _getYear(vin) {
        let year = vin[9];

        if (isNaN(year)) {
            year = year.toUpperCase().charCodeAt(0);
            if (year == 84) {
                year = 1996; //If T then 1996
            }
            else if (year >= 86 && year < 90) {
                year = year - 86 + 1997; //If V (86) then subtract that and add 1997 (Value of V) for proper year
            }
            else if (year >= 65 && year < 73) {
                year = year - 65 + 2010; // If A (65) then subtract that and add 2010 (Value of A) for proper year
            }
            else if (year >= 74 && year < 79) {
                year = year - 74 + 2018; // If J (74) then subtract that and add 2018 (Value of J) for proper year
            }
            else if (year == 80) {
                year = 2023; // If P (80) then 2023
            }
            else if (year >= 82 && year < 84) {
                year = year - 82 + 2024; // If R (82) then subtract that and add 2023 (Value of R) for proper year
            }
        }
        // Must be a number, since the above passed
        else {
            year = 2000 + parseInt(year);
        }

        return year;
    }

    /**
     * Gets the make for the given VIN
     * @param {string} vin - The VIN to be analyzed
     * @return {string}
     * @private
     */
    static _getMake(vin) {

        let make = vin.substr(1, 2).toUpperCase();

        switch (make) {
            case "AK":
            case "FU": // Freightliner
                return "Freightliner";
            case "HS": // International
                return "International";
            case "XK":
            case "WK": // Kenworth
                return "Kenworth";
            case "XP": // Peterbilt
                return "Peterbilt";
            case "V1":
            case "V2":
            case "V3":
            case "V4":
            case "VJ":
            case "VK": // Volvo
                return "Volvo";
            case "GR": // Great Dane
                return "Great Dane";
            case "L0": // Lufkin
                return "Lufkin";
            case "UY":
                return "Utility";
            case "JJ": // Wabash
                return "Wabash";
            case "1V": // Ottawa
                return "Ottawa";
            case "LM": // Capacity
                return "Capacity";
            case "P9":
                return "Pratt";
            default:
                return "UNKNOWN";
        }

    }

    /**
     * Checks if the given VIN is valid
     * @param {string} vin - The VIN to validate
     * @return {boolean}
     * @private
     */
    static _validateVIN(vin) {
        // Check check digit
        // Visit http://en.wikipedia.org/wiki/Vehicle_Identification_Number#Check_digit_calculation for more info
        const alphaNum = {
            "A": 1, "B": 2, "C": 3, "D": 4, "E": 5, "F": 6, "G": 7, "H": 8, "I": 9,
            "J": 1, "K": 2, "L": 3, "M": 4, "N": 5, "O": 6, "P": 7, "Q": 8, "R": 9,
            "S": 2, "T": 3, "U": 4, "V": 5, "W": 6, "X": 7, "Y": 8, "Z": 9,
            "0": 0, "1": 1, "2": 2, "3": 3, "4": 4, "5": 5, "6": 6, "7": 7, "8": 8, "9": 9
        };
        const posWeight = [8, 7, 6, 5, 4, 3, 2, 10, 0, 9, 8, 7, 6, 5, 4, 3, 2];
        let vinProduct = 0;

        for (let i = parseInt(0); i < 17; i++) {
            vinProduct += parseInt(alphaNum[vin[i]]) * parseInt(posWeight[i]);
        }

        let valid = vinProduct % 11;
        if (valid == 10) {
            valid = "X";
        }

        return !(vin.length < 17 || vin[8] != valid);

    }

    // endregion
}