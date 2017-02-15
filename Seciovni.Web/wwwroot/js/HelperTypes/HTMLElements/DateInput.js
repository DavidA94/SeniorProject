/**
 * Created by David on 2017-02-13.
 */

class DateInput extends TextInput {
    constructor(inputObj){
        super(inputObj);
    }

    get value() { return this.htmlObj.value; }
    set value(value) {
        if(/^\d{4}-\d{2}-\d{2}$/.test(value)){
            this.htmlObj.value = value;
            return;
        }

        const d = new Date(value);
        this.htmlObj.value = d.getPrettyUTCDate();
    }
}