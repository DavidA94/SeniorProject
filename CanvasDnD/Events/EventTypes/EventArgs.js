/**
 * Created by David on 10/11/16.
 */

class EventArgs {

    /**
     * Creates a new EventArgs
     * @param {EventPropagator} originalTarget - The originator of the event
     */
    constructor(originalTarget){
        if(!originalTarget || !(originalTarget instanceof Subscribable)){
            throw Error("EventArgs must be constructed with an Subscribable originalTarget");
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
        this._originalTarget = originalTarget;

        /**
         * The object which is subscribed to
         * @type {Subscribable}
         * @private
         */
        this._sender = null;
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
    get originalTarget() { return this._originalTarget; }

    /**
     * The object that originated the event
     * @param {EventPropagator} value - The originalTarget
     */
    set originalTarget(value) { this._originalTarget = value; }

    /**
     * The object which is subscribed to
     * @returns {Subscribable}
     */
    get sender() { return this._sender; }

    /**
     * The object that originated the event
     * @param {Subscribable} value - The originalTarget
     */
    set sender(value) { this._sender = value; }
}