/**
 * Created by David on 02/01/17.
 */

class TextInput extends BaseHtmlElement{
    constructor(inputObj){
        super(inputObj);

        inputObj.addEventListener('change', this.__getBoundFunc(this.input_changed));
    }

    input_changed(e){
        this.value = e.currentTarget.value;
        this.__sendPropChangeEvent(e.currentTarget.getAttribute(BIND_ATTRIB));
    }

    get value() { return this.htmlObj.value; }
    set value(value) { this.htmlObj.value = value; }
}