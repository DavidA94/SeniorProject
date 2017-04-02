/**
 * Created by David on 2017-03-30.
 */

/**
 * @name HtmlTranslator
 * @function
 * @param {*} object - The model object
 */

class ContactsFields {
    static get firstName() { return "firstName"; }
    static get lastName() { return "lastName"; }
    static get email() { return "email"; }
    static get primaryPhone() { return "primaryPhone"; }
    static get cellPhone() { return "cellPhone"; }
    static get homePhone() { return "homePhone"; }
    static get workPhone() { return "workPhone"; }
    static get streetAddress() { return "streetAddress"; }
    static get city() { return "city"; }
    static get state() { return "state"; }
    static get zip() { return "zipCode"; }
    static get companyName() { return "companyName"; }
    static get licenseNum() { return "dealerLicenseNumber"; }
    static get mcNum() { return "mcNumber"; }
    static get resaleNum() { return "resaleNumber"; }
}

class Contacts {
    // region CTOR

    constructor(){

        /**
         * @private
         * @type {function}
         */
        this._searchBound = this._search.bind(this);

        /**
         * @private
         * @type {function}
         */
        this._boundFieldUpdated = this._fieldUpdated.bind(this);

        /**
         * @private
         * @type {function}
         */
        this._boundContactMenuClick = this._contactMenuClick.bind(this);

        /**
         * @private
         * @type {function}
         */
        this._boundNewContactClick = this._newContactClick.bind(this);

        /**
         * @private
         * @type {function}
         */
        this._boundSaveClick = this._saveClick.bind(this);

        /**
         * @private
         * @type {function}
         */
        this._boundCloseContactMenu = this._closeContactMenu.bind(this);

        /**
         * @private
         * @type {function}
         */
        this._boundEditClick = this._editClick.bind(this);

        /**
         * @private
         * @type {function}
         */
        this._boundDeleteClick = this._deleteClick.bind(this);

        /**
         * @private
         * @type {Contact[]}
         */
        this._loadedContacts = [];

        /**
         * @private
         * @type {Contact}
         */
        this._selectedContact = null;

        /**
         * @private
         * @type {boolean}
         */
        this._inEditMode = false;

        /**
         * @private
         * @type {boolean}
         */
        this._isMenuOpened = false;

        /**
         * The html object dictionary back to the contact objects
         * @type {object<string, {toHtml: {HtmlTranslator}, fromHtml: {HtmlTranslator}}>}>}
         * @private
         */
        this._htmlTranslators = {};

        /**
         * The order of the contacts.
         * @type {ContactOrder}
         * @private
         */
        this._contactsOrder = ContactOrder.FirstName;

        this._fieldset = document.getElementById(CONTACTS_EDIT_CONTAINER_ID).getElementsByTagName("fieldset")[0];
        this._invoiceList = document.getElementById(CONTACTS_INVOICES_LIST_ID);

        this._saveButton = document.getElementById("saveButton");
        this._editButton = document.getElementById("editButton");
        this._deleteButton = document.getElementById("deleteButton");

        // region HTML Containers

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
         * @type {TextInput}
         */
        this._pPhone = null;

        /**
         * @private
         * @type {TextInput}
         */
        this._cPhone = null;

        /**
         * @private
         * @type {TextInput}
         */
        this._hPhone = null;

        /**
         * @private
         * @type {TextInput}
         */
        this._wPhone = null;


        /**
         * @private
         * @type {TextInput}
         */
        this._companyName = null;

        /**
         * @private
         * @type {TextInput}
         */
        this._licenseNum = null;

        /**
         * @private
         * @type {TextInput}
         */
        this._mcNum = null;

        /**
         * @private
         * @type {TextInput}
         */
        this._resaleNum = null;

        // endregion
    }

    // endregion

    // region Public Methods

    initialize(){
        const container = document.getElementById(CONTACTS_EDIT_CONTAINER_ID);
        const elements = container.querySelectorAll(BIND_QUERY);

        for(let i = 0; i < elements.length; ++i) {
            const attribute = elements[i].getAttribute(ATTRIBUTE_BIND);

            let element = null;

            switch (attribute) {
                case UserFields.firstName:
                    this._user.FirstName = element = new TextInput(elements[i]);
                    break;
                case UserFields.lastName:
                    this._user.LastName = element = new TextInput(elements[i]);
                    break;
                case UserFields.email:
                    this._user.Email = element = new TextInput(elements[i]);
                    break;
                case ContactsFields.primaryPhone:
                    this._primaryPhone = element = new TextInput(elements[i]);
                    break;
                case ContactsFields.cellPhone:
                    this._cellPhone = element = new TextInput(elements[i]);
                    break;
                case ContactsFields.homePhone:
                    this._homePhone = element = new TextInput(elements[i]);
                    break;
                case ContactsFields.workPhone:
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
                case ContactsFields.companyName:
                    this._company = element = new TextInput(elements[i]);
                    break;
                case ContactsFields.licenseNum:
                    this._licenseNum = element = new TextInput(elements[i]);
                    break;
                case ContactsFields.mcNum:
                    this._mcNum = element = new TextInput(elements[i]);
                    break;
                case ContactsFields.resaleNum:
                    this._resaleNum = element = new TextInput(elements[i]);
                    break;
            }

            element.subscribe(EVENT_PROPERTY_CHANGE, this._boundFieldUpdated);
            this._htmlTranslators[attribute] = Contacts._makeHtmlTranslator(attribute, element);
        }

        this._loadContacts();
        this._initializeMenu();

        document.getElementById(CONTACTS_MENU_ID).addEventListener('click', this._boundContactMenuClick);
        document.getElementById("newButton").addEventListener('click', this._boundNewContactClick);
        this._saveButton.addEventListener('click', this._boundSaveClick);
        this._editButton.addEventListener('click', this._boundEditClick);
        this._deleteButton.addEventListener('click', this._boundDeleteClick);

        this._saveButton.style.display = "none";
        this._editButton.style.display = "none";
        this._deleteButton.style.display = "none";

        this._fieldset.disabled = "disabled";
        this._fieldset.style.display = "none";
        this._invoiceList.style.display = "none";

        document.getElementById(INVOICE_CONTACTS_SEARCH_INPUT_ID).addEventListener('input', this._searchBound);
    }

    // endregion

    // region Private Methods

    _initializeMenu(){
        const menu = document.getElementById(CONTEXT_MENU_ID);

        const sbf = document.createElement("li");
        sbf.innerHTML = "Sort By First Name";
        sbf.id = CONTACTS_SELECTED_ORDER_ID;
        sbf.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();

            this._orderBy(ContactOrder.FirstName);
            this._contactMenuClick();

            document.getElementById(CONTACTS_SELECTED_ORDER_ID).removeAttribute("id");
            sbf.id = CONTACTS_SELECTED_ORDER_ID;
        });

        const sbl = document.createElement("li");
        sbl.innerHTML = "Sort By Last Name";
        sbl.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();

            this._orderBy(ContactOrder.LastName);
            this._contactMenuClick();

            document.getElementById(CONTACTS_SELECTED_ORDER_ID).removeAttribute("id");
            sbl.id = CONTACTS_SELECTED_ORDER_ID;
        });

        const sbe = document.createElement("li");
        sbe.innerHTML = "Sort By Email";
        sbe.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();

            this._orderBy(ContactOrder.Email);
            this._contactMenuClick();

            document.getElementById(CONTACTS_SELECTED_ORDER_ID).removeAttribute("id");
            sbe.id = CONTACTS_SELECTED_ORDER_ID;
        });

        menu.appendChild(sbf);
        menu.appendChild(sbl);
        menu.appendChild(sbe);
    }

    _orderBy(order) {
        this._contactsOrder = order;

        if(order === ContactOrder.FirstName) {
            this._loadedContacts.sort((l, r) => l.firstName.toLowerCase() > r.firstName.toLowerCase());
        }
        if(order === ContactOrder.LastName) {
            this._loadedContacts.sort((l, r) => l.lastName.toLowerCase() > r.lastName.toLowerCase());
        }
        if(order === ContactOrder.Email) {
            this._loadedContacts.sort((l, r) => l.email.toLowerCase() > r.email.toLowerCase());
        }

        const list = document.getElementById(CONTACTS_LIST_ID);
        for(const contact of this._loadedContacts){
            contact.setOrderedBy(order);

            list.appendChild(contact.previewElement);
        }
    }

    /**
     *
     * @param {function} callback
     * @private
     */
    _loadContacts(callback){
        const currentContact = this._selectedContact ? this._selectedContact.contactID : -1;

        const list = document.getElementById(CONTACTS_LIST_ID);
        while(list.firstElementChild) list.removeChild(list.firstElementChild);
        this._loadedContacts = [];

        const loading = document.createElement("img");
        loading.src = "/images/loading.svg";
        loading.className = "loadingSpinner centerSpinner";
        list.appendChild(loading);

        sendToApi("User/Contacts", "GET", null, (xmlhttp) => {
            if(xmlhttp.readyState === XMLHttpRequest.DONE && xmlhttp.status === 200){
                list.removeChild(loading);

                const contacts = JSON.parse(xmlhttp.response.toString());
                if(contacts.length === 0){
                    const noContacts = document.createElement("p");
                    noContacts.id = "noContacts";
                    noContacts.innerHTML = "No Contacts";
                    list.appendChild(noContacts);
                    return;
                }

                for(const contact of contacts){
                    const loadedContact = new Contact();
                    loadedContact.initialize_json(contact);
                    this._loadedContacts.push(loadedContact);

                    loadedContact.previewElement.addEventListener('click', () => {
                        this._showContact(loadedContact);
                    });

                    if(loadedContact.contactID == currentContact) this._showContact(loadedContact);
                }

                this._orderBy(this._contactsOrder);

                if(callback) callback();
            }
        });
    }

    _editClick(){
        if(!this._selectedContact) return;

        this._fieldset.removeAttribute("disabled");
        this._editButton.style.display = "None";
        this._saveButton.removeAttribute("style");
    }

    _deleteClick(){
        if(!this._selectedContact) return;

        const userFullName = this._selectedContact.firstName + " " + this._selectedContact.lastName;
        const userIsSure = confirm("Are you sure you want to delete " + userFullName + "?");

        if(userIsSure){
            sendToApi("User/DeleteContact/" + this._selectedContact.contactID, "DELETE", null, (xmlhttp) => {
                if(xmlhttp.readyState === XMLHttpRequest.DONE) {
                    if(xmlhttp.status === 200){
                        const response = /** @type {ApiResponse} */JSON.parse(xmlhttp.response.toString());

                        if(response.successful){
                            this._selectedContact = null;
                            this._loadContacts(null);
                        }

                        alert(response.message);
                    }
                    else if(xmlhttp.status === 401) {}
                    else {
                        alert("Unknown error occurred. Status " + xmlhttp.status);
                    }
                }
            });
        }
    }

    /**
     * Shows the contact is non-edit mode
     * @param {Contact} contact
     * @private
     */
    _showContact(contact){
        if(contact == this._selectedContact) return;

        this._fieldset.disabled = "disabled";

        const chosenContact = document.getElementById(INVOICE_CHOSEN_CONTACT_ID);
        if(chosenContact) chosenContact.removeAttribute("id");
        contact.previewElement.id = INVOICE_CHOSEN_CONTACT_ID;

        this._selectedContact = contact;

        for(const key of Object.keys(this._htmlTranslators)){
            this._htmlTranslators[key].toHtml(contact);
        }

        const list = this._invoiceList.firstElementChild;
        while(list.childElementCount > 1) list.removeChild(list.lastElementChild);

        if(contact.invoices.length === 0){
            const div = document.createElement("div");
            div.innerHTML = "<i>No Invoices</i>";
            list.appendChild(div);
        }

        for(const invoice of contact.invoices){
            const invoiceDate = new Date(invoice.createdDate);

            const div = document.createElement("div");
            const a = document.createElement("a");
            a.href = "/Invoice/View/" + invoice.invoiceNumber;
            a.innerHTML =  invoiceDate.getPrettyUTCDate() + " - Invoice " + invoice.invoiceNumber;
            a.target = "_blank";

            div.appendChild(a);
            list.appendChild(div);
        }

        this._saveButton.style.display = "none";
        this._fieldset.removeAttribute("style");
        this._invoiceList.removeAttribute("style");
        this._editButton.removeAttribute("style");
        this._deleteButton.removeAttribute("style");
    }

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

            if(e.propertyName == ContactsFields.primaryPhone) phone = this._primaryPhone;
            else if(e.propertyName == ContactsFields.cellPhone) phone = this._cellPhone;
            else if(e.propertyName == ContactsFields.homePhone) phone = this._homePhone;
            else if(e.propertyName == ContactsFields.workPhone) phone = this._workPhone;

            const phoneRegEx = new RegExp(/^(1[.\-]?)?[0-9]{3}[.\-]?[0-9]{3}[.\-]?[0-9]{4}$/);

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
            if(zip.length != 5){
                this._address.Zip.error = "Invalid ZIP code";
            }
            else{
                this._address.Zip.error = null;
            }
        }

        this._htmlTranslators[e.propertyName].fromHtml(this._selectedContact);
    }

    /**
     * Fires when the user starts searching
     * @private
     */
    _search(e){
        const searchTerm = e.currentTarget.value;
        const contactsListElem = document.getElementById(CONTACTS_LIST_ID);

        if(searchTerm === ""){

            // Clear everything out
            while(contactsListElem.firstElementChild) contactsListElem.removeChild(contactsListElem.firstElementChild);

            // And re-add them so they're ordered correctly
            for(const contact of this._loadedContacts){
                contact.previewElement.removeAttribute(ATTRIBUTE_FOUND_RESULT);
                contactsListElem.appendChild(contact.previewElement);
            }

            // Remove that we're in search mode
            contactsListElem.removeAttribute(ATTRIBUTE_SEARCH);
            return;
        }

        const runNum = Math.random();
        this._search.runNum = runNum;
        contactsListElem.setAttribute(ATTRIBUTE_SEARCH, "");

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
                    contact.email,
                    contact.primaryPhone,
                    contact.cellPhone,
                    contact.homePhone,
                    contact.workPhone,
                    contact.companyName,
                    contact.dealerLicenseNumber,
                    contact.mcNumber,
                    contact.resaleNumber
                ];

                for(const value of values){
                    if(!value) continue;
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
                contact.previewElement.removeAttribute(ATTRIBUTE_FOUND_RESULT);
            }
        }

        // If it's been called again, stop
        if(this._search.runNum !== runNum) return;

        for(const result of results){
            result.contact.previewElement.setAttribute(ATTRIBUTE_FOUND_RESULT, "");
        }
    }

    _contactMenuClick(){

        const menu = document.getElementById(CONTACTS_MENU_ID);
        if(this._isMenuOpened){
            menu.removeAttribute("class");
            document.body.removeEventListener('click', this._boundCloseContactMenu, true);
            this._isMenuOpened = false;
        }
        else{
            document.body.addEventListener('click', this._boundCloseContactMenu, true);
            menu.className = "opened";
            this._isMenuOpened = true;
        }
    }

    _closeContactMenu(e){
        const x = e.clientX;
        const y = e.clientY;

        const menuCoords = document.getElementById(CONTEXT_MENU_ID).getBoundingClientRect();
        if(x >= menuCoords.left && x <= menuCoords.right && y >= menuCoords.top && y <= menuCoords.bottom){

        }
        else {
            document.getElementById(CONTACTS_MENU_ID).removeAttribute("class");
            document.body.removeEventListener('click', this._boundCloseContactMenu, true);
            this._isMenuOpened = false;
            e.stopPropagation();
        }
    }

    _newContactClick(){
        this._selectedContact = new Contact();
        this._selectedContact.contactID = -1;
        var selectedContact = document.getElementById(INVOICE_CHOSEN_CONTACT_ID);
        if(selectedContact) selectedContact.removeAttribute("id");

        this._fieldset.removeAttribute("disabled");
        this._fieldset.removeAttribute("style");
        this._saveButton.removeAttribute("style");
        this._deleteButton.style.display = "none";
        this._editButton.style.display = "none";
        this._invoiceList.style.display = "none";

        document.getElementById(CONTACTS_FORM_ID).reset();
    }

    _saveClick(){
        let contactID = this._selectedContact.contactID > 0 ? this._selectedContact.contactID.toString() : "0";

        const savingDiv = document.createElement("div");
        savingDiv.setAttribute("style", "position:fixed;top:0;right:0;bottom:0;left:0;background:rgba(255,255,255,.3");

        const loading = document.createElement("img");
        loading.src = "/images/loading.svg";
        loading.className = "loadingSpinner centerSpinner";
        loading.setAttribute("style", "margin-top:calc(50vh - 50px);");
        savingDiv.appendChild(loading);

        document.body.appendChild(savingDiv);

        sendToApi("User/SaveContact/" + contactID, "POST", JSON.stringify(this._selectedContact), (xmlhttp) => {
            if(xmlhttp.readyState === XMLHttpRequest.DONE) {
                if (xmlhttp.status === 200) {
                    const response = /** @type {ApiResponse} */JSON.parse(xmlhttp.response.toString());

                    if (response.successful) {
                        this._loadContacts(() => {
                            document.body.removeChild(savingDiv);
                        });
                    }
                    else {
                        document.body.removeChild(savingDiv);

                        if (response.errors.length > 0) {
                            for (const error of response.errors) {
                                // Corner case - Address is invalid
                                if (error.element === "Address" && error.subFields.length === 0) {
                                    alert(error.errorMsg);
                                    return;
                                }

                                const field = "_" + error.element.charAt(0).toLowerCase() + error.element.slice(1);
                                if (error.subFields.length === 0) {

                                    const element = /** @type {BaseHtmlElement} */eval("this." + field);
                                    element.error = error.errorMsg;
                                }
                                else {
                                    for (const sub of error.subFields) {
                                        const subField = "_" + sub.charAt(0).toLowerCase() + sub.slice(1);
                                        const element = /** @type {BaseHtmlElement} */eval("this." + field + "." + subField);
                                        element.error = error.errorMsg;
                                    }
                                }
                            }

                            alert("Please fix the highlighted areas in the form");
                        }
                        else {
                            alert(response.message);
                        }
                    }
                }
                else if(xmlhttp.status === 401) {}
                else {
                    alert("Unknown error occurred. Status " + xmlhttp.status);
                }
            }
        });
    }

    /**
     * @param {string} property - The property on the object to get the get/set for
     * @param {BaseHtmlElement} htmlObj - The HTML Object bound to the property
     * @returns {{toHtml: {HtmlTranslator}, fromHtml: {HtmlTranslator}}}
     */
    static _makeHtmlTranslator(property, htmlObj){
        return {
            toHtml: (object) => htmlObj.value = Reflect.get(object, property),
            fromHtml: (object) => Reflect.set(object, property, htmlObj.value),
        };
    }

    // endregion
}

const c = new Contacts();
c.initialize();