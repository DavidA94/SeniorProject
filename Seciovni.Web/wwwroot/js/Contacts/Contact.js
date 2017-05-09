/**
 * Created by David on 2017-03-30.
 */

class ContactFields {
    static get contactID() { return "customerID"; }
    static get user() { return "user"; }
    static get address() { return "address"; }
    static get primaryPhone() { return "primaryPhone"; }
    static get cellPhone() { return "cellPhone"; }
    static get homePhone() { return "homePhone"; }
    static get workPhone() { return "workPhone"; }
    static get companyName() { return "companyName"; }
    static get licenseNum() { return "dealerLicenseNumber"; }
    static get mcNum() { return "mcNumber"; }
    static get resaleNum() { return "resaleNumber"; }
}

class Contact {
    constructor() {

        const previewElement = document.createElement("div");
        previewElement.className = CONTACT_PREVIEW_CLASSES;

        const nameP = document.createElement("p");
        const fNameSpan = document.createElement("span");
        const lNameSpan = document.createElement("span");
        const nameSep = document.createTextNode(" ");
        nameP.appendChild(fNameSpan);
        nameP.appendChild(nameSep);
        nameP.appendChild(lNameSpan);

        const emailP = document.createElement("p");
        const phoneP = document.createElement("p");

        previewElement.appendChild(nameP);
        previewElement.appendChild(emailP);
        previewElement.appendChild(phoneP);

        this._previewElement = previewElement;
        this._firstNameSpan = new BaseHtmlElement(fNameSpan);
        this._lastNameSpan = new BaseHtmlElement(lNameSpan);
        this._nameSep = nameSep;
        this._phoneP = new BaseHtmlElement(phoneP);
        this._emailP = new BaseHtmlElement(emailP);

        /**
         * @type {Array}
         * @private
         */
        this._invoices = [];

        this._contactID = 0;

        this._firstName = null;
        this._lastName = null;
        this._email = null;
        this._primaryPhone = null;
        this._cellPhone = null;
        this._homePhone = null;
        this._workPhone = null;
        this._streetAddress = null;
        this._city = null;
        this._state = null;
        this._zip = null;
        this._companyName = null;
        this._licenseNum = null;
        this._mcNum = null;
        this._resaleNum = null;
    }

    // region Public Properties

    /**
     * The preview element for this contact
     * @return {HTMLElement}
     */
    get previewElement() { return this._previewElement; }

    /**
     * The invoices for this customer
     * @return {Array}
     */
    get invoices() { return this._invoices; }

    /**
     * The customer's ID
     * @return {number}
     */
    get contactID() { return this._contactID; }

    /**
     * The customer's ID
     * @param {number} value
     */
    set contactID(value) { this._contactID = value; }



    /**
     * The first name
     * @type {string}
     */
    get firstName() { return this._firstName; }

    /**
     * The first name
     * @param {string} value
     */
    set firstName(value) { this._firstName = value; }


    /**
     * The last name
     * @type {string}
     */
    get lastName() { return this._lastName; }

    /**
     * The last name
     * @param {string} value
     */
    set lastName(value) { this._lastName = value; }


    /**
     * The street address
     * @type {string}
     */
    get streetAddress() { return this._streetAddress; }

    /**
     * The street address
     * @param {string} value
     */
    set streetAddress(value) { this._streetAddress = value; }


    /**
     * The city
     * @type {string}
     */
    get city() { return this._city; }

    /**
     * The city
     * @param {string} value
     */
    set city(value) { this._city = value; }


    /**
     * The state
     * @type {string}
     */
    get state() { return this._state; }

    /**
     * The state
     * @param {string} value
     */
    set state(value) { this._state = value; }


    /**
     * The zip
     * @type {number}
     */
    get zipCode() { return this._zip; }

    /**
     * The zip
     * @param {number} value
     */
    set zipCode(value) { this._zip = value; }


    /**
     * The email
     * @type {string}
     */
    get email() { return this._email; }

    /**
     * The email
     * @param {string} value
     */
    set email(value) { this._email = value; }


    /**
     * The primary phone number
     * @type {string}
     */
    get primaryPhone() { return this._primaryPhone; }

    /**
     * The primary phone number
     * @param {string} value
     */
    set primaryPhone(value) { this._primaryPhone = value; }


    /**
     * The cell phone number
     * @type {string}
     */
    get cellPhone() { return this._cellPhone; }

    /**
     * The cell phone number
     * @param {string} value
     */
    set cellPhone(value) { this._cellPhone = value; }


    /**
     * The home phone number
     * @type {string}
     */
    get homePhone() { return this._homePhone; }

    /**
     * The home phone number
     * @param {string} value
     */
    set homePhone(value) { this._homePhone = value; }


    /**
     * The work phone number
     * @type {string}
     */
    get workPhone() { return this._workPhone; }

    /**
     * The work phone number
     * @param {string} value
     */
    set workPhone(value) { this._workPhone = value; }


    /**
     * The company name
     * @type {string}
     */
    get companyName() { return this._companyName; }

    /**
     * The company name
     * @param {string} value
     */
    set companyName(value) { this._companyName = value; }


    /**
     * The dealer's license number
     * @type {string}
     */
    get dealerLicenseNumber() { return this._licenseNum; }

    /**
     * The dealer's license number
     * @param {string} value
     */
    set dealerLicenseNumber(value) { this._licenseNum = value; }


    /**
     * The MC number
     * @type {string}
     */
    get mcNumber() { return this._mcNum; }

    /**
     * The MC number
     * @param {string} value
     */
    set mcNumber(value) { this._mcNum = value; }


    /**
     * The resale number
     * @type {string}
     */
    get resaleNumber() { return this._resaleNum; }

    /**
     * The resale number
     * @param {string} value
     */
    set resaleNumber(value) { this._resaleNum = value; }

    // endregion

    // region Public Methods

    save(callback){
        if(this.contactID <= 0) {
            callback(null);
            return;
        }

        sendToApi("User/SaveContact/" + this.contactID, "POST", JSON.stringify(this), (xmlhttp) => {
            callback(xmlhttp);

            if (xmlhttp.readyState === XMLHttpRequest.DONE && xmlhttp.status === 200) {
                this.initialize_json(/** @type {JSON} */xmlhttp.response);
            }
        });
    }

    /**
     * Sets the contact to display correctly, based on how it's being ordered
     * @param {ContactOrder} order - How the ordering is happening
     */
    setOrderedBy(order){
        const nameParent = this._firstNameSpan.htmlObj.parentNode;

        if(order === ContactOrder.LastName){
            this._nameSep.textContent = ", ";
            nameParent.appendChild(this._lastNameSpan.htmlObj);
            nameParent.appendChild(this._nameSep);
            nameParent.appendChild(this._firstNameSpan.htmlObj);
        }
        else if (order === ContactOrder.FirstName) {
            this._nameSep.innerHTML = " ";
            nameParent.appendChild(this._firstNameSpan.htmlObj);
            nameParent.appendChild(this._nameSep);
            nameParent.appendChild(this._lastNameSpan.htmlObj);
        }
    }


    // endregion

    // region JSON Methods

    /**
     * Initializes this class from a JSON object
     * @param {JSON} json - The JSON data
     */
    initialize_json(json){
        this._invoices = json.invoices;
        json = json.contact;

        this.contactID = json[ContactFields.contactID];
        this.firstName = json[ContactFields.user][UserFields.firstName];
        this.lastName = json[ContactFields.user][UserFields.lastName];
        this.email = json[ContactFields.user][UserFields.email];

        this.streetAddress = json[ContactFields.address][AddressFields.address];
        this.city = json[ContactFields.address][AddressFields.city];
        this.state = json[ContactFields.address][AddressFields.state];
        this.zipCode = json[ContactFields.address][AddressFields.zip];

        this.primaryPhone = json[ContactFields.primaryPhone];
        this.cellPhone = json[ContactFields.cellPhone];
        this.homePhone = json[ContactFields.homePhone];
        this.workPhone = json[ContactFields.workPhone];

        this.companyName = json[ContactFields.companyName];
        this.dealerLicenseNumber = json[ContactFields.licenseNum];
        this.mcNumber = json[ContactFields.mcNum];
        this.resaleNumber = json[ContactFields.resaleNum];

        this._setHtmlValues();
    }

    /**
     * Gets the JSON data for this class
     * @return {Object<string, *>}
     */
    toJSON(){
        const properties = {};
        properties[ContactFields.contactID] = this.contactID;

        properties[ContactFields.user] = {};
        properties[ContactFields.user][UserFields.firstName] = this.firstName;
        properties[ContactFields.user][UserFields.lastName] = this.lastName;
        properties[ContactFields.user][UserFields.email] = this.email;

        properties[ContactFields.address] = {};
        properties[ContactFields.address][AddressFields.address] = this.streetAddress;
        properties[ContactFields.address][AddressFields.city] = this.city;
        properties[ContactFields.address][AddressFields.state] = this.state;
        properties[ContactFields.address][AddressFields.zip] = this.zipCode;

        properties[ContactFields.primaryPhone] = this.primaryPhone;
        properties[ContactFields.cellPhone] = this.cellPhone;
        properties[ContactFields.homePhone] = this.homePhone;
        properties[ContactFields.workPhone] = this.workPhone;

        properties[ContactFields.companyName] = this.companyName;
        properties[ContactFields.licenseNum] = this.dealerLicenseNumber;
        properties[ContactFields.mcNum] = this.mcNumber;
        properties[ContactFields.resaleNum] = this.resaleNumber;
        
        return properties;
    }
    
    // endregion

    // region Private Methods

    /**
     * Sets the HTML values
     * @private
     */
    _setHtmlValues(){
        this._firstNameSpan.value = this.firstName;
        this._lastNameSpan.value = this.lastName;
        this._emailP.value = this.email;

        // There may only be one phone number, so give preference based on which number
        let phone = this.primaryPhone;
        if(!phone || phone === "") phone = this.cellPhone;
        if(!phone || phone === "") phone = this.workPhone;
        if(!phone || phone === "") phone = this.homePhone;

        this._phoneP.value = phone;
    }

    // endregion
}