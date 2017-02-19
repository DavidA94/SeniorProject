class InvoicePreviewFields {
    static get createdDate() { return "createdDate" }
    static get modifiedDate() { return "modifiedDate" }
    static get invoiceNumber() { return "invoiceNumber" }
    static get buyerName() { return "buyerName" }
    static get invoiceTotal() { return "invoiceTotal" }
    static get totalDue() { return "totalDue" }
}

class InvoicePreview {
    // region CTOR

    constructor(){

        /**
         * @private
         * @type {BaseHtmlElement}
         */
        this._parentElement = null;

        /**
         * @private
         * @type {Date}
         */
        this._createdDate= null;

        /**
         * @private
         * @type {Date}
         */
        this._modifiedDate = null;

        /**
         * @private
         * @type {number}
         */
        this._invoiceNum = null;

        /**
         * @private
         * @type {string}
         */
        this._buyerName = null;

        /**
         * @private
         * @type {number}
         */
        this._invoiceTotal = null;

        /**
         * @private
         * @type {number}
         */
        this._totalDue = null;
    }

    // endregion

    // region Public Properties

    /**
     * The parent element
     * @return {BaseHtmlElement}
     */
    get parentElement() { return this._parentElement; }

    /**
     * The created date
     * @return {Date}
     */
    get createdDate() { return this._createdDate; }

    /**
     * The modified date
     * @return {Date}
     */
    get modifiedDate() { return this._modifiedDate; }

    /**
     * The invoice ID / number
     * @return {number}
     */
    get invoiceNum() { return this._invoiceNum; }

    /**
     * The buyer's name
     * @return {string}
     */
    get buyerName() { return this._buyerName; }

    /**
     * The invoice's total
     * @return {number}
     */
    get invoiceTotal() { return this._invoiceTotal; }

    /**
     * The total amount due on the invoice
     * @return {number}
     */
    get totalDue() { return this._totalDue; }

    // endregion

    // region Public methods

    /**
     * Initializes this object from JSON data
     * @param {json} json
     */
    initialize_json(json){
        const parent = document.createElement("tr");
        parent.tabIndex = "0";
        this._parentElement = new BaseHtmlElement(parent);
        this._modifiedDate = new Date(json[InvoicePreviewFields.modifiedDate]);

        let value;
        let td;

        td = document.createElement("td");
        this._createdDate = value = new Date(json[InvoicePreviewFields.createdDate]);
        td.innerHTML = value.getPrettyUTCDate();
        parent.appendChild(td);

        td = document.createElement("td");
        this._invoiceNum = value = json[InvoicePreviewFields.invoiceNumber];
        td.innerHTML = value;
        td.className = "right";
        parent.appendChild(td);

        td = document.createElement("td");
        this._buyerName = value = json[InvoicePreviewFields.buyerName];
        td.innerHTML = value;
        parent.appendChild(td);

        td = document.createElement("td");
        this._invoiceTotal = value = json[InvoicePreviewFields.invoiceTotal];
        td.innerHTML = prettifyNumber(value, "$ ", 2);
        td.className = "right";
        parent.appendChild(td);

        td = document.createElement("td");
        this._totalDue = value = json[InvoicePreviewFields.totalDue];
        td.innerHTML = prettifyNumber(value, "$ ", 2);
        td.className = "right";
        parent.appendChild(td);
    }

    // endregion
}