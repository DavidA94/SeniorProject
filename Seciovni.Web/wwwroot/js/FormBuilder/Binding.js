/**
 * Created by David on 2017-02-25.
 */

class Binding {
    /**
     * Creates a new Binding object
     * @param {string} id - The identifier for the field to be bound
     * @param {BindingContext} bindingContext - What context this binding is being used in
     */
    constructor(id, bindingContext){
        this._id = id;

        const options = getBindingOptions(bindingContext);

        const select = document.createElement("select");
        const none = document.createElement("option");
        none.innerHTML = "";
        none.value = "";
        select.appendChild(none);

        const optGroups = {};

        for(const option of options){
            if(!optGroups[option.category]){
                optGroups[option.category] = document.createElement("optgroup");
                optGroups[option.category].label = option.category;
                select.appendChild(optGroups[option.category]);
            }

            const optionElem = document.createElement("option");
            optionElem.innerHTML = option.display;
            optionElem.value = option.value;
            optGroups[option.category].appendChild(optionElem);
        }

        // Select and Text work the same for getting / setting the value, so this works fine
        /**
         * The options to be used
         * @type {TextInput}
         * @private
         */
        this._select = new TextInput(select);
    }

    /**
     * The ID of the binding
     * @return {string}
     */
    get id() { return this._id; }

    /**
     * The options element
     * @return {TextInput}
     */
    get options() { return this._select; }

    get value() { return this._select.value; }
    set value(value) { this._select.value = value; }

    destroy(){
        this._select.clearEvents();
        this._select.htmlObj.parentNode.removeChild(this._select.htmlObj);
    }
}