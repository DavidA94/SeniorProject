/**
 * Created by David on 02/02/17.
 */

class LienFields {
    static get name() { return "name"; }
    static get address() { return "address"; }
    static get ein() { return "ein"; }
}

class LienHolder {
    // region CTOR

    constructor(lienDialog){

        /**
         * @private
         * @type {function}
         */
        this._showBound = this.show.bind(this);

        /**
         * @private
         * @type {function}
         */
        this._hideBound = this.hide.bind(this);

        /**
         * The actual dialog
         * @private
         * @type {HTMLDialogElement}
         */
        this._dialog = lienDialog;

        /**
         * The place where the name is shown when the dialog is closed
         * @type {HTMLInputElement}
         * @private
         */
        this._displayName = document.getElementById("invoiceLienHolder");

        // Subscribe to all the buttons that can be clicked
        document.getElementById(OPEN_LIEN_ID).addEventListener('click', this._showBound);
        document.getElementById(CLOSE_LIEN_ID).addEventListener('click', this._hideBound);

        /**
         * @private
         * @type {BaseHtmlElement}
         */
        this._name = null;

        /**
         * @private
         * @type {Address}
         */
        this._address = new Address();

        /**
         * @private
         * @type {BaseHtmlElement}
         */
        this._ein = null;

        // Get all the elements that are to be bound
        const elements = lienDialog.querySelectorAll(BIND_QUERY);

        // Then assign them to the correct member variables
        for(let i = 0; i < elements.length; ++i){
            const attribute = elements[i].getAttribute(BIND_ATTRIB);

            let element = null;

            switch(attribute){
                case LienFields.name:
                    this._name = element = new TextInput(elements[i]);
                    break;
                case AddressFields.address:
                    this._address.StreetAddress = element = new TextInput(elements[i]);
                    break;
                case AddressFields.city:
                    this._address.City = element = new TextInput(elements[i]);
                    break;
                case AddressFields.state:
                    this._address.State = element = new TextInput(elements[i]);
                    break;
                case AddressFields.zip:
                    this._address.Zip = element = new NumericInput(elements[i], "", 0, false);
                    break;
                case LienFields.ein:
                    this._ein = element = new TextInput(elements[i]);
                    break;
            }

            // No subscription needed yet
            // input.subscribe(EVENT_PROPERTY_CHANGE, this._boundFieldUpdated);
        }
    }

    // endregion

    // region Public Properties

    /**
     * The customer's first name
     * @return {string}
     */
    get Name() { return this._name.value; }

    /**
     * The customer's first name
     * @param {string} value
     */
    set Name(value) { this._name.value = value; }

    // endregion

    // region Public Methods

    /**
     * Initializes this class from a JSON object
     * @param {json} json - The JSON data
     */
    initialize_json(json){
        if(json) {
            this._name.value = json[LienFields.name];
            this._address.initialize_json(json[LienFields.address]);
            this._ein.value = json[LienFields.ein];

            this._updatePreviewField();
        }
    }
    
    /**
     * Shows the dialog
     * @param e
     */
    show(e){
        e.preventDefault();
        document.getElementById(CLOSE_LIEN_ID).focus();

        this._dialog.show();
    }

    /**
     * Hides the dialog
     * @param e
     */
    hide(e){
        e.preventDefault();
        this._dialog.close();

        this._updatePreviewField();
    }

    reset() {
        this._name.value = "";
        this._address.StreetAddress.value = "";
        this._address.City.value = "";
        this._address.State.value = "";
        this._address.Zip.value = "";
        this._ein.value = "";
    }

    /**
     * Gets the JSON data for this class
     * @return {Object<string, *>}
     */
    toJSON(){
        const properties = {};
        properties[LienFields.name] = this._name.value;
        properties[LienFields.address] = this._address;
        properties[LienFields.ein] = this._ein.value;

        return properties;
    }

    // endregion

    // region Private Methods

    /**
     * Updates the preview field that the user sees when the dialog is closed
     * @private
     */
    _updatePreviewField(){
        this._displayName.value = this.Name;
    }

    // endregion
}