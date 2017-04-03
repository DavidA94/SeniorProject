/**
 * Created by David on 2017-04-02.
 */

class SearchTerm extends SubscribableProperty {
    constructor() {
        super();

        /**
         * @private
         * @type {function}
         */
        this._boundInvFieldChange = this._invFieldChange.bind(this);
        /**
         * @private
         * @type {function}
         */
        this._boundBooleanChange = this._booleanChange.bind(this);
        /**
         * @private
         * @type {function}
         */
        this._boundDestroy = this._destroy.bind(this);

        /**
         * @private
         * @type {HTMLDivElement}
         */
        this._parentElem = document.createElement("div");
        this._parentElem.className = "row";

        // ----- Create the options -----

        const invField = document.createElement("select");
        invField.className = "cell";
        invField.appendChild(document.createElement("option"));
        const optGroups = {};

        for(const field of getSearchFields()){
            if(field.type === SearchFieldType.IGNORE) continue;

            if(!optGroups[field.category]){
                optGroups[field.category] = document.createElement("optgroup");
                optGroups[field.category].label = field.category;
                invField.appendChild(optGroups[field.category]);
            }

            const optionElem = document.createElement("option");
            optionElem.innerHTML = field.display;
            optionElem.value = field.value;
            optionElem.setAttribute("data-type", field.type.toString());
            optGroups[field.category].appendChild(optionElem);
        }

        /**
         * The field to search in the invoices
         * @type {TextInput}
         * @private
         */
        this._invField = new TextInput(invField);
        this._invField.addEvent('change', this._boundInvFieldChange);

        this._parentElem.appendChild(this._invField.htmlObj);

        // ----- Create the delete image -----
        this._deleteImg = document.createElement("img");
        this._deleteImg.src = "/images/delete.png";
        this._deleteImg.alt = "";
        this._deleteImg.className = "cell deleteButton";
        this._deleteImg.addEventListener('click', this._boundDestroy);
        this._parentElem.appendChild(this._deleteImg);

        // ----- Create the search boxes -----

        /**
         * @private
         * @type {HTMLInputElement}
         */
        this._inputSearchTerm = document.createElement("input");
        this._inputSearchTerm.className = "cell";

        /**
         * @private
         * @type {HTMLInputElement}
         */
        this._inputSearchTermRange = document.createElement("input");
        this._inputSearchTermRange.className = "cell";

        /**
         * @private
         * @type {HTMLSelectElement}
         */
        this._stateSearch = SearchTerm._getStateSelect();
        this._stateSearch.className = "cell";

        /**
         * @private
         * @type {HTMLSelectElement}
         */
        this._invStateSearch = SearchTerm._getStateSelect();
        this._invStateSearch.className = "cell invoiceStateSelect";

        // ----- Create the boolean box -----

        const boolean = document.createElement("select");
        boolean.className = "cell";
        const and = document.createElement("option");
        and.value = "0";
        const or = document.createElement("option");
        or.value = "1";

        boolean.appendChild(and);
        boolean.appendChild(or);

        /**
         * @private
         * @type {NumericInput}
         */
        this._boolean = new NumericInput(boolean);
        this._boolean.addEvent('change', this._boundBooleanChange);

        // Wrappers for keeping the data good in the search terms

        /**
         * @private
         * @type {BaseHtmlElement}
         */
        this._searchTermWrapper = null;

        /**
         * @private
         * @type {BaseHtmlElement}
         */
        this._searchTermRangeWrapper = null;

    }

    /**
     * The HTML object that olds all the information this object stores
     * @return {HTMLDivElement}
     */
    get htmlObj() { return this._parentElem; }

    /**
     * The invoice field that is targeted by term
     * @return {string}
     */
    get field() { return this._invField.value; }

    /**
     * The search term
     * @return {*}
     */
    get searchTerm() {
        if(this._searchTermWrapper) return this._searchTermWrapper.value;
        return null;
    }

    /**
     * The second search term when there is a range
     * @return {*}
     */
    get searchTermRange() {
        if(this._searchTermRangeWrapper) return this._searchTermRangeWrapper.value;
        return null;
    }

    /**
     * How this relates to the next search term
     * @return {*}
     */
    get boolean() { return this._boolean.value; }

    _booleanChange(e) {
        this.__sendPropChangeEvent("boolean");
    }

    _invFieldChange(e){
        if(this._searchTermWrapper){
            this._parentElem.removeChild(this._searchTermWrapper.htmlObj);

            if(this._searchTermRangeWrapper){
                this._parentElem.removeChild(this._searchTermRangeWrapper.htmlObj);
            }
        }

        this._searchTermWrapper = null;
        this._searchTermRangeWrapper = null;

        // Send that the value has been changed
        this.__sendPropChangeEvent("field");

        // Stop if we went to nothing being selected
        if(e.currentTarget.value === "") return;

        // Get the data type of the invoice field that is selected
        const dataType = parseInt(e.currentTarget.options[e.currentTarget.selectedIndex].getAttribute("data-type"));

        // Figure out what to show the user
        switch(dataType){
            case SearchFieldType.Date:
                this._inputSearchTerm.type = "date";
                this._inputSearchTermRange.type = "date";

                this._searchTermWrapper = new DateInput(this._inputSearchTerm);
                this._searchTermRangeWrapper = new DateInput(this._inputSearchTermRange);

                this._parentElem.insertBefore(this._searchTermWrapper.htmlObj, this._deleteImg);
                this._parentElem.insertBefore(this._searchTermRangeWrapper.htmlObj, this._deleteImg);
                break;
            case SearchFieldType.InvoiceState:
                this._searchTermWrapper = new TextInput(this._invStateSearch);
                this._searchTermWrapper.value = "AZ";
                this._parentElem.insertBefore(this._searchTermWrapper.htmlObj, this._deleteImg);
                break;
            case SearchFieldType.Range:
                this._inputSearchTerm.type = "text";
                this._inputSearchTermRange.type = "text";

                this._searchTermWrapper = new NumericInput(this._inputSearchTerm);
                this._searchTermRangeWrapper = new NumericInput(this._inputSearchTermRange);

                this._parentElem.insertBefore(this._searchTermWrapper.htmlObj, this._deleteImg);
                this._parentElem.insertBefore(this._searchTermRangeWrapper.htmlObj, this._deleteImg);
                break;
            case SearchFieldType.State:
                this._searchTermWrapper = new TextInput(this._stateSearch);
                this._parentElem.insertBefore(this._searchTermWrapper.htmlObj, this._deleteImg);
                break;
            case SearchFieldType.Text:
                this._inputSearchTerm.type = "text";
                this._searchTermWrapper = new TextInput(this._inputSearchTerm);
                this._parentElem.insertBefore(this._searchTermWrapper.htmlObj, this._deleteImg);
                break;
        }

    }

    _destroy() {

    }

    static _getStateSelect(){
        const select = document.createElement("select");
        select.innerHTML =
            '<option value="AL">Alabama</option>' +
            '<option value="AK">Alaska</option>' +
            '<option value="AZ" data-invState>Arizona</option>' +
            '<option value="AR">Arkansas</option>' +
            '<option value="CA" data-invState>California</option>' +
            '<option value="CO">Colorado</option>' +
            '<option value="CT">Connecticut</option>' +
            '<option value="DE">Delaware</option>' +
            '<option value="FL">Florida</option>' +
            '<option value="GA" data-invState>Georgia</option>' +
            '<option value="HI">Hawaii</option>' +
            '<option value="ID">Idaho</option>' +
            '<option value="IL" data-invState>Illinois</option>' +
            '<option value="IN">Indiana</option>' +
            '<option value="IA">Iowa</option>' +
            '<option value="KS">Kansas</option>' +
            '<option value="KY">Kentucky</option>' +
            '<option value="LA">Louisiana</option>' +
            '<option value="ME">Maine</option>' +
            '<option value="MD">Maryland</option>' +
            '<option value="MA">Massachusetts</option>' +
            '<option value="MI">Michigan</option>' +
            '<option value="MN">Minnesota</option>' +
            '<option value="MS">Mississippi</option>' +
            '<option value="MO">Missouri</option>' +
            '<option value="MT">Montana</option>' +
            '<option value="NE">Nebraska</option>' +
            '<option value="NV">Nevada</option>' +
            '<option value="NH">New Hampshire</option>' +
            '<option value="NJ">New Jersey</option>' +
            '<option value="NM">New Mexico</option>' +
            '<option value="NY">New York</option>' +
            '<option value="NC">North Carolina</option>' +
            '<option value="ND">North Dakota</option>' +
            '<option value="OH">Ohio</option>' +
            '<option value="OK">Oklahoma</option>' +
            '<option value="OR">Oregon</option>' +
            '<option value="PA">Pennsylvania</option>' +
            '<option value="RI">Rhode Island</option>' +
            '<option value="SC">South Carolina</option>' +
            '<option value="SD">South Dakota</option>' +
            '<option value="TN">Tennessee</option>' +
            '<option value="TX">Texas</option>' +
            '<option value="UT">Utah</option>' +
            '<option value="VT">Vermont</option>' +
            '<option value="VA">Virginia</option>' +
            '<option value="WA">Washington</option>' +
            '<option value="WV">West Virginia</option>' +
            '<option value="WI">Wisconsin</option>' +
            '<option value="WY">Wyoming</option>'

        return select;
    }
}