/**
 * Created by David on 02/02/17.
 */

class LienFields {
    static get name() { return "Name"; }
    static get address() { return "StreetAddress"; }
    static get city() { return "City"; }
    static get state() { return "State"; }
    static get zip() { return "ZipCode"; }
    static get ein() { return "EIN"; }
}

class LienHolder{
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
         * @type {BaseHtmlElement}
         */
        this._address = null;

        /**
         * @private
         * @type {BaseHtmlElement}
         */
        this._city = null;

        /**
         * @private
         * @type {BaseHtmlElement}
         */
        this._state = null;

        /**
         * @private
         * @type {BaseHtmlElement}
         */
        this._zip = null;

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
                case LienFields.address:
                    this._address = element = new TextInput(elements[i]);
                    break;
                case LienFields.city:
                    this._city = element = new TextInput(elements[i]);
                    break;
                case LienFields.state:
                    this._state = element = new TextInput(elements[i]);
                    break;
                case LienFields.zip:
                    this._zip = element = new NumericInput(elements[i], "", 0, false);
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
        const zip = json[LienHolder.zip];

        this._name.value = json[LienFields.name];
        this._address.value = json[LienFields.address];
        this._city.value = json[LienFields.city];
        this._state.value = json[LienFields.state];
        this._zip.htmlObj.value = (isNaN(zip) || zip === "") ? "" : parseInt(zip);
        this._ein.value = json[LienFields.ein];

        this._updatePreviewField();
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

    /**
     * Gets the JSON data for this class
     * @return {Object<string, *>}
     */
    toJSON(){
        const properties = {};
        properties[LienFields.name] = this._name.value;
        properties[LienFields.address] = this._address.value;
        properties[LienFields.city] = this._city.value;
        properties[LienFields.state] = this._state.value;
        properties[LienFields.zip] = this._zip.htmlObj.value;
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