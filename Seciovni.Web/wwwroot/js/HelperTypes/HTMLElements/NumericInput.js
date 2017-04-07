/**
 * Created by David on 02/02/17.
 */

class NumericInput extends TextInput{
    /**
     * Creates a new Numeric Input
     * @param {HTMLInputElement} input - The input element to use
     * @param {string|null} prefix - The prefix used when making the number pretty
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
         * @type {string|null}
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

        /**
         * Indicates if the input has already been prettified
         * @type {boolean}
         */
        this._isPretty = false;

        input.addEventListener("keypress", numericInput_keypress);
        input.addEventListener("focus", this.__getBoundFunc(this._makeInputEditable));
        input.addEventListener("blur", this.__getBoundFunc(this._makeInputPretty));
    }

    get value() { return this.htmlObj.value == "" ? -1 : this.numberVal; }
    set value(value) {

        if(isNaN(value)) throw TypeError("Value must be a number");

        this.htmlObj.value = value;
        this.numberVal = parseFloat(value);
        this._isPretty = false;
        this._makeInputPretty();
        this.__sendPropChangeEvent(this.htmlObj.getAttribute(ATTRIBUTE_BIND));
    }

    _makeInputEditable(){
        if(this.numberVal >= 0) this.htmlObj.value = this.numberVal;
        this._isPretty = false;
        if(typeof(this.htmlObj.select) === 'function') this.htmlObj.select();
    }

    _makeInputPretty(){
        const input = this.htmlObj;

        // Leave blank if set to as such, or don't do anything if it's already been prettified
        if (input.value === "" || this._isPretty) {
            return;
        }

        // If we don't have a number, zero out
        if (isNaN(input.value)) {
            this.numberVal = 0;
        }

        // Get the number with a fixed amount of decimal places
        let tempVal = this.numberVal;

        // If zero, and the prefix is null, then make it be displayed as "-"
        if(tempVal === 0 && this._prettyPrefix === null){
            input.value = "-";
            return;
        }

        // Fix the decimal points, if necessary
        if(this._fixedPlaces > 0){
            tempVal = tempVal.toFixed(this._fixedPlaces);
        }

        // Add commas and prefix
        if(this._makePretty) {
            tempVal = tempVal.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        }

        // Add the prefix if there is one
        if(this._prettyPrefix) tempVal = this._prettyPrefix + tempVal;

        input.value = tempVal;
        this._isPretty = true;
    }
}