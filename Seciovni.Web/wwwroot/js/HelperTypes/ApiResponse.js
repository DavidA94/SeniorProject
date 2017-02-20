/**
 * Created by David on 2017-02-11.
 */

class Error {
    constructor() {
        /**
         * The element that has the error
         * @type {string}
         */
        this.element = "";

        /**
         * The element's field that has the error
         * @type {Array<string>}
         */
        this.subFields = [];

        /**
         * The error message
         * @type {string}
         */
        this.errorMsg = "";
    }
}

class ApiResponse {
    constructor(){
        /**
         * Indicates if the response is valid
         * @type {boolean}
         */
        this.successful = false;

        /**
         * The message given
         * @type {string}
         */
        this.message = "";

        /**
         * The errors gotten
         * @type {Array<Error>}
         */
        this.errors = []
    }
}