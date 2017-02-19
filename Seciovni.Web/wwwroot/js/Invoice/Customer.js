/**
 * Created by David on 02/02/17.
 */

class CustomerFields {
    static get customerID() { return "customerID"; }
    static get user() { return "user"; }
    static get address() { return "address"; }
    static get phoneNumbers() { return "phoneNumbers"; }
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
        this._keyPressedBound = this._keyReleased.bind(this);


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
        document.getElementById(OPEN_CUSTOMER_ID).addEventListener('click', this._showBound);
        document.getElementById(CLOSE_CUSTOMER_ID).addEventListener('click', this._hideBound);
        document.getElementById(SHOW_CONTACTS_ID).addEventListener('click', this._swapBound);
        document.getElementById(SHOW_CUSTOM_ID).addEventListener('click', this._swapBound);

        // Setup Searching
        document.getElementById(CONTACT_SEARCH_BUTTON_ID).addEventListener('click', () => this._searchBound());
        document.getElementById(CONTACT_SEARCH_INPUT_ID).addEventListener('input', this._searchBound);
        document.getElementById(CONTACT_SEARCH_INPUT_ID).addEventListener('keypress', (e) => {
            // If [Enter]
            if(e.keyCode === 13){
                this._searchBound(null);
            }
        });


        /**
         * Used for knowning which contact to select when loading data from the server
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
         * @type {[PhoneNumber]}
         */
        this._phoneNumbers = [new PhoneNumber()];

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
            const attribute = elements[i].getAttribute(BIND_ATTRIB);

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
                case PhoneFields.number:
                    this._phoneNumbers[0].Number = element = new TextInput(elements[i]);
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
        this._dialog.close();
        // document.removeEventListener('keyup', this._keyPressedBound);

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
            this._phoneNumbers[0].initialize_json(json[CustomerFields.phoneNumbers][0]);
            this._company.value = json[CustomerFields.company];
            this._licenseNum.value = json[CustomerFields.licenseNum];
            this._mcNum.value = json[CustomerFields.mcNum];
            this._resaleNum.value = json[CustomerFields.resaleNum];

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
        this._phoneNumbers[0].Number.value = "";

        this._chosenContact = null;
        this._chosenContactID = -1;
        this._company.value = "";
        this._licenseNum.value = "";
        this._mcNum.value = "";
        this._resaleNum.value = "";

        if(document.getElementById(CHOSEN_CONTACT_ID)){
            document.getElementById(CHOSEN_CONTACT_ID).removeAttribute("id");
        }

        this._updatePreviewField();
    }

    /**
     * Shows the dialog
     * @param e
     */
    show(e){
        e.preventDefault();

        // Do the right things on keypress
        // this._enterKeyPressedFunc = this._hideBound;
        // this._escKeyPressedFunc = this._hideBound;
        // document.addEventListener('keyup', this._keyPressedBound);

        // Get the contacts if we haven't already
        if(this._loadedContacts.length === 0) {
            this._getContactPreviews();
        }

        this._dialog.show();
    }

    /**
     * Swaps between the contact view and new customer view
     * @param e
     */
    swap(e){
        e.preventDefault();

        if(this._showingContacts){
            document.getElementById(NEW_CUSTOMER_ID).style.display = "block";
            document.getElementById(SHOW_CONTACTS_ID).style.display = "block";

            document.getElementById(CONTACTS_LIST_OUTER_ID).style.display = "none";
            document.getElementById(SHOW_CUSTOM_ID).style.display = "none";
        }
        else {
            document.getElementById(NEW_CUSTOMER_ID).style.display = "none";
            document.getElementById(SHOW_CONTACTS_ID).style.display = "none";

            document.getElementById(CONTACTS_LIST_OUTER_ID).style.display = "block";
            document.getElementById(SHOW_CUSTOM_ID).style.display = "block";
        }

        this._showingContacts = !this._showingContacts;
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
            properties[CustomerFields.phoneNumbers] = this._phoneNumbers;

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
        if(e.propertyName == CustomerFields.phone){
            const phone = this._phone.value;
            const phoneRegEx = new RegExp(/^(1[.\-])?[0-9]{3}[.\-]?[0-9]{3}[.\-]?[0-9]{4}$/);

            if(phone != "" && !phone.match(phoneRegEx)){
                this._phone.error = "Invalid Phone Number. Expecting format 1-111-111-1111";
            }
            else{
                this._phone.error = null;
            }
        }
        else if(e.propertyName === CustomerFields.email){
            const email = this._email.value;

            // This is weak, but should work well enough
            if(email != "" && !email.match(/^.+@.+\..{2,}$/)) {
                this._email.error = "Invalid Email Address";
            }
            else{
                this._email.error = null;
            }
        }
        else if(e.propertyName === CustomerFields.zip){
            if(this._zipCode.value.length < 5 || this._zipCode.value.length > 6){
                this._zipCode.error = "Invalid ZIP code";
            }
            else{
                this._zipCode.error = null;
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
        const listNode = document.getElementById(CONTACTS_LIST_ID);

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
                if (document.getElementById(CHOSEN_CONTACT_ID)) {
                    document.getElementById(CHOSEN_CONTACT_ID).removeAttribute("id")
                }
                e.currentTarget.id = CHOSEN_CONTACT_ID;
                this._chosenContact = cp;
                this._updatePreviewField();
            }

            cp.parentElement.htmlObj.setAttribute("tabindex", "0");
            cp.parentElement.addEvent('click', selectCustomer);
            cp.parentElement.addEvent('keypress', selectCustomer);

            if(cp.customerID == this._chosenContactID){
                this._chosenContact = cp;
                this._chosenContact.parentElement.htmlObj.id = CHOSEN_CONTACT_ID;
                this._updatePreviewField();
            }

            listNode.appendChild(cp.parentElement.htmlObj);
            this._loadedContacts.push(cp);
        }
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
        if(e.keyCode === 13) {
            e.preventDefault();
            this._enterKeyPressedFunc(e)
        }
        // ESC
        else if(e.keyCode === 27){
            e.preventDefault();
            this._escKeyPressedFunc(e);
        }
    }

    /**
     * Fires when the user starts searching
     * @private
     */
    _search(){
        const searchTerm = document.getElementById(CONTACT_SEARCH_INPUT_ID).value;
        const contactsListElem = document.getElementById(CONTACTS_LIST_ID);
        const contactsHeader = document.getElementById(CONTACTS_LIST_HEADER_ID);

        if(searchTerm === ""){

            // Clear everything out
            while(contactsListElem.firstElementChild) contactsListElem.removeChild(contactsListElem.firstElementChild);

            // And re-add them so they're ordered correctly
            for(const contact of this._loadedContacts){
                contact.parentElement.htmlObj.removeAttribute(SEARCH_FOUND_ATTRIB);
                contactsListElem.appendChild(contact.parentElement.htmlObj);
            }

            // Remove that we're in search mode, and update the header
            contactsListElem.removeAttribute(SEARCH_ATTRIB);
            contactsHeader.innerHTML = "Contacts";
            return;
        }

        const runNum = Math.random();
        this._search.runNum = runNum;
        contactsListElem.setAttribute(SEARCH_ATTRIB, "");

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
                console.log(contact.firstName + "   " + average);
                results.push({likelihood: average, contact: contact});
            }
            else{
                contact.parentElement.htmlObj.removeAttribute(SEARCH_FOUND_ATTRIB);
            }
        }

        results.sort((l, r) => l.likelihood < r.likelihood);

        // If it's been called again, stop
        if(this._search.runNum !== runNum) return;

        for(const result of results){
            result.contact.parentElement.htmlObj.setAttribute(SEARCH_FOUND_ATTRIB, "");
        }
    }

    // endregion
}