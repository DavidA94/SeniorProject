/**
 * Created by David on 2017-04-11.
 */

class SearchResult {
    constructor(){
        /**
         * The date the invoice was created
         * @type {Date}
         */
        this.createdDate = new Date();

        /**
         * The invoice's number
         * @type {number}
         */
        this.invoiceNumber = 0;

        /**
         * The buyer's full name
         * @type {string}
         */
        this.buyerName = "";

        /**
         * The sale's person's name
         * @type {string}
         */
        this.salesPerson = "";

        /**
         * The miscellaneous fees if any part of them were searched
         * @type {Array}
         */
        this.fees = [];

        /**
         * The payments if any part of them were searched
         * @type {Array}
         */
        this.payments = [];

        /**
         * The vehicles if any part of them were searched
         * @type {Array}
         */
        this.vehicles = [];

        /**
         * Any other fields that the user searched, where the key is the value of the dropdown
         * @type {object<string, string>}
         */
        this.otherFields = {};
    }
}