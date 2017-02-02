/**
 * Created by David on 02/01/17.
 */

class MoneyInput extends TextInput{
    constructor(input){
        super(input);

        /**
         * The actual value
         * @private
         * @type {number}
         */
        this.moneyVal = -1;

        input.addEventListener("focus", this.__getBoundFunc(this._makeMoneyInputEditable));
        input.addEventListener("blur", this.__getBoundFunc(this._makeMoneyInputPretty));
        input.addEventListener("keypress", numricInput_keypress);
    }

    get value() { return this.htmlObj.value == "" ? "" : this.moneyVal; }
    set value(value) {

        if(isNaN(value)) throw TypeError("Value must be a number");

        this.htmlObj.value = value;
        this.moneyVal = parseFloat(value);
    }

    /**
     * Makes the money input be in the form of $ 0.00
     * @private
     */
    _makeMoneyInputPretty(){

        const input = this.htmlObj;

        // Leave blank if set to as such
        if (input.value === "") {
            return;
        }

        // If we don't have a number, zero out
        if (isNaN(input.value)) {
            this.moneyVal = 0;
        }

        // Make the pretty value
        input.value = "$ " + parseFloat(this.moneyVal).toFixed(2);
    }

    /**
     * Makes the money input be just the number, without the $
     * @private
     */
    _makeMoneyInputEditable() {
        if(this.moneyVal >= 0) this.htmlObj.value = this.moneyVal;
    }
}