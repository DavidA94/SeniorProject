/**
 * Created by David on 02/02/17.
 */

class CustomerFields {
    static get customerID() { return "customerID"; }
    static get user() { return "user"; }
    static get address() { return "address"; }
    static get primaryPhone() { return "primaryPhone"; }
    static get cellPhone() { return "cellPhone"; }
    static get homePhone() { return "homePhone"; }
    static get workPhone() { return "workPhone"; }
    static get company() { return "companyName"; }
    static get licenseNum() { return "dealerLicenseNumber"; }
    static get mcNum() { return "mcNumber"; }
    static get resaleNum() { return "resaleNumber"; }
}

class Customer {

    // region CTOR

    constructor(customerDialog){

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
         * @private
         * @type {function}
         */
        this._swapBound = this.swap.bind(this);

        /**
         * @private
         * @type {function}
         */
        this._searchBound = this._search.bind(this);

        /**
         * @private
         * @type {function}
         */
        this._keyReleasedBound = this._keyReleased.bind(this);


        /**
         * @private
         * @type {function}
         */
        this._boundFieldUpdated = this._fieldUpdated.bind(this);

        /**
         * The actual dialog
         * @private
         * @type {HTMLDialogElement}
         */
        this._dialog = customerDialog;

        this._enterKeyPressedFunc = this._hideBound;
        this._escKeyPressedFunc = this._hideBound;


        /**
         * The place where the name is shown when the dialog is closed
         * @type {HTMLInputElement}
         * @private
         */
        this._displayName = document.getElementById("invoiceCustomer");

        // Subscribe to all the buttons that can be clicked
        document.getElementById(INVOICE_CUSTOMER_OPEN_ID).addEventListener('click', this._showBound);
        document.getElementById(INVOICE_CUSTOMER_CLOSE_ID).addEventListener('click', this._hideBound);
        document.getElementById(INVOICE_CUSTOMER_SHOW_CONTACTS_ID).addEventListener('click', this._swapBound);
        document.getElementById(INVOICE_SHOW_CUSTOM_ID).addEventListener('click', this._swapBound);

        // Setup Searching
        document.getElementById(INVOICE_CONTACTS_SEARCH_INPUT_ID).addEventListener('input', this._searchBound);


        /**
         * Used for knowing which contact to select when loading data from the server
         * @type {number}
         * @private
         */
        this._chosenContactID = -1;

        /**
         * The chosen contact
         * @type {CustomerPreview}
         * @private
         */
        this._chosenContact = null;

        /**
         * The customers that have been loaded from the server
         * @type {Array<CustomerPreview>}
         * @private
         */
        this._loadedContacts = [];

        /**
         * Indicates if we're currently showing contacts or contacts
         * @type {boolean}
         * @private
         */
        this._showingContacts = true;

        /**
         * @private
         * @type {User}
         */
        this._user = new User();

        /**
         * @private
         * @type {Address}
         */
        this._address = new Address();

        /**
         * @private
         * @type {BaseHtmlElement}
         */
        this._primaryPhone = null;

        /**
         * @private
         * @type {BaseHtmlElement}
         */
        this._homePhone = null;

        /**
         * @private
         * @type {BaseHtmlElement}
         */
        this._cellPhone = null;

        /**
         * @private
         * @type {BaseHtmlElement}
         */
        this._workPhone = null;

        /**
         * @private
         * @type {BaseHtmlElement}
         */
        this._company = null;

        /**
         * @private
         * @type {BaseHtmlElement}
         */
        this._licenseNum = null;

        /**
         * @private
         * @type {BaseHtmlElement}
         */
        this._mcNum = null;

        /**
         * @private
         * @type {BaseHtmlElement}
         */
        this._resaleNum = null;

        // Get all the bindings, and then assign them to the right fields
        const elements = customerDialog.querySelectorAll(BIND_QUERY);

        // And then assign them to the proper member variables
        for(let i = 0; i < elements.length; ++i){
            const attribute = elements[i].getAttribute(ATTRIBUTE_BIND);

            let element = null;

            switch(attribute){
                case UserFields.firstName:
                    this._user.FirstName = element = new TextInput(elements[i]);
                    break;
                case UserFields.lastName:
                    this._user.LastName = element = new TextInput(elements[i]);
                    break;
                case UserFields.email:
                    this._user.Email = element = new TextInput(elements[i]);
                    break;
                case CustomerFields.primaryPhone:
                    this._primaryPhone = element = new TextInput(elements[i]);
                    break;
                case CustomerFields.cellPhone:
                    this._cellPhone = element = new TextInput(elements[i]);
                    break;
                case CustomerFields.homePhone:
                    this._homePhone = element = new TextInput(elements[i]);
                    break;
                case CustomerFields.workPhone:
                    this._workPhone = element = new TextInput(elements[i]);
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
                case CustomerFields.company:
                    this._company = element = new TextInput(elements[i]);
                    break;
                case CustomerFields.licenseNum:
                    this._licenseNum = element = new TextInput(elements[i]);
                    break;
                case CustomerFields.mcNum:
                    this._mcNum = element = new TextInput(elements[i]);
                    break;
                case CustomerFields.resaleNum:
                    this._resaleNum = element = new TextInput(elements[i]);
                    break;
            }

            // Subscribe to when the fields are updated
            element.subscribe(EVENT_PROPERTY_CHANGE, this._boundFieldUpdated);
        }
    }

    // endregion

    // region Public Methods

    /**
     * Hides the dialog
     * @param e
     */
    hide(e){
        e.preventDefault();
        hideModalDialog(this._dialog, this._hideBound);
        this._updatePreviewField();
    }

    /**
     * Initializes this class from a JSON object
     * @param {json} json - The JSON data
     */
    initialize_json(json){

        if (json.hasOwnProperty(CustomerFields.customerID) &&
            json[CustomerFields.customerID] &&
            json[CustomerFields.customerID] > 0) {
            this._chosenContactID = json[CustomerFields.customerID];
            this._getContactPreviews();
        }
        else {
            this._user.initialize_json(json[CustomerFields.user]);
            this._address.initialize_json(json[CustomerFields.address]);
            this._primaryPhone.value = json[CustomerFields.primaryPhone];
            this._company.value = json[CustomerFields.company];
            this._licenseNum.value = json[CustomerFields.licenseNum];
            this._mcNum.value = json[CustomerFields.mcNum];
            this._resaleNum.value = json[CustomerFields.resaleNum];

            if(json[CustomerFields.cellPhone]) this._cellPhone.value = json[CustomerFields.cellPhone];
            if(json[CustomerFields.homePhone]) this._homePhone.value = json[CustomerFields.homePhone];
            if(json[CustomerFields.workPhone]) this._workPhone.value = json[CustomerFields.workPhone];

            this.swap(new Event(""));
            this._updatePreviewField();
        }
    }

    /**
     * Resets the current data
     */
    reset(){
        this._address.StreetAddress.value = "";
        this._address.City.value = "";
        this._address.State.value = "";
        this._address.Zip.value = "";

        this._user.Email.value = "";
        this._user.FirstName.value = "";
        this._user.LastName.value = "";
        this._primaryPhone.value = "";
        if(this._cellPhone) this._cellPhone.value = "";
        if(this._homePhone) this._homePhone.value = "";
        if(this._workPhone) this._workPhone.value = "";

        this._chosenContact = null;
        this._chosenContactID = -1;
        this._company.value = "";
        this._licenseNum.value = "";
        this._mcNum.value = "";
        this._resaleNum.value = "";

        if(document.getElementById(INVOICE_CHOSEN_CONTACT_ID)){
            document.getElementById(INVOICE_CHOSEN_CONTACT_ID).removeAttribute("id");
        }

        this._updatePreviewField();
    }

    /**
     * Shows the dialog
     * @param e
     */
    show(e) {
        e.preventDefault();

        // Do the right things on keypress
        // this._enterKeyPressedFunc = this._hideBound;
        // this._escKeyPressedFunc = this._hideBound;
        // document.addEventListener('keyup', this._keyPressedBound);

        // Get the contacts if we haven't already
        if (this._loadedContacts.length === 0) {
            this._getContactPreviews();
        }

        showModalDialog(this._dialog, this._hideBound);
    }

    /**
     * Swaps between the contact view and new customer view
     * @param e
     */
    swap(e){
        e.preventDefault();

        if(this._showingContacts){
            document.getElementById(INVOICE_CUSTOMER_NEW_ID).style.display = "block";
            document.getElementById(INVOICE_CUSTOMER_SHOW_CONTACTS_ID).style.display = "block";

            document.getElementById(INVOICE_CONTACTS_LIST_OUTER_ID).style.display = "none";
            document.getElementById(INVOICE_SHOW_CUSTOM_ID).style.display = "none";
        }
        else {
            document.getElementById(INVOICE_CUSTOMER_NEW_ID).style.display = "none";
            document.getElementById(INVOICE_CUSTOMER_SHOW_CONTACTS_ID).style.display = "none";

            document.getElementById(INVOICE_CONTACTS_LIST_OUTER_ID).style.display = "block";
            document.getElementById(INVOICE_SHOW_CUSTOM_ID).style.display = "block";
        }

        this._showingContacts = !this._showingContacts;
        positionModalDialog(this._dialog);
    }

    /**
     * Gets the JSON data for this class
     * @return {Object<string, *>}
     */
    toJSON(){
        if(this._showingContacts && this._chosenContact){
            const properties = {};
            properties[CustomerFields.customerID] = this._chosenContact.customerID;
            return properties;
        }
        else {
            const properties = {};
            properties[CustomerFields.user] = this._user;
            properties[CustomerFields.address] = this._address;
            properties[CustomerFields.primaryPhone] = this._primaryPhone.value;
            if(this._cellPhone) properties[CustomerFields.cellPhone] = this._cellPhone.value;
            if(this._homePhone) properties[CustomerFields.homePhone] = this._homePhone.value;
            if(this._workPhone) properties[CustomerFields.workPhone] = this._workPhone.value;

            properties[CustomerFields.company] = this._company.value;
            properties[CustomerFields.licenseNum] = this._licenseNum.value;
            properties[CustomerFields.mcNum] = this._mcNum.value;
            properties[CustomerFields.resaleNum] = this._resaleNum.value;

            return properties;
        }
    }

    // endregion

    // region Private Methods

    /**
     * Fires when any of the fields are updated
     * @param e
     * @private
     */
    _fieldUpdated(e) {
        // Ensure the phone, email, and zip are valid
        if(e.propertyName.indexOf("Phone") > 0){
            /**
             * @type {BaseHtmlElement}
             */
            let phone;

            if(e.propertyName == CustomerFields.primaryPhone) phone = this._primaryPhone;
            else if(e.propertyName == CustomerFields.cellPhone) phone = this._cellPhone;
            else if(e.propertyName == CustomerFields.homePhone) phone = this._homePhone;
            else if(e.propertyName == CustomerFields.workPhone) phone = this._workPhone;

            const phoneRegEx = new RegExp(/^(1[.\-])?[0-9]{3}[.\-]?[0-9]{3}[.\-]?[0-9]{4}$/);

            if(phone && phone.value != "" && !phone.value.match(phoneRegEx)){
                phone.error = "Invalid Phone Number. Expecting format 1-111-111-1111";
            }
            else if(phone){
                phone.error = null;
            }
        }
        else if(e.propertyName === UserFields.email){
            const email = this._user.Email.value;

            // This is weak, but should work well enough
            if(email != "" && !email.match(/^.+@.+\..{2,}$/)) {
                this._user.Email.error = "Invalid Email Address";
            }
            else{
                this._user.Email.error = null;
            }
        }
        else if(e.propertyName === AddressFields.zip){
            const zip = this._address.Zip.htmlObj.value;
            if(zip.length != 5 && zip.length != 0){
                this._address.Zip.error = "Invalid ZIP code";
            }
            else{
                this._address.Zip.error = null;
            }
        }
    }

    /**
     * Gets the contact previews
     * @private
     */
    _getContactPreviews() {

        this._loadContacts(null);

        ensureValidToken((valid, token) => {
            if(!valid){
                this._loadContacts([]);
                return;
            }

            const xmlhttp = new XMLHttpRequest();

            xmlhttp.onreadystatechange = () => {
                if (xmlhttp.readyState == XMLHttpRequest.DONE) {
                    if (xmlhttp.status == 200) {
                        this._loadContacts(JSON.parse(xmlhttp.response.toString()));
                    }
                    // Because we don't get cookies, this happens for every request
                    else if(xmlhttp.status === 401){}
                    else {
                        this._loadContacts([]);
                    }
                }
                else if(xmlhttp.readyState == XMLHttpRequest.OPENED){
                    this._loadContacts(null);
                }
            };

            xmlhttp.open("GET", "https://localhost:44357/api/User/ContactsPreview", true);
            xmlhttp.setRequestHeader("Authorization", "Bearer " + token);
            xmlhttp.send();
        });
    }

    /**
     * Loads the contacts area once the data has been gotten
     * @param {*} contacts - Either the contacts data, or null if the loader should be shown
     * @private
     */
    _loadContacts(contacts){
        const listNode = document.getElementById(INVOICE_CONTACTS_LIST_ID);

        while (listNode.childElementCount > 0) listNode.removeChild(listNode.lastChild);

        if(contacts === null){
            const loading = document.createElement("img");
            loading.src = "/images/loading.svg";
            loading.className = "loadingSpinner centerSpinner";
            listNode.appendChild(loading);
            return;
        }

        if (contacts.length == 0) {
            const noContacts = document.createElement("p");
            noContacts.innerHTML = "No Contacts";
            noContacts.className = "row";

            listNode.appendChild(noContacts);

            // Start with the customer instead
            this.swap(new Event(""));
        }

        this._loadedContacts = [];

        for (let contact of contacts) {
            const cp = CustomerPreview.createFromJSON(contact);

            const selectCustomer = (e) => {
                e.preventDefault();
                if (document.getElementById(INVOICE_CHOSEN_CONTACT_ID)) {
                    document.getElementById(INVOICE_CHOSEN_CONTACT_ID).removeAttribute("id")
                }
                e.currentTarget.id = INVOICE_CHOSEN_CONTACT_ID;
                this._chosenContact = cp;
                this._updatePreviewField();
            };

            cp.parentElement.htmlObj.setAttribute("tabindex", "0");
            cp.parentElement.addEvent('click', selectCustomer);
            cp.parentElement.addEvent('keypress', selectCustomer);

            if(cp.customerID == this._chosenContactID){
                this._chosenContact = cp;
                this._chosenContact.parentElement.htmlObj.id = INVOICE_CHOSEN_CONTACT_ID;
                this._updatePreviewField();
            }

            listNode.appendChild(cp.parentElement.htmlObj);
            this._loadedContacts.push(cp);
        }

        positionModalDialog(this._dialog);
    }

    /**
     * Updates the preview field that the user sees when the dialog is closed
     * @private
     */
    _updatePreviewField(){
        if(this._showingContacts && this._chosenContact != null){
            // Meh
            this._displayName.value = this._chosenContact.firstName + " " + this._chosenContact.lastName;
        }
        else{
            this._displayName.value = this._user.FirstName + " " + this._user.LastName;
        }
    }

    /**
     * Fires when a key is released
     * @param e
     * @private
     */
    _keyReleased(e){
        // Enter
        if(e.keyCode === ENTER_KEY) {
            e.preventDefault();
            this._enterKeyPressedFunc(e)
        }
        // ESC
        else if(e.keyCode === ESCAPE_KEY){
            e.preventDefault();
            this._escKeyPressedFunc(e);
        }
    }

    /**
     * Fires when the user starts searching
     * @private
     */
    _search(){
        const searchTerm = document.getElementById(INVOICE_CONTACTS_SEARCH_INPUT_ID).value;
        const contactsListElem = document.getElementById(INVOICE_CONTACTS_LIST_ID);
        const contactsHeader = document.getElementById(INVOICE_CONTACTS_LIST_HEADER_ID);

        if(searchTerm === ""){

            // Clear everything out
            while(contactsListElem.firstElementChild) contactsListElem.removeChild(contactsListElem.firstElementChild);

            // And re-add them so they're ordered correctly
            for(const contact of this._loadedContacts){
                contact.parentElement.htmlObj.removeAttribute(ATTRIBUTE_FOUND_RESULT);
                contactsListElem.appendChild(contact.parentElement.htmlObj);
            }

            // Remove that we're in search mode, and update the header
            contactsListElem.removeAttribute(ATTRIBUTE_SEARCH);
            contactsHeader.innerHTML = "Contacts";
            return;
        }

        const runNum = Math.random();
        this._search.runNum = runNum;
        contactsListElem.setAttribute(ATTRIBUTE_SEARCH, "");

        // Change the title
        contactsHeader.innerHTML = "Search Results";

        const results = [];

        for(const contact of this._loadedContacts){
            // If it's been called again, stop
            if(this._search.runNum !== runNum) return;

            /**
             * @type {Array<Object<likelihood, contact>>}
             */
            const liklihood = [];

            const searchWords = searchTerm.split(' ');
            for(const word of searchWords) {
                const values = [
                    contact.firstName,
                    contact.lastName,
                    contact.streetAddress,
                    contact.city,
                    contact.state,
                    contact.zip,
                    contact.email
                ];

                for(const value of values){
                    const likeliness = getLikeliness(value.toString().toLowerCase(), word.toLowerCase());
                    if(likeliness >= .5){
                        liklihood.push(likeliness);
                        break;
                    }
                }
            }

            if(liklihood.length > 0) {
                const average = liklihood.reduce((a, b) => a + b) / liklihood.length;
                results.push({likelihood: average, contact: contact});
            }
            else{
                contact.parentElement.htmlObj.removeAttribute(ATTRIBUTE_FOUND_RESULT);
            }
        }

        results.sort((l, r) => l.likelihood < r.likelihood);

        // If it's been called again, stop
        if(this._search.runNum !== runNum) return;

        for(const result of results){
            result.contact.parentElement.htmlObj.setAttribute(ATTRIBUTE_FOUND_RESULT, "");
        }
    }

    // endregion
}