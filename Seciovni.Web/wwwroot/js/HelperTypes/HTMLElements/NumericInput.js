/**
 * Created by David on 02/02/17.
 */

class NumericInput extends TextInput{
    /**
     * Creates a new Numeric Input
     * @param {HTMLInputElement} input - The input element to use
     * @param {string} prefix - The prefix used when making the number pretty
     * @param {number} fixedPlaces - The number of fixed decimal places (<= 0 === ignore)
     * @param {boolean} makePretty - Indicates if commas should be put in the thousands place
     */
    constructor(input, prefix = "", fixedPlaces = 0, makePretty = true){
        super(input);

        /**
         * The actual value
         * @private
         * @type {number}
         */
        this.numberVal = -1;

        /**
         * The prefix to put before the number when making the number pretty
         * @type {string}
         * @private
         */
        this._prettyPrefix = prefix;

        /**
         * The number of numbers after the decimal point
         * @type {number}
         * @private
         */
        this._fixedPlaces = fixedPlaces;

        /**
         * Indicates if we want commas in the thousands place
         * @type {boolean}
         * @private
         */
        this._makePretty = makePretty;

        input.addEventListener("keypress", numericInput_keypress);
        input.addEventListener("focus", this.__getBoundFunc(this._makeInputEditable));
        // Not needed because TextInput sets the value, which calls this method
        // input.addEventListener("blur", this.__getBoundFunc(this._makeInputPretty));
    }

    get value() { return this.htmlObj.value == "" ? -1 : this.numberVal; }
    set value(value) {

        if(isNaN(value)) throw TypeError("Value must be a number");

        this.htmlObj.value = value;
        this.numberVal = parseFloat(value);
        this._makeInputPretty();
    }

    _makeInputEditable(){
        if(this.numberVal >= 0) this.htmlObj.value = this.numberVal;
    }

    _makeInputPretty(){
        const input = this.htmlObj;

        // Leave blank if set to as such
        if (input.value === "") {
            return;
        }

        // If we don't have a number, zero out
        if (isNaN(input.value)) {
            this.numberVal = 0;
        }

        // Get the number with a fixed amount of decimal places
        let tempVal = this.numberVal;

        // Fix the decimal points, if necessary
        if(this._fixedPlaces > 0){
            tempVal = tempVal.toFixed(this._fixedPlaces);
        }

        // Add commas and prefix
        if(this._makePretty) {
            tempVal = tempVal.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        }

        tempVal = this._prettyPrefix + tempVal;

        input.value = tempVal;
    }
}