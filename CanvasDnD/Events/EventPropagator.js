/**
 * Created by David on 10/10/16.
 */

class EventPropagator extends Subscribable {

    constructor(){
        super();

        /**
         * Used for the last mouse element to know if the element has been changed
         * @type {*}
         * @protected
         */
        this.__lastMouseElement = null;
    }

    /**
     * Sends and event down the chain
     * @param {BaseEventType} eventType - The name of the event to propagate
     * @param {EventArgs} eventData - The event data
     * @abstract
     * @protected
     */
    _propagateDown(eventType, eventData){
        this.__dispatchEvent(eventType.event, eventData, true);
        this.__dispatchEvent(eventType.event, eventData, false);
        return null;
    }

    /**
     * Sends and event up the chain
     * @param eventName - The name of the event to propagate
     * @param eventData - The event data
     * @abstract
     * @protected
     */
    _propagateUp(eventName, eventData){
        throw Error("No implementation found for _propagateUp");
    }
}