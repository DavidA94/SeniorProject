class Vehicle extends SubscribableProperty {
    constructor(divRow) {
        super();
        const stockNum = "StockNum";
        const vin = "VIN";
        const year = "Year";
        const make = "Make";
        const model = "Model";
        const miles = "Miles";
        const location = "Location";
        const price = "Price";

        this.stockNumInput = null;
        this.vinInput = null;
        this.yearInput = null;
        this.makeInput = null;
        this.modelInput = null;
        this.milesInput = null;
        this.locationInput = null;
        this.priceInput = null;

        this.boundMethods = {};
        this.boundMethods[this.fieldUpdated] = this.fieldUpdated.bind(this);

        this.inputEvent = () => this.__sendPropChangeEvent("");

        this.parentRow = divRow;

        const inputs = divRow.getElementsByTagName("input");

        for (let i = 0; i < inputs.length; ++i) {
            const attrib = inputs[i].getAttribute(BIND_ATTRIB);

            let input = null;

            switch (attrib) {
                case stockNum:
                    input = this.stockNumInput = new TextInput(inputs[i]);
                    break;
                case vin:
                    input = this.vinInput = new TextInput(inputs[i]);
                    break;
                case year:
                    input = this.yearInput = new TextInput(inputs[i]);
                    break;
                case make:
                    input = this.makeInput = new TextInput(inputs[i]);
                    break;
                case model:
                    input = this.modelInput = new TextInput(inputs[i]);
                    break;
                case miles:
                    input = this.milesInput = new TextInput(inputs[i]);
                    break;
                case location:
                    input = this.locationInput = new TextInput(inputs[i]);
                    break;
                case price:
                    input = this.priceInput = new MoneyInput(inputs[i]);
                    break;
            }

            input.subscribe(EVENT_PROPERTY_CHANGE, this.boundMethods[this.fieldUpdated]);
            input.addEvent('input', this.inputEvent);
        }
    }

    fieldUpdated(e) {
        this.__sendPropChangeEvent(e.propertyName);

        if(e.propertyName == "VIN"){
            const value = this.VIN;

            if (value === ""){
                this.vinInput.htmlObj.removeAttribute(ERROR_ATTRIB);
                this.Make = "";
                this.Year = "";
            }
            else if (this.validateVIN(value)) {
                this.vinInput.htmlObj.removeAttribute(ERROR_ATTRIB);
                this.Make = this.getMake(value);
                this.Year = this.getYear(value);
            }
            else {
                this.vinInput.htmlObj.setAttribute(ERROR_ATTRIB, "");
                this.Make = "INVALID";
                this.Year = "INVALID";
            }
        }
    }

    areInputsEmpty(){
        return this.stockNumInput.value == "" &&
            this.vinInput.value == "" &&
            this.modelInput.value == "" &&
            this.milesInput.value == "" &&
            this.locationInput.value == "" &&
            this.priceInput.value == "";
    }

    destroy(){

        const fields = [
            this.stockNumInput,
            this.vinInput,
            this.yearInput,
            this.makeInput,
            this.modelInput,
            this.milesInput,
            this.locationInput,
            this.priceInput
        ];

        for(let field of fields) field.clearEvents();
        this.parentRow.nextElementSibling.getElementsByTagName("input")[0].focus();
        this.parentRow.remove();
    }

    get StockNum() {
        return this.stockNumInput.value;
    }

    set StockNum(value) {
        this.stockNumInput.value = value;
    }

    get VIN() {
        return this.vinInput.value;
    }

    set VIN(value) {
        this.vinInput.value = value;
    }

    get Year() {
        return this.yearInput.value;
    }

    set Year(value) {
        this.yearInput.value = value;
    }

    get Make() {
        return this.makeInput.value;
    }

    set Make(value) {
        this.makeInput.value = value;
    }

    get Model() {
        return this.modelInput.value;
    }

    set Model(value) {
        this.modelInput.value = value;
    }

    get Miles() {
        return this.milesInput.value;
    }

    set Miles(value) {
        this.milesInput.value = value;
    }

    get Location() {
        return this.locationInput.value;
    }

    set Location(value) {
        this.locationInput.value = value;
    }

    get Price() {
        return this.priceInput.value;
    }

    set Price(value) {
        this.priceInput.value = value;
    }


    getYear(vin) {
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

    getMake(vin) {

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

    validateVIN(vin) {
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
}