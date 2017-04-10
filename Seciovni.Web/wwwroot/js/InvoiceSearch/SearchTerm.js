/**
 * Created by David on 2017-04-02.
 */

class SearchTermFields {
    static get invField() { return "invoiceField"; }
    static get term() { return "term"; }
    static get termRange() { return "termRange"; }
}

class SearchTerm extends SubscribableProperty {
    // region CTOR

    constructor() {
        super();

        this.__addEvent(EVENT_OBJECT_DESTROYED);

        /**
         * @private
         * @type {function}
         */
        this._boundInvFieldChange = this._invFieldChange.bind(this);
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
        invField.className = "cell searchFieldCol";

        const blank = document.createElement("option");
        blank.hidden = true;
        blank.disabled = true;
        blank.selected = true;
        invField.appendChild(blank);
        const optGroups = {};

        for (const field of getSearchFields()) {
            if (field.type === SearchFieldType.IGNORE) continue;

            if (!optGroups[field.category]) {
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
        this._invField.subscribe(EVENT_PROPERTY_CHANGE, this._boundInvFieldChange);

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
         * @type {TextInput}
         */
        this._stateSearch = new TextInput(SearchTerm._getStateSelect());
        this._stateSearch.htmlObj.className = "cell";

        /**
         * @private
         * @type {TextInput}
         */
        this._invStateSearch = new TextInput(SearchTerm._getStateSelect());
        this._invStateSearch.htmlObj.className = "cell invoiceStateSelect";
        this._invStateSearch.value = "AZ";

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

        this._throughDash = document.createElement("span");
        this._throughDash.className = "cell throughDash";
        this._throughDash.innerHTML = " &ndash; ";
    }

    // endregion

    // region Public Properties

    /**
     * The invoice field that is targeted by term
     * @return {string}
     */
    get field() {
        return this._invField.value;
    }

    get fieldUIValue() {
        return this._invField.htmlObj.options[this._invField.htmlObj.selectedIndex].text;
    }

    /**
     * The HTML object that olds all the information this object stores
     * @return {HTMLDivElement}
     */
    get htmlObj() {
        return this._parentElem;
    }

    /**
     * The search term
     * @return {*}
     */
    get searchTerm() {
        if (this._searchTermWrapper) return this._searchTermWrapper.value;
        return null;
    }

    /**
     * The second search term when there is a range
     * @return {*}
     */
    get searchTermRange() {
        if (this._searchTermRangeWrapper) return this._searchTermRangeWrapper.value;
        return null;
    }

    // endregion

    // region Public Methods

    toJSON() {
        const properties = {};
        properties[SearchTermFields.invField] = this._invField.value;

        if (this._searchTermWrapper){
            properties[SearchTermFields.term] = SearchTerm._getRealValue(this._searchTermWrapper);
        }
        if (this._searchTermRangeWrapper){
            properties[SearchTermFields.termRange] = SearchTerm._getRealValue(this._searchTermRangeWrapper);
        }

        return properties;
    }

    toURL() {
        if (this._invField.value === "") return null;

        const field = SearchTerm._encodeToURL(this._invField);
        const term = this._searchTermWrapper ? SearchTerm._encodeToURL(this._searchTermWrapper) : "";
        const termRange = this._searchTermRangeWrapper ? SearchTerm._encodeToURL(this._searchTermRangeWrapper) : "";

        return field + "``" +
            term + "``" +
            termRange;
    }

    static fromURL(urlVal) {
        const parts = urlVal.split(/``/g);
        const term = new SearchTerm();


        if (parts[0] === "") return term;

        term._invField.value = SearchTerm._decodeFromURL(parts[0]);

        // Need to do this so the wrappers will be made
        setTimeout(() => {
            term._searchTermWrapper.value = SearchTerm._decodeFromURL(parts[1]);
            if (term._searchTermRangeWrapper) term._searchTermRangeWrapper.value = SearchTerm._decodeFromURL(parts[2]);
        }, 250);

        return term;
    }


    // endregion

    // region Private Methods

    /**
     * Gets the value ready to be used in the URL
     * @param {BaseHtmlElement} elem - The HTML element to get the value from
     * @return {string}
     * @private
     */
    static _encodeToURL(elem) {
        return encodeURI(SearchTerm._getRealValue(elem).toString().replace(/`/g, "\\`"));
    }

    /**
     * Gets the value ready to be used when coming from a URL
     * @param {string} value - The value to be decoded
     * @return {string}
     * @private
     */
    static _decodeFromURL(value) {
        return decodeURI(value).replace(/\\`/g, "`");
    }

    /**
     * Takes care of converting empty number fields to "" instead of -1
     * @param {BaseHtmlElement} elem - The element to get the value of
     * @private
     */
    static _getRealValue(elem){
        if(elem instanceof NumericInput && elem.value < 0){
            return "";
        }
        return elem.value;
    }

    /**
     * Creates a new input to be used for keeping the input
     * @param {SearchFieldType} dataType - The type of input to get
     * @return {BaseHtmlElement}
     * @private
     */
    static _getInput(dataType) {
        const input = /** @type {HTMLInputElement} */document.createElement("input");
        input.type = "text";
        input.className = "cell";

        switch (dataType) {
            case SearchFieldType.Date:
                input.type = "date";
                return new DateInput(input);
            case SearchFieldType.Money:
                return new NumericInput(input, "$ ", 2);
            case SearchFieldType.Number:
                return new NumericInput(input, "", 0, false);
            case SearchFieldType.Range:
                return new NumericInput(input);
            case SearchFieldType.Text:
                return new TextInput(input);
        }
    }

    /**
     * Gets the select element with all the states in it
     * @return {HTMLSelectElement}
     * @private
     */
    static _getStateSelect() {
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

    /**
     * Destroys the object when the X button is clicked
     * @private
     */
    _destroy() {
        this._destroySearchTerms();
        this._deleteImg.removeEventListener('click', this._boundDestroy);
        this._invField.clearEvents();

        this._parentElem.remove();

        this.__dispatchEvent(EVENT_OBJECT_DESTROYED, new ObjectDestroyedEventArgs(this));
    }

    /**
     * Kills all the search terms so nothing is left on the page, and unsubscribes from everythihng
     * @private
     */
    _destroySearchTerms() {
        if (this._searchTermWrapper) {
            this._throughDash.remove();

            this._parentElem.removeChild(this._searchTermWrapper.htmlObj);

            this._searchTermWrapper.clearEvents();
            this._searchTermWrapper = null;

            if (this._searchTermRangeWrapper) {
                this._parentElem.removeChild(this._searchTermRangeWrapper.htmlObj);

                this._searchTermRangeWrapper.clearEvents();
                this._searchTermRangeWrapper = null;
            }
        }
    }

    /**
     * Fires when search field dropdown changes
     * @private
     */
    _invFieldChange() {
        // Kill any current search terms
        this._destroySearchTerms();

        // Send that the value has been changed
        this.__sendPropChangeEvent("field");

        // Stop if we went to nothing being selected
        if (this._invField.value === "") return;

        // Get the data type of the invoice field that is selected
        const dataType = parseInt(this._invField.htmlObj.options[this._invField.htmlObj.selectedIndex].getAttribute("data-type"));

        // Figure out what to show the user
        switch (dataType) {
            case SearchFieldType.InvoiceState:
                this._searchTermWrapper = this._invStateSearch;
                this._parentElem.insertBefore(this._searchTermWrapper.htmlObj, this._deleteImg);
                break;
            case SearchFieldType.State:
                this._searchTermWrapper = this._stateSearch;
                this._parentElem.insertBefore(this._searchTermWrapper.htmlObj, this._deleteImg);
                break;
            case SearchFieldType.Date:
            case SearchFieldType.Money:
            case SearchFieldType.Number:
            case SearchFieldType.Range:
                this._searchTermWrapper = SearchTerm._getInput(dataType);
                this._searchTermRangeWrapper = SearchTerm._getInput(dataType);

                this._parentElem.insertBefore(this._searchTermWrapper.htmlObj, this._deleteImg);
                this._parentElem.insertBefore(this._throughDash, this._deleteImg);
                this._parentElem.insertBefore(this._searchTermRangeWrapper.htmlObj, this._deleteImg);
                break;
            case SearchFieldType.Text:
                this._searchTermWrapper = SearchTerm._getInput(dataType);
                this._parentElem.insertBefore(this._searchTermWrapper.htmlObj, this._deleteImg);
                break;
        }
    }

    // endregion
}