/**
 * Created by David on 01/31/17.
 */

class MiscCharge extends SubscribableProperty {
    constructor(divRow){
        super();

        const description = "Description";
        const price = "Price";

        this.descriptionInput = null;
        this.priceInput = null;

        this.parentRow = divRow;

        const inputs = divRow.getElementsByTagName("input");

        this.boundMethods = {};
        this.boundMethods[this.fieldUpdated] = this.fieldUpdated.bind(this);

        this.inputEvent = () => this.__sendPropChangeEvent("");

        for (let i = 0; i < inputs.length; ++i) {
            const attrib = inputs[i].getAttribute(BIND_ATTRIB);

            let input = null;

            switch (attrib) {
                case description:
                    input = this.descriptionInput = new TextInput(inputs[i]);
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
    }

    areInputsEmpty(){
        return this.descriptionInput.value ==  "" &&
            this.priceInput.value == "";
    }

    destroy(){

        const fields = [
            this.descriptionInput,
            this.priceInput
        ];

        for(let field of fields) field.clearEvents();

        this.parentRow.nextElementSibling.getElementsByTagName("input")[0].focus();
        this.parentRow.remove();
    }

    get Description() {
        return this.descriptionInput.value;
    }

    set Description(value) {
        this.descriptionInput.value = value;
    }

    get Price() {
        return this.priceInput.value;
    }

    set Price(value) {
        this.priceInput.value = value;
    }
}