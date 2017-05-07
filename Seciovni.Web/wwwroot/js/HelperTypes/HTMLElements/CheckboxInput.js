/**
 * Created by David on 2017-05-06.
 */

class CheckboxInput extends BaseHtmlElement {
    constructor(inputObj){
        super(inputObj);

        this.addEvent('click', this.__getBoundFunc(this._checkChanged));
    }

    get value() { return this.htmlObj.checked; }
    set value(value){
        this.htmlObj.checked = value;
        this.__sendPropChangeEvent(this.htmlObj.getAttribute(ATTRIBUTE_BIND), value);
    }

    _checkChanged(){
        this.value = this.htmlObj.checked;
    }
}