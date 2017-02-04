/**
 * Created by David on 02/02/17.
 */

class CustomerFields {
    static get firstName() { return "FirstName"; }
    static get lastName() { return "LastName"; }
    static get email() { return "Email"; }
    static get phone() { return "PhoneNumber"; }
    static get address() { return "StreetAddress"; }
    static get city() { return "City"; }
    static get state() { return "State"; }
    static get zip() { return "ZipCode"; }
    static get company() { return "CompanyName"; }
    static get licenseNum() { return "DealerLicenseNumber"; }
    static get mcNum() { return "MCNumber"; }
    static get resaleNum() { return "ResaleNumber"; }
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
        this._boundFieldUpdated = this._fieldUpdated.bind(this);

        /**
         * The actual dialog
         * @private
         * @type {HTMLDialogElement}
         */
        this._dialog = customerDialog;

        /**
         * The place where the name is shown when the dialog is closed
         * @type {HTMLInputElement}
         * @private
         */
        this._displayName = document.getElementById("invoiceCustomer");

        // Subscribe to all the buttons that can be clicked
        document.getElementById("getCustomerButton").addEventListener('click', this._showBound);
        document.getElementById("closeCustomerDialog").addEventListener('click', this._hideBound);
        document.getElementById("showContacts").addEventListener('click', this._swapBound);
        document.getElementById("showCustom").addEventListener('click', this._swapBound);

        /**
         * The ID of the contact chosen
         * @type {number}
         * @private
         */
        this._contactID = -1;

        /**
         * Indicates if we're currently showing contacts or contacts
         * @type {boolean}
         * @private
         */
        this._showingContacts = true;


        /**
         * @private
         * @type {BaseHtmlElement}
         */
        this._firstName = null;

        /**
         * @private
         * @type {BaseHtmlElement}
         */
        this._lastName = null;

        /**
         * @private
         * @type {BaseHtmlElement}
         */
        this._email = null;

        /**
         * @private
         * @type {BaseHtmlElement}
         */
        this._phone = null;

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
                case CustomerFields.firstName:
                    this._firstName = element = new TextInput(elements[i]);
                    break;
                case CustomerFields.lastName:
                    this._lastName = element = new TextInput(elements[i]);
                    break;
                case CustomerFields.email:
                    this._email = element = new TextInput(elements[i]);
                    break;
                case CustomerFields.phone:
                    this._phone = element = new TextInput(elements[i]);
                    break;
                case CustomerFields.address:
                    this._address = element = new TextInput(elements[i]);
                    break;
                case CustomerFields.city:
                    this._city = element = new TextInput(elements[i]);
                    break;
                case CustomerFields.state:
                    this._state = element = new TextInput(elements[i]);
                    break;
                case CustomerFields.zip:
                    this._zip = element = new NumricInput(elements[i]);
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

    // region Public Properties

    /**
     * The customer's first name
     * @return {string}
     */
    get FirstName() { return this._firstName.value; }

    /**
     * The customer's first name
     * @param {string} value
     */
    set FirstName(value) { this._firstName.value = value; }

    /**
     * The customer's first name
     * @return {string}
     */
    get LastName() { return this._lastName.value; }

    /**
     * The customer's first name
     * @param {string} value
     */
    set LastName(value) { this._lastName.value = value; }

    // endregion

    // region Public Methods

    /**
     * Hides the dialog
     * @param e
     */
    hide(e){
        e.preventDefault();
        this._dialog.close();

        if(this._showingContacts && document.getElementById(CHOSEN_CONTACT_ID)){
            // Meh
            this._displayName.value = document.getElementById(CHOSEN_CONTACT_ID).getElementsByTagName("b")[0].innerHTML;
        }
        else{
            this._displayName.value = this.FirstName + " " + this.LastName;
        }
    }

    /**
     * Shows the dialog
     * @param e
     */
    show(e){
        e.preventDefault();
        this._getContactPreviews();
        this._dialog.show();
    }

    /**
     * Swaps between the contact view and new customer view
     * @param e
     */
    swap(e){
        e.preventDefault();

        if(this._showingContacts){
            document.getElementById("newCustomer").style.display = "block";
            document.getElementById("showContacts").style.display = "block";

            document.getElementById("contactsList").style.display = "none";
            document.getElementById("showCustom").style.display = "none";
        }
        else {
            document.getElementById("newCustomer").style.display = "none";
            document.getElementById("showContacts").style.display = "none";

            document.getElementById("contactsList").style.display = "block";
            document.getElementById("showCustom").style.display = "block";

        }

        this._showingContacts = !this._showingContacts;
    }

    /**
     * Gets the JSON data for this class
     * @return {Object<string, *>}
     */
    toJSON(){
        const properties = {};
        properties[CustomerFields.firstName] = this._firstName.value;
        properties[CustomerFields.lastName] = this._lastName.value;
        properties[CustomerFields.email] = this._phone.value;
        properties[CustomerFields.phone] = this._email.value;
        properties[CustomerFields.address] = this._address.value;
        properties[CustomerFields.city] = this._city.value;
        properties[CustomerFields.state] = this._state.value;
        properties[CustomerFields.zip] = this._zip.value;
        properties[CustomerFields.company] = this._company.value;
        properties[CustomerFields.licenseNum] = this._licenseNum.value;
        properties[CustomerFields.mcNum] = this._mcNum.value;
        properties[CustomerFields.resaleNum] = this._resaleNum.value;

        return properties;
    }

    // endregion

    // region Private Methods

    /**
     * Fires when any of the fields are updated
     * @param e
     * @private
     */
    _fieldUpdated(e) {
        // Ensure the phone and zip are valid
        if(e.propertyName == CustomerFields.phone){
            const phone = this._phone.value;
            const phoneRegEx = new RegExp(/^(1[.\-])?[0-9]{3}[.\-]?[0-9]{3}[.\-]?[0-9]{4}$/);

            this._phone.hasError = phone != "" && !phone.match(phoneRegEx);
        }
    }

    /**
     * Gets the contact previews
     * @private
     */
    _getContactPreviews() {

        if (!ensureValidToken()) {
            this._loadContacts([]);
            return;
        }

        const xmlhttp = new XMLHttpRequest();

        xmlhttp.onreadystatechange = () => {
            if (xmlhttp.readyState == XMLHttpRequest.DONE) {
                if (xmlhttp.status == 200) {
                    this._loadContacts(JSON.parse(xmlhttp.response));
                }
                else {
                    this._loadContacts([]);
                }
            }
            else if(xmlhttp.readyState == XMLHttpRequest.OPENED){
                this._loadContacts(null);
            }
        };

        xmlhttp.open("GET", "https://localhost:44357/api/User/ContactsPreview", true);
        xmlhttp.setRequestHeader("Authorization", "Bearer " + localStorage.getItem("AuthorizationToken"));
        xmlhttp.send();
    }

    /**
     * Loads the contacts area once the data has been gotten
     * @param {*} contacts - Either the contacts data, or null if the loader should be shown
     * @private
     */
    _loadContacts(contacts){
        const listNode = document.getElementById("contactsList");

        while (listNode.childElementCount > 1) listNode.removeChild(listNode.lastChild);

        if(contacts === null){
            const loading = document.createElement("img");
            loading.src = "/images/loading.svg";
            listNode.appendChild(loading);
            return;
        }

        if (contacts.length == 0) {
            const noContacts = document.createElement("p");
            noContacts.innerHTML = "No Contacts";
            noContacts.className = "row";

            listNode.appendChild(noContacts);
        }

        for (let contact of contacts) {
            const div = document.createElement("div");
            div.className = "contactPreviewItem row";
            div.setAttribute(CUSTOMER_ID_ATTRIB, contact.customerID);

            if(this._contactID == contact.customerID) div.id = CHOSEN_CONTACT_ID;

            const nameNode = document.createElement("p");
            nameNode.innerHTML = "<b>" + contact.user.firstName + " " + contact.user.lastName + "</b>";

            const addressNode = document.createElement("p");
            addressNode.innerHTML = contact.address.streetAddress + " " + contact.address.city + ", " +
                contact.address.state + " " + contact.address.zipCode;

            const emailNode = document.createElement("p");
            emailNode.innerHTML = contact.user.email;

            div.appendChild(nameNode);
            div.appendChild(addressNode);
            div.appendChild(emailNode);

            listNode.appendChild(div);

            div.addEventListener("click", (e) => {
                e.preventDefault();
                if (document.getElementById(CHOSEN_CONTACT_ID)) {
                    document.getElementById(CHOSEN_CONTACT_ID).removeAttribute("id")
                }
                e.currentTarget.id = CHOSEN_CONTACT_ID
                this._contactID = e.currentTarget.getAttribute(CUSTOMER_ID_ATTRIB);
            });
        }
    }

    // endregion


}