/**
 * Created by David on 10/11/16.
 */

class EventArgs {

    /**
     * Creates a new EventArgs
     * @param {EventPropagator} sender - The originator of the event
     */
    constructor(sender){
        if(!sender || !(sender instanceof EventPropagator)){
            throw Error("EventArgs must be constructed with an EventPropagator sender");
        }

        /**
         * Indicates if the event has been handled
         * @type {boolean}
         * @private
         */
        this._handled = false;

        /**
         * Who the event originated from
         * @type {EventPropagator}
         * @private
         */
        this._sender = sender;
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

    /**
     * The object that originated the event
     * @returns {EventPropagator}
     */
    get sender() { return this._sender; }

    /**
     * The object that originated the event
     * @param {EventPropagator} value - The sender
     */
    set sender(value) { this._sender = value; }
}