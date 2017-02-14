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
        const year = d.getUTCFullYear();

        let month = d.getUTCMonth() + 1;
        if(month < 10) month = "0" + month;

        let date = d.getUTCDate() + 1;
        if(date < 10) date = "0" + date;

        this.htmlObj.value = year + "-" + month + "-" + date;
    }

}