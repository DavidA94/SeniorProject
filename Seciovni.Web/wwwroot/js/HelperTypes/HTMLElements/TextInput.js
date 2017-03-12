/**
 * Created by David on 02/01/17.
 */

class TextInput extends BaseHtmlElement{
    constructor(inputObj){
        super(inputObj);
        this._lastValue = inputObj.value;

        this.addEvent('change', this.__getBoundFunc(this.input_changed));
        this.addEvent('focus', () => this._lastValue = this.value);
    }

    input_changed(e){
        this.value = e.currentTarget.value;
    }

    get value() { return this.htmlObj.value; }
    set value(value) {
        if(this.htmlObj.value !== value) {
            this.htmlObj.value = value;
            this.__sendPropChangeEvent(this.htmlObj.getAttribute(ATTRIBUTE_BIND), this._lastValue);
        }
    }
}