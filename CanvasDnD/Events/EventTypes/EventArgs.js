/**
 * Created by David on 10/11/16.
 */

class EventArgs {
    constructor(){
        /**
         * Indicates if the event has been handled
         * @type {boolean}
         * @private
         */
        this._handled = false;
    }

    /**
     *
     * @returns {boolean}
     */
    get handled() { return this._handled; }

    /**
     * Indicates if the event has been handled
     * @param {boolean} value
     */
    set handled(value) { this._handled = value; }
}